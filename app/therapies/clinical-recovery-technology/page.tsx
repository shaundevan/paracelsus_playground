import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial page creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("clinical-recovery-technology");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/clinical-recovery-technology/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Clinical Recovery Technology - Paracelsus Recovery',
  description: 'Leading-edge clinical technology pushing the boundaries of clinical excellence. From 24-hour ECGs, IV infusions, and HRV testing to stress MRIs and IHHT treatment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/therapies/clinical-recovery-technology/',
  },
  openGraph: {
    title: 'Clinical Recovery Technology - Paracelsus Recovery',
    description: 'Leading-edge clinical technology pushing the boundaries of clinical excellence. From 24-hour ECGs, IV infusions, and HRV testing to stress MRIs and IHHT treatment.',
    url: 'https://paracelsus-recovery.com/therapies/clinical-recovery-technology/',
  },
};

export default function ClinicalRecoveryTechnologyPage() {
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
