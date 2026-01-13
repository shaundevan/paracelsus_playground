# Holistic & Complementary Therapies Page Rebuild

**Page URL:** https://paracelsus-recovery.com/holistic-complementary-therapies/  
**Local URL:** http://localhost:3000/holistic-complementary-therapies  
**Status:** Complete  
**Date:** 2026-01-13

---

## Overview

This document provides step-by-step instructions to rebuild the Holistic & Complementary Therapies page from the live WordPress site as a static Next.js page. Any agent can follow these instructions to reproduce the rebuild.

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
Invoke-WebRequest -Uri "https://paracelsus-recovery.com/holistic-complementary-therapies/" -OutFile "clone-kit/raw/holistic-complementary-therapies.outer.html"
```

### 1.2 Verify file size

```powershell
(Get-Item "clone-kit/raw/holistic-complementary-therapies.outer.html").Length
```

**Expected size:** ~207 KB

---

## Step 2: Split HTML into Sections

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js holistic-complementary-therapies
```

**Expected output:**

```
Reading: .../clone-kit/raw/holistic-complementary-therapies.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,042 bytes)
  → Fixed 4 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (41,530 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/holistic-complementary-therapies
```

**Files created in `clone-kit/html/holistic-complementary-therapies/`:**
- `01-header.html` - Header with navigation
- `02-main.html` - Main page content
- `03-footer.html` - Footer section
- `04-modal.html` - Contact modal

---

## Step 3: Extract Page-Specific CSS

Run the CSS extractor script:

```bash
node scripts/extract-page-css.js holistic-complementary-therapies
```

**Expected output:**

```
Reading: .../clone-kit/raw/holistic-complementary-therapies.outer.html
Found 30 wp-container rules
Wrote: .../clone-kit/html/holistic-complementary-therapies/00-page-css.css (3,237 bytes)
```

This extracts WordPress-generated CSS rules for sticky positioning, layout, and spacing.

---

## Step 4: Create Next.js Page

Create the page component at `app/holistic-complementary-therapies/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("holistic-complementary-therapies");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/holistic-complementary-therapies/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Holistic & Complementary Therapies - Paracelsus Recovery',
  description: 'Explore our holistic and complementary therapies including yoga, massage, acupuncture, breathwork, meditation, and more as part of our comprehensive treatment approach.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/holistic-complementary-therapies/',
  },
  openGraph: {
    title: 'Holistic & Complementary Therapies - Paracelsus Recovery',
    description: 'Explore our holistic and complementary therapies including yoga, massage, acupuncture, breathwork, meditation, and more as part of our comprehensive treatment approach.',
    url: 'https://paracelsus-recovery.com/holistic-complementary-therapies/',
  },
};

export default function HolisticComplementaryTherapiesPage() {
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
http://localhost:3000/holistic-complementary-therapies
```

### 5.3 Verification Checklist

- [ ] Page loads without 500 errors (should return 200 OK, ~595 KB)
- [ ] Page title: "Holistic & Complementary Therapies - Paracelsus Recovery"
- [ ] Hero section displays "Holistic Treatments & Complementary Therapies" heading
- [ ] Subheading: "Nourishing your mind and body"
- [ ] Header hamburger menu opens when clicked
- [ ] All navigation links work
- [ ] Main content paragraph describes complementary therapies approach
- [ ] Footer displays correctly with all navigation sections
- [ ] "Talk to us" button opens contact modal
- [ ] No 404 errors in browser console for images
- [ ] All 4 images load via the rewrites proxy

### 5.4 Test accessibility from homepage

1. Navigate to `http://localhost:3000/`
2. Click hamburger menu
3. Click "Types of Therapies"
4. Click "Holistic & Complementary Therapies"
5. Should navigate to `/holistic-complementary-therapies`

Alternative path:
1. Click "Types of Therapies"
2. Expand "Holistic & Complementary Therapies" submenu
3. Click "VIEW ALL" - should navigate to `/holistic-complementary-therapies`

### 5.5 Verify with PowerShell (headless check)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/holistic-complementary-therapies" -UseBasicParsing -TimeoutSec 30
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content Length: $($response.Content.Length)"
if ($response.Content -match "Holistic Treatments") { Write-Host "✓ Found: Holistic Treatments heading" }
if ($response.Content -match "Nourishing your mind and body") { Write-Host "✓ Found: Subheading" }
if ($response.Content -match "page-header") { Write-Host "✓ Found: Header" }
if ($response.Content -match "site-footer") { Write-Host "✓ Found: Footer" }
if ($response.Content -match "complementary therapies") { Write-Host "✓ Found: Complementary therapies content" }
```

**Expected output:**
```
Status: 200
Content Length: 595380
✓ Found: Holistic Treatments heading
✓ Found: Subheading
✓ Found: Header
✓ Found: Footer
✓ Found: Complementary therapies content
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
| `clone-kit/raw/holistic-complementary-therapies.outer.html` | 207 KB | Raw captured HTML |
| `clone-kit/html/holistic-complementary-therapies/00-page-css.css` | 3.2 KB | 30 wp-container CSS rules |
| `clone-kit/html/holistic-complementary-therapies/01-header.html` | 86 KB | Header section |
| `clone-kit/html/holistic-complementary-therapies/02-main.html` | 42 KB | Main content (4 images fixed) |
| `clone-kit/html/holistic-complementary-therapies/03-footer.html` | 17.5 KB | Footer section |
| `clone-kit/html/holistic-complementary-therapies/04-modal.html` | 10.3 KB | Modal content |
| `app/holistic-complementary-therapies/page.tsx` | ~1.5 KB | Next.js page component |

---

## Troubleshooting

### Page shows 500 error
- Verify all 4 HTML files exist in `clone-kit/html/holistic-complementary-therapies/`
- Check that `loadPageHtml("holistic-complementary-therapies")` matches the folder name exactly

### Images not loading
- Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/` proxying to the WordPress site
- Check browser console for 404 errors

### Header not visible
- The splitter script should have removed `-translate-y-full` from static classes
- If header is still hidden, manually check `01-header.html` for this class

### Sticky sections not working
- Verify `00-page-css.css` was created and contains sticky positioning rules
- Ensure the page component includes the `{pageCss && <style>...}` block
- Check `app/critical-css.tsx` for the global `.is-position-sticky` rule

---

## Quick Reference Commands

```bash
# Full rebuild from scratch
cd paracelsus-clone

# 1. Capture HTML
powershell -Command "Invoke-WebRequest -Uri 'https://paracelsus-recovery.com/holistic-complementary-therapies/' -OutFile 'clone-kit/raw/holistic-complementary-therapies.outer.html'"

# 2. Split HTML
node scripts/split-page-html.js holistic-complementary-therapies

# 3. Extract CSS
node scripts/extract-page-css.js holistic-complementary-therapies

# 4. Create page.tsx (copy template above)
# Create: app/holistic-complementary-therapies/page.tsx

# 5. Start dev server and verify
npm run dev
# Open http://localhost:3000/holistic-complementary-therapies
```

---

## Template for Other Pages

To rebuild a different page, replace `holistic-complementary-therapies` with the new page slug and update:

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
   - "Holistic Treatments & Complementary Therapies" heading (h1)
   - "Nourishing your mind and body" subheading
   
2. **Main Content**
   - Description of complementary therapies approach
   - Explains how imbalances manifest physically and emotionally
   - Describes bespoke approach integrating massage, acupuncture, mindfulness
   - Mentions Swiss medical excellence

3. **Footer**
   - Standard site footer with navigation sections
   - Treatment, Information, Connect columns
   - Social media links

---

## Navigation Paths

The page is accessible via these navigation paths from the homepage:

| Path | Steps |
|------|-------|
| Types of Therapies → Holistic & Complementary Therapies | Click menu → Types of Therapies → Holistic & Complementary Therapies heading |
| Types of Therapies → Holistic & Complementary Therapies → VIEW ALL | Click menu → Types of Therapies → Expand Holistic & Complementary Therapies → VIEW ALL |

The navigation links already exist in the header HTML files for all pages, pointing to `/holistic-complementary-therapies/`.

---

## One-Shot Rebuild Command Sequence

For agents: Execute these commands in order to rebuild the page from scratch:

```bash
# Navigate to workspace
cd paracelsus-clone

# Step 1: Capture HTML from live site
powershell -Command "Invoke-WebRequest -Uri 'https://paracelsus-recovery.com/holistic-complementary-therapies/' -OutFile 'clone-kit/raw/holistic-complementary-therapies.outer.html'"

# Step 2: Split HTML into sections
node scripts/split-page-html.js holistic-complementary-therapies

# Step 3: Extract page-specific CSS
node scripts/extract-page-css.js holistic-complementary-therapies

# Step 4: Create page component (use Write tool with the TypeScript code from Step 4 section above)
# Target: app/holistic-complementary-therapies/page.tsx

# Step 5: Verify (if dev server running)
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/holistic-complementary-therapies' -UseBasicParsing -TimeoutSec 30 | Select-Object StatusCode, @{N='Length';E={$_.Content.Length}}"
```

Expected verification output: `StatusCode: 200, Length: ~595000`
