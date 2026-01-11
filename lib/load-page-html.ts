import fs from "fs";
import path from "path";

/**
 * Normalize line endings to prevent hydration mismatches between
 * Windows (CRLF) and Unix (LF) line endings.
 * Updated: removed video opacity-80 to fix overlay
 */
const normalize = (s: string) => s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

/**
 * Load the 4 HTML parts (header, main, footer, modal) for a given page.
 * 
 * @param folder - The folder name under clone-kit/html/ (e.g., "homepage", "programmes-and-therapies")
 * @returns Object containing the 4 HTML strings
 * 
 * @example
 * ```typescript
 * const { headerHtml, mainHtml, footerHtml, modalHtml } = loadPageHtml("homepage");
 * ```
 */
export function loadPageHtml(folder: string) {
  const basePath = path.join(process.cwd(), "clone-kit/html", folder);
  
  const read = (file: string) => normalize(
    fs.readFileSync(path.join(basePath, file), "utf8")
  );
  
  return {
    headerHtml: read("01-header.html"),
    mainHtml: read("02-main.html"),
    footerHtml: read("03-footer.html"),
    modalHtml: read("04-modal.html"),
  };
}
