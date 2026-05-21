import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CATEGORIES } from "@/content/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/sluzby`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/realizacie`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE.url}/cenova-ponuka`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE.url}/o-nas`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE.url}/ochrana-sukromia`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/podmienky`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE.url}/sluzby/${cat.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages];
}
