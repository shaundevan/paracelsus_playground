# Eating Disorder Rehab Page Rebuild

**Page URL:** https://paracelsus-recovery.com/treatment/eating-disorder-rehab/  
**Local URL:** http://localhost:3000/treatment/eating-disorder-rehab/  
**Status:** Complete  
**Date:** 2026-01-13

---

## Overview

This document provides step-by-step instructions to rebuild the Eating Disorder Rehabilitation Centre page from the live WordPress site as a static Next.js page. Any agent can follow these instructions to reproduce the rebuild.

## Prerequisites

- Node.js installed
- Chrome DevTools MCP (`cursor-browser-extension`) available
- Next.js dev server can be started with `npm run dev`
- Workspace at `paracelsus-clone/`

---

## Step 1: Capture Raw HTML

Use the Chrome DevTools MCP to navigate to the page and capture the fully-rendered HTML.

### 1.1 Navigate to the page

```javascript
// MCP Tool: browser_navigate
{ "url": "https://paracelsus-recovery.com/treatment/eating-disorder-rehab/" }
```

### 1.2 Scroll to trigger lazy loading

Execute these in sequence to ensure all lazy-loaded content is rendered:

```javascript
// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight / 3); return 'scrolled 1/3'; }" }

// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight * 2 / 3); return 'scrolled 2/3'; }" }

// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight); return 'scrolled to bottom'; }" }
```

### 1.3 Capture the full HTML

```javascript
// MCP Tool: browser_evaluate
{ "function": "() => document.documentElement.outerHTML" }
```

This returns the complete HTML. The output may be written to a temporary file due to size.

---

## Step 2: Save Raw HTML

Save the captured HTML to the raw folder:

```
clone-kit/raw/eating-disorder-rehab.outer.html
```

**Expected size:** ~368 KB

If using PowerShell to copy from a temp file:

```powershell
copy "C:\path\to\temp\file.txt" "clone-kit\raw\eating-disorder-rehab.outer.html"
```

---

## Step 3: Split HTML into Sections

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js eating-disorder-rehab
```

**Expected output:**

```
Reading: .../clone-kit/raw/eating-disorder-rehab.outer.html
Found escaped sequences in file, decoding...
  → Escape sequences decoded
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (87,528 bytes)
  ✓ 02-main.html (126,155 bytes)
  ✓ 03-footer.html (17,668 bytes)
  → Fixed modal visibility (added x-show="open" to modal-0)
  ✓ 04-modal.html (35,554 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/eating-disorder-rehab
```

**Files created in `clone-kit/html/eating-disorder-rehab/`:**
- `01-header.html` - Header with navigation
- `02-main.html` - Main page content
- `03-footer.html` - Footer section
- `04-modal.html` - Contact modal

---

## Step 4: Extract Page-Specific CSS

Run the CSS extractor script:

```bash
node scripts/extract-page-css.js eating-disorder-rehab
```

**Expected output:**

```
Reading: .../clone-kit/raw/eating-disorder-rehab.outer.html
Found 33 wp-container rules
Wrote: .../clone-kit/html/eating-disorder-rehab/00-page-css.css (3,617 bytes)
```

This extracts WordPress-generated CSS rules for sticky positioning, layout, and spacing.

---

## Step 5: Create Next.js Page

Create the page component at `app/treatment/eating-disorder-rehab/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("eating-disorder-rehab");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/eating-disorder-rehab/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Eating Disorder Rehabilitation Centre - Paracelsus Recovery',
  description: 'Eating disorder treatment combining medical excellence, specialised therapies, and a team of 15+ experts, all dedicated to your unique needs. We help you rebuild your relationship with food and enjoyment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/eating-disorder-rehab/',
  },
  openGraph: {
    title: 'Eating Disorder Rehabilitation Centre - Paracelsus Recovery',
    description: 'Eating disorder treatment combining medical excellence, specialised therapies, and a team of 15+ experts, all dedicated to your unique needs.',
    url: 'https://paracelsus-recovery.com/treatment/eating-disorder-rehab/',
  },
};

export default function EatingDisorderRehabPage() {
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

---

## Step 6: Verify the Page

### 6.1 Start the dev server

```bash
npm run dev
```

### 6.2 Navigate to the page

```
http://localhost:3000/treatment/eating-disorder-rehab/
```

### 6.3 Verification Checklist

- [ ] Page loads without 500 errors
- [ ] Page title: "Eating Disorder Rehabilitation Centre - Paracelsus Recovery"
- [ ] Hero section displays correctly with heading and image
- [ ] Header hamburger menu opens when clicked
- [ ] All navigation links work
- [ ] Eating disorder types are listed (Anorexia, Bulimia, Orthorexia, etc.)
- [ ] Sticky image section works (image stays pinned while text scrolls)
- [ ] Treatment accordions are visible (Assessment, Diagnostics, Psychotherapy, etc.)
- [ ] Footer displays correctly
- [ ] "Talk to us" button opens contact modal
- [ ] No 404 errors in browser console for images
- [ ] All images load via the rewrites proxy

### 6.4 Test accessibility from homepage

1. Navigate to `http://localhost:3000/`
2. Click hamburger menu
3. Click "Conditions We Treat"
4. Click "Eating Disorders"
5. Click "VIEW ALL" - should navigate to `/treatment/eating-disorder-rehab/`

---

## Expected Console Warnings (Non-Critical)

These warnings are expected on localhost and don't affect functionality:

| Warning | Reason |
|---------|--------|
| `Failed to load HubSpot: Invalid portal id` | HubSpot forms don't work on localhost |
| `Meta pixel is unavailable` | Tracking pixels blocked on localhost |
| `[Fallback] Registering paracelsusApp` | Alpine.js fallback system working correctly |
| `pegasus-module already defined` | Custom element registered twice (harmless) |

---

## File Summary

| File | Size | Purpose |
|------|------|---------|
| `clone-kit/raw/eating-disorder-rehab.outer.html` | 368 KB | Raw captured HTML |
| `clone-kit/html/eating-disorder-rehab/00-page-css.css` | 3.6 KB | 33 wp-container CSS rules |
| `clone-kit/html/eating-disorder-rehab/01-header.html` | 87.5 KB | Header section |
| `clone-kit/html/eating-disorder-rehab/02-main.html` | 126 KB | Main content |
| `clone-kit/html/eating-disorder-rehab/03-footer.html` | 17.7 KB | Footer section |
| `clone-kit/html/eating-disorder-rehab/04-modal.html` | 35.5 KB | Modal content |
| `app/treatment/eating-disorder-rehab/page.tsx` | ~1.5 KB | Next.js page component |

---

## Troubleshooting

### Page shows 500 error
- Verify all 4 HTML files exist in `clone-kit/html/eating-disorder-rehab/`
- Check that `loadPageHtml("eating-disorder-rehab")` matches the folder name exactly

### Images not loading
- Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/` proxying to the WordPress site
- Check browser console for 404 errors

### Header not visible
- The splitter script should have removed `-translate-y-full` from static classes
- If header is still hidden, manually check `01-header.html` for this class

### Modal showing at bottom of page
- The splitter should have added `x-show="open" style="display: none;"` to modal-0
- If still visible, manually add these attributes to the modal container in `04-modal.html`

### Sticky images not working
- Verify `00-page-css.css` was created and contains sticky positioning rules
- Ensure the page component includes the `{pageCss && <style>...}` block

---

## Quick Reference Commands

```bash
# Full rebuild from scratch
cd paracelsus-clone

# 1. Capture HTML (use browser MCP)
# 2. Save to clone-kit/raw/eating-disorder-rehab.outer.html

# 3. Split HTML
node scripts/split-page-html.js eating-disorder-rehab

# 4. Extract CSS
node scripts/extract-page-css.js eating-disorder-rehab

# 5. Create page.tsx (copy template above)

# 6. Start dev server and verify
npm run dev
# Open http://localhost:3000/treatment/eating-disorder-rehab/
```

---

## Template for Other Pages

To rebuild a different page, replace `eating-disorder-rehab` with the new page slug and update:

1. The target URL in browser navigation
2. The page name in all script commands
3. The folder name in `loadPageHtml()`
4. The CSS path in `pageCssPath`
5. The metadata (title, description, canonical URL)
6. The component function name
