"use client";

import * as React from "react";
import { Calculator } from "lucide-react";

/**
 * Kalkulačka balení — koľko CELÝCH balení treba na zadanú plochu.
 * Materiál sa nedá odliať, predávame len celé balenia → zaokrúhľujeme
 * NAHOR a hovoríme to používateľovi na rovinu.
 */
export function BaleniaKalkulacka({
  spotrebaKgM2,
  balenieKg,
  cenaEur,
  jePu2mm,
}: {
  spotrebaKgM2: number;
  balenieKg: number;
  cenaEur: number;
  jePu2mm: boolean;
}) {
  const [plocha, setPlocha] = React.useState("");

  const m2 = Number(plocha);
  const valid = Number.isFinite(m2) && m2 > 0 && m2 <= 100000;
  const balenia = valid ? Math.ceil((m2 * spotrebaKgM2) / balenieKg) : null;
  const spolu = balenia != null ? balenia * cenaEur : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 font-bold text-zinc-900">
        <Calculator className="w-5 h-5 text-[#12729f]" aria-hidden />
        Koľko balení potrebujem?
      </div>
      {jePu2mm && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Polyuretánové systémy sa aplikujú <strong>len v hrúbke 2 mm</strong> —
          spotreba nižšie s tým už počíta.
        </p>
      )}
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
      {balenia != null && spolu != null && (
        <div className="mt-4 rounded-xl bg-white border border-zinc-200 p-4">
          <div className="text-2xl font-extrabold text-zinc-900">
            {balenia} {balenia === 1 ? "balenie" : balenia < 5 ? "balenia" : "balení"}{" "}
            <span className="text-base font-bold text-zinc-500">
              = {spolu.toFixed(2).replace(".", ",")} €
            </span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
            Materiál sa predáva <strong>v celých baleniach</strong> — nedá sa
            odliať, preto zaokrúhľujeme nahor. Výpočet:{" "}
            {m2}&nbsp;m² × {spotrebaKgM2}&nbsp;kg/m² ={" "}
            {(m2 * spotrebaKgM2).toFixed(1)}&nbsp;kg ÷ {balenieKg}&nbsp;kg
            balenie.
          </p>
        </div>
      )}
    </div>
  );
}
