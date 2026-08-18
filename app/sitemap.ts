import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    // /about intentionally omitted — reachable on-site, noindex for search.
    {
      url: `${SITE_URL}/archive`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/ucla-sublease`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sviz`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.9,
    },
  ];
}
