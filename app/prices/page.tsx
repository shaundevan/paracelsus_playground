import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("prices");

// Load page-specific CSS for wp-container rules (layout, margins)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/prices/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Rehab Costs and Pricing - Paracelsus Recovery',
  description: 'Residential rehab prices and treatment programme costs. Four Week Residential Treatment, Seven-Day Executive Detox, Health Check-Up, and Aftercare services.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/prices/',
  },
  openGraph: {
    title: 'Rehab Costs and Pricing - Paracelsus Recovery',
    description: 'Residential rehab prices and treatment programme costs. Four Week Residential Treatment, Seven-Day Executive Detox, Health Check-Up, and Aftercare services.',
    url: 'https://paracelsus-recovery.com/prices/',
  },
};

export default function PricesPage() {
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
