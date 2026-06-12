import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Explicitly welcomes AI crawlers — the point of the AEO effort is to be
// discoverable and citable by AI answer engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      {
        userAgent: [
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://unitedmediadc.com/sitemap.xml",
  };
}
