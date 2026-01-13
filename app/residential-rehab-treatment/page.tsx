import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Trigger rebuild: fixed header hide behavior with -translate-y-full (2026-01-12)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("residential-rehab-treatment");

export const metadata: Metadata = {
  title: 'Residential Rehab Treatment - Paracelsus Recovery',
  description: 'From the comfort of our penthouse apartments and with hundreds of years of combined medical expertise, our 4-week+ residential rehab treatment programme targets the root causes of your condition.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/residential-rehab-treatment/',
  },
  openGraph: {
    title: 'Residential Rehab Treatment - Paracelsus Recovery',
    description: 'From the comfort of our penthouse apartments and with hundreds of years of combined medical expertise, our 4-week+ residential rehab treatment programme targets the root causes of your condition.',
    url: 'https://paracelsus-recovery.com/residential-rehab-treatment/',
  },
};

export default function ResidentialRehabTreatmentPage() {
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
