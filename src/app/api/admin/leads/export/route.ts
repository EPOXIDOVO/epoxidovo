export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeads, isDbAvailable, STATUS_LABELS } from "@/lib/leads";

/**
 * GET /api/admin/leads/export — CSV export všetkých leadov.
 * Auth required.
 *
 * Stĺpce: ID, Vytvorené, Meno, Email, Telefón, Typ priestoru, Záujem, Plocha,
 *         Správa, Stav, Zdroj, UTM Source, UTM Medium, UTM Campaign, Referrer.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isDbAvailable()) {
    return NextResponse.json(
      { error: "db_unavailable" },
      { status: 503 },
    );
  }

  const { leads } = await getLeads({ limit: 10000 });

  // CSV escape — wrap polia obsahujúce ; , " alebo newline do "..."
  const esc = (v: unknown): string => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n;]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("sk-SK", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);

  const headers = [
    "ID",
    "Vytvorené",
    "Meno",
    "Email",
    "Telefón",
    "Typ priestoru",
    "Záujem",
    "Plocha (m²)",
    "Správa",
    "Stav",
    "Zdroj",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "Referrer",
  ];

  const rows = leads.map((l) =>
    [
      l.id,
      fmt(l.createdAt),
      l.name,
      l.email,
      l.phone ?? "",
      l.spaceType ?? "",
      l.service ?? "",
      l.area ?? "",
      l.message ?? "",
      STATUS_LABELS[l.status],
      l.source,
      l.utmSource ?? "",
      l.utmMedium ?? "",
      l.utmCampaign ?? "",
      l.referrer ?? "",
    ]
      .map(esc)
      .join(";"),
  );

  // BOM pre Excel správnu UTF-8 detekciu
  const csv = "﻿" + headers.join(";") + "\n" + rows.join("\n");

  const filename = `epoxidovo-leady-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
