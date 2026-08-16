"use client";

import * as React from "react";

/**
 * Rotujúce recenzie v sekcii dôvery — striedajú sa každých 6 sekúnd,
 * bodky pod textom sa dajú preklikať. Pri prejdení myšou sa rotácia
 * zastaví, nech sa dá dočítať; reduced-motion vypne prelínanie.
 */

export type Recenzia = { text: string; name: string; location?: string };

const INTERVAL = 6000;

export function RecenzieRotator({ recenzie }: { recenzie: Recenzia[] }) {
  const [i, setI] = React.useState(0);
  const [pauza, setPauza] = React.useState(false);

  React.useEffect(() => {
    if (pauza || recenzie.length < 2) return;
    const t = window.setInterval(
      () => setI((n) => (n + 1) % recenzie.length),
      INTERVAL,
    );
    return () => window.clearInterval(t);
  }, [pauza, recenzie.length]);

  const r = recenzie[i];

  return (
    <div
      className="flex flex-col justify-center h-full"
      onMouseEnter={() => setPauza(true)}
      onMouseLeave={() => setPauza(false)}
    >
      <div className="text-[15px] font-bold text-[#1a8cc4]">Najnovšie recenzie</div>
      {/* pevná výška = žiadne poskakovanie panelu pri prepnutí */}
      <div className="mt-2 min-h-[104px]" aria-live="polite">
        <p key={i} className="text-[15px] text-zinc-600 leading-relaxed line-clamp-4 motion-safe:animate-[fadeIn_400ms_ease-out]">
          {r.text}
        </p>
        <div className="mt-2 text-[13px] text-zinc-400">
          {r.name}
          {r.location ? ` · ${r.location}` : ""}
        </div>
      </div>
      {recenzie.length > 1 && (
        <div className="mt-3 flex gap-1.5">
          {recenzie.map((_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Recenzia ${n + 1}`}
              aria-current={n === i}
              className={`h-2 rounded-full transition-all ${
                n === i ? "w-5 bg-[#3db6e8]" : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
