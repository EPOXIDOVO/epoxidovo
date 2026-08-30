"use client";

import * as React from "react";
import {
  spocitajZisk,
  absolventMaterialEurM2,
  TYPY,
  ABSOLVENT_MARZA,
  type TypPodlahy,
} from "@/lib/kurz-zisk";
import { KURZ } from "@/content/kurz";
import type { Locale } from "./copy";

const T = {
  sk: {
    label: "Kalkulačka zárobku",
    h2: "Koľko zarobíš z jednej zákazky",
    intro:
      "Vyber si typ podlahy a plochu — koláčový graf aj čísla sa napĺňajú naživo. Počítame s reálnou trhovou cenou a s materiálom za naše veľkoobchodné ceny (kupuješ ho u nás lacnejšie než bežný zákazník). Zvyšok je tvoja práca.",
    typLabel: "Typ podlahy",
    coskoro: "čoskoro",
    od: "od",
    earn: "zarobíš",
    sliderLabel: "Plocha zákazky",
    predaj: "Vyfakturuješ zákazníkovi",
    material: "Materiál za veľkoobchodné ceny",
    materialSub: "naša veľkoobchodná cena pre absolventov, nie e-shopová",
    marza: "Ostane ti",
    marzaSub: "hrubý zisk pred tvojou prácou a réžiou",
    perM2: "na m²",
    donutMaterial: "Materiál",
    donutZisk: "Tvoj zisk",
    donutStred: "z toho tvoj zisk",
    navrat: (m2: number) => `Kurz Štandard (${KURZ.priceStandard} €) sa ti vráti po prvých ~${m2} m².`,
    dni: (d: number, tvar: string) => `Realizácia aj s technologickými prestávkami: približne ${d} ${tvar}.`,
    vyhodaTitle: "Materiál: tvoja výhoda ako absolventa",
    vyhodaIntro: `Bežný zákazník kúpi ten istý materiál v e-shope drahšie. Ako absolvent ho máš za naše veľkoobchodné ceny (naša marža len ${Math.round(ABSOLVENT_MARZA * 100)} %).`,
    vyhodaBezna: "Bežná cena v e-shope",
    vyhodaAbsolvent: "Tvoja veľkoobchodná cena",
    vyhodaUspora: "Ušetríš na m²",
    vyhodaNote: (usporaJob: string, m2: number) =>
      `Na zákazke ${m2} m² ušetríš na materiáli ${usporaJob} € oproti bežnej cene.`,
    disclaimer:
      "Orientačný výpočet z reálnych cien. Predajná cena je trhová východisková cena, materiál za veľkoobchodnú cenu. Nepočíta tvoju prácu, dopravu, náradie ani dane — tie závisia od tvojho podnikania.",
    dniTvar: (d: number) => (d === 1 ? "deň" : d < 5 ? "dni" : "dní"),
  },
  en: {
    label: "Earnings calculator",
    h2: "How much you make on one job",
    intro:
      "Pick a floor type and area — the pie chart and the numbers fill in live. We use the real market price and material at our wholesale prices (you buy it from us cheaper than a regular customer). The rest is your labour.",
    typLabel: "Floor type",
    coskoro: "soon",
    od: "from",
    earn: "you earn",
    sliderLabel: "Job area",
    predaj: "You invoice the client",
    material: "Material at wholesale prices",
    materialSub: "our wholesale price for graduates, not the e-shop one",
    marza: "You keep",
    marzaSub: "gross profit before labour and overheads",
    perM2: "per m²",
    donutMaterial: "Material",
    donutZisk: "Your profit",
    donutStred: "of it your profit",
    navrat: (m2: number) => `The Standard course (€${KURZ.priceStandard}) pays back after your first ~${m2} m².`,
    dni: (d: number, tvar: string) => `Installation incl. curing breaks: about ${d} ${tvar}.`,
    vyhodaTitle: "Material: your graduate advantage",
    vyhodaIntro: `A regular customer buys the same material in the e-shop for more. As a graduate you get our wholesale prices (our margin only ${Math.round(ABSOLVENT_MARZA * 100)} %).`,
    vyhodaBezna: "Regular e-shop price",
    vyhodaAbsolvent: "Your wholesale price",
    vyhodaUspora: "You save per m²",
    vyhodaNote: (usporaJob: string, m2: number) =>
      `On a ${m2} m² job you save €${usporaJob} on material vs the regular price.`,
    disclaimer:
      "Indicative calculation from real prices. Sale price is the market entry price, material at the wholesale price. Labour, transport, tools and taxes are not included — they depend on your business.",
    dniTvar: () => "days",
  },
} as const;

const nfmt = (locale: Locale, min = 0, max = 0) =>
  new Intl.NumberFormat(locale === "sk" ? "sk-SK" : "en-GB", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
const fmt = (n: number, locale: Locale) => nfmt(locale).format(n);
const fmt2 = (n: number, locale: Locale) => nfmt(locale, 2, 2).format(n);

/** Plynulé narátavanie čísla (easeOutCubic). Na SSR aj prvom paint = cieľ. */
function useAnimatedNumber(target: number, duration = 500): number {
  const [val, setVal] = React.useState(target);
  const prev = React.useRef(target);
  React.useEffect(() => {
    const from = prev.current;
    const to = target;
    prev.current = to;
    if (from === to) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setVal(from + (to - from) * e);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function KurzZisk({ locale }: { locale: Locale }) {
  const t = T[locale];
  const [typSlug, setTypSlug] = React.useState<TypPodlahy["slug"]>("metalicke");
  const [m2, setM2] = React.useState(30);

  const typ = React.useMemo(() => TYPY.find((x) => x.slug === typSlug) ?? TYPY[0], [typSlug]);
  const r = React.useMemo(() => spocitajZisk(m2, typ), [m2, typ]);

  // animované hodnoty
  const aPredaj = useAnimatedNumber(r?.predajEur ?? 0);
  const aMaterial = useAnimatedNumber(r?.materialEur ?? 0);
  const aMarza = useAnimatedNumber(r?.hrubaMarzaEur ?? 0);
  const ziskFrac = r && r.predajEur > 0 ? r.hrubaMarzaEur / r.predajEur : 0;
  const aFrac = useAnimatedNumber(Math.round(ziskFrac * 1000) / 1000, 650);

  // donut
  const R = 78, C = 2 * Math.PI * R;
  const ziskDash = Math.max(0, Math.min(1, aFrac)) * C;

  if (!r) return null;

  return (
    <section id="kalkulacka" className="kl-section kl-zisk">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.h2}</h2>
          <p>{t.intro}</p>
        </div>

        {/* --- prepínač typu: klik = výber, na karte hneď zárobok €/m² --- */}
        <div className="kl-zisk__types" role="group" aria-label={t.typLabel}>
          {TYPY.map((x) => {
            const ready = x.nakupMaterialEurM2 != null;
            const active = x.slug === typSlug;
            const marzaM2 = ready ? Math.round((x.predajEurM2 - absolventMaterialEurM2(x.nakupMaterialEurM2!)) * 100) / 100 : null;
            return (
              <button
                key={x.slug}
                type="button"
                className={`kl-typ${active ? " is-active" : ""}${ready ? "" : " is-soon"}`}
                onClick={() => ready && setTypSlug(x.slug)}
                disabled={!ready}
                aria-pressed={active}
              >
                <span className="kl-typ__name">{x.label}</span>
                {ready ? (
                  <>
                    <span className="kl-typ__earn">
                      {t.earn} <strong>{fmt2(marzaM2!, locale)} €</strong>/m²
                    </span>
                    <span className="kl-typ__price">{t.od} {x.predajEurM2} €/m²</span>
                  </>
                ) : (
                  <span className="kl-typ__price kl-typ__price--soon">{t.coskoro}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="kl-zisk__grid">
          {/* --- vstupy + rolujúce čísla --- */}
          <div className="kl-box kl-zisk__calc">
            <label htmlFor="kl-m2" className="kl-zisk__slider-label">
              <span>{t.sliderLabel}</span>
              <strong>{m2} m²</strong>
            </label>
            <input
              id="kl-m2"
              type="range"
              min={10}
              max={2000}
              step={10}
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="kl-range"
              style={{ ["--p" as string]: `${((m2 - 10) / 1990) * 100}%` }}
              aria-valuetext={`${m2} m²`}
            />
            <div className="kl-zisk__quick" role="group" aria-label="m²">
              {[20, 30, 50, 100, 200, 500, 1000, 2000].map((v) => (
                <button key={v} type="button" className={`kl-chip${m2 === v ? " is-active" : ""}`} onClick={() => setM2(v)}>
                  {v} m²
                </button>
              ))}
            </div>

            <dl className="kl-zisk__rows">
              <div className="kl-zisk__row">
                <dt>{t.predaj}<small>{typ.label} · {r.predajM2} € {t.perM2}</small></dt>
                <dd>{fmt(aPredaj, locale)} €</dd>
              </div>
              <div className="kl-zisk__row">
                <dt>{t.material}<small>{t.materialSub}</small></dt>
                <dd>− {fmt(aMaterial, locale)} €</dd>
              </div>
              <div className="kl-zisk__row kl-zisk__row--total">
                <dt>{t.marza}<small>{t.marzaSub}</small></dt>
                <dd>{fmt(aMarza, locale)} €</dd>
              </div>
            </dl>
            <p className="kl-zisk__note">
              {t.navrat(r.navratnostM2)} {t.dni(r.dniRealizacie, t.dniTvar(r.dniRealizacie))}
            </p>
          </div>

          {/* --- koláčový (donut) graf, plní sa naživo --- */}
          <div className="kl-box kl-zisk__donut-box">
            <div className="kl-donut">
              <svg viewBox="0 0 200 200" role="img" aria-label={`${t.donutZisk}: ${fmt(r.hrubaMarzaEur, locale)} €`}>
                <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="26" />
                <circle
                  className="kl-donut__arc"
                  cx="100" cy="100" r={R} fill="none"
                  stroke="oklch(0.78 0.14 150)" strokeWidth="26" strokeLinecap="round"
                  strokeDasharray={`${ziskDash} ${C}`}
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="kl-donut__center">
                <span className="kl-donut__val">{fmt(aMarza, locale)} €</span>
                <span className="kl-donut__pct">{Math.round(aFrac * 100)} % {t.donutStred}</span>
              </div>
            </div>
            <ul className="kl-donut__legend">
              <li>
                <i style={{ background: "oklch(0.78 0.14 150)" }} />
                <span>{t.donutZisk}</span>
                <b>{fmt(aMarza, locale)} €</b>
              </li>
              <li>
                <i style={{ background: "rgba(255,255,255,0.32)" }} />
                <span>{t.donutMaterial}</span>
                <b>{fmt(aMaterial, locale)} €</b>
              </li>
            </ul>
          </div>
        </div>

        {/* --- veľkoobchodná výhoda na materiáli --- */}
        <div className="kl-box kl-zisk__vyhoda">
          <div className="kl-zisk__vyhoda-head">
            <h3>{t.vyhodaTitle}</h3>
            <p>{t.vyhodaIntro}</p>
          </div>
          <div className="kl-zisk__vyhoda-grid">
            <div className="kl-vyhoda-cell">
              <span className="kl-vyhoda-cell__label">{t.vyhodaBezna}</span>
              <span className="kl-vyhoda-cell__val kl-vyhoda-cell__val--strike">{fmt2(r.beznaMaterialM2, locale)} €/m²</span>
            </div>
            <div className="kl-vyhoda-cell kl-vyhoda-cell--accent">
              <span className="kl-vyhoda-cell__label">{t.vyhodaAbsolvent}</span>
              <span className="kl-vyhoda-cell__val">{fmt2(r.materialM2, locale)} €/m²</span>
            </div>
            <div className="kl-vyhoda-cell kl-vyhoda-cell--save">
              <span className="kl-vyhoda-cell__label">{t.vyhodaUspora}</span>
              <span className="kl-vyhoda-cell__val">−{fmt2(r.usporaMaterialM2, locale)} €/m²</span>
            </div>
          </div>
          <p className="kl-zisk__note">{t.vyhodaNote(fmt(r.usporaMaterialM2 * r.plochaM2, locale), r.plochaM2)}</p>
        </div>

        <p className="kl-zisk__disclaimer">{t.disclaimer}</p>
      </div>
    </section>
  );
}
