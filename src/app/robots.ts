import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Prod detection — Cloudflare Pages (CF_PAGES_BRANCH=main) alebo generic NODE_ENV.
  // NEXT_PUBLIC_BLOCK_ROBOTS umožňuje force-block aj na produkcii (napr. staging).
  const isProd =
    process.env.CF_PAGES_BRANCH === "main" ||
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
  };
}
