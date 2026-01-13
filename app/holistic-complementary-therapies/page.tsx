import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("holistic-complementary-therapies");

// Load page-specific CSS for wp-container rules (sticky positioning, layout)
const pageCssPath = path.join(process.cwd(), "clone-kit/html/holistic-complementary-therapies/00-page-css.css");
const pageCss = fs.existsSync(pageCssPath) ? fs.readFileSync(pageCssPath, "utf8") : "";

export const metadata: Metadata = {
  title: 'Holistic & Complementary Therapies - Paracelsus Recovery',
  description: 'Explore our holistic and complementary therapies including yoga, massage, acupuncture, breathwork, meditation, and more as part of our comprehensive treatment approach.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/holistic-complementary-therapies/',
  },
  openGraph: {
    title: 'Holistic & Complementary Therapies - Paracelsus Recovery',
    description: 'Explore our holistic and complementary therapies including yoga, massage, acupuncture, breathwork, meditation, and more as part of our comprehensive treatment approach.',
    url: 'https://paracelsus-recovery.com/holistic-complementary-therapies/',
  },
};

export default function HolisticComplementaryTherapiesPage() {
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
