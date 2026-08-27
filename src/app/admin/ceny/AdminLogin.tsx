"use client";

import * as React from "react";
import { Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";

type Faza = "login" | "forgot" | "reset";

/** Prihlásenie do adminu — e-mail + heslo, s „Zabudol som heslo" (reset cez e-mail). */
export function AdminLogin() {
  // Ak je v URL ?reset=<token>&email=<email>, začni rovno v reset fáze.
  const initial = React.useMemo<{ faza: Faza; email: string; token: string }>(() => {
    if (typeof window === "undefined") return { faza: "login", email: "", token: "" };
    const p = new URLSearchParams(window.location.search);
    const token = p.get("reset") ?? "";
    const email = p.get("email") ?? "";
    return token ? { faza: "reset", email, token } : { faza: "login", email: "", token: "" };
  }, []);

  const [faza, setFaza] = React.useState<Faza>(initial.faza);
  const [email, setEmail] = React.useState(initial.email);
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [stav, setStav] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const login = async () => {
    setBusy(true); setStav(null); setOk(false);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; code?: string };
      if (!res.ok || !json.ok) {
        if (json.code === "no_password") { setFaza("forgot"); setStav(json.message ?? null); return; }
        throw new Error(json.message ?? "Prihlásenie zlyhalo.");
      }
      window.location.href = "/admin/ceny";
    } catch (e) {
      setStav(e instanceof Error ? e.message : "Chyba — skús znova.");
    } finally { setBusy(false); }
  };

  const forgot = async () => {
    setBusy(true); setStav(null); setOk(false);
    try {
      const res = await fetch("/api/admin/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; devLink?: string };
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Nepodarilo sa.");
      if (json.devLink) { window.location.href = json.devLink; return; } // DEV: rovno na reset
      setOk(true);
      setStav("Ak je e-mail admin, poslali sme naň odkaz na nastavenie hesla. Platí 30 minút.");
    } catch (e) {
      setStav(e instanceof Error ? e.message : "Chyba — skús znova.");
    } finally { setBusy(false); }
  };

  const reset = async () => {
    setBusy(true); setStav(null); setOk(false);
    if (password !== password2) { setStav("Heslá sa nezhodujú."); setBusy(false); return; }
    try {
      const res = await fetch("/api/admin/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: initial.email, token: initial.token, password }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) throw new Error(json.message ?? "Nastavenie zlyhalo.");
      window.location.href = "/admin/ceny"; // reset zároveň prihlási
    } catch (e) {
      setStav(e instanceof Error ? e.message : "Chyba — skús znova.");
    } finally { setBusy(false); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (faza === "login") void login();
    else if (faza === "forgot") void forgot();
    else void reset();
  };

  const inputCls =
    "w-full rounded-xl border border-zinc-300 px-4 py-3 text-[15px] outline-none focus:border-[#3db6e8] focus:ring-2 focus:ring-[#3db6e8]/30 transition";

  return (
    <Container size="md" className="py-24">
      <div className="max-w-md mx-auto rounded-3xl bg-white border border-zinc-200 shadow-[0_18px_50px_rgba(0,0,0,0.08)] p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e3f3fb] text-[#1a8cc4] mb-4">
            {faza === "reset" ? <Lock className="w-7 h-7" aria-hidden /> : <KeyRound className="w-7 h-7" aria-hidden />}
          </div>
          <h1 className="text-2xl font-extrabold text-[#0e1a3b]">
            {faza === "login" ? "Admin — prihlásenie"
              : faza === "forgot" ? "Zabudnuté heslo"
              : "Nastav nové heslo"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {faza === "login" ? "Prihlás sa e-mailom a heslom."
              : faza === "forgot" ? "Zadaj admin e-mail — pošleme naň odkaz na nastavenie hesla."
              : "Zvoľ si nové heslo (aspoň 8 znakov)."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3 text-left">
          {faza !== "reset" && (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">E-mail</span>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden />
                <input
                  type="email" required autoComplete="username" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@epoxidovo.sk"
                  className={inputCls + " pl-9"}
                />
              </div>
            </label>
          )}

          {(faza === "login" || faza === "reset") && (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                {faza === "reset" ? "Nové heslo" : "Heslo"}
              </span>
              <input
                type="password" required
                autoComplete={faza === "reset" ? "new-password" : "current-password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputCls + " mt-1"}
              />
            </label>
          )}

          {faza === "reset" && (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Zopakuj heslo</span>
              <input
                type="password" required autoComplete="new-password"
                value={password2} onChange={(e) => setPassword2(e.target.value)}
                className={inputCls + " mt-1"}
              />
            </label>
          )}

          <button
            type="submit" disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#3db6e8] text-white font-bold hover:bg-[#1a8cc4] disabled:opacity-50 transition-colors"
          >
            {busy ? "Moment…"
              : faza === "login" ? "Prihlásiť sa"
              : faza === "forgot" ? "Poslať odkaz"
              : "Nastaviť heslo a prihlásiť"}
          </button>
        </form>

        {stav && (
          <p className={"mt-4 text-sm text-center " + (ok ? "text-emerald-600" : "text-zinc-600")}>{stav}</p>
        )}

        <div className="mt-5 text-center text-sm">
          {faza === "login" && (
            <button type="button" onClick={() => { setFaza("forgot"); setStav(null); }} className="text-[#1a8cc4] font-semibold hover:underline">
              Zabudol som heslo
            </button>
          )}
          {faza === "forgot" && (
            <button type="button" onClick={() => { setFaza("login"); setStav(null); }} className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800">
              <ArrowLeft className="w-4 h-4" aria-hidden /> Späť na prihlásenie
            </button>
          )}
        </div>
      </div>
    </Container>
  );
}
