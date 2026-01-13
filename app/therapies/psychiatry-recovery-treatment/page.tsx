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
