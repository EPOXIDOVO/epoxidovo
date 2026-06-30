import { SITE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld-safe";

export interface BreadcrumbItem {
  name: string;
  /** Path part, napr. "/sluzby" alebo "/realizacie" */
  path: string;
}

/**
 * BreadcrumbList JSON-LD pre Google.
 *
 * Použitie:
 *   <BreadcrumbsJsonLd items={[
 *     { name: "Domov", path: "/" },
 *     { name: "Realizácie", path: "/realizacie" },
 *   ]} />
 *
 * Google používa breadcrumb structured data na zobrazenie navigačnej cesty
 * v SERP výsledku — pomáha CTR a usability.
 *
 * Reference: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function BreadcrumbsJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path === "/" ? "" : item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
