# Clinical Recovery Technology Page Rebuild Guide

This document provides step-by-step instructions to rebuild the Clinical Recovery Technology page from the WordPress site as a static HTML clone in Next.js.

## Page Information

| Property | Value |
|----------|-------|
| **Source URL** | https://paracelsus-recovery.com/therapies/clinical-recovery-technology/ |
| **Next.js Route** | `/therapies/clinical-recovery-technology/` |
| **Page Title** | Clinical Recovery Technology - Paracelsus Recovery |
| **Navigation Path** | Types of Therapies > Diagnostics & Technologies > VIEW ALL |

## Prerequisites

- Node.js installed
- Next.js dev server can be started (`npm run dev`)
- Chrome DevTools MCP (cursor-browser-extension) available
- Access to the live WordPress site

## Step 1: Capture Raw HTML

### 1.1 Navigate to the Page

Use the browser MCP to navigate to the source page:

```javascript
// MCP Tool: browser_navigate
{ "url": "https://paracelsus-recovery.com/therapies/clinical-recovery-technology/" }
```

### 1.2 Scroll to Trigger Lazy Loading

The page uses lazy loading for images. Scroll through the page to ensure all content is loaded:

```javascript
// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight / 3); return 'scrolled to 1/3'; }" }

// Wait 1-2 seconds, then:
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight * 2 / 3); return 'scrolled to 2/3'; }" }

// Wait 1-2 seconds, then:
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight); return 'scrolled to bottom'; }" }
```

### 1.3 Capture Full HTML

Capture the complete DOM:

```javascript
// MCP Tool: browser_evaluate
{ "function": "() => document.documentElement.outerHTML" }
```

### 1.4 Save Raw HTML

Save the captured HTML to:
```
clone-kit/raw/clinical-recovery-technology.outer.html
```

**Expected size:** ~360 KB

## Step 2: Split HTML into Parts

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js clinical-recovery-technology
```

**Expected output:**
```
Reading: .../clone-kit/raw/clinical-recovery-technology.outer.html
Found escaped sequences in file, decoding...
  → Escape sequences decoded
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,986 bytes)
  → Fixed Flickity slider (removed pre-initialized state)
  ✓ 02-main.html (128,446 bytes)
  ✓ 03-footer.html (17,668 bytes)
  → Fixed modal visibility (added x-show="open" to modal-0)
  ✓ 04-modal.html (35,567 bytes)

Split complete: 4/4 sections extracted
```

**Files created:**
- `clone-kit/html/clinical-recovery-technology/01-header.html`
- `clone-kit/html/clinical-recovery-technology/02-main.html`
- `clone-kit/html/clinical-recovery-technology/03-footer.html`
- `clone-kit/html/clinical-recovery-technology/04-modal.html`

### Automatic Fixes Applied by Splitter

The script automatically applies these fixes:
- **URL rewriting:** Converts absolute WordPress URLs to relative paths
- **Alpine.js fixes:** Adds missing `x-show` attributes, removes `-translate-y-full` from static classes
- **Lazy images:** Converts `data-src` to `src`, adds `is-loaded` class
- **Modal visibility:** Adds `x-show="open" style="display: none;"` to modal container
- **Flickity reset:** Removes pre-initialized slider state

## Step 3: Extract Page-Specific CSS

Run the CSS extractor:

```bash
node scripts/extract-page-css.js clinical-recovery-technology
```

**Expected output:**
```
Reading: .../clone-kit/raw/clinical-recovery-technology.outer.html
Found 18 wp-container rules
Wrote: .../clone-kit/html/clinical-recovery-technology/00-page-css.css (2,042 bytes)
```

**File created:**
- `clone-kit/html/clinical-recovery-technology/00-page-css.css`

This CSS includes:
- Sticky positioning for `.wp-container-1`
- Layout rules for columns and groups
- Max-width and margin rules for content alignment

## Step 4: Create Next.js Page Component

Create the file `app/therapies/clinical-recovery-technology/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial page creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("clinical-recovery-technology");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/clinical-recovery-technology/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Clinical Recovery Technology - Paracelsus Recovery',
  description: 'Leading-edge clinical technology pushing the boundaries of clinical excellence. From 24-hour ECGs, IV infusions, and HRV testing to stress MRIs and IHHT treatment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/therapies/clinical-recovery-technology/',
  },
  openGraph: {
    title: 'Clinical Recovery Technology - Paracelsus Recovery',
    description: 'Leading-edge clinical technology pushing the boundaries of clinical excellence. From 24-hour ECGs, IV infusions, and HRV testing to stress MRIs and IHHT treatment.',
    url: 'https://paracelsus-recovery.com/therapies/clinical-recovery-technology/',
  },
};

export default function ClinicalRecoveryTechnologyPage() {
  return (
    <div>
      {/* Page-specific CSS for wp-container layout rules */}
      {pageCss && (
        <style dangerouslySetInnerHTML={{ __html: pageCss }} />
      )}
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: headerHtml }} 
      />
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: mainHtml }} 
      />
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: footerHtml }} 
      />
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: modalHtml }} 
      />
    </div>
  );
}
```

## Step 5: Restart Dev Server

The Next.js dev server needs to detect the new page:

```bash
# Stop existing server (Ctrl+C) and restart
npm run dev
```

## Step 6: Verification

### 6.1 Basic Page Load

Navigate to `http://localhost:3000/therapies/clinical-recovery-technology/`

**Expected:** Page loads with HTTP 200 status

### 6.2 Content Verification

Check that all technology sections are present:

```javascript
// MCP Tool: browser_evaluate
{
  "function": "() => { const h = document.querySelectorAll('h1, h2, h3'); return Array.from(h).slice(0,15).map(x => x.textContent.trim().substring(0,50)); }"
}
```

**Expected sections:**
- Leading-edge clinical technology
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

### 6.3 Sticky Effect Verification

Check the sticky section has correct positioning:

```javascript
// MCP Tool: browser_evaluate
{
  "function": "() => { const s = document.querySelector('.is-position-sticky'); const c = window.getComputedStyle(s); return { position: c.position, top: c.top, zIndex: c.zIndex }; }"
}
```

**Expected:**
```json
{ "position": "sticky", "top": "0px", "zIndex": "10" }
```

### 6.4 Navigation Accessibility

Verify the page is accessible from homepage:

```javascript
// MCP Tool: browser_navigate
{ "url": "http://localhost:3000/" }

// Then check for links:
// MCP Tool: browser_evaluate
{
  "function": "() => { const links = document.querySelectorAll('a[href*=\"clinical-recovery-technology\"]'); return { count: links.length }; }"
}
```

**Expected:** At least 1 link found (typically 6-8 in navigation menu)

### 6.5 Images Loading

Check images are loading via rewrites proxy:

```javascript
// MCP Tool: browser_evaluate
{
  "function": "() => { return { imageCount: document.querySelectorAll('img').length }; }"
}
```

**Expected:** ~32 images

## Troubleshooting

### Issue: 404 Page Not Found

**Cause:** Dev server hasn't detected the new page yet.

**Fix:** Restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Sticky Image Not Working

**Cause:** Tailwind `lg:relative` class overriding sticky positioning.

**Fix:** This is already fixed globally in `app/critical-css.tsx`. If still not working, verify the CSS includes:

```css
section.is-position-sticky,
.is-position-sticky {
  position: sticky !important;
  top: 0 !important;
  z-index: 10 !important;
}
```

### Issue: Images Not Loading

**Cause:** WordPress asset URLs not being proxied.

**Fix:** Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/`:

```typescript
async rewrites() {
  return [
    { source: "/wp-content/:path*", destination: "https://paracelsus-recovery.com/wp-content/:path*" },
    { source: "/wp-includes/:path*", destination: "https://paracelsus-recovery.com/wp-includes/:path*" },
  ];
}
```

### Issue: Modal Form Visible at Bottom of Page

**Cause:** Modal container missing `x-show="open"` attribute.

**Fix:** The splitter script should add this automatically. If not, manually add to the modal container in `04-modal.html`:

```html
<div class="Modal Modal--Full..." id="modal-0" x-show="open" style="display: none;">
```

## Files Summary

| File | Size | Purpose |
|------|------|---------|
| `clone-kit/raw/clinical-recovery-technology.outer.html` | 360 KB | Raw captured HTML |
| `clone-kit/html/clinical-recovery-technology/00-page-css.css` | 2 KB | Page-specific CSS (18 rules) |
| `clone-kit/html/clinical-recovery-technology/01-header.html` | 87 KB | Navigation header |
| `clone-kit/html/clinical-recovery-technology/02-main.html` | 128 KB | Main content |
| `clone-kit/html/clinical-recovery-technology/03-footer.html` | 17.7 KB | Footer |
| `clone-kit/html/clinical-recovery-technology/04-modal.html` | 35.6 KB | Contact modal |
| `app/therapies/clinical-recovery-technology/page.tsx` | 1.5 KB | Next.js page component |

## Quick Reference Commands

```bash
# From paracelsus-clone directory:

# Split raw HTML
node scripts/split-page-html.js clinical-recovery-technology

# Extract page CSS
node scripts/extract-page-css.js clinical-recovery-technology

# Start dev server
npm run dev

# Build for production
npm run build
```
