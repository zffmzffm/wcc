import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages
  output: 'export',

  // Image optimization configuration
  images: {
    // Static export requires unoptimized images
    unoptimized: true,
    // Allow external images from flag CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
    ],
  },

  // Experimental optimizations
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['leaflet', 'react-leaflet'],
  },

  // Note: Security headers moved to public/_headers for Cloudflare Pages
};

export default nextConfig;
