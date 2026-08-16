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

  // Bez fotky — čistý neutrálny placeholder, žiadne kreslené náhrady.
  return (
    <div
      className={`relative overflow-hidden bg-zinc-100 flex items-center justify-center ${isCard ? "aspect-[4/3]" : "aspect-[4/3] rounded-3xl border border-zinc-200"}`}
    >
      <span className="text-zinc-400 text-[11px] md:text-sm font-bold uppercase tracking-wide text-center px-3">
        Dorob ty
      </span>
    </div>
  );
}
