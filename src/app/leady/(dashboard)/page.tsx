export const runtime = "edge";

import { prisma } from "@/lib/prisma";
import { LeadCard } from "@/components/leady/LeadCard";
import type { LeadStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    q?: string;
  }>;
}

/**
 * Call agent dashboard.
 *
 * 4 záložky (tabs):
 *   - novy:        status=NEW (čerstvé leady, ešte sa nevolalo)
 *   - nedovolany:  status=CALLED_NO_ANSWER A nextCallAt <= now (treba zavolať znova)
 *   - planovany:   nextCallAt > now (čaká na naplánovaný čas)
 *   - vsetky:      všetko aktívne (NEW, CALLED_NO_ANSWER, CONTACTED, QUOTED)
 */
const ARCHIVED_STATUSES: LeadStatus[] = [
  "WON",
  "REALIZED",
  "NOT_INTERESTED",
  "LOST",
];

export default async function LeadyDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = params.tab ?? "novy";
  const now = new Date();

  // Filter podľa záložky
  let where: Prisma.LeadWhereInput;
  switch (tab) {
    case "nedovolany":
      where = {
        status: "CALLED_NO_ANSWER",
        OR: [{ nextCallAt: null }, { nextCallAt: { lte: now } }],
      };
      break;
    case "planovany":
      where = {
        nextCallAt: { gt: now },
      };
      break;
    case "vsetky":
      where = {
        status: { notIn: ARCHIVED_STATUSES },
      };
      break;
    case "archiv":
      where = {
        status: { in: ARCHIVED_STATUSES },
      };
      break;
    case "novy":
    default:
      where = { status: "NEW" };
      break;
  }

  if (params.q) {
    where.AND = [
      {
        OR: [
          { name: { contains: params.q, mode: "insensitive" } },
          { email: { contains: params.q, mode: "insensitive" } },
          { phone: { contains: params.q } },
        ],
      },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy:
      tab === "planovany"
        ? [{ nextCallAt: "asc" }]
        : tab === "nedovolany"
          ? [{ nextCallAt: "asc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }],
    take: 200,
  });

  // Počítadla pre taby
  const [novyCount, nedovolanyCount, planovanyCount, vsetkyCount] =
    await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count({
        where: {
          status: "CALLED_NO_ANSWER",
          OR: [{ nextCallAt: null }, { nextCallAt: { lte: now } }],
        },
      }),
      prisma.lead.count({ where: { nextCallAt: { gt: now } } }),
      prisma.lead.count({ where: { status: { notIn: ARCHIVED_STATUSES } } }),
    ]);

  const totalToCall = novyCount + nedovolanyCount;

  return (
    <div>
      {/* Big page title */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          📞 Leady na volanie{" "}
          <span className="text-[#3db6e8]">({totalToCall})</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Čerstvé + nedovolané čakajú na hovor
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { v: "novy", label: "🟢 Nové", count: novyCount, color: "emerald" },
          {
            v: "nedovolany",
            label: "🟡 Nedovolané",
            count: nedovolanyCount,
            color: "amber",
          },
          {
            v: "planovany",
            label: "📅 Naplánované",
            count: planovanyCount,
            color: "blue",
          },
          {
            v: "vsetky",
            label: "📋 Všetky aktívne",
            count: vsetkyCount,
            color: "zinc",
          },
          {
            v: "archiv",
            label: "📦 Archív",
            count: undefined,
            color: "zinc",
          },
        ].map(({ v, label, count }) => {
          const active = tab === v;
          return (
            <a
              key={v}
              href={`/leady?tab=${v}`}
              className={
                active
                  ? "px-4 py-2.5 rounded-xl bg-[#f97316] text-white font-bold text-sm shadow-[0_6px_18px_rgba(249,115,22,0.35)]"
                  : "px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-400 hover:bg-zinc-50"
              }
            >
              {label}
              {count !== undefined && (
                <span
                  className={
                    active
                      ? "ml-2 inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-white/20 text-white text-xs font-bold"
                      : "ml-2 inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold"
                  }
                >
                  {count}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Lead cards */}
      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold mb-1">Žiadne leady v tejto kategórii</h3>
          <p className="text-sm text-zinc-500">
            {tab === "novy" && "Všetky nové leady sú spracované — počkaj na nový dopyt."}
            {tab === "nedovolany" && "Žiadne čakajúce nedovolané hovory."}
            {tab === "planovany" && "Nemáš naplánovaný žiadny callback."}
            {tab === "vsetky" && "Žiadne aktívne leady."}
            {tab === "archiv" && "Archív je prázdny."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
