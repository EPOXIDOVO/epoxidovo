"use client";

import * as React from "react";
import { Search, Save, RotateCcw, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MATERIALY, VYROBCOVIA, type Vyrobca } from "@/lib/materialy";
import { OBSAH_KATEGORIE, obsahKategoria } from "@/lib/obsah-kategorie";
import cenyOverride from "@/content/ceny-override.json";

/**
 * Admin editor cien — upravuje src/content/ceny-override.json cez lokálny
 * zapisovač (scripts/ceny-admin.mjs, port 8798). Funguje len na localhoste;
 * v produkcii sa ceny menia commitom tohto súboru.
 *
 * Override prebije cenu z CRM importu a označí ju ako pevnú (cena_pevna).
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

export function CenyAdminClient() {
  // pôvodné ceny z importu (bez override) — na výpočet rozdielu a reset
  const povodne = React.useMemo(() => {
    const o = cenyOverride.ceny as Record<string, number>;
    return new Map(
      MATERIALY.map((m) => [
        m.sku,
        o[m.sku] != null ? null : m.cena_eur_s_dph, // null = pôvodnú nepoznáme (už len v CRM)
      ]),
    );
  }, []);

  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [query, setQuery] = React.useState("");
  const [vyrobca, setVyrobca] = React.useState<Vyrobca | null>(null);
  const [obsah, setObsah] = React.useState<string | null>(null);
  const [lenOverride, setLenOverride] = React.useState(false);
  const [online, setOnline] = React.useState<boolean | null>(null);
  const [stav, setStav] = React.useState<string | null>(null);

  const [stats, setStats] = React.useState<Stats | null>(null);

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

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors border-2 ${
      active
        ? "bg-[#3db6e8] border-[#3db6e8] text-white"
        : "bg-white border-zinc-200 text-zinc-700 hover:border-[#3db6e8] hover:text-[#3db6e8]"
    }`;

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
        delete nove[sku]; // prázdne pole = zruš override, platí cena z CRM
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

  return (
    <Container size="xl" className="py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0e1a3b]">
        🛠 Admin — ceny e-shopu
      </h1>
      <p className="mt-1.5 text-sm text-zinc-500 max-w-2xl">
        Zmena ceny tu vytvorí ručný override — prebije cenu z CRM importu a
        označí ju ako pevnú. Prázdne pole = override zrušiť (vráti sa cena z
        CRM). Ukladanie funguje len na localhoste.
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
          <button key={v} type="button" onClick={() => setVyrobca(vyrobca === v ? null : v)} className={chip(vyrobca === v)}>
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
              <th className="px-4 py-3">Produkt</th>
              <th className="px-4 py-3">Balenie</th>
              <th className="px-4 py-3">Výrobca</th>
              <th className="px-4 py-3 text-right">Objednané</th>
              <th className="px-4 py-3 text-right">Aktuálna cena</th>
              <th className="px-4 py-3 text-right w-44">Nová cena (€)</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {zoznam.map((m) => {
              const jeOverride = overrides[m.sku] != null;
              const draft = drafts[m.sku];
              return (
                <tr key={m.sku} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-2">
                    <div className="font-semibold text-zinc-900">{m.nazov}</div>
                    <div className="text-xs text-zinc-400 font-mono">{m.sku}</div>
                  </td>
                  <td className="px-4 py-2 text-zinc-500 whitespace-nowrap">{m.balenie}</td>
                  <td className="px-4 py-2 text-zinc-500">{m.vyrobca}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {kusyPerSku.get(m.sku) ? (
                      <span className="font-bold text-emerald-700">{kusyPerSku.get(m.sku)} ks</span>
                    ) : (
                      <span className="text-zinc-300">0</span>
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
                      className="w-32 px-3 py-1.5 rounded-lg border border-zinc-300 text-right focus:outline-none focus:border-[#3db6e8] focus:ring-1 focus:ring-[#3db6e8]"
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
        {zoznam.length} z {MATERIALY.length} produktov · ručných cien:{" "}
        {Object.keys(overrides).length}
      </p>
    </Container>
  );
}
