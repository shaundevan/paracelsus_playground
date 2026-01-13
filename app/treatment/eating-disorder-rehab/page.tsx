import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("eating-disorder-rehab");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/eating-disorder-rehab/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Eating Disorder Rehabilitation Centre - Paracelsus Recovery',
  description: 'Eating disorder treatment combining medical excellence, specialised therapies, and a team of 15+ experts, all dedicated to your unique needs. We help you rebuild your relationship with food and enjoyment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/eating-disorder-rehab/',
  },
  openGraph: {
    title: 'Eating Disorder Rehabilitation Centre - Paracelsus Recovery',
    description: 'Eating disorder treatment combining medical excellence, specialised therapies, and a team of 15+ experts, all dedicated to your unique needs.',
    url: 'https://paracelsus-recovery.com/treatment/eating-disorder-rehab/',
  },
};

export default function EatingDisorderRehabPage() {
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
