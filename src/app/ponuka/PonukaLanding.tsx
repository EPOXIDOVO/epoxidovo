"use client";

import * as React from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Clock,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { REVIEWS } from "@/content/reviews";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";

/* ------------------------------------------------------------------ */
/*  Dáta formulára                                                     */
/* ------------------------------------------------------------------ */

type Service = "metalicke" | "mramorove" | "jednofarebne" | "chipsove" | "neviem";
type SpaceType = "dom" | "garaz" | "hala-firma" | "ine";
type Termin = "urgent" | "1-3-mesiacov" | "3-6-mesiacov" | "6-12-mesiacov" | "zatial-info";

const SLUZBY: { value: Service; label: string; popis: string; img: string }[] = [
  {
    value: "metalicke",
    label: "Metalická",
    popis: "3D efekt, každá je originál",
    img: "/images/categories/metalicke.jpg",
  },
  {
    value: "mramorove",
    label: "Mramorová",
    popis: "Luxusný kameňový vzhľad",
    img: "/images/categories/mramorove.jpg",
  },
  {
    value: "jednofarebne",
    label: "Jednofarebná",
    popis: "Čistá plocha v ľubovoľnom RAL",
    img: "/images/categories/jednofarebne.jpg",
  },
  {
    value: "chipsove",
    label: "Chipsová",
    popis: "Odolná, protišmyková",
    img: "/images/categories/chipsove.jpg",
  },
  {
    value: "neviem",
    label: "Ešte neviem",
    popis: "Poradíme ti pri obhliadke",
    img: "/images/realizacie/r-33.jpg",
  },
];

const PRIESTORY: { value: SpaceType; label: string; popis: string }[] = [
  { value: "dom", label: "Dom / byt", popis: "Interiér, obývačka, kuchyňa" },
  { value: "garaz", label: "Garáž / dielňa", popis: "Aj vykurovaná garáž" },
  { value: "hala-firma", label: "Hala / firma", popis: "Výroba, sklad, prevádzka" },
  { value: "ine", label: "Iné", popis: "Terasa, schody, balkón…" },
];

const TERMINY: { value: Termin; label: string }[] = [
  { value: "urgent", label: "Čo najskôr (do 1 mesiaca)" },
  { value: "1-3-mesiacov", label: "O 1 – 3 mesiace" },
  { value: "3-6-mesiacov", label: "O 3 – 6 mesiacov" },
  { value: "6-12-mesiacov", label: "O 6 – 12 mesiacov" },
  { value: "zatial-info", label: "Zatiaľ len zisťujem cenu" },
];

const GALERIA = [
  "/images/realizacie/r-33.jpg",
  "/images/realizacie/r-31.jpg",
  "/images/realizacie/r-34.jpg",
  "/images/realizacie/r-11.jpg",
  "/images/realizacie/r-32.jpg",
  "/images/realizacie/r-35.jpg",
  "/images/realizacie/r-12.jpg",
  "/images/realizacie/r-36.jpg",
];

const KROKY = [
  { n: "1", t: "Vyplníš formulár", d: "Zaberie to necelú minútu — stačí typ priestoru a približná plocha." },
  { n: "2", t: "Ozveme sa do 24 hodín", d: "Zavoláme, doladíme detaily a dohodneme bezplatnú obhliadku." },
  { n: "3", t: "Dostaneš cenu na mieru", d: "Konečná cena bez DPH navyše — sme neplatca DPH, čo vidíš, to platíš." },
  { n: "4", t: "Prídeme a nalejeme", d: "Bežná podlaha do domu je hotová za 2 – 4 dni. Po sebe upraceme." },
];

const FAQ = [
  {
    q: "Koľko stojí epoxidová podlaha?",
    a: "Závisí od typu, plochy a stavu podkladu. Jednofarebná do garáže začína okolo 35 €/m², metalická do interiéru sa pohybuje od 129 €/m². Presnú cenu ti pošleme po vyplnení formulára — je konečná, sme neplatca DPH.",
  },
  {
    q: "Ako dlho to trvá?",
    a: "Bežná podlaha v dome alebo garáži býva hotová za 2 – 4 dni vrátane schnutia. Väčšie haly riešime po etapách, aby prevádzka nestála.",
  },
  {
    q: "Dá sa liať na starú dlažbu alebo poter?",
    a: "Vo väčšine prípadov áno — podklad odborne prebrúsime a napenetrujeme. Pri obhliadke odmeriame vlhkosť a pevnosť podkladu a povieme ti to na rovinu.",
  },
  {
    q: "Kam všade chodíte?",
    a: "Realizujeme po celom Slovensku. Sídlime v Ružomberku, doprava je pri väčších zákazkách v cene.",
  },
];

/* ------------------------------------------------------------------ */
/*  Landing                                                            */
/* ------------------------------------------------------------------ */

export function PonukaLanding() {
  return (
    <div className="bg-[#0b1220] text-white">
      <TopBar />
      <Hero />
      <Kroky />
      <Galeria />
      <Recenzie />
      <Faq />
      <ZaverecneCta />
      <Pata />
      <StickyMobileCta />
    </div>
  );
}

/* ── Top bar ─────────────────────────────────────────────────────── */

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <span className="text-lg font-extrabold tracking-tight md:text-xl">
          <span className="text-[#3db6e8]">EPOXID</span>OVO
          <span className="text-[#3db6e8]">.SK</span>
        </span>
        <a
          href={`tel:${SITE.contact.phoneRaw}`}
          onClick={() => trackEvent("click_phone", { source: "fb_landing_topbar" })}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/20 transition-colors hover:bg-white/20"
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{SITE.contact.phone}</span>
          <span className="sm:hidden">Zavolať</span>
        </a>
      </div>
    </header>
  );
}

/* ── Hero + formulár ─────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/images/categories/metalicke.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={80}
        className="object-cover opacity-45"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/85 via-[#0b1220]/80 to-[#0b1220]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(400px,460px)]">
          {/* Text */}
          <div className="lg:pt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f97316]/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#fdba74] ring-1 ring-[#f97316]/30">
              Realizácie po celom Slovensku
            </span>
            <h1
              className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight md:text-5xl"
              style={{ textWrap: "balance" }}
            >
              Epoxidová podlaha, ktorú si všimne{" "}
              <span className="text-[#3db6e8]">každá návšteva</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-snug text-white/80 md:text-lg">
              Metalické, mramorové aj jednofarebné liate podlahy do domov, garáží
              a hál. Bez škár, bez údržby, na desiatky rokov.
            </p>

            <ul className="mt-6 space-y-2.5">
              {[
                "Cenová ponuka do 24 hodín — zadarmo a nezáväzne",
                "Konečná cena bez DPH navyše (sme neplatca DPH)",
                "Bezplatná obhliadka a meranie vlhkosti podkladu",
                "Hotovo za 2 – 4 dni, po sebe upraceme",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm font-medium text-white/90 md:text-base">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#6fe3a1]" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" aria-hidden />
                <strong className="text-white">4,9</strong> / 5 od zákazníkov
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#3db6e8]" aria-hidden /> Záruka na dielo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#3db6e8]" aria-hidden /> Odpoveď do 24 h
              </span>
            </div>
          </div>

          {/* Formulár */}
          <div id="formular" className="scroll-mt-20">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Krokový formulár ────────────────────────────────────────────── */

interface FormValues {
  service: Service | "";
  spaceType: SpaceType | "";
  area: string;
  city: string;
  termin: Termin | "";
  name: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  website: string; // honeypot
}

const EMPTY: FormValues = {
  service: "",
  spaceType: "",
  area: "",
  city: "",
  termin: "",
  name: "",
  lastName: "",
  phone: "",
  email: "",
  message: "",
  website: "",
};

const KROKOV = 3;

function LeadForm() {
  const [step, setStep] = React.useState(0);
  const [v, setV] = React.useState<FormValues>(EMPTY);
  const [err, setErr] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [utm, setUtm] = React.useState<{ source?: string; medium?: string; campaign?: string }>({});

  // UTM z URL (?utm_source=…) — čítame z window, aby sme nepotrebovali
  // Suspense boundary okolo useSearchParams.
  React.useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      setUtm({
        source: p.get("utm_source") ?? undefined,
        medium: p.get("utm_medium") ?? undefined,
        campaign: p.get("utm_campaign") ?? undefined,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (err) setErr(null);
  };

  const dalej = () => {
    setErr(null);
    if (step === 0 && !v.service) {
      setErr("Vyber typ podlahy.");
      return;
    }
    if (step === 1) {
      if (!v.spaceType) {
        setErr("Vyber typ priestoru.");
        return;
      }
      if (!Number(v.area) || Number(v.area) < 1) {
        setErr("Zadaj približnú plochu v m².");
        return;
      }
      if (v.city.trim().length < 2) {
        setErr("Zadaj mesto alebo obec.");
        return;
      }
    }
    trackEvent("form_step", { source: "fb_landing", step: step + 1 });
    setStep((s) => Math.min(s + 1, KROKOV - 1));
  };

  const spat = () => {
    setErr(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const odoslat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    if (v.name.trim().length < 2) return setErr("Zadaj meno.");
    if (v.lastName.trim().length < 2) return setErr("Zadaj priezvisko.");
    if (!/^[+\d\s\-/()]{9,30}$/.test(v.phone.trim())) return setErr("Zadaj platné telefónne číslo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) return setErr("Zadaj platnú e-mailovú adresu.");
    if (!token) return setErr("Počkaj chvíľu, kým sa overí, že nie si robot.");

    setSending(true);
    setErr(null);

    const spaceLabel = PRIESTORY.find((p) => p.value === v.spaceType)?.label ?? "";
    const sluzbaLabel = SLUZBY.find((s) => s.value === v.service)?.label ?? "";
    const sprava = [
      `Typ podlahy: ${sluzbaLabel}`,
      `Priestor: ${spaceLabel}`,
      `Plocha: ${v.area} m²`,
      `Mesto / obec: ${v.city.trim()}`,
      v.termin ? `Termín: ${TERMINY.find((t) => t.value === v.termin)?.label}` : "",
      v.message.trim() ? `\nPoznámka:\n${v.message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name.trim(),
          lastName: v.lastName.trim(),
          email: v.email.trim(),
          phone: v.phone.trim(),
          area: Number(v.area),
          spaceType: v.spaceType || undefined,
          service: v.service || undefined,
          termin: v.termin || undefined,
          message: sprava,
          consent: true,
          source: "fb_landing",
          utmSource: utm.source || "facebook",
          utmMedium: utm.medium || "paid_social",
          utmCampaign: utm.campaign || "Facebook reklama (/ponuka)",
          website: v.website,
          turnstileToken: token,
        }),
      });

      if (!res.ok) {
        setErr("Nepodarilo sa odoslať. Skús to prosím ešte raz, alebo nám zavolaj.");
        setSending(false);
        return;
      }

      setSending(false);
      setSuccess(true);
      trackEvent("lead_submit", { source: "fb_landing", area: Number(v.area) });
      trackEvent("generate_lead", { value: 1, currency: "EUR" });
    } catch {
      setErr("Nepodarilo sa odoslať. Skús to prosím ešte raz, alebo nám zavolaj.");
      setSending(false);
    }
  };

  /* ── Úspech ── */
  if (success) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-[#0e1a3b] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Máme to! Ozveme sa do 24 hodín</h2>
        <p className="mt-3 text-[#4a5478]">
          Tvoj dopyt je u nás. Pripravíme cenovú ponuku na mieru a zavoláme ti
          najneskôr do 24 hodín — väčšinou ešte v ten istý deň.
        </p>
        <p className="mt-5 text-sm text-[#6b7390]">
          Ponáhľa sa to? Zavolaj rovno na{" "}
          <a href={`tel:${SITE.contact.phoneRaw}`} className="font-bold text-[#0e1a3b] underline">
            {SITE.contact.phone}
          </a>
        </p>
      </div>
    );
  }

  const inputCls =
    "block w-full rounded-xl border border-[#d4d4d8] bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 caret-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3db6e8]";

  return (
    <form
      onSubmit={odoslat}
      noValidate
      className="rounded-3xl bg-white p-5 text-[#0e1a3b] shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:p-6"
    >
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={v.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold tracking-tight md:text-xl">
            Nezáväzná cenová ponuka
          </h2>
          <span className="text-xs font-bold text-[#6b7390]">
            Krok {step + 1} / {KROKOV}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e4e4e7]">
          <div
            className="h-full rounded-full bg-[#3db6e8] transition-all duration-300"
            style={{ width: `${((step + 1) / KROKOV) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Krok 1: typ podlahy ── */}
      {step === 0 && (
        <div>
          <p className="mb-3 text-sm font-bold">Aký typ podlahy ťa zaujíma?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {SLUZBY.map((s) => {
              const aktivny = v.service === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={aktivny}
                  onClick={() => set("service", s.value)}
                  className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                    aktivny
                      ? "border-[#3db6e8] ring-2 ring-[#3db6e8]/30"
                      : "border-[#e4e4e7] hover:border-[#3db6e8]/50"
                  }`}
                >
                  <div className="relative h-16 w-full">
                    <Image src={s.img} alt="" fill sizes="200px" className="object-cover" />
                    {aktivny && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#3db6e8] text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <span className="block text-sm font-bold leading-tight">{s.label}</span>
                    <span className="block text-[11px] leading-tight text-[#6b7390]">{s.popis}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Krok 2: priestor, plocha, mesto ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-bold">Kam ju plánuješ?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {PRIESTORY.map((p) => {
                const aktivny = v.spaceType === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    aria-pressed={aktivny}
                    onClick={() => set("spaceType", p.value)}
                    className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                      aktivny
                        ? "border-[#3db6e8] bg-[#3db6e8]/5 ring-2 ring-[#3db6e8]/30"
                        : "border-[#e4e4e7] hover:border-[#3db6e8]/50"
                    }`}
                  >
                    <span className="block text-sm font-bold leading-tight">{p.label}</span>
                    <span className="block text-[11px] leading-tight text-[#6b7390]">{p.popis}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Približná plocha (m²) *" id="p-area">
              <input
                id="p-area"
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="napr. 40"
                value={v.area}
                onChange={(e) => set("area", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Mesto / obec *" id="p-city">
              <input
                id="p-city"
                type="text"
                autoComplete="address-level2"
                placeholder="napr. Žilina"
                value={v.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Kedy by si to chcel(a) mať hotové?" id="p-termin">
            <select
              id="p-termin"
              value={v.termin}
              onChange={(e) => set("termin", e.target.value as Termin)}
              className={inputCls}
            >
              <option value="">Vyber termín…</option>
              {TERMINY.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {/* ── Krok 3: kontakt ── */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-bold">Kam ti máme poslať ponuku?</p>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Meno *" id="p-name">
              <input
                id="p-name"
                type="text"
                autoComplete="given-name"
                value={v.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Priezvisko *" id="p-lastname">
              <input
                id="p-lastname"
                type="text"
                autoComplete="family-name"
                value={v.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Telefón *" id="p-phone">
            <input
              id="p-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+421 9…"
              value={v.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="E-mail *" id="p-email">
            <input
              id="p-email"
              type="email"
              autoComplete="email"
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Chceš niečo doplniť? (nepovinné)" id="p-message">
            <textarea
              id="p-message"
              rows={2}
              placeholder="Farba, vzor, stav podkladu…"
              value={v.message}
              onChange={(e) => set("message", e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />
        </div>
      )}

      {err && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Navigácia */}
      <div className="mt-4 flex items-center gap-2.5">
        {step > 0 && (
          <button
            type="button"
            onClick={spat}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#d4d4d8] px-4 py-3 text-sm font-bold text-[#4a5478] transition-colors hover:bg-[#fafafa]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Späť
          </button>
        )}
        {step < KROKOV - 1 ? (
          <button
            type="button"
            onClick={dalej}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-3.5 text-base font-extrabold text-white shadow-[0_10px_28px_rgba(249,115,22,0.45)] transition-colors hover:bg-[#ea580c]"
          >
            Pokračovať <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            disabled={sending || !token}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#f97316] px-6 py-3.5 text-base font-extrabold text-white shadow-[0_10px_28px_rgba(249,115,22,0.45)] transition-colors hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Posielame…
              </>
            ) : (
              "Chcem cenovú ponuku"
            )}
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] leading-snug text-[#6b7390]">
        Nezáväzné a zadarmo. Údaje použijeme len na prípravu ponuky — žiadny spam.
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#0e1a3b]">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Ako to prebieha ─────────────────────────────────────────────── */

function Kroky() {
  return (
    <section className="border-t border-white/10 bg-[#0e1a3b]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Ako to prebieha</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {KROKY.map((k) => (
            <div key={k.n} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3db6e8] text-sm font-extrabold text-[#0b1220]">
                {k.n}
              </span>
              <h3 className="mt-3.5 text-base font-bold">{k.t}</h3>
              <p className="mt-1.5 text-sm leading-snug text-white/70">{k.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Galéria ─────────────────────────────────────────────────────── */

function Galeria() {
  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Naše realizácie
        </h2>
        <p className="mt-2 max-w-2xl text-white/70">
          Každá liata podlaha je originál — dve rovnaké neexistujú. Toto sú
          skutočné podlahy od nás, nie stock fotky.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          {GALERIA.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl">
              <Image
                src={src}
                alt="Realizácia epoxidovej podlahy"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Recenzie ────────────────────────────────────────────────────── */

function Recenzie() {
  const vyber = REVIEWS.slice(0, 3);
  return (
    <section className="border-t border-white/10 bg-[#0e1a3b]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Čo hovoria zákazníci
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {vyber.map((r) => (
            <figure key={r.id} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="flex gap-0.5" aria-label="5 z 5 hviezdičiek">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-white/85">
                „{r.text}"
              </blockquote>
              <figcaption className="mt-4 text-xs font-bold text-white/60">
                {r.name}
                {r.location ? ` — ${r.location}` : ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────── */

function Faq() {
  return (
    <section className="border-t border-white/10">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Časté otázky</h2>
        <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold">
                {f.q}
                <span className="shrink-0 text-[#3db6e8] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-white/70">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Záverečné CTA ───────────────────────────────────────────────── */

function ZaverecneCta() {
  return (
    <section className="border-t border-white/10 bg-gradient-to-b from-[#0e1a3b] to-[#0b1220]">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6 md:py-20">
        <h2
          className="text-2xl font-extrabold tracking-tight md:text-4xl"
          style={{ textWrap: "balance" }}
        >
          Zisti, koľko by stála tvoja podlaha
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/75">
          Vyplnenie formulára zaberie necelú minútu. Ozveme sa do 24 hodín
          s cenou na mieru — nezáväzne a zadarmo.
        </p>
        <a
          href="#formular"
          onClick={() => trackEvent("cta_click", { source: "fb_landing_bottom" })}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#f97316] px-8 py-4 text-base font-extrabold text-white shadow-[0_12px_32px_rgba(249,115,22,0.5)] transition-colors hover:bg-[#ea580c] md:text-lg"
        >
          Chcem cenovú ponuku <ArrowRight className="h-5 w-5" aria-hidden />
        </a>
        <p className="mt-5 text-sm text-white/60">
          Alebo zavolaj priamo:{" "}
          <a href={`tel:${SITE.contact.phoneRaw}`} className="font-bold text-white underline">
            {SITE.contact.phone}
          </a>
        </p>
      </div>
    </section>
  );
}

/* ── Pätička ─────────────────────────────────────────────────────── */

function Pata() {
  return (
    <footer className="border-t border-white/10 pb-24 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs leading-relaxed text-white/45 md:px-6">
        <p className="font-bold text-white/70">{SITE.legalName}</p>
        <p className="mt-1">
          {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city} · IČO{" "}
          {SITE.business.ico} · DIČ {SITE.business.dic} · neplatca DPH
        </p>
        <p className="mt-1">
          {SITE.contact.phone} · {SITE.contact.email}
        </p>
        <p className="mt-3">
          <a href="/ochrana-sukromia" className="underline hover:text-white/70">
            Ochrana osobných údajov
          </a>
        </p>
      </div>
    </footer>
  );
}

/* ── Sticky CTA na mobile ────────────────────────────────────────── */

function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b1220]/95 p-3 backdrop-blur-md md:hidden">
      <div className="flex gap-2.5">
        <a
          href={`tel:${SITE.contact.phoneRaw}`}
          onClick={() => trackEvent("click_phone", { source: "fb_landing_sticky" })}
          className="inline-flex items-center justify-center rounded-full border border-white/25 px-4 py-3 text-sm font-bold text-white"
          aria-label="Zavolať"
        >
          <Phone className="h-5 w-5" aria-hidden />
        </a>
        <a
          href="#formular"
          onClick={() => trackEvent("cta_click", { source: "fb_landing_sticky" })}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f97316] px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(249,115,22,0.45)]"
        >
          Chcem cenovú ponuku
        </a>
      </div>
    </div>
  );
}
