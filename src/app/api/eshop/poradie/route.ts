import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "edge";

/**
 * Poradie produktov podľa predajnosti — pre automatické radenie katalógu.
 * Vracia LEN zoradený zoznam SKU (bez počtov — predajné čísla sú interné).
 */
export async function GET() {
  try {
    const rows = await prisma.eshopOrderItem.groupBy({
      by: ["sku"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 100,
    });
    return NextResponse.json(
      { poradie: rows.map((r) => r.sku) },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ poradie: [] });
  }
}
