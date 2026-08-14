import Image from "next/image";
import type { Material } from "@/lib/materialy";
import { KATEGORIA_STYLE } from "@/lib/materialy";

/**
 * Produktový vizuál — kompozit: reálna fotka NAŠEJ podlahy (vlastné
 * realizácie, žiadny stock) + kreslený sud/vedro s etiketou (vlastné SVG
 * dielo — oficiálne produktovky zatiaľ nemáme, viď docs/eshop-fotky.md).
 *
 * Ak má produkt vyplnené pole `foto` (oficiálna produktovka), renderuje sa
 * priamo ona namiesto kompozitu.
 */

// Fotka podlahy podľa kategórie/názvu — všetko vlastné fotky z webu.
function podlahaFotka(m: Material): string {
  const n = m.nazov.toLowerCase();
  if (/metalick|metallic|ep11|ep22/.test(n)) return "/images/categories/metalicke.jpg";
  if (/chips|vločk|flake/.test(n)) return "/images/categories/chipsove.jpg";
  switch (m.kategoria) {
    case "Hlavná vrstva":
      return "/images/hero/byvanie-v2.webp";
    case "Penetrácia":
      return "/images/hero/garaz.webp";
    case "Vrchný lak":
      return "/images/realizacie/r-32.jpg";
    default:
      return "/images/hero/hala.jpg";
  }
}

function VedroSvg({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 100 112" className="w-full h-full" aria-hidden>
      {/* tieň pod vedrom — usadí ho na podlahu */}
      <ellipse cx="50" cy="103" rx="34" ry="6" fill="rgba(0,0,0,0.35)" />
      {/* telo vedra */}
      <path
        d="M22 32 L78 32 L72 98 Q71 103 66 103 L34 103 Q29 103 28 98 Z"
        fill="url(#bodyGrad)"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="1"
      />
      {/* veko */}
      <ellipse cx="50" cy="32" rx="28" ry="7.5" fill={accent} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      <ellipse cx="50" cy="30.5" rx="24" ry="5.5" fill="rgba(255,255,255,0.28)" />
      {/* držadlo */}
      <path
        d="M24 33 Q50 6 76 33"
        fill="none"
        stroke="#3f3f46"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4d4d8" />
          <stop offset="18%" stopColor="#fafafa" />
          <stop offset="55%" stopColor="#e4e4e7" />
          <stop offset="100%" stopColor="#a1a1aa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ProductVisual({
  material,
  variant,
}: {
  material: Material;
  variant: "card" | "detail";
}) {
  const m = material;

  // Oficiálna fotka od výrobcu má prednosť — vyliata podlaha full-bleed
  // + malé vedro s etiketou v rohu (nech je jasné, že ide o materiál).
  if (m.foto) {
    const isCardFoto = variant === "card";
    const fotoAccent =
      KATEGORIA_STYLE[m.kategoria].gradient.match(/#[0-9a-fA-F]{6}/)?.[0] ??
      "#3db6e8";
    return (
      <div
        className={`relative overflow-hidden ${isCardFoto ? "aspect-[4/3]" : "aspect-[4/3] rounded-3xl"}`}
      >
        <Image
          src={m.foto}
          alt={m.nazov}
          fill
          sizes={isCardFoto ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 50vw"}
          quality={85}
          className="object-cover"
        />
        {/* Malé vedro vľavo dole — stojí na vyliatej podlahe */}
        <div className={`absolute ${isCardFoto ? "bottom-0.5 left-1 w-[30%]" : "bottom-2 left-3 w-[24%]"}`}>
          <div className="relative">
            <VedroSvg accent={fotoAccent} />
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-[42%] w-[66%] rounded bg-white/95 shadow-sm px-0.5 py-0.5 text-center`}
              style={{ border: `1.5px solid ${fotoAccent}` }}
            >
              <div
                className={`font-black uppercase leading-none ${isCardFoto ? "text-[6px]" : "text-[9px]"}`}
                style={{ color: fotoAccent }}
              >
                {m.vyrobca}
              </div>
              <div
                className={`mt-0.5 font-bold text-zinc-800 leading-[1.1] line-clamp-2 ${isCardFoto ? "text-[5px]" : "text-[8px]"}`}
              >
                {m.nazov}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // accent podľa kategórie (prvá farba gradientu)
  const accent =
    KATEGORIA_STYLE[m.kategoria].gradient.match(/#[0-9a-fA-F]{6}/)?.[0] ??
    "#3db6e8";
  const isCard = variant === "card";

  return (
    <div
      className={`relative overflow-hidden ${isCard ? "aspect-[4/3]" : "aspect-[4/3] rounded-3xl"}`}
    >
      {/* Podlaha — vlastná realizácia ako pozadie */}
      <Image
        src={podlahaFotka(m)}
        alt=""
        fill
        sizes={isCard ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 1024px) 100vw, 50vw"}
        quality={75}
        className="object-cover"
        aria-hidden
      />
      {/* jemné stmavenie hore, nech vynikne vedro aj badge */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Vedro stojace na podlahe */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${isCard ? "bottom-1 w-[58%]" : "bottom-3 w-[52%]"}`}
      >
        <div className="relative">
          <VedroSvg accent={accent} />
          {/* Etiketa na vedre — výrobca + názov */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 ${isCard ? "top-[42%] w-[64%]" : "top-[43%] w-[62%]"} rounded-md bg-white/95 shadow-sm px-1.5 py-1 text-center`}
            style={{ border: `2px solid ${accent}` }}
          >
            <div
              className={`font-black uppercase tracking-wide leading-none ${isCard ? "text-[8px] md:text-[9px]" : "text-[11px] md:text-[13px]"}`}
              style={{ color: accent }}
            >
              {m.vyrobca}
            </div>
            <div
              className={`mt-0.5 font-bold text-zinc-800 leading-[1.15] ${isCard ? "text-[7px] md:text-[8px] line-clamp-2" : "text-[10px] md:text-[11px] line-clamp-3"}`}
            >
              {m.nazov}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
