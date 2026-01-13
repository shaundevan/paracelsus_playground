import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("behavioural-addiction-treatment");

// Load page-specific CSS for wp-container rules
const pageCssPath = path.join(process.cwd(), "clone-kit/html/behavioural-addiction-treatment/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Behavioural Addiction Treatment - Paracelsus Recovery',
  description: 'We take a pragmatic approach to behavioural addiction treatment. Our bespoke treatment programmes provide you with moderation, boundaries and peace.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/',
  },
  openGraph: {
    title: 'Behavioural Addiction Treatment - Paracelsus Recovery',
    description: 'We take a pragmatic approach to behavioural addiction treatment. Our bespoke treatment programmes provide you with moderation, boundaries and peace.',
    url: 'https://paracelsus-recovery.com/treatment/behavioural-addiction-treatment/',
  },
};

export default function BehaviouralAddictionTreatmentPage() {
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
