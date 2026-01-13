import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Press page - fixed HubSpot form target selector (2026-01-13 v3)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("press");

// Load page-specific CSS for wp-container rules (layout, positioning)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/press/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'In the Press - Paracelsus Recovery',
  description: 'Paracelsus Recovery in the press. At Paracelsus Recovery, we are committed to breaking the stigma around mental health and challenging the idea that wealth automatically brings happiness.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/press/',
  },
  openGraph: {
    title: 'In the Press - Paracelsus Recovery',
    description: 'Paracelsus Recovery in the press. At Paracelsus Recovery, we are committed to breaking the stigma around mental health and challenging the idea that wealth automatically brings happiness.',
    url: 'https://paracelsus-recovery.com/press/',
  },
};

export default function PressPage() {
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
