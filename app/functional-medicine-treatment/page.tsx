import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial page creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("functional-medicine-treatment");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/functional-medicine-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Functional Medicine - Paracelsus Recovery',
  description: 'At Paracelsus Recovery, functional medicine is at the heart of all our treatment programmes. The aim of functional medicine is to identify and address the root cause of disease and restore health through personalised, holistic treatment.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/functional-medicine-treatment/',
  },
  openGraph: {
    title: 'Functional Medicine - Paracelsus Recovery',
    description: 'At Paracelsus Recovery, functional medicine is at the heart of all our treatment programmes. The aim of functional medicine is to identify and address the root cause of disease and restore health through personalised, holistic treatment.',
    url: 'https://paracelsus-recovery.com/functional-medicine-treatment/',
  },
};

export default function FunctionalMedicineTreatmentPage() {
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
