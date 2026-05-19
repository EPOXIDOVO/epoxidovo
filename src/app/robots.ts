import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";

  // Staging / preview blokujeme úplne
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
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
