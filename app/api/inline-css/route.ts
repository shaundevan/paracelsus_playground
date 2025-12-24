import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
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

  return NextResponse.json({
    fontStyles,
    globalStyles,
    blockStyleVariations,
    coreBlockSupports,
    wpImgAutoSizes,
    wpBlockButton,
    wpBlockHeading,
    wpBlockButtons,
    wpBlockColumns,
    wpBlockGroup,
    wpBlockParagraph,
    wpBlockSpacer,
  });
}
