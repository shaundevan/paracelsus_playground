import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("mental-health-treatment-center");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/mental-health-treatment-center/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Mental Health Treatment Centre - Paracelsus Recovery',
  description: 'At Paracelsus Recovery, we believe in treating the whole person, not just the symptoms. Our approach to mental health treatment focuses on understanding the underlying causes of your struggles and addressing them in their entire complexity.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/mental-health-treatment-center/',
  },
  openGraph: {
    title: 'Mental Health Treatment Centre - Paracelsus Recovery',
    description: 'At Paracelsus Recovery, we believe in treating the whole person, not just the symptoms. Our approach to mental health treatment focuses on understanding the underlying causes.',
    url: 'https://paracelsus-recovery.com/treatment/mental-health-treatment-center/',
  },
};

export default function MentalHealthTreatmentCenterPage() {
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
