import Script from "next/script";
import fs from "fs";
import path from "path";

/**
 * Server component that creates a blocking script to inject critical inline styles.
 * These styles must load synchronously before the page renders to prevent FOUT.
 */
export default function CriticalStylesScript() {
  const htmlPath = path.join(
    process.cwd(),
    "clone-kit/html/homepage.outer.html"
  );
  const html = fs.readFileSync(htmlPath, "utf8");

  // Extract CSS blocks
  const extractCSS = (pattern: RegExp) => {
    const match = html.match(pattern);
    if (!match) return "";
    return match[1]
      .trim()
      .replace(/https:\/\/paracelsus-recovery\.com\//g, "/")
      .replace(/\r\n/g, "\n")
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\${/g, "\\${");
  };

  const fontStyles = extractCSS(
    /<style class="wp-fonts-local"[^>]*>([\s\S]*?)<\/style>/
  );
  const globalStyles = extractCSS(
    /<style id="global-styles-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const blockStyleVariations = extractCSS(
    /<style id="block-style-variation-styles-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const coreBlockSupports = extractCSS(
    /<style id="core-block-supports-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  
  // Additional WordPress block inline styles
  const wpImgAutoSizes = extractCSS(
    /<style id="wp-img-auto-sizes-contain-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockButton = extractCSS(
    /<style id="wp-block-button-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockHeading = extractCSS(
    /<style id="wp-block-heading-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockButtons = extractCSS(
    /<style id="wp-block-buttons-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockColumns = extractCSS(
    /<style id="wp-block-columns-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockGroup = extractCSS(
    /<style id="wp-block-group-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockParagraph = extractCSS(
    /<style id="wp-block-paragraph-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );
  const wpBlockSpacer = extractCSS(
    /<style id="wp-block-spacer-inline-css"[^>]*>([\s\S]*?)<\/style>/
  );

  // Create script that injects styles synchronously
  const injectScript = `
    (function() {
      const head = document.head || document.getElementsByTagName('head')[0];
      
      function injectStyle(id, content, className) {
        if (!content) return;
        if (document.getElementById(id)) return; // Already exists
        
        const style = document.createElement('style');
        style.id = id;
        if (className) style.className = className;
        style.textContent = content;
        head.appendChild(style);
      }
      
      // Inject in correct order: fonts first, then global styles, then block styles
      ${fontStyles ? `injectStyle('wp-fonts-local', \`${fontStyles}\`, 'wp-fonts-local');` : ''}
      ${globalStyles ? `injectStyle('global-styles-inline-css', \`${globalStyles}\`);` : ''}
      ${blockStyleVariations ? `injectStyle('block-style-variation-styles-inline-css', \`${blockStyleVariations}\`);` : ''}
      ${coreBlockSupports ? `injectStyle('core-block-supports-inline-css', \`${coreBlockSupports}\`);` : ''}
      ${wpImgAutoSizes ? `injectStyle('wp-img-auto-sizes-contain-inline-css', \`${wpImgAutoSizes}\`);` : ''}
      ${wpBlockButton ? `injectStyle('wp-block-button-inline-css', \`${wpBlockButton}\`);` : ''}
      ${wpBlockHeading ? `injectStyle('wp-block-heading-inline-css', \`${wpBlockHeading}\`);` : ''}
      ${wpBlockButtons ? `injectStyle('wp-block-buttons-inline-css', \`${wpBlockButtons}\`);` : ''}
      ${wpBlockColumns ? `injectStyle('wp-block-columns-inline-css', \`${wpBlockColumns}\`);` : ''}
      ${wpBlockGroup ? `injectStyle('wp-block-group-inline-css', \`${wpBlockGroup}\`);` : ''}
      ${wpBlockParagraph ? `injectStyle('wp-block-paragraph-inline-css', \`${wpBlockParagraph}\`);` : ''}
      ${wpBlockSpacer ? `injectStyle('wp-block-spacer-inline-css', \`${wpBlockSpacer}\`);` : ''}
    })();
  `;

  return (
    <Script
      id="critical-styles-injector"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: injectScript }}
    />
  );
}








