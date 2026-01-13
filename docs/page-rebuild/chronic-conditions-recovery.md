# Chronic Conditions Recovery Page Rebuild

**Page URL:** https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/  
**Local URL:** http://localhost:3000/treatment/chronic-conditions-recovery/  
**Status:** Complete  
**Date:** 2026-01-13

---

## Overview

This document provides step-by-step instructions to rebuild the Chronic Conditions Recovery page from the live WordPress site as a static Next.js page. Any agent can follow these instructions to reproduce the rebuild.

## Prerequisites

- Node.js installed
- PowerShell or Chrome DevTools MCP (`cursor-browser-extension`) available
- Next.js dev server can be started with `npm run dev`
- Workspace at `paracelsus-clone/`

---

## Step 1: Capture Raw HTML

Use PowerShell or Chrome DevTools MCP to capture the fully-rendered HTML.

### Option A: PowerShell (Recommended - More Reliable)

```powershell
cd paracelsus-clone
$response = Invoke-WebRequest -Uri "https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/" -UseBasicParsing
$response.Content | Out-File -FilePath "clone-kit\raw\chronic-conditions-recovery.outer.html" -Encoding UTF8
```

### Option B: Chrome DevTools MCP

#### 1.1 Navigate to the page

```javascript
// MCP Tool: browser_navigate
{ "url": "https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/" }
```

#### 1.2 Scroll to trigger lazy loading

Execute these in sequence to ensure all lazy-loaded content is rendered:

```javascript
// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight / 3); return 'scrolled 1/3'; }" }

// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight * 2 / 3); return 'scrolled 2/3'; }" }

// MCP Tool: browser_evaluate
{ "function": "() => { window.scrollTo(0, document.body.scrollHeight); return 'scrolled to bottom'; }" }
```

#### 1.3 Capture the full HTML

```javascript
// MCP Tool: browser_evaluate
{ "function": "() => document.documentElement.outerHTML" }
```

Save output to `clone-kit/raw/chronic-conditions-recovery.outer.html`

**Expected size:** ~310 KB

---

## Step 2: Split HTML into Sections

Run the splitter script from the `paracelsus-clone` directory:

```bash
node scripts/split-page-html.js chronic-conditions-recovery
```

**Expected output:**

```
Reading: .../clone-kit/raw/chronic-conditions-recovery.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,670 bytes)
  → Fixed 29 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (135,196 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/chronic-conditions-recovery
```

**Files created in `clone-kit/html/chronic-conditions-recovery/`:**
- `01-header.html` - Header with navigation
- `02-main.html` - Main page content
- `03-footer.html` - Footer section
- `04-modal.html` - Contact modal

---

## Step 3: Extract Page-Specific CSS

Run the CSS extractor script:

```bash
node scripts/extract-page-css.js chronic-conditions-recovery
```

**Expected output:**

```
Reading: .../clone-kit/raw/chronic-conditions-recovery.outer.html
Found 34 wp-container rules
Wrote: .../clone-kit/html/chronic-conditions-recovery/00-page-css.css (3,729 bytes)
```

This extracts WordPress-generated CSS rules for sticky positioning, layout, and spacing.

---

## Step 4: Create Next.js Page

Create the page component at `app/treatment/chronic-conditions-recovery/page.tsx`:

```typescript
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("chronic-conditions-recovery");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/chronic-conditions-recovery/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Chronic Condition Recovery - Paracelsus Recovery',
  description: 'We have extensive experience in helping clients go through chronic condition recovery to restore their overall health and minimise the suffering that comes with various chronic health conditions. Our programmes can even lead to a total recovery.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/',
  },
  openGraph: {
    title: 'Chronic Condition Recovery - Paracelsus Recovery',
    description: 'Recovery clinic for chronic conditions. Our integrated approach addresses cellular, genetic and biochemical markers that will directly improve your pain and energy levels.',
    url: 'https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/',
  },
};

export default function ChronicConditionsRecoveryPage() {
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
http://localhost:3000/treatment/chronic-conditions-recovery/
```

### 5.3 Verification Checklist

- [ ] Page loads with 200 status (no 500 errors)
- [ ] Page title: "Chronic Condition Recovery - Paracelsus Recovery"
- [ ] Hero section displays "Chronic Condition Recovery - Your path to healing"
- [ ] Header hamburger menu opens when clicked
- [ ] All navigation links work
- [ ] All chronic condition links are visible:
  - [ ] Long Covid
  - [ ] Treatment-Resistant Depression
  - [ ] Holistic Cancer Treatment
  - [ ] Heart Disease
  - [ ] Sleep Disorders
  - [ ] Menopause
  - [ ] Alzheimer's and Other Dementias
  - [ ] Chronic Kidney Disease
  - [ ] Arthritis
  - [ ] Osteoporosis
  - [ ] Diabetes
  - [ ] COPD and Allied Conditions
- [ ] "How we treat" section is visible with treatment approach details
- [ ] Treatment accordions present (Assessment, Diagnostics, Psychotherapy, etc.)
- [ ] Footer displays correctly
- [ ] "Talk to us" button opens contact modal
- [ ] No 404 errors in browser console for images
- [ ] All images load via the rewrites proxy

### 5.4 Test accessibility from homepage

1. Navigate to `http://localhost:3000/`
2. Click hamburger menu
3. Click "Conditions We Treat"
4. Click "Chronic Conditions"
5. Click "VIEW ALL" - should navigate to `/treatment/chronic-conditions-recovery/`

Alternatively, verify with PowerShell:

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
$response.Content -match 'href="/treatment/chronic-conditions-recovery/"'
# Should return True
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
| `clone-kit/raw/chronic-conditions-recovery.outer.html` | 310 KB | Raw captured HTML |
| `clone-kit/html/chronic-conditions-recovery/00-page-css.css` | 3.7 KB | 34 wp-container CSS rules |
| `clone-kit/html/chronic-conditions-recovery/01-header.html` | 87 KB | Header section |
| `clone-kit/html/chronic-conditions-recovery/02-main.html` | 135 KB | Main content |
| `clone-kit/html/chronic-conditions-recovery/03-footer.html` | 17.5 KB | Footer section |
| `clone-kit/html/chronic-conditions-recovery/04-modal.html` | 10.3 KB | Modal content |
| `app/treatment/chronic-conditions-recovery/page.tsx` | ~1.8 KB | Next.js page component |

---

## Troubleshooting

### Page shows 500 error
- Verify all 4 HTML files exist in `clone-kit/html/chronic-conditions-recovery/`
- Check that `loadPageHtml("chronic-conditions-recovery")` matches the folder name exactly

### Images not loading
- Verify `next.config.ts` has rewrites for `/wp-content/` and `/wp-includes/` proxying to the WordPress site
- Check browser console for 404 errors

### Header not visible
- The splitter script should have removed `-translate-y-full` from static classes
- If header is still hidden, manually check `01-header.html` for this class

### Sticky images not working
- Verify `00-page-css.css` was created and contains sticky positioning rules
- Ensure the page component includes the `{pageCss && <style>...}` block
- Check that `app/critical-css.tsx` has `.is-position-sticky { position: sticky !important; }`

---

## Quick Reference Commands

```bash
# Full rebuild from scratch
cd paracelsus-clone

# 1. Capture HTML (PowerShell)
$response = Invoke-WebRequest -Uri "https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/" -UseBasicParsing
$response.Content | Out-File -FilePath "clone-kit\raw\chronic-conditions-recovery.outer.html" -Encoding UTF8

# 2. Split HTML
node scripts/split-page-html.js chronic-conditions-recovery

# 3. Extract CSS
node scripts/extract-page-css.js chronic-conditions-recovery

# 4. Create page.tsx (copy template above to app/treatment/chronic-conditions-recovery/page.tsx)

# 5. Start dev server and verify
npm run dev
# Open http://localhost:3000/treatment/chronic-conditions-recovery/
```

---

## Template for Other Pages

To rebuild a different page, replace `chronic-conditions-recovery` with the new page slug and update:

1. The target URL in PowerShell/browser navigation
2. The page name in all script commands
3. The folder name in `loadPageHtml()`
4. The CSS path in `pageCssPath`
5. The metadata (title, description, canonical URL)
6. The component function name

---

## Page Content Reference

This page includes the following sections from the live site:

### Hero Section
- Heading: "Chronic Condition Recovery"
- Subheading: "Your path to healing"
- Description of comprehensive treatment approach

### Chronic Conditions Treated
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

### Treatment Approach Sections
- Assessment procedure
- Diagnostic tools
- Intensive psychotherapy
- Live-in therapist
- Intensive psychiatry
- Psychedelic psychotherapy
- Biochemical restoration
- Physical therapies
- Nutritional therapies
- Wellness therapies
- Medical treatments

### Additional Sections
- Meet the Team slider
- Latest news and insights
- "The journey begins with a conversation" CTA
