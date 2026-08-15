"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

/**
 * Easter egg — hlava maskota s bublinou „veľkoobchodné ceny".
 * Sedí vľavo dole (WhatsApp bublina má pravý roh), klik vedie na B2B
 * registráciu. Dá sa zavrieť; voľba drží v sessionStorage, nech neotravuje.
 */
export function MedvedB2B() {
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    if (sessionStorage.getItem("medved-b2b-zavrety") === "1") return;
    const t = setTimeout(() => setHidden(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-end gap-2 pointer-events-none">
      <Link
        href="/kupit-material/b2b"
        aria-label="Veľkoobchodné ceny pre firmy — registrácia"
        className="pointer-events-auto group flex items-end gap-2 focus:outline-none"
      >
        <span className="relative block w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.3)] ring-2 ring-white group-hover:scale-105 transition-transform duration-300">
          <Image
            src="/images/eshop/medved-hlava.png"
            alt=""
            fill
            sizes="64px"
            quality={85}
            className="object-contain"
          />
        </span>
        <span className="relative mb-6 max-w-[190px] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] border border-zinc-200 text-[13px] leading-snug text-[#0e1a3b] group-hover:border-[#3db6e8] transition-colors">
          <strong className="font-extrabold">Firma? Kupuješ viac?</strong>
          <br />
          <span className="text-[#1a8cc4] font-bold underline underline-offset-2">
            Vybav si veľkoobchodné ceny
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem("medved-b2b-zavrety", "1");
          setHidden(true);
        }}
        aria-label="Zavrieť bublinu"
        className="pointer-events-auto -ml-1 mb-16 w-6 h-6 inline-flex items-center justify-center rounded-full bg-white/90 border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-white shadow transition-colors"
      >
        <X className="w-3.5 h-3.5" aria-hidden />
      </button>
    </div>
  );
}
