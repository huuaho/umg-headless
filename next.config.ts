import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for headless WP hosting
  output: "export",
  images: {
    // Disable image optimization for static export (no Node.js server)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
