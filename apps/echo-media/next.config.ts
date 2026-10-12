import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@umg/api", "@umg/config", "@umg/ui"],
  // Pin the build ID so a content-only rebuild yields byte-identical HTML for
  // unchanged articles. Next stamps the build ID into every page's inlined RSC
  // payload, so a fresh ID per build makes all ~150 pages look modified and the
  // FTPS delta sync re-uploads the entire site. Measured 2026-10-12: two
  // consecutive builds of identical content differed in 781/794 files; pinning
  // the ID cut that to 11 (non-deterministic RSC chunk ordering, harmless).
  // A code change moves GITHUB_SHA, which correctly invalidates everything.
  generateBuildId: () => process.env.GITHUB_SHA ?? "dev",
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
