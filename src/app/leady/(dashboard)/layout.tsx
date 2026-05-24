export const runtime = "edge";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ListChecks } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Lead Software · EPOXIDOVO",
  robots: { index: false, follow: false },
};

export default async function LeadyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Ak nie je prihlásený → login. Vynechá pre /leady/login (ten má vlastný layout).
  if (!session?.user) {
    console.log("[leady/layout] no session, redirecting to login");
    redirect("/leady/login");
  }

  // @ts-expect-error session.user.role pridané v auth callback
  const role: string | undefined = session.user.role;

  // Permissive: ak je autentifikovaný akýkoľvek user (ADMIN/AGENT/VIEWER alebo
  // null - role ešte nebola nahratá), pustíme dnu. Nestrácame čas na 'gotcha'
  // redirect ak Prisma vráti rolu neskôr.
  console.log(
    "[leady/layout] authenticated user:",
    session.user.email,
    "role:",
    role,
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 gap-3">
        <div className="flex items-center gap-2">
          {/* Logo → späť na hlavnú stránku epoxidovo.sk */}
          <Link
            href="/"
            className="block hover:opacity-80 active:opacity-60 transition-opacity touch-manipulation"
            aria-label="Späť na epoxidovo.sk"
          >
            <div className="text-lg font-bold tracking-tight">
              EPOXIDOVO<span className="text-[#3db6e8]">.</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Lead Software
            </div>
          </Link>
          {/* Druhé "leady" tlačidlo ktoré ostane na dashboarde */}
          <Link
            href="/leady"
            className="hidden sm:inline-flex items-center gap-1 ml-3 text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100"
          >
            ↻ Leady
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5"
            >
              <ListChecks className="w-4 h-4" aria-hidden />
              Admin panel
            </Link>
          )}
          <div className="hidden sm:block text-xs text-zinc-500">
            {session.user.email}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase">
              {role}
            </span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/leady/login" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden />
              Odhlásiť
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
