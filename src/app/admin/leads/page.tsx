import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Download, Inbox } from "lucide-react";
import { auth } from "@/lib/auth";
import { getLeads, isDbAvailable, STATUS_LABELS, STATUS_COLORS } from "@/lib/leads";
import type { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: LeadStatus; q?: string; page?: string }>;
}

const PAGE_SIZE = 30;

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const status = params.status;
  const search = params.q?.trim() || undefined;

  const { leads, totalCount } = await getLeads({
    status,
    search,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const dbReady = isDbAvailable();

  return (
    <div>
      <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Leady
          </h1>
          <p className="mt-2 text-[var(--color-fg-muted)]">
            {totalCount} {totalCount === 1 ? "dopyt" : totalCount < 5 ? "dopyty" : "dopytov"}
          </p>
        </div>
        <a
          href="/api/admin/leads/export"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-fg)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" aria-hidden />
          Export CSV
        </a>
      </header>

      {/* Filter + search */}
      <form
        method="get"
        className="mb-6 flex flex-col md:flex-row items-stretch gap-3 bg-white p-4 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-fg-subtle)]" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Hľadať meno, email, telefón…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[#3db6e8] text-sm"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="px-3 py-2.5 rounded-lg border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[#3db6e8] text-sm bg-white"
        >
          <option value="">Všetky stavy</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4]"
        >
          Filtrovať
        </button>
      </form>

      {!dbReady ? (
        <EmptyState message="Databáza nie je pripojená. Pripoj DATABASE_URL." />
      ) : leads.length === 0 ? (
        <EmptyState message={search || status ? "Žiadne výsledky pre tento filter." : "Zatiaľ žiadne dopyty."} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-bg-soft)] text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Meno</th>
                    <th className="px-4 py-3 text-left">Kontakt</th>
                    <th className="px-4 py-3 text-left">Záujem</th>
                    <th className="px-4 py-3 text-left">Stav</th>
                    <th className="px-4 py-3 text-left">Dátum</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[var(--color-bg-soft)] transition-colors">
                      <td className="px-4 py-3 font-medium">{lead.name}</td>
                      <td className="px-4 py-3 text-[var(--color-fg-muted)]">
                        <div>{lead.email}</div>
                        {lead.phone && <div className="text-xs">{lead.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-fg-muted)]">
                        {lead.service ?? "–"}
                        {lead.area && <span className="text-xs"> · {lead.area} m²</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status]}`}>
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-fg-muted)] tabular-nums whitespace-nowrap">
                        {new Intl.DateTimeFormat("sk-SK", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }).format(lead.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-[#3db6e8] hover:underline font-medium text-sm"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <nav aria-label="Stránkovanie" className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={{ pathname: "/admin/leads", query: { ...(status ? { status } : {}), ...(search ? { q: search } : {}), page: p } }}
                  className={`min-w-9 h-9 inline-flex items-center justify-center rounded-lg text-sm font-medium ${
                    p === page
                      ? "bg-[#3db6e8] text-white"
                      : "bg-white border border-[var(--color-border)] hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl p-16 border border-[var(--color-border)] text-center">
      <Inbox className="w-12 h-12 text-[var(--color-fg-subtle)] mx-auto" aria-hidden />
      <p className="mt-4 text-[var(--color-fg-muted)]">{message}</p>
    </div>
  );
}
