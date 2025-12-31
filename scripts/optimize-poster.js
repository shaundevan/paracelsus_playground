const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/wp-content/uploads/2025/02/poster.png');
const outputPath = path.join(__dirname, '../public/wp-content/uploads/2025/02/poster.webp');

async function optimizePoster() {
  try {
    // Get input file size
    const inputStats = fs.statSync(inputPath);
    console.log(`Input: poster.png (${(inputStats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

    // Resize to 1920x1080 (common display size) and convert to WebP
    await sharp(inputPath)
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Get output file size
    const outputStats = fs.statSync(outputPath);
    console.log(`Output: poster.webp (${(outputStats.size / 1024).toFixed(0)} KB)`);
    console.log(`Reduction: ${((1 - outputStats.size / inputStats.size) * 100).toFixed(1)}%`);
    
    console.log('\n✅ Done! Update your HTML to use poster.webp');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

optimizePoster();

