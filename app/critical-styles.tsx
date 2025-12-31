import fs from "fs";
import path from "path";

/**
 * Server component that injects critical inline styles directly into the HTML.
 * These styles must be in the <head> and load synchronously to prevent FOUT.
 */
export default function CriticalStyles() {
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
      .replace(/\r\n/g, "\n");
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

  return (
    <>
      {fontStyles && (
        <style
          id="wp-fonts-local"
          className="wp-fonts-local"
          dangerouslySetInnerHTML={{ __html: fontStyles }}
        />
      )}
      {globalStyles && (
        <style
          id="global-styles-inline-css"
          dangerouslySetInnerHTML={{ __html: globalStyles }}
        />
      )}
      {blockStyleVariations && (
        <style
          id="block-style-variation-styles-inline-css"
          dangerouslySetInnerHTML={{ __html: blockStyleVariations }}
        />
      )}
      {coreBlockSupports && (
        <style
          id="core-block-supports-inline-css"
          dangerouslySetInnerHTML={{ __html: coreBlockSupports }}
        />
      )}
      {wpImgAutoSizes && (
        <style
          id="wp-img-auto-sizes-contain-inline-css"
          dangerouslySetInnerHTML={{ __html: wpImgAutoSizes }}
        />
      )}
      {wpBlockButton && (
        <style
          id="wp-block-button-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockButton }}
        />
      )}
      {wpBlockHeading && (
        <style
          id="wp-block-heading-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockHeading }}
        />
      )}
      {wpBlockButtons && (
        <style
          id="wp-block-buttons-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockButtons }}
        />
      )}
      {wpBlockColumns && (
        <style
          id="wp-block-columns-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockColumns }}
        />
      )}
      {wpBlockGroup && (
        <style
          id="wp-block-group-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockGroup }}
        />
      )}
      {wpBlockParagraph && (
        <style
          id="wp-block-paragraph-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockParagraph }}
        />
      )}
      {wpBlockSpacer && (
        <style
          id="wp-block-spacer-inline-css"
          dangerouslySetInnerHTML={{ __html: wpBlockSpacer }}
        />
      )}
    </>
  );
}



