import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,
  
  // Source maps configuration
  // 
  // About the Lighthouse source map warnings:
  // 1. Turbopack dev source maps: The "Map has no mappings field" errors are a known
  //    Next.js/Turbopack development issue. These don't affect production builds.
  // 
  // 2. Third-party scripts: HubSpot's embed/v2.js and other third-party scripts
  //    cannot have source maps controlled by this application.
  // 
  // 3. WordPress theme files: The proxied /wp-content files already have source maps
  //    configured in vite.config.js (sourcemap: true), but they're served from the live site.
  // 
  // 4. Production: Source maps are disabled by default for security (prevents exposing
  //    source code). Enable only if needed for production debugging.
  productionBrowserSourceMaps: false,
  
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
