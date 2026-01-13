# Behavioural Addiction Treatment Page Rebuild

**Page URL:** https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/  
**Local URL:** http://localhost:3000/treatment/behavioural-addiction-treatment  
**Status:** Complete  
**Date:** 2026-01-13

---

## Overview

This document provides step-by-step instructions to rebuild the Behavioural Addiction Treatment page from the live WordPress site as a static Next.js page. Any agent can follow these instructions to reproduce the rebuild.

## Prerequisites

- Node.js installed
- PowerShell available (for HTML capture via Invoke-WebRequest)
- Next.js dev server can be started with `npm run dev`
- Workspace at `paracelsus-clone/`

---

## Step 1: Capture Raw HTML

Use PowerShell to fetch the fully-rendered HTML from the live WordPress site.

### 1.1 Fetch and save HTML

```powershell
cd paracelsus-clone
$response = Invoke-WebRequest -Uri "https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/" -UseBasicParsing
$response.Content | Out-File -FilePath "clone-kit/raw/behavioural-addiction-treatment.outer.html" -Encoding utf8
```

### 1.2 Verify file size

```powershell
(Get-Item "clone-kit/raw/behavioural-addiction-treatment.outer.html").Length
```

**Expected size:** ~273 KB

---

## Step 2: Split HTML into Sections

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js behavioural-addiction-treatment
```

**Expected output:**

```
Reading: .../clone-kit/raw/behavioural-addiction-treatment.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,424 bytes)
  → Fixed 9 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (98,450 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/behavioural-addiction-treatment
```

**Files created in `clone-kit/html/behavioural-addiction-treatment/`:**
- `01-header.html` - Header with navigation
- `02-main.html` - Main page content
- `03-footer.html` - Footer section
- `04-modal.html` - Contact modal

---

## Step 3: Extract Page-Specific CSS

Run the CSS extractor script:

```bash
node scripts/extract-page-css.js behavioural-addiction-treatment
```

**Expected output:**

```
Reading: .../clone-kit/raw/behavioural-addiction-treatment.outer.html
Found 27 wp-container rules
Wrote: .../clone-kit/html/behavioural-addiction-treatment/00-page-css.css (2,985 bytes)
```

This extracts WordPress-generated CSS rules for sticky positioning, layout, and spacing.

---

## Step 4: Create Next.js Page

Create the page component at `app/treatment/behavioural-addiction-treatment/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("behavioural-addiction-treatment");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/behavioural-addiction-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Behavioural Addiction Treatment - Paracelsus Recovery',
  description: 'We take a pragmatic approach to behavioural addiction treatment. Our bespoke treatment programmes provide you with moderation, boundaries and peace.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/',
  },
  openGraph: {
    title: 'Behavioural Addiction Treatment - Paracelsus Recovery',
    description: 'We take a pragmatic approach to behavioural addiction treatment. Our bespoke treatment programmes provide you with moderation, boundaries and peace.',
    url: 'https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/',
  },
};

export default function BehaviouralAddictionTreatmentPage() {
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

## Step 5: Verify Spacing Variables (Issue 25)

**Important:** This page has bullet lists in the "What are the signs?" section that require WordPress spacing CSS variables to be defined.

### 5.1 Check if spacing variables are defined

Open `app/critical-css.tsx` and verify the `globalsCss` constant includes:

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
/* WordPress block list styling - ensures proper bullets and spacing */
:root :where(.wp-block-list) {
  list-style-type: disc;
  margin-left: var(--wp--preset--spacing--20);
}
:root :where(.wp-block-list > li) {
  margin-bottom: var(--wp--preset--spacing--10);
}
```

### 5.2 If not present, add them

Add the CSS above to the beginning of the `globalsCss` constant in `app/critical-css.tsx`.

**Why this is needed:** The page has a "What are the signs?" accordion section containing a `<ul class="wp-block-list">` bullet list. Without the spacing variables defined, the list items appear with no vertical spacing between them.

---

## Step 6: Verify the Page

### 6.1 Start the dev server

```bash
npm run dev
```

### 6.2 Navigate to the page

```
http://localhost:3000/treatment/behavioural-addiction-treatment
```

### 6.3 Verification Checklist

- [ ] Page loads without 500 errors (should return 200 OK, ~719 KB)
- [ ] Page title: "Behavioural Addiction Treatment - Paracelsus Recovery"
- [ ] Hero section displays correctly with heading
- [ ] Header hamburger menu opens when clicked
- [ ] All navigation links work
- [ ] Behavioural addiction types are listed:
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
- [ ] "What are the signs?" accordion opens and bullet list has proper spacing (1rem between items)
- [ ] Treatment accordions are visible (Assessment, Diagnostics, Psychotherapy, etc.)
- [ ] Footer displays correctly
- [ ] "Talk to us" button opens contact modal
- [ ] No 404 errors in browser console for images
- [ ] All 9 images load via the rewrites proxy

### 6.4 Test accessibility from homepage

1. Navigate to `http://localhost:3000/`
2. Click hamburger menu
3. Click "Conditions We Treat"
4. Click "Behavioural Addictions"
5. Click "VIEW ALL" - should navigate to `/treatment/behavioural-addiction-treatment`

### 6.5 Verify bullet list spacing

1. Scroll to "What are the signs?" section
2. Click to expand the accordion
3. Verify bullet points have ~1rem (16px) spacing between items
4. Compare with live site: https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/

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
| `clone-kit/raw/behavioural-addiction-treatment.outer.html` | 273 KB | Raw captured HTML |
| `clone-kit/html/behavioural-addiction-treatment/00-page-css.css` | 3 KB | 27 wp-container CSS rules |
| `clone-kit/html/behavioural-addiction-treatment/01-header.html` | 86 KB | Header section |
| `clone-kit/html/behavioural-addiction-treatment/02-main.html` | 98 KB | Main content (9 images fixed) |
| `clone-kit/html/behavioural-addiction-treatment/03-footer.html` | 17.5 KB | Footer section |
| `clone-kit/html/behavioural-addiction-treatment/04-modal.html` | 10.3 KB | Modal content |
| `app/treatment/behavioural-addiction-treatment/page.tsx` | ~1.5 KB | Next.js page component |

---

## Troubleshooting

### Page shows 500 error
- Verify all 4 HTML files exist in `clone-kit/html/behavioural-addiction-treatment/`
- Check that `loadPageHtml("behavioural-addiction-treatment")` matches the folder name exactly

### Images not loading
- Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/` proxying to the WordPress site
- Check browser console for 404 errors

### Header not visible
- The splitter script should have removed `-translate-y-full` from static classes
- If header is still hidden, manually check `01-header.html` for this class

### Bullet list items have no spacing
- **Most common issue:** WordPress spacing CSS variables are not defined
- Check `app/critical-css.tsx` for `--wp--preset--spacing--10: 1rem;`
- See Issue 25 in page-rebuild-guide.md for the full fix

### Sticky images not working
- Verify `00-page-css.css` was created and contains sticky positioning rules
- Ensure the page component includes the `{pageCss && <style>...}` block

---

## Quick Reference Commands

```bash
# Full rebuild from scratch
cd paracelsus-clone

# 1. Capture HTML
powershell -Command "$r = Invoke-WebRequest -Uri 'https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/' -UseBasicParsing; $r.Content | Out-File -FilePath 'clone-kit/raw/behavioural-addiction-treatment.outer.html' -Encoding utf8"

# 2. Split HTML
node scripts/split-page-html.js behavioural-addiction-treatment

# 3. Extract CSS
node scripts/extract-page-css.js behavioural-addiction-treatment

# 4. Create page.tsx (copy template above)
# Create: app/treatment/behavioural-addiction-treatment/page.tsx

# 5. Verify spacing variables in critical-css.tsx (see Step 5)

# 6. Start dev server and verify
npm run dev
# Open http://localhost:3000/treatment/behavioural-addiction-treatment
```

---

## Template for Other Pages

To rebuild a different page, replace `behavioural-addiction-treatment` with the new page slug and update:

1. The target URL in the PowerShell capture command
2. The page name in all script commands
3. The folder name in `loadPageHtml()`
4. The CSS path in `pageCssPath`
5. The metadata (title, description, canonical URL)
6. The component function name

---

## Related Issues

- **Issue 24:** WordPress block list bullet points not properly formatted
- **Issue 25:** WordPress spacing variables not defined

Both issues must be resolved in `app/critical-css.tsx` for bullet lists to display correctly.
