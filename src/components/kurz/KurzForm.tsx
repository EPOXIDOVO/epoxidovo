"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { KURZ } from "@/content/kurz";

interface State {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  term: string;
  variant: string;
  experience: string;
  message: string;
  website: string; // honeypot
}

const EMPTY: State = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  term: KURZ.nextTerms[0].date,
  variant: "standard",
  experience: "zaciatocnik",
  message: "",
  website: "",
};

const VARIANT_LABEL: Record<string, string> = {
  standard: `ŠTANDARD (${KURZ.priceStandard} €)`,
  pro: `PRO + štartovací balík (${KURZ.pricePro} €)`,
  firma: "Firemné školenie (3+ ľudí)",
};

const EXPERIENCE_LABEL: Record<string, string> = {
  zaciatocnik: "Začiatočník — epoxid som ešte nerobil",
  remeselnik: "Remeselník — robím stierky/podlahy, epoxid nie",
  skuseny: "Už epoxid robím, chcem sa zlepšiť",
};

export function KurzForm() {
  const [values, setValues] = React.useState<State>(EMPTY);
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [consent, setConsent] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);

  const set = <K extends keyof State>(key: K, val: State[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (error) setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    if (values.name.trim().length < 2) return setError("Zadaj meno.");
    if (values.lastName.trim().length < 2) return setError("Zadaj priezvisko.");
    if (!/^[+\d\s\-/()]{9,30}$/.test(values.phone.trim()))
      return setError("Zadaj platné telefónne číslo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      return setError("Zadaj platnú e-mailovú adresu.");
    if (!consent) return setError("Bez súhlasu s ochranou údajov ťa nevieme prihlásiť.");
    if (!turnstileToken) return setError("Počkaj chvíľu kým sa overí, že nie si bot.");

    setSending(true);
    setError(null);

    const messageBody = [
      "PRIHLÁŠKA NA KURZ",
      `Termín: ${values.term}`,
      `Balík: ${VARIANT_LABEL[values.variant]}`,
      `Skúsenosti: ${EXPERIENCE_LABEL[values.experience]}`,
      values.message.trim() ? `\nPoznámka: ${values.message.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: messageBody,
          consent: true,
          source: "kurz",
          website: values.website,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        setError("Nepodarilo sa odoslať. Skús to prosím znova alebo zavolaj.");
        setSending(false);
        return;
      }
      setSending(false);
      setSuccess(true);
      trackEvent("kurz_prihlaska", { term: values.term, variant: values.variant });
      trackEvent("generate_lead", {
        source: "kurz",
        value: values.variant === "pro" ? KURZ.pricePro : KURZ.priceStandard,
        currency: "EUR",
      });
    } catch {
      setError("Nepodarilo sa odoslať. Skús to prosím znova alebo zavolaj.");
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl bg-white border border-[var(--color-border)] p-8 md:p-10 text-center shadow-[var(--shadow-card)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
          <CheckCircle2 className="w-8 h-8" aria-hidden />
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Miesto ti držíme
        </h3>
        <p className="mt-3 text-sm md:text-base text-[var(--color-fg-muted)] max-w-md mx-auto">
          Ozveme sa ti do 24 hodín telefonicky, potvrdíme termín{" "}
          <strong className="text-[var(--color-fg)]">{values.term}</strong> a pošleme
          faktúru aj pokyny na cestu. Nič vopred neplatíš.
        </p>
      </div>
    );
  }

  const inputCls =
    "block w-full appearance-none px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900 transition-colors hover:border-[var(--color-fg-subtle)]";
  const labelCls = "block text-sm font-semibold mb-1.5";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl bg-white border border-[var(--color-border)] p-6 md:p-9 shadow-[var(--shadow-card)]"
    >
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
        Prihlás sa na kurz
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-fg-muted)]">
        Nezáväzne. Zavoláme ti, potvrdíme voľné miesto a až potom sa platí.
      </p>

      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="k-name" className={labelCls}>Meno *</label>
            <input id="k-name" type="text" autoComplete="given-name" required
              value={values.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="k-lastname" className={labelCls}>Priezvisko *</label>
            <input id="k-lastname" type="text" autoComplete="family-name" required
              value={values.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="k-phone" className={labelCls}>Telefón *</label>
            <input id="k-phone" type="tel" autoComplete="tel" required
              value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="k-email" className={labelCls}>E-mail *</label>
            <input id="k-email" type="email" autoComplete="email" required
              value={values.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="k-term" className={labelCls}>Termín</label>
            <select id="k-term" value={values.term} onChange={(e) => set("term", e.target.value)} className={inputCls}>
              {KURZ.nextTerms.map((t) => (
                <option key={t.date} value={t.date}>
                  {t.date} — voľné {t.left}
                </option>
              ))}
              <option value="Zatiaľ neviem / iný termín">Zatiaľ neviem / iný termín</option>
            </select>
          </div>
          <div>
            <label htmlFor="k-variant" className={labelCls}>Balík</label>
            <select id="k-variant" value={values.variant} onChange={(e) => set("variant", e.target.value)} className={inputCls}>
              <option value="standard">{VARIANT_LABEL.standard}</option>
              <option value="pro">{VARIANT_LABEL.pro}</option>
              <option value="firma">{VARIANT_LABEL.firma}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="k-exp" className={labelCls}>Skúsenosti</label>
          <select id="k-exp" value={values.experience} onChange={(e) => set("experience", e.target.value)} className={inputCls}>
            <option value="zaciatocnik">{EXPERIENCE_LABEL.zaciatocnik}</option>
            <option value="remeselnik">{EXPERIENCE_LABEL.remeselnik}</option>
            <option value="skuseny">{EXPERIENCE_LABEL.skuseny}</option>
          </select>
        </div>

        <div>
          <label htmlFor="k-msg" className={labelCls}>
            Otázka <span className="text-[var(--color-fg-muted)] font-normal">(voliteľné)</span>
          </label>
          <textarea id="k-msg" rows={3} value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Napr. idem s kolegom, potrebujeme faktúru na firmu…"
            className={`${inputCls} resize-y overscroll-contain`} />
        </div>

        <label className="flex items-start gap-3 text-xs text-[var(--color-fg-muted)] cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (error) setError(null); }}
            className="mt-0.5 w-4 h-4 accent-[var(--color-brand)]" />
          <span>
            Súhlasím so spracovaním osobných údajov za účelom vybavenia prihlášky.{" "}
            <a href="/ochrana-sukromia" className="underline underline-offset-2 hover:text-[var(--color-fg)]">
              Ochrana súkromia
            </a>
          </span>
        </label>

        <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />

        {error && (
          <p className="text-sm text-[var(--color-error)] bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full h-14 rounded-xl bg-[var(--color-copper)] text-white font-semibold whitespace-nowrap transition-colors hover:bg-[var(--color-copper-light)] disabled:opacity-60 disabled:pointer-events-none"
        >
          {sending ? "Odosielam…" : "Rezervovať miesto"}
        </button>
        <p className="text-center text-xs text-[var(--color-fg-subtle)]">
          Nezáväzná rezervácia · platba až po potvrdení termínu
        </p>
      </div>
    </form>
  );
}
