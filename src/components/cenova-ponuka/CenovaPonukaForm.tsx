"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface FormState {
  name: string;
  phone: string;
  email: string;
  area: string;
  city: string;
  termin: string;
  priestor: string;
  message: string;
  website: string; // honeypot
}

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  area: "",
  city: "",
  termin: "",
  priestor: "",
  message: "",
  website: "",
};

const TERMIN_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Vyberte termín…" },
  { value: "co-najskor", label: "Čo najskôr" },
  { value: "do-1m", label: "Do 1 mesiaca" },
  { value: "do-3m", label: "Do 3 mesiacov" },
  { value: "do-6m", label: "Do 6 mesiacov" },
  { value: "zistujem", label: "Zatiaľ len zisťujem informácie" },
];

const PRIESTOR_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Vyberte priestor…" },
  { value: "garaz", label: "Garáž / dielňa" },
  { value: "dom", label: "Byt / dom (interiér)" },
  { value: "hala-firma", label: "Hala / sklad / firma" },
  { value: "ine", label: "Iné" },
];

export function CenovaPonukaForm() {
  const [values, setValues] = React.useState<FormState>(EMPTY);
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (error) setError(null);
  };

  const labelFromOptions = (
    options: { value: string; label: string }[],
    val: string,
  ) => options.find((o) => o.value === val)?.label ?? val;

  const buildLeadMessage = () => {
    const lines = [
      `Plocha: ${values.area} m²`,
      `Mesto / lokalita: ${values.city}`,
    ];
    if (values.termin) {
      lines.push(`Termín: ${labelFromOptions(TERMIN_OPTIONS, values.termin)}`);
    }
    if (values.priestor) {
      lines.push(
        `Typ priestoru: ${labelFromOptions(PRIESTOR_OPTIONS, values.priestor)}`,
      );
    }
    if (values.message.trim()) {
      lines.push("", "Doplňujúce informácie:", values.message.trim());
    }
    return lines.join("\n");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    // Klientská validácia (povinné polia)
    if (values.name.trim().length < 2) {
      setError("Zadaj meno a priezvisko.");
      return;
    }
    if (!/^[+\d\s\-/()]{9,30}$/.test(values.phone.trim())) {
      setError("Zadaj platné telefónne číslo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setError("Zadaj platnú emailovú adresu.");
      return;
    }
    const areaNum = Number(values.area);
    if (!areaNum || areaNum < 1) {
      setError("Zadaj plochu v m².");
      return;
    }
    if (values.city.trim().length < 2) {
      setError("Zadaj mesto alebo lokalitu.");
      return;
    }

    setSending(true);
    setError(null);

    const mapPriestor = (v: string): string | undefined => {
      if (v === "dom") return "dom";
      if (v === "garaz") return "garaz";
      if (v === "hala-firma") return "hala-firma";
      if (v === "ine") return "ine";
      return undefined;
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          area: areaNum,
          spaceType: mapPriestor(values.priestor),
          message: buildLeadMessage(),
          consent: true,
          source: "cenova_ponuka_form",
          website: values.website,
        }),
      });

      if (!res.ok) {
        setError("Nepodarilo sa odoslať. Skús to prosím znova.");
        setSending(false);
        return;
      }

      setSending(false);
      setSuccess(true);
    } catch {
      setError("Nepodarilo sa odoslať. Skús to prosím znova.");
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-white border border-[var(--color-border)] p-8 md:p-12 text-center shadow-[var(--shadow-card)] max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-5">
          <CheckCircle2 className="w-9 h-9" aria-hidden />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-fg)]">
          Ďakujeme, ozveme sa do 24 hodín
        </h2>
        <p className="mt-3 text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed">
          Tvoj dopyt sme prijali na <strong>info@epoxidovo.sk</strong>. Pripravíme
          ti cenovú kalkuláciu na mieru a ozveme sa najneskôr do 24 hodín.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#f97316] text-white font-semibold hover:bg-[#ea580c] shadow-[0_8px_24px_rgba(249,115,22,0.45)] transition-colors"
        >
          Späť na úvod
        </Link>
      </div>
    );
  }

  const inputCls =
    "block w-full appearance-none px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl bg-white border border-[var(--color-border)] p-6 md:p-10 shadow-[var(--shadow-card)] max-w-3xl mx-auto"
    >
      {/* Honeypot */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <FieldWrap label="Meno a priezvisko *" id="cp-name">
          <input
            id="cp-name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </FieldWrap>
        <FieldWrap label="Telefón *" id="cp-phone">
          <input
            id="cp-phone"
            type="tel"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </FieldWrap>
        <FieldWrap label="E-mail *" id="cp-email">
          <input
            id="cp-email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
          />
        </FieldWrap>
        <FieldWrap label="Plocha v m² *" id="cp-area">
          <input
            id="cp-area"
            type="number"
            inputMode="numeric"
            min="1"
            required
            value={values.area}
            onChange={(e) => set("area", e.target.value)}
            className={inputCls}
          />
        </FieldWrap>
        <FieldWrap label="Mesto / lokalita *" id="cp-city">
          <input
            id="cp-city"
            type="text"
            autoComplete="address-level2"
            required
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputCls}
          />
        </FieldWrap>
        <FieldWrap label="Plánovaný termín realizácie" id="cp-termin">
          <select
            id="cp-termin"
            value={values.termin}
            onChange={(e) => set("termin", e.target.value)}
            className={inputCls}
          >
            {TERMIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldWrap>
        <FieldWrap
          label="Typ priestoru"
          id="cp-priestor"
          className="md:col-span-2"
        >
          <select
            id="cp-priestor"
            value={values.priestor}
            onChange={(e) => set("priestor", e.target.value)}
            className={inputCls}
          >
            {PRIESTOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldWrap>
        <FieldWrap
          label="Doplňujúce informácie"
          id="cp-message"
          className="md:col-span-2"
        >
          <textarea
            id="cp-message"
            rows={4}
            placeholder="Napríklad farba, vzor, špeciálne požiadavky…"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </FieldWrap>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-7 mx-auto block px-9 py-4 rounded-full bg-[#f97316] text-white font-bold text-base md:text-lg hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_36px_rgba(249,115,22,0.5)] hover:shadow-[0_16px_44px_rgba(249,115,22,0.65)] transition-all duration-300"
      >
        {sending ? "Posielame…" : "Pošlite mi cenovú ponuku"}
      </button>

      <p className="mt-5 text-center text-xs text-[var(--color-fg-muted)] leading-relaxed">
        Tvoje údaje použijeme len na prípravu ponuky a kontaktovanie.
        <br />
        Spracujeme ich do 24 hodín.
      </p>
    </form>
  );
}

interface FieldWrapProps {
  label: string;
  id: string;
  className?: string;
  children: React.ReactNode;
}

function FieldWrap({ label, id, className, children }: FieldWrapProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-[var(--color-fg)] mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
