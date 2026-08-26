import Image from "next/image";
import { KOMBINACIE, TOPSTONE_METALIK, nazovKombinacie } from "@/content/topstone-metalik";

/**
 * Prvá sekcia vzorkovníka metalík — ukážky, že odtiene sa dajú kombinovať.
 * Fotky realizácií zatiaľ nemáme, tak je tam „Čoskoro" a pod ním vypísané,
 * z ktorých odtieňov sa kombinácia skladá (aj s ich vzorkami, nech to nie je
 * len prázdny rámik).
 */
export function KombinacieSekcia() {
  return (
    <section className="mb-8">
      <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
        Odtiene sa dajú kombinovať
      </h2>
      <p className="mt-1 text-sm text-[#1B2430]/65 max-w-2xl">
        Do jednej liatej plochy sa dajú zliať dva alebo tri pigmenty. Výsledok
        je zakaždým originál — takto vyzerajú kombinácie, ktoré robíme
        najčastejšie.
      </p>

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {KOMBINACIE.map((k) => {
          const zlozky = k.zlozky
            .map((id) => TOPSTONE_METALIK.find((e) => e.id === id))
            .filter((e): e is (typeof TOPSTONE_METALIK)[number] => Boolean(e));
          return (
            <li
              key={k.id}
              className="rounded-2xl ring-1 ring-[#1B2430]/10 overflow-hidden bg-white"
            >
              <div className="relative aspect-[4/3] bg-[#f4f5f7]">
                {k.foto ? (
                  <Image
                    src={k.foto}
                    alt={`Kombinácia ${nazovKombinacie(k)}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold uppercase tracking-wider text-[#1B2430]/35">
                    Fotka čoskoro
                  </span>
                )}
              </div>

              <div className="p-3">
                <div className="font-extrabold text-[#1B2430] leading-tight">
                  {nazovKombinacie(k)}
                </div>
                {/* vzorky odtieňov, z ktorých sa kombinácia mieša */}
                <div className="mt-2 flex items-center gap-1.5">
                  {zlozky.map((e) => (
                    <span
                      key={e.id}
                      title={e.label}
                      className="relative block w-9 h-9 rounded-lg overflow-hidden ring-1 ring-[#1B2430]/10"
                    >
                      <Image src={e.src} alt={e.label} fill sizes="36px" className="object-cover" />
                    </span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
