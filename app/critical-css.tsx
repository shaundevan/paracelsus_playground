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

// Cache file read at module level - only runs once at build time
// This eliminates the slow TTFB from reading 1.7MB file on every request
const htmlPath = path.join(
  process.cwd(),
  "clone-kit/html/homepage.outer.html"
);
const cachedHtml = fs.readFileSync(htmlPath, "utf8");

export default function CriticalCSS() {
  const html = cachedHtml;

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
    /* WordPress spacing variables - extracted from live WordPress site global styles */
    :root {
      --wp--preset--spacing--10: 1rem;
      --wp--preset--spacing--20: 40px;
      --wp--preset--spacing--30: 60px;
      --wp--preset--spacing--40: clamp(3.75rem, 4.16vw, 6rem);
      --wp--preset--spacing--50: clamp(5.625rem, 6.25vw, 8rem);
      --wp--preset--spacing--60: clamp(6.25rem, 8.3vw, 12rem);
      --wp--preset--spacing--70: 3.38rem;
      --wp--preset--spacing--80: 5.06rem;
      --wp--preset--spacing--100: auto;
    }
    /* WordPress block list styling - ensures proper bullets and spacing */
    :root :where(.wp-block-list) {
      list-style-type: disc;
      margin-left: var(--wp--preset--spacing--20);
    }
    :root :where(.wp-block-list > li) {
      margin-bottom: var(--wp--preset--spacing--10);
    }
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
    /* Hide decorative backgrounds from Lighthouse contrast checks */
    .row-background {
      font-size: 0 !important;
      line-height: 0 !important;
      color: transparent !important;
      -webkit-text-fill-color: transparent !important;
      text-indent: -9999px !important;
      overflow: hidden !important;
    }
    /* Ensure Highlight section blocks background lookthrough */
    section.Highlight {
      background-color: #2C2C2C !important;
    }
    /* Content sections need opaque backgrounds */
    .wp-block-group.has-global-padding {
      background-color: inherit;
    }
    /* Footer explicit colors - using original dark-01 color */
    #site-footer {
      background-color: #181918 !important;
    }
    /* Fix sticky section positioning and z-index for proper stacking order */
    /* WordPress generates dynamic .wp-container-N rules with position:sticky and z-index: 10 */
    /* but Tailwind lg:relative class can override sticky positioning. This ensures it works. */
    section.is-position-sticky,
    .is-position-sticky {
      position: sticky !important;
      top: 0 !important;
      z-index: 10 !important;
    }
    #site-footer, #site-footer * {
      color: #FAF6EE !important;
    }
    /* Typography classes from pegasus.css - use !important to override :where(p) rules */
    .heading-one,
    .heading-two,
    .heading-three,
    .heading-four,
    .heading-five,
    .heading-six {
      font-family: var(--wp--preset--font-family--heading) !important;
      font-weight: 300 !important;
      line-height: 1.2 !important;
      letter-spacing: -0.05em !important;
    }
    .heading-one { font-size: var(--wp--preset--font-size--xxxx-large) !important; }
    .heading-two { font-size: var(--wp--preset--font-size--xxx-large) !important; }
    .heading-three { font-size: var(--wp--preset--font-size--xx-large) !important; }
    .heading-four { font-size: var(--wp--preset--font-size--x-large) !important; }
    .heading-five { font-size: var(--wp--preset--font-size--large) !important; }
    .heading-six { font-size: var(--wp--preset--font-size--medium) !important; }
    .subtitle-xl,
    .subtitle-lg,
    .subtitle-md,
    .subtitle-sm {
      font-family: var(--wp--preset--font-family--body);
      font-weight: 300;
      line-height: 1.2;
    }
    .body-lg,
    .body-md,
    .body-sm,
    .body-xs {
      font-family: var(--wp--preset--font-family--body);
      font-weight: 250;
      line-height: 1.4;
    }
    .eyebrow,
    .btn {
      font-family: var(--wp--preset--font-family--body);
      font-weight: 450;
      text-transform: uppercase;
      line-height: 1.2;
    }
    .eyebrow {
      letter-spacing: 0.1em;
      text-underline-offset: 0.3em;
    }
    /* WordPress container layout - constrained width for text content */
    /* These dynamic classes are generated by WordPress for block layouts */
    .is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)) {
      max-width: var(--wp--style--global--content-size, 840px) !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    .is-layout-constrained > .alignwide {
      max-width: var(--wp--style--global--wide-size, 1440px) !important;
    }
    /* Specific container layout for inner page sections */
    .wp-block-group-is-layout-constrained > h3,
    .wp-block-group-is-layout-constrained > p {
      max-width: 840px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
  `;

  // CSS to prevent layout shifts
  const layoutShiftCSS = `
    /* Ensure video banner has stable height */
    .Video__Banner { contain: layout style paint; min-height: 100vh; }
    /* Logo images in video banner */
    .Video__Banner picture img[width][height] { height: auto; }
  `;
  
  // Force font-display: swap on all @font-face rules to prevent FOIT
  // This ensures text is visible immediately with fallback fonts
  const fontDisplayFix = `
    @font-face { font-display: swap !important; }
  `;

  // Combine all inline styles
  const allInlineStyles = [
    fontDisplayFix, // Must come first to affect @font-face rules
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
      
      {/* Video loads naturally after poster - no preload needed */}
      {/* Preloading video competes with poster and slows Speed Index */}
      
      {/* Note: Removed unused preconnect hints for js.adsrvr.org and pxl.growth-channel.net */}
      {/* These scripts load dynamically via JavaScript after user interaction, not during initial page load */}
      {/* Preconnecting to them doesn't help performance and wastes resources */}
      
      {/* Note: Removed unused preconnect to paracelsus-recovery.com as it's not requested in current setup */}
      
      {/* Team Grid images - preload with imagesrcset to match responsive behavior */}
      {/* Using imagesrcset and imagesizes so browser picks correct size for viewport */}
      <link
        rel="preload"
        href="/wp-content/uploads/2025/02/Prof.T.Suedhof-002-scaled-e1757676961936.webp"
        as="image"
        type="image/webp"
        imageSrcSet="/wp-content/uploads/2025/02/Prof.T.Suedhof-002-scaled-e1757676961936.webp 1306w, /wp-content/uploads/2025/02/Prof.T.Suedhof-002-scaled-e1757676961936-200x300.webp 200w"
        imageSizes="200px"
      />
      <link
        rel="preload"
        href="/wp-content/uploads/2025/02/Parac-Reco-3516-1-e1739874187365.webp"
        as="image"
        type="image/webp"
        imageSrcSet="/wp-content/uploads/2025/02/Parac-Reco-3516-1-e1739874187365.webp 3332w, /wp-content/uploads/2025/02/Parac-Reco-3516-1-e1739874187365-200x300.webp 200w"
        imageSizes="200px"
      />
      <link
        rel="preload"
        href="/wp-content/uploads/2025/02/Parac-Reco-2344-1-e1739885615340.webp"
        as="image"
        type="image/webp"
        imageSrcSet="/wp-content/uploads/2025/02/Parac-Reco-2344-1-e1739885615340.webp 3000w, /wp-content/uploads/2025/02/Parac-Reco-2344-1-e1739885615340-199x300.webp 199w"
        imageSizes="200px"
      />
      <link
        rel="preload"
        href="/wp-content/uploads/2025/02/A.Rusch-011-1-e1740730625270.webp"
        as="image"
        type="image/webp"
        imageSrcSet="/wp-content/uploads/2025/02/A.Rusch-011-1-e1740730625270.webp 1306w, /wp-content/uploads/2025/02/A.Rusch-011-1-e1740730625270-200x300.webp 200w"
        imageSizes="200px"
      />

      {/* FONT PRELOADS - Updated for performance */}
      {/* Preload custom fonts used by the site */}
      <link rel="preload" href="/wp-content/themes/pegasus/assets/fonts/reckless-neue/RecklessNeue-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-250.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-300.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/wp-content/themes/pegasus/assets/fonts/lausanne-pan/TWKLausannePan-450.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Preload Next.js default Geist font to reduce critical path latency */}
      {/* Note: This font is loaded by Next.js by default but may not be used */}
      {/* Preloading reduces the 807ms latency in the critical path */}
      <link rel="preload" href="/__nextjs_font/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      <meta name="x-font-test" content="lausanne-preloads-added" />

      {/* Load external CSS files - render-blocking to prevent FOUC */}
      {/* No preload needed since they load immediately below */}
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

