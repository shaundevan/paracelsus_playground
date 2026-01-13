import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("conditions-we-treat");

// Load page-specific CSS for wp-container rules (layout, positioning)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/conditions-we-treat/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Conditions We Treat - Paracelsus Recovery',
  description: 'We treat a wide range of mental health conditions, addictions, and chronic conditions. Our holistic approach addresses depression, anxiety, trauma, substance abuse, and more.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/conditions-we-treat/',
  },
  openGraph: {
    title: 'Conditions We Treat - Paracelsus Recovery',
    description: 'We treat a wide range of mental health conditions, addictions, and chronic conditions. Our holistic approach addresses depression, anxiety, trauma, substance abuse, and more.',
    url: 'https://paracelsus-recovery.com/conditions-we-treat/',
  },
};

export default function ConditionsWeTreatPage() {
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
