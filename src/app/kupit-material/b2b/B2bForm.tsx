"use client";

import * as React from "react";
import { Check, Building2 } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";

const inputCls =
  "block w-full appearance-none px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400";

type Navrh = { nazov: string; ico: string; adresa: string };

export function B2bForm() {
  const [firma, setFirma] = React.useState("");
  const [ico, setIco] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot
  const [token, setToken] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  // Predikcia z Registra právnických osôb — spoločný dropdown pre obe polia.
  const [navrhy, setNavrhy] = React.useState<Navrh[]>([]);
  const [openPre, setOpenPre] = React.useState<"firma" | "ico" | null>(null);
  const [hladam, setHladam] = React.useState(false);
  const debounceRef = React.useRef<number | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const seqRef = React.useRef(0);
  const boxRef = React.useRef<HTMLDivElement>(null);

  const hladaj = (q: string, pole: "firma" | "ico") => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (q.trim().length < 3) {
      abortRef.current?.abort();
      setNavrhy([]);
      setOpenPre(null);
      setHladam(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      // zruš predchádzajúci request — register je pomalý a staré odpovede
      // by prepísali novšie
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const moje = ++seqRef.current;
      setHladam(true);
      setOpenPre(pole);
      try {
        const res = await fetch(`/api/b2b/lookup?q=${encodeURIComponent(q.trim())}`, {
          signal: ctrl.signal,
        });
        const json = (await res.json()) as { results?: Navrh[] };
        if (moje !== seqRef.current) return; // medzitým odišiel novší dopyt
        setNavrhy(json.results ?? []);
        setOpenPre(json.results?.length ? pole : null);
        setHladam(false);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (moje !== seqRef.current) return;
        setNavrhy([]);
        setOpenPre(null);
        setHladam(false);
      }
    }, 400);
  };

  React.useEffect(() => {
    const zavri = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpenPre(null);
    };
    document.addEventListener("mousedown", zavri);
    return () => document.removeEventListener("mousedown", zavri);
  }, []);

  const vyber = (n: Navrh) => {
    setFirma(n.nazov);
    setIco(n.ico);
    setNavrhy([]);
    setOpenPre(null);
  };

  // Firma a IČO voliteľné — aj súkromná osoba, čo si robí dom sama
  const icoCiste = ico.replace(/\s/g, "");
  const valid =
    (firma.trim() === "" || firma.trim().length >= 2) &&
    (icoCiste === "" || /^\d{6,8}$/.test(icoCiste)) &&
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

  const dropdown = (pole: "firma" | "ico") =>
    openPre === pole &&
    (hladam || navrhy.length > 0) && (
      <ul
        className="absolute z-30 left-0 right-0 top-full mt-1 rounded-xl border border-zinc-200 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.15)] overflow-hidden max-h-72 overflow-y-auto"
        role="listbox"
        aria-label="Návrhy firiem z registra"
      >
        {hladam && (
          <li className="px-4 py-2.5 text-sm text-zinc-500 flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#3db6e8] border-t-transparent animate-spin" aria-hidden />
            Hľadám v registri firiem…
          </li>
        )}
        {navrhy.map((n) => (
          <li key={n.ico}>
            <button
              type="button"
              onClick={() => vyber(n)}
              className="w-full text-left px-4 py-2.5 hover:bg-[#e3f3fb] transition-colors flex items-start gap-2.5"
            >
              <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-[#12729f]" aria-hidden />
              <span>
                <span className="block text-sm font-bold text-zinc-900">{n.nazov}</span>
                <span className="block text-xs text-zinc-500">
                  IČO {n.ico}
                  {n.adresa ? ` · ${n.adresa}` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <div ref={boxRef} className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
      <div className="absolute -left-[9999px]" aria-hidden>
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div className="space-y-3">
        <div className="relative">
          <input
            placeholder="Názov firmy (nepovinné)"
            value={firma}
            onChange={(e) => {
              setFirma(e.target.value);
              hladaj(e.target.value, "firma");
            }}
            autoComplete="off"
            className={inputCls}
            aria-label="Názov firmy"
          />
          {dropdown("firma")}
        </div>
        <div className="relative">
          <input
            placeholder="IČO (nepovinné)"
            inputMode="numeric"
            value={ico}
            onChange={(e) => {
              setIco(e.target.value);
              hladaj(e.target.value, "ico");
            }}
            autoComplete="off"
            className={inputCls}
            aria-label="IČO"
          />
          {dropdown("ico")}
        </div>
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
        className="mt-4 w-full px-6 py-4 rounded-full bg-[#3db6e8] text-[#0e1a3b] font-extrabold hover:bg-[#1a8cc4] disabled:opacity-50 transition-colors"
      >
        {state === "sending" ? "Odosielam…" : "Požiadať o B2B účet"}
      </button>
    </div>
  );
}
