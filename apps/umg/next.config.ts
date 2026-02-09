import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@umg/api", "@umg/config", "@umg/ui"],
  // Enable static export for headless WP hosting
  output: "export",
  trailingSlash: true,
  images: {
    // Disable image optimization for static export (no Node.js server)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "diplomaticwatch.com",
      },
      {
        protocol: "https",
        hostname: "www.diplomaticwatch.com",
      },
      {
        protocol: "https",
        hostname: "www.echo-media.info",
      },
      {
        protocol: "https",
        hostname: "www.internationalspectrum.org",
      },
      {
        protocol: "https",
        hostname: "www.unitedmediadc.com",
      },
      {
        protocol: "https",
        hostname: "unitedmediadc.com",
      },
    ],
  },
};

export default nextConfig;
