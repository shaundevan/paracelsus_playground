import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("prescription-drug-addiction-treatment");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/prescription-drug-addiction-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Prescription Drug Addiction Treatment - Paracelsus Recovery',
  description: 'Our approach to prescription drug addiction treatment is completely non-judgmental and pragmatic, finding the underlying root causes and treating dependency.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/prescription-drug-addiction-treatment/',
  },
  openGraph: {
    title: 'Prescription Drug Addiction Treatment - Paracelsus Recovery',
    description: 'Our approach to prescription drug addiction treatment is completely non-judgmental and pragmatic, finding the underlying root causes and treating dependency.',
    url: 'https://paracelsus-recovery.com/treatment/prescription-drug-addiction-treatment/',
  },
};

export default function PrescriptionDrugAddictionTreatmentPage() {
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
