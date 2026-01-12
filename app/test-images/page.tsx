import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Image Test Page',
};

export default function TestImagesPage() {
  const testImages = [
    'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4207.webp',
    'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-2170.webp',
    'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-4734.webp',
    'https://paracelsus-recovery.com/wp-content/uploads/2025/01/Parac-Reco-5662-1-e1739200266510.webp',
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Image Loading Test</h1>
      <p>This page tests if images can load from the WordPress server.</p>
      
      {testImages.map((url, index) => (
        <div key={index} style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px' }}>
          <h2>Image {index + 1}</h2>
          <p><strong>URL:</strong> {url}</p>
          <img 
            src={url} 
            alt={`Test image ${index + 1}`}
            style={{ maxWidth: '100%', border: '2px solid red' }}
            onLoad={() => console.log(`✓ Image ${index + 1} loaded successfully`)}
            onError={(e) => {
              console.error(`✗ Image ${index + 1} failed to load:`, e);
              const target = e.target as HTMLImageElement;
              console.error('Failed URL:', target.src);
            }}
          />
          <p><strong>Status:</strong> <span id={`status-${index}`}>Loading...</span></p>
        </div>
      ))}
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('img').forEach((img, index) => {
              img.addEventListener('load', () => {
                document.getElementById('status-' + index).textContent = '✓ Loaded';
                document.getElementById('status-' + index).style.color = 'green';
              });
              img.addEventListener('error', () => {
                document.getElementById('status-' + index).textContent = '✗ Failed';
                document.getElementById('status-' + index).style.color = 'red';
              });
            });
          `,
        }}
      />
    </div>
  );
}
