"use client";

import * as React from "react";
import {
  spocitajZisk,
  marzaEurM2,
  TYPY,
  ABSOLVENT_MARZA,
  BEZNA_MARZA,
  type TypPodlahy,
} from "@/lib/kurz-zisk";
import { KURZ } from "@/content/kurz";
import type { Locale } from "./copy";

const T = {
  sk: {
    label: "Kalkulačka zárobku",
    h2: "Koľko zarobíš z jednej zákazky",
    intro:
      "Vyber si typ podlahy a potiahni plochu — čísla sa nalievajú naživo. Počítame s reálnou trhovou cenou a s materiálom za naše veľkoobchodné ceny (kupuješ ho u nás lacnejšie než bežný zákazník). Zvyšok je tvoja práca.",
    typLabel: "Typ podlahy",
    coskoro: "čoskoro",
    od: "od",
    earn: "zarobíš",
    sliderLabel: "Plocha zákazky",
    predaj: "Vyfakturuješ zákazníkovi",
    material: "Materiál za veľkoobchodné ceny",
    materialSub: "naša veľkoobchodná cena pre absolventov, nie e-shopová",
    zaBalenia: "príplatok za celé balenia",
    baleniaTvar: (n: number) => (n === 1 ? "balenie" : n < 5 ? "balenia" : "balení"),
    zvysok: (kg: number) =>
      `V sudoch ti ostane ~${kg} kg — materiál sa kupuje na celé balenia a tie platí zákazník. Presne tak to robíme aj my.`,
    marza: "Zarobíš",
    marzaSub: "hrubý zisk pred tvojou prácou a réžiou",
    perM2: "na m²",
    pourZisk: "tvoj zisk",
    pourMaterial: "materiál",
    pourSub: "tvoj zisk —",
    pourSub2: "z faktúry",
    wholesaleTitle: "Veľkoobchodné ceny materiálu.",
    wholesaleBody: "Ako absolvent kupuješ materiál u nás výrazne lacnejšie než bežný zákazník v e-shope.",
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
      "Orientačný výpočet z reálnych trhových cien. Nepočíta tvoju prácu, dopravu ani dane.",
    dniTvar: (d: number) => (d === 1 ? "deň" : d < 5 ? "dni" : "dní"),
  },
  en: {
    label: "Earnings calculator",
    h2: "How much you make on one job",
    intro:
      "Pick a floor type and drag the area — the numbers pour in live. We use the real market price and material at our wholesale prices (you buy it from us cheaper than a regular customer). The rest is your labour.",
    typLabel: "Floor type",
    coskoro: "soon",
    od: "from",
    earn: "you earn",
    sliderLabel: "Job area",
    predaj: "You invoice the client",
    material: "Material at wholesale prices",
    materialSub: "our wholesale price for graduates, not the e-shop one",
    zaBalenia: "surcharge for whole packages",
    baleniaTvar: () => "packages",
    zvysok: (kg: number) =>
      `~${kg} kg stays in the drums — material is bought in whole packages and the client pays for them. Exactly how we do it.`,
    marza: "You earn",
    marzaSub: "gross profit before labour and overheads",
    perM2: "per m²",
    pourZisk: "your profit",
    pourMaterial: "material",
    pourSub: "your profit —",
    pourSub2: "of the invoice",
    wholesaleTitle: "Wholesale material prices.",
    wholesaleBody: "As a graduate you buy material from us for much less than a regular e-shop customer.",
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
      "Indicative calculation from real market prices. Doesn't include your labour, transport or taxes.",
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

/** Plynulé narátavanie čísla (easeOutCubic). Na SSR aj prvom paint = cieľ.
 *  Exportované — používa ho aj mini-kalkulačka v hero (KurzLanding). */
export function useAnimatedNumber(target: number, duration = 500): number {
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

  /* Úspora veľkoobchodu vs. e-shopu je konštantný pomer marží — rovnaká
     pre každý typ podlahy, preto sa počíta raz z konštánt. */
  const usporaPct = Math.round((1 - (1 - BEZNA_MARZA) / (1 - ABSOLVENT_MARZA)) * 100);

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
            const ready = true;
            const active = x.slug === typSlug;
            const marzaM2 = marzaEurM2(x);
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
                {/* Tržba viditeľne rozdelená: m² × cena + príplatok za sudy —
                    schovaný príplatok by vyzeral ako trik. */}
                <dt>{t.predaj}<small>{r.predajM2} € × {r.plochaM2} m² + {fmt(r.priplatokEur, locale)} € {t.zaBalenia}</small></dt>
                <dd>{fmt(aPredaj, locale)} €</dd>
              </div>
              <div className="kl-zisk__row">
                {/* Počet balení preč — majiteľ 2026-08-30: „3 balenia — daj prec". */}
                <dt>{t.material}<small>{t.materialSub}</small></dt>
                <dd>− {fmt(aMaterial, locale)} €</dd>
              </div>
              <div className="kl-zisk__row kl-zisk__row--total">
                <dt>{t.marza}<small>{t.marzaSub}</small></dt>
                <dd>{fmt(aMarza, locale)} €</dd>
              </div>
            </dl>
            {r.zvysokKg > 0 && <p className="kl-zisk__zvysok">{t.zvysok(r.zvysokKg)}</p>}
            <p className="kl-zisk__note">
              {t.navrat(r.navratnostM2)} {t.dni(r.dniRealizacie, t.dniTvar(r.dniRealizacie))}
            </p>
          </div>

          {/* --- naliata trubica: podiel zisku z faktúry, plní sa naživo --- */}
          <div className="kl-box kl-pour">
            <div>
              <div className="kl-pour__big">
                {fmt(aMarza, locale)} €
                <small>{t.pourSub} <b>{Math.round(aFrac * 100)} %</b> {t.pourSub2}</small>
              </div>
              {/* Disclaimer priamo pod sumou (brief 2026-08-30), nie na dne sekcie. */}
              <p className="kl-zisk__mini-disc">{t.disclaimer}</p>
            </div>
            <div>
              <div className="kl-tube" role="img" aria-label={`${t.pourZisk}: ${Math.round(ziskFrac * 100)} %`}>
                <div className="kl-tube__fill" style={{ width: `${Math.max(0, Math.min(1, aFrac)) * 100}%` }} />
              </div>
              <div className="kl-tube__legend">
                <b>■ {t.pourZisk} · {fmt(aMarza, locale)} €</b>
                <span>■ {t.pourMaterial} · {fmt(aMaterial, locale)} €</span>
              </div>
            </div>
            <div className="kl-wholesale">
              <span className="kl-wholesale__pct">−{usporaPct} %</span>
              <p><b>{t.wholesaleTitle}</b> {t.wholesaleBody}</p>
            </div>
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

      </div>
    </section>
  );
}
