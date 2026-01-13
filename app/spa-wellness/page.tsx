import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Added page-specific CSS for sticky positioning (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("spa-wellness");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/spa-wellness/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Spa and Wellness - Paracelsus Recovery',
  description: 'The mind-body connection lies at the heart of our holistic approach to health, longevity and well-being. From daily massages and yoga practices to acupuncture, sound healing and breathwork, your treatment programme will include wellness treatments to help you on your recovery journey.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/spa-wellness/',
  },
  openGraph: {
    title: 'Spa and Wellness - Paracelsus Recovery',
    description: 'The mind-body connection lies at the heart of our holistic approach to health, longevity and well-being. From daily massages and yoga practices to acupuncture, sound healing and breathwork, your treatment programme will include wellness treatments to help you on your recovery journey.',
    url: 'https://paracelsus-recovery.com/spa-wellness/',
  },
};

export default function SpaWellnessPage() {
  return (
    <div>
      {/* Page-specific CSS for wp-container layout rules (sticky positioning) */}
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
