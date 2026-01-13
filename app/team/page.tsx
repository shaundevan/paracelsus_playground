import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Fixed accordion icons to show + when closed (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("team");

// Load page-specific CSS for wp-container rules (layout, sticky positioning)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/team/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Meet the Team - Paracelsus Recovery',
  description: 'Meet our world-class team of doctors, psychiatrists, therapists, and specialists dedicated to your recovery journey. Including Nobel Prize laureate Prof. Dr. Thomas Suedhof.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/team/',
  },
  openGraph: {
    title: 'Meet the Team - Paracelsus Recovery',
    description: 'Meet our world-class team of doctors, psychiatrists, therapists, and specialists dedicated to your recovery journey.',
    url: 'https://paracelsus-recovery.com/team/',
  },
};

export default function TeamPage() {
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
