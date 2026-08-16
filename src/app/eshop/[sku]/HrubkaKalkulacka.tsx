"use client";

import * as React from "react";
import { Calculator, Check } from "lucide-react";

/**
 * Kalkulačka pre HLAVNÉ VRSTVY — rovnaký materiál sa dá aplikovať v troch
 * hrúbkach a každá má inú cenu aj odolnosť. Penetrácie, laky a doplnky
 * toto nemajú (tam ostáva jednoduchá BaleniaKalkulacka).
 *
 * Spotreby:
 *  - Náter: 2 tenké vrstvy valčekom — spotreba z technického listu × 2.
 *  - Stierka: orientačne 1,5 kg/m² na 1 mm hrúbky (hustota epoxidovej
 *    živice ~1,5 kg/l; do stierky sa časť živice bežne nahrádza kremičitým
 *    pieskom — presnú skladbu radi prepočítame).
 *  - PU systémy (3000/3000FX/3310) sa lejú len v 2 mm.
 */

const HUSTOTA_KG_M2_MM = 1.5;

type Rezim = {
  id: string;
  nazov: string;
  spotrebaKgM2: number;
  popis: string;
};

export function HrubkaKalkulacka({
  balenieKg,
  cenaEur,
  jePu2mm,
  cenaJeFinalna,
}: {
  balenieKg: number;
  cenaEur: number;
  jePu2mm: boolean;
  cenaJeFinalna: boolean;
}) {
  const rezimy = React.useMemo(() => {
    const r: Rezim[] = [];
    if (!jePu2mm) {
      r.push({
        id: "nater",
        nazov: "Náter (2 vrstvy valčekom)",
        // 0,3–0,5 kg/m² na vrstvu podľa savosti podkladu (technické listy) — rátame stred ×2
        spotrebaKgM2: 0.7,
        popis:
          "Najlacnejšie riešenie — tenký farebný film (0,3–0,5 kg/m² na vrstvu podľa savosti podkladu), ktorý chráni betón pred oterom, prachom a chémiou. Ideálny na bežnú garáž, pivnicu či sklad s ľahkou prevádzkou. Odolnosť je nižšia než pri liatych hrúbkach.",
      });
    }
    if (!jePu2mm) {
      r.push({
        id: "stierka1",
        nazov: "Liata stierka 1 mm",
        spotrebaKgM2: HUSTOTA_KG_M2_MM,
        popis:
          "Samonivelačná vrstva s krajším liatym povrchom a výrazne vyššou mechanickou aj chemickou odolnosťou. Hodí sa do dielní, skladov a prevádzok s bežným pojazdom.",
      });
    }
    r.push({
      id: "stierka2",
      nazov: jePu2mm ? "Liata stierka 2 mm (jediná možná hrúbka)" : "Liata stierka 2 mm",
      spotrebaKgM2: HUSTOTA_KG_M2_MM * 2,
      popis: jePu2mm
        ? "Polyuretánové systémy sa aplikujú len v hrúbke 2 mm — pružný, najodolnejší liaty povrch do interiérov s vysokou záťažou."
        : "Najodolnejšia varianta — plná liata vrstva pre vysokú záťaž: vozíky, ťažké stroje, intenzívna priemyselná prevádzka. Najvyššia cena, najdlhšia životnosť.",
      });
    return r;
  }, [jePu2mm]);

  const [rezimId, setRezimId] = React.useState(rezimy[0]?.id ?? "stierka2");
  const [plocha, setPlocha] = React.useState("");
  const rezim = rezimy.find((r) => r.id === rezimId) ?? rezimy[0];

  const m2 = Number(plocha);
  const valid = Number.isFinite(m2) && m2 > 0 && m2 <= 100000;
  const kg = valid ? m2 * rezim.spotrebaKgM2 : null;
  const balenia = kg != null ? Math.ceil(kg / balenieKg) : null;
  const spolu = balenia != null ? balenia * cenaEur : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 font-bold text-zinc-900">
        <Calculator className="w-5 h-5 text-[#3db6e8]" aria-hidden />
        Koľko kúpiť na moje m²?
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Ten istý materiál, tri spôsoby aplikácie — vyber hrúbku podľa záťaže.
      </p>

      {/* Výber hrúbky */}
      <div className="mt-3 space-y-2" role="radiogroup" aria-label="Hrúbka aplikácie">
        {rezimy.map((r) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={rezimId === r.id}
            onClick={() => setRezimId(r.id)}
            className={`w-full text-left rounded-xl border-2 p-3 transition-colors ${
              rezimId === r.id
                ? "border-[#3db6e8] bg-white"
                : "border-zinc-200 bg-white/60 hover:border-[#3db6e8]/50"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-zinc-900 inline-flex items-center gap-1.5">
                {rezimId === r.id && <Check className="w-4 h-4 text-[#3db6e8]" aria-hidden />}
                {r.nazov}
              </span>
              <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap tabular-nums">
                ~{r.spotrebaKgM2.toFixed(2).replace(".", ",")} kg/m²
              </span>
            </span>
            {rezimId === r.id && (
              <span className="mt-1.5 block text-xs text-zinc-500 leading-relaxed">
                {r.popis}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plocha */}
      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={100000}
          value={plocha}
          onChange={(e) => setPlocha(e.target.value)}
          placeholder="napr. 45"
          aria-label="Plocha v m²"
          className="w-32 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent"
        />
        <span className="text-sm font-semibold text-zinc-600">m²</span>
      </div>

      {balenia != null && spolu != null && kg != null && (
        <div className="mt-4 rounded-xl bg-white border border-zinc-200 p-4">
          <div className="text-2xl font-extrabold text-zinc-900">
            {balenia} {balenia === 1 ? "balenie" : balenia < 5 ? "balenia" : "balení"}{" "}
            <span className="text-base font-bold text-zinc-500">
              = {cenaJeFinalna ? "" : "od "}
              {spolu.toFixed(2).replace(".", ",")} €
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
            {m2} m² × ~{rezim.spotrebaKgM2.toFixed(2).replace(".", ",")} kg/m² ={" "}
            {kg.toFixed(1).replace(".", ",")} kg ÷ {balenieKg} kg balenie —
            predávame <strong>celé balenia</strong>, zaokrúhľujeme nahor.
          </p>
          {rezim.id !== "nater" && (
            <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
              Tip: pri liatej stierke sa časť živice bežne nahrádza kremičitým
              pieskom — zníži spotrebu aj cenu. Zavolaj, prepočítame presnú
              skladbu zadarmo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
