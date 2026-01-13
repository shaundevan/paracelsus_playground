# Prescription Drug Addiction Treatment Page Rebuild

This document provides step-by-step instructions to rebuild the prescription-drug-addiction-treatment page from scratch. An agent can follow these instructions to one-shot rebuild this page.

## Page Information

| Property | Value |
|----------|-------|
| **Source URL** | https://paracelsus-recovery.com/treatment/prescription-drug-addiction-treatment/ |
| **Local Route** | `/treatment/prescription-drug-addiction-treatment` |
| **Page Type** | Treatment category page (light background) |
| **Navigation Path** | Homepage → Menu → Conditions We Treat → Dependencies & Addictions → Prescription Drug Addiction |

## Prerequisites

- Node.js installed
- Working directory: `paracelsus-clone/`
- Dev server can be started with `npm run dev`

## Step 1: Capture Raw HTML

Run this PowerShell command to download the page HTML:

```powershell
Invoke-WebRequest -Uri "https://paracelsus-recovery.com/treatment/prescription-drug-addiction-treatment/" -OutFile "clone-kit/raw/prescription-drug-addiction-treatment.outer.html"
```

**Expected Result:** File created at `clone-kit/raw/prescription-drug-addiction-treatment.outer.html` (approximately 320 KB)

## Step 2: Split the HTML

Run the splitter script:

```bash
node scripts/split-page-html.js prescription-drug-addiction-treatment
```

**Expected Output:**
```
Reading: .../clone-kit/raw/prescription-drug-addiction-treatment.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (87,134 bytes)
  → Fixed 40 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (155,782 bytes)
  ✓ 03-footer.html (17,668 bytes)
  ✓ 04-modal.html (35,279 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/prescription-drug-addiction-treatment
```

**Files Created:**
- `clone-kit/html/prescription-drug-addiction-treatment/01-header.html`
- `clone-kit/html/prescription-drug-addiction-treatment/02-main.html`
- `clone-kit/html/prescription-drug-addiction-treatment/03-footer.html`
- `clone-kit/html/prescription-drug-addiction-treatment/04-modal.html`

**Automatic Fixes Applied by Script:**
- URL rewriting (absolute → relative)
- Alpine.js attribute fixes for header
- Lazy-loaded image conversion (data-src → src)
- Modal visibility fix (hidden by default)
- Flickity slider cleanup (if present)
- Transition class removal (opacity-0 translate-y-24)

## Step 3: Extract Page-Specific CSS

Run the CSS extraction script:

```bash
node scripts/extract-page-css.js prescription-drug-addiction-treatment
```

**Expected Output:**
```
Reading: .../clone-kit/raw/prescription-drug-addiction-treatment.outer.html
Found 27 wp-container rules
Wrote: .../clone-kit/html/prescription-drug-addiction-treatment/00-page-css.css (2,847 bytes)
```

**File Created:**
- `clone-kit/html/prescription-drug-addiction-treatment/00-page-css.css`

## Step 4: Ensure Global Block List Styling

**IMPORTANT:** This page contains WordPress block lists (`<ul class="wp-block-list">`) that require specific CSS styling. Verify that `app/globals.css` includes:

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

If this CSS is missing, add it to `app/globals.css`. This fixes the "What are the signs of prescription drug addiction?" bullet list formatting.

## Step 5: Create Next.js Page

Create the file `app/treatment/prescription-drug-addiction-treatment/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("prescription-drug-addiction-treatment");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/prescription-drug-addiction-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Prescription Drug Addiction Treatment - Paracelsus Recovery',
  description: 'Our approach to prescription drug addiction treatment is completely non-judgmental and pragmatic, finding the underlying root causes and treating dependency.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/prescription-drug-addiction-treatment/',
  },
  openGraph: {
    title: 'Prescription Drug Addiction Treatment - Paracelsus Recovery',
    description: 'Our approach to prescription drug addiction treatment is completely non-judgmental and pragmatic, finding the underlying root causes and treating dependency.',
    url: 'https://paracelsus-recovery.com/treatment/prescription-drug-addiction-treatment/',
  },
};

export default function PrescriptionDrugAddictionTreatmentPage() {
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

## Step 6: Verify the Page

1. **Start/restart the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the page loads:**
   ```powershell
   $response = Invoke-WebRequest -Uri "http://localhost:3000/treatment/prescription-drug-addiction-treatment" -UseBasicParsing
   Write-Host "Status: $($response.StatusCode), Size: $($response.Content.Length)"
   ```
   
   **Expected:** `Status: 200, Size: ~800000`

3. **Verify key content exists:**
   ```powershell
   $content = (Invoke-WebRequest -Uri "http://localhost:3000/treatment/prescription-drug-addiction-treatment" -UseBasicParsing).Content
   Write-Host "Has header: $($content.Contains('page-header'))"
   Write-Host "Has Prescription Drug: $($content.Contains('Prescription Drug'))"
   Write-Host "Has Opioid-based Painkillers: $($content.Contains('Opioid-based Painkillers'))"
   Write-Host "Has Benzodiazepines: $($content.Contains('Benzodiazepines'))"
   Write-Host "Has wp-block-list: $($content.Contains('wp-block-list'))"
   ```
   
   **Expected:** All `True`

4. **Verify homepage navigation:**
   ```powershell
   $homepage = (Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing).Content
   Write-Host "Has link: $($homepage.Contains('/treatment/prescription-drug-addiction-treatment/'))"
   ```
   
   **Expected:** `True`

## Verification Checklist

- [ ] Page loads with 200 status code
- [ ] Page size is approximately 800 KB
- [ ] Header icons visible (dark on light background)
- [ ] Hamburger menu opens with full navigation
- [ ] Hero section displays "Prescription Drug Addiction Treatment" heading
- [ ] All prescription drug types listed:
  - [ ] Opioid-based Painkillers
  - [ ] Benzodiazepines
  - [ ] Stimulants
  - [ ] Sleep Medication
  - [ ] Muscle Relaxants
  - [ ] Gabapentin and Pregabalin
  - [ ] Antipsychotics
- [ ] "What are the signs?" section displays with properly formatted bullet list
- [ ] Bullet points have proper vertical spacing (not compressed)
- [ ] Treatment accordions work (expand/collapse)
- [ ] Sticky image sections function correctly (if present)
- [ ] All images load via rewrites proxy (no 404s)
- [ ] Modal form works when "Talk to us" is clicked
- [ ] Footer displays correctly
- [ ] Accessible from homepage via Conditions We Treat > Dependencies & Addictions > Prescription Drug Addiction

## Files Summary

| File | Purpose | Size |
|------|---------|------|
| `clone-kit/raw/prescription-drug-addiction-treatment.outer.html` | Raw captured HTML | ~320 KB |
| `clone-kit/html/prescription-drug-addiction-treatment/00-page-css.css` | Page-specific CSS | 2.8 KB |
| `clone-kit/html/prescription-drug-addiction-treatment/01-header.html` | Header section | 87 KB |
| `clone-kit/html/prescription-drug-addiction-treatment/02-main.html` | Main content | 156 KB |
| `clone-kit/html/prescription-drug-addiction-treatment/03-footer.html` | Footer section | 17.7 KB |
| `clone-kit/html/prescription-drug-addiction-treatment/04-modal.html` | Modal content | 35.3 KB |
| `app/treatment/prescription-drug-addiction-treatment/page.tsx` | Next.js page | ~1.5 KB |

## Troubleshooting

### Issue: Page returns 404
- Ensure the directory structure is correct: `app/treatment/prescription-drug-addiction-treatment/page.tsx`
- Restart the dev server after creating the page

### Issue: Images not loading
- Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/`
- Check browser console for 404 errors

### Issue: Text sections invisible
- The splitter script should have removed `opacity-0 translate-y-24` from static classes
- If still invisible, manually remove these classes from `02-main.html`

### Issue: Sticky sections not working
- Verify `00-page-css.css` was extracted and included in the page
- Check that `critical-css.tsx` has the `.is-position-sticky` rule

### Issue: Modal showing at bottom of page
- The splitter script should have added `x-show="open" style="display: none;"` to modal container
- If still visible, manually add these attributes to `04-modal.html`

### Issue: Bullet list items have no vertical spacing (Issue 24)

**Symptom:** The "What are the signs of prescription drug addiction?" section has bullet points that appear compressed with no spacing between items.

**Cause:** WordPress block lists require specific CSS that may be missing from `app/globals.css`.

**Fix:** Add this CSS to `app/globals.css`:

```css
/* WordPress block list styling - ensures proper bullets and spacing */
:root :where(.wp-block-list) {
  list-style-type: disc;
  margin-left: var(--wp--preset--spacing--20);
}
:root :where(.wp-block-list > li) {
  margin-bottom: var(--wp--preset--spacing--10);
}
```

**Verification:** After adding the CSS and refreshing, the bullet list items should have proper vertical spacing matching the live WordPress site.

## Page-Specific Notes

This page contains the following content sections:
1. **Hero section** - "Prescription Drug Addiction Treatment" heading with hero image
2. **Introduction** - Description of prescription drug dependency
3. **Types of prescription drugs** - Grid of drug categories with links
4. **"What are the signs?"** - Accordion with bullet list of symptoms (requires wp-block-list CSS fix)
5. **How we treat** - Sticky image section with treatment approach
6. **Treatment accordions** - Assessment, Diagnostics, Psychotherapy, Psychiatry, etc.
7. **CTA section** - "Need help? We're here for you."
8. **FAQ section** - Frequently asked questions

## Related Documentation

- Main rebuild guide: `docs/page-rebuild-guide.md`
- Issue 24 (Block List Styling): See `docs/page-rebuild-guide.md` under "Issue 24"
- Similar pages: 
  - `docs/page-rebuild/drug-addiction-treatment.md`
  - `docs/page-rebuild/eating-disorder-rehab.md`
  - `docs/page-rebuild/chronic-conditions-recovery.md`
