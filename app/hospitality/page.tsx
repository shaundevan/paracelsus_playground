import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("hospitality");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/hospitality/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Luxury Rehab in Switzerland - Hospitality - Paracelsus Recovery',
  description: 'We make sure to provide the highest quality of care, comfort and hospitality. Your environment has a profound impact on your state of mind. Every detail of your experience has been carefully considered.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/hospitality/',
  },
  openGraph: {
    title: 'Luxury Rehab in Switzerland - Hospitality - Paracelsus Recovery',
    description: 'We make sure to provide the highest quality of care, comfort and hospitality. Your environment has a profound impact on your state of mind.',
    url: 'https://paracelsus-recovery.com/hospitality/',
  },
};

export default function HospitalityPage() {
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
