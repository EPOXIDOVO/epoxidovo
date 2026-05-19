"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Initial preloader — zobrazí sa pri prvej návšteve webu na ~800ms.
 * Pri ďalších navigáciách (client-side) sa nezobrazí.
 * Page transitions už handluje Next.js loading.tsx.
 */
export function InitialPreloader() {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    // Hide po krátkom čase + po DOM ready
    const t = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Načítavam"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1f3a8a] animate-fade-out"
      style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
    >
      <style>{`
        @keyframes fade-out {
          to { opacity: 0; visibility: hidden; }
        }
        .animate-fade-out { animation: fade-out 200ms ease-out; }
      `}</style>

      <div className="relative w-44 h-44 md:w-56 md:h-56 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/80 border-r-white/40 animate-[spin_2s_linear_infinite]"
          aria-hidden
        />
        <div
          className="absolute inset-3 rounded-full border-2 border-transparent border-t-white/40 border-l-white/70"
          style={{ animation: "spin 3s linear infinite reverse" }}
          aria-hidden
        />
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center">
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
