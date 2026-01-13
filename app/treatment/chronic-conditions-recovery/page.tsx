import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("chronic-conditions-recovery");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/chronic-conditions-recovery/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Chronic Condition Recovery - Paracelsus Recovery',
  description: 'We have extensive experience in helping clients go through chronic condition recovery to restore their overall health and minimise the suffering that comes with various chronic health conditions. Our programmes can even lead to a total recovery.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/',
  },
  openGraph: {
    title: 'Chronic Condition Recovery - Paracelsus Recovery',
    description: 'Recovery clinic for chronic conditions. Our integrated approach addresses cellular, genetic and biochemical markers that will directly improve your pain and energy levels.',
    url: 'https://paracelsus-recovery.com/treatment/chronic-conditions-recovery/',
  },
};

export default function ChronicConditionsRecoveryPage() {
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
