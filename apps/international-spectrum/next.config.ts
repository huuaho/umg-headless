import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@umg/api", "@umg/config", "@umg/ui"],
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.internationalspectrum.org",
      },
      {
        protocol: "https",
        hostname: "internationalspectrum.org",
      },
      {
        protocol: "https",
        hostname: "api.internationalspectrum.org",
      },
      {
        protocol: "https",
        hostname: "api.unitedmediadc.com",
      },
    ],
  },
};

export default nextConfig;
