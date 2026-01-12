/**
 * Script to test if WordPress image URLs are accessible
 * Run this to verify images can be loaded from the WordPress server
 */

const https = require('https');

const testUrls = [
  'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4207.webp',
  'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-2170.webp',
  'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4734.webp',
  'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-5662-1-e1739200266510.webp',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    https.get(url, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      const contentLength = res.headers['content-length'];
      const elapsed = Date.now() - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          statusCode,
          contentType,
          contentLength,
          elapsed,
          accessible: statusCode === 200,
          size: data.length,
        });
      });
    }).on('error', (error) => {
      resolve({
        url,
        statusCode: 'ERROR',
        error: error.message,
        accessible: false,
        elapsed: Date.now() - startTime,
      });
    });
  });
}

async function runTests() {
  console.log('Testing WordPress image URLs...\n');
  
  for (const url of testUrls) {
    const result = await testUrl(url);
    if (result.accessible) {
      console.log(`✓ ${url}`);
      console.log(`  Status: ${result.statusCode}`);
      console.log(`  Content-Type: ${result.contentType}`);
      console.log(`  Size: ${(result.size / 1024).toFixed(2)} KB`);
      console.log(`  Time: ${result.elapsed}ms\n`);
    } else {
      console.log(`✗ ${url}`);
      console.log(`  Status: ${result.statusCode}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      console.log(`  Time: ${result.elapsed}ms\n`);
    }
  }
  
  console.log('Test complete!');
}

runTests().catch(console.error);
