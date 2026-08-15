export const runtime = "edge";

import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { SITE } from "@/lib/site";

/**
 * FÁZA 6 — Google Merchant XML feed (RSS 2.0 + g: namespace).
 * Len feedEnabled: true produkty s cenou — viď heureka feed.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function GET() {
  const items = PRODUCTS.filter(
    (p) => p.feedEnabled && p.priceRetail != null,
  )
    .map(
      (p) => `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(`${p.brand} ${p.name}`)}</g:title>
      <g:description>${esc(p.description)}</g:description>
      <g:link>${SITE.url}/eshop/${esc(p.skuRef ?? p.id)}</g:link>
      ${p.images[0] ? `<g:image_link>${SITE.url}${esc(p.images[0])}</g:image_link>` : ""}
      <g:price>${(p.priceRetail as number).toFixed(2)} EUR</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${esc(p.brand)}</g:brand>
      ${p.ean ? `<g:gtin>${esc(p.ean)}</g:gtin>` : "<g:identifier_exists>false</g:identifier_exists>"}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(SITE.name)} — materiály a náradie</title>
    <link>${SITE.url}/eshop</link>
    <description>Náradie a spotrebný materiál na epoxidové podlahy</description>
${items}
  </channel>
</rss>
`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
