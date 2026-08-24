"use client";

import * as React from "react";
import { spocitajZisk, seriaZisku, PREDAJ_EUR_M2, materialEurM2 } from "@/lib/kurz-zisk";
import { KURZ } from "@/content/kurz";
import type { Locale } from "./copy";

const T = {
  sk: {
    label: "Kalkulačka zárobku",
    h2: "Koľko zarobíš z jednej metalickej podlahy",
    intro:
      "Počítame s predajnou cenou 149 €/m² za metalickú podlahu a s nákupom materiálu za aktuálne ceny v našom e-shope (TopStone EP02 + EP11 Metallic + EP22 Plus — presne tá skladba, ktorú sa na kurze naučíš liať). Zvyšok je tvoja práca.",
    sliderLabel: "Plocha podlahy",
    predaj: "Vyfakturuješ zákazníkovi",
    material: "Materiál z nášho e-shopu",
    marza: "Ostane ti",
    marzaSub: "hrubý zisk pred prácou a réžiou",
    perM2: "na m²",
    balenia: "celé balenia + 10 % rezerva na strihy",
    navrat: (m2: number) => `Kurz Štandard (${KURZ.priceStandard} €) sa ti vráti po prvých ~${m2} m².`,
    dni: (d: number) => `Realizácia vrátane technologických prestávok: ~${d} dni.`,
    chartTitle: "Hrubý zisk podľa počtu podláh (30 m² každá)",
    chartLegendPredaj: "tržba",
    chartLegendMaterial: "materiál",
    chartLegendZisk: "zisk",
    breakdown: "Z čoho sa skladá 1 m²",
    breakdownCols: ["Vrstva", "Produkt", "Spotreba", "Cena balenia", "€/m²"],
    breakdownSum: "Materiál spolu",
    breakdownMarza: "Tvoja marža pri 149 €/m²",
    disclaimer:
      "Orientačný výpočet. Ceny materiálu sa berú z e-shopu v čase načítania stránky, spotreby z technických listov. Nepočíta prácu, dopravu, náradie, DPH ani dane z príjmu — tie závisia od tvojej firmy.",
    podlahy: "podláh",
    podlaha: "podlaha",
    podlahy24: "podlahy",
  },
  en: {
    label: "Earnings calculator",
    h2: "How much you make on one metallic floor",
    intro:
      "We assume a sale price of €149/m² for a metallic floor and material bought at current prices in our e-shop (TopStone EP02 + EP11 Metallic + EP22 Plus — exactly the system you learn to pour on the course). The rest is your labour.",
    sliderLabel: "Floor area",
    predaj: "You invoice the client",
    material: "Material from our e-shop",
    marza: "You keep",
    marzaSub: "gross profit before labour and overheads",
    perM2: "per m²",
    balenia: "whole packages + 10 % cutting reserve",
    navrat: (m2: number) => `The Standard course (€${KURZ.priceStandard}) pays back after your first ~${m2} m².`,
    dni: (d: number) => `Installation incl. curing breaks: ~${d} days.`,
    chartTitle: "Gross profit by number of floors (30 m² each)",
    chartLegendPredaj: "revenue",
    chartLegendMaterial: "material",
    chartLegendZisk: "profit",
    breakdown: "What 1 m² is made of",
    breakdownCols: ["Layer", "Product", "Consumption", "Pack price", "€/m²"],
    breakdownSum: "Material total",
    breakdownMarza: "Your margin at €149/m²",
    disclaimer:
      "Indicative calculation. Material prices are taken from the e-shop when the page loads, consumption from technical data sheets. Labour, transport, tools, VAT and income tax are not included — they depend on your business.",
    podlahy: "floors",
    podlaha: "floor",
    podlahy24: "floors",
  },
} as const;

const fmt = (n: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "sk" ? "sk-SK" : "en-GB", { maximumFractionDigits: 0 }).format(n);

export function KurzZisk({ locale }: { locale: Locale }) {
  const t = T[locale];
  const [m2, setM2] = React.useState(30);
  const r = React.useMemo(() => spocitajZisk(m2), [m2]);
  const seria = React.useMemo(() => seriaZisku(30), []);
  const m2mat = React.useMemo(() => materialEurM2(), []);

  // SVG stĺpcový graf — tržba / materiál / zisk
  const W = 720, H = 300, padL = 56, padB = 40, padT = 16;
  const max = Math.max(...seria.map((s) => s.predaj));
  const cw = (W - padL) / seria.length;
  const barW = Math.min(34, cw * 0.22);
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round((max * k) / 1000) * 1000);

  return (
    <section id="kalkulacka" className="kl-section kl-zisk">
      <div className="kl-container">
        <div className="kl-section__head">
          <h2>{t.h2}</h2>
          <p>{t.intro}</p>
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
                <dt>{t.predaj}<small>{PREDAJ_EUR_M2} € {t.perM2}</small></dt>
                <dd>{fmt(r.predajEur, locale)} €</dd>
              </div>
              <div className="kl-zisk__row">
                <dt>{t.material}<small>{t.balenia}</small></dt>
                <dd>− {fmt(r.materialBaleniaEur, locale)} €</dd>
              </div>
              <div className="kl-zisk__row kl-zisk__row--total">
                <dt>{t.marza}<small>{t.marzaSub}</small></dt>
                <dd>{fmt(r.hrubaMarzaEur, locale)} €</dd>
              </div>
            </dl>
            <p className="kl-zisk__note">{t.navrat(r.navratnostM2)} {t.dni(r.dniRealizacie)}</p>
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

        {/* --- rozpis 1 m² --- */}
        <div className="kl-box kl-zisk__table">
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t.breakdown}</h3>
          <div className="kl-table-scroll">
            <table className="kl-table">
              <thead>
                <tr>{t.breakdownCols.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {m2mat.riadky.map((row) => (
                  <tr key={row.sku}>
                    <td>{row.nazov}</td>
                    <td style={{ color: "#fff" }}>{row.produkt}</td>
                    <td>{row.spotrebaKgM2 != null ? `${row.spotrebaKgM2} kg/m²` : "—"}</td>
                    <td>{row.cenaBalenie != null ? `${fmt(row.cenaBalenie, locale)} € / ${row.balenieKg} kg` : "—"}</td>
                    <td style={{ color: "#fff", whiteSpace: "nowrap" }}>{row.eurM2 != null ? `${row.eurM2.toFixed(2)} €` : "—"}</td>
                  </tr>
                ))}
                <tr className="kl-table__sum">
                  <td colSpan={4}>{t.breakdownSum}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{m2mat.spolu.toFixed(2)} €</td>
                </tr>
                <tr className="kl-table__sum kl-table__sum--accent">
                  <td colSpan={4}>{t.breakdownMarza}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{(PREDAJ_EUR_M2 - m2mat.spolu).toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="kl-zisk__disclaimer">{t.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
