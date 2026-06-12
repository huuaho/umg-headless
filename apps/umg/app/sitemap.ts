import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";

export const dynamic = "force-static";

const BASE_URL = "https://unitedmediadc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/how-to-enter", changeFrequency: "weekly", priority: 0.9 },
    { path: "/judges-panel", changeFrequency: "monthly", priority: 0.6 },
    { path: "/photo-submission", changeFrequency: "monthly", priority: 0.7 },
    { path: "/search", changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes = categories.map((category) => ({
    path: `/category/${category.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes].map((route) => ({
    url: `${BASE_URL}${route.path}/`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
