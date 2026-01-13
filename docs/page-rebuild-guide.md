# Page Rebuild Guide

This document explains the strategy for rebuilding WordPress pages as static HTML clones within the Next.js wrapper.

## Architecture Overview

```
paracelsus-clone/
├── app/                          # Next.js pages
│   ├── page.tsx                  # Homepage (/)
│   └── programmes-and-therapies/ # Inner page (/programmes-and-therapies)
│       └── page.tsx
├── clone-kit/
│   ├── raw/                      # Full captured HTML from WordPress
│   │   ├── homepage.outer.html
│   │   └── programmes-and-therapies.outer.html
│   └── html/                     # Split HTML parts per page
│       ├── homepage/
│       │   ├── 01-header.html
│       │   ├── 02-main.html
│       │   ├── 03-footer.html
│       │   └── 04-modal.html
│       └── programmes-and-therapies/
│           └── ... (same structure)
├── scripts/
│   └── split-page-html.js        # Splits raw HTML into 4 parts
└── lib/
    └── load-page-html.ts         # Helper to load HTML parts
```

## Step-by-Step Process for Adding a New Page

### Step 1: Capture the Raw HTML

Use the Chrome DevTools MCP to capture the fully-rendered HTML:

```javascript
// 1. Navigate to the page
browser_navigate({ url: "https://paracelsus-recovery.com/your-page/" })

// 2. Scroll to trigger lazy loading
browser_evaluate({ function: "() => { window.scrollTo(0, document.body.scrollHeight); return 'scrolled'; }" })

// 3. Wait a moment, then capture
browser_evaluate({ function: "() => document.documentElement.outerHTML" })
```

Save the output to `clone-kit/raw/your-page.outer.html`

### Step 2: Split the HTML

Run the splitter script:

```bash
cd paracelsus-clone
node scripts/split-page-html.js your-page
```

This creates:
- `clone-kit/html/your-page/01-header.html`
- `clone-kit/html/your-page/02-main.html`
- `clone-kit/html/your-page/03-footer.html`
- `clone-kit/html/your-page/04-modal.html`

### Step 2.5: Extract Page-Specific CSS (If Needed)

WordPress generates dynamic CSS class names like `.wp-container-5` with layout rules (sticky positioning, max-width, margins, flexbox settings). These rules are in `<style>` tags in the page's `<head>` and are NOT captured by the splitter (which only extracts `<body>` content).

**When to run this step:**
- Pages with sticky image sections
- Pages with specific text alignment/spacing
- Pages with complex layout (multi-column, flex containers)

```bash
node scripts/extract-page-css.js your-page
```

This creates `clone-kit/html/your-page/00-page-css.css` with rules like:
```css
.wp-container-5{position:sticky;top:0px;z-index:10;}
```

If this file is created, you'll need to include it in the page component (see Step 3 alternative).

### Step 3: Create the Next.js Page

Create `app/your-page/page.tsx`:

**Basic template (no page-specific CSS):**
```typescript
import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

export const dynamic = 'force-static';

const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("your-page");

export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'Your page description',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/your-page/',
  },
};

export default function YourPage() {
  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: headerHtml }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: mainHtml }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: footerHtml }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: modalHtml }} />
    </>
  );
}
```

**Template with page-specific CSS (for sticky sections, complex layouts):**
```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

export const dynamic = 'force-static';
export const revalidate = false;

const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("your-page");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/your-page/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'Your page description',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/your-page/',
  },
};

export default function YourPage() {
  return (
    <div>
      {/* Page-specific CSS for wp-container layout rules */}
      {pageCss && (
        <style dangerouslySetInnerHTML={{ __html: pageCss }} />
      )}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: headerHtml }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: mainHtml }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: footerHtml }} />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: modalHtml }} />
    </div>
  );
}
```

### Step 4: Verify and Fix Issues

Check the page at `http://localhost:3000/your-page` and fix any issues.

---

## Issues Encountered & Fixes

### Issue 1: Video Not Playing (Homepage)

**Symptom:** Background video visible but frozen/paused

**Cause:** The `<video>` element was missing the `muted` attribute. Browsers block autoplay of videos with sound.

**Fix:** Added `muted=""` to the video element:
```html
<video autoplay="" loop="" playsinline="" muted="" preload="auto">
```

**Script Update:** The splitter now automatically adds `muted=""` to any video with `autoplay`.

---

### Issue 2: Header Hidden Off-Screen (Homepage)

**Symptom:** Hamburger menu, logo, and "Talk to us" button not visible

**Cause:** The captured HTML included `-translate-y-full` in the static `class` attribute, which translates the element 100% upward (off-screen). This is normally controlled dynamically by Alpine.js.

**Evidence:**
```javascript
// Header was positioned at y=-80 (above viewport)
menuBtnRect.top: -80
fixedDivTransform: "matrix(1, 0, 0, 1, 0, -80)"
fixedDivClasses: "... -translate-y-full"
```

**Fix:** Remove `-translate-y-full` from the static class. Alpine.js will add it dynamically when the user scrolls down.

**Script Update:** The splitter now removes `-translate-y-full` from static classes.

---

### Issue 3: Broken CSS Classes (`bg- sm:bg-`)

**Symptom:** Invalid CSS class names in the HTML

**Cause:** Alpine.js dynamic `:class` bindings like `:class="{ 'bg-dark': scrolled }"` were captured mid-evaluation, resulting in incomplete class names like `bg-` instead of the full `bg-[#fcf7f11a]`.

**Fix:** Remove these broken class fragments.

**Script Update:** The splitter removes `bg- sm:bg-` patterns.

---

### Issue 4: Escape Sequences Not Decoded (`\t` showing as text)

**Symptom:** Literal `\t`, `\n` characters appearing in the rendered page

**Cause:** The browser MCP's `browser_evaluate` returns HTML as a JSON-encoded string. When saved directly to a file, escape sequences like `\t` remain as literal two-character strings instead of being decoded to actual tab characters.

**Fix:** Use `JSON.parse()` to properly decode the string, or manually replace escape sequences.

**Script Update:** The splitter now:
1. Detects JSON-encoded content (starts/ends with quotes)
2. Uses `JSON.parse()` for proper decoding
3. Falls back to manual replacement of `\t`, `\n`, `\r`, `\"`, `\\`

---

### Issue 5: Wrong Text Color on Light Backgrounds

**Symptom:** Header icons invisible on programmes-and-therapies page

**Cause:** The `text-pale-01` class makes text cream/white colored. This works on the homepage (dark video background) but makes icons invisible on pages with light backgrounds.

**Evidence:**
```javascript
// On programmes-and-therapies page
pathFill: "rgb(250, 246, 238)"  // cream - same as background!
containerClasses: "... text-pale-01"
```

**Fix:** Don't add `text-pale-01` to pages with light backgrounds. Only the homepage (with dark video) needs this class.

**Script Update:** The splitter no longer adds `text-pale-01` by default. For dark-background pages, you may need to add it manually.

---

### Issue 6: Missing Alpine.js Attributes

**Symptom:** Header elements not animating or showing properly

**Cause:** When capturing the DOM, Alpine.js has already processed and removed some attributes like `x-show="navigationIn"`.

**Fix:** Re-add the `x-show="navigationIn"` attributes to the wrapper divs that control visibility.

**Script Update:** The splitter adds these attributes back automatically.

---

### Issue 7: Images Not Loading on Localhost

**Symptom:** Images fail to load on `http://localhost:3000/programmes-and-therapies` (and other pages), showing 404 errors, but load correctly on the live WordPress site.

**Cause:** The splitter converts absolute WordPress URLs to relative paths like `/wp-content/uploads/2025/01/image.webp`. These paths don't exist in the Next.js app - the images are hosted on the WordPress site. Additionally, some CSS `background-image` properties had absolute URLs that weren't being converted.

**Evidence:**
```html
<!-- Image tags use relative paths -->
<img src="/wp-content/uploads/2025/01/Parac-Reco-4207.webp">

<!-- CSS background-image had absolute URLs -->
<section style="background-image:url('https://www.paracelsus-recovery.com/wp-content/uploads/...')">
```

**Fix:** 
1. Configure Next.js rewrites to proxy WordPress asset requests to the live site
2. Update the splitter to convert CSS `background-image` URLs (including `www.` subdomain)

**Next.js Config Update:** Added rewrites in `next.config.ts`:
```typescript
async rewrites() {
  return [
    {
      source: "/wp-content/:path*",
      destination: "https://paracelsus-recovery.com/wp-content/:path*",
    },
    {
      source: "/wp-includes/:path*",
      destination: "https://paracelsus-recovery.com/wp-includes/:path*",
    },
  ];
}
```

**Script Update:** The splitter now:
- Handles URLs with `www.paracelsus-recovery.com` subdomain
- Converts CSS `background-image` URLs in style attributes
- Ensures all WordPress assets use relative paths that get proxied

---

### Issue 8: Duplicate Videos Playing (Glitching/Overlay Effect)

**Symptom:** On the homepage, two videos appear to be playing simultaneously in the hero banner, causing a glitching or overlay effect.

**Cause:** The WordPress site uses JavaScript (`CGBqs_Rr.js`) that reads `data-desktop-video` and `data-mobile-video` attributes from `.video-container` elements and dynamically inserts video elements based on viewport size. When we capture the HTML, the video is already in the DOM (inserted by JS at capture time). When the cloned page loads, the WordPress JS runs again and inserts another video, resulting in duplicates.

**Evidence:**
```javascript
// Before fix: 2 videos in video-container
{
  "videosInContainer": 2,
  "details": [
    { "src": "2023_paracelsus_recovery_London_UK_v01-1.mp4", "isPlaying": true },
    { "src": "2023_paracelsus_recovery_London_UK_v01-1.mp4", "isPlaying": true }
  ]
}
```

**Fix:** Remove static video elements from `.video-container` divs that have `data-desktop-video` attributes. The WordPress JS will insert the video dynamically, and we avoid duplicates.

**Script Update:** The splitter now removes captured video elements from video containers:
```javascript
// Remove static videos from containers with data-desktop-video
const videoContainerRegex = /(<div[^>]*class="video-container[^"]*"[^>]*data-desktop-video="[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/g;
fixed = fixed.replace(videoContainerRegex, (match, openTag, content, closeTag) => {
  const cleanedContent = content.replace(/<video[\s\S]*?<\/video>/g, '');
  return openTag + cleanedContent + closeTag;
});
```

---

## What the Splitter Script Does Automatically

The `scripts/split-page-html.js` script handles these transformations:

### 1. JSON Decoding
```javascript
// Detects and decodes JSON-encoded HTML
if (html.startsWith('"') && html.endsWith('"')) {
  html = JSON.parse(html);
}
```

### 2. Escape Sequence Decoding
```javascript
// Handles literal \t, \n in files
html = html.replace(/\\t/g, '\t').replace(/\\n/g, '\n');
```

### 3. URL Rewriting
```javascript
// Converts absolute URLs to relative (handles both with and without www)
.replace(/https?:\/\/paracelsus-recovery\.com\//g, '/')
.replace(/https?:\/\/www\.paracelsus-recovery\.com\//g, '/')

// Handles CSS background-image URLs
.replace(/background-image:url\(['"]?https?:\/\/(www\.)?paracelsus-recovery\.com\/([^'")]+)['"]?\)/g, 
  (match, www, path) => `background-image:url('/${path}')`)
```

These relative paths are then proxied to the WordPress site via Next.js rewrites (configured in `next.config.ts`).

### 4. Alpine.js Fixes (Header)
- Adds `x-show="navigationIn"` to header wrapper divs
- Removes `-translate-y-full` from static classes
- Removes broken `bg- sm:bg-` class fragments
- Adds `transition-colors` for smooth transitions

### 5. Video Fixes (Main)
- Removes static videos from `.video-container` elements with `data-desktop-video` (prevents duplicates)
- Adds `muted=""` to videos with `autoplay`

---

## Page Types & Considerations

### Homepage (Dark Background)
- Has video background
- Needs `text-pale-01` class for light-colored header icons
- Logo and EN selector are intentionally hidden until scroll/menu open

### Inner Pages (Light Background)
- Cream/beige background
- Should NOT have `text-pale-01` class
- Logo and EN selector visible in header
- No video (typically)

---

## Checklist for New Pages

- [ ] Capture raw HTML from live WordPress site
- [ ] Save to `clone-kit/raw/{page-name}.outer.html`
- [ ] Run splitter: `node scripts/split-page-html.js {page-name}`
- [ ] Extract page-specific CSS if needed: `node scripts/extract-page-css.js {page-name}`
- [ ] Create Next.js page in `app/{page-name}/page.tsx`
- [ ] Include page-specific CSS in component (if extracted)
- [ ] Set appropriate metadata (title, description, canonical URL)
- [ ] Check header visibility (icons should be visible against background)
- [ ] Check sticky sections work (images stay pinned during scroll)
- [ ] Check videos play (if any)
- [ ] Verify no escape sequences showing (`\t`, `\n`)
- [ ] Verify all images load correctly (check browser console for 404s)
- [ ] Test hamburger menu opens
- [ ] Test "Talk to us" modal opens
- [ ] Compare with live WordPress page for visual parity

---

## Triggering Rebuilds

Since pages use `force-static`, the dev server caches the HTML at module load time. To force a rebuild after editing HTML files:

1. Make a small change to the page's `page.tsx` file (e.g., change a comment)
2. Save the file
3. The dev server will recompile and re-read the HTML files

---

## File Reference

| File | Purpose |
|------|---------|
| `scripts/split-page-html.js` | Splits raw HTML into 4 parts with automatic fixes |
| `scripts/extract-page-css.js` | Extracts wp-container CSS rules from raw HTML |
| `lib/load-page-html.ts` | Helper to load and normalize HTML parts |
| `clone-kit/raw/*.outer.html` | Full captured HTML from WordPress |
| `clone-kit/html/{page}/00-page-css.css` | Page-specific CSS for sticky/layout rules (optional) |
| `clone-kit/html/{page}/01-header.html` | Header section |
| `clone-kit/html/{page}/02-main.html` | Main content section |
| `clone-kit/html/{page}/03-footer.html` | Footer section |
| `clone-kit/html/{page}/04-modal.html` | Modal content (contact form, etc.) |

---

## Rebuild Log

### 2026-01-11: programmes-and-therapies Page Rebuild

**Status:** Success

**Process:**
1. Added missing rewrites to `next.config.ts` for `/wp-content/` and `/wp-includes/` proxying
2. Captured fresh HTML from live WordPress site using browser MCP tools
3. Split HTML using `node scripts/split-page-html.js programmes-and-therapies`
4. Verified all 4 sections extracted successfully (header: 87KB, main: 101KB, footer: 17KB, modal: 35KB)
5. Verified page at `localhost:3000/programmes-and-therapies`

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- "Talk to us" button opens contact modal with form
- All images loading via rewrites proxy
- No 404 errors for WordPress assets
- No visible escape sequences

**Issues Found & Fixed:**
- `next.config.ts` was missing rewrites for proxying WordPress assets - added:
  ```typescript
  async rewrites() {
    return [
      { source: "/wp-content/:path*", destination: "https://paracelsus-recovery.com/wp-content/:path*" },
      { source: "/wp-includes/:path*", destination: "https://paracelsus-recovery.com/wp-includes/:path*" },
    ];
  }
  ```

**Console Warnings (non-critical):**
- WordPress JS bundle compatibility issues ("s is not a constructor")
- Custom element "pegasus-module" registered twice
- Meta pixel/tracking warnings (expected on localhost)

---

### Issue 9: Blur/Reveal Effect Not Working on Images

**Symptom:** Images remain blurred and don't unblur when scrolling past them. The sticky image sections don't transition properly.

**Cause:** The blur effect uses Alpine's `x-intersect` plugin via attributes like `x-intersect:enter.margin.0.0.-50%.0="blur = false"`. When Alpine loads before the Intersect plugin is ready, these directives are ignored.

**Evidence:**
```javascript
// Alpine started but x-intersect not registered
{
  "alpineLoaded": true,
  "xIntersectRegistered": "not registered"
}
```

**Fix:** Added a standalone script in `layout.tsx` that sets up IntersectionObservers after Alpine starts, independent of the plugin:

```javascript
// Set up blur reveal observers AFTER Alpine has processed elements
const setupBlurRevealObservers = () => {
  const blurDivs = document.querySelectorAll('[x-data="blurRevealSlide"]');
  blurDivs.forEach(el => {
    if (el.hasAttribute('data-blur-observer-set')) return;
    el.setAttribute('data-blur-observer-set', 'true');
    
    const blurTarget = el.querySelector('.transition-all.blur-3xl') || el.querySelector('.blur-3xl');
    const sentinel = el.querySelector('.absolute.top-0.pointer-events-none');
    
    if (!sentinel || !blurTarget) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          blurTarget.classList.remove('blur-3xl', 'scale-125');
        } else {
          blurTarget.classList.add('blur-3xl', 'scale-125');
        }
      });
    }, { rootMargin: '0px 0px -50% 0px' });
    
    observer.observe(sentinel);
  });
};

// Run after Alpine starts
document.addEventListener('alpine:initialized', setupBlurRevealObservers);
setTimeout(setupBlurRevealObservers, 1000); // Fallback
```

**Script Update:** Added blur reveal observer setup to `layout.tsx` alongside other Alpine component fallbacks.

---

### Issue 10: Sticky Images Not Stacking Properly (Wrong Image Showing)

**Symptom:** When scrolling through the programmes-and-therapies page, earlier sticky images remain visible on top of later ones. For example, the "red dress woman" image continues to show even when the "health check-up" section is active, instead of the second image overlaying the first.

**Cause:** WordPress generates dynamic CSS rules like `.wp-container-2 { z-index: 10; }` for each sticky section. When capturing HTML, not all of these CSS rules are included in the captured stylesheets. The sections with missing z-index rules have `z-index: auto`, breaking the stacking order (later sections should visually overlay earlier ones).

**Evidence:**
```javascript
// Live site: all sections have z-index: 10
{ "wp-container-2": "10", "wp-container-3": "10", "wp-container-4": "10", ... }

// Local (before fix): only some sections have z-index: 10
{ "wp-container-3": "10", "wp-container-6": "10" }
// Others have z-index: auto
```

**Fix:** Added a CSS rule in `critical-css.tsx` to ensure all sticky sections have consistent z-index:

```css
/* Fix sticky section z-index for proper stacking order */
/* WordPress generates dynamic .wp-container-N rules with z-index: 10 */
/* but not all are captured. This ensures consistent stacking. */
section.is-position-sticky {
  z-index: 10 !important;
}
```

**Location:** `app/critical-css.tsx` in the `globalsCss` constant.

**Verification:**
- All sticky sections now have `z-index: 10`
- Images properly stack with later sections overlaying earlier ones
- Visual behavior matches the live WordPress site

---

### Issue 11: Alpine.js Intersection Observer Content Hidden

**Symptom:** Text sections next to sticky images are completely invisible. For example, the "360-degree approach" section shows the image but no text content.

**Cause:** Alpine.js uses `x-intersect` directives to trigger reveal animations when elements scroll into view. These elements start with `opacity-0 translate-y-24` classes to hide them initially. When capturing the HTML, some elements are captured with these hidden-state classes baked into the static `class` attribute, making the content permanently invisible.

**Evidence:**
```html
<!-- Captured HTML with hidden state in static class -->
<div :class="shown ? '' : 'opacity-0 translate-y-24'" 
     x-data="{shown:false}" 
     x-intersect.threshold.30="shown = true" 
     class="wp-block-group ... opacity-0 translate-y-24">
  <h2>360-degree approach</h2>
  <!-- This content is invisible because of the static opacity-0 class -->
</div>
```

**Fix:** Remove `opacity-0 translate-y-24` from static class attributes. These classes should only exist in the dynamic `:class` binding for Alpine.js to manage.

**Script Update:** Added `fixAlpineTransitionClasses()` function to `split-page-html.js`:
```javascript
function fixAlpineTransitionClasses(content) {
  let fixed = content;
  
  // Only remove from static class="" attributes, not from :class="" dynamic bindings
  fixed = fixed.replace(
    /(\sclass="[^"]*) opacity-0 translate-y-24([^"]*")/g,
    '$1$2'
  );
  
  return fixed;
}
```

**Location:** `scripts/split-page-html.js` - applied to `02-main.html` during split.

---

### 2026-01-12: residential-rehab-treatment Page Rebuild

**Status:** Success

**Process:**
1. Captured fresh HTML from live WordPress site using browser MCP tools
2. Split HTML using `node scripts/split-page-html.js residential-rehab-treatment`
3. Created Next.js page at `app/residential-rehab-treatment/page.tsx`
4. Fixed Issue 11: Removed `opacity-0 translate-y-24` from static class attributes
5. Fixed Issue 12: Restored `-translate-y-full` in header `:class` binding for hide behavior

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Header hides when scrolling down (matches live site behavior)
- Tab navigation works (Your programme / Where you'll stay / Stories / FAQs)
- Testimonials section displays correctly
- FAQ accordion expands/collapses
- Sticky image sections show text content (360-degree approach, etc.)
- All images loading via rewrites proxy
- No 404 errors for WordPress assets

---

### Issue 12: Header Not Hiding When Scrolling Down

**Symptom:** On inner pages, the header (hamburger menu, logo, "TALK TO US" button) stays visible when scrolling down, instead of sliding up and hiding like on the live WordPress site.

**Cause:** The header's fixed div has a `:class` binding that should add `-translate-y-full` when scrolling down to hide the header. When capturing the HTML, this binding gets captured with an empty else branch `''` instead of `'-translate-y-full'`.

**Expected binding (live site):**
```javascript
:class="(goingUp || atTop || languagePromptOpen || open ? ( !atTop ? 'bg-[#fcf7f11a] backdrop-blur-xl' : '' ) : '-translate-y-full')"
```

**Captured binding (broken):**
```javascript
:class="(goingUp || atTop || languagePromptOpen || open ? ( !atTop ? 'bg-[#fcf7f11a] backdrop-blur-xl' : '' ) : '')"
```

**Fix:** Restore the `-translate-y-full` in the else branch of the `:class` binding.

**Script Update:** Added fix to `fixAlpineAttributes()` in `split-page-html.js`:
```javascript
// Fix header hide behavior: restore -translate-y-full in else branch
fixed = fixed.replace(
  /:class="\(goingUp \|\| atTop \|\| languagePromptOpen \|\| open \? \( !atTop \? 'bg-\[#fcf7f11a\] backdrop-blur-xl' : '' \) : ''\)"/g,
  `:class="(goingUp || atTop || languagePromptOpen || open ? ( !atTop ? 'bg-[#fcf7f11a] backdrop-blur-xl' : '' ) : '-translate-y-full')"`
);
```

**Location:** `scripts/split-page-html.js` - applied to `01-header.html` during split.

**Important:** After fixing header HTML files, the Next.js dev server must be restarted for changes to take effect (due to `force-static` caching at module load time).

---

### Issue 13: Navigation Links Using Absolute URLs Cause 404 Errors

**Symptom:** When clicking navigation menu items (e.g., "Residential Rehabilitation Programme") on localhost, the browser attempts to navigate to the production site URL instead of the local page, resulting in 404 errors or unexpected navigation behavior.

**Cause:** Some header files were processed before the URL rewriting functionality in the splitter script was fully implemented, leaving absolute URLs like `https://paracelsus-recovery.com/residential-rehab-treatment/` instead of relative URLs like `/residential-rehab-treatment/`.

**Evidence:**
```html
<!-- Broken: absolute URL -->
<a href="https://paracelsus-recovery.com/residential-rehab-treatment/">
  <span>Residential Rehabilitation Programme</span>
</a>

<!-- Fixed: relative URL -->
<a href="/residential-rehab-treatment/">
  <span>Residential Rehabilitation Programme</span>
</a>
```

**Affected Files:**
- `clone-kit/html/homepage/01-header.html`
- `clone-kit/html/programmes-and-therapies/01-header.html`
- `clone-kit/html/01-header.html`
- `clone-kit/html/residential-rehab-treatment/01-header.html`

**Fix:** Replace absolute URLs with relative URLs in navigation links. The splitter script already handles this automatically via the `rewriteUrls()` function (lines 98-114 in `scripts/split-page-html.js`), which converts:
- `https://paracelsus-recovery.com/` → `/`
- `https://www.paracelsus-recovery.com/` → `/`

**Manual Fix (if needed):**
Search for `href="https://paracelsus-recovery.com/` in header files and replace with `href="/`

**Script Coverage:** The `rewriteUrls()` function in `split-page-html.js` handles:
- Absolute URLs in `href` attributes
- Absolute URLs in `srcset` attributes
- Absolute URLs in CSS `background-image` properties
- Both with and without `www.` subdomain

**Important:** 
- After fixing header HTML files, restart the Next.js server (dev or production) for changes to take effect due to `force-static` caching
- For dev mode: Stop server (Ctrl+C) and run `npm run dev`
- For production mode: Run `npm run build` followed by `npm start`
- Pages processed with the current splitter script should not have this issue

---

### Issue 14: Overlapping Images Parallax Animation Not Working

**Symptom:** The overlapping images sections (with two images that animate/move as you scroll) appear static. The images don't animate or change position when scrolling through the section.

**Cause:** The `overlappingImages` Alpine component is not registered. This component sets up IntersectionObservers that update the `--parallax-offset` CSS variable as the element scrolls into view. Without this component, the CSS variable remains at the captured value and doesn't animate.

**Evidence:**
```javascript
// Before fix: --parallax-offset stays at captured value
{ currentOffset: "0.2906866669654846", scrollY: 0 }
{ currentOffset: "0.2906866669654846", scrollY: 2000 } // No change!

// After fix: --parallax-offset updates on scroll
{ currentOffset: "0.2906866669654846", scrollY: 0 }
{ currentOffset: "0.714473694562912", scrollY: 985 } // Updated!
```

**Fix:** Added fallback registration for `overlappingImages` component and a standalone observer setup in `layout.tsx`:

```javascript
// Register overlappingImages component
Alpine.data('overlappingImages', () => ({
  init() {
    const targets = document.querySelectorAll('.OverlappingImages');
    targets.forEach((target) => {
      if (!target.hasAttribute('data-parallax-observer-set')) {
        target.setAttribute('data-parallax-observer-set', 'true');
        
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                if (entry.boundingClientRect.top > 0) {
                  target.style.setProperty("--parallax-offset", 1 - entry.intersectionRatio);
                } else {
                  target.style.setProperty("--parallax-offset", -1 + entry.intersectionRatio);
                }
              }
            });
          },
          { threshold: [...Array(101)].map((v, i) => i / 100) }
        );
        observer.observe(target);
      }
    });
  }
}));

// Also set up observers after page load as fallback
const setupOverlappingImagesObservers = () => {
  // Same observer setup logic...
};
document.addEventListener('alpine:initialized', setupOverlappingImagesObservers);
setTimeout(setupOverlappingImagesObservers, 1000);
```

**Location:** `app/layout.tsx` - in the `registerComponents()` function and as a standalone setup function.

**Pages Affected:** Any page with `x-data="overlappingImages"` sections (e.g., seven-day-executive-detox, residential-rehab-treatment)

---

### Issue 15: Page-Specific CSS (wp-container Layout Rules) Missing

**Symptom:** Text alignment and spacing differences between localhost and live site. Elements like "A World Leading Programme" section have incorrect max-width, margins, or alignment.

**Cause:** WordPress generates dynamic CSS class names like `.wp-container-core-group-is-layout-861801c1` with specific layout rules (max-width, margins, etc.). These CSS rules are embedded in the `<head>` of each page as inline styles, but the splitter only extracts header, main, footer, and modal sections from the `<body>`.

**Evidence:**
```css
/* Live site has rules like: */
.wp-container-core-group-is-layout-861801c1 > :where(:not(.alignleft):not(.alignright):not(.alignfull)) {
  max-width: 640px;
  margin-left: auto !important;
  margin-right: auto !important;
}
```

**Fix:** Extract page-specific CSS from the raw HTML and include it in the page component.

**Script:** Created `scripts/extract-page-css.js` to extract wp-container rules:
```bash
node scripts/extract-page-css.js 7-day-health-check-up
```
This creates `clone-kit/html/7-day-health-check-up/00-page-css.css`

**Page Update:** Include the CSS in the page component:
```typescript
import fs from "fs";
import path from "path";

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/{page-name}/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export default function Page() {
  return (
    <div>
      {/* Page-specific CSS for wp-container layout rules */}
      {pageCss && (
        <style dangerouslySetInnerHTML={{ __html: pageCss }} />
      )}
      {/* ... rest of page ... */}
    </div>
  );
}
```

---

### Issue 16: Flickity Slider Captured After Initialization

**Symptom:** Team slider (or other Flickity carousels) appears broken with overlapping text, missing images, or double/nested slider structure.

**Cause:** When capturing page HTML after scrolling, Flickity has already initialized and transformed the DOM:
- Added `flickity-enabled`, `is-draggable` classes to slider container
- Wrapped slides in `<div class="flickity-viewport"><div class="flickity-slider">...</div></div>`
- Added inline `position: absolute; transform: translateX(X%)` styles to slides
- Added `is-selected` class to visible slides

When the page loads and Flickity tries to re-initialize, it conflicts with the existing state.

**Fix:** The `split-page-html.js` script automatically:
1. Removes `flickity-enabled` and `is-draggable` classes
2. Removes `tabindex="0"` from sliders
3. Unwraps slides from `flickity-viewport` and `flickity-slider` containers
4. Removes inline positioning styles (position, left, transform) from slides while keeping `--slide-width`
5. Removes `is-selected` class from slides
6. Removes `aria-hidden="true"` from slides

**Note:** If slider still doesn't work after processing, restart the Next.js dev server to ensure it reads the updated HTML files.

---

### Issue 17: Lazy-Loaded Images Captured Before Loading

**Symptom:** Images show placeholder SVGs instead of actual photos, or sliders break due to images having no dimensions.

**Cause:** When capturing HTML before scrolling to all sections, images may have:
- `data-src` instead of `src` (with placeholder SVG in src)
- `data-srcset` instead of `srcset`
- Missing `is-loaded` class on `<picture class="pegasus-lazy-wrapper">`

**Fix:** The `split-page-html.js` script automatically:
1. Adds `is-loaded` class to `pegasus-lazy-wrapper` elements
2. Converts `data-srcset` to `srcset` on `<source>` elements
3. Converts `data-src` to `src` on `<img>` elements (replacing SVG placeholders)
4. Converts `data-srcset` to `srcset` on `<img>` elements
5. Converts `data-sizes` to `sizes`

---

### Issue 18: Modal Contact Form Showing at Bottom of Page

**Symptom:** A contact form appears at the bottom of the page below the footer, when it should be hidden until the user clicks "Talk to us".

**Cause:** When capturing the HTML, the modal container (`id="modal-0"`) with the contact form content is visible because it doesn't have any visibility hiding by default. The inner elements have `x-show="open"` with `style="display: none;"`, but the outer modal container doesn't, so its content is rendered.

**Evidence:**
```html
<!-- Modal container without visibility hiding -->
<div x-data="singleModal()" class="Modal Modal--Full -right" id="modal-0">
  <!-- Inner elements have x-show but the form content is still visible -->
  <div class="Modal__body">
    <article class="Modal__Form">
      <!-- Contact form content appears on page -->
    </article>
  </div>
</div>
```

**Fix:** Add `x-show="open" style="display: none;"` to the modal container div to hide it by default.

**Script Update:** Added `fixModalVisibility()` function to `split-page-html.js`:
```javascript
function fixModalVisibility(content) {
  let fixed = content;
  fixed = fixed.replace(
    /(<div[^>]*class="Modal Modal--Full[^"]*"[^>]*id="modal-0")(?![^>]*x-show="open")([^>]*>)/g,
    (match, beforeId, afterId) => {
      return `${beforeId} x-show="open" style="display: none;"${afterId}`;
    }
  );
  return fixed;
}
```

**Location:** `scripts/split-page-html.js` - applied to `04-modal.html` during split.

---

### Issue 19: HubSpot Form Rendering at Bottom of Page Instead of Correct Position

**Symptom:** The HubSpot contact form appears at the very bottom of the page (below the footer) instead of in its intended location within the page content. For example, on the Press page, the form should appear next to the "Press contact" heading, but instead renders after the footer.

**Cause:** The HubSpot form creation code has an empty `target:""` parameter. When `hbspt.forms.create()` is called with an empty target, HubSpot appends the form to the document body instead of inside the designated container.

**Evidence:**
```javascript
// Before fix: empty target causes form to append to body
hbspt.forms.create({
  portalId: "144185588",
  formId: "860cc935-80b7-4f19-add1-7eed6e028aa4",
  target: "",  // ← Empty target = appends to body!
  onFormSubmitted: function ($form) { ... }
});

// Form found at bottom of page, outside intended container
{
  "formParent": "body-main modal-form scrolled",
  "formParentTag": "BODY"
}
```

**Fix:** Add a unique ID to the `.Hubspot_Form` container and use it as the `target` parameter:

```html
<!-- Before: no ID, empty target -->
<div class="Hubspot_Form Form">
  <script>
    hbspt.forms.create({
      target: "",
      ...
    });
  </script>
</div>

<!-- After: ID added, target references container -->
<div class="Hubspot_Form Form" id="press-contact-form-container">
  <script>
    hbspt.forms.create({
      target: "#press-contact-form-container",
      ...
    });
  </script>
</div>
```

**Manual Fix Steps:**
1. Open the affected HTML file (e.g., `clone-kit/html/press/02-main.html`)
2. Find the `.Hubspot_Form` container that should contain the form
3. Add a unique ID to the container: `id="your-unique-form-id"`
4. Update the `target` parameter in `hbspt.forms.create()` to reference the ID: `target: "#your-unique-form-id"`
5. Restart the Next.js dev server to pick up the changes

**Important Notes:**
- Each HubSpot form container on the page needs a unique ID
- Modal forms (in `04-modal.html`) may also need this fix if they exhibit the same issue
- The `target` parameter must be a valid CSS selector (e.g., `#my-form-container`)
- After editing HTML files, restart the dev server (due to `force-static` caching)

**Pages Affected:**
- Press page (`/press`) - Fixed in `clone-kit/html/press/02-main.html`
- Any other page with inline HubSpot forms (not just modal forms)

---

### 2026-01-13: 7-day-health-check-up Page Rebuild

**Status:** Success

**Process:**
1. Captured fresh HTML from live WordPress site using browser MCP tools
2. Split HTML using `node scripts/split-page-html.js 7-day-health-check-up`
3. Created Next.js page at `app/7-day-health-check-up/page.tsx`
4. Fixed Issue 15: Extracted and included page-specific CSS for wp-container rules
5. Updated navigation links in header files to use relative URLs

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Tab navigation works (Your programme / Where you'll stay / Stories / FAQs)
- Text alignment and spacing matches live site
- Overlapping images section displays correctly
- All images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Treatment Programmes > 7-Day Comprehensive Check-Up

---

### 2026-01-13: aftercare-treatment Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/aftercare-treatment/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML
3. Saved HTML to `clone-kit/raw/aftercare-treatment.outer.html`
4. Split HTML using `node scripts/split-page-html.js aftercare-treatment`
5. Created Next.js page at `app/aftercare-treatment/page.tsx`
6. Fixed navigation links in homepage header files to use relative URLs

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- All images loading via rewrites proxy
- FAQ accordion section displays correctly
- "Need more help? We're here for you." CTA section works
- No 404 errors for WordPress assets
- Accessible from homepage via Treatment Programmes > Aftercare Services

---

### 2026-01-13: our-approach Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/our-approach/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML
3. Saved HTML to `clone-kit/raw/our-approach.outer.html`
4. Split HTML using `node scripts/split-page-html.js our-approach`
5. Created Next.js page at `app/our-approach/page.tsx`

**Issues Encountered and Fixed:**
- **Issue 16:** Flickity slider captured after initialization - Fixed by removing Flickity state from HTML
- **Issue 17:** Lazy-loaded images captured before loading - Fixed by converting data-src/data-srcset to src/srcset

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- "Meet the Team" slider displays correctly with:
  - Team member photos loading properly
  - Correct labels (Nobel Laureate, CEO, Medical Doctor, etc.)
  - Clean card layout without overlapping text
  - Proper positioning matching live site
- All images loading via rewrites proxy
- No critical console errors
- Accessible from homepage via main navigation "Our Approach" link

---

### 2026-01-13: spa-wellness Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/spa-wellness/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML (1.3MB)
3. Saved HTML to `clone-kit/raw/spa-wellness.outer.html`
4. Split HTML using `node scripts/split-page-html.js spa-wellness`
5. Created Next.js page at `app/spa-wellness/page.tsx`
6. Extracted page-specific CSS using `node scripts/extract-page-css.js spa-wellness` (40 rules)
7. Added page-specific CSS to page component for sticky positioning

**Issues Encountered and Fixed:**
- **Sticky image not working:** The massage therapy image should stay pinned while the therapy list scrolls. The wp-container-5 element had `is-position-sticky` class but no CSS rule. Fixed by extracting and including page-specific CSS which contains:
  ```css
  .wp-container-5{top:calc(0px + var(--wp-admin--admin-bar--position-offset, 0px));position:sticky;z-index:10;}
  ```

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Sticky image works correctly - massage therapy image stays pinned while therapy list scrolls
- All therapy links displayed (Yoga, Massage Therapy, Reflexology, Acupuncture, Breathwork, Meditation, Shiatsu, Personal Trainer)
- Footer displays correctly with Treatment, Information, and Connect sections
- All images loading via rewrites proxy
- No critical console errors
- Accessible from homepage via main navigation "Spa and Wellness" link

---

### 2026-01-13: rehab-therapies Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/rehab-therapies/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML (295KB)
3. Saved HTML to `clone-kit/raw/rehab-therapies.outer.html`
4. Split HTML using `node scripts/split-page-html.js rehab-therapies`
5. Extracted page-specific CSS using `node scripts/extract-page-css.js rehab-therapies` (26 rules)
6. Created Next.js page at `app/rehab-therapies/page.tsx`

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- All 31 therapy links displayed (Assessment Procedure, Psychiatry, Psychotherapy, Live-in Therapist, EMDR, CBT, DBT, Yoga, Massage Therapy, etc.)
- "Need help? We're here for you." CTA section displays correctly
- Technologies section with "Cutting edge from the start" heading
- Footer displays correctly with Treatment, Information, and Connect sections
- All images loading via rewrites proxy
- No critical console errors (only expected WordPress/Alpine.js warnings)
- Accessible from homepage via main navigation "Types of Therapies" > "VIEW ALL" link
- Footer "Therapies" link also navigates to the page

---

### 2026-01-13: testimonials Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/testimonials/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML (275KB)
3. Saved HTML to `clone-kit/raw/testimonials.outer.html`
4. Split HTML using `node scripts/split-page-html.js testimonials`
5. Extracted page-specific CSS using `node scripts/extract-page-css.js testimonials` (20 rules)
6. Created Next.js page at `app/testimonials/page.tsx`

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section with "Testimonials" heading and description
- Hero image displaying correctly (woman in Eames chair)
- Testimonials section with quotes from F.P, Mike McPhillips, Jan K
- "Load More" button present for additional testimonials
- The Duchess of York testimonial video section
- "Insights" section with Knowledge Panel link
- "The journey begins with a conversation" CTA section
- Footer displays correctly with Treatment, Information, and Connect sections
- All images loading via rewrites proxy
- No critical console errors (only expected WordPress/Alpine.js warnings)
- Accessible from homepage via main navigation "Testimonials" link

---

### 2026-01-13: team Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/team/ using browser MCP
2. Clicked each accordion section (Management Team, Advisory Board, Medical Team, Psychiatrists, Psychologists & Counsellors, Complementary Therapists, Hospitality, Administration) to expand all team members
3. Scrolled to trigger lazy loading and captured full HTML (496KB)
4. Saved HTML to `clone-kit/raw/team.outer.html`
5. Split HTML using `node scripts/split-page-html.js team`
6. Extracted page-specific CSS using `node scripts/extract-page-css.js team` (26 rules)
7. Created Next.js page at `app/team/page.tsx`

**Script Fixes Applied:**
- Fixed 150 lazy-loaded images (converted to loaded)
- Applied Alpine.js attribute fixes for header

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- "A commitment to excellence" hero section with team images
- "Meet the team" heading
- All 8 accordion sections working correctly:
  - Management Team: Jan Gerber (CEO), Kjell R. Brolund-Spaether (Group Medical Director), Werner Gerber (Medical Director)
  - Advisory Board: Prof. Dr. Thomas Suedhof (Nobel Laureate)
  - Medical Team: 8 team members
  - Psychiatrists: 6 team members
  - Psychologists & Counsellors: 9 team members
  - Complementary Therapists: 12 team members
  - Hospitality: 7 team members
  - Administration: 4 team members
- "Join us" section with "Become part of our family" and careers link
- "Focused on one thing: Your path to healing" diagnostics section
- Footer displays correctly with Treatment, Information, and Connect sections
- All team member photos loading via rewrites proxy
- No critical console errors (only expected WordPress/Alpine.js warnings)
- Accessible from homepage via main navigation "Meet the Team" link
- Footer "Team" link also navigates to the page

**Additional Fix Applied:**
- **Accordion icons captured in open state:** When HTML was captured with all accordions expanded, the SVG icons showed "-" instead of "+" for closed sections. Fixed by removing `rotate-90` from static `<g>` class attributes and `opacity-100` from static `<path>` class attributes in accordion icons. Also removed `style="height: auto;"` from accordion content divs

---

### 2026-01-13: press Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/press/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML (1.5MB)
3. Saved HTML to `clone-kit/raw/press.outer.html`
4. Split HTML using `node scripts/split-page-html.js press`
   - Header: 86,878 bytes
   - Main: 1,257,683 bytes
   - Footer: 17,668 bytes
   - Modal: 23,248 bytes
5. Extracted page-specific CSS using `node scripts/extract-page-css.js press` (16 rules)
6. Created Next.js page at `app/press/page.tsx`

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Paracelsus Recovery in the press" heading with Jan Gerber image
- "World-renowned" subtitle and description text
- "MEET JAN GERBER" button visible
- "AS FEATURED IN" section with media logos (Bloomberg, Khaleej Times, BBC Radio, etc.)
- Testimonial quotes carousel with previous/next navigation
- "Featured Articles" section with press cards (Business Insider, The Times, etc.)
- "Press articles" section with article grid
- Press contact information section
- Footer displays correctly with Treatment, Information, and Connect sections
- All images loading via rewrites proxy
- No critical console errors (only expected WordPress/Alpine.js warnings)
- Accessible from homepage via main navigation "In the Press" link
- Footer "Press" link also navigates to the page

**Issues Fixed:**
- **Modal contact form showing:** The modal container (`id="modal-0"`) wasn't hidden by default. Fixed by adding `x-show="open" style="display: none;"` to the modal container.
- **Pre-rendered HubSpot form showing at bottom of page:** The page's "Press contact" section contained a HubSpot form that was captured after it loaded. The pre-rendered form HTML was removed, keeping only the script that dynamically loads the form. The splitter script was updated with `fixPrerenderedHubspotForms()` to handle this automatically for future pages.
- **Issue 19: HubSpot form rendering at bottom of page:** The Press contact form was appearing below the footer instead of next to the "Press contact" heading. The HubSpot `target:""` parameter was empty, causing the form to append to the body. Fixed by adding `id="press-contact-form-container"` to the `.Hubspot_Form` container and updating `target:"#press-contact-form-container"` in the `hbspt.forms.create()` call.

---

### 2026-01-13: prices Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/prices/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML (1.2MB)
3. Saved HTML to `clone-kit/raw/prices.outer.html`
4. Split HTML using `node scripts/split-page-html.js prices`
   - Header: 87,041 bytes
   - Main: 1,003,256 bytes
   - Footer: 17,668 bytes
   - Modal: 35,346 bytes
5. Extracted page-specific CSS using `node scripts/extract-page-css.js prices` (23 rules)
6. Created Next.js page at `app/prices/page.tsx`

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Rehab costs and pricing" heading with chair image
- Currency selector visible (CHF dropdown)
- All pricing cards display correctly:
  - Four Week Residential Treatment Programme (95,000 CHF/WEEK)
  - Seven-Day Executive Detox (120,000 CHF/WEEK)
  - Seven-Day Comprehensive Health Check-Up Programme (120,000 CHF/WEEK)
  - Three-Day Comprehensive Health Assessment (25,000 CHF/3-DAYS)
  - Aftercare (2,500 CHF/DAY)
- Programme details lists showing all included services
- "Enquire" and "Learn More" buttons functional
- Non-inclusive costs section displays correctly
- Press quote section visible
- Footer displays correctly with Treatment, Information, and Connect sections
- All images loading via rewrites proxy
- No critical console errors
- Accessible from homepage via main navigation "Prices" link
- Footer "Prices" link also navigates to the page

---

### 2026-01-13: contact Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/contact/ using browser MCP
2. Scrolled to trigger lazy loading and captured full HTML (285KB)
3. Saved HTML to `clone-kit/raw/contact.outer.html`
4. Split HTML using `node scripts/split-page-html.js contact`
   - Header: 87,134 bytes
   - Main: 16,457 bytes
   - Footer: 17,668 bytes
   - Modal: 35,279 bytes
5. Extracted page-specific CSS using `node scripts/extract-page-css.js contact` (14 rules)
6. Created Next.js page at `app/contact/page.tsx`
7. Removed conflicting `app/contact/route.ts` file (was placeholder route redirecting to production)

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- "Write, call or chat anytime" hero section with heading and image
- "Treatment Enquiries" section displays correctly
- Phone number (+41 44 505 68 98) with clickable tel: link
- Message links (Email, WhatsApp, Telegram) functional
- Contact form section with form fields placeholder
- "Find us" section with Zurich address
- Press contact email link (press@paracelsus-recovery.com)
- Careers contact email link (career@paracelsus-recovery.com)
- Social media links (X, LinkedIn, Facebook)
- Footer displays correctly with Treatment, Information, and Connect sections
- All images loading via rewrites proxy
- No critical console errors (only expected WordPress/HubSpot/Alpine.js warnings)
- Accessible from homepage via main navigation "Contact" link
- Accessible from "Talk to us" button in header
- Footer "Contact" link also navigates to the page

---

### 2026-01-13: conditions-we-treat Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest (210KB)
2. Split HTML using `node scripts/split-page-html.js conditions-we-treat`
   - Header: 85,988 bytes
   - Main: 46,656 bytes
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js conditions-we-treat` (26 rules)
4. Created Next.js page at `app/conditions-we-treat/page.tsx`
5. Fixed homepage footer to use relative URL for Conditions link

**Verification Results:**
- Page loads successfully with 200 status
- Header icons visible (dark on light background)
- "CONDITIONS WE TREAT" hero section displays correctly
- Main heading: "However you live, and whatever you've lived through, this is your place for healing."
- All condition categories display:
  - Addictions and dependencies
  - Eating disorders
  - Chronic conditions & disabilities
- Hero image loading via rewrites proxy
- All images loading via rewrites proxy
- Page-specific CSS includes sticky positioning rules (wp-container-3, wp-container-4, wp-container-6)
- Accessible from homepage via main navigation "Conditions We Treat" menu
- Accessible from footer "Conditions" link

---

### Issue 20: Hero Section Text Layout Shift (CLS)

**Symptom:** On the About Us page (and potentially other pages with large hero text), the hero section text shifts position after the page initially renders. The text may appear in a narrow column with words breaking incorrectly (e.g., "Paracelsu" and "s" on separate lines), then snaps to the correct layout once CSS/JavaScript loads.

**Cause:** Multiple CSS rules needed for the hero layout aren't available during the initial paint:
1. Tailwind utility classes (`.flex`, `.flex-col`, `.justify-center`, etc.) not loaded yet
2. WordPress container layout classes (`.is-layout-flex`, `.wp-container-*`) not applied
3. Font size CSS variable (`--wp--preset--font-size--xxxx-large`) or class (`.has-xxxx-large-font-size`) loading late
4. `[loadtransition]` attributes triggering animations that shift content
5. Responsive height classes (`lg:h-relative`, `md:h-relative`) depending on Tailwind CSS

**Evidence:**
```
DOM Path: article#page-71030 > section > div > div.wp-block-columns > div.wp-block-column > h2.has-xxxx-large-font-size
Position shifting from narrow column to full width after CSS loads
```

**Fix:** Add a comprehensive `heroCriticalCss` block directly in the page component that renders as the first `<style>` tag. This CSS includes:

```typescript
const heroCriticalCss = `
  /* Hero section container - ensure stable height from first paint */
  article#page-71030 > section:first-child {
    min-height: 100vh !important;
    height: 100vh !important;
    contain: layout style;
  }
  
  /* Handle the lg:h-relative class - uses CSS variable for responsive height */
  .lg\\:h-relative {
    height: var(--height-lg-relative, 100vh) !important;
  }
  @media (min-width: 768px) {
    .md\\:h-relative {
      height: var(--height-md-relative, 100vh) !important;
    }
  }
  
  /* Hero text headings - lock in font size immediately */
  .has-xxxx-large-font-size {
    font-size: var(--wp--preset--font-size--xxxx-large, clamp(39px, 2.438rem + ((1vw - 3.9px) * 2.095), 61px)) !important;
    font-family: var(--wp--preset--font-family--heading, serif);
    font-weight: 300;
    line-height: 1.2;
    letter-spacing: -0.05em;
  }
  
  /* WordPress flex layout class - must display as flex immediately */
  .is-layout-flex {
    display: flex !important;
  }
  
  /* Ensure flex columns don't wrap - prevents text breaking */
  .wp-container-core-columns-is-layout-ec2e7a44 {
    display: flex !important;
    flex-wrap: nowrap !important;
  }
  
  /* Tailwind flex utilities - needed before Tailwind CSS loads */
  .flex { display: flex !important; }
  .flex-col { flex-direction: column !important; }
  .justify-center { justify-content: center !important; }
  .w-full { width: 100% !important; }
  .h-full { height: 100% !important; }
  .relative { position: relative !important; }
  
  /* Hero text column widths - lock in flex-basis values */
  .wp-block-column[style*="flex-basis:50%"] {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  .wp-block-column[style*="flex-basis:100%"] {
    flex: 1 1 100% !important;
  }
  .wp-block-column[style*="flex-basis:20px"] {
    flex: 0 0 20px !important;
    max-width: 20px !important;
  }
  
  /* Prevent loadtransition animations from shifting content */
  [loadtransition] {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    animation: none !important;
    transition: none !important;
  }
`;
```

**Page Component Update:**
```typescript
export default function AboutUsPage() {
  return (
    <div>
      {/* Critical hero CSS - must load first to prevent layout shift */}
      <style dangerouslySetInnerHTML={{ __html: heroCriticalCss }} />
      {/* Page-specific CSS for wp-container layout rules */}
      {pageCss && (
        <style dangerouslySetInnerHTML={{ __html: pageCss }} />
      )}
      {/* ... rest of page ... */}
    </div>
  );
}
```

**Key Principles:**
1. Critical CSS must be the first child element in the page to be parsed before any content renders
2. Use `!important` to override any conflicting styles from late-loading CSS
3. Include fallback values in CSS variables (e.g., `var(--wp--preset--font-size--xxxx-large, clamp(...))`)
4. Replicate essential Tailwind utilities that the hero section depends on
5. Disable all transitions/animations on `[loadtransition]` elements during initial paint

**Pages Affected:**
- About Us (`/about-us`) - Fixed
- Any page with large hero text using `has-xxxx-large-font-size` class
- Any page with `[loadtransition]` attributes on hero content

---

### 2026-01-13: about-us Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest (1.29 MB)
2. Split HTML using `node scripts/split-page-html.js about-us`
   - Header: 85,973 bytes
   - Main: 1,110,500 bytes
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js about-us` (46 rules)
4. Created Next.js page at `app/about-us/page.tsx`
5. Fixed absolute URLs in header (site logo and search form action)
6. Added hero critical CSS to prevent layout shift (Issue 20)

**Verification Results:**
- Page loads successfully with 200 status (2.75 MB rendered HTML)
- Header icons visible (light text on dark hero background)
- Hamburger menu opens and shows full navigation
- Hero section displays correctly:
  - "The first step at Paracelsus Recovery" heading
  - "is the last one you'll take alone." heading
  - "WATCH THE FILM" button
- Navigation tabs: "Who we are", "Who we treat", "our experts", "recognition"
- "From the founder" quote section with Jan Gerber's message
- "As Featured In" media logos section
- "Who we are" section with company history
- "Who we treat" section
- "Our Approach - Committed to excellence" section with team info
- FAQs accordion section
- Press quotes carousel
- "The journey begins with a conversation" CTA section
- Footer displays correctly
- All images loading via rewrites proxy (21 lazy-loaded images fixed)
- No critical layout shift on hero text (Issue 20 fix applied)
- Accessible from homepage via main navigation "About Us" link

**Issues Fixed:**
- **Absolute URLs in header:** Changed `href="https://paracelsus-recovery.com"` to `href="/"` for site logo and search form action
- **Hero text layout shift (Issue 20):** Added comprehensive `heroCriticalCss` block with Tailwind utilities, flex layout rules, font size definitions, and transition prevention

---

### Issue 21: Header Logo Links to Production Site Instead of Localhost

**Symptom:** Clicking the logo in the header redirects users to `paracelsus-recovery.com` instead of the local homepage (`/`). This happens on all pages.

**Cause:** The `rewriteUrls()` function in `scripts/split-page-html.js` only handled URLs with a trailing slash (e.g., `https://paracelsus-recovery.com/some-page/`) but not bare domain URLs (e.g., `https://paracelsus-recovery.com`). The logo link and search form action use the bare domain without a trailing slash.

**Evidence:**
```html
<!-- Before fix: absolute URL without trailing slash -->
<a href="https://paracelsus-recovery.com" class="site-logo block w-[36px] md:w-max mx-auto" title="Paracelsus Recovery">
<form role="search" method="get" class="searchform" action="https://paracelsus-recovery.com">

<!-- After fix: relative URL -->
<a href="/" class="site-logo block w-[36px] md:w-max mx-auto" title="Paracelsus Recovery">
<form role="search" method="get" class="searchform" action="/">
```

**Fix:** Updated `rewriteUrls()` function in `scripts/split-page-html.js` to handle bare domain URLs:

```javascript
function rewriteUrls(content) {
  return content
    // Handle bare domain URLs (no trailing slash) - convert to "/"
    .replace(/href="https?:\/\/(www\.)?paracelsus-recovery\.com"/g, 'href="/"')
    .replace(/action="https?:\/\/(www\.)?paracelsus-recovery\.com"/g, 'action="/"')
    // Existing: Convert URLs with paths to relative
    .replace(/https?:\/\/paracelsus-recovery\.com\//g, '/')
    // ... rest of function
}
```

**Files Fixed:** All 20 `01-header.html` files in `clone-kit/html/` and subdirectories.

**Important:** After fixing header HTML files, restart the Next.js dev server for changes to take effect (due to `force-static` caching at module load time).

### Issue 22: Page Navigation Sticky Sidebar Highlighting Not Working

**Symptom:** Pages with a sticky sidebar navigation (like the Alcohol Treatment Center page) have navigation links that should highlight based on which section is currently in view. The sidebar stays sticky correctly, but the active link highlighting doesn't update as the user scrolls.

**Cause:** Multiple issues:

1. **Hardcoded opacity classes:** The captured HTML had `opacity-50` hardcoded in the `class` attribute for links 2 and 3:
   ```html
   <!-- Link 2 and 3 had opacity-50 hardcoded -->
   <a class="heading-four opacity-50" :class="item !== 2 ? 'opacity-50' : ''" ...>
   ```
   Even when Alpine.js evaluates `:class` to an empty string (when active), the static `opacity-50` class remains.

2. **Alpine.js reactivity issue:** The `pageNavigation` Alpine component uses an IntersectionObserver callback to update the `item` property. However, Alpine's reactivity wasn't properly detecting changes when `this.item` was updated from within the observer callback, so the `:class` bindings weren't re-evaluated.

3. **Missing component registration:** The `pageNavigation` Alpine component wasn't being registered as a fallback in `layout.tsx`, so if the bundle failed to load or register it, the component wouldn't work.

**Evidence:**
```javascript
// Data property was updating correctly
{ item: 3 }  // Value changes based on scroll

// But DOM classes weren't updating
{ classes: "heading-four opacity-50" }  // Link 3 should NOT have opacity-50 when item=3
```

**Fix (3 parts):**

**Part 1:** Remove hardcoded `opacity-50` from links 2 and 3 in the HTML and use object syntax for `:class`:

```html
<!-- Before (broken): -->
<a class="heading-four opacity-50" :class="item !== 2 ? 'opacity-50' : ''" ...>

<!-- After (fixed): -->
<a class="heading-four" x-bind:class="{ 'opacity-50': item !== 2 }" ...>
```

**Part 2:** Add fallback `pageNavigation` Alpine component registration in `app/layout.tsx`:

```javascript
// In registerComponents() function
if (typeof Alpine.data('pageNavigation') !== 'function') {
  console.warn('[Fallback] Registering pageNavigation - bundle registration may have failed');
  Alpine.data('pageNavigation', () => ({
    item: 1,
    setItem(item) {
      this.item = item;
    },
    addIntersect(targetId, index) {
      const target = document.querySelector('#' + targetId);
      if (target) {
        target.dataset.index = index;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.item = parseInt(entry.target.dataset.index, 10);
              }
            });
          },
          { rootMargin: '0px 0px -50% 0px' }
        );
        observer.observe(target);
      }
    }
  }));
}
```

**Part 3:** Add standalone JavaScript navigation highlighting that bypasses Alpine's reactivity issues (in `app/layout.tsx`):

```javascript
// CRITICAL: Set up page navigation highlighting
// This directly manages the opacity classes on navigation links based on which section is visible
const setupPageNavigationHighlighting = () => {
  const navContainer = document.querySelector('[x-data="pageNavigation()"]');
  if (!navContainer) return;
  
  // Skip if already processed
  if (navContainer.hasAttribute('data-nav-observer-set')) return;
  navContainer.setAttribute('data-nav-observer-set', 'true');
  
  const navLinks = navContainer.querySelectorAll('a[href^="#"]');
  if (navLinks.length === 0) return;
  
  let currentActiveIndex = 0;
  
  const updateActiveLink = (newIndex) => {
    if (newIndex === currentActiveIndex) return;
    currentActiveIndex = newIndex;
    
    navLinks.forEach((link, i) => {
      if (i === newIndex) {
        link.classList.remove('opacity-50');
      } else {
        link.classList.add('opacity-50');
      }
    });
  };
  
  // Set up intersection observers for each target section
  navLinks.forEach((link, index) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    
    const targetId = href.substring(1);
    const target = document.getElementById(targetId);
    
    if (!target) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateActiveLink(index);
          }
        });
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    
    observer.observe(target);
  });
  
  // Initialize with first link active
  updateActiveLink(0);
};

// Run after Alpine starts and DOM is ready
document.addEventListener('alpine:initialized', setupPageNavigationHighlighting);
// Also run after a short delay as fallback
setTimeout(setupPageNavigationHighlighting, 2000);
```

**Files Modified:**
- `clone-kit/html/luxury-alcohol-treatment-center/02-main.html` - Fixed hardcoded opacity classes
- `app/layout.tsx` - Added `pageNavigation` fallback component and `setupPageNavigationHighlighting()` function

**How it works:**
1. The `setupPageNavigationHighlighting()` function finds the navigation container
2. It sets up IntersectionObservers for each section target (using `rootMargin: '0px 0px -50% 0px'` so sections trigger when they cross the top 50% of the viewport)
3. When a section becomes visible, it directly manipulates the `opacity-50` class on the navigation links
4. This bypasses Alpine's reactivity entirely, ensuring reliable highlighting

**Note:** This fix applies globally to any page with `[x-data="pageNavigation()"]` navigation. For new pages with this pattern, ensure the HTML doesn't have hardcoded `opacity-50` on the navigation links.

---

### 2026-01-13: eating-disorder-rehab Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/treatment/eating-disorder-rehab/ using browser MCP
2. Scrolled to trigger lazy loading (1/3, 2/3, bottom) and captured full HTML (368KB)
3. Saved HTML to `clone-kit/raw/eating-disorder-rehab.outer.html`
4. Split HTML using `node scripts/split-page-html.js eating-disorder-rehab`
   - Header: 87,528 bytes
   - Main: 126,155 bytes
   - Footer: 17,668 bytes
   - Modal: 35,554 bytes (with modal visibility fix applied)
5. Extracted page-specific CSS using `node scripts/extract-page-css.js eating-disorder-rehab` (33 rules)
6. Created Next.js page at `app/treatment/eating-disorder-rehab/page.tsx`

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Eating Disorder Rehabilitation Centre" heading with image
- Eating disorder types list (Anorexia, Bulimia, Orthorexia, Obesity, Binge Eating, Body Dysmorphic)
- "How we treat" section with sticky image working correctly
- Treatment accordions displayed (Assessment, Diagnostics, Psychotherapy, Psychiatry, etc.)
- All images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Conditions We Treat > Eating Disorders > VIEW ALL

**Files Created:**
- `clone-kit/raw/eating-disorder-rehab.outer.html` (368 KB)
- `clone-kit/html/eating-disorder-rehab/00-page-css.css` (3.6 KB, 33 rules)
- `clone-kit/html/eating-disorder-rehab/01-header.html` (87.5 KB)
- `clone-kit/html/eating-disorder-rehab/02-main.html` (126 KB)
- `clone-kit/html/eating-disorder-rehab/03-footer.html` (17.7 KB)
- `clone-kit/html/eating-disorder-rehab/04-modal.html` (35.5 KB)
- `app/treatment/eating-disorder-rehab/page.tsx`

**Console Warnings (non-critical):**
- HubSpot portal ID issues (expected on localhost)
- Meta pixel warnings (expected on localhost)
- Alpine.js fallback registrations (expected - fallback system working)

**Detailed Rebuild Document:** See `docs/page-rebuild/eating-disorder-rehab.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### Issue 23: Sticky Image Not Working (Tailwind lg:relative Override)

**Symptom:** Sticky image sections don't stay pinned when scrolling. The image scrolls away with the rest of the content instead of staying fixed at the top while the text content scrolls past it.

**Cause:** The HTML element has both `sticky` and `lg:relative` Tailwind classes. On the live WordPress site, the page-specific CSS rule `.wp-container-N { position: sticky; }` has enough specificity to override Tailwind. However, on the Next.js clone, Tailwind's `lg:relative` class (which applies `position: relative` at large screen sizes) takes precedence over the page-specific CSS.

**Evidence:**
```javascript
// Live site: position is sticky
{ position: "sticky", top: "0px", zIndex: "10" }

// Localhost (before fix): position is relative
{ position: "relative", top: "0px", zIndex: "10" }

// HTML has conflicting classes:
// class="... sticky top-0 lg:relative lg:h-fit relative ... is-position-sticky ..."
```

**Fix:** Added `position: sticky !important` to the global `.is-position-sticky` rule in `app/critical-css.tsx`:

```css
/* Fix sticky section positioning and z-index for proper stacking order */
/* WordPress generates dynamic .wp-container-N rules with position:sticky and z-index: 10 */
/* but Tailwind lg:relative class can override sticky positioning. This ensures it works. */
section.is-position-sticky,
.is-position-sticky {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}
```

**Location:** `app/critical-css.tsx` - in the `globalsCss` constant.

**Pages Affected:**
- Clinical Recovery Technology (`/therapies/clinical-recovery-technology/`)
- Any page with `.is-position-sticky` elements and sticky image sections

**Note:** This is a global fix that applies to all pages. No per-page fixes needed.

---

### 2026-01-13: clinical-recovery-technology Page Rebuild

**Status:** Success

**Process:**
1. Navigated to https://paracelsus-recovery.com/therapies/clinical-recovery-technology/ using browser MCP
2. Scrolled to trigger lazy loading (1/3, 2/3, bottom) and captured full HTML (360 KB)
3. Saved HTML to `clone-kit/raw/clinical-recovery-technology.outer.html`
4. Split HTML using `node scripts/split-page-html.js clinical-recovery-technology`
   - Header: 86,986 bytes
   - Main: 128,446 bytes
   - Footer: 17,668 bytes
   - Modal: 35,567 bytes
5. Extracted page-specific CSS using `node scripts/extract-page-css.js clinical-recovery-technology` (18 rules)
6. Created Next.js page at `app/therapies/clinical-recovery-technology/page.tsx`
7. Fixed Issue 23: Added `position: sticky !important` to global `.is-position-sticky` rule

**Verification Results:**
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Leading-edge clinical technology" heading with image
- All technology sections present:
  - Vagus Nerve Stimulation
  - Continuous Glucose Monitoring (CGM)
  - Sleepiz (Sleep Apnoea)
  - Bioelectrical Impedance Analysis
  - NAD and Orthomolecular IV Infusions
  - Whoop Band and Oura Ring
  - IHHT (Intermittent Hyperoxic Hypoxic Treatment)
  - Biofeedback Devices (Bio-resonance & Metatron)
  - Satori Chair
  - Photobiomodulation Panels
  - Neurofeedback
  - Advanced AI-powered psychiatry
- Sticky image effect working correctly (image stays pinned while content scrolls)
- 32 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Types of Therapies > Diagnostics & Technologies > VIEW ALL

**Files Created:**
- `clone-kit/raw/clinical-recovery-technology.outer.html` (360 KB)
- `clone-kit/html/clinical-recovery-technology/00-page-css.css` (2 KB, 18 rules)
- `clone-kit/html/clinical-recovery-technology/01-header.html` (87 KB)
- `clone-kit/html/clinical-recovery-technology/02-main.html` (128 KB)
- `clone-kit/html/clinical-recovery-technology/03-footer.html` (17.7 KB)
- `clone-kit/html/clinical-recovery-technology/04-modal.html` (35.6 KB)
- `app/therapies/clinical-recovery-technology/page.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/clinical-recovery-technology.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### 2026-01-13: chronic-conditions-recovery Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest (310 KB)
2. Split HTML using `node scripts/split-page-html.js chronic-conditions-recovery`
   - Header: 86,670 bytes
   - Main: 135,196 bytes (29 lazy-loaded images fixed)
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js chronic-conditions-recovery` (34 rules)
4. Created Next.js page at `app/treatment/chronic-conditions-recovery/page.tsx`

**Verification Results:**
- Page loads with 200 status (798 KB rendered)
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Chronic Condition Recovery - Your path to healing"
- All chronic condition links displayed:
  - Long Covid
  - Treatment-Resistant Depression
  - Holistic Cancer Treatment
  - Heart Disease
  - Sleep Disorders
  - Menopause
  - Alzheimer's and Other Dementias
  - Chronic Kidney Disease
  - Arthritis
  - Osteoporosis
  - Diabetes
  - COPD and Allied Conditions
- "How we treat" section with treatment approach details
- Treatment accordions present (Assessment, Diagnostics, Psychotherapy, Psychiatry, etc.)
- "Need help? We're here for you." CTA section
- Footer displays correctly
- All 29 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Conditions We Treat > Chronic Conditions menu

**Files Created:**
- `clone-kit/raw/chronic-conditions-recovery.outer.html` (310 KB)
- `clone-kit/html/chronic-conditions-recovery/00-page-css.css` (3.7 KB, 34 rules)
- `clone-kit/html/chronic-conditions-recovery/01-header.html` (87 KB)
- `clone-kit/html/chronic-conditions-recovery/02-main.html` (135 KB)
- `clone-kit/html/chronic-conditions-recovery/03-footer.html` (17.5 KB)
- `clone-kit/html/chronic-conditions-recovery/04-modal.html` (10.3 KB)
- `app/treatment/chronic-conditions-recovery/page.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/chronic-conditions-recovery.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### 2026-01-13: drug-addiction-treatment Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest
2. Split HTML using `node scripts/split-page-html.js drug-addiction-treatment`
   - Header: 86,324 bytes
   - Main: 167,963 bytes (40 lazy-loaded images fixed)
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js drug-addiction-treatment` (28 rules)
4. Created Next.js page at `app/treatment/drug-addiction-treatment/page.tsx`

**Verification Results:**
- Page loads with 200 status (867 KB rendered)
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays drug addiction treatment information
- All drug addiction types listed:
  - Cocaine
  - Nicotine
  - GHB
  - Methamphetamine
  - Ketamine
  - Cannabis
  - Kratom
  - Opioids
  - Crack Cocaine
  - Heroin
  - Synthetic Cannabinoids (Spice, K2)
  - Synthetic Cathinones (Bath Salts)
- Treatment accordions present (Assessment, Diagnostics, Psychotherapy, Psychiatry, etc.)
- Footer displays correctly
- All 40 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Conditions We Treat > Drug Addiction > VIEW ALL

**Files Created:**
- `clone-kit/raw/drug-addiction-treatment.outer.html`
- `clone-kit/html/drug-addiction-treatment/00-page-css.css` (3.1 KB, 28 rules)
- `clone-kit/html/drug-addiction-treatment/01-header.html` (86 KB)
- `clone-kit/html/drug-addiction-treatment/02-main.html` (168 KB)
- `clone-kit/html/drug-addiction-treatment/03-footer.html` (17.5 KB)
- `clone-kit/html/drug-addiction-treatment/04-modal.html` (10.3 KB)
- `app/treatment/drug-addiction-treatment/page.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/drug-addiction-treatment.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### Issue 24: WordPress Block List Bullet Points Not Properly Formatted

**Symptom:** Bullet point lists (using `<ul class="wp-block-list">`) appear with compressed vertical spacing. List items are too close together compared to the live WordPress site. The bullet points may also be missing or positioned incorrectly.

**Cause:** WordPress generates global inline CSS styles for block list elements that provide proper bullet styling and spacing between items. These styles are in the `global-styles-inline-css` style block in the page's `<head>`:

```css
:root :where(.wp-block-list){list-style-type: disc; margin-left: var(--wp--preset--spacing--20);}
:root :where(.wp-block-list > li){margin-bottom: var(--wp--preset--spacing--10);}
```

The theme's CSS files (`08-core-blocks.scss`) only include `margin-left: 1rem` for lists but are missing the crucial `margin-bottom` for list items. The `extract-page-css.js` script only extracts `wp-container` rules, not global element styles.

**Evidence:**
```html
<!-- HTML structure is correct -->
<ul class="wp-block-list">
  <li class="has-body-font-family">Item 1</li>
  <li class="has-body-font-family">Item 2</li>
  <!-- Items appear too close together without margin-bottom -->
</ul>
```

**Fix:** Added WordPress block list styling rules to `app/globals.css`:

```css
/* WordPress block list styling - ensures proper bullets and spacing */
/* This matches the global-styles-inline-css from the live WordPress site */
:root :where(.wp-block-list) {
  list-style-type: disc;
  margin-left: var(--wp--preset--spacing--20);
}
:root :where(.wp-block-list > li) {
  margin-bottom: var(--wp--preset--spacing--10);
}
```

**Location:** `app/critical-css.tsx` - in the `globalsCss` constant. This is where global styles are actually inlined (globals.css is not imported).

**Pages Affected:**
- Prescription Drug Addiction Treatment (`/treatment/prescription-drug-addiction-treatment/`)
- Behavioural Addiction Treatment (`/treatment/behavioural-addiction-treatment/`)
- Any page with `<ul class="wp-block-list">` elements containing bulleted lists

**Note:** This is a global fix. After adding to `critical-css.tsx`, all pages with WordPress block lists will have proper formatting.

**Important:** The CSS rules reference CSS variables (`--wp--preset--spacing--10`, `--wp--preset--spacing--20`) which must also be defined. See Issue 25.

---

### Issue 25: WordPress Spacing Variables Not Defined

**Symptom:** CSS rules that use WordPress spacing variables (like `.wp-block-list > li { margin-bottom: var(--wp--preset--spacing--10); }`) have no effect. Elements appear with no spacing even though the CSS rules are present.

**Cause:** WordPress defines spacing CSS variables in the `global-styles-inline-css` block in each page's `<head>`. These variables are not extracted by the splitter or CSS extractor scripts, so the variables are undefined in the Next.js clone.

**Evidence:**
```css
/* WordPress defines these in global-styles-inline-css */
:root {
  --wp--preset--spacing--10: 1rem;
  --wp--preset--spacing--20: 40px;
  /* ... more spacing values ... */
}

/* Our CSS rules reference these undefined variables */
.wp-block-list > li { margin-bottom: var(--wp--preset--spacing--10); }
/* Without the variable defined, margin-bottom evaluates to nothing */
```

**Fix:** Added WordPress spacing variables to `app/critical-css.tsx` in the `globalsCss` constant:

```css
/* WordPress spacing variables - extracted from live WordPress site global styles */
:root {
  --wp--preset--spacing--10: 1rem;
  --wp--preset--spacing--20: 40px;
  --wp--preset--spacing--30: 60px;
  --wp--preset--spacing--40: clamp(3.75rem, 4.16vw, 6rem);
  --wp--preset--spacing--50: clamp(5.625rem, 6.25vw, 8rem);
  --wp--preset--spacing--60: clamp(6.25rem, 8.3vw, 12rem);
  --wp--preset--spacing--70: 3.38rem;
  --wp--preset--spacing--80: 5.06rem;
  --wp--preset--spacing--100: auto;
}
```

**Location:** `app/critical-css.tsx` - in the `globalsCss` constant, before other CSS rules.

**How to extract values from any page:**
```powershell
$content = Get-Content "clone-kit/raw/{page-name}.outer.html" -Raw
$matches = [regex]::Matches($content, '--wp--preset--spacing--\d+:\s*[^;]+')
$matches | ForEach-Object { $_.Value }
```

**Pages Affected:** All pages that use WordPress spacing variables in inline styles or wp-block-list elements.

---

### 2026-01-13: prescription-drug-addiction-treatment Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest
2. Split HTML using `node scripts/split-page-html.js prescription-drug-addiction-treatment`
   - Header: 87,134 bytes
   - Main: 155,782 bytes (40 lazy-loaded images fixed)
   - Footer: 17,668 bytes
   - Modal: 35,279 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js prescription-drug-addiction-treatment` (27 rules)
4. Created Next.js page at `app/treatment/prescription-drug-addiction-treatment/page.tsx`
5. Fixed Issue 24: Added WordPress block list CSS to `app/globals.css`

**Verification Results:**
- Page loads with 200 status
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Prescription Drug Addiction Treatment" heading
- All prescription drug types listed:
  - Opioid-based Painkillers
  - Benzodiazepines
  - Stimulants
  - Sleep Medication
  - Muscle Relaxants
  - Gabapentin and Pregabalin
  - Antipsychotics
- "What are the signs?" section with properly formatted bullet list
- Treatment accordions present (Assessment, Diagnostics, Psychotherapy, Psychiatry, etc.)
- Footer displays correctly
- All 40 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Conditions We Treat > Prescription Drug Addiction

**Files Created:**
- `clone-kit/raw/prescription-drug-addiction-treatment.outer.html`
- `clone-kit/html/prescription-drug-addiction-treatment/00-page-css.css` (2.8 KB, 27 rules)
- `clone-kit/html/prescription-drug-addiction-treatment/01-header.html` (87 KB)
- `clone-kit/html/prescription-drug-addiction-treatment/02-main.html` (156 KB)
- `clone-kit/html/prescription-drug-addiction-treatment/03-footer.html` (17.7 KB)
- `clone-kit/html/prescription-drug-addiction-treatment/04-modal.html` (35.3 KB)
- `app/treatment/prescription-drug-addiction-treatment/page.tsx`

**Issues Fixed:**
- **Issue 24:** WordPress block list bullet points not properly formatted - Fixed by adding `.wp-block-list` styling to `globals.css`

**Detailed Rebuild Document:** See `docs/page-rebuild/prescription-drug-addiction-treatment.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### 2026-01-13: psychiatry-recovery-treatment Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest (269 KB)
2. Split HTML using `node scripts/split-page-html.js psychiatry-recovery-treatment`
   - Header: 86,003 bytes
   - Main: 95,326 bytes (36 lazy-loaded images fixed)
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js psychiatry-recovery-treatment` (18 rules)
4. Created Next.js page at `app/therapies/psychiatry-recovery-treatment/page.tsx`

**Verification Results:**
- Page loads with 200 status (706 KB rendered)
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Contains expected content ("Psychiatry", "holistic treatment model")
- Header and footer present and rendering correctly
- All 36 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Types of Therapies > Psychiatry

**Files Created:**
- `clone-kit/raw/psychiatry-recovery-treatment.outer.html` (269 KB)
- `clone-kit/html/psychiatry-recovery-treatment/00-page-css.css` (2 KB, 18 rules)
- `clone-kit/html/psychiatry-recovery-treatment/01-header.html` (86 KB)
- `clone-kit/html/psychiatry-recovery-treatment/02-main.html` (95 KB)
- `clone-kit/html/psychiatry-recovery-treatment/03-footer.html` (17.5 KB)
- `clone-kit/html/psychiatry-recovery-treatment/04-modal.html` (10.3 KB)
- `app/therapies/psychiatry-recovery-treatment/page.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/psychiatry-recovery-treatment.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### 2026-01-13: behavioural-addiction-treatment Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest (273 KB)
2. Split HTML using `node scripts/split-page-html.js behavioural-addiction-treatment`
   - Header: 86,424 bytes
   - Main: 98,450 bytes (9 lazy-loaded images fixed)
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js behavioural-addiction-treatment` (27 rules)
4. Created Next.js page at `app/treatment/behavioural-addiction-treatment/page.tsx`
5. Fixed Issue 25: Added WordPress spacing variables to `app/critical-css.tsx`

**Verification Results:**
- Page loads with 200 status (719 KB rendered)
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays correctly
- All behavioural addiction types listed:
  - Gambling Addiction
  - Shopping Addiction
  - Sex Addiction
  - Gaming Addiction
  - Internet Addiction
  - Social Media Addiction
  - Exercise Addiction
  - Food Addiction
  - Love Addiction
  - Work Addiction
  - Porn Addiction
  - Cosmetic Surgery Addiction
- "What are the signs?" accordion with properly formatted bullet list (Issue 24 + 25 fix)
- Treatment accordions present (Assessment, Diagnostics, Psychotherapy, Psychiatry, etc.)
- Footer displays correctly
- All 9 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Conditions We Treat > Behavioural Addictions > VIEW ALL

**Files Created:**
- `clone-kit/raw/behavioural-addiction-treatment.outer.html` (273 KB)
- `clone-kit/html/behavioural-addiction-treatment/00-page-css.css` (3 KB, 27 rules)
- `clone-kit/html/behavioural-addiction-treatment/01-header.html` (86 KB)
- `clone-kit/html/behavioural-addiction-treatment/02-main.html` (98 KB)
- `clone-kit/html/behavioural-addiction-treatment/03-footer.html` (17.5 KB)
- `clone-kit/html/behavioural-addiction-treatment/04-modal.html` (10.3 KB)
- `app/treatment/behavioural-addiction-treatment/page.tsx`

**Issues Fixed:**
- **Issue 25:** WordPress spacing variables not defined - Fixed by adding spacing CSS variables to `critical-css.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/behavioural-addiction-treatment.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### 2026-01-13: functional-medicine-treatment Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest
2. Split HTML using `node scripts/split-page-html.js functional-medicine-treatment`
   - Header: 86,087 bytes
   - Main: 92,240 bytes (35 lazy-loaded images fixed)
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js functional-medicine-treatment` (18 rules)
4. Created Next.js page at `app/functional-medicine-treatment/page.tsx`

**Verification Results:**
- Page loads with 200 status (700 KB rendered)
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Functional Medicine Treatment" heading
- All FAQ sections present:
  - What is functional medicine?
  - What is functional medicine helpful for?
  - Is functional medicine evidence-based?
- "Latest news and insight" section with press articles carousel
- Footer displays correctly
- All 35 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Types of Therapies > Functional Medicine

**Files Created:**
- `clone-kit/raw/functional-medicine-treatment.outer.html`
- `clone-kit/html/functional-medicine-treatment/00-page-css.css` (2 KB, 18 rules)
- `clone-kit/html/functional-medicine-treatment/01-header.html` (86 KB)
- `clone-kit/html/functional-medicine-treatment/02-main.html` (92 KB)
- `clone-kit/html/functional-medicine-treatment/03-footer.html` (17.5 KB)
- `clone-kit/html/functional-medicine-treatment/04-modal.html` (10.3 KB)
- `app/functional-medicine-treatment/page.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/functional-medicine-treatment.md` for step-by-step instructions that can be used to reproduce this rebuild.

---

### 2026-01-13: holistic-complementary-therapies Page Rebuild

**Status:** Success

**Process:**
1. Captured HTML from live WordPress site using PowerShell Invoke-WebRequest (207 KB)
2. Split HTML using `node scripts/split-page-html.js holistic-complementary-therapies`
   - Header: 86,042 bytes
   - Main: 41,530 bytes (4 lazy-loaded images fixed)
   - Footer: 17,497 bytes
   - Modal: 10,319 bytes
3. Extracted page-specific CSS using `node scripts/extract-page-css.js holistic-complementary-therapies` (30 rules)
4. Created Next.js page at `app/holistic-complementary-therapies/page.tsx`

**Verification Results:**
- Page loads with 200 status (595 KB rendered)
- Header icons visible (dark on light background)
- Hamburger menu opens and shows full navigation
- Hero section displays "Holistic Treatments & Complementary Therapies" heading
- Subheading: "Nourishing your mind and body"
- Main content describes complementary therapies approach
- Footer displays correctly with Treatment, Information, and Connect sections
- All 4 images loading via rewrites proxy
- No 404 errors for WordPress assets
- Accessible from homepage via Types of Therapies > Holistic & Complementary Therapies

**Files Created:**
- `clone-kit/raw/holistic-complementary-therapies.outer.html` (207 KB)
- `clone-kit/html/holistic-complementary-therapies/00-page-css.css` (3.2 KB, 30 rules)
- `clone-kit/html/holistic-complementary-therapies/01-header.html` (86 KB)
- `clone-kit/html/holistic-complementary-therapies/02-main.html` (42 KB)
- `clone-kit/html/holistic-complementary-therapies/03-footer.html` (17.5 KB)
- `clone-kit/html/holistic-complementary-therapies/04-modal.html` (10.3 KB)
- `app/holistic-complementary-therapies/page.tsx`

**Detailed Rebuild Document:** See `docs/page-rebuild/holistic-complementary-therapies.md` for step-by-step instructions that can be used to reproduce this rebuild.
