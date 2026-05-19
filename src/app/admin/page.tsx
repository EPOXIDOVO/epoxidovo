import Link from "next/link";
import {
  Inbox,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Database,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeadStats, isDbAvailable } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const stats = await getLeadStats();
  const dbReady = isDbAvailable();

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Prehľad
        </h1>
        <p className="mt-2 text-[var(--color-fg-muted)]">
          Vitaj späť, {session.user.name ?? session.user.email}.
        </p>
      </header>

      {!dbReady && (
        <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
          <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div>
            <h3 className="font-semibold text-amber-900">
              Databáza nie je pripojená
            </h3>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              Pre zobrazenie leadov potrebujem <code>DATABASE_URL</code> v env
              premenných. Vytvor zadarmo Postgres na <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="underline font-medium">neon.tech</a> a pošli mi connection string. Bez DB sa dopyty z formulára iba logujú do konzoly.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          icon={Inbox}
          label="Celkom leadov"
          value={stats?.total ?? 0}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Nových (7 dní)"
          value={stats?.newThisWeek ?? 0}
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={CheckCircle2}
          label="Vyhraných"
          value={stats?.won ?? 0}
          color="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={XCircle}
          label="Konverzia"
          value={`${stats?.conversionRate ?? 0}%`}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      <Link
        href="/admin/leads"
        className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] transition-colors"
      >
        Zobraziť všetky leady
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Inbox;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-[var(--color-border)] shadow-[var(--shadow-card)]">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" aria-hidden />
      </div>
      <div className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-sm text-[var(--color-fg-muted)]">{label}</div>
    </div>
  );
}
