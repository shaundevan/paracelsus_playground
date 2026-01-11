import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,
  
  // Headers for caching static assets
  async headers() {
    return [
      {
        // Cache CSS files for 1 year (immutable)
        source: "/wp-content/themes/pegasus/dist/assets/styles/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache fonts for 1 year (immutable)
        source: "/wp-content/themes/pegasus/assets/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache other static assets
        source: "/wp-content/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache WordPress includes
        source: "/wp-includes/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Rewrite WordPress asset URLs to proxy from the live site
  async rewrites() {
    return [
      {
        source: "/wp-content/:path*",
        destination: "https://paracelsus-recovery.com/wp-content/:path*",
      },
      {
        source: "/wp-includes/:path*",
        destination: "https://paracelsus-recovery.com/wp-includes/:path*",
      },
    ];
  },
};

export default nextConfig;
