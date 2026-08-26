import Link from "next/link";
import { CERTIFICATIONS, CERT_LIST } from "@/content/certifications";

/**
 * Pri priemyselných podlahách nedáva zmysel vyberať farbu — rozhoduje
 * vlastnosť podlahy. User 2026-08-25: „priemyselne by som nedaval farby
 * ale specialne systemy esd protismyk atex".
 */
export function SpecialneSystemy() {
  return (
    <section>
      <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
        Špeciálne systémy
      </h2>
      <p className="mt-1 text-sm text-[#1B2430]/65 max-w-2xl">
        V priemysle nerozhoduje odtieň, ale čo musí podlaha zniesť — statiku,
        hygienu, výbušné prostredie či pošmyknutie. Farbu doladíme podľa RAL
        až nakoniec.
      </p>

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {CERT_LIST.map((slug) => {
          const c = CERTIFICATIONS[slug];
          return (
            <li key={slug}>
              <Link
                href={`/podlahy/${slug}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-[#1B2430]/10 transition-all hover:-translate-y-0.5 hover:ring-[3px] hover:ring-[#3db6e8] hover:shadow-[0_12px_30px_rgba(27,36,48,0.14)]"
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {c.emoji}
                </span>
                <span className="mt-2 font-extrabold text-[#1B2430]">{c.shortName}</span>
                <span className="mt-1 flex-1 text-xs leading-snug text-[#1B2430]/65">
                  {c.heroTagline}
                </span>
                <span className="mt-3 text-sm font-bold text-[#15749e]">
                  {c.priceFrom > 0 ? `od ${c.priceFrom} €/m²` : c.priceLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
