"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  AlertTriangle,
  ShoppingCart,
  Phone,
  Printer,
  Clock,
  Pencil,
  Camera,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/lib/cart";
import { showToast } from "@/components/ui/Toast";
import { RAL_CLASSIC_FULL, type RalSwatch } from "@/content/ral-classic";
import {
  PREDVOLENA_VOLBA,
  PRIESTORY,
  MIN_NIVELACIA_MM,
  MAX_NIVELACIA_MM,
  CENA_ZOSIVANIE_EUR,
  blokujePodklad,
  dostupnePodklady,
  dostupnostVzhladov,
  dostupnostKde,
  nevhodnyPriestor,
  dostupneSystemy,
  postavSkladbu,
  protismykVynuteny,
  trebaNivelaciu,
  varovania,
  type Volba,
  type Priznak,
  type Stav,
} from "@/lib/konfigurator/rules";
import type { Co, Kde, System } from "@/lib/konfigurator/systemy";
import { efektivnaPlocha, fmtEur, plochaSchodov, prepocitaj } from "@/lib/konfigurator/vypocet";
import { EFEKTY, FOTO_PRIESTOR, FOTO_VZHLAD, GALERIA_VZHLAD, RAL_ZAKLADNE, type Nahlad } from "./fotky";

/**
 * Konfigurátor „Navrhni si podlahu" — 8 krokov s vetvením.
 *
 * Poradie otázok: čo → kde → priestor → podklad → stav → plocha →
 * vzhľad → odtieň a povrch. Pri schodoch sa krok „priestor" preskakuje
 * a namiesto m² sa pýta počet stupňov a šírka.
 *
 * Stav sa drží v URL (?co=…&kde=…&m2=…) aby sa výsledok dal poslať
 * odkazom, a zálohuje do sessionStorage (nie localStorage — po zavretí
 * karty už nie je relevantný).
 */

/** Kocka s bodkami — rovnaká ikona ako v sekcii „Čo všetko vieme vyčarovať". */
function DiceIcon({ pips }: { pips: 1 | 2 | 3 | 4 | 5 }) {
  const positions: Record<number, [number, number][]> = {
    1: [[2.5, 2.5]],
    2: [[1.5, 1.5], [3.5, 3.5]],
    3: [[1.5, 1.5], [2.5, 2.5], [3.5, 3.5]],
    4: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]],
    5: [[1.5, 1.5], [3.5, 1.5], [2.5, 2.5], [1.5, 3.5], [3.5, 3.5]],
  };
  return (
    <svg viewBox="0 0 5 5" className="w-full h-full" fill="currentColor" aria-hidden>
      {positions[pips].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={0.42} />
      ))}
    </svg>
  );
}

/** Vzhľad → slug vzorkovníka pre daný typ podlahy. */
const VZORKOVNIK_SLUG: Record<string, string> = {
  jednofarebna: "jednofarebne",
  chipsy: "chipsove",
  metalik: "metalicke",
  marble: "mramorove",
  beton_look: "beton-look",
  priemyselna: "priemyselne",
  kamenny_koberec: "kamenny-koberec",
};

const SESSION_KEY = "epx-konfigurator-v1";

type KrokId = "co" | "kde" | "priestor" | "podklad" | "stav" | "plocha" | "vzhlad" | "finis";

const KDE_MOZNOSTI: { id: Kde; label: string; popis: string }[] = [
  { id: "interier", label: "Interiér", popis: "Vnútri, bez priameho slnka a mrazu" },
  { id: "exterier", label: "Exteriér", popis: "Vonku — UV, dážď a mráz" },
];

const STAV_PODLAHA: { id: Stav; label: string }[] = [
  { id: "rovny", label: "Rovný" },
  { id: "mierne", label: "Mierne nerovný" },
  { id: "vyrazne", label: "Výrazne nerovný / spádovaný" },
];
const STAV_STENA: { id: Stav; label: string }[] = [
  { id: "rovny", label: "Hladká" },
  { id: "mierne", label: "Mierne nerovná" },
  { id: "vyrazne", label: "Popraskaná / poškodená" },
];

const PRIZNAKY: { id: Priznak; label: string }[] = [
  { id: "praskliny", label: "Sú v ňom praskliny" },
  { id: "vlhkost", label: "Podozrenie na vlhkosť" },
  { id: "mastne", label: "Mastné škvrny, olej" },
];

export function KonfiguratorClient() {
  const { add } = useCart();
  const [volba, setVolba] = React.useState<Volba>(PREDVOLENA_VOLBA);
  const [krokIndex, setKrokIndex] = React.useState(0);
  const [hotovo, setHotovo] = React.useState(false);
  const [systemId, setSystemId] = React.useState<string | null>(null);
  const [pridane, setPridane] = React.useState(false);

  /* ── obnova stavu z URL / sessionStorage ── */
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const zoSession = sessionStorage.getItem(SESSION_KEY);
    let init: Volba = PREDVOLENA_VOLBA;
    if (zoSession) {
      try {
        init = { ...PREDVOLENA_VOLBA, ...(JSON.parse(zoSession) as Volba) };
      } catch {
        /* poškodený záznam ignoruj */
      }
    }
    const co = q.get("co") as Co | null;
    const kde = q.get("kde") as Kde | null;
    const m2 = q.get("m2");
    if (co) init = { ...init, co };
    if (kde) init = { ...init, kde };
    if (m2 && Number(m2) > 0) init = { ...init, plochaM2: Number(m2) };
    setVolba(init);
  }, []);

  /* ── zápis stavu do URL + sessionStorage ── */
  React.useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(volba));
    const q = new URLSearchParams();
    if (volba.co) q.set("co", volba.co);
    if (volba.kde) q.set("kde", volba.kde);
    if (volba.plochaM2) q.set("m2", String(volba.plochaM2));
    const url = q.toString() ? `?${q}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  }, [volba]);

  /* ── zoznam krokov podľa vetvy ── */
  const kroky = React.useMemo<KrokId[]>(() => {
    // vzhľad je landing — zákazník najprv vidí, akú podlahu môže mať
    const z: KrokId[] = ["vzhlad", "kde"];
    if (volba.co !== "schody") z.push("priestor");
    z.push("podklad", "stav", "plocha", "finis");
    return z;
  }, [volba.co]);

  const krok = kroky[Math.min(krokIndex, kroky.length - 1)];
  const posledny = krokIndex >= kroky.length - 1;

  const uprav = (patch: Partial<Volba>) => setVolba((v) => ({ ...v, ...patch }));

  /** Auto-advance po jednovýberovom kroku (~250 ms). */
  const vyberADalej = (patch: Partial<Volba>) => {
    uprav(patch);
    window.setTimeout(() => {
      const dalsi = Math.min(krokIndex + 1, kroky.length - 1);
      setKrokIndex(dalsi);
      window.history.pushState({ epxKrok: dalsi }, "");
    }, 250);
  };

  /** Posun vpred zapíše krok do histórie — späť v prehliadači tak vráti
   *  o otázku, nie preč z konfigurátora. */
  const chodNaKrok = (n: number) => {
    setKrokIndex(n);
    window.history.pushState({ epxKrok: n }, "");
  };

  /** Späť necháme na prehliadač, aby sedeli obe cesty (tlačidlo aj myš). */
  const naspat = () => {
    if (window.history.state?.epxKrok != null) window.history.back();
    else setKrokIndex((n) => Math.max(0, n - 1));
  };

  const dalej = () => {
    if (posledny) {
      const systemy = dostupneSystemy(volba);
      setSystemId(systemy[0]?.id ?? null);
      setHotovo(true);
      window.history.pushState({ epxKrok: krokIndex, epxHotovo: true }, "");
      return;
    }
    chodNaKrok(krokIndex + 1);
  };

  React.useEffect(() => {
    const naPopstate = (e: PopStateEvent) => {
      const st = e.state as { epxKrok?: number; epxHotovo?: boolean } | null;
      setHotovo(!!st?.epxHotovo);
      setKrokIndex(typeof st?.epxKrok === "number" ? st.epxKrok : 0);
    };
    window.addEventListener("popstate", naPopstate);
    return () => window.removeEventListener("popstate", naPopstate);
  }, []);


  /* ── validácia kroku ── */
  const mozeDalej = (() => {
    switch (krok) {
      case "co":
        return !!volba.co;
      case "kde":
        return !!volba.kde;
      case "priestor":
        return volba.priestor === "ine"
          ? (volba.priestorPopis ?? "").trim().length > 1
          : !!volba.priestor;
      case "podklad":
        return !!volba.podklad;
      case "stav":
        return !!volba.stav;
      case "plocha":
        return efektivnaPlocha(volba) != null;
      case "vzhlad":
        return !!volba.vzhlad;
      case "finis":
        return true;
    }
  })();

  /** Vzhľady pre aktuálnu vetvu — používa sa aj na určenie posledného stĺpca. */
  const zoznamVzhladov = dostupnostVzhladov(volba);

  const blok = blokujePodklad(volba);

  /* ── výsledok ── */
  const system: System | null = React.useMemo(() => {
    if (!systemId) return null;
    return dostupneSystemy(volba).find((s) => s.id === systemId) ?? null;
  }, [systemId, volba]);

  /** Pre niektoré kombinácie (napr. kamenný koberec) systém zatiaľ nemáme —
   *  namiesto prázdnej obrazovky ponúkni návrh na mieru. */
  const bezSystemu = hotovo && !system;

  const vysledok = React.useMemo(() => {
    if (!system) return null;
    const skladba = postavSkladbu(volba, system);
    return prepocitaj(skladba, volba);
  }, [system, volba]);

  /* ── UI kúsky ── */
  const dlazdicaCls = (aktivna: boolean, dostupna = true, sFotkou = false) =>
    `relative rounded-2xl border-2 p-4 text-left transition-all duration-150 flex flex-col ${
      sFotkou ? "min-h-[120px] justify-end" : "min-h-[84px] justify-center"
    } ${
      !dostupna
        ? "border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed"
        : aktivna
          ? "border-[#3db6e8] bg-[#e3f3fb] shadow-[0_8px_24px_rgba(61,182,232,0.25)]"
          : "border-zinc-200 bg-white hover:border-[#3db6e8] hover:-translate-y-0.5"
    }`;

  if (bezSystemu) {
    return (
      <Container size="md" className="py-12">
        <div className="rounded-3xl bg-white border border-zinc-200 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e3f3fb] text-[#1a8cc4] mb-4">
            <Info className="w-7 h-7" aria-hidden />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0e1a3b]">
            Túto skladbu navrhneme osobne
          </h2>
          <p className="mt-2 text-[#4a5478] max-w-lg mx-auto">
            Pre kombináciu, ktorú si zvolil, nemáme hotový systém v konfigurátore —
            býva to pri kamennom koberci a atypických zadaniach. Napíš nám alebo
            zavolaj a navrhneme skladbu na mieru, zvyčajne do jedného dňa.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/cenova-ponuka"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-colors"
            >
              Chcem návrh na mieru
            </Link>
            <button
              type="button"
              onClick={() => setHotovo(false)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-zinc-200 font-bold text-[#4a5478] hover:border-zinc-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden /> Zmeniť voľbu
            </button>
          </div>
        </div>
      </Container>
    );
  }

  if (hotovo && system && vysledok) {
    return (
      <Vysledok
        volba={volba}
        system={system}
        systemy={dostupneSystemy(volba)}
        vysledok={vysledok}
        onZmenit={() => setHotovo(false)}
        onSystem={setSystemId}
        onDoKosika={() => {
          const polozky = vysledok.riadky
            .filter((r) => !r.bezMaterialu && r.pocetBaleni && r.produktSku)
            .map((r) => ({
              productId: r.produktSku,
              qty: r.pocetBaleni as number,
              systemLabel: system.nazov,
            }));
          if (polozky.length === 0) return;
          add(polozky);
          showToast(`${polozky.length} položiek skladby je v košíku`, "cart");
          setPridane(true);
          window.setTimeout(() => setPridane(false), 4000);
        }}
        pridane={pridane}
      />
    );
  }

  return (
    <Container size="xl" className="pt-3 pb-8 md:pt-4 md:pb-10">
      {/* prvý krok je galéria na celú šírku, ďalšie otázky sedia v užšom
          vycentrovanom paneli — inak sa dve dlaždice stratia v prázdnej ploche */}
      <div className={krok === "vzhlad" ? "" : "max-w-3xl mx-auto"}>
        <div
          className={
            krok === "vzhlad"
              ? ""
              : "rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 shadow-[0_10px_40px_rgba(14,26,59,0.06)]"
          }
        >
          {/* progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex gap-1.5">
              {kroky.map((k, i) => (
                <span
                  key={k}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= krokIndex ? "bg-[#3db6e8]" : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-zinc-500 whitespace-nowrap tabular-nums">
              Krok {krokIndex + 1} zo {kroky.length}
            </span>
          </div>

          <div key={krok} className="mt-6 motion-safe:animate-[fadeIn_180ms_ease-out]">
            {/* ── KROK 1: čo riešiš ── */}

            {/* ── KROK 2: interiér / exteriér ── */}
            {krok === "kde" && (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">Interiér alebo exteriér?</h2>
                <p className="mt-1 text-[#4a5478]">
                  Vonku platia iné pravidlá — UV, mráz a povinný protišmyk.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {KDE_MOZNOSTI.map((m) => {
                    const d = dostupnostKde(volba).find((x) => x.id === m.id)!;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!d.dostupny}
                        onClick={() => d.dostupny && vyberADalej({ kde: m.id, priestor: null })}
                        className={dlazdicaCls(volba.kde === m.id, d.dostupny)}
                      >
                        <span className="block font-extrabold">{m.label}</span>
                        <span className="block text-xs mt-0.5 leading-snug">
                          {d.dostupny ? m.popis : d.dovod}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* keď je exteriér zablokovaný, nenechaj zákazníka v slepej uličke */}
                {dostupnostKde(volba).some((d) => !d.dostupny) && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-[#0e1a3b] leading-relaxed">
                      <strong className="font-extrabold">Prečo vonku nie:</strong> UV žiarenie
                      rozloží živicu v efekte, farba zožltne a povrch skriedovatie. Mráz a voda
                      navyše pracujú s podkladom, takže tenká dekoratívna vrstva popraská.
                      Do exteriéru lejeme polyuretánové systémy a kamenné koberce — sú
                      UV stabilné, pružné a priepustné pre vodu.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        uprav({ kde: "exterier", vzhlad: null, priestor: null });
                        setKrokIndex(0);
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0e1a3b] text-white font-bold text-sm hover:bg-[#1a2b57] transition-colors whitespace-nowrap"
                    >
                      Pozrieť vhodné typy do exteriéru
                      <ArrowRight className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── KROK 3: priestor ── */}
            {krok === "priestor" && (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">Aký je to priestor?</h2>
                <p className="mt-1 text-[#4a5478]">Určuje záťaž, ktorú musí podlaha zniesť.</p>
                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(PRIESTORY[`${volba.co}-${volba.kde}`] ?? []).map((m) => {
                    /* „Iné" nie je dlaždica — je to rovno pole na napísanie */
                    if (m.id === "ine") {
                      const vyplnene = (volba.priestorPopis ?? "").trim().length > 1;
                      return (
                        <div
                          key={m.id}
                          className={`relative h-[132px] rounded-2xl border-2 border-dashed bg-white p-3 flex flex-col justify-between transition-colors ${
                            vyplnene ? "border-[#3db6e8] bg-[#f4fbfe]" : "border-zinc-300"
                          } focus-within:border-[#3db6e8]`}
                        >
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-zinc-400">
                            <Pencil className="w-3.5 h-3.5" aria-hidden />
                            Iné
                          </span>
                          <label htmlFor="priestor-iny" className="sr-only">
                            Napíš, o aký priestor ide
                          </label>
                          <input
                            id="priestor-iny"
                            type="text"
                            value={volba.priestorPopis ?? ""}
                            onChange={(e) =>
                              uprav({ priestor: "ine", priestorPopis: e.target.value })
                            }
                            placeholder="napíš aký…"
                            className="w-full bg-transparent border-b-2 border-zinc-200 focus:border-[#3db6e8] outline-none py-1.5 text-sm font-bold text-[#0e1a3b] placeholder:text-zinc-400 placeholder:font-medium transition-colors"
                          />
                          <span className="text-[11px] leading-snug text-zinc-400">
                            Napr. pivnica, telocvičňa, ambulancia
                          </span>
                        </div>
                      );
                    }

                    const dovod = nevhodnyPriestor(volba, m.id);
                    const vybraty = volba.priestor === m.id;
                    const foto = FOTO_PRIESTOR[m.id];
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!!dovod}
                        onClick={() => !dovod && vyberADalej({ priestor: m.id, priestorPopis: null })}
                        className={`group relative h-[132px] rounded-2xl overflow-hidden text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] ${
                          dovod
                            ? "cursor-not-allowed bg-zinc-100 border-2 border-zinc-200"
                            : `ring-2 hover:-translate-y-0.5 ${
                                vybraty
                                  ? "ring-[#3db6e8] shadow-[0_10px_28px_rgba(61,182,232,0.3)]"
                                  : "ring-transparent hover:ring-[#3db6e8]"
                              }`
                        }`}
                      >
                        {!dovod && foto?.src && (
                          <Image
                            src={foto.src}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            quality={85}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        {!dovod && (
                          <span
                            aria-hidden
                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                          />
                        )}
                        {vybraty && (
                          <span className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3db6e8] text-white shadow">
                            <Check className="w-4 h-4" aria-hidden />
                          </span>
                        )}
                        <span
                          className={`absolute inset-x-0 bottom-0 p-3 ${
                            dovod ? "text-zinc-500" : "text-white"
                          }`}
                        >
                          <span className="block font-extrabold leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                            {m.label}
                          </span>
                          {dovod && (
                            <span className="block text-[11px] leading-snug mt-1">{dovod}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── KROK 4: podklad ── */}
            {krok === "podklad" && (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">Aký máš podklad?</h2>
                <p className="mt-1 text-[#4a5478]">Na čo sa bude liať alebo natierať.</p>
                <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dostupnePodklady(volba.co).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        m.id === "neviem"
                          ? uprav({ podklad: m.id })
                          : vyberADalej({ podklad: m.id })
                      }
                      className={dlazdicaCls(volba.podklad === m.id)}
                    >
                      <span className="font-extrabold text-[#0e1a3b]">{m.label}</span>
                    </button>
                  ))}
                </div>
                {volba.podklad === "neviem" && <OdfotPodklad volba={volba} />}
                {blok && (
                  <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
                    <div className="flex items-center gap-2 font-extrabold text-amber-900">
                      <AlertTriangle className="w-5 h-5" aria-hidden />
                      Toto potrebuje obhliadku
                    </div>
                    <p className="mt-1.5 text-sm text-amber-900/90">{blok}</p>
                    <Link
                      href="/cenova-ponuka"
                      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea580c] transition-colors"
                    >
                      Objednať obhliadku
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* ── KROK 5: stav ── */}
            {krok === "stav" && (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">V akom je stave?</h2>
                <p className="mt-1 text-[#4a5478]">
                  Podľa toho vieme, či treba niveláciu a koľko materiálu navyše.
                </p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(volba.co === "stena" ? STAV_STENA : STAV_PODLAHA).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => uprav({ stav: m.id })}
                      className={dlazdicaCls(volba.stav === m.id)}
                    >
                      <span className="font-extrabold text-[#0e1a3b]">{m.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-2">
                  {PRIZNAKY.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 cursor-pointer hover:border-[#3db6e8] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={volba.priznaky.includes(p.id)}
                        onChange={(e) =>
                          uprav({
                            priznaky: e.target.checked
                              ? [...volba.priznaky, p.id]
                              : volba.priznaky.filter((x) => x !== p.id),
                          })
                        }
                        className="w-4 h-4 accent-[#3db6e8]"
                      />
                      <span className="font-semibold text-[#0e1a3b]">{p.label}</span>
                    </label>
                  ))}
                  {volba.priznaky.includes("praskliny") && (
                    <div className="flex items-center gap-3 rounded-xl bg-[#f7f6f3] px-4 py-3">
                      <span className="text-sm font-semibold text-[#4a5478]">Koľko prasklín?</span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={volba.pocetPrasklin}
                        onChange={(e) => uprav({ pocetPrasklin: Math.max(1, Number(e.target.value)) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-zinc-300 text-right"
                      />
                      <span className="text-sm text-[#6b7390]">
                        × {CENA_ZOSIVANIE_EUR} € zošívanie
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── KROK 6: plocha ── */}
            {krok === "plocha" && (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">
                  {volba.co === "schody" ? "Aké je schodisko?" : "Aká je plocha?"}
                </h2>
                {volba.co === "schody" ? (
                  <>
                    <p className="mt-1 text-[#4a5478]">Plochu dopočítame za teba.</p>
                    <div className="mt-5 flex flex-wrap gap-4">
                      <label className="block">
                        <span className="block text-sm font-semibold text-[#4a5478] mb-1">Počet stupňov</span>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={volba.pocetStupnov ?? ""}
                          onChange={(e) => uprav({ pocetStupnov: Number(e.target.value) || null })}
                          placeholder="napr. 14"
                          className="w-36 px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-[#3db6e8]"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-[#4a5478] mb-1">Šírka schodiska (cm)</span>
                        <input
                          type="number"
                          min={30}
                          max={500}
                          value={volba.sirkaSchodovCm ?? ""}
                          onChange={(e) => uprav({ sirkaSchodovCm: Number(e.target.value) || null })}
                          placeholder="napr. 100"
                          className="w-44 px-4 py-3 rounded-xl border-2 border-zinc-200 focus:outline-none focus:border-[#3db6e8]"
                        />
                      </label>
                    </div>
                    {volba.pocetStupnov && volba.sirkaSchodovCm && (
                      <p className="mt-3 text-sm text-[#0e1a3b] bg-[#e3f3fb] rounded-xl px-4 py-3">
                        Plocha na natretie:{" "}
                        <strong className="tabular-nums">
                          {plochaSchodov(volba.pocetStupnov, volba.sirkaSchodovCm)} m²
                        </strong>{" "}
                        <span className="text-[#4a5478]">
                          ({volba.pocetStupnov} × {volba.sirkaSchodovCm} cm × 0,75 — nášľap aj podstupnica)
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-[#4a5478]">Stačí približne, rezervu doriešime na konci.</p>
                    <div className="mt-5 flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={100000}
                        value={volba.plochaM2 ?? ""}
                        onChange={(e) => uprav({ plochaM2: Number(e.target.value) || null })}
                        placeholder="napr. 45"
                        className="w-40 px-4 py-3 rounded-xl border-2 border-zinc-200 text-lg font-bold focus:outline-none focus:border-[#3db6e8]"
                      />
                      <span className="font-semibold text-[#4a5478]">m²</span>
                    </div>
                    <ZRozmerov onSet={(m2) => uprav({ plochaM2: m2 })} />
                  </>
                )}
              </>
            )}

            {/* ── KROK 7: vzhľad ── */}
            {krok === "vzhlad" && (
              <>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">
                  Akú podlahu chceš?
                </h2>
                <p className="mt-1 text-[#4a5478]">
                  Vyber vzhľad a my dopočítame celú skladbu, spotrebu aj cenu.
                </p>

                {/* karty 1:1 so sekciou „Čo všetko vieme vyčarovať" na webe */}
                <div className="mt-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 md:gap-2.5">
                    {zoznamVzhladov.map((m, idx) => {
                      const vybrata = volba.vzhlad === m.id;
                      const foto = FOTO_VZHLAD[m.id];
                      return (
                        <div key={m.id} className="flex flex-col gap-2 md:gap-2.5">
                          {/* celý stĺpec je JEDNA odpoveď — klik kdekoľvek vyberie tento vzhľad */}
                          <button
                            type="button"
                            disabled={!m.dostupny}
                            title={m.dovod}
                            onClick={() => m.dostupny && vyberADalej({ vzhlad: m.id })}
                            className={`group relative flex flex-col gap-2 md:gap-2.5 rounded-2xl p-1.5 -m-1.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] ${
                              m.dostupny
                                ? "hover:bg-[#e3f3fb] hover:ring-2 hover:ring-[#3db6e8]"
                                : "opacity-50 cursor-not-allowed"
                            } ${vybrata ? "bg-[#e3f3fb] ring-2 ring-[#3db6e8]" : ""}`}
                          >
                            <span
                              className={`relative flex flex-col rounded-2xl overflow-hidden bg-[#5c2c18] transition-transform duration-300 ${
                                m.dostupny ? "group-hover:-translate-y-0.5" : ""
                              }`}
                            >
                              {vybrata && (
                                <span className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#3db6e8] text-white shadow-lg">
                                  <Check className="w-5 h-5" aria-hidden />
                                </span>
                              )}
                              <span className="px-3 pt-3 pb-2.5 md:px-4 md:pt-4 md:pb-3 flex flex-col min-h-[84px] md:min-h-[112px]">
                                <span className="w-6 h-6 md:w-8 md:h-8 mb-1.5 md:mb-2 rounded-md bg-white text-[#5c2c18] group-hover:text-[#3db6e8] flex items-center justify-center p-1 md:p-1.5 transition-colors duration-500 shrink-0">
                                  <DiceIcon pips={((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5} />
                                </span>
                                <h3 className="text-[14px] leading-[1.12] md:text-lg lg:text-xl font-black text-white tracking-tight md:leading-[1.05] line-clamp-2">
                                  {m.label}
                                </h3>
                              </span>
                              <span className="relative block overflow-hidden h-[120px] md:h-[clamp(104px,15.5vh,190px)] bg-[#4a2313]">
                                {foto?.src ? (
                                  <Image
                                    src={foto.src}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    quality={85}
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                  />
                                ) : (
                                  <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-[11px] font-semibold text-white/60">
                                    Fotka sa dopĺňa
                                  </span>
                                )}
                              </span>
                            </span>

                            {/* dve varianty toho istého typu — ako stĺpce na webe */}
                            {(GALERIA_VZHLAD[m.id] ?? [null, null]).map((src, i) => (
                              <span
                                key={i}
                                className={`relative block w-full h-[86px] md:h-[clamp(74px,10.8vh,150px)] rounded-xl overflow-hidden ${
                                  src ? "" : "border border-dashed border-zinc-300 bg-zinc-100"
                                }`}
                              >
                                {src ? (
                                  <Image
                                    src={src}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 50vw, 17vw"
                                    quality={75}
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-zinc-400">
                                    Fotka sa dopĺňa
                                  </span>
                                )}
                              </span>
                            ))}
                          </button>

                          {/* vzorkovník práve tohto typu podlahy */}
                          <Link
                            href={`/vzorkovnik?typ=${VZORKOVNIK_SLUG[m.id] ?? ""}`}
                            aria-label={`Celý vzorkovník — ${m.label}`}
                            className="inline-flex items-center justify-center px-3 py-2 md:py-2.5 rounded-full bg-[#3db6e8] text-white font-semibold text-[12px] md:text-sm whitespace-nowrap hover:bg-[#1a8cc4] shadow-[0_6px_20px_rgba(61,182,232,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                          >
                            Celý vzorkovník
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── KROK 8: odtieň, povrch, rezerva ── */}
            {krok === "finis" && (
              <Finis volba={volba} uprav={uprav} />
            )}
          </div>

          {/* navigácia — na prvom kroku netreba, Späť by aj tak nefungovalo */}
          <div className={`flex items-center justify-between ${krokIndex === 0 ? "mt-4" : "mt-8"}`}>
            {krokIndex === 0 ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={naspat}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 border-zinc-200 font-semibold text-[#4a5478] hover:border-zinc-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden /> Späť
              </button>
            )}
            {/* Ďalej len tam, kde nie je auto-advance */}
            {((["stav", "plocha", "finis"] as KrokId[]).includes(krok) ||
              (krok === "priestor" && volba.priestor === "ine")) && (
              <button
                type="button"
                onClick={dalej}
                disabled={!mozeDalej || !!blok}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#3db6e8] text-white font-bold whitespace-nowrap hover:bg-[#1a8cc4] disabled:bg-[#dfe3ec] disabled:text-[#98a0b6] disabled:cursor-not-allowed transition-colors"
              >
                {posledny ? "Zobraziť skladbu" : "Ďalej"}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

      </div>
    </Container>
  );
}

/**
 * „Neviem, aký mám podklad" — zákazník ho odfotí a pošle nám to ako lead.
 *
 * Fotka sa zatiaľ NEODOSIELA na server (lead API má 32 kB limit a nemáme
 * úložisko) — ide len do náhľadu a do správy sa zapíše, že ju zákazník má
 * pripravenú. Keď pribudne upload (R2 / Cloudinary), doplní sa sem.
 */
function OdfotPodklad({ volba }: { volba: Volba }) {
  const [foto, setFoto] = React.useState<string | null>(null);
  const [nazovSuboru, setNazovSuboru] = React.useState<string | null>(null);
  const [meno, setMeno] = React.useState("");
  const [priezvisko, setPriezvisko] = React.useState("");
  const [telefon, setTelefon] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [suhlas, setSuhlas] = React.useState(false);
  const [posiela, setPosiela] = React.useState(false);
  const [hotovo, setHotovo] = React.useState(false);
  const [chyba, setChyba] = React.useState<string | null>(null);

  const vyberFotku = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setNazovSuboru(f.name);
    const r = new FileReader();
    r.onload = () => setFoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  };

  const mozePoslat =
    meno.trim().length > 1 &&
    priezvisko.trim().length > 1 &&
    telefon.trim().length > 8 &&
    email.includes("@") &&
    suhlas &&
    !posiela;

  const posli = async () => {
    setPosiela(true);
    setChyba(null);
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: meno.trim(),
          lastName: priezvisko.trim(),
          email: email.trim(),
          phone: telefon.trim(),
          consent: true,
          source: "konfigurator_podklad",
          message: [
            "Z konfigurátora — zákazník nevie určiť podklad.",
            volba.vzhlad ? `Vzhľad: ${volba.vzhlad}` : null,
            volba.kde ? `Kde: ${volba.kde}` : null,
            volba.priestor
              ? `Priestor: ${volba.priestor === "ine" ? volba.priestorPopis : volba.priestor}`
              : null,
            foto
              ? `Zákazník odfotil podklad (${nazovSuboru ?? "fotka"}) — vypýtať pri hovore.`
              : "Fotku zatiaľ nepriložil.",
          ]
            .filter(Boolean)
            .join(" · "),
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setHotovo(true);
    } catch {
      setChyba("Odoslanie zlyhalo. Skús to prosím znova alebo nám zavolaj.");
    } finally {
      setPosiela(false);
    }
  };

  if (hotovo) {
    return (
      <div className="mt-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 font-extrabold text-emerald-900">
          <Check className="w-5 h-5" aria-hidden />
          Máme to, ozveme sa ti
        </div>
        <p className="mt-1.5 text-sm text-emerald-900/80">
          Pozrieme sa na podklad a zavoláme ti, čo naň sadne. Ak si odfotil, maj
          fotku po ruke — vypýtame si ju pri hovore.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border-2 border-[#3db6e8] bg-[#f4fbfe] p-5">
      <div className="flex items-center gap-2 font-extrabold text-[#0e1a3b]">
        <Camera className="w-5 h-5 text-[#1a8cc4]" aria-hidden />
        Odfoť podklad a my ti povieme, čo naň sadne
      </div>
      <p className="mt-1.5 text-sm text-[#4a5478]">
        Netreba nič merať. Odfoť podlahu z výšky pása, ideálne aj detail praskliny
        alebo starého náteru.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0e1a3b] text-white font-bold text-sm cursor-pointer hover:bg-[#1a2b57] transition-colors whitespace-nowrap">
          <Camera className="w-4 h-4" aria-hidden />
          {foto ? "Zmeniť fotku" : "Odfotiť / vybrať fotku"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={vyberFotku}
            className="sr-only"
          />
        </label>
        {foto && (
          <span className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-white shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt="Náhľad podkladu" className="w-full h-full object-cover" />
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={meno}
          onChange={(e) => setMeno(e.target.value)}
          placeholder="Meno"
          className="px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white text-[#0e1a3b] placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] transition-colors"
        />
        <input
          value={priezvisko}
          onChange={(e) => setPriezvisko(e.target.value)}
          placeholder="Priezvisko"
          className="px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white text-[#0e1a3b] placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] transition-colors"
        />
        <input
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
          inputMode="tel"
          placeholder="Telefón"
          className="px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white text-[#0e1a3b] placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] transition-colors"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          placeholder="E-mail"
          className="px-4 py-3 rounded-xl border-2 border-zinc-200 bg-white text-[#0e1a3b] placeholder:text-zinc-400 focus:outline-none focus:border-[#3db6e8] transition-colors"
        />
      </div>

      <label className="mt-3 flex items-start gap-2.5 text-sm text-[#4a5478] cursor-pointer">
        <input
          type="checkbox"
          checked={suhlas}
          onChange={(e) => setSuhlas(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#3db6e8]"
        />
        <span>
          Súhlasím so spracovaním údajov na účel odpovede podľa{" "}
          <Link href="/ochrana-sukromia" className="font-bold text-[#1a8cc4] hover:underline">
            ochrany súkromia
          </Link>
          .
        </span>
      </label>

      {chyba && <p className="mt-2 text-sm font-semibold text-red-600">{chyba}</p>}

      <button
        type="button"
        onClick={posli}
        disabled={!mozePoslat}
        className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] disabled:bg-[#dfe3ec] disabled:text-[#98a0b6] disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        Poslať a ozvite sa mi
        <ArrowRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}

/* ── Pomocné komponenty ─────────────────────────────────────────── */

function ZRozmerov({ onSet }: { onSet: (m2: number) => void }) {
  const [open, setOpen] = React.useState(false);
  const [d, setD] = React.useState("");
  const [s, setS] = React.useState("");
  React.useEffect(() => {
    const dd = Number(d);
    const ss = Number(s);
    if (dd > 0 && ss > 0) onSet(Math.round(dd * ss * 100) / 100);
  }, [d, s, onSet]);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-bold text-[#1a8cc4] hover:underline"
      >
        Nemám zmerané — vypočítať z rozmerov
      </button>
      {open && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            value={d}
            onChange={(e) => setD(e.target.value)}
            placeholder="dĺžka (m)"
            className="w-32 px-3 py-2 rounded-lg border border-zinc-300"
          />
          <span className="text-zinc-400">×</span>
          <input
            type="number"
            value={s}
            onChange={(e) => setS(e.target.value)}
            placeholder="šírka (m)"
            className="w-32 px-3 py-2 rounded-lg border border-zinc-300"
          />
        </div>
      )}
    </div>
  );
}

function Finis({ volba, uprav }: { volba: Volba; uprav: (p: Partial<Volba>) => void }) {
  const jeRal = volba.vzhlad === "jednofarebna" || volba.vzhlad === "epoxidovy_nater";
  const vynuteny = protismykVynuteny(volba);

  React.useEffect(() => {
    if (vynuteny && !volba.protismyk) uprav({ protismyk: true });
  }, [vynuteny, volba.protismyk, uprav]);

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3b]">Odtieň a povrch</h2>
      <p className="mt-1 text-[#4a5478]">Posledný krok — potom ti ukážeme celú skladbu.</p>

      {jeRal ? (
        <div className="mt-5">
          <label className="block text-sm font-bold text-[#4a5478] mb-1.5">Odtieň RAL</label>
          <select
            value={volba.odtien ?? ""}
            onChange={(e) => uprav({ odtien: e.target.value || null })}
            className="w-full max-w-md px-4 py-3 rounded-xl border-2 border-zinc-200 font-semibold focus:outline-none focus:border-[#3db6e8]"
          >
            <option value="">— vyber odtieň —</option>
            <optgroup label="Základná trieda (skladom, bežná cena)">
              {RAL_CLASSIC_FULL.filter((r: RalSwatch) => RAL_ZAKLADNE.includes(r.kod)).map((r: RalSwatch) => (
                <option key={r.kod} value={r.kod}>
                  {r.kod} — {r.nazov}
                </option>
              ))}
            </optgroup>
            <optgroup label="Pastelová trieda (na objednávku)">
              {RAL_CLASSIC_FULL.filter((r: RalSwatch) => !RAL_ZAKLADNE.includes(r.kod)).map((r: RalSwatch) => (
                <option key={r.kod} value={r.kod}>
                  {r.kod} — {r.nazov}
                </option>
              ))}
            </optgroup>
          </select>
          {volba.odtien && !RAL_ZAKLADNE.includes(volba.odtien) && (
            <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              Pastelová trieda — vyššia cena, dodanie cca 2 týždne
            </span>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <div className="text-sm font-bold text-[#4a5478] mb-2">Efekt</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {EFEKTY.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => uprav({ odtien: e.label })}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  volba.odtien === e.label ? "border-[#3db6e8] scale-105" : "border-transparent hover:border-zinc-300"
                }`}
                title={e.label}
              >
                <Image src={e.src} alt={e.label} fill sizes="100px" quality={75} className="object-cover" />
                {volba.odtien === e.label && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-5 h-5 text-white" aria-hidden />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="text-sm font-bold text-[#4a5478] mb-2">Povrch</div>
        <div className="flex gap-2">
          {(["mat", "polomat", "lesk"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => uprav({ povrch: p })}
              className={`px-5 py-2.5 rounded-full border-2 font-semibold capitalize transition-colors ${
                volba.povrch === p
                  ? "border-[#3db6e8] bg-[#e3f3fb] text-[#0e1a3b]"
                  : "border-zinc-200 text-zinc-600 hover:border-[#3db6e8]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <label
        className={`mt-6 flex items-start gap-3 rounded-xl border-2 p-4 ${
          vynuteny ? "border-amber-300 bg-amber-50 cursor-default" : "border-zinc-200 bg-white cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          checked={volba.protismyk || vynuteny}
          disabled={vynuteny}
          onChange={(e) => uprav({ protismyk: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-[#3db6e8]"
        />
        <span>
          <span className="block font-bold text-[#0e1a3b]">Protišmykový povrch</span>
          <span className="block text-sm text-[#4a5478]">
            {vynuteny
              ? volba.co === "schody"
                ? "Na schodoch povinný — mokrý hladký nášľap je nebezpečný, preto sa nedá odobrať."
                : "V exteriéri povinný — mokrý hladký povrch je klzký, preto sa nedá odobrať."
              : "Posyp kremičitým pieskom do vrchnej vrstvy."}
          </span>
        </span>
      </label>

      {/* rezerva až tu, na konci */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#4a5478]">Rezerva materiálu</span>
          <span className="font-extrabold text-[#0e1a3b] tabular-nums">{volba.rezervaPercent} %</span>
        </div>
        <input
          type="range"
          min={5}
          max={15}
          step={1}
          value={volba.rezervaPercent}
          onChange={(e) => uprav({ rezervaPercent: Number(e.target.value) })}
          className="slider-aura mt-2 w-full"
          style={{ ["--fill" as string]: `${((volba.rezervaPercent - 5) / 10) * 100}%` }}
        />
        <p className="mt-1 text-xs text-[#6b7390]">
          Odporúčame 10 % na strihy, dorovnanie a prípadnú opravu.
        </p>
      </div>

      {trebaNivelaciu(volba) && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#4a5478]">Hrúbka nivelácie</span>
            <span className="font-extrabold text-[#0e1a3b] tabular-nums">{volba.hrubkaNivelacieMm} mm</span>
          </div>
          <input
            type="range"
            min={MIN_NIVELACIA_MM}
            max={MAX_NIVELACIA_MM}
            step={1}
            value={volba.hrubkaNivelacieMm}
            onChange={(e) => uprav({ hrubkaNivelacieMm: Number(e.target.value) })}
            className="slider-aura mt-2 w-full"
            style={{
              ["--fill" as string]: `${((volba.hrubkaNivelacieMm - MIN_NIVELACIA_MM) / (MAX_NIVELACIA_MM - MIN_NIVELACIA_MM)) * 100}%`,
            }}
          />
          <p className="mt-1 text-xs text-[#6b7390]">
            Minimum {MIN_NIVELACIA_MM} mm — pri menšej hrúbke materiál degraduje a praská.
          </p>
        </div>
      )}
    </>
  );
}

/* ── Výstupná obrazovka ─────────────────────────────────────────── */

function Vysledok({
  volba,
  system,
  systemy,
  vysledok,
  onZmenit,
  onSystem,
  onDoKosika,
  pridane,
}: {
  volba: Volba;
  system: System;
  systemy: System[];
  vysledok: ReturnType<typeof prepocitaj>;
  onZmenit: () => void;
  onSystem: (id: string) => void;
  onDoKosika: () => void;
  pridane: boolean;
}) {
  const zhrnutie = [
    volba.co === "podlaha" ? "Podlaha" : volba.co === "stena" ? "Stena" : "Schody",
    volba.kde === "interier" ? "Interiér" : "Exteriér",
    volba.priestor
      ? (PRIESTORY[`${volba.co}-${volba.kde}`] ?? []).find((p) => p.id === volba.priestor)?.label
      : null,
    dostupnePodklady(volba.co).find((p) => p.id === volba.podklad)?.label,
    `${efektivnaPlocha(volba)} m²`,
    volba.odtien,
    volba.povrch,
  ]
    .filter(Boolean)
    .join(" · ");

  const varov = varovania(volba);

  return (
    <Container size="xl" className="py-8 md:py-12 print:py-0">
      {/* A — zhrnutie voľby */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f7f6f3] px-5 py-4">
        <span className="font-semibold text-[#0e1a3b]">{zhrnutie}</span>
        <button
          type="button"
          onClick={onZmenit}
          className="print:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-zinc-300 font-bold text-sm text-[#4a5478] hover:border-[#3db6e8] hover:text-[#1a8cc4] transition-colors"
        >
          Zmeniť
        </button>
      </div>

      {varov.map((v) => (
        <div
          key={v.nadpis}
          className={`mt-4 rounded-2xl border-2 p-5 ${
            v.typ === "blokujuce"
              ? "border-red-300 bg-red-50"
              : v.typ === "vystraha"
                ? "border-amber-300 bg-amber-50"
                : "border-zinc-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2 font-extrabold text-[#0e1a3b]">
            {v.typ === "info" ? (
              <Info className="w-5 h-5 text-[#3db6e8]" aria-hidden />
            ) : (
              <AlertTriangle className={`w-5 h-5 ${v.typ === "blokujuce" ? "text-red-600" : "text-amber-600"}`} aria-hidden />
            )}
            {v.nadpis}
          </div>
          <p className="mt-1.5 text-sm text-[#4a5478]">{v.text}</p>
          {v.cta && (
            <Link
              href={v.cta.href}
              className="print:hidden mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0e1a3b] text-white font-bold text-sm hover:bg-[#1a8cc4] transition-colors"
            >
              {v.cta.label}
            </Link>
          )}
        </div>
      ))}

      {/* výber systému, ak je viac možností */}
      {systemy.length > 1 && (
        <div className="print:hidden mt-6 flex flex-wrap gap-2">
          {systemy.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSystem(s.id)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-colors ${
                s.id === system.id
                  ? "border-[#3db6e8] bg-[#e3f3fb] text-[#0e1a3b]"
                  : "border-zinc-200 text-zinc-600 hover:border-[#3db6e8]"
              }`}
            >
              {s.nazov}
            </button>
          ))}
        </div>
      )}

      <h1 className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight text-[#0e1a3b]">
        {system.nazov}
      </h1>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#4a5478]">
        {system.vlastnosti.map((v) => (
          <li key={v} className="inline-flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#16a34a] shrink-0" aria-hidden />
            {v}
          </li>
        ))}
      </ul>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">
        {/* B — skladba */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="px-5 py-3 bg-[#0e1a3b] text-white font-extrabold">Skladba systému</div>
          <ol className="divide-y divide-zinc-100">
            {vysledok.riadky.map((r) => (
              <li key={`${r.poradie}-${r.produktSku}`} className="px-5 py-3.5 flex flex-wrap items-start gap-x-4 gap-y-1">
                <span className="w-7 h-7 shrink-0 inline-flex items-center justify-center rounded-full bg-[#e3f3fb] text-[#1a8cc4] text-sm font-extrabold tabular-nums">
                  {r.poradie}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#0e1a3b]">
                    {r.nazov}
                    {r.auto && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-[#e3f3fb] text-[#1a8cc4] text-[10px] font-bold uppercase">
                        doplnené
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-[#4a5478]">
                    {r.produktSku ? (
                      <Link href={`/eshop/${r.produktSku}`} className="hover:text-[#1a8cc4] hover:underline">
                        {r.produktNazov}
                      </Link>
                    ) : (
                      r.produktNazov
                    )}
                  </span>
                  {r.spotrebaKgM2 != null && (
                    <span className="block text-xs text-[#6b7390] tabular-nums">
                      {r.pocetBaleni} {r.pocetBaleni === 1 ? "balenie" : (r.pocetBaleni ?? 0) < 5 ? "balenia" : "balení"} ={" "}
                      {Math.round((r.pocetBaleni ?? 0) * r.velkostBaleniaKg * 10) / 10} kg · spotreba {r.potrebaKg} kg · zvýši{" "}
                      {r.zvysiKg} kg
                    </span>
                  )}
                  {r.poznamka && <span className="block text-xs text-[#6b7390] italic">{r.poznamka}</span>}
                </span>
                <span className="text-right whitespace-nowrap tabular-nums">
                  {r.cenaSpolu != null ? (
                    <span className="font-extrabold text-[#0e1a3b]">{fmtEur(r.cenaSpolu)} €</span>
                  ) : r.bezMaterialu ? (
                    <span className="text-xs text-zinc-400">bez materiálu</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700">cena na dopyt</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* D — súhrn a cena */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-28 space-y-3">
          <div className="rounded-2xl bg-[#0e1a3b] text-white p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-white/60">Materiál</div>
            <div className="text-3xl font-extrabold tabular-nums">
              {vysledok.maNaDopyt && "od "}
              {fmtEur(vysledok.cenaMaterialu)} €
            </div>
            {vysledok.cenaSluzieb > 0 && (
              <div className="mt-2 flex justify-between text-sm text-white/80">
                <span>Zošívanie prasklín ({volba.pocetPrasklin} ×)</span>
                <span className="tabular-nums">{fmtEur(vysledok.cenaSluzieb)} €</span>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-white/15 flex justify-between items-baseline">
              <span className="font-bold">Celkom</span>
              <span className="text-2xl font-extrabold tabular-nums">
                {vysledok.maNaDopyt && "od "}
                {fmtEur(vysledok.cenaSpolu)} €
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-white/60">Konečné ceny. Nie sme platiteľmi DPH.</p>
          </div>

          {/* C — časová os */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2 font-extrabold text-[#0e1a3b]">
              <Clock className="w-5 h-5 text-[#3db6e8]" aria-hidden />
              Realizácia zaberie ~{vysledok.dniRealizacie} dni
            </div>
            <div className="mt-3 space-y-2">
              {vysledok.riadky.map((r) => (
                <div key={`t-${r.poradie}`} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3db6e8] shrink-0" aria-hidden />
                  <span className="flex-1 text-[#4a5478]">{r.nazov}</span>
                  {r.prestavkaHodiny ? (
                    <span className="text-[#6b7390] whitespace-nowrap tabular-nums">
                      + {r.prestavkaHodiny} h prestávka
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#6b7390]">
              Prestávky sú technologické — vrstva musí vytvrdnúť, inak sa ďalšia neuchytí.
            </p>
          </div>

          <div className="print:hidden space-y-2">
            <button
              type="button"
              onClick={onDoKosika}
              className="press-scale w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#f97316] text-white font-extrabold hover:bg-[#ea580c] shadow-[0_10px_28px_rgba(249,115,22,0.4)] transition-colors"
            >
              {pridane ? (
                <>
                  <Check className="w-5 h-5" aria-hidden /> V košíku
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" aria-hidden /> Vložiť celú zostavu do košíka
                </>
              )}
            </button>
            <Link
              href={`/cenova-ponuka?zdroj=konfigurator&co=${volba.co}&m2=${efektivnaPlocha(volba) ?? ""}&vzhlad=${volba.vzhlad ?? ""}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#16a34a] text-white font-bold hover:bg-[#15803d] transition-colors text-center"
            >
              <Phone className="w-4 h-4 shrink-0" aria-hidden />
              Nechcem liať sám — chcem cenovú ponuku
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-zinc-200 font-bold text-[#4a5478] hover:border-zinc-400 transition-colors"
            >
              <Printer className="w-4 h-4" aria-hidden /> Stiahnuť ako PDF
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
