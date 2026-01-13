import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("testimonials");

// Load page-specific CSS for wp-container rules (layout, positioning)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/testimonials/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Testimonials - Paracelsus Recovery',
  description: 'Thoughts on Paracelsus Recovery, in our client\'s words. Read testimonials from those we have guided on their journey to recovery.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/testimonials/',
  },
  openGraph: {
    title: 'Testimonials - Paracelsus Recovery',
    description: 'Thoughts on Paracelsus Recovery, in our client\'s words. Read testimonials from those we have guided on their journey to recovery.',
    url: 'https://paracelsus-recovery.com/testimonials/',
  },
};

export default function TestimonialsPage() {
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
