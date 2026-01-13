#!/usr/bin/env node

/**
 * Extract page-specific CSS (wp-container rules) from raw HTML
 * Usage: node scripts/extract-page-css.js <page-name>
 */

const fs = require('fs');
const path = require('path');

const pageName = process.argv[2];

if (!pageName) {
  console.log('Usage: node scripts/extract-page-css.js <page-name>');
  process.exit(1);
}

const inputFile = path.join(process.cwd(), 'clone-kit/raw', `${pageName}.outer.html`);

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

console.log(`Reading: ${inputFile}`);
let html = fs.readFileSync(inputFile, 'utf8');

// Handle JSON-encoded strings
if (html.startsWith('"') && html.endsWith('"')) {
  console.log('Detected JSON encoding, decoding...');
  try {
    html = JSON.parse(html);
  } catch (e) {
    html = html.slice(1, -1)
      .replace(/\\t/g, '\t')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
}

// Extract all wp-container CSS rules
const wpContainerRules = [];

// Look for style blocks that contain wp-container rules
const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
let match;
while ((match = styleBlockRegex.exec(html)) !== null) {
  const styleContent = match[1];
  if (styleContent.includes('wp-container')) {
    // Extract individual rules
    const ruleRegex = /\.wp-container[^{]+\{[^}]+\}/g;
    let ruleMatch;
    while ((ruleMatch = ruleRegex.exec(styleContent)) !== null) {
      wpContainerRules.push(ruleMatch[0]);
    }
  }
}

console.log(`Found ${wpContainerRules.length} wp-container rules`);

if (wpContainerRules.length > 0) {
  // Create output directory
  const outputDir = path.join(process.cwd(), 'clone-kit/html', pageName);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Add !important to max-width values that don't already have it
  // This is needed because WordPress core CSS has !important on .is-layout-constrained rules
  // that would otherwise override our page-specific max-width values
  const processedRules = wpContainerRules.map(rule => {
    // Find max-width values without !important and add it
    return rule.replace(/max-width:\s*(\d+(?:px|%|em|rem|vw)?)(?!\s*!important)/g, 'max-width:$1 !important');
  });
  
  // Write CSS file
  const cssContent = `/* Page-specific wp-container CSS for ${pageName} */\n` + 
    processedRules.join('\n');
  
  const outputFile = path.join(outputDir, '00-page-css.css');
  fs.writeFileSync(outputFile, cssContent, 'utf8');
  console.log(`Wrote: ${outputFile} (${cssContent.length.toLocaleString()} bytes)`);
}
