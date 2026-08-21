import Image from "next/image";
import { referencnaFotka, type Material } from "@/lib/materialy";

/**
 * Produktový vizuál e-shopu.
 *
 * Režimy:
 *  - foto_typ "sud"    → oficiálny packshot balenia, čisto na bielom (contain)
 *  - foto_typ "vzorka" → fotka vyliateho povrchu full-bleed; ak má produkt
 *                        aj foto_sud, reálny sud stojí ako inset vľavo dole
 *  - bez foto          → neutrálny placeholder ("Fotografiu pripravujeme") —
 *                        žiadne kreslené náhrady, reálne fotky dopĺňa user
 *
 * Zdroje fotiek + licencie sú pri produktoch v materialy.json
 * (foto_zdroj / foto_licencia) — viď docs/eshop-fotky.md.
 */
export function ProductVisual({
  material,
  variant,
}: {
  material: Material;
  variant: "card" | "detail";
}) {
  const m = material;
  const isCard = variant === "card";

  // Hover fotka na karte: vlastná foto_hover, dummy = realizačná fotka
  // podlahy pri hlavných vrstvách (kým si user nenahrá produktové hover fotky).
  const hoverSrc =
    isCard
      ? m.foto_hover ??
        (m.kategoria === "Hlavná vrstva" ? referencnaFotka(m)?.src ?? null : null)
      : null;

  if (m.foto) {
    // Packshot balenia (reálny sud/vrece na bielom pozadí) — čistý contain.
    if (m.foto_typ !== "vzorka") {
      return (
        <div
          className={`relative overflow-hidden bg-white ${isCard ? "aspect-[4/3]" : "aspect-[4/3] rounded-3xl border border-zinc-200"}`}
        >
          <Image
            src={m.foto}
            alt={m.nazov}
            fill
            sizes={isCard ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 50vw"}
            quality={85}
            className={`object-contain ${isCard ? "p-2" : "p-6"} ${hoverSrc ? "transition-opacity duration-300 group-hover:opacity-0" : ""}`}
          />
          {hoverSrc && (
            <Image
              src={hoverSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              quality={85}
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
      );
    }

    // Vzorka vyliateho povrchu full-bleed + reálny sud ako inset vľavo dole.
    return (
      <div
        className={`relative overflow-hidden ${isCard ? "aspect-[4/3]" : "aspect-[4/3] rounded-3xl"}`}
      >
        <Image
          src={m.foto}
          alt={m.nazov}
          fill
          sizes={isCard ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 50vw"}
          quality={85}
          className="object-cover"
        />
        {m.foto_sud && (
          <div
            className={`absolute rounded-xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] overflow-hidden ${
              isCard ? "bottom-1.5 left-1.5 w-[48%]" : "bottom-3 left-3 w-[38%]"
            }`}
          >
            <div className="relative aspect-square">
              <Image
                src={m.foto_sud}
                alt={`${m.nazov} — balenie`}
                fill
                sizes="25vw"
                quality={85}
                className="object-contain p-1"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Bez fotky — neutrálny obrys obalu s logom značky. Zákazníkovi to
  // nesmie vyzerať ako chyba, preto žiadne interné poznámky.
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 flex flex-col items-center justify-center gap-2 ${isCard ? "aspect-[4/3]" : "aspect-[4/3] rounded-3xl border border-zinc-200"}`}
    >
      <svg viewBox="0 0 48 56" aria-hidden className="w-10 h-12 md:w-12 md:h-14 text-zinc-300">
        <path
          d="M10 14h28a2 2 0 0 1 2 2v36a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2Z"
          fill="none" stroke="currentColor" strokeWidth="2.5"
        />
        <path d="M18 14V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M14 26h20M14 34h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-zinc-400 text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-center px-3">
        {m.vyrobca}
      </span>
    </div>
  );
}
