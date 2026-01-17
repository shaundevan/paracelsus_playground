import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("treatment-in-conjunction-with-zurichs-best-hospitals");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/treatment-in-conjunction-with-zurichs-best-hospitals/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: "Treatment in Conjunction with Zurich's Best Hospitals - Paracelsus Recovery",
  description: "We work with Zurich's leading hospitals to address somatic and physical health conditions while providing comprehensive holistic support throughout your treatment.",
  alternates: {
    canonical: 'https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/',
  },
  openGraph: {
    title: "Treatment in Conjunction with Zurich's Best Hospitals - Paracelsus Recovery",
    description: "We work with Zurich's leading hospitals to address somatic and physical health conditions while providing comprehensive holistic support throughout your treatment.",
    url: 'https://paracelsus-recovery.com/treatment-in-conjunction-with-zurichs-best-hospitals/',
  },
};

export default function ZurichHospitalsPage() {
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
