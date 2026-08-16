"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductVisual } from "@/components/eshop/ProductVisual";
import { MATERIALY, VYROBCOVIA, type Vyrobca, type Material } from "@/lib/materialy";
import { OBSAH_KATEGORIE, SKUPINY, obsahKategoria, skupinaPreObsah, skupinaPopis, normalize } from "@/lib/obsah-kategorie";
import { VYROBCA_LOGO } from "@/lib/vyrobca-logo";

/**
 * Katalóg materiálov — vľavo stĺpec Dodávateľ, hore obsahové kategórie
 * odvodené z názvov (surová `kategoria` má len 5 hodnôt a Doplnok je vrece
 * so 137 položkami — pre zákazníka delíme jemnejšie).
 * Search matchuje názov AJ SKU — ľudia hľadajú „264", nie celý názov.
 * 352 položiek → filtrovanie čisto client-side, žiadny server round-trip.
 */

/** Čo produktu chýba na dorobenie (admin pohľad, ?admin=1). */
function chybaZoznam(m: Material): string[] {
  const chyba: string[] = [];
  if (!m.foto) chyba.push("fotka");
  if (!m.cena_eur_s_dph || m.cena_eur_s_dph <= 0) chyba.push("cena");
  if (m.spotreba_kg_m2 == null && m.kategoria !== "Doplnok") chyba.push("spotreba");
  if (!m.technicky_list) chyba.push("tech. list");
  return chyba;
}

type AdminFilter = "vsetko-chyba" | "fotka" | "cena" | "spotreba" | "tech. list" | null;

export function EshopClient() {
  const [skupina, setSkupina] = React.useState<string | null>(null);
  const [obsah, setObsah] = React.useState<string | null>(null);
  const [vyrobca, setVyrobca] = React.useState<Vyrobca | null>(null);
  const [query, setQuery] = React.useState("");
  const [admin, setAdmin] = React.useState(false);
  const [adminFilter, setAdminFilter] = React.useState<AdminFilter>(null);

  // Admin režim cez ?admin=1 (statický export — čítame location, nie useSearchParams)
  React.useEffect(() => {
    setAdmin(new URLSearchParams(window.location.search).get("admin") === "1");
  }, []);

  const filtered = React.useMemo(() => {
    const q = normalize(query.trim());
    const base = MATERIALY.filter((m) => {
      const kat = obsahKategoria(m);
      if (obsah && kat !== obsah) return false;
      if (!obsah && skupina && skupinaPreObsah(kat) !== skupina) return false;
      if (vyrobca && m.vyrobca !== vyrobca) return false;
      if (q) {
        const hay = normalize(`${m.nazov} ${m.sku}`);
        if (!hay.includes(q)) return false;
      }
      if (admin && adminFilter) {
        const ch = chybaZoznam(m);
        if (adminFilter === "vsetko-chyba" ? ch.length === 0 : !ch.includes(adminFilter)) return false;
      }
      return true;
    });
    if (admin && adminFilter) {
      return [...base].sort((a, b) => chybaZoznam(b).length - chybaZoznam(a).length);
    }
    return base;
  }, [obsah, skupina, vyrobca, query, admin, adminFilter]);

  const vyrobcaCounts = React.useMemo(() => {
    const c = new Map<Vyrobca, number>();
    for (const m of MATERIALY) c.set(m.vyrobca, (c.get(m.vyrobca) ?? 0) + 1);
    return c;
  }, []);

  const obsahCounts = React.useMemo(() => {
    const c = new Map<string, number>();
    for (const m of MATERIALY) {
      const k = obsahKategoria(m);
      c.set(k, (c.get(k) ?? 0) + 1);
    }
    return c;
  }, []);

  /** Kategórie zodpovedajúce hľadanému výrazu — ponúkame nad výsledkami. */
  const kategorieNavrhy = React.useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return [];
    const out: { id: string; label: string; skupinaId: string; obsahId: string | null }[] = [];
    for (const sk of SKUPINY) {
      if (normalize(sk.label).includes(q)) {
        out.push({ id: `sk-${sk.id}`, label: sk.label, skupinaId: sk.id, obsahId: null });
      }
    }
    for (const k of OBSAH_KATEGORIE) {
      if (k.id !== "ostatne" && normalize(k.label).includes(q)) {
        out.push({ id: k.id, label: k.label, skupinaId: skupinaPreObsah(k.id), obsahId: k.id });
      }
    }
    return out.slice(0, 5);
  }, [query]);

  const adminCounts = React.useMemo(() => {
    if (!admin) return null;
    const c = { "vsetko-chyba": 0, fotka: 0, cena: 0, spotreba: 0, "tech. list": 0 };
    for (const m of MATERIALY) {
      const ch = chybaZoznam(m);
      if (ch.length) c["vsetko-chyba"]++;
      for (const x of ch) c[x as keyof typeof c]++;
    }
    return c;
  }, [admin]);

  const chipCls = (active: boolean) =>
    `px-3.5 md:px-4 py-2 rounded-full text-[13px] md:text-sm font-semibold whitespace-nowrap transition-colors border-2 ${
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

      {/* Návrhy kategórií pri písaní — klik rozklikne skupinu aj podkategóriu */}
      {kategorieNavrhy.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-400">Kategórie:</span>
          {kategorieNavrhy.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                setSkupina(n.skupinaId);
                setObsah(n.obsahId);
                setQuery("");
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#e3f3fb] text-[#1a6e9c] hover:bg-[#1a8cc4] hover:text-white transition-colors"
            >
              📂 {n.label}
            </button>
          ))}
        </div>
      )}

      {/* Horné záložky — skupiny podľa skladby podlahy */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => { setSkupina(null); setObsah(null); }}
          className={chipCls(skupina === null)}
        >
          Všetko
        </button>
        {SKUPINY.map((sk, i) => (
          <button
            key={sk.id}
            type="button"
            onClick={() => {
              setObsah(null);
              setSkupina(skupina === sk.id ? null : sk.id);
            }}
            className={chipCls(skupina === sk.id)}
          >
            {i + 1 <= 5 ? `${i + 1}. ` : ""}{sk.label}
          </button>
        ))}
      </div>
      {/* Druhá úroveň — deti aktívnej skupiny (len ak ich je viac) */}
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
                    {k.label}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Popis zvolenej kategórie — pomôcka pre zákazníka aj SEO */}
      {(obsah || skupina) && (
        <p className="mt-4 max-w-3xl mx-auto text-center text-sm text-[#4a5478] leading-relaxed bg-white border border-zinc-200 rounded-2xl px-5 py-3.5">
          {obsah
            ? OBSAH_KATEGORIE.find((k) => k.id === obsah)?.popis
            : skupinaPopis(skupina!)}
        </p>
      )}

      {/* Admin filter „na dorobenie" — viditeľný len s ?admin=1 */}
      {admin && adminCounts && (
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-600">🛠 Admin:</span>
          {([
            ["vsetko-chyba", `Na dorobenie (${adminCounts["vsetko-chyba"]})`],
            ["fotka", `Chýba fotka (${adminCounts.fotka})`],
            ["cena", `Chýba cena (${adminCounts.cena})`],
            ["spotreba", `Chýba spotreba (${adminCounts.spotreba})`],
            ["tech. list", `Chýba tech. list (${adminCounts["tech. list"]})`],
          ] as [AdminFilter, string][]).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setAdminFilter(adminFilter === f ? null : f)}
              className={`px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors border-2 ${
                adminFilter === f
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white border-amber-300 text-amber-700 hover:border-amber-500 hover:bg-amber-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Ľavý stĺpec Výrobca + grid */}
      <div className="mt-6 lg:grid lg:grid-cols-[235px_1fr] lg:gap-6 lg:items-start">
        {/* Výrobca — desktop sticky stĺpec */}
        <aside className="hidden lg:block sticky top-24 rounded-2xl bg-[#f2f2ef] p-3">
          <div className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
            Výrobca
          </div>
          <nav className="space-y-1" aria-label="Filter podľa výrobcu">
            <button type="button" onClick={() => setVyrobca(null)} className={sideCls(vyrobca === null)}>
              <span>Všetci</span>
              <span className="text-xs opacity-70 tnum">{MATERIALY.length}</span>
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
                <span className="text-xs opacity-70 tnum">{vyrobcaCounts.get(v) ?? 0}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {/* Výrobca — mobil chips */}
          <div className="lg:hidden flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setVyrobca(null)} className={chipCls(vyrobca === null)}>
              Všetci výrobcovia
            </button>
            {VYROBCOVIA.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVyrobca(vyrobca === v ? null : v)}
                className={`${chipCls(vyrobca === v)} inline-flex items-center gap-1.5`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VYROBCA_LOGO[v]} alt="" className={`h-5 w-auto max-w-20 object-contain ${vyrobca === v ? "brightness-0 invert" : ""}`} />
                {v}
              </button>
            ))}
          </div>

          <p className="mt-4 lg:mt-0 text-center lg:text-left text-sm text-zinc-500">
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
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
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
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 shadow text-[#0e1a3b] text-[10px] md:text-[11px] font-bold uppercase tracking-wide">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={VYROBCA_LOGO[m.vyrobca]} alt="" className="h-4.5 w-auto max-w-16 object-contain" />
                        {m.vyrobca}
                      </span>
                      {admin && chybaZoznam(m).length > 0 && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold whitespace-nowrap shadow">
                          {chybaZoznam(m).join(" · ")}
                        </span>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wide text-[#3db6e8]">
                        {OBSAH_KATEGORIE.find((k) => k.id === obsahKategoria(m))?.label}
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
        </div>
      </div>
    </Container>
  );
}
