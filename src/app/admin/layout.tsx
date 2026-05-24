export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, LayoutDashboard, LogOut, Settings, Users, PhoneCall, Receipt } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Prehľad", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leady", icon: Inbox },
  { href: "/admin/faktury", label: "Faktúry", icon: Receipt },
  { href: "/admin/agents", label: "Agenti", icon: Users },
  { href: "/leady", label: "Lead Software ↗", icon: PhoneCall },
  { href: "/admin/nastavenia", label: "Nastavenia", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Login page má vlastný layout — nie sidebar
  if (!session?.user) {
    return <>{children}</>;
  }

  // /admin je len pre ADMIN rolu. AGENT preposlaný do /leady.
  // @ts-expect-error session.user.role rozšírené v auth.ts
  const role: string | undefined = session.user.role;
  if (role !== "ADMIN") {
    redirect("/leady");
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-soft)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-ink)] text-white shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="block">
            <div className="text-lg font-bold tracking-tight">
              EPOXIDOVO<span className="text-[#3db6e8]">.</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Lead Software
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3" aria-label="Admin navigácia">
          <ul className="space-y-1">
            {NAV.map((l) => {
              const Icon = l.icon;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-colors text-zinc-200"
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden />
                    <span>{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Prihlásený
            </div>
            <div className="mt-1 text-sm text-zinc-200 truncate">
              {session.user.email}
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 transition-colors text-zinc-200"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              <span>Odhlásiť</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 bg-[var(--color-ink)] text-white">
        <Link href="/admin" className="text-sm font-bold">
          {SITE.name} Admin
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            aria-label="Odhlásiť"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10"
          >
            <LogOut className="w-4 h-4" aria-hidden />
          </button>
        </form>
      </div>

      <main className="flex-1 md:p-8 p-4 pt-20 md:pt-8 min-w-0">{children}</main>
    </div>
  );
}
