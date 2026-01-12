/**
 * Script to convert relative WordPress URLs to absolute URLs
 * Use this if Next.js rewrites aren't working on Vercel
 * 
 * Usage: node scripts/convert-to-absolute-urls.js
 */

const fs = require('fs');
const path = require('path');

const WORDPRESS_BASE_URL = 'https://paracelsus-recovery.com';

function convertUrls(content) {
  // First, check if URLs are already absolute (to avoid double conversion)
  if (content.includes('https://paracelsus-recovery.com/wp-content/')) {
    // Clean up any double conversions
    content = content.replace(/https:\/\/paracelsus-recovery\.comhttps:\/\/paracelsus-recovery\.com\//g, 'https://paracelsus-recovery.com/');
  }
  
  return content
    // Convert relative wp-content URLs to absolute (only if not already absolute)
    .replace(/src="\/wp-content\//g, `src="${WORDPRESS_BASE_URL}/wp-content/`)
    .replace(/srcset="([^"]*)"/g, (match, srcset) => {
      // Only convert if it contains relative wp-content URLs
      if (srcset.includes('/wp-content/') && !srcset.includes('https://')) {
        const converted = srcset.replace(/\/wp-content\//g, `${WORDPRESS_BASE_URL}/wp-content/`);
        return `srcset="${converted}"`;
      }
      return match;
    })
    // Handle picture source srcset
    .replace(/<source([^>]*)srcset="([^"]*)"/g, (match, attrs, srcset) => {
      // Only convert if it contains relative wp-content URLs
      if (srcset.includes('/wp-content/') && !srcset.includes('https://')) {
        const converted = srcset.replace(/\/wp-content\//g, `${WORDPRESS_BASE_URL}/wp-content/`);
        return `<source${attrs}srcset="${converted}"`;
      }
      return match;
    })
    // Handle background-image URLs
    .replace(/background-image:url\(['"]?\/wp-content\//g, `background-image:url('${WORDPRESS_BASE_URL}/wp-content/`)
    // Handle href attributes (only relative ones)
    .replace(/href="\/wp-content\//g, `href="${WORDPRESS_BASE_URL}/wp-content/`)
    // Handle imageSrcSet in link tags
    .replace(/imageSrcSet="([^"]*)"/g, (match, srcset) => {
      if (srcset.includes('/wp-content/') && !srcset.includes('https://')) {
        const converted = srcset.replace(/\/wp-content\//g, `${WORDPRESS_BASE_URL}/wp-content/`);
        return `imageSrcSet="${converted}"`;
      }
      return match;
    });
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const converted = convertUrls(content);
  fs.writeFileSync(filePath, converted, 'utf8');
  console.log(`✓ Converted URLs in ${filePath}`);
}

// Process all HTML files in clone-kit/html
const htmlDir = path.join(__dirname, '../clone-kit/html');
const programmesDir = path.join(htmlDir, 'programmes-and-therapies');

if (fs.existsSync(programmesDir)) {
  const files = fs.readdirSync(programmesDir, { recursive: true });
  files.forEach(file => {
    if (file.endsWith('.html')) {
      processFile(path.join(programmesDir, file));
    }
  });
}

// Also process layout.tsx if it has image URLs
const layoutPath = path.join(__dirname, '../app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  processFile(layoutPath);
}

console.log('\n✓ All files processed!');
console.log('\nNote: This converts relative URLs to absolute WordPress URLs.');
console.log('If rewrites are working, you may want to revert this change.');
