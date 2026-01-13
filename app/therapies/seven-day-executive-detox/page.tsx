import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("seven-day-executive-detox");

export const metadata: Metadata = {
  title: '7-10 Day Executive Detox Treatment - Paracelsus Recovery',
  description: 'Our intensive seven-day executive detox programme restores your health following a period of excessive alcohol, drug or medication use.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/therapies/seven-day-executive-detox/',
  },
  openGraph: {
    title: '7-10 Day Executive Detox Treatment - Paracelsus Recovery',
    description: 'Our intensive seven-day executive detox programme restores your health following a period of excessive alcohol, drug or medication use.',
    url: 'https://paracelsus-recovery.com/therapies/seven-day-executive-detox/',
  },
};

export default function SevenDayExecutiveDetoxPage() {
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
