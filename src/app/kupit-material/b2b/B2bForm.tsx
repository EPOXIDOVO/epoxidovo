"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";

const inputCls =
  "block w-full appearance-none px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400";

export function B2bForm() {
  const [firma, setFirma] = React.useState("");
  const [ico, setIco] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [token, setToken] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const valid =
    firma.trim().length >= 2 &&
    /^\d{6,8}$/.test(ico.replace(/\s/g, "")) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    /^[+\d\s\-/()]{9,30}$/.test(phone.trim());

  const submit = async () => {
    setState("sending");
    setErrMsg(null);
    try {
      const res = await fetch("/api/b2b/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firma: firma.trim(),
          ico: ico.replace(/\s/g, ""),
          email: email.trim(),
          phone: phone.trim(),
          website,
          turnstileToken: token,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setErrMsg(json.message ?? "Nepodarilo sa odoslať — skús znova.");
        setState("err");
        return;
      }
      setState("ok");
    } catch {
      setErrMsg("Nepodarilo sa odoslať. Skontroluj internet.");
      setState("err");
    }
  };

  if (state === "ok") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <Check className="w-8 h-8" aria-hidden />
        </div>
        <h2 className="text-xl font-extrabold text-zinc-900">Žiadosť prijatá</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Firmu overíme a ozveme sa s aktiváciou účtu — zvyčajne do 1 pracovného dňa.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
      <div className="absolute -left-[9999px]" aria-hidden>
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div className="space-y-3">
        <input placeholder="Názov firmy *" value={firma} onChange={(e) => setFirma(e.target.value)} className={inputCls} aria-label="Názov firmy" />
        <input placeholder="IČO *" inputMode="numeric" value={ico} onChange={(e) => setIco(e.target.value)} className={inputCls} aria-label="IČO" />
        <input type="email" placeholder="E-mail *" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} aria-label="E-mail" />
        <input type="tel" placeholder="Telefón *" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} aria-label="Telefón" />
      </div>
      <div className="mt-4 flex justify-center">
        <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />
      </div>
      {errMsg && <p className="mt-2 text-sm text-red-600">{errMsg}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={state === "sending" || !valid || !token}
        className="mt-4 w-full px-6 py-4 rounded-full bg-[#3db6e8] text-white font-extrabold hover:bg-[#1a8cc4] disabled:opacity-50 transition-colors"
      >
        {state === "sending" ? "Odosielam…" : "Požiadať o B2B účet"}
      </button>
    </div>
  );
}
