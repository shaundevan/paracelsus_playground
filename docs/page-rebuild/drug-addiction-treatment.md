# Drug Addiction Treatment Page Rebuild

This document provides step-by-step instructions to rebuild the drug-addiction-treatment page from scratch. An agent can follow these instructions to one-shot rebuild this page.

## Page Information

| Property | Value |
|----------|-------|
| **Source URL** | https://paracelsus-recovery.com/treatment/drug-addiction-treatment/ |
| **Local Route** | `/treatment/drug-addiction-treatment` |
| **Page Type** | Treatment category page (light background) |
| **Navigation Path** | Homepage → Menu → Conditions We Treat → Drug Addiction → VIEW ALL |

## Prerequisites

- Node.js installed
- Working directory: `paracelsus-clone/`
- Dev server can be started with `npm run dev`

## Step 1: Capture Raw HTML

Run this PowerShell command to download the page HTML:

```powershell
Invoke-WebRequest -Uri "https://paracelsus-recovery.com/treatment/drug-addiction-treatment/" -OutFile "clone-kit/raw/drug-addiction-treatment.outer.html"
```

**Expected Result:** File created at `clone-kit/raw/drug-addiction-treatment.outer.html`

## Step 2: Split the HTML

Run the splitter script:

```bash
node scripts/split-page-html.js drug-addiction-treatment
```

**Expected Output:**
```
Reading: .../clone-kit/raw/drug-addiction-treatment.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,324 bytes)
  → Fixed 40 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (167,963 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/drug-addiction-treatment
```

**Files Created:**
- `clone-kit/html/drug-addiction-treatment/01-header.html`
- `clone-kit/html/drug-addiction-treatment/02-main.html`
- `clone-kit/html/drug-addiction-treatment/03-footer.html`
- `clone-kit/html/drug-addiction-treatment/04-modal.html`

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
node scripts/extract-page-css.js drug-addiction-treatment
```

**Expected Output:**
```
Reading: .../clone-kit/raw/drug-addiction-treatment.outer.html
Found 28 wp-container rules
Wrote: .../clone-kit/html/drug-addiction-treatment/00-page-css.css (3,092 bytes)
```

**File Created:**
- `clone-kit/html/drug-addiction-treatment/00-page-css.css`

## Step 4: Create Next.js Page

Create the file `app/treatment/drug-addiction-treatment/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("drug-addiction-treatment");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/drug-addiction-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Drug Addiction Treatment Centre - Paracelsus Recovery',
  description: 'Luxury drug addiction treatment combining medical excellence, specialised therapies, and a team of 15+ experts. We treat cocaine, opioids, methamphetamine, cannabis, and more.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/drug-addiction-treatment/',
  },
  openGraph: {
    title: 'Drug Addiction Treatment Centre - Paracelsus Recovery',
    description: 'Luxury drug addiction treatment combining medical excellence, specialised therapies, and a team of 15+ experts.',
    url: 'https://paracelsus-recovery.com/treatment/drug-addiction-treatment/',
  },
};

export default function DrugAddictionTreatmentPage() {
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

## Step 5: Verify the Page

1. **Start/restart the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the page loads:**
   ```powershell
   $response = Invoke-WebRequest -Uri "http://localhost:3000/treatment/drug-addiction-treatment" -UseBasicParsing
   Write-Host "Status: $($response.StatusCode), Size: $($response.Content.Length)"
   ```
   
   **Expected:** `Status: 200, Size: ~867000`

3. **Verify key content exists:**
   ```powershell
   $content = (Invoke-WebRequest -Uri "http://localhost:3000/treatment/drug-addiction-treatment" -UseBasicParsing).Content
   Write-Host "Has header: $($content.Contains('page-header'))"
   Write-Host "Has Drug Addiction: $($content.Contains('Drug Addiction'))"
   Write-Host "Has Cocaine: $($content.Contains('Cocaine'))"
   Write-Host "Has Opioids: $($content.Contains('Opioid'))"
   ```
   
   **Expected:** All `True`

4. **Verify homepage navigation:**
   ```powershell
   $homepage = (Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing).Content
   Write-Host "Has link: $($homepage.Contains('/treatment/drug-addiction-treatment/'))"
   ```
   
   **Expected:** `True`

## Verification Checklist

- [ ] Page loads with 200 status code
- [ ] Page size is approximately 867 KB
- [ ] Header icons visible (dark on light background)
- [ ] Hamburger menu opens with full navigation
- [ ] Hero section displays correctly
- [ ] All drug types listed (Cocaine, Nicotine, GHB, Methamphetamine, Ketamine, Cannabis, Kratom, Opioids, etc.)
- [ ] Treatment accordions work
- [ ] Sticky image sections function correctly (if present)
- [ ] All images load via rewrites proxy (no 404s)
- [ ] Modal form works when "Talk to us" is clicked
- [ ] Footer displays correctly
- [ ] Accessible from homepage via Conditions We Treat > Drug Addiction

## Files Summary

| File | Purpose | Size |
|------|---------|------|
| `clone-kit/raw/drug-addiction-treatment.outer.html` | Raw captured HTML | ~280 KB |
| `clone-kit/html/drug-addiction-treatment/00-page-css.css` | Page-specific CSS | 3.1 KB |
| `clone-kit/html/drug-addiction-treatment/01-header.html` | Header section | 86 KB |
| `clone-kit/html/drug-addiction-treatment/02-main.html` | Main content | 168 KB |
| `clone-kit/html/drug-addiction-treatment/03-footer.html` | Footer section | 17.5 KB |
| `clone-kit/html/drug-addiction-treatment/04-modal.html` | Modal content | 10.3 KB |
| `app/treatment/drug-addiction-treatment/page.tsx` | Next.js page | ~1.5 KB |

## Troubleshooting

### Issue: Page returns 404
- Ensure the directory structure is correct: `app/treatment/drug-addiction-treatment/page.tsx`
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

## Related Documentation

- Main rebuild guide: `docs/page-rebuild-guide.md`
- Similar pages: `docs/page-rebuild/eating-disorder-rehab.md`, `docs/page-rebuild/chronic-conditions-recovery.md`
