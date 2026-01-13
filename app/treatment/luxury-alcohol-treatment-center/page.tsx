import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("luxury-alcohol-treatment-center");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/luxury-alcohol-treatment-center/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Luxury Alcohol Treatment Center and Detox Facility - Paracelsus Recovery',
  description: 'A luxury alcohol treatment center and detox facility that does not take a one-size-fits-all approach and instead tailors treatment to each individual client.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/luxury-alcohol-treatment-center/',
  },
  openGraph: {
    title: 'Luxury Alcohol Treatment Center and Detox Facility - Paracelsus Recovery',
    description: 'A luxury alcohol treatment center and detox facility that does not take a one-size-fits-all approach and instead tailors treatment to each individual client.',
    url: 'https://paracelsus-recovery.com/treatment/luxury-alcohol-treatment-center/',
  },
};

export default function LuxuryAlcoholTreatmentCenterPage() {
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
