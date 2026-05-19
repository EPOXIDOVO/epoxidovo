import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Prihlásenie",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ check?: string; error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isCheckEmail = params.check === "email";
  const hasError = params.error === "auth";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-soft)] p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Späť na web
        </Link>

        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] p-8">
          <div className="mb-6">
            <div className="text-lg font-bold tracking-tight">
              EPOXIDOVO<span className="text-[#3db6e8]">.</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-fg-subtle)]">
              Admin Panel
            </div>
          </div>

          {isCheckEmail ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-4">
                <CheckCircle2 className="w-6 h-6" aria-hidden />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Skontroluj svoj email
              </h1>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)] leading-relaxed">
                Poslali sme ti prihlasovací odkaz. Klikni naňho v emaili pre
                vstup do admin panela.
              </p>
              <p className="mt-4 text-xs text-[var(--color-fg-subtle)]">
                Email môže prísť do spamu. Odkaz platí 24 hodín.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight">
                Prihlásenie do admin panela
              </h1>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
                Zadaj svoj email a pošleme ti prihlasovací odkaz.
              </p>

              {hasError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                  <span>
                    Prihlásenie zlyhalo. Tento email nemá oprávnenie alebo
                    odkaz vypršal.
                  </span>
                </div>
              )}

              <form
                action={async (formData) => {
                  "use server";
                  await signIn("resend", formData);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-fg-subtle)]"
                      aria-hidden
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ty@epoxidovo.sk"
                      className="w-full pl-9 pr-3 py-3 rounded-lg border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] transition-colors"
                >
                  Poslať prihlasovací odkaz
                </button>
              </form>

              <p className="mt-6 text-xs text-[var(--color-fg-subtle)] text-center leading-relaxed">
                Iba autorizovaní používatelia majú prístup. Tvoj email musí byť
                pridaný v ADMIN_EMAILS env premennej.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
