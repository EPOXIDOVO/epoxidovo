"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";

/**
 * Admin „jiggle" režim e-shopu (/eshop?admin=1) — ako podržanie ikony na
 * iPhone: bloky sa rozochvejú, vpravo hore majú mínus (skryť) a šípky
 * (poradie). Zmeny ukladá lokálny zapisovač (scripts/ceny-admin.mjs
 * POST /layout) do src/content/eshop-layout.json; do produkcie ide commit.
 */

const ADMIN_API = "http://localhost:8798";

export type Layout = {
  sekcie: string[];
  skryteSekcie: string[];
  dlazdice: string[];
  skryteDlazdice: string[];
};

export function useAdmin(): boolean {
  const [admin, setAdmin] = React.useState(false);
  React.useEffect(() => {
    setAdmin(new URLSearchParams(window.location.search).get("admin") === "1");
  }, []);
  return admin;
}

async function ulozLayout(novy: Layout) {
  try {
    const res = await fetch(`${ADMIN_API}/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novy),
    });
    const j = await res.json();
    if (!res.ok || !j.ok) throw new Error(j.message ?? "server odmietol");
    // dev server potrebuje chvíľu na prekompilovanie zmeneného JSON-u
    await new Promise((r) => setTimeout(r, 2000));
    window.location.reload();
  } catch (e) {
    alert(`Layout sa nepodarilo uložiť: ${e instanceof Error ? e.message : e}. Beží npm run dev?`);
  }
}

function posun<T>(arr: T[], item: T, smer: -1 | 1): T[] {
  const i = arr.indexOf(item);
  const j = i + smer;
  if (i < 0 || j < 0 || j >= arr.length) return arr;
  const kopia = [...arr];
  [kopia[i], kopia[j]] = [kopia[j], kopia[i]];
  return kopia;
}

const btnCls =
  "w-7 h-7 inline-flex items-center justify-center rounded-full bg-white text-[#0e1a3b] shadow-md border border-zinc-200 hover:bg-[#e3f3fb] transition-colors";

/** Obal sekcie — v admin režime wiggle + ovládanie ↑ ↓ −. */
export function SekciaObal({
  id,
  layout,
  children,
}: {
  id: string;
  layout: Layout;
  children: React.ReactNode;
}) {
  const admin = useAdmin();
  if (!admin) return <>{children}</>;
  return (
    <div className="relative admin-wiggle outline-2 outline-dashed outline-[#3db6e8]/50 outline-offset-[-2px]">
      <div className="absolute top-2 right-2 z-40 flex gap-1.5">
        <button type="button" title="Posunúť vyššie" aria-label={`Sekciu ${id} vyššie`} className={btnCls}
          onClick={() => ulozLayout({ ...layout, sekcie: posun(layout.sekcie, id, -1) })}>
          <ArrowUp className="w-4 h-4" aria-hidden />
        </button>
        <button type="button" title="Posunúť nižšie" aria-label={`Sekciu ${id} nižšie`} className={btnCls}
          onClick={() => ulozLayout({ ...layout, sekcie: posun(layout.sekcie, id, 1) })}>
          <ArrowDown className="w-4 h-4" aria-hidden />
        </button>
        <button type="button" title="Skryť sekciu" aria-label={`Skryť sekciu ${id}`}
          className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
          onClick={() => ulozLayout({ ...layout, skryteSekcie: [...layout.skryteSekcie, id] })}>
          <Minus className="w-4 h-4" aria-hidden />
        </button>
      </div>
      {children}
    </div>
  );
}

/** Obal dlaždice kategórie — v admin režime wiggle + ← → −. */
export function DlazdicaObal({
  id,
  layout,
  children,
}: {
  id: string;
  layout: Layout;
  children: React.ReactNode;
}) {
  const admin = useAdmin();
  if (!admin) return <>{children}</>;
  return (
    <div className="relative admin-wiggle">
      <div className="absolute -top-2 -right-2 z-40 flex gap-1">
        <button type="button" title="Doľava" aria-label={`Dlaždicu ${id} doľava`} className={btnCls}
          onClick={() => ulozLayout({ ...layout, dlazdice: posun(layout.dlazdice, id, -1) })}>
          <ArrowLeft className="w-4 h-4" aria-hidden />
        </button>
        <button type="button" title="Doprava" aria-label={`Dlaždicu ${id} doprava`} className={btnCls}
          onClick={() => ulozLayout({ ...layout, dlazdice: posun(layout.dlazdice, id, 1) })}>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
        <button type="button" title="Skryť dlaždicu" aria-label={`Skryť dlaždicu ${id}`}
          className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
          onClick={() => ulozLayout({ ...layout, skryteDlazdice: [...layout.skryteDlazdice, id] })}>
          <Minus className="w-4 h-4" aria-hidden />
        </button>
      </div>
      {children}
    </div>
  );
}

/** Plávajúci panel so skrytými blokmi — obnovenie plusom. */
export function AdminLayoutPanel({ layout }: { layout: Layout }) {
  const admin = useAdmin();
  if (!admin) return null;
  const nic = layout.skryteSekcie.length === 0 && layout.skryteDlazdice.length === 0;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[95] max-w-[92vw] rounded-2xl bg-[#0e1a3b] text-white shadow-2xl px-4 py-3 flex flex-wrap items-center gap-2 text-sm">
      <span className="font-bold whitespace-nowrap">🛠 Admin layout</span>
      {nic ? (
        <span className="text-white/60">— mínusom skryješ blok, šípkami meníš poradie. Zmeny na web pošle „pushni layout".</span>
      ) : (
        <>
          <span className="text-white/60">Skryté:</span>
          {layout.skryteSekcie.map((s) => (
            <button key={s} type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 font-semibold transition-colors"
              onClick={() => ulozLayout({ ...layout, skryteSekcie: layout.skryteSekcie.filter((x) => x !== s) })}>
              <Plus className="w-3.5 h-3.5" aria-hidden /> {s}
            </button>
          ))}
          {layout.skryteDlazdice.map((d) => (
            <button key={d} type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 font-semibold transition-colors"
              onClick={() => ulozLayout({ ...layout, skryteDlazdice: layout.skryteDlazdice.filter((x) => x !== d) })}>
              <Plus className="w-3.5 h-3.5" aria-hidden /> {d}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
