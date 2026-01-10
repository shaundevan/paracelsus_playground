const fs = require('fs');
const path = require('path');
const https = require('https');

// Directories
const HTML_DIR = path.join(__dirname, '..', 'clone-kit', 'html');
const PUBLIC_UPLOADS = path.join(__dirname, '..', 'public', 'wp-content', 'uploads');
const WP_CONTENT_UPLOADS = path.join(__dirname, '..', '..', 'WP_CONTENT', 'uploads');

// Regex to match paracelsus-recovery.com image URLs
const URL_PATTERN = /https:\/\/paracelsus-recovery\.com\/wp-content\/uploads\/([^\s"'<>]+\.(webp|jpg|jpeg|png|gif|svg|mp4))/gi;

// Files to scan
const HTML_FILES = [
  'homepage.outer.html',
  '02-main.html',
  '01-header.html',
  '03-footer.html',
  '04-modal.html',
  '05-contact-modal.html'
];

// Extract all unique image URLs from HTML files
function extractImageUrls() {
  const urls = new Set();
  
  for (const file of HTML_FILES) {
    const filePath = path.join(HTML_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${file} (not found)`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    
    // Reset regex lastIndex for each file
    URL_PATTERN.lastIndex = 0;
    
    while ((match = URL_PATTERN.exec(content)) !== null) {
      urls.add(match[1]); // Add just the path part (e.g., "2025/01/image.webp")
    }
  }
  
  return Array.from(urls);
}

// Check if file already exists locally
function fileExistsLocally(relativePath) {
  const localPath = path.join(PUBLIC_UPLOADS, relativePath);
  return fs.existsSync(localPath);
}

// Check if file exists in WP_CONTENT
function fileExistsInWpContent(relativePath) {
  const wpPath = path.join(WP_CONTENT_UPLOADS, relativePath);
  return fs.existsSync(wpPath);
}

// Copy file from WP_CONTENT to public
function copyFromWpContent(relativePath) {
  const sourcePath = path.join(WP_CONTENT_UPLOADS, relativePath);
  const destPath = path.join(PUBLIC_UPLOADS, relativePath);
  
  // Create directory structure
  const destDir = path.dirname(destPath);
  fs.mkdirSync(destDir, { recursive: true });
  
  fs.copyFileSync(sourcePath, destPath);
  console.log(`✓ Copied from WP_CONTENT: ${relativePath}`);
}

// Download file from remote URL
function downloadFile(relativePath) {
  return new Promise((resolve, reject) => {
    const url = `https://paracelsus-recovery.com/wp-content/uploads/${relativePath}`;
    const destPath = path.join(PUBLIC_UPLOADS, relativePath);
    
    // Create directory structure
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        const redirectUrl = response.headers.location;
        https.get(redirectUrl, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            fs.unlinkSync(destPath);
            reject(new Error(`Failed to download ${relativePath}: ${redirectResponse.statusCode}`));
            return;
          }
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${relativePath}`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlinkSync(destPath);
          reject(err);
        });
        return;
      }
      
      if (response.statusCode !== 200) {
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download ${relativePath}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${relativePath}`);
        resolve();
      });
    }).on('error', (err) => {
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });
  });
}

// Main function
async function main() {
  console.log('=== Image Localization Script ===\n');
  
  // Step 1: Extract all image URLs
  console.log('Scanning HTML files for image URLs...');
  const imagePaths = extractImageUrls();
  console.log(`Found ${imagePaths.length} unique image/media URLs\n`);
  
  // Step 2: Categorize images
  const alreadyLocal = [];
  const canCopy = [];
  const needDownload = [];
  
  for (const imgPath of imagePaths) {
    if (fileExistsLocally(imgPath)) {
      alreadyLocal.push(imgPath);
    } else if (fileExistsInWpContent(imgPath)) {
      canCopy.push(imgPath);
    } else {
      needDownload.push(imgPath);
    }
  }
  
  console.log(`Already in public/: ${alreadyLocal.length}`);
  console.log(`Can copy from WP_CONTENT: ${canCopy.length}`);
  console.log(`Need to download: ${needDownload.length}\n`);
  
  // Step 3: Copy from WP_CONTENT
  if (canCopy.length > 0) {
    console.log('--- Copying from WP_CONTENT ---');
    for (const imgPath of canCopy) {
      try {
        copyFromWpContent(imgPath);
      } catch (err) {
        console.error(`✗ Failed to copy ${imgPath}: ${err.message}`);
      }
    }
    console.log('');
  }
  
  // Step 4: Download missing files
  if (needDownload.length > 0) {
    console.log('--- Downloading from paracelsus-recovery.com ---');
    for (const imgPath of needDownload) {
      try {
        await downloadFile(imgPath);
      } catch (err) {
        console.error(`✗ Failed to download ${imgPath}: ${err.message}`);
      }
    }
    console.log('');
  }
  
  console.log('=== Done ===');
  console.log(`Total images processed: ${imagePaths.length}`);
  console.log(`Already local: ${alreadyLocal.length}`);
  console.log(`Copied: ${canCopy.length}`);
  console.log(`Downloaded: ${needDownload.length}`);
}

main().catch(console.error);
