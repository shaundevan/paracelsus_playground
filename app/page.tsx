import fs from "fs";
import path from "path";
import DebugHeader from "./debug-header";

// Force static generation - page will be pre-rendered at build time
// This eliminates the 3+ second TTFB from reading files on every request
// Rebuild trigger: header fix for -translate-y-full removal
export const dynamic = 'force-static';

// Normalize line endings to prevent hydration mismatches
const normalizeLineEndings = (content: string) =>
  content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

// Pre-read files at module initialization (build time only)
// Using explicit paths to avoid Turbopack's broad file pattern warnings
const headerHtml = normalizeLineEndings(
  fs.readFileSync(path.join(process.cwd(), "clone-kit/html/01-header.html"), "utf8")
);
const mainHtml = normalizeLineEndings(
  fs.readFileSync(path.join(process.cwd(), "clone-kit/html/02-main.html"), "utf8")
);
const footerHtml = normalizeLineEndings(
  fs.readFileSync(path.join(process.cwd(), "clone-kit/html/03-footer.html"), "utf8")
);
const modalHtml = normalizeLineEndings(
  fs.readFileSync(path.join(process.cwd(), "clone-kit/html/04-modal.html"), "utf8")
);

export default function Page() {
  // HTML is now pre-read at build time (see module-level constants above)
  // This eliminates file I/O on every request
  
  return (
    <>
      <DebugHeader />
      {/* Full WordPress header with complete navigation */}
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
      {/* Modal skeleton required for "Start your journey" and "Talk to us" buttons */}
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: modalHtml }} 
      />
    </>
  );
}





