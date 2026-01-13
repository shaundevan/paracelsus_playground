import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial page creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("rehab-therapies");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/rehab-therapies/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Rehab Treatments and Therapies - Paracelsus Recovery',
  description: 'We offer a truly bespoke healing approach, integrating the most advanced medical and therapeutic treatments to support your recovery. Focused on mind, body and soul.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/rehab-therapies/',
  },
  openGraph: {
    title: 'Rehab Treatments and Therapies - Paracelsus Recovery',
    description: 'We offer a truly bespoke healing approach, integrating the most advanced medical and therapeutic treatments to support your recovery. Focused on mind, body and soul.',
    url: 'https://paracelsus-recovery.com/rehab-therapies/',
  },
};

export default function RehabTherapiesPage() {
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
