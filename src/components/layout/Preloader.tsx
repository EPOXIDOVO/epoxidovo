import * as React from "react";
import Image from "next/image";

interface PreloaderProps {
  /** Fullscreen overlay (default true). False = inline (pre Loading.tsx route transition) */
  overlay?: boolean;
}

/**
 * Preloader — Macko logo v strede + 2 rotujúce kruhy okolo.
 * Inšpirované pôvodným epoxidovo.sk webom (preloader.png).
 *
 * Použitie:
 *  - <Preloader /> ako fullscreen overlay (initial page load)
 *  - app/loading.tsx auto-render pri route transition
 */
export function Preloader({ overlay = true }: PreloaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Načítavam"
      className={
        overlay
          ? "fixed inset-0 z-[200] flex items-center justify-center bg-[#1f3a8a]"
          : "min-h-[60vh] flex items-center justify-center bg-[#1f3a8a]"
      }
    >
      {/* Subtle blurred maskot v pozadí */}
      <div className="absolute inset-0 overflow-hidden opacity-25">
        <Image
          src="/images/site/hero_bg.jpg"
          alt=""
          fill
          priority
          className="object-cover blur-2xl scale-110"
        />
      </div>

      <div className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center">
        {/* Vonkajší rotujúci kruh */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/80 border-r-white/40 animate-[spin_2s_linear_infinite]"
          aria-hidden
        />
        {/* Vnútorný rotujúci kruh (opačne, pomalšie) */}
        <div
          className="absolute inset-3 rounded-full border-2 border-transparent border-t-white/40 border-l-white/70 animate-[spin_3s_linear_infinite_reverse]"
          aria-hidden
        />

        {/* Macko logo v strede */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center">
          <Image
            src="/images/site/logo_v2.png"
            alt="EPOXIDOVO"
            width={120}
            height={120}
            priority
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <span className="sr-only">Načítavam…</span>
    </div>
  );
}
