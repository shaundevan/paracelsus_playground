import fs from "fs";
import path from "path";

/**
 * Server component that renders critical CSS inline in the HTML.
 * This prevents FOUC by ensuring styles are in the DOM before first paint.
 * 
 * Unlike JavaScript injection (beforeInteractive), this approach:
 * 1. Renders CSS directly in the HTML response
 * 2. Browser applies styles immediately during parsing
 * 3. No JavaScript execution needed before styling
 */
export default function CriticalCSS() {
  const htmlPath = path.join(
    process.cwd(),
    "clone-kit/html/homepage.outer.html"
  );
  const html = fs.readFileSync(htmlPath, "utf8");

  // Extract CSS blocks from the source HTML
  const extractCSS = (pattern: RegExp): string => {
    const match = html.match(pattern);
    if (!match) return "";
    return match[1]
      .trim()
      .replace(/https:\/\/paracelsus-recovery\.com\//g, "/");
  };

  // Extract all inline styles
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

  // Base typography styles (inlined from globals.css to avoid render-blocking request)
  const globalsCss = `
    html {
      font-family: var(--wp--preset--font-family--body);
      line-height: 1.4;
      font-size: 16px;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      overscroll-behavior-x: none;
      height: 100%;
      background-color: #fff;
    }
    body {
      height: 100%;
      overscroll-behavior-x: none;
      backface-visibility: hidden;
      background-attachment: fixed;
    }
  `;

  // CSS to prevent layout shifts
  const layoutShiftCSS = `
    /* Prevent layout shift from font loading */
    html { font-display: swap; }
    /* Ensure video banner has stable height */
    .Video__Banner { contain: layout style paint; min-height: 100vh; }
    /* Logo images in video banner */
    .Video__Banner picture img[width][height] { height: auto; }
  `;

  // Combine all inline styles
  const allInlineStyles = [
    globalsCss,
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
    layoutShiftCSS,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      {/* Preload the video poster image - this becomes the LCP element */}
      <link
        rel="preload"
        href="/wp-content/uploads/2025/02/poster.webp"
        as="image"
        type="image/webp"
        fetchPriority="high"
      />
      
      {/* Preload the LCP video */}
      <link
        rel="preload"
        href="/wp-content/uploads/2025/02/2023_paracelsus_recovery_London_UK_v01-1.mp4"
        as="video"
        type="video/mp4"
      />
      
      {/* Preconnect to external domain for images, mobile video and other assets */}
      <link rel="preconnect" href="https://paracelsus-recovery.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://paracelsus-recovery.com" />
      
      {/* Preload key Team Grid images - local files for faster loading */}
      <link
        rel="preload"
        as="image"
        href="/wp-content/uploads/2025/02/Prof.T.Suedhof-002-scaled-e1757676961936.webp"
        imageSrcSet="/wp-content/uploads/2025/02/Prof.T.Suedhof-002-scaled-e1757676961936.webp 1306w, /wp-content/uploads/2025/02/Prof.T.Suedhof-002-scaled-e1757676961936-200x300.webp 200w"
        imageSizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      />
      <link
        rel="preload"
        as="image"
        href="/wp-content/uploads/2025/02/Parac-Reco-3516-1-e1739874187365.webp"
        imageSrcSet="/wp-content/uploads/2025/02/Parac-Reco-3516-1-e1739874187365.webp 1707w, /wp-content/uploads/2025/02/Parac-Reco-3516-1-e1739874187365-200x300.webp 200w"
        imageSizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      />

      {/* Preload critical fonts to prevent layout shift */}
      <link
        rel="preload"
        href="/wp-content/themes/pegasus/assets/fonts/reckless-neue/RecklessNeue-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-300.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-250.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-450.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Preload critical CSS files */}
      <link
        rel="preload"
        href="/wp-includes/css/dist/block-library/style.min.css"
        as="style"
      />
      <link
        rel="preload"
        href="/wp-content/themes/pegasus/dist/assets/styles/DwoS2IZP.css"
        as="style"
      />

      {/* Load external CSS files - render-blocking to prevent FOUC */}
      <link
        rel="stylesheet"
        href="/wp-includes/css/dist/block-library/style.min.css"
      />
      <link
        rel="stylesheet"
        href="/wp-content/themes/pegasus/dist/assets/styles/DwoS2IZP.css"
      />
      <link
        rel="stylesheet"
        href="/wp-content/siteground-optimizer-assets/siteground-optimizer-combined-css-c91c1f475ab21e8486c7ae5c09e7b9.css"
      />

      {/* Inline critical styles directly in HTML */}
      <style
        id="critical-inline-styles"
        dangerouslySetInnerHTML={{ __html: allInlineStyles }}
      />
    </>
  );
}

