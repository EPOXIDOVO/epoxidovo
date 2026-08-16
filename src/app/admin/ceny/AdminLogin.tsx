"use client";

import * as React from "react";
import { Mail, KeyRound } from "lucide-react";
import { Container } from "@/components/ui/Container";

/** Prihlásenie do adminu — kód z e-mailu (info@epoxidovo.sk). */
export function AdminLogin() {
  const [faza, setFaza] = React.useState<"start" | "kod">("start");
  const [code, setCode] = React.useState("");
  const [token, setToken] = React.useState("");
  const [stav, setStav] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const poslatKod = async () => {
    setBusy(true);
    setStav(null);
    try {
      const res = await fetch("/api/admin/auth/request", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string; devCode?: string; token?: string };
      if (!res.ok || !json.ok) throw new Error(json.message ?? "nepodarilo sa");
      setToken(json.token ?? "");
      setFaza("kod");
      setStav(
        json.devCode
          ? `DEV režim — kód: ${json.devCode}`
          : "Kód sme poslali na admin e-mail. Platí 10 minút.",
      );
    } catch (e) {
      setStav(e instanceof Error ? e.message : "Chyba — skús znova.");
    } finally {
      setBusy(false);
    }
  };

  const overit = async () => {
    setBusy(true);
    setStav(null);
    try {
      const res = await fetch("/api/admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, token }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) throw new Error(json.message ?? "nesprávny kód");
      window.location.reload();
    } catch (e) {
      setStav(e instanceof Error ? e.message : "Chyba — skús znova.");
      setBusy(false);
    }
  };

  return (
    <Container size="md" className="py-24">
      <div className="max-w-md mx-auto rounded-3xl bg-white border border-zinc-200 shadow-[0_18px_50px_rgba(0,0,0,0.08)] p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e3f3fb] text-[#1a8cc4] mb-4">
          <KeyRound className="w-7 h-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0e1a3b]">Admin — prihlásenie</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Prístup len s overovacím kódom z admin e-mailu.
        </p>

        {faza === "start" ? (
          <button
            type="button"
            onClick={poslatKod}
            disabled={busy}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#3db6e8] text-white font-bold hover:bg-[#1a8cc4] disabled:opacity-50 transition-colors"
          >
            <Mail className="w-4 h-4" aria-hidden />
            {busy ? "Posielam…" : "Poslať kód na e-mail"}
          </button>
        ) : (
          <div className="mt-6 space-y-3">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && code.length === 6 && overit()}
              placeholder="123456"
              aria-label="Overovací kód"
              className="block w-full text-center text-2xl font-extrabold tracking-[0.4em] px-4 py-3.5 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-[#3db6e8]"
            />
            <button
              type="button"
              onClick={overit}
              disabled={busy || code.length !== 6}
              className="w-full px-6 py-3.5 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] disabled:opacity-40 transition-colors"
            >
              {busy ? "Overujem…" : "Prihlásiť sa"}
            </button>
            <button
              type="button"
              onClick={poslatKod}
              disabled={busy}
              className="text-sm text-[#1a8cc4] font-semibold hover:underline"
            >
              Poslať nový kód
            </button>
          </div>
        )}
        {stav && (
          <p className="mt-4 text-sm font-semibold text-[#0e1a3b] bg-[#f7f6f3] rounded-lg p-3">
            {stav}
          </p>
        )}
      </div>
    </Container>
  );
}
