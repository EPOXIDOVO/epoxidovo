import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoicesManager } from "@/components/admin/InvoicesManager";

export const dynamic = "force-dynamic";

export default async function AdminFakturyPage() {
  const session = await auth();
  if (!session?.user) redirect("/leady/login");
  // @ts-expect-error session.user.role
  const role: string | undefined = session.user.role;
  if (role !== "ADMIN") redirect("/leady");

  const [invoices, leads] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: [{ status: "asc" }, { issuedAt: "desc" }],
      include: { lead: { select: { id: true, name: true, email: true } } },
      take: 500,
    }),
    prisma.lead.findMany({
      where: {
        status: { in: ["CONTACTED", "QUOTED", "WON", "REALIZED"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true },
      take: 200,
    }),
  ]);

  // Súhrny pre dashboard tile
  const allInvoices = await prisma.invoice.findMany({
    select: { amount: true, status: true },
  });
  const summary = allInvoices.reduce(
    (acc, inv) => {
      const amt = Number(inv.amount);
      if (inv.status === "PAID") acc.paid += amt;
      else if (inv.status === "UNPAID") acc.unpaid += amt;
      else if (inv.status === "OVERDUE") acc.overdue += amt;
      acc.total += amt;
      return acc;
    },
    { total: 0, paid: 0, unpaid: 0, overdue: 0 },
  );

  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Faktúry</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manuálna evidencia faktúr s prepojením na leady. Označuj uhradené /
          neuhradené.
        </p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="Spolu vystavené"
          value={summary.total}
          color="zinc"
          count={allInvoices.length}
        />
        <SummaryCard
          label="✅ Uhradené"
          value={summary.paid}
          color="emerald"
          count={allInvoices.filter((i) => i.status === "PAID").length}
        />
        <SummaryCard
          label="⏳ Neuhradené"
          value={summary.unpaid}
          color="amber"
          count={allInvoices.filter((i) => i.status === "UNPAID").length}
        />
        <SummaryCard
          label="🚨 Po splatnosti"
          value={summary.overdue}
          color="red"
          count={allInvoices.filter((i) => i.status === "OVERDUE").length}
        />
      </div>

      <InvoicesManager
        initialInvoices={invoices.map((inv) => ({
          ...inv,
          amount: Number(inv.amount),
          issuedAt: inv.issuedAt.toISOString(),
          dueAt: inv.dueAt?.toISOString() ?? null,
          paidAt: inv.paidAt?.toISOString() ?? null,
          createdAt: inv.createdAt.toISOString(),
          updatedAt: inv.updatedAt.toISOString(),
        }))}
        leads={leads}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  count,
  color,
}: {
  label: string;
  value: number;
  count: number;
  color: "zinc" | "emerald" | "amber" | "red";
}) {
  const colorMap = {
    zinc: "bg-zinc-50 border-zinc-200 text-zinc-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    red: "bg-red-50 border-red-200 text-red-900",
  };
  return (
    <div className={`p-4 rounded-2xl border ${colorMap[color]}`}>
      <div className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="text-2xl font-extrabold tracking-tight mt-1">
        {value.toLocaleString("sk-SK", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        })}
      </div>
      <div className="text-xs opacity-60 mt-0.5">
        {count} {count === 1 ? "faktúra" : count < 5 ? "faktúry" : "faktúr"}
      </div>
    </div>
  );
}
