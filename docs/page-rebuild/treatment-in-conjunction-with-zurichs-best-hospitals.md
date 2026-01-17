# Treatment in Conjunction with Zurich's Best Hospitals Page Rebuild

**Page URL:** https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/  
**Local URL:** http://localhost:3000/treatment-in-conjunction-with-zurichs-best-hospitals  
**Status:** Complete  
**Date:** 2026-01-14

---

## Overview

This document provides step-by-step instructions to rebuild the "Treatment in Conjunction with Zurich's Best Hospitals" page from the live WordPress site as a static Next.js page. Any agent can follow these instructions to reproduce the rebuild.

This page describes Paracelsus Recovery's collaboration with Zurich's leading hospitals for medical treatment of various physical health conditions, including neurodegenerative disorders, cardiovascular conditions, hormonal imbalances, and more.

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
Invoke-WebRequest -Uri "https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/" -OutFile "clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html"
```

### 1.2 Verify file size

```powershell
(Get-Item "clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html").Length
```

**Expected size:** ~259 KB (265,540 bytes)

---

## Step 2: Split HTML into Sections

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js treatment-in-conjunction-with-zurichs-best-hospitals
```

**Expected output:**

```
Reading: .../clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,541 bytes)
  → Fixed 36 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (91,603 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals
```

**Files created in `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/`:**
- `01-header.html` - Header with navigation
- `02-main.html` - Main page content
- `03-footer.html` - Footer section
- `04-modal.html` - Contact modal

---

## Step 3: Extract Page-Specific CSS

Run the CSS extractor script:

```bash
node scripts/extract-page-css.js treatment-in-conjunction-with-zurichs-best-hospitals
```

**Expected output:**

```
Reading: .../clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html
Found 18 wp-container rules
Wrote: .../clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/00-page-css.css (2,094 bytes)
```

This extracts WordPress-generated CSS rules for sticky positioning, layout, and spacing.

---

## Step 4: Create Next.js Page

Create the page component at `app/treatment-in-conjunction-with-zurichs-best-hospitals/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("treatment-in-conjunction-with-zurichs-best-hospitals");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: "Treatment in Conjunction with Zurich's Best Hospitals - Paracelsus Recovery",
  description: "We work with Zurich's leading hospitals to address somatic and physical health conditions while providing comprehensive holistic support throughout your treatment.",
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/',
  },
  openGraph: {
    title: "Treatment in Conjunction with Zurich's Best Hospitals - Paracelsus Recovery",
    description: "We work with Zurich's leading hospitals to address somatic and physical health conditions while providing comprehensive holistic support throughout your treatment.",
    url: 'https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/',
  },
};

export default function ZurichHospitalsPage() {
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
http://localhost:3000/treatment-in-conjunction-with-zurichs-best-hospitals
```

### 5.3 Verification Checklist

- [ ] Page loads without 500 errors (should return 200 OK, ~699 KB)
- [ ] Page title: "Treatment in Conjunction with Zurich's Best Hospitals - Paracelsus Recovery"
- [ ] Hero section displays "Treatment in Conjunction with Zurich's Best Hospitals" heading
- [ ] Header hamburger menu opens when clicked
- [ ] All navigation links work
- [ ] Main content sections visible:
  - [ ] "What conditions do we treat in a hospital setting?"
  - [ ] "What does treatment involve?"
  - [ ] "What are the benefits?"
- [ ] Footer displays correctly with all navigation sections
- [ ] "Talk to us" button opens contact modal
- [ ] No 404 errors in browser console for images
- [ ] All 36 images load via the rewrites proxy

### 5.4 Test accessibility from homepage

1. Navigate to `http://localhost:3000/`
2. Click hamburger menu
3. Click "Types of Therapies"
4. Scroll down to find "Treatment in Conjunction with Zurich's Best Hospitals"
5. Click the link
6. Should navigate to `/treatment-in-conjunction-with-zurichs-best-hospitals`

### 5.5 Verify with PowerShell (headless check)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/treatment-in-conjunction-with-zurichs-best-hospitals" -UseBasicParsing -TimeoutSec 120 -MaximumRedirection 5
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content Length: $($response.Content.Length)"
if ($response.Content -match "Zurich") { Write-Host "✓ Found: Zurich" }
if ($response.Content -match "Best Hospitals") { Write-Host "✓ Found: Best Hospitals" }
if ($response.Content -match "What conditions do we treat") { Write-Host "✓ Found: What conditions section" }
if ($response.Content -match "What does treatment involve") { Write-Host "✓ Found: What does treatment involve section" }
if ($response.Content -match "What are the benefits") { Write-Host "✓ Found: What are the benefits section" }
if ($response.Content -match "page-header") { Write-Host "✓ Found: Header" }
if ($response.Content -match "site-footer") { Write-Host "✓ Found: Footer" }
```

**Expected output:**
```
Status: 200
Content Length: 699032
✓ Found: Zurich
✓ Found: Best Hospitals
✓ Found: What conditions section
✓ Found: What does treatment involve section
✓ Found: What are the benefits section
✓ Found: Header
✓ Found: Footer
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
| `clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html` | 259 KB | Raw captured HTML |
| `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/00-page-css.css` | 2 KB | 18 wp-container CSS rules |
| `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/01-header.html` | 86.5 KB | Header section |
| `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/02-main.html` | 91.6 KB | Main content (36 images fixed) |
| `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/03-footer.html` | 17.5 KB | Footer section |
| `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/04-modal.html` | 10.3 KB | Modal content |
| `app/treatment-in-conjunction-with-zurichs-best-hospitals/page.tsx` | ~1.8 KB | Next.js page component |

---

## Troubleshooting

### Page shows 500 error
- Verify all 4 HTML files exist in `clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/`
- Check that `loadPageHtml("treatment-in-conjunction-with-zurichs-best-hospitals")` matches the folder name exactly

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

### 308 Redirect error
- The page may redirect with/without trailing slash
- Use `-MaximumRedirection 5` in PowerShell to follow redirects
- Access the page without trailing slash: `/treatment-in-conjunction-with-zurichs-best-hospitals`

---

## Quick Reference Commands

```bash
# Full rebuild from scratch
cd paracelsus-clone

# 1. Capture HTML
powershell -Command "Invoke-WebRequest -Uri 'https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/' -OutFile 'clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html'"

# 2. Split HTML
node scripts/split-page-html.js treatment-in-conjunction-with-zurichs-best-hospitals

# 3. Extract CSS
node scripts/extract-page-css.js treatment-in-conjunction-with-zurichs-best-hospitals

# 4. Create page.tsx (copy template above)
# Create: app/treatment-in-conjunction-with-zurichs-best-hospitals/page.tsx

# 5. Start dev server and verify
npm run dev
# Open http://localhost:3000/treatment-in-conjunction-with-zurichs-best-hospitals
```

---

## Template for Other Pages

To rebuild a different page, replace `treatment-in-conjunction-with-zurichs-best-hospitals` with the new page slug and update:

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
   - "Treatment in Conjunction with Zurich's Best Hospitals" heading (h2)
   - Navigation tabs for the 3 main sections
   
2. **Main Content Sections**
   - **What conditions do we treat in a hospital setting?**
     - Lists neurodegenerative disorders, cardiovascular conditions, hormonal imbalances, skin issues, diabetes, sexual health concerns, post-surgery complications, etc.
     - Mentions partnership with top specialists in each field
   
   - **What does treatment involve?**
     - Describes holistic 360-degree approach
     - Lists modalities: medical, orthomolecular, psychological, TCM, functional medicine, physiotherapy, osteopathy
     - Complementary therapies: aromatherapy, herbal medicines, yoga, biofeedback, biochemical restoration, acupuncture, massage therapy, mindfulness, tai chi, qigong, nutrition supplementation
     - Live-in therapist support
   
   - **What are the benefits?**
     - Integrative medicine approach
     - Team of 15+ dedicated specialists
     - Addresses co-occurring conditions including substance abuse
     - Lifestyle modification support

3. **Latest News and Insight Section**
   - Press articles carousel (Financial Times, The Guardian, Tatler, etc.)

4. **Footer**
   - Standard site footer with navigation sections
   - Treatment, Information, Connect columns
   - Social media links

---

## Navigation Paths

The page is accessible via these navigation paths from the homepage:

| Path | Steps |
|------|-------|
| Types of Therapies → Treatment in Conjunction with Zurich's Best Hospitals | Click menu → Types of Therapies → Scroll to find "Treatment in Conjunction with Zurich's Best Hospitals" |

The navigation links already exist in the header HTML files for all pages, pointing to `/treatment-in-conjunction-with-zurichs-best-hospitals/`.

---

## One-Shot Rebuild Command Sequence

For agents: Execute these commands in order to rebuild the page from scratch:

```bash
# Navigate to workspace
cd paracelsus-clone

# Step 1: Capture HTML from live site
powershell -Command "Invoke-WebRequest -Uri 'https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/' -OutFile 'clone-kit/raw/treatment-in-conjunction-with-zurichs-best-hospitals.outer.html'"

# Step 2: Split HTML into sections
node scripts/split-page-html.js treatment-in-conjunction-with-zurichs-best-hospitals

# Step 3: Extract page-specific CSS
node scripts/extract-page-css.js treatment-in-conjunction-with-zurichs-best-hospitals

# Step 4: Create page component (use Write tool with the TypeScript code from Step 4 section above)
# Target: app/treatment-in-conjunction-with-zurichs-best-hospitals/page.tsx

# Step 5: Verify (if dev server running)
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/treatment-in-conjunction-with-zurichs-best-hospitals' -UseBasicParsing -TimeoutSec 120 -MaximumRedirection 5 | Select-Object StatusCode, @{N='Length';E={$_.Content.Length}}"
```

Expected verification output: `StatusCode: 200, Length: ~699000`

---

## Agent Instructions Summary

If you are an AI agent rebuilding this page:

1. **Capture**: Run PowerShell `Invoke-WebRequest` to download the page HTML
2. **Split**: Run `node scripts/split-page-html.js treatment-in-conjunction-with-zurichs-best-hospitals`
3. **Extract CSS**: Run `node scripts/extract-page-css.js treatment-in-conjunction-with-zurichs-best-hospitals`
4. **Create Page**: Write the TypeScript page component to `app/treatment-in-conjunction-with-zurichs-best-hospitals/page.tsx` using the template in Step 4
5. **Verify**: Make an HTTP request to the local page and confirm status 200 with ~699KB content

The page slug is: `treatment-in-conjunction-with-zurichs-best-hospitals`

All scripts are idempotent - you can safely re-run them if needed.
