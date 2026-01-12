/**
 * Script to fix double-converted URLs
 * Fixes URLs that have https://paracelsus-recovery.comhttps://paracelsus-recovery.com/
 */

const fs = require('fs');
const path = require('path');

function fixDoubleUrls(content) {
  // Fix double URLs
  return content.replace(/https:\/\/paracelsus-recovery\.comhttps:\/\/paracelsus-recovery\.com\//g, 'https://paracelsus-recovery.com/');
}

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fixDoubleUrls(content);
  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✓ Fixed double URLs in ${filePath}`);
  } else {
    console.log(`- No changes needed in ${filePath}`);
  }
}

// Process all HTML files
const programmesDir = path.join(__dirname, '../clone-kit/html/programmes-and-therapies');

if (fs.existsSync(programmesDir)) {
  const files = fs.readdirSync(programmesDir, { recursive: true });
  files.forEach(file => {
    if (file.endsWith('.html')) {
      processFile(path.join(programmesDir, file));
    }
  });
}

// Also process layout.tsx
const layoutPath = path.join(__dirname, '../app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  processFile(layoutPath);
}

console.log('\n✓ All files processed!');
