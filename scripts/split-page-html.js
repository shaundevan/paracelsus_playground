#!/usr/bin/env node

/**
 * Split a captured WordPress page HTML into 4 parts:
 * - 01-header.html (from <header id="page-header"> to </header>)
 * - 02-main.html (from <main id="content"> to </main>)
 * - 03-footer.html (from <footer id="site-footer"> to </footer>)
 * - 04-modal.html (content between </footer> and </body>)
 * 
 * Usage: node scripts/split-page-html.js <page-name>
 * Example: node scripts/split-page-html.js programmes-and-therapies
 * 
 * Input:  clone-kit/raw/{page-name}.outer.html
 * Output: clone-kit/html/{page-name}/01-header.html, etc.
 */

const fs = require('fs');
const path = require('path');

// Get page name from command line
const pageName = process.argv[2];

if (!pageName) {
  console.log('Usage: node scripts/split-page-html.js <page-name>');
  console.log('Example: node scripts/split-page-html.js programmes-and-therapies');
  process.exit(1);
}

const inputFile = path.join(process.cwd(), 'clone-kit/raw', `${pageName}.outer.html`);
const outputDir = path.join(process.cwd(), 'clone-kit/html', pageName);

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

console.log(`Reading: ${inputFile}`);
let html = fs.readFileSync(inputFile, 'utf8');

// Handle JSON-encoded strings from browser_evaluate
// The MCP tool returns outerHTML wrapped in JSON quotes with escaped characters
if (html.startsWith('"') && html.endsWith('"')) {
  console.log('Detected JSON encoding, decoding...');
  // Use JSON.parse for proper decoding of all escape sequences
  try {
    html = JSON.parse(html);
    console.log('  → JSON.parse succeeded');
  } catch (e) {
    // Fallback to manual decoding if JSON.parse fails
    console.log('  → JSON.parse failed, using manual decode');
    html = html
      .slice(1, -1)           // Remove surrounding quotes
      .replace(/\\t/g, '\t')  // Decode tabs
      .replace(/\\n/g, '\n')  // Decode newlines
      .replace(/\\r/g, '\r')  // Decode carriage returns
      .replace(/\\"/g, '"')   // Decode escaped quotes
      .replace(/\\\//g, '/')  // Decode escaped slashes
      .replace(/\\\\/g, '\\'); // Decode escaped backslashes (must be last)
  }
}

// Also check for escaped sequences that may have been saved to the file literally
// This handles cases where the file was saved with literal \t, \n, etc.
if (html.includes('\\t') || html.includes('\\n')) {
  console.log('Found escaped sequences in file, decoding...');
  html = html
    .replace(/\\t/g, '\t')  // Decode tabs
    .replace(/\\n/g, '\n')  // Decode newlines
    .replace(/\\r/g, '\r')  // Decode carriage returns
    .replace(/\\"/g, '"')   // Decode escaped quotes
    .replace(/\\\//g, '/'); // Decode escaped slashes
  console.log('  → Escape sequences decoded');
}

/**
 * Extract content between start and end markers (inclusive of markers)
 */
function extractSection(html, startMarker, endMarker) {
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) {
    console.warn(`Warning: Start marker not found: ${startMarker}`);
    return null;
  }
  
  const endIndex = html.indexOf(endMarker, startIndex);
  if (endIndex === -1) {
    console.warn(`Warning: End marker not found: ${endMarker}`);
    return null;
  }
  
  return html.slice(startIndex, endIndex + endMarker.length);
}

/**
 * Rewrite absolute WordPress URLs to relative paths
 */
function rewriteUrls(content) {
  return content
    // Handle bare domain URLs (no trailing slash) - convert to "/"
    // This fixes logo links and search form actions that point to the domain root
    .replace(/href="https?:\/\/(www\.)?paracelsus-recovery\.com"/g, 'href="/"')
    .replace(/action="https?:\/\/(www\.)?paracelsus-recovery\.com"/g, 'action="/"')
    // Convert absolute URLs to relative (with trailing slash/path)
    .replace(/https?:\/\/paracelsus-recovery\.com\//g, '/')
    // Also handle www subdomain
    .replace(/https?:\/\/www\.paracelsus-recovery\.com\//g, '/')
    // Handle srcset attributes with absolute URLs
    .replace(/srcset="([^"]*)"/g, (match, srcset) => {
      const rewritten = srcset.replace(/https?:\/\/(www\.)?paracelsus-recovery\.com\//g, '/');
      return `srcset="${rewritten}"`;
    })
    // Handle background-image URLs in style attributes
    .replace(/background-image:url\(['"]?https?:\/\/(www\.)?paracelsus-recovery\.com\/([^'")]+)['"]?\)/g, 
      (match, www, path) => {
        return `background-image:url('/${path}')`;
      });
}

/**
 * Fix Alpine.js attributes that get stripped/modified during browser capture.
 * When the browser captures the DOM, Alpine has already processed some attributes.
 * 
 * NOTE: text-pale-01 is NOT added here. It should only be used on pages with
 * dark backgrounds (like homepage with video). Pages with light backgrounds
 * should NOT have this class.
 */
function fixAlpineAttributes(headerContent, options = {}) {
  let fixed = headerContent;
  
  // Add x-show="navigationIn" to the three main header wrapper divs
  // These control visibility of hamburger, logo, and Talk to us button
  fixed = fixed.replace(
    /<div class="w-1\/3" x-transition:enter="transition ease-in-out duration-1000"/g,
    '<div class="w-1/3" x-show="navigationIn" x-transition:enter="transition ease-in-out duration-1000"'
  );
  fixed = fixed.replace(
    /<div class="w-1\/3 md:pl-9"/g,
    '<div class="w-1/3 md:pl-9" x-show="navigationIn"'
  );
  fixed = fixed.replace(
    /<div class="w-1\/3 flex items-center justify-end"/g,
    '<div class="w-1/3 flex items-center justify-end" x-show="navigationIn"'
  );
  
  // Add transition-colors class for smooth color transitions, but DON'T add text-pale-01
  // (text-pale-01 makes text cream/white - only for dark background pages)
  fixed = fixed.replace(
    /<div class="container px-5 md:pl-0 md:pr-9 mx-auto flex items-center "/g,
    '<div class="container px-5 md:pl-0 md:pr-9 mx-auto flex items-center transition-colors"'
  );
  
  // Fix broken bg- classes (Alpine strips the dynamic part)
  fixed = fixed.replace(
    /class="([^"]*) bg- sm:bg- ([^"]*)"/g,
    'class="$1 $2"'
  );
  fixed = fixed.replace(
    /class="([^"]*) bg- sm:bg-"/g,
    'class="$1"'
  );
  
  // Remove -translate-y-full from static class (Alpine will add it dynamically when needed)
  // This fixes the header being hidden by default on page load
  fixed = fixed.replace(
    /class="([^"]*)-translate-y-full([^"]*)"/g,
    'class="$1$2"'
  );
  
  // Remove translate-y-[-150%] from static class (Alpine will add it dynamically)
  // This fixes "Start your journey" button being hidden by default
  fixed = fixed.replace(
    /class="([^"]*)translate-y-\[-150%\]([^"]*)"/g,
    'class="$1$2"'
  );
  // Clean up double spaces that may result from removals
  fixed = fixed.replace(/class="([^"]*)  +([^"]*)"/g, 'class="$1 $2"');
  fixed = fixed.replace(/class=" /g, 'class="');
  fixed = fixed.replace(/ "/g, '"');
  
  // Fix header hide behavior: the :class binding should add -translate-y-full when scrolling down
  // When capturing HTML, the else branch often gets captured as empty '' instead of '-translate-y-full'
  // This pattern matches the header fixed div's :class binding and restores the translate
  fixed = fixed.replace(
    /:class="\(goingUp \|\| atTop \|\| languagePromptOpen \|\| open \? \( !atTop \? 'bg-\[#fcf7f11a\] backdrop-blur-xl' : '' \) : ''\)"/g,
    `:class="(goingUp || atTop || languagePromptOpen || open ? ( !atTop ? 'bg-[#fcf7f11a] backdrop-blur-xl' : '' ) : '-translate-y-full')"`
  );
  
  console.log('  → Applied Alpine.js attribute fixes');
  return fixed;
}

/**
 * Fix video elements that lose muted attribute during browser capture.
 * Videos need muted for autoplay to work in browsers.
 * 
 * Also removes static video elements from containers with data-desktop-video
 * attributes, as the WordPress JS dynamically inserts videos based on viewport.
 */
function fixVideoAttributes(mainContent) {
  let fixed = mainContent;
  
  // Remove static video elements from video-container divs that have data-desktop-video
  // The WordPress JS dynamically inserts videos based on data-desktop-video and data-mobile-video
  // If we keep the static video, we get duplicates (both static and dynamic videos play)
  const videoContainerRegex = /(<div[^>]*class="video-container[^"]*"[^>]*data-desktop-video="[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/g;
  fixed = fixed.replace(videoContainerRegex, (match, openTag, content, closeTag) => {
    // Remove <video...>...</video> elements from the container content
    const cleanedContent = content.replace(/<video[\s\S]*?<\/video>/g, '');
    console.log('  → Removed static video from video-container (JS will insert dynamically)');
    return openTag + cleanedContent + closeTag;
  });
  
  // Add muted attribute to videos that have autoplay but no muted
  fixed = fixed.replace(
    /<video([^>]*) autoplay=""([^>]*)(?<!muted[^>]*)>/g,
    (match, before, after) => {
      if (!match.includes('muted')) {
        return `<video${before} autoplay="" muted=""${after}>`;
      }
      return match;
    }
  );
  
  // Simpler approach: just add muted to any video with autoplay that doesn't have it
  if (fixed.includes('autoplay=""') && !fixed.includes('muted=""')) {
    fixed = fixed.replace(/autoplay=""/g, 'autoplay="" muted=""');
    console.log('  → Added muted attribute to autoplay videos');
  }
  
  return fixed;
}

/**
 * Fix lazy-loaded images that were captured before loading.
 * When capturing HTML before scrolling through the page, images may have:
 * - data-src instead of src (with placeholder SVG in src)
 * - data-srcset instead of srcset
 * - Missing is-loaded class on picture wrapper
 * 
 * This converts them to regular loaded images so they display properly.
 */
function fixLazyLoadedImages(content) {
  let fixed = content;
  let imagesFixed = 0;
  
  // Add is-loaded class to pegasus-lazy-wrapper pictures that don't have it
  fixed = fixed.replace(
    /class="pegasus-lazy-wrapper"(?!.*is-loaded)/g,
    'class="pegasus-lazy-wrapper is-loaded"'
  );
  
  // Convert data-srcset to srcset on source elements
  fixed = fixed.replace(
    /<source([^>]*) data-srcset="([^"]+)"([^>]*)>/g,
    (match, before, srcset, after) => {
      // Remove data-srcset and add srcset
      imagesFixed++;
      return `<source${before} srcset="${srcset}"${after}>`;
    }
  );
  
  // Convert data-src and data-srcset to src and srcset on img elements
  // Pattern: img with data-src and/or data-srcset
  fixed = fixed.replace(
    /<img([^>]*) data-src="([^"]+)"([^>]*)>/g,
    (match, before, dataSrc, after) => {
      // Replace placeholder SVG src with actual image src
      let result = match;
      
      // If there's an existing src with SVG placeholder, replace it
      if (result.includes('src="data:image/svg+xml')) {
        result = result.replace(/src="data:image\/svg\+xml[^"]*"/, `src="${dataSrc}"`);
      } else if (!result.includes(' src="')) {
        // Add src if missing
        result = result.replace('<img', `<img src="${dataSrc}"`);
      }
      
      // Remove data-src since we've moved it to src
      result = result.replace(/ data-src="[^"]*"/, '');
      
      imagesFixed++;
      return result;
    }
  );
  
  // Convert data-srcset to srcset on img elements
  fixed = fixed.replace(
    /<img([^>]*) data-srcset="([^"]+)"([^>]*)>/g,
    (match, before, dataSrcset, after) => {
      // Add srcset from data-srcset
      let result = match.replace(/ data-srcset="[^"]*"/, ` srcset="${dataSrcset}"`);
      return result;
    }
  );
  
  // Convert data-sizes to sizes
  fixed = fixed.replace(/ data-sizes="/g, ' sizes="');
  
  if (imagesFixed > 0) {
    console.log(`  → Fixed ${imagesFixed} lazy-loaded images (converted to loaded)`);
  }
  
  return fixed;
}

/**
 * Remove pre-rendered HubSpot forms that were captured after loading.
 * When capturing HTML, HubSpot forms may have already loaded and inserted
 * their form HTML. This causes duplicate forms when the page loads and the
 * script tries to create the form again.
 * 
 * We remove the pre-rendered form content but keep the container and script.
 */
function fixPrerenderedHubspotForms(content) {
  let fixed = content;
  let formsFixed = 0;
  
  // Pattern: </script><div id="hbspt-form-..." class="hbspt-form" ...>...(form content)...</div>
  // We want to remove the pre-rendered form but keep the script and container
  fixed = fixed.replace(
    /(<\/script>)<div id="hbspt-form-[^"]*" class="hbspt-form"[^>]*>.*?<\/form><\/div>\s*(<\/div><\/div>)/gs,
    (match, scriptEnd, closingDivs) => {
      formsFixed++;
      return `${scriptEnd}\n  <!-- HubSpot form will be loaded here dynamically -->\n${closingDivs}`;
    }
  );
  
  if (formsFixed > 0) {
    console.log(`  → Removed ${formsFixed} pre-rendered HubSpot form(s)`);
  }
  
  return fixed;
}

/**
 * Fix Flickity slider that was captured after initialization.
 * When capturing HTML, Flickity has already transformed the DOM:
 * - Added flickity-enabled, is-draggable classes to slider
 * - Added flickity-viewport and flickity-slider wrapper divs
 * - Added inline position/transform styles to slides
 * 
 * We need to remove these so Flickity can initialize fresh on page load.
 */
function fixFlickitySlider(content) {
  let fixed = content;
  let flickityFixed = false;
  
  // Remove flickity-enabled and is-draggable classes from slider divs
  fixed = fixed.replace(
    /class="([^"]*)\bflickity-enabled\b([^"]*)"/g,
    (match, before, after) => {
      flickityFixed = true;
      return `class="${before}${after}"`;
    }
  );
  fixed = fixed.replace(
    /class="([^"]*)\bis-draggable\b([^"]*)"/g,
    (match, before, after) => `class="${before}${after}"`
  );
  
  // Remove tabindex="0" that Flickity adds to sliders
  fixed = fixed.replace(
    /(<div[^>]*x-ref="slider"[^>]*) tabindex="0"/g,
    '$1'
  );
  
  // Remove the flickity-viewport and flickity-slider wrapper divs
  // Pattern: <div class="flickity-viewport" style="..."><div class="flickity-slider" style="...">CONTENT</div></div>
  // Just keep the CONTENT - slides should be direct children of slider for Flickity to work
  fixed = fixed.replace(
    /<div class="flickity-viewport"[^>]*><div class="flickity-slider"[^>]*>([\s\S]*?)<\/div><\/div>/g,
    (match, content) => {
      flickityFixed = true;
      return content;
    }
  );
  
  // Remove inline position/transform styles from slides that Flickity added
  // Pattern: style="--slide-width: 31.948881789137%; position: absolute; left: 0px; transform: translateX(0%);"
  // Keep --slide-width but remove position, left, transform
  fixed = fixed.replace(
    /(<div class="slide[^"]*"[^>]*) style="([^"]*)"/g,
    (match, before, styleContent) => {
      // Keep only --slide-width, remove position, left, transform
      const cleanedStyle = styleContent
        .replace(/position:\s*absolute;?\s*/g, '')
        .replace(/left:\s*[^;]+;?\s*/g, '')
        .replace(/transform:\s*translateX\([^)]+\);?\s*/g, '')
        .trim();
      
      if (cleanedStyle) {
        return `${before} style="${cleanedStyle}"`;
      }
      return before;
    }
  );
  
  // Remove is-selected class from slides (Flickity adds this to visible slides)
  fixed = fixed.replace(
    /class="slide is-selected"/g,
    'class="slide"'
  );
  
  // Remove aria-hidden="true" from slides (Flickity adds this)
  fixed = fixed.replace(
    /(<div class="slide"[^>]*) aria-hidden="true"/g,
    '$1'
  );
  
  // Clean up double spaces in class attributes
  fixed = fixed.replace(/class="([^"]*)  +([^"]*)"/g, 'class="$1 $2"');
  fixed = fixed.replace(/class=" /g, 'class="');
  fixed = fixed.replace(/ "/g, '"');
  
  if (flickityFixed) {
    console.log('  → Fixed Flickity slider (removed pre-initialized state)');
  }
  
  return fixed;
}

/**
 * Fix modal visibility - the modal container (id="modal-0") should be hidden by default.
 * When capturing the DOM, the modal content may be visible because Alpine.js hasn't
 * initialized yet. We add x-show="open" and style="display: none;" to hide it.
 */
function fixModalVisibility(content) {
  let fixed = content;
  let modalFixed = false;
  
  // Find modal containers with id="modal-0" that don't have x-show="open"
  // These modals show their content (like contact forms) by default
  fixed = fixed.replace(
    /(<div[^>]*class="Modal Modal--Full[^"]*"[^>]*id="modal-0")(?![^>]*x-show="open")([^>]*>)/g,
    (match, beforeId, afterId) => {
      modalFixed = true;
      return `${beforeId} x-show="open" style="display: none;"${afterId}`;
    }
  );
  
  if (modalFixed) {
    console.log('  → Fixed modal visibility (added x-show="open" to modal-0)');
  }
  
  return fixed;
}

/**
 * Fix Alpine.js transition state classes that get captured in hidden state.
 * When capturing the DOM, some elements may be captured with their "hidden" state
 * classes baked into the static class attribute, causing content to be invisible.
 */
function fixAlpineTransitionClasses(content) {
  let fixed = content;
  
  // Remove opacity-0 and translate-y-24 from static class attributes
  // These are Alpine.js x-intersect transition classes that should start visible
  // and only animate when Alpine.js handles them
  const beforeCount = (fixed.match(/opacity-0 translate-y-24/g) || []).length;
  
  // Only remove from static class="" attributes, not from :class="" dynamic bindings
  // Match class="..." but not :class="..."
  fixed = fixed.replace(
    /(\sclass="[^"]*) opacity-0 translate-y-24([^"]*")/g,
    '$1$2'
  );
  
  const afterCount = (fixed.match(/opacity-0 translate-y-24/g) || []).length;
  const removed = beforeCount - afterCount;
  
  if (removed > 0) {
    console.log(`  → Removed opacity-0 translate-y-24 from ${removed} static class attributes`);
  }
  
  return fixed;
}

// Extract sections
console.log('Extracting sections...');

const headerHtml = extractSection(html, '<header id="page-header"', '</header>');
const mainHtml = extractSection(html, '<main id="content">', '</main>');
const footerHtml = extractSection(html, '<footer id="site-footer"', '</footer>');

// Modal is special - it's between </footer> and </body>
let modalHtml = null;
const footerEnd = html.indexOf('</footer>');
const bodyEnd = html.indexOf('</body>');
if (footerEnd !== -1 && bodyEnd !== -1) {
  modalHtml = html.slice(footerEnd + '</footer>'.length, bodyEnd).trim();
}

// Check what we found
const sections = {
  '01-header.html': headerHtml,
  '02-main.html': mainHtml,
  '03-footer.html': footerHtml,
  '04-modal.html': modalHtml,
};

// Create output directory
fs.mkdirSync(outputDir, { recursive: true });

// Write sections
let successCount = 0;
for (const [filename, content] of Object.entries(sections)) {
  if (content) {
    let processedContent = rewriteUrls(content);
    
    // Apply Alpine.js fixes to header
    if (filename === '01-header.html') {
      processedContent = fixAlpineAttributes(processedContent);
    }
    
    // Apply video, Flickity, lazy images, HubSpot, and Alpine transition fixes to main content
    if (filename === '02-main.html') {
      processedContent = fixVideoAttributes(processedContent);
      processedContent = fixFlickitySlider(processedContent);
      processedContent = fixLazyLoadedImages(processedContent);
      processedContent = fixPrerenderedHubspotForms(processedContent);
      processedContent = fixAlpineTransitionClasses(processedContent);
    }
    
    // Apply modal visibility fix to modal content
    if (filename === '04-modal.html') {
      processedContent = fixModalVisibility(processedContent);
    }
    
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, processedContent, 'utf8');
    console.log(`  ✓ ${filename} (${processedContent.length.toLocaleString()} bytes)`);
    successCount++;
  } else {
    console.log(`  ✗ ${filename} (not found)`);
  }
}

console.log(`\nSplit complete: ${successCount}/4 sections extracted`);
console.log(`Output directory: ${outputDir}`);
