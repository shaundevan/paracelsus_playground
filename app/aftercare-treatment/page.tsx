import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Rebuild trigger: Initial creation (2026-01-13)
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("aftercare-treatment");

export const metadata: Metadata = {
  title: 'Recovery Aftercare Treatment - Paracelsus Recovery',
  description: 'Our commitment to you extends well beyond your time with us. Our aftercare team offers flexible support that helps you manage difficulties and integrate what you learnt during treatment into your life.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/aftercare-treatment/',
  },
  openGraph: {
    title: 'Recovery Aftercare Treatment - Paracelsus Recovery',
    description: 'Our commitment to you extends well beyond your time with us. Our aftercare team offers flexible support that helps you manage difficulties and integrate what you learnt during treatment into your life.',
    url: 'https://paracelsus-recovery.com/aftercare-treatment/',
  },
};

export default function AftercareTreatmentPage() {
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
