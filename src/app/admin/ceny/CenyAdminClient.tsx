"use client";

import * as React from "react";
import { Search, Save, RotateCcw, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MATERIALY, VYROBCOVIA, CENA_Z_IMPORTU, type Vyrobca, type Material } from "@/lib/materialy";
import { OBSAH_KATEGORIE, obsahKategoria } from "@/lib/obsah-kategorie";
import { VYROBCA_LOGO } from "@/lib/vyrobca-logo";
import cenyOverride from "@/content/ceny-override.json";

/**
 * Admin editor cien — upravuje src/content/ceny-override.json cez lokálny
 * zapisovač (scripts/ceny-admin.mjs, port 8798). Funguje len na localhoste;
 * v produkcii sa ceny menia commitom tohto súboru.
 *
 * Produkty líšiace sa len balením (rovnaký názov bez zátvoriek) sú zlúčené
 * do jedného riadku s dropdownom balení. Nákup s/bez DPH je odvodený z
 * importnej ceny (nákup s DPH = import × 0,735 — vzorec cenotvorby);
 * zisk = aktuálny predaj − nákup s DPH (sme neplatiteľ, DPH z nákupu
 * je náklad, daň z príjmu sa neráta).
 */

const ADMIN_API = "http://localhost:8798";

const fmt = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Stats = {
  objednavok: number;
  trzbaSpolu: number;
  produkty: { sku: string; kusov: number; objednavok: number; trzba: number }[];
  posledne: { id: string; kedy: string; meno: string; suma: number; platba: string; kusov: number }[];
};

/** Kľúč variantovej skupiny — názov bez zátvorkových častí + výrobca. */
function skupinaKey(m: Material): string {
  const base = m.nazov.replace(/\s*\([^)]*\)/g, "").trim().toLowerCase();
  return `${m.vyrobca}::${base}`;
}

/** Label variantu v dropdown-e: balenie + prípadná kategória farby (kat. A/B). */
function variantLabel(m: Material): string {
  const kat = m.nazov.match(/kat\.\s*([A-Z])/i)?.[1];
  return (m.balenie ?? m.sku) + (kat ? ` · kat. ${kat.toUpperCase()}` : "");
}

/** Nákup s DPH z importnej ceny (vzorec ÷0,735); null = fixná cena z CRM, nákup nepoznáme. */
function nakupSDph(sku: string): number | null {
  const zaklad = CENA_Z_IMPORTU[sku];
  if (!zaklad || zaklad.pevna) return null;
  return Math.round(zaklad.cena * 0.735 * 100) / 100;
}

export function CenyAdminClient() {
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [query, setQuery] = React.useState("");
  const [vyrobca, setVyrobca] = React.useState<Vyrobca | null>(null);
  const [obsah, setObsah] = React.useState<string | null>(null);
  const [lenOverride, setLenOverride] = React.useState(false);
  const [online, setOnline] = React.useState<boolean | null>(null);
  const [stav, setStav] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [variant, setVariant] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch(`${ADMIN_API}/ping`)
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false));
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.ok && setStats(j))
      .catch(() => {});
  }, []);

  const kusyPerSku = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const p of stats?.produkty ?? []) m.set(p.sku, p.kusov);
    return m;
  }, [stats]);

  const overrides = cenyOverride.ceny as Record<string, number>;

  const zoznam = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return MATERIALY.filter((m) => {
      if (vyrobca && m.vyrobca !== vyrobca) return false;
      if (obsah && obsahKategoria(m) !== obsah) return false;
      if (lenOverride && overrides[m.sku] == null && drafts[m.sku] == null) return false;
      if (!q) return true;
      return `${m.nazov} ${m.sku}`.toLowerCase().includes(q);
    });
  }, [query, vyrobca, obsah, lenOverride, drafts, overrides]);

  /** Zlúč varianty balení — zoskupenie robíme až po filtroch. */
  const skupiny = React.useMemo(() => {
    const g = new Map<string, Material[]>();
    for (const m of zoznam) {
      const k = skupinaKey(m);
      const arr = g.get(k);
      if (arr) arr.push(m);
      else g.set(k, [m]);
    }
    // v skupine najväčšie balenie prvé — to je default variant
    for (const arr of g.values()) {
      arr.sort((a, b) => (b.balenie_kg ?? 0) - (a.balenie_kg ?? 0));
    }
    return [...g.entries()];
  }, [zoznam]);

  const vyrobcaCounts = React.useMemo(() => {
    const c = new Map<string, number>();
    for (const m of MATERIALY) c.set(m.vyrobca, (c.get(m.vyrobca) ?? 0) + 1);
    return c;
  }, []);

  const obsahCounts = React.useMemo(() => {
    const c = new Map<string, number>();
    for (const m of MATERIALY) {
      if (vyrobca && m.vyrobca !== vyrobca) continue;
      const k = obsahKategoria(m);
      c.set(k, (c.get(k) ?? 0) + 1);
    }
    return c;
  }, [vyrobca]);

  const zmeny = Object.entries(drafts).filter(([sku, v]) => {
    const cur = overrides[sku] ?? null;
    const parsed = v === "" ? null : Number(v.replace(",", "."));
    return v !== undefined && String(cur ?? "") !== String(parsed ?? "");
  });

  const uloz = async () => {
    setStav(null);
    const nove: Record<string, number> = { ...overrides };
    for (const [sku, v] of Object.entries(drafts)) {
      if (v === "" || v == null) {
        delete nove[sku];
        continue;
      }
      const n = Number(v.replace(",", "."));
      if (!isFinite(n) || n <= 0) {
        setStav(`Neplatná cena pri ${sku}`);
        return;
      }
      nove[sku] = Math.round(n * 100) / 100;
    }
    try {
      const res = await fetch(`${ADMIN_API}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceny: nove }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? "server odmietol");
      setStav(
        `Uložené (${json.pocet} cien). Obnov stránku, nech sa načítajú — a na web ich dostane commit + push (povedz Claudovi „pushni ceny").`,
      );
      setDrafts({});
    } catch (e) {
      setStav(
        `Nepodarilo sa uložiť: ${e instanceof Error ? e.message : e}. Beží dev server cez npm run dev?`,
      );
    }
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors border-2 ${
      active
        ? "bg-[#3db6e8] border-[#3db6e8] text-white"
        : "bg-white border-zinc-200 text-zinc-700 hover:border-[#3db6e8] hover:text-[#3db6e8]"
    }`;

  return (
    <Container size="xl" className="py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0e1a3b]">
        🛠 Admin — ceny e-shopu
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 max-w-2xl">
        Zmena ceny tu vytvorí ručný override — prebije cenu z CRM importu a
        označí ju ako pevnú. Prázdne pole = override zrušiť (vráti sa cena z
        CRM). Produkty s viacerými baleniami majú dropdown. Ukladanie funguje
        len na localhoste.
      </p>
      {online === false && (
        <p className="mt-3 text-sm font-semibold text-red-600 bg-red-50 rounded-lg p-3">
          Zapisovač cien nebeží — spusti dev server cez <code>npm run dev</code>{" "}
          (alebo <code>npm run ceny-admin</code>). Prezerať môžeš, uložiť nie.
        </p>
      )}

      {/* Štatistiky objednávok */}
      {stats && (
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white border border-zinc-200 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500 font-bold">Objednávok</div>
            <div className="mt-1 text-2xl font-extrabold text-[#0e1a3b]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {stats.objednavok}
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-zinc-200 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500 font-bold">Tržba spolu</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-700" style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt.format(stats.trzbaSpolu)} €
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-zinc-200 p-4 col-span-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500 font-bold">Top produkty (ks)</div>
            <div className="mt-1 text-sm font-semibold text-[#0e1a3b] truncate">
              {stats.produkty.length === 0
                ? "Zatiaľ žiadne objednávky"
                : [...stats.produkty]
                    .sort((a, b) => b.kusov - a.kusov)
                    .slice(0, 3)
                    .map((p) => `${p.sku} (${p.kusov})`)
                    .join(" · ")}
            </div>
          </div>
        </div>
      )}
      {stats && stats.posledne.length > 0 && (
        <details className="mt-3 rounded-2xl bg-white border border-zinc-200 p-4">
          <summary className="text-sm font-bold text-[#1a8cc4] cursor-pointer">
            Posledné objednávky ({stats.posledne.length})
          </summary>
          <ul className="mt-2 space-y-1 text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
            {stats.posledne.map((o) => (
              <li key={o.id} className="flex flex-wrap gap-x-3 text-zinc-600">
                <span className="font-mono text-xs text-zinc-400">{o.id}</span>
                <span>{new Date(o.kedy).toLocaleString("sk-SK")}</span>
                <span className="font-semibold text-zinc-900">{o.meno}</span>
                <span>{o.kusov} ks</span>
                <span className="font-bold">{fmt.format(o.suma)} €</span>
                <span className="text-zinc-400">{o.platba}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Výrobca */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 mr-1">Výrobca:</span>
        <button type="button" onClick={() => setVyrobca(null)} className={chip(vyrobca === null)}>
          Všetci ({MATERIALY.length})
        </button>
        {VYROBCOVIA.map((v) => (
          <button key={v} type="button" onClick={() => setVyrobca(vyrobca === v ? null : v)} className={`${chip(vyrobca === v)} inline-flex items-center gap-1.5`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={VYROBCA_LOGO[v]} alt="" className={`h-4 w-auto ${vyrobca === v ? "brightness-0 invert" : ""}`} />
            {v} ({vyrobcaCounts.get(v) ?? 0})
          </button>
        ))}
      </div>

      {/* Typ produktu */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 mr-1">Typ:</span>
        <button type="button" onClick={() => setObsah(null)} className={chip(obsah === null)}>
          Všetko
        </button>
        {OBSAH_KATEGORIE.filter((k) => (obsahCounts.get(k.id) ?? 0) > 0).map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setObsah(obsah === k.id ? null : k.id)}
            className={chip(obsah === k.id)}
          >
            {k.label} ({obsahCounts.get(k.id)})
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hľadaj názov alebo SKU"
            className="block w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-zinc-200 bg-white text-sm focus:outline-none focus:border-[#3db6e8]"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            checked={lenOverride}
            onChange={(e) => setLenOverride(e.target.checked)}
            className="w-4 h-4 accent-[#3db6e8]"
          />
          Len ručné ceny ({Object.keys(overrides).length})
        </label>
        <button
          type="button"
          onClick={uloz}
          disabled={zmeny.length === 0 || online === false}
          className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Save className="w-4 h-4" aria-hidden />
          Uložiť ({zmeny.length})
        </button>
      </div>
      {stav && (
        <p className="mt-3 text-sm font-semibold text-[#0e1a3b] bg-[#e3f3fb] rounded-lg p-3">
          {stav}
        </p>
      )}

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-white overflow-x-auto">
        <table className="w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 border-b-2 border-zinc-100">
              <th className="px-4 py-3 whitespace-nowrap">Produkt</th>
              <th className="px-4 py-3 whitespace-nowrap">Balenie</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Objednané</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Nákup s/bez DPH</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Predaj</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Marža / ks</th>
              <th className="px-4 py-3 text-right w-40 whitespace-nowrap">Nová cena (€)</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {skupiny.map(([key, varianty]) => {
              const m =
                varianty.find((v) => v.sku === variant[key]) ?? varianty[0];
              const jeOverride = overrides[m.sku] != null;
              const draft = drafts[m.sku];
              const nakupS = nakupSDph(m.sku);
              const nakupBez = nakupS != null ? nakupS / 1.23 : null;
              const zisk = nakupS != null ? m.cena_eur_s_dph - nakupS : null;
              const zakladNazov = m.nazov.replace(/\s*\([^)]*\)/g, "").trim();
              return (
                <tr key={key} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-2">
                    <div className="font-semibold text-zinc-900">
                      {varianty.length > 1 ? zakladNazov : m.nazov}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <span className="font-mono">{m.sku}</span>
                      <span>·</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={VYROBCA_LOGO[m.vyrobca]} alt="" className="h-3.5 w-auto" />
                      <span>{m.vyrobca}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {varianty.length > 1 ? (
                      <select
                        value={m.sku}
                        onChange={(e) => setVariant((s) => ({ ...s, [key]: e.target.value }))}
                        aria-label={`Balenie pre ${zakladNazov}`}
                        className="px-2.5 py-1.5 rounded-lg border border-[#3db6e8]/60 bg-[#e3f3fb]/40 text-sm font-semibold text-[#0e1a3b] focus:outline-none focus:border-[#3db6e8] cursor-pointer"
                      >
                        {varianty.map((v) => (
                          <option key={v.sku} value={v.sku}>
                            {variantLabel(v)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-zinc-500">{m.balenie}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {kusyPerSku.get(m.sku) ? (
                      <span className="font-bold text-emerald-700">{kusyPerSku.get(m.sku)} ks</span>
                    ) : (
                      <span className="text-zinc-300">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {nakupS != null ? (
                      <>
                        <span className="font-semibold text-zinc-700">{fmt.format(nakupS)} €</span>
                        <span className="block text-xs text-zinc-400">{fmt.format(nakupBez!)} € bez DPH</span>
                      </>
                    ) : (
                      <span className="text-zinc-300" title="Fixná cena z CRM — nákupku nepoznáme">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <span className="font-bold">{fmt.format(m.cena_eur_s_dph)} €</span>
                    {jeOverride && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
                        ručná
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {zisk != null ? (
                      <>
                        <span className={`font-extrabold ${zisk >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {zisk >= 0 ? "+" : ""}{fmt.format(zisk)} €
                        </span>
                        <span className="block text-xs text-zinc-400">
                          {fmt.format((zisk / m.cena_eur_s_dph) * 100)} % z predaja
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draft ?? ""}
                      placeholder={jeOverride ? fmt.format(overrides[m.sku]) : "—"}
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [m.sku]: e.target.value }))
                      }
                      aria-label={`Nová cena pre ${m.nazov}`}
                      className="w-28 px-3 py-1.5 rounded-lg border border-zinc-300 text-right focus:outline-none focus:border-[#3db6e8] focus:ring-1 focus:ring-[#3db6e8]"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {jeOverride && (
                      <button
                        type="button"
                        title="Zrušiť ručnú cenu (vráti cenu z CRM)"
                        aria-label={`Zrušiť ručnú cenu pre ${m.nazov}`}
                        onClick={() => setDrafts((d) => ({ ...d, [m.sku]: "" }))}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {draft === "" ? <RotateCcw className="w-4 h-4" aria-hidden /> : <X className="w-4 h-4" aria-hidden />}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        {zoznam.length} z {MATERIALY.length} produktov v {skupiny.length} riadkoch
        · ručných cien: {Object.keys(overrides).length}
        · Marža = predaj − nákup s DPH (DPH z nákupu je náklad, sme neplatiteľ; pred daňou z príjmu)
      </p>
    </Container>
  );
}
