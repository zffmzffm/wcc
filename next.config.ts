import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
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
};

export default nextConfig;
