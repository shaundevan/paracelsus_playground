import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("about-us");

// Load page-specific CSS for wp-container rules (layout, positioning, sticky sections)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/about-us/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

// Critical hero section CSS to prevent layout shift
// These styles ensure the hero text layout is stable before any JavaScript runs
const heroCriticalCss = `
  /* Hero section container - ensure stable height from first paint */
  article#page-71030 > section:first-child {
    min-height: 100vh !important;
    height: 100vh !important;
    contain: layout style;
  }
  
  /* Handle the lg:h-relative class - uses CSS variable for responsive height */
  .lg\\:h-relative {
    height: var(--height-lg-relative, 100vh) !important;
  }
  @media (min-width: 768px) {
    .md\\:h-relative {
      height: var(--height-md-relative, 100vh) !important;
    }
  }
  
  /* Hero text headings - lock in font size immediately */
  .has-xxxx-large-font-size {
    font-size: var(--wp--preset--font-size--xxxx-large, clamp(39px, 2.438rem + ((1vw - 3.9px) * 2.095), 61px)) !important;
    font-family: var(--wp--preset--font-family--heading, serif);
    font-weight: 300;
    line-height: 1.2;
    letter-spacing: -0.05em;
  }
  
  /* WordPress flex layout class - must display as flex immediately */
  .is-layout-flex {
    display: flex !important;
  }
  
  /* Ensure flex columns don't wrap - prevents text breaking */
  .wp-container-core-columns-is-layout-ec2e7a44 {
    display: flex !important;
    flex-wrap: nowrap !important;
  }
  
  /* Hero section columns layout */
  .wp-container-core-columns-is-layout-28232c24 {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 0 0 !important;
  }
  
  /* Hero text container flex layout */
  .wp-container-core-group-is-layout-cd57f305 {
    display: flex !important;
    flex-wrap: nowrap !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
  }
  
  .wp-container-core-group-is-layout-9a2e2d63 {
    display: flex !important;
    flex-wrap: nowrap !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: space-between !important;
  }
  
  /* Ensure columns take their specified flex-basis */
  .wp-block-column {
    flex-shrink: 0;
  }
  
  /* Prevent any loadtransition animations from shifting content on initial load */
  [loadtransition] {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    animation: none !important;
    transition: none !important;
  }
  
  /* Prevent all transitions during initial page load */
  .wp-block-group[loadtransition],
  .wp-block-columns[loadtransition] {
    transition-property: none !important;
  }
  
  /* Tailwind flex utilities - needed before Tailwind CSS loads */
  .flex {
    display: flex !important;
  }
  .flex-col {
    flex-direction: column !important;
  }
  .justify-center {
    justify-content: center !important;
  }
  .w-full {
    width: 100% !important;
  }
  .h-full {
    height: 100% !important;
  }
  .relative {
    position: relative !important;
  }
  
  /* Ensure the hero container inner wrapper is properly sized */
  .is-flex-layout {
    display: flex !important;
  }
  
  /* Hero text column widths - these use inline flex-basis */
  .wp-block-column[style*="flex-basis:50%"] {
    flex: 0 0 50% !important;
    max-width: 50% !important;
  }
  .wp-block-column[style*="flex-basis:100%"] {
    flex: 1 1 100% !important;
  }
  .wp-block-column[style*="flex-basis:20px"] {
    flex: 0 0 20px !important;
    max-width: 20px !important;
  }
`;

export const metadata: Metadata = {
  title: 'About Us - Paracelsus Recovery',
  description: 'Founded in 2012 in Zurich, Paracelsus Recovery was founded by the Gerber family, who pioneered the one-client-at-a-time and 360° approach to mental health and addiction treatment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/about-us/',
  },
  openGraph: {
    title: 'About Us - Paracelsus Recovery',
    description: 'Founded in 2012 in Zurich, Paracelsus Recovery was founded by the Gerber family, who pioneered the one-client-at-a-time and 360° approach to mental health and addiction treatment.',
    url: 'https://paracelsus-recovery.com/about-us/',
  },
};

export default function AboutUsPage() {
  return (
    <div>
      {/* Critical hero CSS - must load first to prevent layout shift */}
      <style dangerouslySetInnerHTML={{ __html: heroCriticalCss }} />
      {/* Page-specific CSS for wp-container layout rules - loaded synchronously to prevent layout shift */}
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
