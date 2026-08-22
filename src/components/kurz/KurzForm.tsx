"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { KURZ } from "@/content/kurz";
import { COURSE_EN } from "@/content/kurz-en";

type Locale = "sk" | "en";

const T = {
  sk: {
    heading: "Prihlás sa na kurz",
    sub: "Nezáväzne. Zavoláme ti, potvrdíme voľné miesto a až potom sa platí.",
    name: "Meno *",
    lastName: "Priezvisko *",
    phone: "Telefón *",
    email: "E-mail *",
    term: "Termín",
    termOther: "Zatiaľ neviem / iný termín",
    free: "voľné",
    variant: "Balík",
    experience: "Skúsenosti",
    question: "Otázka",
    optional: "(voliteľné)",
    placeholder: "Napr. idem s kolegom, potrebujeme faktúru na firmu…",
    consent: "Súhlasím so spracovaním osobných údajov za účelom vybavenia prihlášky.",
    privacy: "Ochrana súkromia",
    submit: "Rezervovať miesto",
    sending: "Odosielam…",
    note: "Nezáväzná rezervácia · platba až po potvrdení termínu",
    okTitle: "Miesto ti držíme",
    okText1: "Ozveme sa ti do 24 hodín telefonicky, potvrdíme termín",
    okText2: "a pošleme faktúru aj pokyny na cestu. Nič vopred neplatíš.",
    errName: "Zadaj meno.",
    errLast: "Zadaj priezvisko.",
    errPhone: "Zadaj platné telefónne číslo.",
    errEmail: "Zadaj platnú e-mailovú adresu.",
    errConsent: "Bez súhlasu s ochranou údajov ťa nevieme prihlásiť.",
    errBot: "Počkaj chvíľu kým sa overí, že nie si bot.",
    errSend: "Nepodarilo sa odoslať. Skús to prosím znova alebo zavolaj.",
  },
  en: {
    heading: "Apply for the course",
    sub: "No commitment. We call you, confirm a free seat, and only then you pay.",
    name: "First name *",
    lastName: "Last name *",
    phone: "Phone *",
    email: "E-mail *",
    term: "Date",
    termOther: "Not sure yet / another date",
    free: "seats left:",
    variant: "Package",
    experience: "Experience",
    question: "Question",
    optional: "(optional)",
    placeholder: "E.g. coming with a colleague, we need a company invoice…",
    consent: "I agree to the processing of my personal data in order to handle this application.",
    privacy: "Privacy policy",
    submit: "Reserve my seat",
    sending: "Sending…",
    note: "Non-binding reservation · payment only after the date is confirmed",
    okTitle: "Your seat is on hold",
    okText1: "We will call you within 24 hours, confirm the date",
    okText2: "and send the invoice and travel details. Nothing is paid upfront.",
    errName: "Please enter your first name.",
    errLast: "Please enter your last name.",
    errPhone: "Please enter a valid phone number.",
    errEmail: "Please enter a valid e-mail address.",
    errConsent: "We cannot register you without the data-processing consent.",
    errBot: "Hold on a second while we verify you are not a bot.",
    errSend: "Sending failed. Please try again or give us a call.",
  },
} as const;

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

const EMPTY_BASE: Omit<State, "term"> = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  variant: "standard",
  experience: "zaciatocnik",
  message: "",
  website: "",
};

const VARIANT_LABEL: Record<Locale, Record<string, string>> = {
  sk: {
    standard: `ŠTANDARD (${KURZ.priceStandard} €)`,
    pro: `PRO + štartovací balík (${KURZ.pricePro} €)`,
    firma: "Firemné školenie (3+ ľudí)",
  },
  en: {
    standard: `STANDARD (€${KURZ.priceStandard})`,
    pro: `PRO + starter package (€${KURZ.pricePro})`,
    firma: "Company training (3+ people)",
  },
};

const EXPERIENCE_LABEL: Record<Locale, Record<string, string>> = {
  sk: {
    zaciatocnik: "Začiatočník — epoxid som ešte nerobil",
    remeselnik: "Remeselník — robím stierky/podlahy, epoxid nie",
    skuseny: "Už epoxid robím, chcem sa zlepšiť",
  },
  en: {
    zaciatocnik: "Beginner — I have never worked with epoxy",
    remeselnik: "Tradesman — I do screeds/floors, not epoxy",
    skuseny: "I already work with epoxy, I want to improve",
  },
};

export function KurzForm({ locale = "sk" }: { locale?: Locale }) {
  const t = T[locale];
  const terms = locale === "sk" ? KURZ.nextTerms : COURSE_EN.nextTerms;
  const variantLabel = VARIANT_LABEL[locale];
  const experienceLabel = EXPERIENCE_LABEL[locale];
  const EMPTY: State = { ...EMPTY_BASE, term: terms[0].date };

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

    if (values.name.trim().length < 2) return setError(t.errName);
    if (values.lastName.trim().length < 2) return setError(t.errLast);
    if (!/^[+\d\s\-/()]{9,30}$/.test(values.phone.trim()))
      return setError(t.errPhone);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      return setError(t.errEmail);
    if (!consent) return setError(t.errConsent);
    if (!turnstileToken) return setError(t.errBot);

    setSending(true);
    setError(null);

    const messageBody = [
      locale === "sk" ? "PRIHLÁŠKA NA KURZ" : "COURSE APPLICATION (EN page)",
      `Termín: ${values.term}`,
      `Balík: ${variantLabel[values.variant]}`,
      `Skúsenosti: ${experienceLabel[values.experience]}`,
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
          source: locale === "sk" ? "kurz" : "kurz_en",
          website: values.website,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        setError(t.errSend);
        setSending(false);
        return;
      }
      setSending(false);
      setSuccess(true);
      trackEvent("kurz_prihlaska", {
        term: values.term,
        variant: values.variant,
        locale,
      });
      trackEvent("generate_lead", {
        source: locale === "sk" ? "kurz" : "kurz_en",
        value: values.variant === "pro" ? KURZ.pricePro : KURZ.priceStandard,
        currency: "EUR",
      });
    } catch {
      setError(t.errSend);
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
          {t.okTitle}
        </h3>
        <p className="mt-3 text-sm md:text-base text-[var(--color-fg-muted)] max-w-md mx-auto">
          {t.okText1}{" "}
          <strong className="text-[var(--color-fg)]">{values.term}</strong>{" "}
          {t.okText2}
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
        {t.heading}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--color-fg-muted)]">
        {t.sub}
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
            <label htmlFor="k-name" className={labelCls}>{t.name}</label>
            <input id="k-name" type="text" autoComplete="given-name" required
              value={values.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="k-lastname" className={labelCls}>{t.lastName}</label>
            <input id="k-lastname" type="text" autoComplete="family-name" required
              value={values.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="k-phone" className={labelCls}>{t.phone}</label>
            <input id="k-phone" type="tel" autoComplete="tel" required
              value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="k-email" className={labelCls}>{t.email}</label>
            <input id="k-email" type="email" autoComplete="email" required
              value={values.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="k-term" className={labelCls}>{t.term}</label>
            <select id="k-term" value={values.term} onChange={(e) => set("term", e.target.value)} className={inputCls}>
              {terms.map((term) => (
                <option key={term.date} value={term.date}>
                  {term.date} — {t.free} {term.left}
                </option>
              ))}
              <option value={t.termOther}>{t.termOther}</option>
            </select>
          </div>
          <div>
            <label htmlFor="k-variant" className={labelCls}>{t.variant}</label>
            <select id="k-variant" value={values.variant} onChange={(e) => set("variant", e.target.value)} className={inputCls}>
              <option value="standard">{variantLabel.standard}</option>
              <option value="pro">{variantLabel.pro}</option>
              <option value="firma">{variantLabel.firma}</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="k-exp" className={labelCls}>{t.experience}</label>
          <select id="k-exp" value={values.experience} onChange={(e) => set("experience", e.target.value)} className={inputCls}>
            <option value="zaciatocnik">{experienceLabel.zaciatocnik}</option>
            <option value="remeselnik">{experienceLabel.remeselnik}</option>
            <option value="skuseny">{experienceLabel.skuseny}</option>
          </select>
        </div>

        <div>
          <label htmlFor="k-msg" className={labelCls}>
            {t.question}{" "}
            <span className="text-[var(--color-fg-muted)] font-normal">{t.optional}</span>
          </label>
          <textarea id="k-msg" rows={3} value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder={t.placeholder}
            className={`${inputCls} resize-y overscroll-contain`} />
        </div>

        <label className="flex items-start gap-3 text-xs text-[var(--color-fg-muted)] cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (error) setError(null); }}
            className="mt-0.5 w-4 h-4 accent-[var(--color-brand)]" />
          <span>
            {t.consent}{" "}
            <a href="/ochrana-sukromia" className="underline underline-offset-2 hover:text-[var(--color-fg)]">
              {t.privacy}
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
          {sending ? t.sending : t.submit}
        </button>
        <p className="text-center text-xs text-[var(--color-fg-subtle)]">
          {t.note}
        </p>
      </div>
    </form>
  );
}
