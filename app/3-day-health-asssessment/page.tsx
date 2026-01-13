import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Created: 2026-01-12
export const dynamic = 'force-static';
export const revalidate = false;

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("3-day-health-asssessment");

export const metadata: Metadata = {
  title: '3-Day Comprehensive Health Assessment Clinic - Paracelsus Recovery',
  description: 'Our 3-day comprehensive health assessment is designed for anyone looking to gain a clear understanding of specific mental or physical symptoms, whether before committing to treatment, seeking a second opinion, or simply as a preventative measure.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/3-day-health-asssessment/',
  },
  openGraph: {
    title: '3-Day Comprehensive Health Assessment Clinic - Paracelsus Recovery',
    description: 'Our 3-day comprehensive health assessment is designed for anyone looking to gain a clear understanding of specific mental or physical symptoms, whether before committing to treatment, seeking a second opinion, or simply as a preventative measure.',
    url: 'https://paracelsus-recovery.com/3-day-health-asssessment/',
  },
};

export default function ThreeDayHealthAssessmentPage() {
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
