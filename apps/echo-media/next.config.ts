import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@umg/api", "@umg/config", "@umg/ui"],
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.echo-media.info",
      },
      {
        protocol: "https",
        hostname: "echo-media.info",
      },
      {
        protocol: "https",
        hostname: "api.echo-media.info",
      },
    ],
  },
};

export default nextConfig;
