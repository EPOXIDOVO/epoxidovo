import * as React from "react";

/**
 * „Ešte treba: …" — hláška pod zamknutým odosielacím tlačidlom.
 *
 * PREČO: disabled tlačidlo nič nepovie. Človek doplní meno, tlačidlo je
 * stále šedé a on netuší, že mu chýba súhlas alebo že validácia chce
 * aj priezvisko — a odíde. Preto každý zámok pomenujeme nahlas.
 *
 * Zoznam skladaj v poradí polí vo formulári, nech oko ide zhora nadol.
 */
export function ChybajuceUdaje({
  polozky,
  className = "",
  tmava = false,
}: {
  polozky: string[];
  className?: string;
  /** Pre tmavé landingy — na tmavom pozadí je zinc-500 nečitateľný. */
  tmava?: boolean;
}) {
  if (polozky.length === 0) return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-xs leading-relaxed ${
        tmava ? "text-white/70" : "text-zinc-500"
      } ${className}`}
    >
      <span className={tmava ? "font-bold text-white/90" : "font-bold text-zinc-700"}>
        Ešte treba:
      </span>{" "}
      {polozky.join(", ")}.
    </p>
  );
}
