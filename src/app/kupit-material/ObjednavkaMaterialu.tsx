"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingCart, ChevronDown, Phone, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/lib/cart";
import { showToast } from "@/components/ui/Toast";
import { getMaterial } from "@/lib/materialy";
import { SITE } from "@/lib/site";
import { RAL_CLASSIC_FULL, RAL_GROUPS, type RalSwatch } from "@/content/ral-classic";
import { DOPRAVA_ZADARMO, DODANIE_LEHOTA } from "@/lib/payments";

/**
 * Objednávka materiálu — jedna stránka, šesť krokov zhora nadol
 * (po vzore epoxy-arts.com/koupit-material): systém → odtieň → výmera →
 * príprava podkladu → náradie → súhrn a do košíka.
 *
 * Skladby a spotreby sú TIE ISTÉ ako v konfigurátore (systemy.ts); ceny
 * z katalógu, konečné. Nič sa tu nevymýšľa — len sa to skladá.
 */

type Vrstva = { sku: string; nazov: string; spotreba: number; balenie: number; poznamka?: string };
type System = {
  id: string;
  nazov: string;
  podnazov: string;
  popis: string;
  vzhlad: "ral" | "metalik" | "chips";
  vrstvy: Vrstva[];
};

const SYSTEMY: System[] = [
  {
    id: "metalik",
    nazov: "Design Epoxid",
    podnazov: "Metalický",
    popis: "Hĺbka a metalické efekty. Do obývačiek, kuchýň, showroomov.",
    vzhlad: "metalik",
    vrstvy: [
      { sku: "TS-EP02", nazov: "Penetrácia TopStone EP02", spotreba: 0.8, balenie: 30, poznamka: "2 vrstvy" },
      { sku: "TS-EP11-METALLIC", nazov: "Metalická báza TopStone EP11", spotreba: 1.22, balenie: 20 },
      { sku: "TS-EP22-PLUS", nazov: "Vrchný lak TopStone EP22 Plus", spotreba: 1.19, balenie: 20, poznamka: "2 vrstvy" },
    ],
  },
  {
    id: "pu-design",
    nazov: "Polyuretán (PU)",
    podnazov: "Design",
    popis: "Mäkší došľap, pružný, farebne stály pod lakom. Do bývania.",
    vzhlad: "ral",
    vrstvy: [
      { sku: "SIKAFLOOR-151", nazov: "Penetrácia Sikafloor-151", spotreba: 0.4, balenie: 30 },
      { sku: "SIKAFLOOR-3000-21", nazov: "Hlavná vrstva Sikafloor-3000", spotreba: 1.5, balenie: 20 },
      { sku: "SIKAFLOOR-304W-7.5", nazov: "Vrchný lak Sikafloor-304W Matt", spotreba: 0.13, balenie: 7.5, poznamka: "2 vrstvy" },
    ],
  },
  {
    id: "epoxid-priemysel",
    nazov: "Odolný Epoxid",
    podnazov: "Priemysel, garáž",
    popis: "Čistý výkon pre záťaž. Znesie pneumatiky, zdvihák aj vozíky. Dielne, garáže, sklady.",
    vzhlad: "ral",
    vrstvy: [
      { sku: "SIKAFLOOR-151", nazov: "Penetrácia Sikafloor-151", spotreba: 0.4, balenie: 30 },
      { sku: "SIKAFLOOR-264-30", nazov: "Hlavná vrstva Sikafloor-264", spotreba: 1.5, balenie: 30 },
    ],
  },
  {
    id: "pu-exterier",
    nazov: "Polyuretán (PU)",
    podnazov: "Exteriér, UV stály",
    popis: "Pružný systém pre terasy a vonkajšie plochy. Nežltne, znesie mráz. S povinným protišmykom.",
    vzhlad: "ral",
    vrstvy: [
      { sku: "SIKAFLOOR-151", nazov: "Penetrácia Sikafloor-151", spotreba: 0.4, balenie: 30 },
      { sku: "SF-3310", nazov: "Hlavná vrstva Sikafloor-3310 (UV)", spotreba: 1.2, balenie: 20 },
      { sku: "TS-KREMICITY-PIESOK-0-3-0-8-MM-", nazov: "Protišmykový posyp — kremičitý piesok", spotreba: 1.0, balenie: 25 },
    ],
  },
];

const METALIK_EFEKTY = ["azuro","gold","copper","charcoal","pearl","slate","midnight-blue","moose-green","wine-red","white","gun-metal","sequoia","brass","bronze","burnt-orange","champagne","dark-brown","royal-blue"] as const;
const EFEKT_LABEL: Record<string, string> = { azuro:"Azuro", gold:"Gold", copper:"Copper", charcoal:"Charcoal", pearl:"Pearl", slate:"Slate", "midnight-blue":"Midnight Blue", "moose-green":"Moose Green", "wine-red":"Wine Red", white:"White", "gun-metal":"Gun Metal", sequoia:"Sequoia", brass:"Brass", bronze:"Bronze", "burnt-orange":"Burnt Orange", champagne:"Champagne", "dark-brown":"Dark Brown", "royal-blue":"Royal Blue" };

/** Príprava podkladu — nivelácia a tmel, z katalógu. */
const NIVELACIA = { sku: "162680", nazov: "Sikafloor Level-30", spotrebaNaMm: 1.8, balenie: 25, hrubkaMm: 4 };
const PRIMER_NIVELACIA = { sku: "498421", nazov: "Sikafloor-01 Primer", spotreba: 0.1, balenie: 10 };
const TMEL = { sku: "TS-TOPFILLER-EPOXIDOVY-TMEL", nazov: "TopFiller epoxidový tmel", balenie: 3 };

/** Náradie — skutočné položky z katalógu, s našimi cenami. */
const NARADIE: { sku: string; nazov: string }[] = [
  { sku: "AR-168936", nazov: "Valec na epoxidy 25 cm" },
  { sku: "AR-172996", nazov: "Valec na epoxidy 50 cm" },
  { sku: "AR-168935", nazov: "Valec na laky 25 cm" },
  { sku: "AR-66496", nazov: "Držiak na valec 50–70 cm" },
  { sku: "AR-68824", nazov: "Teleskopická tyč na stierku" },
  { sku: "AR-83640", nazov: "Obuv s hrotmi na liatie (pár)" },
  { sku: "UZ-009191", nazov: "Miešacie vedro 30 l" },
  { sku: "UZ-087607", nazov: "Odmerkové vedro 10 l s vekom" },
  { sku: "AR-163053", nazov: "Sitko s gumovým límcom" },
  { sku: "AR-68820", nazov: "Maskovacia páska 3M 50 m" },
  { sku: "AR-82975", nazov: "Prázdna plechovka 25 l" },
];

const REZERVA = 1.1;
const fmt = (n: number) => new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const cenaZa = (sku: string) => getMaterial(sku)?.cena_eur_s_dph ?? null;

function Krok({ n, nadpis, deti }: { n: number; nadpis: string; deti: React.ReactNode }) {
  return (
    <section className="scroll-mt-28">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-[#0e1a3b] text-white font-extrabold inline-flex items-center justify-center tabular-nums">{n}</span>
        <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">{nadpis}</h2>
      </div>
      <div className="mt-4">{deti}</div>
    </section>
  );
}

function Citac({ v, set, min = 0, krok = 1, jednotka }: { v: number; set: (n: number) => void; min?: number; krok?: number; jednotka: string }) {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-zinc-200 bg-white overflow-hidden">
      <button type="button" onClick={() => set(Math.max(min, v - krok))} aria-label="Menej" className="w-11 h-11 inline-flex items-center justify-center text-[#0e1a3b] hover:bg-zinc-100 transition-colors"><Minus className="w-4 h-4" aria-hidden /></button>
      <input type="number" value={v} min={min} step={krok} onChange={(e) => set(Math.max(min, Number(e.target.value) || 0))} className="w-16 text-center font-extrabold text-[#0e1a3b] tabular-nums outline-none" />
      <span className="pr-3 text-sm font-semibold text-[#4a5478]">{jednotka}</span>
      <button type="button" onClick={() => set(v + krok)} aria-label="Viac" className="w-11 h-11 inline-flex items-center justify-center text-[#0e1a3b] hover:bg-zinc-100 transition-colors border-l-2 border-zinc-200"><Plus className="w-4 h-4" aria-hidden /></button>
    </span>
  );
}

export function ObjednavkaMaterialu() {
  const { add } = useCart();
  const [sysId, setSysId] = React.useState<string>("metalik");
  const [lak, setLak] = React.useState<"mat" | "lesk">("mat");
  const [odtien, setOdtien] = React.useState<string | null>(null);
  const [m2, setM2] = React.useState(30);
  const [chceNivelaciu, setChceNivelaciu] = React.useState(false);
  const [nivM2Vlastne, setNivM2Vlastne] = React.useState<number | null>(null);
  const nivM2 = nivM2Vlastne ?? m2;
  const setNivM2 = (n: number) => setNivM2Vlastne(n);
  const [nivPodklad, setNivPodklad] = React.useState<"beton" | "dlazba">("beton");
  const [chceTmel, setChceTmel] = React.useState(false);
  const [tmelKg, setTmelKg] = React.useState(3);
  const [naradie, setNaradie] = React.useState<Record<string, number>>({});
  const [pridane, setPridane] = React.useState(false);
  const sys = SYSTEMY.find((s) => s.id === sysId)!;


  /* ── výpočet ── */
  const plocha = m2 * REZERVA;
  const material = sys.vrstvy.map((v) => {
    const kg = Math.round(v.spotreba * plocha * 10) / 10;
    const bal = Math.ceil(kg / v.balenie);
    const cena = cenaZa(v.sku);
    return { ...v, kg, bal, cena, spolu: cena != null ? Math.round(cena * bal * 100) / 100 : 0 };
  });
  const materialSpolu = material.reduce((s, r) => s + r.spolu, 0);

  const nivKg = chceNivelaciu ? Math.round(NIVELACIA.spotrebaNaMm * NIVELACIA.hrubkaMm * nivM2 * REZERVA * 10) / 10 : 0;
  const nivBal = chceNivelaciu ? Math.ceil(nivKg / NIVELACIA.balenie) : 0;
  const primerBal = chceNivelaciu && nivPodklad === "beton" ? Math.ceil(PRIMER_NIVELACIA.spotreba * nivM2 * REZERVA / PRIMER_NIVELACIA.balenie) : 0;
  const nivSpolu = nivBal * (cenaZa(NIVELACIA.sku) ?? 0) + primerBal * (cenaZa(PRIMER_NIVELACIA.sku) ?? 0);

  const tmelBal = chceTmel ? Math.ceil(tmelKg / TMEL.balenie) : 0;
  const tmelSpolu = tmelBal * (cenaZa(TMEL.sku) ?? 0);

  const naradieSpolu = Object.entries(naradie).reduce((s, [sku, q]) => s + q * (cenaZa(sku) ?? 0), 0);
  const celkom = Math.round((materialSpolu + nivSpolu + tmelSpolu + naradieSpolu) * 100) / 100;

  const odtienLabel = sys.vzhlad === "metalik" ? (odtien ? EFEKT_LABEL[odtien] : null) : odtien;

  const doKosika = () => {
    const polozky = [
      ...material.map((r) => ({ productId: r.sku, qty: r.bal, systemLabel: `${sys.nazov} — ${sys.podnazov}`, systemId: sys.id, color: odtienLabel ?? undefined })),
      ...(nivBal ? [{ productId: NIVELACIA.sku, qty: nivBal, systemLabel: "Nivelácia" }] : []),
      ...(primerBal ? [{ productId: PRIMER_NIVELACIA.sku, qty: primerBal, systemLabel: "Nivelácia" }] : []),
      ...(tmelBal ? [{ productId: TMEL.sku, qty: tmelBal, systemLabel: "Tmelenie prasklín" }] : []),
      ...Object.entries(naradie).filter(([, q]) => q > 0).map(([sku, q]) => ({ productId: sku, qty: q, systemLabel: "Náradie" })),
    ];
    add(polozky);
    setPridane(true);
    showToast(`${polozky.length} položiek je v košíku`, "cart");
  };

  return (
    <div className="bg-[#f7f7f4]">
      <Container size="xl" className="pt-6 md:pt-10 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0e1a3b]" style={{ textWrap: "balance" }}>Objednať materiál</h1>
          <p className="mt-2 text-[#4a5478] text-lg">Zostav si liatu podlahu na mieru. Vyber systém, odtieň a výmeru — o zvyšok sa postaráme.</p>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[1fr_400px] lg:gap-10 lg:items-start">
          <div className="space-y-10">
            {/* 1 — systém */}
            <Krok n={1} nadpis="Výber systému" deti={
              <>
                <p className="text-sm text-[#4a5478] mb-3">Akú záťaž očakávaš?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SYSTEMY.map((s) => (
                    <button key={s.id} type="button" onClick={() => { setSysId(s.id); setOdtien(null); }} aria-pressed={sysId === s.id}
                      className={`text-left rounded-2xl border-2 p-4 transition-all ${sysId === s.id ? "border-[#ea580c] bg-white shadow-[0_10px_28px_rgba(234,88,12,0.18)]" : "border-zinc-200 bg-white hover:border-[#3db6e8]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-[#0e1a3b]">{s.nazov} <span className="text-[#4a5478] font-bold">({s.podnazov})</span></div>
                          <div className="mt-1 text-sm text-[#4a5478] leading-snug">{s.popis}</div>
                        </div>
                        {sysId === s.id && <span className="w-6 h-6 shrink-0 rounded-full bg-[#ea580c] text-white inline-flex items-center justify-center"><Check className="w-4 h-4" aria-hidden /></span>}
                      </div>
                    </button>
                  ))}
                </div>
                {sys.vzhlad !== "metalik" && sys.id !== "epoxid-priemysel" && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(["mat", "lesk"] as const).map((l) => (
                      <button key={l} type="button" onClick={() => setLak(l)} className={`px-4 py-2 rounded-full border-2 font-bold text-sm capitalize transition-colors ${lak === l ? "border-[#0e1a3b] bg-[#0e1a3b] text-white" : "border-zinc-200 bg-white text-[#4a5478] hover:border-[#3db6e8]"}`}>
                        {l === "mat" ? "Matný lak (odporúčame)" : "Lesklý lak"}
                      </button>
                    ))}
                    <details className="w-full mt-1 text-sm text-[#4a5478]">
                      <summary className="cursor-pointer font-bold text-[#12729f] list-none inline-flex items-center gap-1">Prečo odporúčame matný? <ChevronDown className="w-4 h-4" aria-hidden /></summary>
                      <p className="mt-1.5">Skvele maskuje opotrebenie a mikroškrabance. Lesklý lak vyžaduje dokonale rovný podklad a náročnejšiu údržbu.</p>
                    </details>
                  </div>
                )}
              </>
            } />

            {/* 2 — odtieň */}
            <Krok n={2} nadpis="Výber odtieňa" deti={
              sys.vzhlad === "metalik" ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {METALIK_EFEKTY.map((e) => (
                    <button key={e} type="button" onClick={() => setOdtien(e)} aria-pressed={odtien === e}
                      className={`group relative aspect-square rounded-xl overflow-hidden ring-2 transition-all ${odtien === e ? "ring-[#ea580c] scale-[1.04]" : "ring-transparent hover:ring-[#3db6e8]"}`}>
                      <Image src={`/images/eshop/topstone-metallic/${e}.jpg`} alt={EFEKT_LABEL[e]} fill sizes="(max-width: 768px) 33vw, 12vw" quality={85} className="object-cover" />
                      <span className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-gradient-to-t from-black/75 to-transparent text-white text-[10px] font-bold text-left">{EFEKT_LABEL[e]}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-h-[260px] overflow-y-auto rounded-2xl border-2 border-zinc-200 bg-white p-3">
                  {RAL_GROUPS.map((g) => {
                    const farby = RAL_CLASSIC_FULL.filter((r: RalSwatch) => r.skupina === g.key);
                    if (!farby.length) return null;
                    return (
                      <div key={g.key} className="mb-3 last:mb-0">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-zinc-400 mb-1.5">{g.label}</div>
                        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                          {farby.map((r: RalSwatch) => (
                            <button key={r.kod} type="button" title={`${r.kod} — ${r.nazov}`} onClick={() => setOdtien(r.kod)}
                              className={`rounded-md overflow-hidden ring-1 transition-all ${odtien === r.kod ? "ring-2 ring-[#ea580c] scale-105" : "ring-[#1B2430]/10 hover:ring-[#3db6e8]"}`}>
                              <span className="block aspect-square" style={{ backgroundColor: r.hex }} />
                              <span className="block text-[9px] font-black text-[#1B2430] text-center py-0.5">{r.kod.replace("RAL ", "")}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            } />

            {/* 3 — výmera */}
            <Krok n={3} nadpis="Výmera" deti={
              <div className="flex flex-wrap items-center gap-4">
                <Citac v={m2} set={setM2} min={1} jednotka="m²" />
                <span className="text-sm text-[#4a5478]">Rátame s 10 % rezervou na strihy a dorovnanie.</span>
              </div>
            } />

            {/* 4 — príprava podkladu */}
            <Krok n={4} nadpis="Príprava podkladu" deti={
              <div className="space-y-3">
                <div className={`rounded-2xl border-2 bg-white p-4 transition-colors ${chceNivelaciu ? "border-[#0e1a3b]" : "border-zinc-200"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={chceNivelaciu} onChange={(e) => setChceNivelaciu(e.target.checked)} className="mt-1 w-5 h-5 accent-[#0e1a3b]" />
                    <span>
                      <span className="block font-extrabold text-[#0e1a3b]">Samonivelačná stierka ({NIVELACIA.nazov})</span>
                      <span className="block text-sm text-[#4a5478]">Vyrovnanie hrubého betónu alebo dlažby — {NIVELACIA.hrubkaMm} mm</span>
                    </span>
                  </label>
                  {chceNivelaciu && (
                    <div className="mt-3 pl-8 flex flex-wrap items-center gap-3">
                      {(["beton", "dlazba"] as const).map((p) => (
                        <button key={p} type="button" onClick={() => setNivPodklad(p)} className={`px-3.5 py-2 rounded-full border-2 text-sm font-bold transition-colors ${nivPodklad === p ? "border-[#0e1a3b] bg-[#0e1a3b] text-white" : "border-zinc-200 text-[#4a5478] hover:border-[#3db6e8]"}`}>
                          {p === "beton" ? "Na betón (vrátane penetrácie)" : "Na dlažbu (bez penetrácie)"}
                        </button>
                      ))}
                      <Citac v={nivM2} set={setNivM2} min={1} jednotka="m²" />
                      <span className="ml-auto font-extrabold text-[#0e1a3b] tabular-nums">{fmt(nivSpolu)} €</span>
                    </div>
                  )}
                </div>
                <div className={`rounded-2xl border-2 bg-white p-4 transition-colors ${chceTmel ? "border-[#0e1a3b]" : "border-zinc-200"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={chceTmel} onChange={(e) => setChceTmel(e.target.checked)} className="mt-1 w-5 h-5 accent-[#0e1a3b]" />
                    <span>
                      <span className="block font-extrabold text-[#0e1a3b]">Tmelenie prasklín ({TMEL.nazov})</span>
                      <span className="block text-sm text-[#4a5478]">Aby sa trhliny neprekreslili do nového povrchu</span>
                    </span>
                  </label>
                  {chceTmel && (
                    <div className="mt-3 pl-8 flex flex-wrap items-center gap-3">
                      <Citac v={tmelKg} set={setTmelKg} min={TMEL.balenie} krok={TMEL.balenie} jednotka="kg" />
                      <span className="ml-auto font-extrabold text-[#0e1a3b] tabular-nums">{fmt(tmelSpolu)} €</span>
                    </div>
                  )}
                </div>
              </div>
            } />

            {/* 5 — náradie */}
            <Krok n={5} nadpis="Náradie a pomôcky" deti={
              <details className="rounded-2xl border-2 border-zinc-200 bg-white">
                <summary className="cursor-pointer list-none flex items-center justify-between px-4 py-3 font-bold text-[#0e1a3b]">
                  Voliteľné profi vybavenie <ChevronDown className="w-5 h-5 text-zinc-400" aria-hidden />
                </summary>
                <div className="px-4 pb-4 divide-y divide-zinc-100">
                  {NARADIE.map((n) => {
                    const c = cenaZa(n.sku); const q = naradie[n.sku] ?? 0;
                    return (
                      <div key={n.sku} className="py-3 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#0e1a3b]">{n.nazov}</div>
                          <div className="text-xs text-[#6b7390] tabular-nums">{c != null ? `${fmt(c)} € / ks` : "cena na dopyt"}</div>
                        </div>
                        <Citac v={q} set={(v) => setNaradie((s) => ({ ...s, [n.sku]: v }))} jednotka="ks" />
                      </div>
                    );
                  })}
                </div>
              </details>
            } />
          </div>

          {/* ── 6 — súhrn, lepí sa ── */}
          <aside className="mt-10 lg:mt-0 lg:sticky lg:top-28 rounded-3xl bg-[#0e1a3b] text-white p-6 shadow-[0_24px_60px_rgba(14,26,59,0.35)]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 shrink-0 rounded-full bg-white text-[#0e1a3b] font-extrabold inline-flex items-center justify-center">6</span>
              <h2 className="text-xl font-extrabold">Tvoja objednávka</h2>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Systém", `${sys.nazov} · ${sys.podnazov}`],
                ["Odtieň", odtienLabel ?? "—"],
                ["Plocha", `${m2} m²`],
                ["Nivelácia", chceNivelaciu ? `${nivM2} m² · ${fmt(nivSpolu)} €` : "—"],
                ["Tmel na praskliny", chceTmel ? `${tmelKg} kg · ${fmt(tmelSpolu)} €` : "—"],
                ["Náradie", naradieSpolu > 0 ? `${fmt(naradieSpolu)} €` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-white/10 pb-2">
                  <dt className="text-white/60">{k}</dt><dd className="font-bold text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 space-y-1.5 text-xs text-white/70">
              {material.map((r) => (
                <div key={r.sku} className="flex justify-between gap-2 tabular-nums"><span>{r.nazov}{r.poznamka ? ` · ${r.poznamka}` : ""} — {r.bal} × {r.balenie} kg</span><span>{fmt(r.spolu)} €</span></div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-white/15 flex items-baseline justify-between">
              <span className="font-bold">Celková cena</span>
              <span className="text-3xl font-extrabold tabular-nums">{fmt(celkom)} €</span>
            </div>
            <p className="mt-1 text-[11px] text-white/55">Konečné ceny. Nie sme platiteľmi DPH.</p>
            {/* Jediný zdroj pravdy o doprave — payments.ts. Predtým tu bolo
                „doprava v cene", čo neplatilo ani pri ťažkom sete. */}
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-[#9fdcf5]"><Truck className="w-4 h-4 shrink-0" aria-hidden /> <span>{DOPRAVA_ZADARMO.kratko} · {DODANIE_LEHOTA}</span></p>
            <p className="mt-1 pl-[22px] text-[11px] text-white/55">{DOPRAVA_ZADARMO.tazsie}</p>
            <button type="button" onClick={doKosika} disabled={m2 <= 0}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#ea580c] text-white font-extrabold hover:bg-[#c2410c] disabled:opacity-50 shadow-[0_10px_28px_rgba(234,88,12,0.45)] transition-colors">
              {pridane ? <><Check className="w-5 h-5" aria-hidden /> V košíku</> : <><ShoppingCart className="w-5 h-5" aria-hidden /> Objednať materiál</>}
            </button>
            {pridane && <Link href="/kupit-material/kosik" className="mt-2 block text-center text-sm font-bold text-[#9fdcf5] hover:underline">Prejsť do košíka →</Link>}
            <a href={`tel:${SITE.contact.phoneRaw}`} className="mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-colors">
              <Phone className="w-4 h-4" aria-hidden /> Potrebuješ poradiť? {SITE.contact.phone}
            </a>
          </aside>
        </div>
      </Container>
    </div>
  );
}
