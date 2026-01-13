import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Flickity individual slide wrappers (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("our-approach");

export const metadata: Metadata = {
  title: 'Our Approach to Recovery - Paracelsus Recovery',
  description: 'The most comprehensive, innovative and cutting-edge treatment worldwide. A 360-degree treatment that considers the whole person: mind, body, and soul.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/our-approach/',
  },
  openGraph: {
    title: 'Our Approach to Recovery - Paracelsus Recovery',
    description: 'The most comprehensive, innovative and cutting-edge treatment worldwide. A 360-degree treatment that considers the whole person: mind, body, and soul.',
    url: 'https://paracelsus-recovery.com/our-approach/',
  },
};

export default function OurApproachPage() {
  return (
    <div>
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
