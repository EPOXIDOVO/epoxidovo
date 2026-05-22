import { prisma } from "@/lib/prisma";
import { LeadTable } from "@/components/leady/LeadTable";
import type { LeadStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    source?: string;
    q?: string;
  }>;
}

const ACTIVE_STATUSES: LeadStatus[] = [
  "NEW",
  "CALLED_NO_ANSWER",
  "CONTACTED",
  "QUOTED",
];
const ARCHIVED_STATUSES: LeadStatus[] = [
  "WON",
  "REALIZED",
  "NOT_INTERESTED",
  "LOST",
];

export default async function LeadyDashboard({ searchParams }: PageProps) {
  const params = await searchParams;

  const filter: Prisma.LeadWhereInput = {};
  if (params.status === "active") {
    filter.status = { in: ACTIVE_STATUSES };
  } else if (params.status === "archived") {
    filter.status = { in: ARCHIVED_STATUSES };
  } else if (params.status && params.status !== "all") {
    filter.status = params.status as LeadStatus;
  }
  if (params.source && params.source !== "all") {
    filter.source = params.source;
  }
  if (params.q) {
    filter.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
      { phone: { contains: params.q } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where: filter,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  // Counters pre filter tabs
  const counters = await prisma.lead.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const countByStatus = Object.fromEntries(
    counters.map((c) => [c.status, c._count.status]),
  );
  const totalActive = ACTIVE_STATUSES.reduce(
    (s, st) => s + (countByStatus[st] ?? 0),
    0,
  );
  const totalArchived = ARCHIVED_STATUSES.reduce(
    (s, st) => s + (countByStatus[st] ?? 0),
    0,
  );

  return (
    <div>
      <header className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leady</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {leads.length} {leads.length === 1 ? "záznam" : "záznamov"} ·
            aktívnych {totalActive} · v archíve {totalArchived}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { v: "active", label: "Aktívne", count: totalActive },
            { v: "all", label: "Všetky", count: undefined },
            { v: "NEW", label: "Nové", count: countByStatus["NEW"] ?? 0 },
            {
              v: "CALLED_NO_ANSWER",
              label: "Nedovolané",
              count: countByStatus["CALLED_NO_ANSWER"] ?? 0,
            },
            {
              v: "CONTACTED",
              label: "Záujem",
              count: countByStatus["CONTACTED"] ?? 0,
            },
            {
              v: "QUOTED",
              label: "Ponuka odoslaná",
              count: countByStatus["QUOTED"] ?? 0,
            },
            {
              v: "archived",
              label: "Archív",
              count: totalArchived,
            },
          ].map(({ v, label, count }) => {
            const active = (params.status ?? "active") === v;
            return (
              <a
                key={v}
                href={`/leady?status=${v}`}
                className={
                  active
                    ? "px-3 py-1.5 rounded-full bg-zinc-900 text-white font-semibold"
                    : "px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400"
                }
              >
                {label}
                {count !== undefined && (
                  <span className="ml-1.5 opacity-70">({count})</span>
                )}
              </a>
            );
          })}
        </div>
      </header>

      <LeadTable leads={leads} />
    </div>
  );
}
