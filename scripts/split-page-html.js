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
    // Convert absolute URLs to relative
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
  // Clean up double spaces that may result from removals
  fixed = fixed.replace(/class="([^"]*)  +([^"]*)"/g, 'class="$1 $2"');
  fixed = fixed.replace(/class=" /g, 'class="');
  fixed = fixed.replace(/ "/g, '"');
  
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
    
    // Apply video fixes to main content
    if (filename === '02-main.html') {
      processedContent = fixVideoAttributes(processedContent);
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
