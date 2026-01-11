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

### Step 3: Create the Next.js Page

Create `app/your-page/page.tsx`:

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
- [ ] Create Next.js page in `app/{page-name}/page.tsx`
- [ ] Set appropriate metadata (title, description, canonical URL)
- [ ] Check header visibility (icons should be visible against background)
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
| `lib/load-page-html.ts` | Helper to load and normalize HTML parts |
| `clone-kit/raw/*.outer.html` | Full captured HTML from WordPress |
| `clone-kit/html/{page}/01-header.html` | Header section |
| `clone-kit/html/{page}/02-main.html` | Main content section |
| `clone-kit/html/{page}/03-footer.html` | Footer section |
| `clone-kit/html/{page}/04-modal.html` | Modal content (contact form, etc.) |
