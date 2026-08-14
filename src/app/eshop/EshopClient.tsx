"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductVisual } from "@/components/eshop/ProductVisual";
import {
  MATERIALY,
  KATEGORIE,
  VYROBCOVIA,
  type Kategoria,
  type Vyrobca,
} from "@/lib/materialy";

/**
 * Katalóg materiálov — filtre (kategória + výrobca) a vyhľadávanie.
 * Search matchuje názov AJ SKU — ľudia hľadajú „264", nie celý názov.
 * 202 položiek → filtrovanie čisto client-side, žiadny server round-trip.
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function EshopClient() {
  const [kategoria, setKategoria] = React.useState<Kategoria | null>(null);
  const [vyrobca, setVyrobca] = React.useState<Vyrobca | null>(null);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = normalize(query.trim());
    return MATERIALY.filter((m) => {
      if (kategoria && m.kategoria !== kategoria) return false;
      if (vyrobca && m.vyrobca !== vyrobca) return false;
      if (q) {
        const hay = normalize(`${m.nazov} ${m.sku}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [kategoria, vyrobca, query]);

  const chipCls = (active: boolean) =>
    `px-3.5 md:px-4 py-2 rounded-full text-[13px] md:text-sm font-semibold whitespace-nowrap transition-colors border-2 ${
      active
        ? "bg-[#3db6e8] border-[#3db6e8] text-white"
        : "bg-white border-zinc-200 text-zinc-700 hover:border-[#3db6e8] hover:text-[#3db6e8]"
    }`;

  return (
    <Container size="xl" className="py-8 md:py-12">
      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hľadaj názov alebo SKU — napr. „264“ alebo „piesok“"
          aria-label="Vyhľadať materiál"
          className="block w-full pl-12 pr-10 py-3.5 rounded-full border-2 border-zinc-200 bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] focus:ring-2 focus:ring-[#3db6e8]/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Zmazať vyhľadávanie"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Filtre */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => setKategoria(null)} className={chipCls(kategoria === null)}>
          Všetky kategórie
        </button>
        {KATEGORIE.map((k) => (
          <button key={k} type="button" onClick={() => setKategoria(kategoria === k ? null : k)} className={chipCls(kategoria === k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => setVyrobca(null)} className={chipCls(vyrobca === null)}>
          Všetci výrobcovia
        </button>
        {VYROBCOVIA.map((v) => (
          <button key={v} type="button" onClick={() => setVyrobca(vyrobca === v ? null : v)} className={chipCls(vyrobca === v)}>
            {v}
          </button>
        ))}
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500">
        {filtered.length === MATERIALY.length
          ? `${MATERIALY.length} produktov`
          : `${filtered.length} z ${MATERIALY.length} produktov`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 text-center text-zinc-500">
          Nič sme nenašli. Skús iný výraz — alebo nám{" "}
          <Link href="/kontakt" className="text-[#3db6e8] font-semibold hover:underline">
            napíš
          </Link>
          , materiál vieme objednať.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((m) => {
            return (
              <Link
                key={m.sku}
                href={`/eshop/${m.sku}`}
                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8]"
              >
                {/* Vizuál — vedro na fotke našej podlahy (ProductVisual);
                    keď pribudne oficiálna produktovka (pole foto), prebije ho */}
                <div className="relative">
                  <ProductVisual material={m} variant="card" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[10px] md:text-[11px] font-bold uppercase tracking-wide">
                    {m.vyrobca}
                  </span>
                  {m.pokryje_m2_z_balenia != null && (
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-white/95 text-[#1a1a1a] text-[11px] md:text-xs font-bold shadow">
                      vystačí na {m.pokryje_m2_z_balenia} m²
                    </span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-[#3db6e8]">
                    {m.kategoria}
                  </div>
                  <h2 className="mt-0.5 text-[13px] md:text-[15px] font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#1a8cc4] transition-colors">
                    {m.nazov}
                  </h2>
                  {m.balenie && (
                    <div className="mt-0.5 text-[11px] md:text-xs text-zinc-500">{m.balenie}</div>
                  )}
                  <div className="mt-1.5 text-base md:text-lg font-extrabold text-zinc-900">
                    {m.cena_eur_s_dph.toFixed(2).replace(".", ",")} €
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
