# Functional Medicine Treatment Page Rebuild

**Page URL:** https://paracelsus-recovery.com/functional-medicine-treatment/  
**Local URL:** http://localhost:3000/functional-medicine-treatment  
**Status:** Complete  
**Date:** 2026-01-13

---

## Overview

This document provides step-by-step instructions to rebuild the Functional Medicine Treatment page from the live WordPress site as a static Next.js page. Any agent can follow these instructions to reproduce the rebuild.

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
$response = Invoke-WebRequest -Uri "https://paracelsus-recovery.com/functional-medicine-treatment/" -UseBasicParsing
$response.Content | Out-File -FilePath "clone-kit/raw/functional-medicine-treatment.outer.html" -Encoding utf8
```

### 1.2 Verify file size

```powershell
(Get-Item "clone-kit/raw/functional-medicine-treatment.outer.html").Length
```

**Expected size:** ~700 KB

---

## Step 2: Split HTML into Sections

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js functional-medicine-treatment
```

**Expected output:**

```
Reading: .../clone-kit/raw/functional-medicine-treatment.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,087 bytes)
  → Fixed 35 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (92,240 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/functional-medicine-treatment
```

**Files created in `clone-kit/html/functional-medicine-treatment/`:**
- `01-header.html` - Header with navigation
- `02-main.html` - Main page content
- `03-footer.html` - Footer section
- `04-modal.html` - Contact modal

---

## Step 3: Extract Page-Specific CSS

Run the CSS extractor script:

```bash
node scripts/extract-page-css.js functional-medicine-treatment
```

**Expected output:**

```
Reading: .../clone-kit/raw/functional-medicine-treatment.outer.html
Found 18 wp-container rules
Wrote: .../clone-kit/html/functional-medicine-treatment/00-page-css.css (2,071 bytes)
```

This extracts WordPress-generated CSS rules for sticky positioning, layout, and spacing.

---

## Step 4: Create Next.js Page

Create the page component at `app/functional-medicine-treatment/page.tsx`:

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
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("functional-medicine-treatment");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/functional-medicine-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Functional Medicine - Paracelsus Recovery',
  description: 'At Paracelsus Recovery, functional medicine is at the heart of all our treatment programmes. The aim of functional medicine is to identify and address the root cause of disease and restore health through personalised, holistic treatment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/functional-medicine-treatment/',
  },
  openGraph: {
    title: 'Functional Medicine - Paracelsus Recovery',
    description: 'At Paracelsus Recovery, functional medicine is at the heart of all our treatment programmes. The aim of functional medicine is to identify and address the root cause of disease and restore health through personalised, holistic treatment.',
    url: 'https://paracelsus-recovery.com/functional-medicine-treatment/',
  },
};

export default function FunctionalMedicineTreatmentPage() {
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

## Step 5: Verify the Page

### 5.1 Start the dev server

```bash
npm run dev
```

### 5.2 Navigate to the page

```
http://localhost:3000/functional-medicine-treatment
```

### 5.3 Verification Checklist

- [ ] Page loads without 500 errors (should return 200 OK, ~700 KB)
- [ ] Page title: "Functional Medicine - Paracelsus Recovery"
- [ ] Hero section displays "Functional Medicine Treatment" heading
- [ ] Header hamburger menu opens when clicked
- [ ] All navigation links work
- [ ] FAQ sections are present and expandable:
  - What is functional medicine?
  - What is functional medicine helpful for?
  - Is functional medicine evidence-based?
- [ ] "Latest news and insight" section displays with press articles carousel
- [ ] Footer displays correctly with all navigation sections
- [ ] "Talk to us" button opens contact modal
- [ ] No 404 errors in browser console for images
- [ ] All 35 images load via the rewrites proxy

### 5.4 Test accessibility from homepage

1. Navigate to `http://localhost:3000/`
2. Click hamburger menu
3. Click "Types of Therapies"
4. Click "Functional Medicine"
5. Should navigate to `/functional-medicine-treatment`

Alternative path:
1. Click "Types of Therapies"
2. Expand "Functional Medicine" submenu
3. Click "VIEW ALL" - should navigate to `/functional-medicine-treatment`

### 5.5 Verify with PowerShell (headless check)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/functional-medicine-treatment" -UseBasicParsing -TimeoutSec 30
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content Length: $($response.Content.Length)"
if ($response.Content -match "Functional Medicine") { Write-Host "✓ Found: Functional Medicine heading" }
if ($response.Content -match "What is functional medicine") { Write-Host "✓ Found: FAQ section" }
if ($response.Content -match "page-header") { Write-Host "✓ Found: Header" }
if ($response.Content -match "site-footer") { Write-Host "✓ Found: Footer" }
if ($response.Content -match "Latest news and insight") { Write-Host "✓ Found: Latest news section" }
```

**Expected output:**
```
Status: 200
Content Length: 699766
✓ Found: Functional Medicine heading
✓ Found: FAQ section
✓ Found: Header
✓ Found: Footer
✓ Found: Latest news section
```

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
| `clone-kit/raw/functional-medicine-treatment.outer.html` | ~700 KB | Raw captured HTML |
| `clone-kit/html/functional-medicine-treatment/00-page-css.css` | 2 KB | 18 wp-container CSS rules |
| `clone-kit/html/functional-medicine-treatment/01-header.html` | 86 KB | Header section |
| `clone-kit/html/functional-medicine-treatment/02-main.html` | 92 KB | Main content (35 images fixed) |
| `clone-kit/html/functional-medicine-treatment/03-footer.html` | 17.5 KB | Footer section |
| `clone-kit/html/functional-medicine-treatment/04-modal.html` | 10.3 KB | Modal content |
| `app/functional-medicine-treatment/page.tsx` | ~1.5 KB | Next.js page component |

---

## Troubleshooting

### Page shows 500 error
- Verify all 4 HTML files exist in `clone-kit/html/functional-medicine-treatment/`
- Check that `loadPageHtml("functional-medicine-treatment")` matches the folder name exactly

### Images not loading
- Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/` proxying to the WordPress site
- Check browser console for 404 errors

### Header not visible
- The splitter script should have removed `-translate-y-full` from static classes
- If header is still hidden, manually check `01-header.html` for this class

### FAQ accordions not expanding
- Alpine.js fallback registration should handle this
- Check browser console for Alpine.js errors
- Verify `layout.tsx` includes the accordion component registration

### Sticky images not working
- Verify `00-page-css.css` was created and contains sticky positioning rules
- Ensure the page component includes the `{pageCss && <style>...}` block
- Check `app/critical-css.tsx` for the global `.is-position-sticky` rule

---

## Quick Reference Commands

```bash
# Full rebuild from scratch
cd paracelsus-clone

# 1. Capture HTML
powershell -Command "$r = Invoke-WebRequest -Uri 'https://paracelsus-recovery.com/functional-medicine-treatment/' -UseBasicParsing; $r.Content | Out-File -FilePath 'clone-kit/raw/functional-medicine-treatment.outer.html' -Encoding utf8"

# 2. Split HTML
node scripts/split-page-html.js functional-medicine-treatment

# 3. Extract CSS
node scripts/extract-page-css.js functional-medicine-treatment

# 4. Create page.tsx (copy template above)
# Create: app/functional-medicine-treatment/page.tsx

# 5. Start dev server and verify
npm run dev
# Open http://localhost:3000/functional-medicine-treatment
```

---

## Template for Other Pages

To rebuild a different page, replace `functional-medicine-treatment` with the new page slug and update:

1. The target URL in the PowerShell capture command
2. The page name in all script commands
3. The folder name in `loadPageHtml()`
4. The CSS path in `pageCssPath`
5. The metadata (title, description, canonical URL)
6. The component function name

---

## Page Content Reference

This page contains the following sections:

1. **Hero Section**
   - "Types of therapy" eyebrow text
   - "Functional Medicine Treatment" heading
   
2. **FAQ Accordions**
   - "What is functional medicine?" - Explanation of functional medicine approach
   - "What is functional medicine helpful for?" - Benefits and applications
   - "Is functional medicine evidence-based?" - Research and evidence

3. **Sharing Insight Section**
   - "Latest news and insight" heading
   - Press articles carousel (MailOnline, The Guardian, The Times, etc.)
   - Links to Conditions, Treatments, Hospitality, Team

4. **Footer**
   - Standard site footer with navigation sections
   - Treatment, Information, Connect columns
   - Social media links

---

## Navigation Paths

The page is accessible via these navigation paths from the homepage:

| Path | Steps |
|------|-------|
| Types of Therapies → Functional Medicine | Click menu → Types of Therapies → Functional Medicine heading |
| Types of Therapies → Functional Medicine → VIEW ALL | Click menu → Types of Therapies → Expand Functional Medicine → VIEW ALL |

The navigation links already exist in the header HTML files for all pages, pointing to `/functional-medicine-treatment/`.
