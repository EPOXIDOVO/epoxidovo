import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "edge";

/** Štatistiky objednávok pre /admin/ceny — len s platnou admin session. */
export async function GET(req: NextRequest) {
  const ok = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [orders, perSku, posledne] = await Promise.all([
    prisma.eshopOrder.aggregate({
      _count: { id: true },
      _sum: { subtotalEur: true },
    }),
    prisma.eshopOrderItem.groupBy({
      by: ["sku"],
      _sum: { qty: true },
      _count: { orderId: true },
    }),
    prisma.eshopOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        name: true,
        subtotalEur: true,
        paymentId: true,
        items: { select: { qty: true } },
      },
    }),
  ]);

  // tržba per SKU (qty × cena v čase objednávky)
  const trzbaRows = await prisma.eshopOrderItem.findMany({
    select: { sku: true, qty: true, cenaEur: true },
  });
  const trzba = new Map<string, number>();
  for (const r of trzbaRows) {
    if (r.cenaEur != null) {
      trzba.set(r.sku, (trzba.get(r.sku) ?? 0) + r.qty * r.cenaEur);
    }
  }

  return NextResponse.json({
    ok: true,
    objednavok: orders._count.id,
    trzbaSpolu: Math.round((orders._sum.subtotalEur ?? 0) * 100) / 100,
    produkty: perSku.map((p) => ({
      sku: p.sku,
      kusov: p._sum.qty ?? 0,
      objednavok: p._count.orderId,
      trzba: Math.round((trzba.get(p.sku) ?? 0) * 100) / 100,
    })),
    posledne: posledne.map((o) => ({
      id: o.id,
      kedy: o.createdAt.toISOString(),
      meno: o.name,
      suma: o.subtotalEur,
      platba: o.paymentId,
      kusov: o.items.reduce((s, i) => s + i.qty, 0),
    })),
  });
}
