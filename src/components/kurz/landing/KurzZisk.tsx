"use client";

import * as React from "react";
import {
  spocitajZisk,
  seriaZisku,
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
      "Vyber si typ podlahy a plochu. Počítame s reálnou trhovou cenou, za ktorú sa podlaha predáva, a s materiálom za tvoju absolventskú cenu — kupuješ ho u nás lacnejšie než bežný zákazník. Zvyšok je tvoja práca.",
    typLabel: "Typ podlahy",
    coskoro: "čoskoro",
    od: "od",
    sliderLabel: "Plocha zákazky",
    predaj: "Vyfakturuješ zákazníkovi",
    material: "Materiál — absolventská cena",
    materialSub: "tvoja cena ako absolventa, nie plná e-shop cena",
    marza: "Ostane ti",
    marzaSub: "hrubý zisk pred tvojou prácou a réžiou",
    perM2: "na m²",
    navrat: (m2: number) => `Kurz Štandard (${KURZ.priceStandard} €) sa ti vráti po prvých ~${m2} m².`,
    dni: (d: number, tvar: string) => `Realizácia aj s technologickými prestávkami: približne ${d} ${tvar}.`,
    chartTitle: "Hrubý zisk podľa počtu podláh (30 m² každá)",
    chartLegendPredaj: "tržba",
    chartLegendMaterial: "materiál",
    chartLegendZisk: "zisk",
    vyhodaTitle: "Materiál: tvoja výhoda ako absolventa",
    vyhodaIntro: `Bežný zákazník kúpi ten istý materiál v e-shope drahšie. Ako absolvent ho máš za absolventskú cenu (naša marža len ${Math.round(ABSOLVENT_MARZA * 100)} %).`,
    vyhodaBezna: "Bežná cena v e-shope",
    vyhodaAbsolvent: "Tvoja absolventská cena",
    vyhodaUspora: "Ušetríš na m²",
    vyhodaNote: (usporaJob: string, m2: number) =>
      `Na zákazke ${m2} m² ušetríš na materiáli ${usporaJob} € oproti bežnej cene.`,
    disclaimer:
      "Orientačný výpočet z reálnych cien. Predajná cena je trhová východisková cena, materiál za absolventskú cenu. Nepočíta tvoju prácu, dopravu, náradie ani dane — tie závisia od tvojho podnikania.",
    podlahy: "podláh",
    podlaha: "podlaha",
    podlahy24: "podlahy",
    dniTvar: (d: number) => (d === 1 ? "deň" : d < 5 ? "dni" : "dní"),
  },
  en: {
    label: "Earnings calculator",
    h2: "How much you make on one job",
    intro:
      "Pick a floor type and area. We use the real market price the floor sells for, and material at your graduate price — you buy it from us cheaper than a regular customer. The rest is your labour.",
    typLabel: "Floor type",
    coskoro: "soon",
    od: "from",
    sliderLabel: "Job area",
    predaj: "You invoice the client",
    material: "Material — graduate price",
    materialSub: "your graduate price, not the full e-shop price",
    marza: "You keep",
    marzaSub: "gross profit before labour and overheads",
    perM2: "per m²",
    navrat: (m2: number) => `The Standard course (€${KURZ.priceStandard}) pays back after your first ~${m2} m².`,
    dni: (d: number, tvar: string) => `Installation incl. curing breaks: about ${d} ${tvar}.`,
    chartTitle: "Gross profit by number of floors (30 m² each)",
    chartLegendPredaj: "revenue",
    chartLegendMaterial: "material",
    chartLegendZisk: "profit",
    vyhodaTitle: "Material: your graduate advantage",
    vyhodaIntro: `A regular customer buys the same material in the e-shop for more. As a graduate you get the graduate price (our margin only ${Math.round(ABSOLVENT_MARZA * 100)} %).`,
    vyhodaBezna: "Regular e-shop price",
    vyhodaAbsolvent: "Your graduate price",
    vyhodaUspora: "You save per m²",
    vyhodaNote: (usporaJob: string, m2: number) =>
      `On a ${m2} m² job you save €${usporaJob} on material vs the regular price.`,
    disclaimer:
      "Indicative calculation from real prices. Sale price is the market entry price, material at the graduate price. Labour, transport, tools and taxes are not included — they depend on your business.",
    podlahy: "floors",
    podlaha: "floor",
    podlahy24: "floors",
    dniTvar: () => "days",
  },
} as const;

const fmt = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "sk" ? "sk-SK" : "en-GB", { maximumFractionDigits: 0 }).format(n);
const fmt2 = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "sk" ? "sk-SK" : "en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export function KurzZisk({ locale }: { locale: Locale }) {
  const t = T[locale];
  const [typSlug, setTypSlug] = React.useState<TypPodlahy["slug"]>("metalicke");
  const [m2, setM2] = React.useState(30);

  const typ = React.useMemo(() => TYPY.find((x) => x.slug === typSlug) ?? TYPY[0], [typSlug]);
  const r = React.useMemo(() => spocitajZisk(m2, typ), [m2, typ]);
  const seria = React.useMemo(() => seriaZisku(typ, 30), [typ]);

  // SVG stĺpcový graf — tržba / materiál / zisk
  const W = 720, H = 300, padL = 56, padB = 40, padT = 16;
  const max = Math.max(1, ...seria.map((s) => s.predaj));
  const cw = (W - padL) / seria.length;
  const barW = Math.min(34, cw * 0.22);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round((max * k) / 1000) * 1000);

  if (!r) return null;

  return (
    <section id="kalkulacka" className="kl-section kl-zisk">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.h2}</h2>
          <p>{t.intro}</p>
        </div>

        {/* --- prepínač typu podlahy --- */}
        <div className="kl-zisk__types" role="group" aria-label={t.typLabel}>
          {TYPY.map((x) => {
            const ready = x.nakupMaterialEurM2 != null;
            const active = x.slug === typSlug;
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
                <span className="kl-typ__price">
                  {ready ? `${t.od} ${x.predajEurM2} €/m²` : t.coskoro}
                </span>
              </button>
            );
          })}
        </div>

        <div className="kl-zisk__grid">
          {/* --- kalkulačka --- */}
          <div className="kl-box kl-zisk__calc">
            <label htmlFor="kl-m2" className="kl-zisk__slider-label">
              <span>{t.sliderLabel}</span>
              <strong>{m2} m²</strong>
            </label>
            <input
              id="kl-m2"
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
            <div className="kl-zisk__quick" role="group" aria-label="m²">
              {[20, 30, 50, 100, 200, 500].map((v) => (
                <button key={v} type="button" className={`kl-chip${m2 === v ? " is-active" : ""}`} onClick={() => setM2(v)}>
                  {v} m²
                </button>
              ))}
            </div>

            <dl className="kl-zisk__rows">
              <div className="kl-zisk__row">
                <dt>{t.predaj}<small>{typ.label} · {r.predajM2} € {t.perM2}</small></dt>
                <dd>{fmt(r.predajEur, locale)} €</dd>
              </div>
              <div className="kl-zisk__row">
                <dt>{t.material}<small>{t.materialSub}</small></dt>
                <dd>− {fmt(r.materialEur, locale)} €</dd>
              </div>
              <div className="kl-zisk__row kl-zisk__row--total">
                <dt>{t.marza}<small>{t.marzaSub}</small></dt>
                <dd>{fmt(r.hrubaMarzaEur, locale)} €</dd>
              </div>
            </dl>
            <p className="kl-zisk__note">
              {t.navrat(r.navratnostM2)} {t.dni(r.dniRealizacie, t.dniTvar(r.dniRealizacie))}
            </p>
          </div>

          {/* --- graf --- */}
          <div className="kl-box kl-zisk__chart">
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t.chartTitle}</h3>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartTitle} className="kl-chart">
              {ticks.map((v) => (
                <g key={v}>
                  <line x1={padL} x2={W} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.08)" />
                  <text x={padL - 8} y={y(v) + 4} fill="rgba(255,255,255,0.45)" fontSize="11" textAnchor="end">
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </text>
                </g>
              ))}
              {seria.map((s, i) => {
                const x0 = padL + i * cw + cw / 2;
                return (
                  <g key={s.pocet}>
                    <rect x={x0 - barW * 1.5 - 3} y={y(s.predaj)} width={barW} height={y(0) - y(s.predaj)} rx="4" fill="rgba(255,255,255,0.18)" />
                    <rect x={x0 - barW / 2} y={y(s.material)} width={barW} height={y(0) - y(s.material)} rx="4" fill="rgba(255,255,255,0.38)" />
                    <rect x={x0 + barW / 2 + 3} y={y(s.marza)} width={barW} height={y(0) - y(s.marza)} rx="4" fill="oklch(0.72 0.14 55)" />
                    <text x={x0 + barW / 2 + 3 + barW / 2} y={y(s.marza) - 6} fill="#fff" fontSize="11" textAnchor="middle" fontWeight="600">
                      {fmt(s.marza, locale)}
                    </text>
                    <text x={x0} y={H - padB + 18} fill="rgba(255,255,255,0.7)" fontSize="12" textAnchor="middle">
                      {s.pocet} {s.pocet === 1 ? t.podlaha : s.pocet < 5 ? t.podlahy24 : t.podlahy}
                    </text>
                    <text x={x0} y={H - padB + 33} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle">
                      {s.plocha} m²
                    </text>
                  </g>
                );
              })}
            </svg>
            <ul className="kl-chart__legend">
              <li><i style={{ background: "rgba(255,255,255,0.18)" }} />{t.chartLegendPredaj}</li>
              <li><i style={{ background: "rgba(255,255,255,0.38)" }} />{t.chartLegendMaterial}</li>
              <li><i style={{ background: "oklch(0.72 0.14 55)" }} />{t.chartLegendZisk}</li>
            </ul>
          </div>
        </div>

        {/* --- absolventská výhoda na materiáli --- */}
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
