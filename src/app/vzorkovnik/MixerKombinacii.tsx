"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Sparkles, X } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { TOPSTONE_METALIK } from "@/content/topstone-metalik";

/**
 * Miešačka metalických efektov — user 2026-08-25: „urob tu taky nejaky tool
 * ze si pridas dve alebo tri vzorkovniky a vyjde ti nova proste kombinacia
 * tychto charcoal a azuro".
 *
 * Vyberieš 2–3 odtiene, server ich pošle Gemini spolu s NAŠIMI reálnymi
 * vzorkami ako referenciou, takže výsledok vychádza zo skutočných pigmentov.
 */
export function MixerKombinacii() {
  const [vybrane, setVybrane] = React.useState<string[]>([]);
  const [token, setToken] = React.useState<string | null>(null);
  const [bezi, setBezi] = React.useState(false);
  const [vysledok, setVysledok] = React.useState<{ src: string; nazov: string } | null>(null);
  const [chyba, setChyba] = React.useState<string | null>(null);

  const prepni = (id: string) => {
    setChyba(null);
    setVybrane((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id],
    );
  };

  const generuj = async () => {
    if (vybrane.length < 2 || !token) return;
    setBezi(true);
    setChyba(null);
    setVysledok(null);
    try {
      const r = await fetch("/api/vzorkovnik/kombinacia", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slugy: vybrane, turnstileToken: token }),
      });
      const d = await r.json();
      if (!d.ok) {
        setChyba(d.message ?? "Nepodarilo sa namiešať vzorku. Skús to znovu.");
        return;
      }
      setVysledok({ src: `data:${d.mimeType};base64,${d.imageBase64}`, nazov: d.nazov });
    } catch {
      setChyba("Nepodarilo sa spojiť so serverom.");
    } finally {
      setBezi(false);
      setToken(null);
    }
  };

  return (
    <section className="mb-8 rounded-2xl bg-[#f4f5f7] p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
        Namiešaj si vlastnú kombináciu
      </h2>
      <p className="mt-1 text-sm text-[#1B2430]/65">
        Vyber 2 alebo 3 odtiene a AI ti podľa našich reálnych vzoriek ukáže, ako
        by vyzerali zliate do jednej podlahy.
      </p>

      <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-2">
        {TOPSTONE_METALIK.map((e) => {
          const zvoleny = vybrane.includes(e.id);
          const plno = vybrane.length >= 3 && !zvoleny;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => prepni(e.id)}
              disabled={plno}
              aria-pressed={zvoleny}
              className={`group relative overflow-hidden rounded-lg ring-2 transition-all ${
                zvoleny
                  ? "ring-[#3db6e8] shadow-[0_6px_18px_rgba(61,182,232,0.35)]"
                  : plno
                    ? "ring-transparent opacity-40 cursor-not-allowed"
                    : "ring-transparent hover:ring-[#3db6e8]/60 hover:-translate-y-0.5"
              }`}
            >
              <span className="relative block aspect-square">
                <Image src={e.src} alt={e.label} fill sizes="90px" className="object-cover" />
              </span>
              <span className="block px-1 py-1 text-[10px] font-bold leading-tight text-[#1B2430] truncate">
                {e.label}
              </span>
              {zvoleny && (
                <span className="absolute top-1 right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3db6e8] text-[10px] font-black text-white">
                  {vybrane.indexOf(e.id) + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {vybrane.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-[#1B2430]">Miešaš:</span>
          {vybrane.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => prepni(id)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-bold text-[#1B2430] ring-1 ring-[#1B2430]/10 transition-colors hover:bg-[#ffecec] hover:text-[#a4262c]"
            >
              {TOPSTONE_METALIK.find((e) => e.id === id)?.label}
              <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
        </div>
      )}

      {vybrane.length >= 2 && (
        <div className="mt-4">
          <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />
        </div>
      )}

      {chyba && (
        <p className="mt-3 rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-semibold text-[#a4262c]">
          {chyba}
        </p>
      )}

      <button
        type="button"
        onClick={generuj}
        disabled={vybrane.length < 2 || !token || bezi}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1B2430] px-6 py-3 font-extrabold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {bezi ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        {vybrane.length < 2 ? "Vyber aspoň 2 odtiene" : "Namiešať vzorku"}
      </button>

      {vysledok && (
        <figure className="mt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={vysledok.src}
            alt={`Kombinácia ${vysledok.nazov}`}
            className="w-full max-w-xl rounded-2xl ring-1 ring-[#1B2430]/10"
          />
          <figcaption className="mt-2 text-sm font-bold text-[#1B2430]">
            {vysledok.nazov}
            <span className="ml-2 font-semibold text-[#1B2430]/60">
              — AI ukážka, reálne liata plocha vyzerá vždy trochu inak
            </span>
          </figcaption>
        </figure>
      )}
    </section>
  );
}
