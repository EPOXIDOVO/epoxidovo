import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CATEGORIES } from "@/content/categories";
import { CITIES } from "@/content/cities";
import { CERT_LIST } from "@/content/certifications";
import { MATERIALY } from "@/lib/materialy";
import { OBSAH_KATEGORIE, SKUPINY } from "@/lib/obsah-kategorie";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/sluzby`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/realizacie`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE.url}/cenova-ponuka`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE.url}/ochrana-sukromia`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/obchodne-podmienky`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/reklamacny-poriadok`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/odstupenie-od-zmluvy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/eshop`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/eshop/znacky`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE.url}/kalkulacka`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/vzorkovnik`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/ai-vizualizer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/navrhni-podlahu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/kupit-material/b2b`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Kurz — SK + EN pár s hreflang alternates (Google párovanie jazykových verzií)
  const coursePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/kurz`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          sk: `${SITE.url}/kurz`,
          en: `${SITE.url}/en/epoxy-flooring-course`,
          "x-default": `${SITE.url}/kurz`,
        },
      },
    },
    {
      url: `${SITE.url}/en/epoxy-flooring-course`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          sk: `${SITE.url}/kurz`,
          en: `${SITE.url}/en/epoxy-flooring-course`,
          "x-default": `${SITE.url}/kurz`,
        },
      },
    },
  ];

  const servicePages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE.url}/sluzby/${cat.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Statické kategórie e-shopu — /eshop/kategoria/[slug]
  const katSlugy = [
    ...SKUPINY.map((s) => s.id),
    ...OBSAH_KATEGORIE.map((k) => k.id).filter((id) => id !== "ostatne" && !SKUPINY.some((s) => s.id === id)),
  ];
  const kategoriePages: MetadataRoute.Sitemap = katSlugy.map((slug) => ({
    url: `${SITE.url}/eshop/kategoria/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Local SEO city landing pages
  const cityPages: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE.url}/epoxidove-podlahy/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Certification landing pages — ESD/HACCP/ATEX/Protišmyk (B2B commercial intent)
  const certPages: MetadataRoute.Sitemap = CERT_LIST.map((slug) => ({
    url: `${SITE.url}/podlahy/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // E-shop produkty (Sika + TopStone) — 202 stránok s Product schema
  const productPages: MetadataRoute.Sitemap = MATERIALY.map((m) => ({
    url: `${SITE.url}/eshop/${m.sku}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...kategoriePages, ...coursePages, ...servicePages, ...cityPages, ...certPages, ...productPages];
}
