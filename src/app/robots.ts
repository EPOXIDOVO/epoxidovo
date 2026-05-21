import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Prod = Netlify CONTEXT=production OR Vercel VERCEL_ENV=production OR NODE_ENV=production
  const isProd =
    process.env.CONTEXT === "production" ||
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_BLOCK_ROBOTS);

  if (!isProd) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${SITE.url}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/auth/*"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
