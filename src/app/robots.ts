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

  const disallow = ["/admin", "/admin/*", "/api/*", "/auth/*", "/kupit-material/kosik"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // GEO — AI vyhľadávače a asistenti smú čítať web, aby nás vedeli
      // citovať v odpovediach. POZOR: Cloudflare „Managed robots.txt" im
      // to v dashboarde prepisuje na Disallow — treba ho vypnúť
      // (Security → Bots → Managed robots.txt), inak sú tieto riadky márne.
      { userAgent: "GPTBot", allow: "/", disallow },
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow },
      { userAgent: "ClaudeBot", allow: "/", disallow },
      { userAgent: "Claude-SearchBot", allow: "/", disallow },
      { userAgent: "Claude-User", allow: "/", disallow },
      { userAgent: "PerplexityBot", allow: "/", disallow },
      { userAgent: "Perplexity-User", allow: "/", disallow },
      { userAgent: "Google-Extended", allow: "/", disallow },
      { userAgent: "Applebot", allow: "/", disallow },
      { userAgent: "Applebot-Extended", allow: "/", disallow },
      { userAgent: "meta-externalagent", allow: "/", disallow },
      { userAgent: "Amazonbot", allow: "/", disallow },
      { userAgent: "CCBot", allow: "/", disallow },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
