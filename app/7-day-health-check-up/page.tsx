import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Force re-read by updating this timestamp: 2026-01-13T00:24:00Z (fixed !important on max-width)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("7-day-health-check-up");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/7-day-health-check-up/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Comprehensive 7-Day Health Check Up - Paracelsus Recovery',
  description: 'The world\'s most comprehensive 7-day health check-up programme. Every possible health risk will be investigated by specialist doctors from every field during your 7-day stay at our longevity clinic in Zurich.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/7-day-health-check-up/',
  },
  openGraph: {
    title: 'Comprehensive 7-Day Health Check Up - Paracelsus Recovery',
    description: 'The world\'s most comprehensive 7-day health check-up programme. Every possible health risk will be investigated by specialist doctors from every field.',
    url: 'https://paracelsus-recovery.com/7-day-health-check-up/',
  },
};

export default function SevenDayHealthCheckUpPage() {
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
