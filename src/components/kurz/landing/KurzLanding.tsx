"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";
import { KURZ } from "@/content/kurz";
import { COURSE_EN } from "@/content/kurz-en";
import { COPY, type Locale } from "./copy";
import { KurzZisk } from "./KurzZisk";
import "./landing.css";

/* ------------------------------------------------------------------ */
/*  Texty nových sekcií (SK/EN)                                        */
/* ------------------------------------------------------------------ */

const V2 = {
  sk: {
    badge: "Najbližší termín",
    seatsLeft: (n: number) => `posledné ${n} miesta`,
    h1a: "Remeslo, ktoré sa nedá",
    h1em: " stiahnuť z YouTubu.",
    lead: "Dvojdňový kurz liatych epoxidových podláh v Ružomberku. Šesť ľudí, reálny betón, vlastných 12 m². Odchádzaš s postupom, certifikátom a číslami na prvú cenovú ponuku.",
    ctaMain: "Rezervovať miesto",
    ctaProgram: "Pozrieť program",
    facts: [
      ["2 dni", "16 hodín praxe"],
      ["6 ľudí", "maximum v skupine"],
      ["12 m²", "vlastná plocha"],
      ["EN", "kurz v angličtine"],
    ],
    claimH2a: "Za dva dni prejdeš cestu, ktorá nám trvala ",
    claimH2em: "dvesto podláh.",
    claimBody: "Lejeme podlahy po celom Slovensku a presne vieme, kde začiatočníci zabíjajú svoju prvú zákazku: v podklade, v miešaní a v cene. Kurz je postavený na týchto troch veciach, nie na prezentácii.",
    claimPoints: [
      "Každý krok si spravíš vlastnými rukami, od brúsenia po finálny lak",
      "Materiál, náradie aj ochranné pomôcky sú v cene, prídeš v montérkach",
      "Manuál so spotrebami a vzorová cenová ponuka pre tvojich zákazníkov",
      "30 dní po kurze píšeš priamo lektorovi",
    ],
    claimCaption: "Metalická podlaha, práca absolventa",
    daysH2: "Program: dva dni, dve témy",
    daysIntro: "Prvý deň rozhoduje o tom, či podlaha vydrží. Druhý o tom, ako vyzerá a koľko si za ňu vypýtaš.",
    day1Label: "Deň 1 · 9:00 až 17:00",
    day2Label: "Deň 2 · 9:00 až 17:00",
    day1Title: "Podklad a materiály",
    day2Title: "Liatie, dekor a cenotvorba",
    dayMeta1: "Obed, káva a všetok materiál v cene.",
    dayMeta2: "Na konci dňa certifikát a manuál so spotrebami.",
    stripH2: "Podlahy z našej dielne",
    stripCaptions: ["Metalická garáž", "Obývačka, jednofarebná liata", "Priemyselná hala", "Chipsová prevádzka", "Metalický efekt zblízka", "Kancelárie"],
    pricingH2: "Cena a balíky",
    pricingIntro: "Nie sme platcami DPH, ceny sú konečné. Platí sa až po telefonickom potvrdení miesta.",
    stdTitle: "Štandard",
    stdDesc: "Kompletný dvojdňový kurz so všetkým materiálom a náradím.",
    stdItems: ["16 hodín praxe na reálnom betóne", "Vlastná plocha 12 m²", "Manuál a kalkulačka spotreby", "Certifikát o absolvovaní", "30 dní podpory po kurze"],
    stdCta: "Rezervovať Štandard",
    proTag: "Najčastejšia voľba",
    proTitle: "PRO s mentoringom",
    proDesc: "Kurz a k tomu tri mesiace vedenia pri prvých zákazkách.",
    proItems: ["Všetko zo Štandardu", "3 mesiace osobného mentoringu: telefón, fotky z realizácie, cenové ponuky", "Materiál na prvú zákazku, približne 20 m²", "Sada náradia: stierka, ježko, valec, miešadlo", "Partnerské ceny v e-shope natrvalo"],
    proCta: "Rezervovať PRO",
    perPerson: "na osobu",
    firmaNote: "Traja a viac z jednej firmy? Spravíme súkromný termín u nás alebo vo vašej hale.",
    firmaLink: "Napíš nám cez prihlášku",
    termsH2: "Termíny",
    termsPlace: "Školiace centrum EPOXIDOVO, Ružomberok",
    seatsLow: (n: number) => `Posledné ${n} miesta`,
    seatsOk: (n: number) => `Voľných ${n} miest`,
    termCta: "Rezervovať",
    faqH2: "Časté otázky",
    formTitle: "Prihláška a platba",
  },
  en: {
    badge: "Next date",
    seatsLeft: (n: number) => `${n} seats left`,
    h1a: "A trade you cannot",
    h1em: " download from YouTube.",
    lead: "A two day poured epoxy flooring course in Ružomberok, Slovakia. Six people, real concrete, your own 12 m². You leave with a repeatable process, a certificate and the numbers for your first quote.",
    ctaMain: "Reserve a seat",
    ctaProgram: "See the curriculum",
    facts: [
      ["2 days", "16 hours of practice"],
      ["6 people", "maximum per group"],
      ["12 m²", "your own floor"],
      ["EN", "taught in English"],
    ],
    claimH2a: "In two days you cover what took us ",
    claimH2em: "two hundred floors.",
    claimBody: "We install floors across Slovakia and we know exactly where beginners lose their first job: the substrate, the mixing and the price. The course is built on those three things, not on slides.",
    claimPoints: [
      "You do every step with your own hands, from grinding to the final coat",
      "Material, tools and protective gear are included, just bring work clothes",
      "A manual with consumption rates and a sample quote for your clients",
      "For 30 days after the course you write directly to the instructor",
    ],
    claimCaption: "Metallic floor, graduate work",
    daysH2: "Curriculum: two days, two themes",
    daysIntro: "Day one decides whether the floor lasts. Day two decides how it looks and what you charge for it.",
    day1Label: "Day 1 · 9:00 to 17:00",
    day2Label: "Day 2 · 9:00 to 17:00",
    day1Title: "Substrate and materials",
    day2Title: "Pouring, decoration and pricing",
    dayMeta1: "Lunch, coffee and all material included.",
    dayMeta2: "Certificate and consumption manual at the end of the day.",
    stripH2: "Floors from our workshop",
    stripCaptions: ["Metallic garage", "Living room, single colour", "Industrial hall", "Flake commercial floor", "Metallic effect up close", "Offices"],
    pricingH2: "Price and packages",
    pricingIntro: "We are not VAT registered, prices are final. You pay only after we confirm your seat by phone.",
    stdTitle: "Standard",
    stdDesc: "The complete two day course with all material and tools.",
    stdItems: ["16 hours of practice on real concrete", "Your own 12 m² area", "Manual and consumption calculator", "Certificate of completion", "30 days of support after the course"],
    stdCta: "Reserve Standard",
    proTag: "Most popular",
    proTitle: "PRO with mentoring",
    proDesc: "The course plus three months of guidance on your first jobs.",
    proItems: ["Everything in Standard", "3 months of personal mentoring: phone, site photos, quotes", "Material for your first job, roughly 20 m²", "Tool set: squeegee, spiked roller, roller, mixer", "Partner prices in our e-shop, permanently"],
    proCta: "Reserve PRO",
    perPerson: "per person",
    firmaNote: "Three or more from one company? We run a private date at our centre or in your hall.",
    firmaLink: "Tell us in the application",
    termsH2: "Dates",
    termsPlace: "EPOXIDOVO training centre, Ružomberok, Slovakia",
    seatsLow: (n: number) => `Last ${n} seats`,
    seatsOk: (n: number) => `${n} seats free`,
    termCta: "Reserve",
    faqH2: "Frequently asked",
    formTitle: "Application and payment",
  },
} as const;

const STRIP_IMAGES = [
  "/images/hero/garaz.webp",
  "/images/realizacie/r-05.jpg",
  "/images/hero/hala.webp",
  "/images/realizacie/r-07.jpg",
  "/images/realizacie/r-12.jpg",
  "/images/realizacie/r-03.jpg",
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
          <Link href="/" className="kl-nav__brand" aria-label="EPOXIDOVO">
            <Image src="/images/site/logo_v2.png" alt="EPOXIDOVO" width={48} height={46} priority />
          </Link>
          <ul className={`kl-nav__menu${open ? " is-active" : ""}`}>
            <li><a href="#o-kurze" onClick={close}>{t.nav.about}</a></li>
            <li><a href="#program" onClick={close}>{t.nav.program}</a></li>
            <li><a href="#kalkulacka" onClick={close}>{t.nav.calc}</a></li>
            <li><a href="#cena" onClick={close}>{t.nav.price}</a></li>
            <li><a href="#terminy" onClick={close}>{t.nav.faq === "FAQ" ? (locale === "sk" ? "Termíny" : "Dates") : "Termíny"}</a></li>
            <li><a href="#faq" onClick={close}>{t.nav.faq}</a></li>
            <li className="kl-nav__cta"><a href="#prihlaska" onClick={close}>{t.nav.cta}</a></li>
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

function Hero({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const terms = locale === "sk" ? KURZ.nextTerms : COURSE_EN.nextTerms;
  const next = terms[0];
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
        <div className="kl-container">
          <p className="kl-hero__badge">
            <i aria-hidden />
            {t.badge}: {next.date} · {t.seatsLeft(next.left)}
          </p>
          <h1>
            {t.h1a}
            <em>{t.h1em}</em>
          </h1>
          <p className="kl-hero__lead">{t.lead}</p>
          <div className="kl-hero__actions">
            <a href="#prihlaska" className="kl-btn kl-btn--primary">{t.ctaMain}</a>
            <a href="#program" className="kl-btn kl-btn--ghost">{t.ctaProgram}</a>
          </div>
          <dl className="kl-hero__facts">
            {t.facts.map(([v, l]) => (
              <div key={l}><strong>{v}</strong>{l}</div>
            ))}
          </dl>
        </div>
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
/*  Program                                                            */
/* ------------------------------------------------------------------ */

function Days({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const copyT = COPY[locale];
  const day1 = [...copyT.events.cards[0].items, ...copyT.events.cards[1].items];
  const day2 = [...copyT.events.cards[2].items, ...copyT.events.cards[3].items];
  const days = [
    { label: t.day1Label, title: t.day1Title, items: day1, img: "/images/hero/hala.webp", meta: t.dayMeta1 },
    { label: t.day2Label, title: t.day2Title, items: day2, img: "/images/process/step-03-liatie.webp", meta: t.dayMeta2 },
  ];
  return (
    <section id="program" className="kl-section kl-days">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.daysH2}</h2>
          <p>{t.daysIntro}</p>
        </div>
        {days.map((d, i) => (
          <Reveal key={d.title} delay={i * 80}>
            <article className="kl-day">
              <div className="kl-day__media">
                <Image src={d.img} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" />
              </div>
              <div className="kl-day__body">
                <span className="kl-day__label">{d.label}</span>
                <h3>{d.title}</h3>
                <ul>
                  {d.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
                <p className="kl-day__meta">{d.meta}</p>
              </div>
            </article>
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
  return (
    <section className="kl-strip" aria-label={t.stripH2}>
      <div className="kl-container">
        <h2 style={{ fontSize: "clamp(1.6rem, 1.1rem + 2vw, 2.4rem)", marginBottom: "1.6rem" }}>{t.stripH2}</h2>
      </div>
      <div className="kl-strip__row">
        {STRIP_IMAGES.map((src, i) => (
          <figure key={src}>
            <Image src={src} alt={t.stripCaptions[i]} width={640} height={800} sizes="(max-width: 768px) 70vw, 24rem" />
            <figcaption>{t.stripCaptions[i]}</figcaption>
          </figure>
        ))}
      </div>
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
              <a href="#prihlaska?balik=standard" className="kl-btn kl-btn--line">{t.stdCta}</a>
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
              <a href="#prihlaska?balik=pro" className="kl-btn kl-btn--primary">{t.proCta}</a>
            </article>
          </Reveal>
        </div>
        <p className="kl-pricing__note">
          {t.firmaNote} <a href="#prihlaska?balik=firma">{t.firmaLink}</a>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Termíny                                                            */
/* ------------------------------------------------------------------ */

function Terms({ locale }: { locale: Locale }) {
  const t = V2[locale];
  const terms = locale === "sk" ? KURZ.nextTerms : COURSE_EN.nextTerms;
  return (
    <section id="terminy" className="kl-section kl-terms">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.termsH2}</h2>
          <p>{t.termsPlace} · 9:00 až 17:00</p>
        </div>
        <ul className="kl-terms__list">
          {terms.map((term) => (
            <li key={term.date} className="kl-terms__row">
              <span className="kl-terms__date">
                {term.date}
                <small>{t.termsPlace}</small>
              </span>
              <span className={`kl-terms__seats ${term.left <= 3 ? "is-low" : "is-ok"}`}>
                {term.left <= 3 ? t.seatsLow(term.left) : t.seatsOk(term.left)}
              </span>
              <a href="#prihlaska" className="kl-btn kl-btn--ink">{t.termCta}</a>
            </li>
          ))}
        </ul>
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
  term: string; variant: string; experience: string; message: string; website: string;
  company: string; ico: string;
}

const PAY_T = {
  sk: {
    payTitle: "Spôsob platby",
    karta: "Platba kartou",
    kartaSub: "Bezpečne cez Stripe. Miesto máš potvrdené okamžite.",
    kartaOff: "Momentálne nedostupné — vyber prevod.",
    prevod: "Bankový prevod",
    prevodSub: "Faktúru a platobné údaje pošleme e-mailom do 24 h. Miesto držíme 5 pracovných dní.",
    summary: "K úhrade",
    summaryNote: "Nie sme platcami DPH — cena je konečná.",
    firmaNote: "Firemné školenie: pošli dopyt, ozveme sa s termínom a cenou pre skupinu.",
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
    kartaSub: "Secure checkout via Stripe. Your seat is confirmed instantly.",
    kartaOff: "Currently unavailable — choose bank transfer.",
    prevod: "Bank transfer",
    prevodSub: "Invoice and payment details by e-mail within 24 h. Seat held for 5 working days.",
    summary: "To pay",
    summaryNote: "We are not VAT registered — this is the final price.",
    firmaNote: "Company training: send an inquiry, we come back with a date and a group price.",
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
  const terms = locale === "sk" ? KURZ.nextTerms : COURSE_EN.nextTerms;
  const [v, setV] = React.useState<FormState>({
    name: "", lastName: "", phone: "", email: "",
    term: terms[0].date, variant: "standard", experience: "zaciatocnik", message: "", website: "",
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
          term: v.term, variant: v.variant, experience: t.experience[v.experience],
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
      trackEvent("kurz_prihlaska", { term: v.term, variant: v.variant, locale, payment: isPurchase ? payment : "inquiry" });
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
          <label htmlFor="kl-term">{L.term}</label>
          <select id="kl-term" value={v.term} onChange={(e) => set("term", e.target.value)}>
            {terms.map((tm) => (
              <option key={tm.date} value={tm.date}>{tm.date} — {L.seatsLeft} {tm.left}</option>
            ))}
            <option value={L.termOther}>{L.termOther}</option>
          </select>
        </div>
        <div className="kl-field">
          <label htmlFor="kl-variant">{L.variant}</label>
          <select id="kl-variant" value={v.variant} onChange={(e) => set("variant", e.target.value)}>
            {Object.entries(t.variants).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
          </select>
        </div>
      </div>
      <div className="kl-form__row">
        <div className="kl-field">
          <label htmlFor="kl-exp">{L.experience}</label>
          <select id="kl-exp" value={v.experience} onChange={(e) => set("experience", e.target.value)}>
            {Object.entries(t.experience).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
          </select>
        </div>
        {field("company", P.company, "text", "organization")}
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

      <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />

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
        <Hero locale={locale} />
        <Claim locale={locale} />
        <Days locale={locale} />
        <Strip locale={locale} />
        <KurzZisk locale={locale} />
        <Pricing locale={locale} />
        <Terms locale={locale} />
        <Faq locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
