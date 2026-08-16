"use client";

import * as React from "react";
import { Search, Save, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductVisual } from "@/components/eshop/ProductVisual";
import { MATERIALY, VYROBCOVIA, CENA_Z_IMPORTU, type Vyrobca, type Material } from "@/lib/materialy";
import { OBSAH_KATEGORIE, SKUPINY, obsahKategoria, obsahLabel, skupinaPreObsah } from "@/lib/obsah-kategorie";
import { VYROBCA_LOGO } from "@/lib/vyrobca-logo";
import cenyOverride from "@/content/ceny-override.json";

/**
 * Admin editor cien — rovnaký layout ako verejný katalóg (/eshop):
 * sidebar výrobcov s logami, horné chips kategórií, karty s fotkou.
 * Pod fotkou má každá karta nákup s/bez DPH, maržu, objednané kusy
 * a pole na novú cenu. Varianty balení jeden dropdown na karte.
 *
 * Ukladanie cez lokálny zapisovač (scripts/ceny-admin.mjs, port 8798) —
 * funguje len na localhoste, do produkcie ide commit ceny-override.json.
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

/** Nákup s DPH z importnej ceny (vzorec ÷0,735); null = fixná cena z CRM. */
function nakupSDph(sku: string): number | null {
  const zaklad = CENA_Z_IMPORTU[sku];
  if (!zaklad || zaklad.pevna) return null;
  return Math.round(zaklad.cena * 0.735 * 100) / 100;
}

export function CenyAdminClient() {
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [query, setQuery] = React.useState("");
  const [vyrobca, setVyrobca] = React.useState<Vyrobca | null>(null);
  const [skupina, setSkupina] = React.useState<string | null>(null);
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
      const kat = obsahKategoria(m);
      if (obsah && kat !== obsah) return false;
      if (!obsah && skupina && skupinaPreObsah(kat) !== skupina) return false;
      if (lenOverride && overrides[m.sku] == null && drafts[m.sku] == null) return false;
      if (!q) return true;
      return `${m.nazov} ${m.sku}`.toLowerCase().includes(q);
    });
  }, [query, vyrobca, skupina, obsah, lenOverride, drafts, overrides]);

  /** Zlúč varianty balení — po filtroch, najväčšie balenie default. */
  const skupiny = React.useMemo(() => {
    const g = new Map<string, Material[]>();
    for (const m of zoznam) {
      const k = skupinaKey(m);
      const arr = g.get(k);
      if (arr) arr.push(m);
      else g.set(k, [m]);
    }
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

  const chipCls = (active: boolean) =>
    `px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors border-2 ${
      active
        ? "bg-[#3db6e8] border-[#3db6e8] text-white"
        : "bg-white border-zinc-200 text-zinc-700 hover:border-[#3db6e8] hover:text-[#3db6e8]"
    }`;

  const sideCls = (active: boolean) =>
    `w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between gap-2 ${
      active
        ? "bg-[#3db6e8] text-white"
        : "text-zinc-700 hover:bg-white hover:text-[#1a8cc4]"
    }`;

  return (
    <Container size="xl" className="py-8 md:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0e1a3b]">
        🛠 Admin — ceny e-shopu
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 max-w-2xl">
        Nová cena = ručný override, prebije CRM import. Prázdne pole override
        zruší. Ukladanie funguje len na localhoste.
      </p>
      {online === false && (
        <p className="mt-3 text-sm font-semibold text-red-600 bg-red-50 rounded-lg p-3">
          Zapisovač cien nebeží — spusti dev server cez <code>npm run dev</code>.
          Prezerať môžeš, uložiť nie.
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

      {/* Search — v strede ako na eshope */}
      <div className="relative max-w-xl mx-auto mt-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hľadaj názov alebo SKU"
          aria-label="Vyhľadať materiál"
          className="block w-full pl-12 pr-4 py-3 rounded-full border-2 border-zinc-200 bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] focus:ring-2 focus:ring-[#3db6e8]/30"
        />
      </div>

      {/* Skupiny podľa skladby podlahy */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => { setSkupina(null); setObsah(null); }}
          className={chipCls(skupina === null)}
        >
          Všetko
        </button>
        {SKUPINY.map((sk, i) => {
          const count = sk.deti.reduce((n, d) => n + (obsahCounts.get(d) ?? 0), 0);
          if (count === 0) return null;
          return (
            <button
              key={sk.id}
              type="button"
              onClick={() => {
                setObsah(null);
                setSkupina(skupina === sk.id ? null : sk.id);
              }}
              className={chipCls(skupina === sk.id)}
            >
              {i + 1 <= 5 ? `${i + 1}. ` : ""}{sk.label} ({count})
            </button>
          );
        })}
      </div>
      {skupina && (SKUPINY.find((sk) => sk.id === skupina)?.deti.length ?? 0) > 1 && (
        <div className="mt-2.5 flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-[#e3f3fb] px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#1a6e9c] mr-1">
              ↳ {SKUPINY.find((sk) => sk.id === skupina)!.label}:
            </span>
            {SKUPINY.find((sk) => sk.id === skupina)!.deti
              .filter((d) => (obsahCounts.get(d) ?? 0) > 0)
              .map((d) => {
                const k = OBSAH_KATEGORIE.find((x) => x.id === d)!;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setObsah(obsah === d ? null : d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      obsah === d
                        ? "bg-[#1a8cc4] text-white"
                        : "bg-white text-[#1a6e9c] hover:bg-[#d3ecf9]"
                    }`}
                  >
                    {k.label} ({obsahCounts.get(d)})
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Admin lišta: ručné ceny + uložiť */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
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
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea580c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          <Save className="w-4 h-4" aria-hidden />
          Uložiť ({zmeny.length})
        </button>
      </div>
      {stav && (
        <p className="mt-3 max-w-2xl mx-auto text-sm font-semibold text-[#0e1a3b] bg-[#e3f3fb] rounded-lg p-3">
          {stav}
        </p>
      )}

      {/* Sidebar výrobcov + grid kariet — ako /eshop */}
      <div className="mt-6 lg:grid lg:grid-cols-[235px_1fr] lg:gap-6 lg:items-start">
        <aside className="hidden lg:block sticky top-24 rounded-2xl bg-[#f2f2ef] p-3">
          <div className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
            Výrobca
          </div>
          <nav className="space-y-1" aria-label="Filter podľa výrobcu">
            <button type="button" onClick={() => setVyrobca(null)} className={sideCls(vyrobca === null)}>
              <span>Všetci</span>
              <span className="text-xs opacity-70 tabular-nums">{MATERIALY.length}</span>
            </button>
            {VYROBCOVIA.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVyrobca(vyrobca === v ? null : v)}
                className={sideCls(vyrobca === v)}
              >
                <span className="inline-flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={VYROBCA_LOGO[v]} alt="" className={`h-6 w-14 object-contain object-left ${vyrobca === v ? "brightness-0 invert" : ""}`} />
                  {v}
                </span>
                <span className="text-xs opacity-70 tabular-nums">{vyrobcaCounts.get(v) ?? 0}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {/* mobil chips výrobcov */}
          <div className="lg:hidden flex flex-wrap items-center justify-center gap-2 mb-4">
            <button type="button" onClick={() => setVyrobca(null)} className={chipCls(vyrobca === null)}>
              Všetci výrobcovia
            </button>
            {VYROBCOVIA.map((v) => (
              <button key={v} type="button" onClick={() => setVyrobca(vyrobca === v ? null : v)} className={`${chipCls(vyrobca === v)} inline-flex items-center gap-1.5`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VYROBCA_LOGO[v]} alt="" className={`h-5 w-auto max-w-20 object-contain ${vyrobca === v ? "brightness-0 invert" : ""}`} />
                {v}
              </button>
            ))}
          </div>

          <p className="text-center lg:text-left text-sm text-zinc-500">
            {zoznam.length} z {MATERIALY.length} produktov v {skupiny.length} kartách
            · marža = predaj − nákup s DPH (pred daňou z príjmu)
          </p>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {skupiny.map(([key, varianty]) => {
              const m = varianty.find((v) => v.sku === variant[key]) ?? varianty[0];
              const jeOverride = overrides[m.sku] != null;
              const draft = drafts[m.sku];
              const nakupS = nakupSDph(m.sku);
              const nakupBez = nakupS != null ? nakupS / 1.23 : null;
              const marza = nakupS != null ? m.cena_eur_s_dph - nakupS : null;
              const kusov = kusyPerSku.get(m.sku) ?? 0;
              const zakladNazov = m.nazov.replace(/\s*\([^)]*\)/g, "").trim();
              return (
                <article
                  key={key}
                  className="rounded-2xl border border-zinc-200 bg-white overflow-hidden flex flex-col"
                >
                  <div className="relative">
                    <ProductVisual material={m} variant="card" />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 shadow text-[#0e1a3b] text-[10px] font-bold uppercase tracking-wide">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={VYROBCA_LOGO[m.vyrobca]} alt="" className="h-4 w-auto max-w-14 object-contain" />
                      {m.vyrobca}
                    </span>
                    {jeOverride && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-[#0e1a3b] text-[10px] font-bold uppercase shadow">
                        ručná
                      </span>
                    )}
                    {kusov > 0 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow">
                        {kusov} ks predané
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-[#3db6e8]">
                      {obsahLabel(obsahKategoria(m))}
                    </div>
                    <h2 className="mt-0.5 text-[13px] md:text-sm font-bold text-zinc-900 leading-snug line-clamp-2">
                      {varianty.length > 1 ? zakladNazov : m.nazov}
                    </h2>

                    {varianty.length > 1 ? (
                      <select
                        value={m.sku}
                        onChange={(e) => setVariant((s) => ({ ...s, [key]: e.target.value }))}
                        aria-label={`Balenie pre ${zakladNazov}`}
                        className="mt-1.5 w-full px-2.5 py-1.5 rounded-lg border border-[#3db6e8]/60 bg-[#e3f3fb]/40 text-xs font-semibold text-[#0e1a3b] focus:outline-none focus:border-[#3db6e8] cursor-pointer"
                      >
                        {varianty.map((v) => (
                          <option key={v.sku} value={v.sku}>
                            {variantLabel(v)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-0.5 text-[11px] text-zinc-500">{m.balenie}</div>
                    )}

                    {/* Ceny a marža */}
                    <div className="mt-2 space-y-0.5 text-[12px] leading-snug">
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">Nákup s DPH</span>
                        <span className="font-semibold text-zinc-700">
                          {nakupS != null ? `${fmt.format(nakupS)} €` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-400">bez DPH</span>
                        <span className="text-zinc-500">
                          {nakupBez != null ? `${fmt.format(nakupBez)} €` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">Predaj</span>
                        <span className="font-extrabold text-zinc-900">{fmt.format(m.cena_eur_s_dph)} €</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-zinc-500">Marža</span>
                        <span className={`font-extrabold whitespace-nowrap ${marza == null ? "text-zinc-300" : marza >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {marza != null
                            ? `${marza >= 0 ? "+" : ""}${fmt.format(marza)} € · ${(Math.round((marza / m.cena_eur_s_dph) * 1000) / 10).toFixed(1).replace(".", ",")} %`
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Nová cena */}
                    <div className="mt-auto pt-2.5 flex items-center gap-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={draft ?? ""}
                        placeholder={jeOverride ? fmt.format(overrides[m.sku]) : "nová cena €"}
                        onChange={(e) => setDrafts((d) => ({ ...d, [m.sku]: e.target.value }))}
                        aria-label={`Nová cena pre ${m.nazov}`}
                        className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-right text-sm focus:outline-none focus:border-[#3db6e8] focus:ring-1 focus:ring-[#3db6e8]"
                      />
                      {jeOverride && (
                        <button
                          type="button"
                          title="Zrušiť ručnú cenu (vráti cenu z CRM)"
                          aria-label={`Zrušiť ručnú cenu pre ${m.nazov}`}
                          onClick={() => setDrafts((d) => ({ ...d, [m.sku]: "" }))}
                          className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </Container>
  );
}
