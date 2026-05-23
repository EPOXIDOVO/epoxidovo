import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, KeyRound, ArrowLeft, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth";
import { SubmitButton } from "@/components/leady/LoginButtons";

export const metadata: Metadata = {
  title: "Prihlásenie · Lead Software",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ check?: string; error?: string; for?: string }>;
}

export default async function LeadyLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isCheckEmail = params.check === "email";
  const hasError = params.error === "auth";
  const emailForCode = params.for ?? "";

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
              Lead Software
            </div>
          </div>

          {isCheckEmail ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3db6e8]/10 text-[#3db6e8] mb-4">
                <KeyRound className="w-6 h-6" aria-hidden />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Zadaj prihlasovací kód
              </h1>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)] leading-relaxed">
                Poslali sme 6-ciferný kód na{" "}
                <strong className="text-[var(--color-fg)]">
                  {emailForCode || "tvoj email"}
                </strong>
                . Kód platí 10 minút.
              </p>

              {hasError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                  <span>Kód je nesprávny alebo vypršal. Skús znovu.</span>
                </div>
              )}

              <form
                action={async (formData) => {
                  "use server";
                  const code = (formData.get("code")?.toString() || "").trim();
                  const email = (
                    formData.get("email")?.toString() || ""
                  ).trim();
                  if (!code || !email) {
                    redirect(
                      `/leady/login?check=email&for=${encodeURIComponent(email)}&error=auth`,
                    );
                  }
                  // Pridáme callbackUrl=/leady aby NextAuth po overeni
                  // redirectol na dashboard a nie na home stránku.
                  redirect(
                    `/api/auth/callback/resend?token=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent("/leady")}`,
                  );
                }}
                className="mt-6 space-y-4"
              >
                <input type="hidden" name="email" value={emailForCode} />
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-[var(--color-fg)] mb-1.5"
                  >
                    Kód z emailu
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-2xl font-mono tracking-[0.4em] text-center"
                  />
                </div>

                <SubmitButton label="Prihlásiť sa" loadingLabel="Overujem…" />
              </form>

              <p className="mt-6 text-xs text-[var(--color-fg-subtle)] text-center">
                Email neprišiel?{" "}
                <Link
                  href="/leady/login"
                  className="text-[#3db6e8] hover:underline"
                >
                  Skús znovu
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight">
                Prihlásenie do Lead Software
              </h1>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
                Zadaj svoj firemný email — pošleme ti 6-ciferný kód.
              </p>

              {hasError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                  <span>
                    Prihlásenie zlyhalo. Tento email nemá oprávnenie alebo
                    nie si pridaný v systéme.
                  </span>
                </div>
              )}

              <form
                action={async (formData) => {
                  "use server";
                  const email = (
                    formData.get("email")?.toString() || ""
                  )
                    .trim()
                    .toLowerCase();
                  if (!email) return;
                  await signIn("resend", {
                    email,
                    redirect: false,
                    redirectTo: "/leady",
                  });
                  redirect(
                    `/leady/login?check=email&for=${encodeURIComponent(email)}`,
                  );
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

                <SubmitButton label="Poslať kód" loadingLabel="Odosielam…" />
              </form>

              <p className="mt-6 text-xs text-[var(--color-fg-subtle)] text-center leading-relaxed">
                Prístup majú iba povolení používatelia. Ak ti prístup
                nefunguje, kontaktuj admina (info@epoxidovo.sk).
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
