"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/components/analytics/Analytics";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { SITE } from "@/lib/site";
import { KURZ } from "@/content/kurz";
import { COURSE_EN } from "@/content/kurz-en";
import { COPY, type Locale } from "./copy";
import "./landing.css";

/* ------------------------------------------------------------------ */
/*  Pomocné hooky                                                      */
/* ------------------------------------------------------------------ */

/** Pridá `kl-reveal` keď sekcia vojde do viewportu (overlay sweep + fade-in). */
function useReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("kl-reveal");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("kl-reveal");
            io.disconnect();
          }
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header({ locale, onMenu }: { locale: Locale; onMenu: (open: boolean) => void }) {
  const t = COPY[locale];
  const [fixed, setFixed] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setFixed(window.scrollY > 80);
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
    <header className={`kl-header${fixed ? " is-fixed" : ""}`}>
      <div className="kl-container">
        <nav className="kl-nav" aria-label="Kurz">
          <ul className={`kl-nav__menu${open ? " is-active" : ""}`}>
            <li className="kl-nav__home"><a href="#hello" onClick={close}>{t.nav.home}</a></li>
            <li><a href="#about" onClick={close}>{t.nav.about}</a></li>
            <li><a href="#program" onClick={close}>{t.nav.program}</a></li>
            <li><a href="#cena" onClick={close}>{t.nav.price}</a></li>
            <li className="kl-nav__right"><a href="#faq" onClick={close}>{t.nav.faq}</a></li>
            <li><a href="#kontakt" onClick={close}>{t.nav.contact}</a></li>
            <li className="kl-nav__cta"><a href="#prihlaska" onClick={close}>{t.nav.cta}</a></li>
            <li className="kl-nav__lang">
              <Link href={t.otherPath} hrefLang={locale === "sk" ? "en" : "sk"} onClick={close}>
                {t.otherLabel}
              </Link>
            </li>
          </ul>
          <Link href="/" className="kl-nav__brand" aria-label="EPOXIDOVO">
            <Image src="/images/site/logo_v2.png" alt="EPOXIDOVO" width={69} height={66} priority />
          </Link>
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
/*  Hero — scroll-pinned, h1 rastie so scrollom (TicketWave)           */
/* ------------------------------------------------------------------ */

function Hello({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const wrap = React.useRef<HTMLElement>(null);
  const h1 = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    const el = wrap.current;
    const h = h1.current;
    if (!el || !h) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Intro (0.4 → 0.65 + fade) rieši CSS keyframe na vnútornom spane.
    // Scroll dorastie h1 z 0.65 na 1.0 → násobok 1 → 1.538 na h1.
    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      const p = Math.min(1, progress / 0.5);
      const eased = 1 - Math.pow(1 - p, 3);
      h.style.setProperty("--kl-h1-scroll", String(1 + 0.538 * eased));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="hello" className="kl-hello" ref={wrap}>
      <div className="kl-hello__sticky">
        <div className="kl-hello__video">
          <video autoPlay muted loop playsInline poster="/images/process/step-03-liatie.webp" preload="metadata">
            <source src="/video/eshop-hero-a.mp4" type="video/mp4" />
          </video>
        </div>
        <h1 ref={h1}>
          <span className="kl-grad">{t.hero.h1}</span>
        </h1>
        <a href="#about" className="kl-hello__scroll">
          {t.hero.scroll}
          <span aria-hidden />
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About — floating paragraphs around a gradient heading              */
/* ------------------------------------------------------------------ */

function About({ locale }: { locale: Locale }) {
  const t = COPY[locale].about;
  const ref = useReveal<HTMLElement>(0.2);
  return (
    <section id="about" className="kl-section kl-about" ref={ref}>
      <div className="kl-section__overlay" aria-hidden />
      <div className="kl-container kl-container--large">
        <div className="kl-about__stage">
          <div className="kl-about__bg" aria-hidden>
            <Image src="/images/kurz/wave-wide.svg" alt="" width={1512} height={669} />
          </div>
          <div className="kl-about__layer">
            <h2>
              <span className="kl-grad">{t.h2}</span>
            </h2>
            <p className="t3">{t.t3}</p>
            <p className="t2">{t.t2}</p>
            <p className="t5">{t.t5}</p>
            <p className="t1">{t.t1}</p>
            <p className="t4">{t.t4}</p>
            <div className="kl-about__img i1">
              <Image src="/images/realizacie/r-07.jpg" alt="" width={512} height={512} />
              <span className="kl-img-overlay" aria-hidden />
            </div>
            <div className="kl-about__img i2">
              <Image src="/images/process/step-02-priprava.webp" alt="" width={472} height={320} />
              <span className="kl-img-overlay" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Events → Program — flip cards                                      */
/* ------------------------------------------------------------------ */

function Program({ locale }: { locale: Locale }) {
  const t = COPY[locale].events;
  const [flipped, setFlipped] = React.useState<number | null>(null);
  return (
    <section id="program" className="kl-section kl-events">
      <div className="kl-container kl-events__intro">
        <h2>{t.h2}</h2>
        <p>{t.p}</p>
      </div>
      <div className="kl-container kl-container--large">
        <div className="kl-cards">
          {t.cards.map((c, i) => (
            <article
              key={c.title}
              className={`kl-card${flipped === i ? " is-flipped" : ""}`}
              onClick={() => setFlipped(flipped === i ? null : i)}
            >
              <div className="kl-card__inner">
                <div className="kl-card__front">
                  <div className="kl-card__front__header">
                    <Image src={c.image} alt="" fill sizes="(max-width: 1200px) 80vw, 25vw" />
                    <span className="kl-card__tag">{c.tag}</span>
                  </div>
                  <div className="kl-card__front__body">
                    <h3>{c.title}</h3>
                    <button type="button" className="kl-card__more">
                      {t.more}
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity=".4" />
                        <path d="M9 12h6m0 0-2.5-2.5M15 12l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="kl-card__back">
                  <p className="kl-card__back__name">{c.backName}</p>
                  <h4>{c.backLabel}</h4>
                  <p>{c.backValue}</p>
                  <ul>
                    {c.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA band                                                           */
/* ------------------------------------------------------------------ */

function Cta({ locale }: { locale: Locale }) {
  const t = COPY[locale].cta;
  return (
    <section className="kl-section kl-cta">
      <div className="kl-container">
        <a href="#prihlaska" className="kl-cta__content">
          <h2>{t.h2}</h2>
          <span className="kl-cta__circle" aria-hidden>
            <svg viewBox="0 0 40 40" fill="none">
              <path d="M8 20h24m0 0-9-9m9 9-9 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Highlights marquee                                                 */
/* ------------------------------------------------------------------ */

function Highlights({ locale }: { locale: Locale }) {
  const items = COPY[locale].highlights;
  const doubled = [...items, ...items];
  return (
    <section className="kl-section kl-highlights" aria-label="Čísla">
      <div className="kl-marquee">
        {doubled.map((h, i) => (
          <div className="kl-marquee__item" key={`${h.value}-${i}`} aria-hidden={i >= items.length}>
            <h3><span className="kl-grad">{h.value}</span></h3>
            <p>{h.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tools → Balíky                                                     */
/* ------------------------------------------------------------------ */

function Boxes({ locale }: { locale: Locale }) {
  const t = COPY[locale].tools;
  return (
    <section id="cena" className="kl-section kl-tools">
      <div className="kl-container">
        <h2>{t.h2}</h2>
        <div className="kl-boxes">
          {t.boxes.map((b) => (
            <article key={b.title} className={`kl-box${b.muted ? " kl-box--muted" : ""}`}>
              <span className="kl-box__number kl-grad">{b.number}</span>
              {b.price && (
                <p className="kl-box__price">
                  <strong>{b.price.value}</strong> {b.price.suffix}
                </p>
              )}
              <h3>{b.title}</h3>
              <p>{b.text}</p>
              {b.items && (
                <ul>
                  {b.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              )}
              {b.button && (
                <div className="kl-box__footer">
                  <a href="#prihlaska" className="kl-btn kl-btn--primary">{b.button}</a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function Faq({ locale }: { locale: Locale }) {
  const t = COPY[locale].faq;
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <section id="faq" className="kl-section kl-faq">
      <div className="kl-container">
        <h2>{t.h2}</h2>
        <div className="kl-accordions">
          {t.items.map((f, i) => {
            const active = open === i;
            return (
              <div key={f.q} className={`kl-acc${active ? " is-active" : ""}`}>
                <button
                  type="button"
                  className="kl-acc__header"
                  aria-expanded={active}
                  onClick={() => setOpen(active ? null : i)}
                >
                  <h3>{f.q}</h3>
                  <span className="kl-acc__plus" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                      <path d="M4 12h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      <path className="v" d="M12 4v16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div className="kl-acc__body">
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact + form                                                     */
/* ------------------------------------------------------------------ */

interface FormState {
  name: string; lastName: string; phone: string; email: string;
  term: string; variant: string; experience: string; message: string; website: string;
}

function ContactForm({ locale }: { locale: Locale }) {
  const t = COPY[locale].contact;
  const L = t.labels;
  const terms = locale === "sk" ? KURZ.nextTerms : COURSE_EN.nextTerms;
  const [v, setV] = React.useState<FormState>({
    name: "", lastName: "", phone: "", email: "",
    term: terms[0].date, variant: "standard", experience: "zaciatocnik", message: "", website: "",
  });
  const [consent, setConsent] = React.useState(false);
  const [invalid, setInvalid] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

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
    const body = [
      locale === "sk" ? "PRIHLÁŠKA NA KURZ" : "COURSE APPLICATION (EN page)",
      `Termín: ${v.term}`,
      `Balík: ${t.variants[v.variant]}`,
      `Skúsenosti: ${t.experience[v.experience]}`,
      v.message.trim() ? `\nPoznámka: ${v.message.trim()}` : null,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name.trim(), lastName: v.lastName.trim(), email: v.email.trim(), phone: v.phone.trim(),
          message: body, consent: true, source: locale === "sk" ? "kurz" : "kurz_en",
          website: v.website, turnstileToken: token,
        }),
      });
      if (!res.ok) { setError(t.errors.send); setSending(false); return; }
      setSending(false);
      setDone(true);
      trackEvent("kurz_prihlaska", { term: v.term, variant: v.variant, locale });
      trackEvent("generate_lead", {
        source: locale === "sk" ? "kurz" : "kurz_en",
        value: v.variant === "pro" ? KURZ.pricePro : KURZ.priceStandard,
        currency: "EUR",
      });
    } catch {
      setError(t.errors.send);
      setSending(false);
    }
  };

  if (done) {
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
      <div className="kl-field">
        <label htmlFor="kl-exp">{L.experience}</label>
        <select id="kl-exp" value={v.experience} onChange={(e) => set("experience", e.target.value)}>
          {Object.entries(t.experience).map(([k, lab]) => <option key={k} value={k}>{lab}</option>)}
        </select>
      </div>
      <div className="kl-field">
        <label htmlFor="kl-msg">{L.message}</label>
        <textarea id="kl-msg" value={v.message} onChange={(e) => set("message", e.target.value)} />
      </div>

      <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />

      <div className="kl-form__footer">
        <label className="kl-check">
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (error) setError(null); }} />
          <span className="kl-check__box" aria-hidden />
          <span>
            {L.consent}{" "}
            <a href="/ochrana-sukromia" target="_blank" rel="noopener">{L.consentLink}</a>.
          </span>
        </label>
        <button type="submit" className="kl-btn kl-btn--primary" disabled={sending}>
          {sending ? L.sending : L.submit}
        </button>
      </div>
      {error && <p className="kl-form__msg err" role="alert">{error}</p>}
    </form>
  );
}

function Contact({ locale }: { locale: Locale }) {
  const t = COPY[locale].contact;
  return (
    <section id="kontakt" className="kl-section kl-contact">
      <div className="kl-container">
        <div className="kl-contact__grid">
          <div className="kl-contact__info">
            <h2>{t.h2}</h2>
            <p>{t.p}</p>
            <ul className="kl-contact__list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                <a href={`tel:${SITE.contact.phoneRaw}`}>{SITE.contact.phone}</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6"/></svg>
                <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>
                <span style={{ color: "#fff" }}>{SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}</span>
              </li>
            </ul>
            <h3>{t.socials}</h3>
            <ul className="kl-contact__socials">
              <li><a href={SITE.social.facebook} target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.4H7.5V14h2.7v8h3.3Z"/></svg></a></li>
              <li><a href={SITE.social.instagram} target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a></li>
              <li><a href={SITE.social.tiktok} target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3Z"/></svg></a></li>
            </ul>
          </div>
          <div className="kl-contact__form" id="prihlaska">
            <h3>{t.formTitle}</h3>
            <p style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>{t.formSub}</p>
            <ContactForm locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer({ locale }: { locale: Locale }) {
  const t = COPY[locale].footer;
  return (
    <footer className="kl-footer">
      <div className="kl-container">
        <div className="kl-footer__row">
          <div className="kl-footer__copy">
            <Image src="/images/site/logo_v2.png" alt="EPOXIDOVO" width={64} height={61} />
            <p>{t.copy}</p>
          </div>
          <ul className="kl-footer__links">
            {t.links.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
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
    <div className={`kl${menu ? " menu-is-active" : ""}`} lang={t.htmlLang}>
      <Header locale={locale} onMenu={setMenu} />
      <main>
        <Hello locale={locale} />
        <About locale={locale} />
        <Program locale={locale} />
        <Cta locale={locale} />
        <Highlights locale={locale} />
        <Boxes locale={locale} />
        <Faq locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
