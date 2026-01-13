# Psychiatry Recovery Treatment Page Rebuild

This document provides step-by-step instructions to rebuild the Psychiatry Recovery Treatment page from the WordPress site as a static HTML clone in the Next.js wrapper.

## Page Information

| Property | Value |
|----------|-------|
| **Source URL** | https://paracelsus-recovery.com/therapies/psychiatry-recovery-treatment/ |
| **Next.js Route** | `/therapies/psychiatry-recovery-treatment/` |
| **App Path** | `app/therapies/psychiatry-recovery-treatment/page.tsx` |
| **Navigation Location** | Types of Therapies > Psychiatry |

## Prerequisites

- Node.js installed
- PowerShell (Windows) or curl (Mac/Linux)
- Next.js dev server should be stopped or you'll need to restart it after

## Step 1: Capture Raw HTML

Capture the fully-rendered HTML from the live WordPress site.

### Option A: Using PowerShell (Windows)

```powershell
cd paracelsus-clone
Invoke-WebRequest -Uri "https://paracelsus-recovery.com/therapies/psychiatry-recovery-treatment/" -OutFile "clone-kit/raw/psychiatry-recovery-treatment.outer.html"
```

### Option B: Using curl (Mac/Linux)

```bash
cd paracelsus-clone
curl -o clone-kit/raw/psychiatry-recovery-treatment.outer.html "https://paracelsus-recovery.com/therapies/psychiatry-recovery-treatment/"
```

### Option C: Using Browser MCP (if available)

```javascript
// Navigate to the page
browser_navigate({ url: "https://paracelsus-recovery.com/therapies/psychiatry-recovery-treatment/" })

// Scroll to trigger lazy loading
browser_evaluate({ function: "() => { window.scrollTo(0, document.body.scrollHeight/3); return 'scrolled 1/3'; }" })
browser_evaluate({ function: "() => { window.scrollTo(0, document.body.scrollHeight*2/3); return 'scrolled 2/3'; }" })
browser_evaluate({ function: "() => { window.scrollTo(0, document.body.scrollHeight); return 'scrolled bottom'; }" })

// Capture HTML and save to file
browser_evaluate({ function: "() => document.documentElement.outerHTML" })
// Save output to clone-kit/raw/psychiatry-recovery-treatment.outer.html
```

### Verify Capture

```powershell
dir clone-kit\raw\psychiatry-recovery-treatment.outer.html
# Expected: ~269 KB file
```

## Step 2: Split HTML into Sections

Run the splitter script to extract header, main, footer, and modal sections.

```bash
node scripts/split-page-html.js psychiatry-recovery-treatment
```

### Expected Output

```
Reading: .../clone-kit/raw/psychiatry-recovery-treatment.outer.html
Extracting sections...
  → Applied Alpine.js attribute fixes
  ✓ 01-header.html (86,003 bytes)
  → Fixed 36 lazy-loaded images (converted to loaded)
  ✓ 02-main.html (95,326 bytes)
  ✓ 03-footer.html (17,497 bytes)
  ✓ 04-modal.html (10,319 bytes)

Split complete: 4/4 sections extracted
Output directory: .../clone-kit/html/psychiatry-recovery-treatment
```

### What the Splitter Does Automatically

- Rewrites absolute URLs to relative paths
- Fixes Alpine.js attributes for header visibility
- Converts lazy-loaded images to loaded state
- Fixes modal visibility (hides by default)
- Removes Flickity pre-initialized state (if present)

## Step 3: Extract Page-Specific CSS

Extract wp-container CSS rules for layout (sticky positioning, max-width, etc.).

```bash
node scripts/extract-page-css.js psychiatry-recovery-treatment
```

### Expected Output

```
Reading: .../clone-kit/raw/psychiatry-recovery-treatment.outer.html
Found 18 wp-container rules
Wrote: .../clone-kit/html/psychiatry-recovery-treatment/00-page-css.css (2,071 bytes)
```

## Step 4: Create Next.js Page Component

Create the directory and page file:

```bash
mkdir app/therapies/psychiatry-recovery-treatment
```

Create `app/therapies/psychiatry-recovery-treatment/page.tsx`:

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
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("psychiatry-recovery-treatment");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/psychiatry-recovery-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Psychiatry Treatment - Paracelsus Recovery',
  description: 'At Paracelsus Recovery, we adopt a completely holistic treatment model, with your personal psychiatrist playing a central role. Their goal is to alleviate your mental distress, provide you with a diagnosis and formulate your treatment plans.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/therapies/psychiatry-recovery-treatment/',
  },
  openGraph: {
    title: 'Psychiatry Treatment - Paracelsus Recovery',
    description: 'At Paracelsus Recovery, we adopt a completely holistic treatment model, with your personal psychiatrist playing a central role.',
    url: 'https://paracelsus-recovery.com/therapies/psychiatry-recovery-treatment/',
  },
};

export default function PsychiatryRecoveryTreatmentPage() {
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

### Start/Restart Dev Server

```bash
npm run dev
```

### Test Page Load

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/therapies/psychiatry-recovery-treatment" -UseBasicParsing | Select-Object StatusCode
# Expected: StatusCode 200
```

```bash
# Bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/therapies/psychiatry-recovery-treatment
# Expected: 200
```

### Verification Checklist

- [ ] Page loads at `http://localhost:3000/therapies/psychiatry-recovery-treatment/`
- [ ] Status code is 200
- [ ] Header icons visible (dark on light background)
- [ ] Hamburger menu opens with full navigation
- [ ] "Talk to us" button opens contact modal
- [ ] All images load (check browser console for 404s)
- [ ] Page contains "Psychiatry" heading
- [ ] Page contains "holistic treatment model" text
- [ ] Footer displays correctly
- [ ] Homepage navigation links to this page (Types of Therapies > Psychiatry)

### Verify Homepage Link

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
$response.Content -match 'href="/therapies/psychiatry-recovery-treatment/"'
# Expected: True
```

## Files Created

| File | Size | Description |
|------|------|-------------|
| `clone-kit/raw/psychiatry-recovery-treatment.outer.html` | 269 KB | Raw captured HTML |
| `clone-kit/html/psychiatry-recovery-treatment/01-header.html` | 86 KB | Header section |
| `clone-kit/html/psychiatry-recovery-treatment/02-main.html` | 95 KB | Main content |
| `clone-kit/html/psychiatry-recovery-treatment/03-footer.html` | 17.5 KB | Footer section |
| `clone-kit/html/psychiatry-recovery-treatment/04-modal.html` | 10.3 KB | Modal section |
| `clone-kit/html/psychiatry-recovery-treatment/00-page-css.css` | 2 KB | Page-specific CSS |
| `app/therapies/psychiatry-recovery-treatment/page.tsx` | ~1.5 KB | Next.js page component |

## Troubleshooting

### Images Not Loading

Check that `next.config.ts` has rewrites configured:

```typescript
async rewrites() {
  return [
    { source: "/wp-content/:path*", destination: "https://paracelsus-recovery.com/wp-content/:path*" },
    { source: "/wp-includes/:path*", destination: "https://paracelsus-recovery.com/wp-includes/:path*" },
  ];
}
```

### Page Shows Old Content After HTML Changes

The dev server caches HTML at module load time due to `force-static`. Restart the server:

```bash
# Stop server (Ctrl+C) then:
npm run dev
```

### Header Not Visible

The splitter should fix this automatically. If header is still hidden, check that `-translate-y-full` was removed from static class attributes in `01-header.html`.

### Modal Showing at Bottom of Page

The splitter should fix this automatically. If modal content is visible, check that `x-show="open" style="display: none;"` was added to the modal container in `04-modal.html`.

## Existing Infrastructure Used

- **Next.js rewrites** (`next.config.ts`): Proxies `/wp-content/` and `/wp-includes/` to WordPress
- **loadPageHtml helper** (`lib/load-page-html.ts`): Loads and normalizes HTML parts
- **Alpine.js fallbacks** (`app/layout.tsx`): Handles blur reveal, overlapping images, page navigation
- **Critical CSS** (`app/critical-css.tsx`): Global sticky section fixes
