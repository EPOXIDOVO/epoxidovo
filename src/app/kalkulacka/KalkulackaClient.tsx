"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight, CheckCircle2, Mail, Phone, Timer, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { trackEvent } from "@/components/analytics/Analytics";
import { CATEGORIES } from "@/content/categories";
import { SITE } from "@/lib/site";

/**
 * Ads landing — automatická orientačná CP na email.
 *
 * Kategórie sú vizuálne 1:1 so sekciou "Čo všetko vieme vyčarovať" na
 * homepage (rovnaké karty, kocky, ceny) — klik na kartu = výber kategórie
 * a scroll na formulár. CP sa neukazuje na obrazovke, príde na email
 * (vyžaduje reálnu adresu → kvalitnejšie leady z ads).
 */

// Kocka s bodkami — kópia z CategoriesShowcase (tam nie je exportovaná)
function DiceIcon({ pips }: { pips: 1 | 2 | 3 | 4 | 5 }) {
  const positions: Record<number, [number, number][]> = {
    1: [[2.5, 2.5]],
    2: [[1.5, 1.5], [3.5, 3.5]],
    3: [[1.5, 1.5], [2.5, 2.5], [3.5, 3.5]],
    4: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]],
    5: [[1.5, 1.5], [3.5, 1.5], [2.5, 2.5], [1.5, 3.5], [3.5, 3.5]],
  };
  return (
    <svg viewBox="0 0 5 5" className="w-full h-full" fill="currentColor" aria-hidden>
      {positions[pips].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.42} />
      ))}
    </svg>
  );
}

const PRIESTOR_OPTIONS = [
  { value: "garaz", label: "Garáž / dielňa" },
  { value: "dom", label: "Dom / byt (interiér)" },
  { value: "hala-firma", label: "Hala / firma / priemysel" },
  { value: "ine", label: "Iné" },
] as const;

const TERMIN_OPTIONS = [
  { value: "urgent", label: "Čo najskôr (do 1 mesiaca)" },
  { value: "1-3-mesiacov", label: "O 1–3 mesiace" },
  { value: "3-6-mesiacov", label: "O 3–6 mesiacov" },
  { value: "6-12-mesiacov", label: "O 6–12 mesiacov" },
  { value: "zatial-info", label: "Zatiaľ len zisťujem" },
] as const;

interface FormState {
  kategoria: string | null;
  area: string;
  priestor: string;
  lokalita: string;
  termin: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  consent: boolean;
  website: string; // honeypot
}

const EMPTY: FormState = {
  kategoria: null,
  area: "",
  priestor: "",
  lokalita: "",
  termin: "",
  name: "",
  lastName: "",
  email: "",
  phone: "",
  consent: false,
  website: "",
};

export function KalkulackaClient() {
  const [values, setValues] = React.useState<FormState>(EMPTY);
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLDivElement | null>(null);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (error) setError(null);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pickCategory = (slug: string) => {
    set("kategoria", slug);
    // Priemysel nemá online cenu — priestor rovno prednastavíme
    if (slug === "priemyselne") set("priestor", "hala-firma");
    trackEvent("kalkulacka_category", { category: slug });
    scrollToForm();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    if (!values.kategoria) {
      setError("Vyber si typ podlahy (klikni na kartu vyššie).");
      return;
    }
    const areaNum = Number(values.area);
    if (!areaNum || areaNum < 1) {
      setError("Zadaj plochu v m².");
      return;
    }
    if (!values.priestor) {
      setError("Vyber typ priestoru.");
      return;
    }
    if (values.lokalita.trim().length < 2) {
      setError("Zadaj mesto / lokalitu realizácie.");
      return;
    }
    if (values.name.trim().length < 2) {
      setError("Zadaj meno.");
      return;
    }
    if (values.lastName.trim().length < 2) {
      setError("Zadaj priezvisko.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setError("Zadaj platný email — tam ti príde cenová ponuka.");
      return;
    }
    if (!/^[+\d\s\-/()]{9,30}$/.test(values.phone.trim())) {
      setError("Zadaj platné telefónne číslo.");
      return;
    }
    if (!values.consent) {
      setError("Pre odoslanie musíš súhlasiť so spracovaním údajov.");
      return;
    }
    if (!turnstileToken) {
      setError("Počkaj chvíľu kým sa overí, že nie si bot.");
      return;
    }

    setSending(true);
    setError(null);

    // UTM z ads URL — prenesieme do CRM
    const params = new URLSearchParams(window.location.search);

    const isPriemysel = values.kategoria === "priemyselne";
    const messageLines = [
      `Lokalita: ${values.lokalita.trim()}`,
      isPriemysel ? "Kategória: Priemyselné (cena na dopyt)" : null,
      "Zdroj: kalkulačka (auto-CP landing)",
    ].filter(Boolean);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          spaceType: values.priestor || undefined,
          service: isPriemysel ? undefined : values.kategoria,
          area: areaNum,
          termin: values.termin || undefined,
          message: messageLines.join("\n"),
          consent: true,
          source: "kalkulacka",
          utmSource: params.get("utm_source") ?? undefined,
          utmMedium: params.get("utm_medium") ?? undefined,
          utmCampaign: params.get("utm_campaign") ?? undefined,
          website: values.website,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        setError("Nepodarilo sa odoslať. Skús to prosím znova.");
        setSending(false);
        return;
      }
      setSending(false);
      setSuccess(true);
      trackEvent("kalkulacka_submit", { category: values.kategoria, area: areaNum });
      trackEvent("generate_lead", { source: "kalkulacka", value: 1, currency: "EUR" });
    } catch {
      setError("Nepodarilo sa odoslať. Skontroluj internet a skús znova.");
      setSending(false);
    }
  };

  const inputCls =
    "block w-full appearance-none px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-sm text-zinc-900 placeholder:text-zinc-400 caret-zinc-900";
  const labelCls = "block text-sm font-semibold text-zinc-900 mb-1.5";

  // ═══ SUCCESS ═══
  if (success) {
    return (
      <section className="min-h-[80vh] bg-[#0a0f1e] text-white flex items-center">
        <Container size="md" className="py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-400 mb-6">
            <Mail className="w-10 h-10" aria-hidden />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Hotovo! Cenová ponuka ti letí na email
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            Orientačnú cenovú ponuku posielame na{" "}
            <strong className="text-white">{values.email.trim()}</strong> —
            zvyčajne dorazí do pár minút. Ak ju nevidíš, mrkni do spamu.
          </p>
          <p className="mt-3 text-white/60 text-sm max-w-xl mx-auto">
            Ponuka je nezáväzná. Presnú cenu ti potvrdíme po krátkom telefonáte
            alebo obhliadke.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3db6e8] text-white font-semibold hover:bg-[#1a8cc4] transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden />
              {SITE.contact.phone}
            </a>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, rgba(61,182,232,0.22), transparent 75%)",
          }}
        />
        <Container size="xl" className="pt-24 md:pt-32 pb-10 md:pb-14 relative text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Zisti cenu svojej
            <br />
            <span className="text-[#3db6e8]">epoxidovej podlahy</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Vyber si typ podlahy, vyplň krátky formulár a{" "}
            <strong className="text-white">
              orientačná cenová ponuka ti príde na email
            </strong>{" "}
            — automaticky a zadarmo.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#3db6e8]" aria-hidden />
              Trvá to menej než minútu
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#3db6e8]" aria-hidden />
              CP na email do pár minút
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3db6e8]" aria-hidden />
              Nezáväzné a zadarmo
            </span>
          </div>
        </Container>
      </section>

      {/* ═══ KATEGÓRIE — štýl "Čo všetko vieme vyčarovať" ═══ */}
      <section className="bg-[var(--color-copper)] text-white">
        <Container size="xl" className="pt-10 md:pt-16 pb-10 md:pb-14">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#3db6e8]">
              Čo všetko vieme vyčarovať
            </h2>
            <p className="mt-2 text-white/85 text-sm md:text-base">
              Klikni na typ podlahy, ktorý ťa zaujíma — formulár sa predvyplní.
            </p>
          </div>

          <div className="mt-6 md:mt-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 md:gap-5">
            {CATEGORIES.map((cat, idx) => {
              const selected = values.kategoria === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => pickCategory(cat.slug)}
                  aria-pressed={selected}
                  className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#5c2c18] text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${
                    idx === 4 ? "col-span-2 md:col-span-1" : ""
                  } ${selected ? "ring-4 ring-[#3db6e8] shadow-[0_0_0_4px_rgba(61,182,232,0.3),0_18px_40px_rgba(0,0,0,0.35)]" : ""}`}
                >
                  {selected && (
                    <span className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#3db6e8] text-white shadow-lg">
                      <CheckCircle2 className="w-5 h-5" aria-hidden />
                    </span>
                  )}
                  <div className="px-3 pt-2.5 pb-2 md:p-6 md:pb-3 h-[84px] md:h-[150px] flex flex-col">
                    <div className="w-6 h-6 md:w-9 md:h-9 mb-1 md:mb-4 rounded-md bg-white text-[#5c2c18] group-hover:text-[#3db6e8] flex items-center justify-center p-1 md:p-1.5 transition-colors duration-500 shrink-0">
                      <DiceIcon pips={(idx + 1) as 1 | 2 | 3 | 4 | 5} />
                    </div>
                    <h3 className="text-[15px] leading-[1.12] md:text-xl lg:text-2xl font-black text-white tracking-tight md:leading-[1.05]">
                      {cat.name === "Jednofarebné" ? "Hladké jednofarebné" : cat.name}
                    </h3>
                  </div>
                  <div className={`relative overflow-hidden ${idx === 4 ? "aspect-[16/7] md:aspect-[4/3]" : "aspect-[4/3]"}`}>
                    <Image
                      src={
                        cat.slug === "jednofarebne"
                          ? "/images/hero/byvanie-v2.webp"
                          : cat.slug === "priemyselne"
                          ? "/images/hero/hala.jpg"
                          : `/images/categories/${cat.slug}.jpg`
                      }
                      alt={`${cat.name} epoxidová podlaha`}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      quality={85}
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute bottom-2 right-2 inline-flex items-baseline gap-1 px-[8px] py-[4px] md:px-[12px] md:py-[7px] rounded-lg bg-white/95 backdrop-blur-md border border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                      {cat.priceLabel ? (
                        <span className="text-[12px] md:text-[15px] font-bold text-[#1a1a1a] leading-none">
                          {cat.priceLabel}
                        </span>
                      ) : (
                        <>
                          <span className="text-[9px] md:text-[11px] font-normal lowercase text-[#888]">od</span>
                          <span className="text-[12px] md:text-[15px] font-bold text-[#1a1a1a] leading-none">
                            {cat.priceFrom} €
                          </span>
                          <span className="text-[10px] md:text-[11px] font-medium text-[#555]">/m²</span>
                        </>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Veľký centrálny CTA */}
          <div className="mt-8 md:mt-12 flex justify-center">
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center gap-3 px-9 md:px-14 py-4 md:py-5 rounded-full bg-[#f97316] text-white font-extrabold text-lg md:text-2xl tracking-tight shadow-[0_14px_40px_rgba(249,115,22,0.55)] hover:bg-[#ea580c] hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(249,115,22,0.65)] transition-all duration-300"
            >
              Zistiť cenu mojej podlahy
              <ArrowDown className="w-5 h-5 md:w-7 md:h-7" aria-hidden />
            </button>
          </div>
        </Container>
      </section>

      {/* ═══ FORMULÁR ═══ */}
      <section ref={formRef} className="bg-[var(--color-copper)] text-white scroll-mt-24">
        <Container size="md" className="pb-14 md:pb-24">
          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-3xl bg-white text-zinc-900 p-6 md:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Cenová ponuka na email
            </h2>
            <p className="mt-1.5 text-sm md:text-base text-zinc-500">
              {values.kategoria
                ? `Vybraté: ${
                    CATEGORIES.find((c) => c.slug === values.kategoria)?.name ?? ""
                  } podlaha. Doplň zvyšok a CP ti pošleme na email.`
                : "Najprv si vyber typ podlahy kliknutím na kartu vyššie."}
            </p>

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

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="k-area" className={labelCls}>
                  Plocha v m² *
                </label>
                <input
                  id="k-area"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={100000}
                  required
                  placeholder="napr. 45"
                  value={values.area}
                  onChange={(e) => set("area", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="k-priestor" className={labelCls}>
                  Typ priestoru *
                </label>
                <select
                  id="k-priestor"
                  required
                  value={values.priestor}
                  onChange={(e) => set("priestor", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Vyber priestor…</option>
                  {PRIESTOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="k-lokalita" className={labelCls}>
                  Mesto / lokalita *
                </label>
                <input
                  id="k-lokalita"
                  type="text"
                  required
                  placeholder="napr. Žilina"
                  value={values.lokalita}
                  onChange={(e) => set("lokalita", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="k-termin" className={labelCls}>
                  Kedy plánuješ realizáciu?
                </label>
                <select
                  id="k-termin"
                  value={values.termin}
                  onChange={(e) => set("termin", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Vyber termín…</option>
                  {TERMIN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="k-name" className={labelCls}>
                  Meno *
                </label>
                <input
                  id="k-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="k-lastname" className={labelCls}>
                  Priezvisko *
                </label>
                <input
                  id="k-lastname"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={values.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="k-email" className={labelCls}>
                  Email * <span className="font-normal text-zinc-400">(sem príde CP)</span>
                </label>
                <input
                  id="k-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="k-phone" className={labelCls}>
                  Telefón *
                </label>
                <input
                  id="k-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={values.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 text-xs text-zinc-500 cursor-pointer">
              <input
                type="checkbox"
                checked={values.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-[#3db6e8]"
              />
              <span>
                Súhlasím so spracovaním osobných údajov za účelom vypracovania
                cenovej ponuky. *
              </span>
            </label>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5 flex justify-center">
              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>

            <button
              type="submit"
              disabled={sending || !turnstileToken}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#f97316] text-white font-extrabold text-base md:text-lg hover:bg-[#ea580c] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_36px_rgba(249,115,22,0.5)] transition-all duration-300"
            >
              {sending ? "Posielame…" : "Poslať mi cenovú ponuku na email"}
              {!sending && <ArrowRight className="w-5 h-5" aria-hidden />}
            </button>
            <p className="mt-3 text-center text-xs text-zinc-400">
              Nezáväzné a zadarmo. Presnú cenu potvrdíme po obhliadke.
            </p>
          </form>
        </Container>
      </section>
    </>
  );
}
