import type { Metadata } from "next";
import { loadPageHtml } from "@/lib/load-page-html";

// Force static generation - page will be pre-rendered at build time
// Trigger rebuild: removed text-pale-01 for light background
export const dynamic = 'force-static';

// Pre-read files at module initialization (build time only)
const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("programmes-and-therapies");

export const metadata: Metadata = {
  title: 'All Recovery Treatment Programmes',
  description: 'Explore all recovery treatment programmes offered at Paracelsus Recovery. All treatment programmes are as unique as you are and tailored to your needs.',
  alternates: {
    canonical: 'https://paracelsus-recovery.com/programmes-and-therapies/',
  },
  openGraph: {
    title: 'All Recovery Treatment Programmes - Paracelsus Recovery',
    description: 'Explore all recovery treatment programmes offered at Paracelsus Recovery. All treatment programmes are as unique as you are and tailored to your needs.',
    url: 'https://paracelsus-recovery.com/programmes-and-therapies/',
  },
};

export default function ProgrammesAndTherapiesPage() {
  return (
    <>
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
    </>
  );
}
