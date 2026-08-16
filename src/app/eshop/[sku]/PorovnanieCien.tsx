import { ExternalLink, BadgePercent } from "lucide-react";
import konkurencia from "@/content/konkurencia.json";

/**
 * Porovnanie cien s inými e-shopmi — reálne ceny konkurencie za ROVNAKÉ
 * balenie (zdroj: verejné e-shopy, dátum v dátach). Ukazujeme len obchody,
 * kde sme lacnejší; ceny konkurencie sa nemenia automaticky, náš rozdiel
 * sa ráta live z aktuálnej ceny.
 */

const fmt = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Zaznam = { obchod: string; url: string; cena_eur: number };

export function PorovnanieCien({ sku, nasaCena }: { sku: string; nasaCena: number }) {
  const zaznamy = ((konkurencia.produkty as Record<string, Zaznam[]>)[sku] ?? []).filter(
    (z) => z.cena_eur > nasaCena,
  );
  if (zaznamy.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-center gap-2 font-bold text-zinc-900">
        <BadgePercent className="w-5 h-5 text-emerald-600" aria-hidden />
        Porovnaj si cenu — rovnaké balenie inde
      </div>
      <ul className="mt-3 space-y-2">
        {zaznamy
          .sort((a, b) => a.cena_eur - b.cena_eur)
          .map((z) => {
            const diff = Math.round(((z.cena_eur - nasaCena) / z.cena_eur) * 100);
            return (
              <li key={z.obchod} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <a
                  href={z.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 font-semibold text-zinc-700 hover:text-[#1a8cc4] hover:underline"
                >
                  {z.obchod}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                </a>
                <span className="tabular-nums text-zinc-500 line-through">
                  {fmt.format(z.cena_eur)} €
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold whitespace-nowrap">
                  u nás o {diff} % lacnejšie
                </span>
              </li>
            );
          })}
      </ul>
      <p className="mt-3 text-[11px] text-zinc-400 leading-snug">
        Ceny konkurencie s DPH za rovnaké balenie, zistené{" "}
        {konkurencia._aktualizovane}; CZK prepočítané kurzom 25,2 Kč/€. Naša
        cena {fmt.format(nasaCena)} € je konečná — nie sme platiteľ DPH.
      </p>
    </div>
  );
}
