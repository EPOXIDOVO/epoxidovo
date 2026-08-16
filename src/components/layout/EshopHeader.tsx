"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ShoppingCart, Building2 } from "lucide-react";

/**
 * Obchodná hlavička pre /eshop a /kupit-material — ako Epodex/GymBeam:
 * tenký pruh (telefón, email, link na realizačnú časť webu), logo + search
 * + košík s počtom. Servisné CTA hlavného webu (Cenová ponuka, AI...)
 * tu zámerne NIE SÚ — na obchode sa nakupuje.
 *
 * Počet v košíku čítame priamo z localStorage (hlavička je nad
 * CartProviderom v strome) + počúvame storage/cart eventy.
 */

const STORAGE_KEY = "epoxidovo-kosik-v1";

function precitajPocet(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { items?: { qty?: number }[] } | { qty?: number }[];
    const items = Array.isArray(parsed) ? parsed : (parsed.items ?? []);
    return items.reduce((n, i) => n + (typeof i?.qty === "number" ? i.qty : 0), 0);
  } catch {
    return 0;
  }
}

export function EshopHeader() {
  const [pocet, setPocet] = React.useState(0);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    const obnov = () => setPocet(precitajPocet());
    obnov();
    window.addEventListener("storage", obnov);
    // vlastný event z cart.tsx nemáme — polling raz za 1,5 s je dosť
    const t = window.setInterval(obnov, 1500);
    return () => {
      window.removeEventListener("storage", obnov);
      window.clearInterval(t);
    };
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      {/* logo + search + košík */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 md:gap-8">
        <Link href="/eshop" aria-label="E-shop EPOXIDOVO" className="shrink-0">
          <span className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0e1a3b] whitespace-nowrap">
            EPOXID<span className="text-[#3db6e8]">OVO</span>.SK
          </span>
        </Link>

        <form
          action="/eshop"
          className="flex-1 relative"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/eshop?q=${encodeURIComponent(q)}#katalog`;
          }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hľadaj v obchode — napr. „264“ alebo „piesok“"
            aria-label="Hľadať v obchode"
            className="w-full pl-11 pr-4 py-2.5 rounded-full border-2 border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] focus:bg-white transition-colors"
          />
        </form>

        <div className="shrink-0 flex items-center gap-2">
          <Link
            href="/kupit-material/b2b"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors whitespace-nowrap"
          >
            <Building2 className="w-4 h-4" aria-hidden />
            B2B účet
          </Link>
          <Link
            href="/kupit-material/kosik"
            aria-label={`Košík, ${pocet} položiek`}
            className="relative inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#0e1a3b] text-white hover:bg-[#1a8cc4] transition-colors"
          >
            <ShoppingCart className="w-5 h-5" aria-hidden />
            {pocet > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full bg-[#f97316] text-white text-[11px] font-bold tabular-nums">
                {pocet}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
