const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "../clone-kit/html/homepage.outer.html");
const html = fs.readFileSync(htmlPath, "utf8");

// Extract CSS blocks
const extractCSS = (pattern) => {
  const match = html.match(pattern);
  return match ? match[1].trim() : "";
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

// Replace absolute URLs with relative paths
const replaceFontUrls = (css) => {
  return css.replace(
    /url\('https:\/\/paracelsus-recovery\.care\//g,
    "url('/"
  );
};

const output = {
  fontStyles: replaceFontUrls(fontStyles),
  globalStyles: replaceFontUrls(globalStyles),
  blockStyleVariations: replaceFontUrls(blockStyleVariations),
  coreBlockSupports: replaceFontUrls(coreBlockSupports),
};

console.log(JSON.stringify(output, null, 2));
