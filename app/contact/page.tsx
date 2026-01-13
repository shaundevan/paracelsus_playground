import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("contact");

// Load page-specific CSS for wp-container rules (layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/contact/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Contact - Paracelsus Recovery',
  description: 'Contact Paracelsus Recovery. Write, call or chat anytime. Located at Utoquai 43, 8008 Zurich, Switzerland. Phone: +41 44 505 68 98.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/contact/',
  },
  openGraph: {
    title: 'Contact - Paracelsus Recovery',
    description: 'Contact Paracelsus Recovery. Write, call or chat anytime. Located at Utoquai 43, 8008 Zurich, Switzerland. Phone: +41 44 505 68 98.',
    url: 'https://paracelsus-recovery.com/contact/',
  },
};

export default function ContactPage() {
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
