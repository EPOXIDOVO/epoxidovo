export const runtime = "edge";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VisualizerGallery } from "@/components/admin/VisualizerGallery";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; filter?: string }>;
}

const PAGE_SIZE = 24;

/**
 * Admin gallery — všetky generácie AI vizualizera.
 * Slúži na kontrolu kvality AI výsledkov.
 * ADMIN role only (chránené aj cez admin layout role check).
 */
export default async function VisualizerAdminPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const filter = params.filter ?? "all"; // all | ok | failed

  const where =
    filter === "ok"
      ? { ok: true }
      : filter === "failed"
        ? { ok: false }
        : {};

  const [items, totalCount, stats] = await Promise.all([
    prisma.visualizerGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        ip: true,
        texture: true,
        color: true,
        ok: true,
        errorCode: true,
        inputImageData: true,
        inputMimeType: true,
        outputImageData: true,
        outputMimeType: true,
      },
    }),
    prisma.visualizerGeneration.count({ where }),
    Promise.all([
      prisma.visualizerGeneration.count(),
      prisma.visualizerGeneration.count({ where: { ok: true } }),
      prisma.visualizerGeneration.count({ where: { ok: false } }),
    ]),
  ]);

  const [totalAll, totalOk, totalFailed] = stats;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          AI Vizualizér — Gallery
        </h1>
        <p className="mt-2 text-[var(--color-fg-muted)]">
          Všetky generácie AI vizualizera. Pozri si výsledky a over si kvalitu
          AI.
        </p>

        {/* Stats karty */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Celkom" value={totalAll} color="bg-blue-50 text-blue-700" />
          <StatCard label="Úspešné" value={totalOk} color="bg-emerald-50 text-emerald-700" />
          <StatCard label="Zlyhané" value={totalFailed} color="bg-red-50 text-red-700" />
        </div>

        {/* Filter */}
        <div className="mt-5 inline-flex rounded-full bg-[var(--color-bg-muted)] p-1">
          <FilterTab href="/admin/vizualizer" label="Všetky" active={filter === "all"} />
          <FilterTab
            href="/admin/vizualizer?filter=ok"
            label="✓ Úspešné"
            active={filter === "ok"}
          />
          <FilterTab
            href="/admin/vizualizer?filter=failed"
            label="✗ Zlyhané"
            active={filter === "failed"}
          />
        </div>
      </header>

      <VisualizerGallery items={items} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/vizualizer?page=${p}${filter !== "all" ? `&filter=${filter}` : ""}`}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? "bg-[var(--color-fg)] text-white"
                  : "bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)]"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-[var(--color-fg-muted)]">
          <p className="text-lg">Zatiaľ žiadne generácie.</p>
          <p className="mt-1 text-sm">
            Keď zákazníci začnú používať AI Vizualizér, objavia sa tu.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-[var(--shadow-card)]">
      <div className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${color}`}>
        {label}
      </div>
      <div className="mt-2 text-3xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function FilterTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        active
          ? "bg-white text-[var(--color-fg)] shadow-sm"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
      }`}
    >
      {label}
    </a>
  );
}
