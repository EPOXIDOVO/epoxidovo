import { RAL_CLASSIC_FULL } from "@/content/ral-classic";

/**
 * Prvá sekcia chipsového vzorkovníka. Pri chipsoch si zákazník vyberá DVE
 * veci — farbu podkladu a farbu vločiek — a to z dlaždíc produktov nie je
 * zrejmé (user 2026-08-25: „farba chipsov aj podkladu je volitelna").
 *
 * Fotky reálnych kombinácií dodá klient; kým nie sú, je tam „Fotka čoskoro"
 * a podklad sa ukáže ako skutočný RAL odtieň z našej palety.
 */
type ChipsKombinacia = {
  id: string;
  /** RAL kód podkladu — hex sa berie z palety, nevypisuje sa ručne. */
  podklad: string;
  chipsy: string;
  foto?: string;
};

const KOMBINACIE: ChipsKombinacia[] = [
  { id: "biela-cierne", podklad: "RAL 9010", chipsy: "čierno-biele chipsy" },
  { id: "svetlosiva-cierne", podklad: "RAL 7035", chipsy: "čierno-biele chipsy" },
  { id: "slonovina-bezove", podklad: "RAL 1015", chipsy: "béžovo-hnedé chipsy" },
];

function hexPodkladu(ral: string): string | null {
  return RAL_CLASSIC_FULL.find((c) => c.kod === ral)?.hex ?? null;
}

export function ChipsyKombinacie() {
  return (
    <section className="mb-8">
      <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
        Podklad aj chipsy si vyberáš sám
      </h2>
      <p className="mt-1 text-sm text-[#1B2430]/65 max-w-2xl">
        Chipsová podlaha sú dve rozhodnutia: základná farba, ktorá sa leje ako
        prvá, a farba vločiek, ktoré sa do nej sypú. Základ môže byť ktorýkoľvek
        odtieň z RAL palety nižšie, vločky sa dajú miešať aj kombinovať.
      </p>

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {KOMBINACIE.map((k) => {
          const hex = hexPodkladu(k.podklad);
          return (
            <li key={k.id} className="rounded-2xl ring-1 ring-[#1B2430]/10 overflow-hidden bg-white">
              <div className="relative aspect-[4/3] bg-[#f4f5f7]">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold uppercase tracking-wider text-[#1B2430]/35">
                  Fotka čoskoro
                </span>
              </div>
              <div className="p-3">
                <div className="font-extrabold text-[#1B2430] leading-tight">
                  {k.podklad} + {k.chipsy}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {hex && (
                    <span
                      title={`Podklad ${k.podklad}`}
                      className="block w-9 h-9 rounded-lg ring-1 ring-[#1B2430]/15"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span className="text-xs text-[#1B2430]/60 leading-snug">
                    podklad {k.podklad}
                    <br />+ {k.chipsy}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
