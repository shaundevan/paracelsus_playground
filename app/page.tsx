import fs from "fs";
import path from "path";
import DebugHeader from "./debug-header";

function readHtml(relPath: string) {
  const content = fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
  // Normalize line endings to prevent hydration mismatches
  // This ensures consistent HTML between server and client rendering
  return content
    .replace(/\r\n/g, "\n")  // Normalize Windows line endings
    .replace(/\r/g, "\n");   // Normalize Mac line endings
}

export default function Page() {
  const head = readHtml("clone-kit/html/01-header.html");
  const main = readHtml("clone-kit/html/02-main.html");
  const footer = readHtml("clone-kit/html/03-footer.html");

  // Debug: Log file sizes to verify they're loading
  if (process.env.NODE_ENV === "development") {
    console.log("=== SERVER-SIDE DEBUG ===");
    console.log("Header HTML length:", head.length);
    console.log("Main HTML length:", main.length);
    console.log("Footer HTML length:", footer.length);
    console.log("Header starts with:", head.substring(0, 100));
    console.log("Header contains '<header':", head.includes("<header"));
  }

  return (
    <>
      <DebugHeader />
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: head }} 
      />
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: main }} 
      />
      <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: footer }} 
      />
    </>
  );
}
