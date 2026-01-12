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
  return content
    // Convert relative wp-content URLs to absolute
    .replace(/src="\/wp-content\//g, `src="${WORDPRESS_BASE_URL}/wp-content/`)
    .replace(/srcset="([^"]*\/wp-content\/[^"]*)"/g, (match, srcset) => {
      const converted = srcset.replace(/\/wp-content\//g, `${WORDPRESS_BASE_URL}/wp-content/`);
      return `srcset="${converted}"`;
    })
    // Handle picture source srcset
    .replace(/<source[^>]*srcset="([^"]*\/wp-content\/[^"]*)"/g, (match, srcset) => {
      const converted = srcset.replace(/\/wp-content\//g, `${WORDPRESS_BASE_URL}/wp-content/`);
      return match.replace(srcset, converted);
    })
    // Handle background-image URLs
    .replace(/background-image:url\(['"]?\/wp-content\//g, `background-image:url('${WORDPRESS_BASE_URL}/wp-content/`)
    // Handle href attributes
    .replace(/href="\/wp-content\//g, `href="${WORDPRESS_BASE_URL}/wp-content/`)
    // Handle preload links
    .replace(/href="\/wp-content\//g, `href="${WORDPRESS_BASE_URL}/wp-content/`);
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
