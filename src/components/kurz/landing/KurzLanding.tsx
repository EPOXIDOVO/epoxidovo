"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";
import { KURZ } from "@/content/kurz";
import { COURSE_EN } from "@/content/kurz-en";
import { COPY, type Locale } from "./copy";
import { KurzZisk, useAnimatedNumber } from "./KurzZisk";
import { spocitajZisk, TYPY, type TypSlug } from "@/lib/kurz-zisk";
import "./landing.css";

/* ------------------------------------------------------------------ */
/*  Texty nových sekcií (SK/EN)                                        */
/* ------------------------------------------------------------------ */

const V2 = {
  sk: {
    badge: "Online kurz · prístup okamžite po zaplatení",
    h1a: "Nauč sa liať podlahy.",
    h1em: "A postav na tom firmu.",
    lead: "Toto nie je len kurz — je to celý funkčný biznis model v kocke. Roky skúseností z reálnych zákaziek, softvér, vďaka ktorému firma beží aj bez teba, a reálne čísla, ktoré inde neuvidíš. Naučíš sa remeslo — a biznis, ktorý ho predáva.",
    ctaMain: "Chcem prístup",
    ctaProgram: "Koľko zarobím? ↓",
    facts: [
      ["8+ h", "videa z reálnych zákaziek"],
      ["40+", "lekcií v 2 moduloch"],
      ["24/7", "prístup navždy"],
      ["14 dní", "garancia vrátenia peňazí"],
    ],
    proofs: [
      {
        text: "Nie sme len školitelia — sme realizačná firma EPOXIDOVO s.r.o., ktorá podlahy reálne leje.",
        cta: "Pozri naše realizácie →",
        href: "/realizacie",
      },
      {
        text: "Na zákazku budovaný softvér, ktorý našu firmu stál desiatky tisíc €, máš v cene.",
      },
      {
        text: "Získaš okamžitý prístup k 20 rokom podlahárskych tajomstiev.",
      },
    ] as { text: string; cta?: string; href?: string }[],
    partner: {
      eyebrow: "Spolupráca s našou firmou",
      h2a: "Netrúfaš si ešte na veľkú zákazku? ",
      h2em: "Urobíme ju spolu.",
      body: "Keď sa dostaneš k zákazke, na ktorú si ešte netrúfaš, nemusíš ju nechať konkurencii. Naša realizačná firma EPOXIDOVO ju urobí — zisk si rozdelíme a ty si pri tom zadarmo zaškolíš seba aj svojich ľudí. Na reálnej zákazke, nie na tréningovej ploche.",
      steps: [
        ["Zákazku prinesieš ty", "Pomôžeme ti nastaviť cenovú ponuku tak, aby si zarobil."],
        ["Realizuje naša partia s tebou", "Lejeme spolu — ty a tvoji ľudia ste pri každom kroku."],
        ["Zisk si rozdelíme", "Ty máš zárobok aj zaškolený tím, my podiel z realizácie."],
      ] as [string, string][],
      supportTitle: "Zasekneš sa? Zavolaj nám.",
      supportBody: "Keď pri zákazke nebudeš niečo vedieť, zdvihneme telefón a odpovieme ti na čokoľvek — a keď treba, vyriešime to za teba. Záleží nám na tom, aby sa ti práca podarila.",
    },
    hcalc: {
      tag: "Kalkulačka zárobku",
      live: "naživo",
      typAria: "Typ podlahy",
      plocha: "Plocha zákazky",
      rowSell: "Vyfakturuješ zákazníkovi",
      rowMat: "Materiál (veľkoobchod)",
      rowKeep: "Zarobíš",
      note: (m2: number) => `Kurz Štandard (${KURZ.priceStandard} €) sa ti vráti po ~${m2} m².`,
      ctx: "Priemerná garáž má ~50 m², priemerný rodinný dom ~120 m².",
      more: "Celá kalkulačka s detailmi ↓",
    },
    claimH2a: "Kurz nakrútený na zákazkách, ktoré nám ",
    claimH2em: "zákazníci zaplatili.",
    claimBody: "Lejeme podlahy po celom Slovensku a presne vieme, kde začiatočníci zabíjajú svoju prvú zákazku: v podklade, v miešaní a v cene. Kurz stojí na týchto troch veciach, každý záber je z reálnej realizácie, nie zo štúdia. Jedna chyba ťa pritom môže stáť tisíce eur len v materiáli, ktorý rozleješ — s nami ideš na isto. Žiadne lúštenie technických listov: ľudskou rečou ti povieme, čo naozaj funguje.",
    claimPoints: [
      "Každý krok vidíš zblízka a v reálnom čase, od brúsenia po finálny lak",
      "Manuál so spotrebami a vzorová cenová ponuka pre tvojich zákazníkov",
      "Otázky píšeš priamo pod lekciu, odpovedá lektor",
      "Certifikát po záverečnom teste a partnerské ceny materiálu v našom e-shope",
    ],
    claimCaption: "Metalická podlaha, práca absolventa",
    daysH2: "Obsah kurzu: dva moduly",
    daysIntro: "Prvý modul rozhoduje o tom, či podlaha vydrží. Druhý o tom, ako vyzerá a koľko si za ňu vypýtaš.",
    day1Label: "Modul 1 · 20+ lekcií",
    day2Label: "Modul 2 · 20+ lekcií",
    day1Title: "Podklad a materiály",
    day2Title: "Liatie, dekor a biznis",
    day1Items: [
      "Aké materiály existujú a kedy ktorý použiť",
      "Ako spoznať, či je betón pripravený",
      "Príprava podkladu a brúsenie zblízka",
      "Penetrácia, vysprávky a opravy prasklín",
      "Miešanie dvoch zložiek bez chýb",
    ],
    day2Items: [
      "Liatie jednofarebnej podlahy krok za krokom",
      "Chipsy a metalický efekt — dekor, ktorý predáva",
      "Sokle, prechody a detaily",
      "Cenotvorba — koľko si vypýtať a čo dať do ponuky",
      "Škálovanie firmy — ľudia, systémy, viac zákaziek naraz",
      "Ako získať prvé zákazky vo svojom okolí",
    ],
    dayMeta1: "Každá lekcia má pod videom priestor na otázky.",
    dayMeta2: "Na konci záverečný test a certifikát.",
    stripH2: "Naše realizácie",
    stripCaptions: ["Metalická garáž", "Obývačka, jednofarebná liata", "Priemyselná hala", "Chipsová prevádzka", "Metalický efekt zblízka", "Kancelárie", "Mistral — vzorkovník Arturo", "Concrete Look — vzorkovník Arturo"],
    stripPreviewText: "Presne toto sa na kurze naučíš liať — reálna práca našej realizačnej firmy.",
    stripPreviewCta: "Pozri všetky realizácie →",
    stripClose: "Zavrieť",
    pricingH2: "Cena a balíky",
    pricingIntro: "Nie sme platcami DPH, ceny sú konečné. Kúpiš raz, prístup máš navždy.",
    stdTitle: "Štandard",
    stdDesc: "Kompletný online kurz s prístupom navždy.",
    stdItems: ["8+ hodín videa, 40+ lekcií", "Manuál a kalkulačka spotreby (SK + EN)", "Vzorová cenová ponuka", "Certifikát po záverečnom teste", "Otázky pod lekciami, odpovedá lektor"],
    stdCta: "Kúpiť Štandard",
    proTag: "Celý biznis model",
    proTitle: "PRO s mentoringom",
    proDesc: "Kurz + systémy našej firmy a tri mesiace vedenia pri prvých zákazkách.",
    proItems: ["Všetko zo Štandardu", "3 mesiace osobného mentoringu: telefón, fotky z realizácie, cenové ponuky", "CRM na dopyty + aplikácia na zamestnancov", "Reálne čísla: mzdy, marže, škálovanie", "Kontrola tvojej prvej realizácie krok po kroku"],
    proCta: "Kúpiť PRO",
    perPerson: "na osobu",
    firmaNote: "Chceš prístup pre celú partiu? Pri troch a viac ľuďoch z jednej firmy dáme skupinovú cenu.",
    firmaLink: "Napíš nám cez objednávku",
    faqH2: "Časté otázky",
    formTitle: "Objednávka a platba",
    vrstvyEyebrow: "Prečo Akadémia, nie kurz",
    vrstvyH2a: "Firma sa stavia ako podlaha. ",
    vrstvyH2em: "Vo vrstvách.",
    vrstvyBody: "Videokurz je len prvá vrstva. Nad ňou dostaneš systémy, na ktorých EPOXIDOVO reálne beží — od prvého dopytu po firmu, ktorá rastie aj bez teba pri každom liatí.",
    vrstvyItems: [
      {
        title: "Remeslo",
        body: "8+ hodín videa nakrútených na zákazkách, ktoré nám zákazníci zaplatili. Od diagnostiky betónu po finálny lak — každý krok zblízka, žiadne štúdio.",
        chips: [{ label: "40+ lekcií" }, { label: "manuál so spotrebami" }, { label: "certifikát" }],
      },
      {
        title: "Zákazky",
        body: "Firemný systém na spracovanie dopytov (CRM), vzorová cenová ponuka a cenotvorba, s ktorou ti neprepadne ani jeden dopyt.",
        chips: [{ label: "CRM systém", hot: true }, { label: "vzorová CP" }, { label: "cenotvorba €/m²" }],
      },
      {
        title: "Ľudia",
        body: "Aplikácia na sledovanie zamestnancov a reálne čísla, koľko komu platiť — mzdy a odmeny podľa toho, čo nám naozaj funguje. Žiadne odhady.",
        chips: [{ label: "aplikácia na ľudí", hot: true }, { label: "reálne mzdy" }],
      },
      {
        title: "Škálovanie",
        body: "Reálne dáta z našej firmy a plán, ako z prvej garáže vybudovať epoxidovú firmu v tvojej lokalite — a škálovať ju na milióny.",
        chips: [{ label: "čísla z našej firmy" }, { label: "firma v tvojej lokalite", hot: true }],
      },
    ] as { title: string; body: string; chips: { label: string; hot?: boolean }[] }[],
  },
  en: {
    badge: "Online course · instant access after payment",
    h1a: "Learn to pour floors.",
    h1em: "And build a business on it.",
    lead: "This isn't just a course — it's a complete, working business model. Years of experience from real jobs, software that keeps the company running without you, and real numbers you won't see anywhere else. You learn the craft — and the business that sells it.",
    ctaMain: "Get access",
    ctaProgram: "How much will I earn? ↓",
    facts: [
      ["8+ h", "of video from real jobs"],
      ["40+", "lessons in 2 modules"],
      ["24/7", "lifetime access"],
      ["14 days", "money-back guarantee"],
    ],
    proofs: [
      {
        text: "We're not just instructors — EPOXIDOVO s.r.o. is a real installation company that actually pours floors.",
        cta: "See our work →",
        href: "/realizacie",
      },
      {
        text: "Custom-built software that cost our company tens of thousands € — included in the price.",
      },
      {
        text: "Get instant access to 20 years of installer secrets.",
      },
    ] as { text: string; cta?: string; href?: string }[],
    partner: {
      eyebrow: "Partnership with our company",
      h2a: "Not ready for a big job yet? ",
      h2em: "We'll do it together.",
      body: "When you land a job you're not ready for, you don't have to leave it to the competition. Our installation company EPOXIDOVO does it — we split the profit and you train yourself and your crew for free. On a real job, not a practice slab.",
      steps: [
        ["You bring the job", "We help you set the quote so you make money."],
        ["Our crew installs it with you", "We pour together — you and your people are in on every step."],
        ["We split the profit", "You get the earnings and a trained crew, we take a share of the job."],
      ] as [string, string][],
      supportTitle: "Stuck? Call us.",
      supportBody: "When you hit something you don't know on a job, we pick up the phone and answer anything — and when needed, we solve it for you. We care that your work turns out right.",
    },
    hcalc: {
      tag: "Earnings calculator",
      live: "live",
      typAria: "Floor type",
      plocha: "Job area",
      rowSell: "You invoice the client",
      rowMat: "Material (wholesale)",
      rowKeep: "You earn",
      note: (m2: number) => `The Standard course (€${KURZ.priceStandard}) pays back after ~${m2} m².`,
      ctx: "An average garage is ~50 m², an average family house ~120 m².",
      more: "Full calculator with details ↓",
    },
    claimH2a: "A course filmed on jobs our ",
    claimH2em: "clients paid for.",
    claimBody: "We install floors across Slovakia and we know exactly where beginners lose their first job: the substrate, the mixing and the price. The course is built on those three things, and every shot comes from a real installation, not a studio. One mistake can cost you thousands of euros in spilled material alone — with us you play it safe. No deciphering technical data sheets: we tell you in plain language what actually works.",
    claimPoints: [
      "You see every step up close and in real time, from grinding to the final coat",
      "A manual with consumption rates and a sample quote for your clients",
      "Ask questions under each lesson, the instructor answers",
      "Certificate after the final test and partner material prices in our e-shop",
    ],
    claimCaption: "Metallic floor, graduate work",
    daysH2: "Curriculum: two modules",
    daysIntro: "Module one decides whether the floor lasts. Module two decides how it looks and what you charge for it.",
    day1Label: "Module 1 · 20+ lessons",
    day2Label: "Module 2 · 20+ lessons",
    day1Title: "Substrate and materials",
    day2Title: "Pouring, decoration and business",
    day1Items: [
      "Which materials exist and when to use each",
      "How to tell the concrete is ready",
      "Substrate prep and grinding up close",
      "Priming, patching and crack repair",
      "Mixing two components without mistakes",
    ],
    day2Items: [
      "Pouring a single-colour floor step by step",
      "Flakes and the metallic effect — decor that sells",
      "Skirtings, transitions and details",
      "Pricing — what to charge and what goes in the quote",
      "Scaling the company — people, systems, more jobs at once",
      "How to win your first jobs in your area",
    ],
    dayMeta1: "Every lesson has a question thread under the video.",
    dayMeta2: "Final test and certificate at the end.",
    stripH2: "Our installations",
    stripCaptions: ["Metallic garage", "Living room, single colour", "Industrial hall", "Flake commercial floor", "Metallic effect up close", "Offices", "Mistral — Arturo sample book", "Concrete Look — Arturo sample book"],
    stripPreviewText: "This is exactly what you learn to pour — real work by our installation company.",
    stripPreviewCta: "See all our work →",
    stripClose: "Close",
    pricingH2: "Price and packages",
    pricingIntro: "We are not VAT registered, prices are final. Buy once, keep access forever.",
    stdTitle: "Standard",
    stdDesc: "The complete online course with lifetime access.",
    stdItems: ["8+ hours of video, 40+ lessons", "Manual and consumption calculator (EN + SK)", "Sample quote for your clients", "Certificate after the final test", "Questions under each lesson, answered by the instructor"],
    stdCta: "Buy Standard",
    proTag: "The whole business model",
    proTitle: "PRO with mentoring",
    proDesc: "The course + our company systems and three months of guidance on your first jobs.",
    proItems: ["Everything in Standard", "3 months of personal mentoring: phone, site photos, quotes", "Lead CRM + employee tracking app", "Real numbers: wages, margins, scaling", "Step-by-step review of your first installation"],
    proCta: "Buy PRO",
    perPerson: "per person",
    firmaNote: "Access for the whole crew? Three or more people from one company get a group price.",
    firmaLink: "Tell us in the order form",
    faqH2: "Frequently asked",
    formTitle: "Order and payment",
    vrstvyEyebrow: "Why an Academy, not a course",
    vrstvyH2a: "A business is built like a floor. ",
    vrstvyH2em: "In layers.",
    vrstvyBody: "The video course is only the first layer. On top of it you get the systems EPOXIDOVO actually runs on — from the first lead to a company that grows without you on every pour.",
    vrstvyItems: [
      {
        title: "The craft",
        body: "8+ hours of video filmed on jobs our clients paid for. From concrete diagnostics to the final coat — every step up close, no studio.",
        chips: [{ label: "40+ lessons" }, { label: "manual with consumption rates" }, { label: "certificate" }],
      },
      {
        title: "The jobs",
        body: "Our lead-handling system (CRM), a sample quote and the pricing that makes sure not a single lead slips through.",
        chips: [{ label: "CRM system", hot: true }, { label: "sample quote" }, { label: "pricing €/m²" }],
      },
      {
        title: "The people",
        body: "An employee tracking app and real numbers on what to pay people — wages and bonuses based on what actually works for us. No guesses.",
        chips: [{ label: "crew app", hot: true }, { label: "real wages" }],
      },
      {
        title: "The scaling",
        body: "Real data from our company and the plan to go from your first garage to an epoxy business in your area — and scale it to millions.",
        chips: [{ label: "our company numbers" }, { label: "a business in your area", hot: true }],
      },
    ] as { title: string; body: string; chips: { label: string; hot?: boolean }[] }[],
  },
} as const;

const STRIP_IMAGES = [
  "/images/hero/garaz.webp",
  "/images/realizacie/r-05.jpg",
  "/images/hero/hala.webp",
  "/images/realizacie/r-07.jpg",
  "/images/realizacie/r-12.jpg",
  "/images/realizacie/r-03.jpg",
  // Mistral a Concrete Look zatiaľ nemáme odfotené z realizácie — oficiálne
  // textúry z Arturo vzorkovníka (už ich používa aj /vzorkovnik).
  "/images/vzorkovnik/arturo/mistral-calm-breeze.webp",
  "/images/vzorkovnik/arturo/concrete-look-soft-stone.webp",
];

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header({ locale, onMenu }: { locale: Locale; onMenu: (open: boolean) => void }) {
  const t = COPY[locale];
  const [fixed, setFixed] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setFixed(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onMenu(next);
  };
  const close = () => {
    if (!open) return;
    setOpen(false);
    onMenu(false);
  };

  return (
    <header className={`kl-header${fixed || open ? " is-fixed" : ""}${open ? " menu-open" : ""}`}>
      <div className="kl-container">
        <nav className="kl-nav" aria-label="Kurz">
          {/* Nápis namiesto maskota — kurz verzia loga v zlato-bielej (majiteľ). */}
          <Link href="/" className="kl-nav__brand" aria-label="EPOXIDOVO.SK">
            <span className="kl-brand-mark"><b>EPOXID</b>OVO<b>.</b>SK</span>
          </Link>
          <ul className={`kl-nav__menu${open ? " is-active" : ""}`}>
            <li><a href="#o-kurze" onClick={close}>{t.nav.about}</a></li>
            <li><a href="#program" onClick={close}>{t.nav.program}</a></li>
            <li><a href="#kalkulacka" onClick={close}>{t.nav.calc}</a></li>
            <li><a href="#cena" onClick={close}>{t.nav.price}</a></li>
            <li><a href="#faq" onClick={close}>{t.nav.faq}</a></li>
            {/* Pravá skupina piluliek v štýle BullVend headera (majiteľ). */}
            <li className="kl-nav__phone">
              <a href={`tel:${SITE.contact.phoneRaw}`}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                {SITE.contact.phone}
              </a>
            </li>
            <li className="kl-nav__cta">
              <a href="#prihlaska" onClick={close}>
                {t.nav.cta}
                <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </li>
            <li className="kl-nav__lang">
              <Link href={t.otherPath} hrefLang={locale === "sk" ? "en" : "sk"} onClick={close}>
                {t.otherLabel}
              </Link>
            </li>
          </ul>
          <button
            type="button"
            className={`kl-nav__toggle${open ? " is-active" : ""}`}
            aria-expanded={open}
            aria-label="Menu"
            onClick={toggle}
          >
            <span />
            <span />
          </button>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

/**
 * Interaktívna mini-kalkulačka priamo v hero (majiteľ 2026-08-30: „normálne
 * live si to vieš tam skúsiť naklikať, to predá ľudí"). Rovnaká cenotvorba
 * ako veľká kalkulačka — nič natvrdo. Kompakt: typy + slider + tri riadky.
 */
function HeroKalkulacka({ locale }: { locale: Locale }) {
  const t = V2[locale].hcalc;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "sk" ? "sk-SK" : "en-GB", { maximumFractionDigits: 0 }).format(n);
  const [slug, setSlug] = React.useState<TypSlug>("metalicke");
  const [m2, setM2] = React.useState(30);
  const typ = React.useMemo(() => TYPY.find((x) => x.slug === slug) ?? TYPY[0], [slug]);
  const r = React.useMemo(() => spocitajZisk(m2, typ), [m2, typ]);
  const aSell = useAnimatedNumber(r?.predajEur ?? 0);
  const aMat = useAnimatedNumber(r?.materialEur ?? 0);
  const aKeep = useAnimatedNumber(r?.hrubaMarzaEur ?? 0);
  if (!r) return null;
  return (
    <aside className="kl-hcalc" aria-label={t.tag}>
      <div className="kl-hcalc__tag">
        <span>{t.tag}</span>
        <span className="kl-hcalc__live"><i aria-hidden />{t.live}</span>
      </div>
      <div className="kl-hcalc__types" role="group" aria-label={t.typAria}>
        {TYPY.filter((x) => x.nakupMaterialEurM2 != null).map((x) => (
          <button
            key={x.slug}
            type="button"
            className={`kl-hcalc__typ${x.slug === slug ? " is-active" : ""}`}
            onClick={() => setSlug(x.slug)}
            aria-pressed={x.slug === slug}
          >
            {x.label}
          </button>
        ))}
      </div>
      <label className="kl-hcalc__slider" htmlFor="kl-hero-m2">
        <span>{t.plocha}</span>
        <strong>{m2} m²</strong>
      </label>
      <input
        id="kl-hero-m2"
        type="range"
        min={10}
        max={500}
        step={5}
        value={m2}
        onChange={(e) => setM2(Number(e.target.value))}
        className="kl-range"
        style={{ ["--p" as string]: `${((m2 - 10) / 490) * 100}%` }}
        aria-valuetext={`${m2} m²`}
      />
      <dl className="kl-hcalc__rows">
        <div><dt>{t.rowSell}</dt><dd>{fmt(aSell)} €</dd></div>
        <div><dt>{t.rowMat}</dt><dd>−{fmt(aMat)} €</dd></div>
        <div className="is-total"><dt>{t.rowKeep}</dt><dd>{fmt(aKeep)} €</dd></div>
      </dl>
      {/* Klik na návratnosť vedie rovno na ponuku kurzov (majiteľ). */}
      <a href="#cena" className="kl-hcalc__note">{t.note(r.navratnostM2)}</a>
      <p className="kl-hcalc__ctx">{t.ctx}</p>
      <a href="#kalkulacka" className="kl-hcalc__more">{t.more}</a>
    </aside>
  );
}

function Hero({ locale }: { locale: Locale }) {
  const t = V2[locale];
  return (
    <section className="kl-hero" id="hello">
      <div className="kl-hero__media" aria-hidden>
        <Image
          src="/images/hero/garaz.webp"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="kl-hero__inner">
        <div className="kl-container kl-hero__grid">
          <div>
            <p className="kl-hero__badge">
              <i aria-hidden />
              {t.badge}
            </p>
            {/* Dva riadky: veta + medená veta (majiteľ 2026-08-30). */}
            <h1>
              {t.h1a}
              <br />
              <em>{t.h1em}</em>
            </h1>
            <p className="kl-hero__lead">{t.lead}</p>
            <div className="kl-hero__actions">
              <a href="#prihlaska" className="kl-btn kl-btn--primary">{t.ctaMain}</a>
              <a href="#kalkulacka" className="kl-btn kl-btn--ghost">{t.ctaProgram}</a>
            </div>
            {/* Trust ticker — fakty bežia sprava doľava (majiteľ 2026-08-30);
                dve kópie sady + posun o −50 % = plynulá slučka. */}
            <div className="kl-hero__ticker">
              <div className="kl-hero__ticker-track">
                {[...t.facts, ...t.facts].map(([v, l], i) => (
                  <span className="kl-hero__tick" key={`${l}-${i}`} aria-hidden={i >= t.facts.length}>
                    <strong>{v}</strong>{l}
                  </span>
                ))}
              </div>
            </div>
            {/* Osobitné dôkazy so zelenou fajkou — nejdú v tickri (majiteľ). */}
            <ul className="kl-hero__proofs">
              {t.proofs.map((p) => (
                <li key={p.text}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    {p.text}
                    {p.cta && p.href && (<> <Link href={p.href}>{p.cta}</Link></>)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <HeroKalkulacka locale={locale} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Spolupráca — veľké zákazky robíme spolu, zisk sa delí              */
/* ------------------------------------------------------------------ */

function Spolupraca({ locale }: { locale: Locale }) {
  const t = V2[locale].partner;
  return (
    <section id="spolupraca" className="kl-section kl-partner">
      <div className="kl-container">
        <Reveal className="kl-partner__card">
          <div className="kl-partner__icon" aria-hidden>
            <Handshake strokeWidth={1.6} />
          </div>
          <div>
            <span className="kl-eyebrow">{t.eyebrow}</span>
            <h2>
              {t.h2a}
              <em>{t.h2em}</em>
            </h2>
            <p className="kl-partner__body">{t.body}</p>
          </div>
        </Reveal>
        <div className="kl-partner__steps">
          {t.steps.map(([title, desc], i) => (
            <Reveal as="article" className="kl-pstep" key={title} delay={i * 80}>
              <span className="kl-pstep__n">{i + 1}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </Reveal>
          ))}
        </div>
        {/* Hotline sľub — záleží nám, aby sa práca podarila (majiteľ). */}
        <Reveal className="kl-support">
          <div>
            <h3>{t.supportTitle}</h3>
            <p>{t.supportBody}</p>
          </div>
          <a href={`tel:${SITE.contact.phoneRaw}`} className="kl-btn kl-btn--primary">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden style={{ width: "1.05em", height: "1.05em" }}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
            {SITE.contact.phone}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Prísľub                                                            */
/* ------------------------------------------------------------------ */

function Claim({ locale }: { locale: Locale }) {
  const t = V2[locale];
  return (
    <section id="o-kurze" className="kl-section kl-claim">
      <div className="kl-container kl-claim__grid">
        <Reveal>
          <h2>
            {t.claimH2a}
            <em>{t.claimH2em}</em>
          </h2>
          <p className="kl-claim__body">{t.claimBody}</p>
          <ul className="kl-claim__points">
            {t.claimPoints.map((p) => (
              <li key={p}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <figure className="kl-claim__media">
            <Image src="/images/realizacie/r-07.jpg" alt={t.claimCaption} width={880} height={1100} sizes="(max-width: 900px) 100vw, 40vw" />
            <figcaption>{t.claimCaption}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Vrstvy — biznis model podaný ako prierez podlahy                   */
/* ------------------------------------------------------------------ */

function Vrstvy({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const rootRef = React.useRef<HTMLDivElement>(null);

  /*
    Prierez podlahy vľavo sa rozsvecuje podľa toho, ktorá vrstva je práve
    v strede obrazovky — podlaha "rastie" spolu s čítaním. Čisto vizuálny
    doplnok: bez JS ostane stack stáť a nič nechýba.
  */
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-vrow]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const slab = root.querySelector(`[data-slab="${(e.target as HTMLElement).dataset.vrow}"]`);
          slab?.classList.toggle("is-on", e.isIntersecting);
        }
      },
      { rootMargin: "-30% 0px -50% 0px" },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="biznis-model" className="kl-section kl-vrstvy">
      <div className="kl-container" ref={rootRef}>
        <div className="kl-vrstvy__head">
          <Reveal>
            <span className="kl-eyebrow">{t.vrstvyEyebrow}</span>
            <h2>
              {t.vrstvyH2a}
              <em>{t.vrstvyH2em}</em>
            </h2>
            <p>{t.vrstvyBody}</p>
          </Reveal>
        </div>
        <div className="kl-vrstvy__stack">
          <div className="kl-slabs" aria-hidden>
            <div className="kl-slab kl-slab--1" data-slab="0" />
            <div className="kl-slab kl-slab--2" data-slab="1" />
            <div className="kl-slab kl-slab--3" data-slab="2" />
            <div className="kl-slab kl-slab--4" data-slab="3" />
          </div>
          <div className="kl-vrstvy__rows">
            {t.vrstvyItems.map((v, i) => (
              <Reveal as="article" className="kl-vrow" key={v.title} delay={i * 60}>
                <span className="kl-vrow__n" data-vrow={i}>{locale === "sk" ? "VRSTVA" : "LAYER"} 0{i + 1}</span>
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                  <div className="kl-vrow__chips">
                    {v.chips.map((c) => (
                      <span key={c.label} className={`kl-tagchip${c.hot ? " is-hot" : ""}`}>{c.label}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Program                                                            */
/* ------------------------------------------------------------------ */

function Days({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const days = [
    // Modul 1 nemá fotku — abstraktný prierez vrstiev (majiteľ: fotka haly
    // tam nesedela, chcel „niečo zaujímavé ako tie vrstvy").
    { label: t.day1Label, title: t.day1Title, items: t.day1Items, img: null, meta: t.dayMeta1 },
    { label: t.day2Label, title: t.day2Title, items: t.day2Items, img: "/images/process/step-03-liatie.webp", meta: t.dayMeta2 },
  ];
  return (
    <section id="program" className="kl-section kl-days">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.daysH2}</h2>
          <p>{t.daysIntro}</p>
        </div>
        {days.map((d, i) => (
          /* Reveal renderuje article priamo — obalový div by zabil súrodenecké
             selektory (.kl-day + .kl-day, :nth-of-type) v CSS. */
          <Reveal as="article" className="kl-day" key={d.title} delay={i * 80}>
            <div className="kl-day__media">
              {d.img ? (
                <Image src={d.img} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" />
              ) : (
                <div className="kl-day__art" aria-hidden>
                  <div className="kl-artstack"><i /><i /><i /><i /></div>
                </div>
              )}
            </div>
            <div className="kl-day__body">
              <span className="kl-day__label">{d.label}</span>
              <h3>{d.title}</h3>
              <ul>
                {d.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
              <p className="kl-day__meta">{d.meta}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Fotopás                                                            */
/* ------------------------------------------------------------------ */

function Strip({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const [preview, setPreview] = React.useState<number | null>(null);
  const items = STRIP_IMAGES.map((src, i) => ({ src, cap: t.stripCaptions[i] }));

  // ESC zavrie preview
  React.useEffect(() => {
    if (preview == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  return (
    <section className="kl-strip" aria-label={t.stripH2}>
      <div className="kl-container">
        <h2 style={{ fontSize: "clamp(1.6rem, 1.1rem + 2vw, 2.4rem)", marginBottom: "1.6rem" }}>{t.stripH2}</h2>
      </div>
      {/* Marquee zľava doprava, na hover sa zastaví; klik otvorí preview. */}
      <div className="kl-strip__marquee">
        <div className="kl-strip__track">
          {[...items, ...items].map((it, i) => (
            <button
              type="button"
              className="kl-strip__item"
              key={`${it.src}-${i}`}
              aria-hidden={i >= items.length}
              tabIndex={i >= items.length ? -1 : 0}
              onClick={() => setPreview(i % items.length)}
            >
              <Image src={it.src} alt={it.cap} width={640} height={800} sizes="24rem" />
              <span>{it.cap}</span>
            </button>
          ))}
        </div>
      </div>
      {preview != null && (
        <div className="kl-lightbox" role="dialog" aria-modal="true" aria-label={items[preview].cap} onClick={() => setPreview(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <button type="button" className="kl-lightbox__close" aria-label={t.stripClose} onClick={() => setPreview(null)}>×</button>
            <Image src={items[preview].src} alt={items[preview].cap} width={1280} height={1600} sizes="90vw" />
            <figcaption>
              <b>{items[preview].cap}</b>
              <p>{t.stripPreviewText}</p>
              <Link href="/realizacie">{t.stripPreviewCta}</Link>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Ceny                                                               */
/* ------------------------------------------------------------------ */

function Pricing({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const std = locale === "sk" ? KURZ.priceStandard : COURSE_EN.priceStandard;
  const pro = locale === "sk" ? KURZ.pricePro : COURSE_EN.pricePro;
  const eur = (n: number) => (locale === "sk" ? `${n} €` : `€${n}`);
  /*
    Hash "#prihlaska?balik=pro" predvyplní balík (hashchange vo formulári),
    ale prehliadač naň neposcrolluje — element s takým id neexistuje.
    Scroll preto spravíme sami; default klik nechávame, nech sa hash zmení.
  */
  const goForm = () => {
    document.getElementById("prihlaska")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const check = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <section id="cena" className="kl-section kl-pricing">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.pricingH2}</h2>
          <p>{t.pricingIntro}</p>
        </div>
        <div className="kl-pricing__grid">
          <Reveal>
            <article className="kl-price">
              <h3>{t.stdTitle}</h3>
              <p className="kl-price__amount">{eur(std)}<small>{t.perPerson}</small></p>
              <p className="kl-price__desc">{t.stdDesc}</p>
              <ul>
                {t.stdItems.map((it) => <li key={it}>{check}{it}</li>)}
              </ul>
              <a href="#prihlaska?balik=standard" onClick={goForm} className="kl-btn kl-btn--line">{t.stdCta}</a>
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="kl-price kl-price--featured">
              <span className="kl-price__tag">{t.proTag}</span>
              <h3>{t.proTitle}</h3>
              <p className="kl-price__amount">{eur(pro)}<small>{t.perPerson}</small></p>
              <p className="kl-price__desc">{t.proDesc}</p>
              <ul>
                {t.proItems.map((it) => <li key={it}>{check}{it}</li>)}
              </ul>
              <a href="#prihlaska?balik=pro" onClick={goForm} className="kl-btn kl-btn--primary">{t.proCta}</a>
            </article>
          </Reveal>
        </div>
        <p className="kl-pricing__note">
          {t.firmaNote} <a href="#prihlaska?balik=firma" onClick={goForm}>{t.firmaLink}</a>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function Faq({ locale }: { locale: Locale }) {
  const t = COPY[locale].faq;
  const v2 = V2[locale];
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" className="kl-section">
      <div className="kl-container" style={{ maxWidth: "52rem" }}>
        <div className="kl-section__head">
          <h2>{v2.faqH2}</h2>
        </div>
        {t.items.map((f, i) => {
          const active = open === i;
          return (
            <div key={f.q} className={`kl-acc${active ? " is-active" : ""}`}>
              <button type="button" className="kl-acc__header" aria-expanded={active} onClick={() => setOpen(active ? null : i)}>
                <h3>{f.q}</h3>
                <svg className="kl-acc__plus" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="kl-acc__body">
                <div><p>{f.a}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkout formulár (logika nezmenená)                               */
/* ------------------------------------------------------------------ */

interface FormState {
  name: string; lastName: string; phone: string; email: string;
  variant: string; experience: string; message: string; website: string;
  company: string; ico: string;
}

const PAY_T = {
  sk: {
    payTitle: "Spôsob platby",
    karta: "Platba kartou",
    kartaSub: "Bezpečne cez Stripe. Prístup do kurzu okamžite.",
    kartaOff: "Momentálne nedostupné — vyber prevod.",
    prevod: "Bankový prevod",
    prevodSub: "Faktúru a platobné údaje pošleme e-mailom do 24 h. Prístup po pripísaní platby.",
    summary: "K úhrade",
    summaryNote: "Nie sme platcami DPH — cena je konečná.",
    firmaNote: "Firemný prístup: pošli dopyt, ozveme sa s cenou pre tím.",
    company: "Firma (voliteľné)",
    ico: "IČO (voliteľné)",
    submitPay: "Zaplatiť kartou",
    submitPrevod: "Objednať na faktúru",
    submitFirma: "Poslať dopyt",
    redirecting: "Presmerúvam na platbu…",
  },
  en: {
    payTitle: "Payment method",
    karta: "Card payment",
    kartaSub: "Secure checkout via Stripe. Instant course access.",
    kartaOff: "Currently unavailable — choose bank transfer.",
    prevod: "Bank transfer",
    prevodSub: "Invoice and payment details by e-mail within 24 h. Access once the payment arrives.",
    summary: "To pay",
    summaryNote: "We are not VAT registered — this is the final price.",
    firmaNote: "Company access: send an inquiry, we come back with a team price.",
    company: "Company (optional)",
    ico: "Company ID (optional)",
    submitPay: "Pay by card",
    submitPrevod: "Order on invoice",
    submitFirma: "Send inquiry",
    redirecting: "Redirecting to payment…",
  },
} as const;

function ContactForm({ locale }: { locale: Locale }) {
  const t = COPY[locale].contact;
  const L = t.labels;
  const P = PAY_T[locale];
  const [v, setV] = React.useState<FormState>({
    name: "", lastName: "", phone: "", email: "",
    variant: "standard", experience: "zaciatocnik", message: "", website: "",
    company: "", ico: "",
  });
  const [payment, setPayment] = React.useState<"karta" | "prevod">("prevod");
  const [cardAvailable, setCardAvailable] = React.useState<boolean | null>(null);
  const [consent, setConsent] = React.useState(false);
  const [invalid, setInvalid] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [redirecting, setRedirecting] = React.useState(false);
  const [done, setDone] = React.useState<"inquiry" | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  // Zisti, či je kartová brána živá (server rozhoduje, klient len zobrazuje).
  React.useEffect(() => {
    let alive = true;
    fetch("/api/kurz/checkout")
      .then((r) => r.json())
      .then((j: { methods?: { id: string; available: boolean }[] }) => {
        if (!alive) return;
        const card = j.methods?.find((m) => m.id === "karta")?.available ?? false;
        setCardAvailable(card);
        if (card) setPayment("karta");
      })
      .catch(() => alive && setCardAvailable(false));
    return () => { alive = false; };
  }, []);

  // predvyplnenie balíka z hash-u (#prihlaska?balik=pro) alebo z klikov na boxy
  React.useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/balik=(standard|pro|firma)/);
      if (m) setV((p) => ({ ...p, variant: m[1] }));
    };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []);

  const isPurchase = v.variant !== "firma";
  const amount = v.variant === "pro" ? KURZ.pricePro : v.variant === "standard" ? KURZ.priceStandard : 0;

  const set = (k: keyof FormState, val: string) => {
    setV((p) => ({ ...p, [k]: val }));
    if (error) { setError(null); setInvalid(null); }
  };
  const fail = (field: string, msg: string) => { setInvalid(field); setError(msg); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (v.name.trim().length < 2) return fail("name", t.errors.name);
    if (v.lastName.trim().length < 2) return fail("lastName", t.errors.last);
    if (!/^[+\d\s\-/()]{9,30}$/.test(v.phone.trim())) return fail("phone", t.errors.phone);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) return fail("email", t.errors.email);
    if (!consent) return fail("consent", t.errors.consent);
    if (!token) return fail("", t.errors.bot);

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/kurz/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name.trim(), lastName: v.lastName.trim(), email: v.email.trim(), phone: v.phone.trim(),
          term: "Online kurz", variant: v.variant, experience: t.experience[v.experience],
          message: v.message.trim(), payment: isPurchase ? payment : "prevod", locale,
          company: v.company.trim(), ico: v.ico.trim(),
          consent: true, website: v.website, turnstileToken: token,
        }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean; mode?: string; url?: string; redirect?: string; message?: string; error?: string;
      };
      if (!res.ok || !j.ok) {
        if (j.error === "gateway_unavailable") { setCardAvailable(false); setPayment("prevod"); }
        setError(j.message || t.errors.send);
        setSending(false);
        return;
      }
      trackEvent("kurz_prihlaska", { variant: v.variant, locale, payment: isPurchase ? payment : "inquiry" });
      trackEvent("generate_lead", { source: locale === "sk" ? "kurz" : "kurz_en", value: amount, currency: "EUR" });
      if (j.mode === "redirect" && j.url) {
        setRedirecting(true);
        trackEvent("begin_checkout", { value: amount, currency: "EUR", item_name: `kurz_${v.variant}` });
        window.location.assign(j.url);
        return;
      }
      if (j.mode === "prevod" && j.redirect) {
        setRedirecting(true);
        window.location.assign(j.redirect);
        return;
      }
      setSending(false);
      setDone("inquiry");
    } catch {
      setError(t.errors.send);
      setSending(false);
    }
  };

  if (done === "inquiry") {
    return (
      <div className="kl-form__done">
        <h3><span className="kl-grad">{L.okTitle}</span></h3>
        <p>{L.okText}</p>
      </div>
    );
  }

  const field = (key: keyof FormState, label: string, type = "text", auto?: string) => (
    <div className={`kl-field${invalid === key ? " is-invalid" : ""}`}>
      <label htmlFor={`kl-${key}`}>{label}</label>
      <input id={`kl-${key}`} type={type} autoComplete={auto} value={v[key]} onChange={(e) => set(key, e.target.value)} />
    </div>
  );

  const submitLabel = sending
    ? (redirecting ? P.redirecting : L.sending)
    : !isPurchase ? P.submitFirma : payment === "karta" ? P.submitPay : P.submitPrevod;

  return (
    <form className="kl-form" onSubmit={submit} noValidate>
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden>
        <label>Web<input type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} /></label>
      </div>
      <div className="kl-form__row">
        {field("name", L.name, "text", "given-name")}
        {field("lastName", L.lastName, "text", "family-name")}
      </div>
      <div className="kl-form__row">
        {field("phone", L.phone, "tel", "tel")}
        {field("email", L.email, "email", "email")}
      </div>
      <div className="kl-form__row">
        <div className="kl-field">
          <label htmlFor="kl-variant">{L.variant}</label>
          <select id="kl-variant" value={v.variant} onChange={(e) => set("variant", e.target.value)}>
            {Object.entries(t.variants).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
          </select>
        </div>
        <div className="kl-field">
          <label htmlFor="kl-exp">{L.experience}</label>
          <select id="kl-exp" value={v.experience} onChange={(e) => set("experience", e.target.value)}>
            {Object.entries(t.experience).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
          </select>
        </div>
      </div>
      <div className="kl-form__row">
        {field("company", P.company, "text", "organization")}
        {field("ico", P.ico, "text")}
      </div>
      <div className="kl-field">
        <label htmlFor="kl-msg">{L.message}</label>
        <textarea id="kl-msg" value={v.message} onChange={(e) => set("message", e.target.value)} />
      </div>

      {isPurchase ? (
        <>
          <p style={{ color: "var(--kl-ink)", fontWeight: 600, fontSize: "0.95rem", margin: "0 0 0.6rem" }}>{P.payTitle}</p>
          <div className="kl-pay" role="radiogroup" aria-label={P.payTitle}>
            <label className={`kl-pay__opt${payment === "karta" ? " is-active" : ""}${cardAvailable === false ? " is-disabled" : ""}`}>
              <input type="radio" name="kl-pay" value="karta" checked={payment === "karta"} disabled={cardAvailable === false}
                onChange={() => cardAvailable !== false && setPayment("karta")} />
              <span className="kl-pay__radio" aria-hidden />
              <span>
                <strong>{P.karta}</strong>
                <span>{cardAvailable === false ? P.kartaOff : P.kartaSub}</span>
              </span>
            </label>
            <label className={`kl-pay__opt${payment === "prevod" ? " is-active" : ""}`}>
              <input type="radio" name="kl-pay" value="prevod" checked={payment === "prevod"} onChange={() => setPayment("prevod")} />
              <span className="kl-pay__radio" aria-hidden />
              <span>
                <strong>{P.prevod}</strong>
                <span>{P.prevodSub}</span>
              </span>
            </label>
          </div>
          <div className="kl-summary">
            <span>{t.variants[v.variant]}<br /><small>{P.summaryNote}</small></span>
            <strong>{P.summary}: {amount} €</strong>
          </div>
        </>
      ) : (
        <p style={{ fontSize: "0.95rem", color: "var(--kl-subtle)", margin: "0 0 1.4rem" }}>{P.firmaNote}</p>
      )}

      <TurnstileWidget theme="dark" onVerify={setToken} onExpire={() => setToken(null)} />

      <div className="kl-form__footer">
        <label className="kl-check">
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (error) setError(null); }} />
          <span className="kl-check__box" aria-hidden />
          <span>
            {L.consent}{" "}
            <a href="/ochrana-sukromia" target="_blank" rel="noopener">{L.consentLink}</a>
            {isPurchase && (<> · <a href="/obchodne-podmienky" target="_blank" rel="noopener">{locale === "sk" ? "obchodné podmienky" : "terms"}</a></>)}.
          </span>
        </label>
        <button type="submit" className="kl-btn kl-btn--primary" disabled={sending}>
          {submitLabel}
        </button>
      </div>
      {error && <p className="kl-form__msg err" role="alert">{error}</p>}
    </form>
  );
}

function Contact({ locale }: { locale: Locale }) {
  const t = COPY[locale].contact;
  const v2 = V2[locale];
  return (
    <section id="kontakt" className="kl-section kl-contact" style={{ background: "var(--kl-surface)" }}>
      <div className="kl-container kl-contact__grid">
        <div className="kl-contact__info">
          <h2>{t.h2}</h2>
          <p>{t.p}</p>
          <ul className="kl-contact__list">
            <li>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
              <a href={`tel:${SITE.contact.phoneRaw}`}>{SITE.contact.phone}</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.7"/></svg>
              <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7"/></svg>
              <span>{SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}</span>
            </li>
          </ul>
          <ul className="kl-contact__socials">
            <li><a href={SITE.social.facebook} target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.4H7.5V14h2.7v8h3.3Z"/></svg></a></li>
            <li><a href={SITE.social.instagram} target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a></li>
            <li><a href={SITE.social.tiktok} target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3Z"/></svg></a></li>
          </ul>
        </div>
        <div className="kl-contact__form" id="prihlaska">
          <h3>{v2.formTitle}</h3>
          <p>{t.formSub}</p>
          <ContactForm locale={locale} />
        </div>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: Locale }) {
  const t = COPY[locale].footer;
  return (
    <footer className="kl-footer">
      <div className="kl-container kl-footer__row">
        <div className="kl-footer__copy">
          <Image src="/images/site/logo_v2.png" alt="EPOXIDOVO" width={42} height={40} />
          <p>{t.copy}</p>
        </div>
        <ul className="kl-footer__links">
          {t.links.map((l) => (
            <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */

export function KurzLanding({ locale }: { locale: Locale }) {
  const [menu, setMenu] = React.useState(false);
  const t = COPY[locale];

  React.useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu, t.htmlLang]);

  return (
    <div className="kl" lang={t.htmlLang}>
      <Header locale={locale} onMenu={setMenu} />
      <main>
        {/* Poradie: peniaze (hero) → čo dostaneš → CENA hneď (majiteľ
            2026-08-30) → kalkulačka → spolupráca → dôkaz → obsah. */}
        <Hero locale={locale} />
        <Vrstvy locale={locale} />
        <Pricing locale={locale} />
        <KurzZisk locale={locale} />
        <Spolupraca locale={locale} />
        <Claim locale={locale} />
        <Days locale={locale} />
        <Strip locale={locale} />
        <Faq locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
