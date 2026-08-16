import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";
import { MATERIALY, type Material } from "@/lib/materialy";

/**
 * „Poskladaj celý systém" — realizačný systém sa skladá z penetrácie,
 * hlavnej vrstvy a vrchného laku OD ROVNAKÉHO VÝROBCU (kompatibilita
 * podľa technických listov). Aktuálne otvorený produkt je zvýraznený
 * vo svojom kroku, k ostatným krokom ponúkame produkty výrobcu.
 */

const KROKY: { kategoria: Material["kategoria"]; label: string }[] = [
  { kategoria: "Penetrácia", label: "1. Penetrácia" },
  { kategoria: "Hlavná vrstva", label: "2. Hlavná vrstva" },
  { kategoria: "Vrchný lak", label: "3. Vrchný lak" },
];

const fmt = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function KombinujSystem({ m }: { m: Material }) {
  if (!KROKY.some((k) => k.kategoria === m.kategoria)) return null;

  const odporucane = (kategoria: Material["kategoria"]): Material[] =>
    MATERIALY.filter(
      (x) => x.vyrobca === m.vyrobca && x.kategoria === kategoria && x.sku !== m.sku,
    ).slice(0, 2);

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-zinc-900">
        <Layers className="w-5 h-5 text-[#3db6e8]" aria-hidden />
        Poskladaj celý systém
      </h2>
      <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
        Liata podlaha je systém troch vrstiev od jedného výrobcu — penetrácia,
        hlavná vrstva a vrchný lak {m.vyrobca} sú navzájom odladené podľa
        technických listov.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {KROKY.map((krok) => {
          const jeTento = krok.kategoria === m.kategoria;
          const produkty = jeTento ? [m] : odporucane(krok.kategoria);
          return (
            <div
              key={krok.kategoria}
              className={`rounded-2xl border-2 p-3.5 ${
                jeTento ? "border-[#3db6e8] bg-[#e3f3fb]/40" : "border-zinc-200 bg-white"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wide text-[#1a6e9c]">
                {krok.label}
                {jeTento && " — máš otvorené"}
              </div>
              <div className="mt-2 space-y-2">
                {produkty.length === 0 && (
                  <p className="text-sm text-zinc-400">
                    Poradíme na +421 948 143 981.
                  </p>
                )}
                {produkty.map((p) =>
                  jeTento ? (
                    <div key={p.sku} className="flex items-center gap-2.5">
                      {p.foto && (
                        <span className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-white border border-zinc-200">
                          <Image src={p.foto} alt="" fill sizes="44px" quality={75} className="object-contain p-0.5" />
                        </span>
                      )}
                      <span className="text-sm font-bold text-zinc-900 leading-snug">
                        {p.nazov}
                      </span>
                    </div>
                  ) : (
                    <Link
                      key={p.sku}
                      href={`/eshop/${p.sku}`}
                      className="flex items-center gap-2.5 rounded-xl p-1.5 -m-1.5 hover:bg-zinc-50 transition-colors group"
                    >
                      {p.foto ? (
                        <span className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-white border border-zinc-200">
                          <Image src={p.foto} alt="" fill sizes="44px" quality={75} className="object-contain p-0.5" />
                        </span>
                      ) : (
                        <span className="w-11 h-11 shrink-0 rounded-lg bg-zinc-100" aria-hidden />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-[#1a8cc4] transition-colors">
                          {p.nazov}
                        </span>
                        <span className="block text-xs font-semibold text-zinc-500">
                          {fmt.format(p.cena_eur_s_dph)} €
                        </span>
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
