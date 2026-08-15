export const runtime = "edge";

import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";
import { SITE } from "@/lib/site";

/**
 * FÁZA 6 — Heureka XML feed.
 * Do feedu idú LEN produkty s feedEnabled: true a potvrdenou cenou —
 * chémia dodávateľských značiek sa na porovnávače nedáva (feed je pre
 * náradie, spotrebný materiál a OOPP). Kým žiadny produkt nemá
 * feedEnabled zapnuté, feed je platný a prázdny.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const CATEGORY_TEXT: Record<string, string> = {
  naradie: "Dom a záhrada | Náradie",
  spotrebny: "Dom a záhrada | Náradie | Maliarske potreby",
  oopp: "Dom a záhrada | Ochranné pracovné pomôcky",
  doplnok: "Dom a záhrada | Stavebniny",
};

export async function GET() {
  const items = PRODUCTS.filter(
    (p) => p.feedEnabled && p.priceRetail != null,
  )
    .map(
      (p) => `  <SHOPITEM>
    <ITEM_ID>${esc(p.id)}</ITEM_ID>
    <PRODUCTNAME>${esc(`${p.brand} ${p.name}`)}</PRODUCTNAME>
    <DESCRIPTION>${esc(p.description)}</DESCRIPTION>
    <URL>${SITE.url}/eshop/${esc(p.skuRef ?? p.id)}</URL>
    ${p.images[0] ? `<IMGURL>${SITE.url}${esc(p.images[0])}</IMGURL>` : ""}
    <PRICE_VAT>${(p.priceRetail as number).toFixed(2)}</PRICE_VAT>
    ${p.ean ? `<EAN>${esc(p.ean)}</EAN>` : ""}
    <CATEGORYTEXT>${esc(CATEGORY_TEXT[p.category] ?? "Dom a záhrada | Stavebniny")}</CATEGORYTEXT>
    <DELIVERY_DATE>3</DELIVERY_DATE>
  </SHOPITEM>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>\n<SHOP>\n${items}\n</SHOP>\n`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
