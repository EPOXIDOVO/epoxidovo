"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, Check, Loader2, Phone, Sparkles } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { TYPY_PODLAH, nahladTypu, type TypPodlahyKarta } from "@/content/typy-podlah";

/**
 * Konfigurátor cenovej ponuky — user 2026-08-24: „chcem urobit automaticke
 * cenove ponuky … taky konfigurator ze prvy krok ti to da na vyber aky typ
 * podlahy chces to su tie co vieme vycarovat".
 *
 * Krok 1 berie typy AJ ich úvodné fotky a ceny z @/content/typy-podlah —
 * z rovnakého zdroja ako sekcia „Čo všetko vieme vyčarovať" a náhľad fotky,
 * takže fotka na karte a fotka v konfigurátore sú vždy tá istá.
 *
 * Cenu NEPOČÍTAME na webe. Pýtame ju cez /api/cenova-ponuka/cena z NajCRM,
 * ktoré používa ten istý vzorec ako automatická CP posielaná do mailu.
 */

type Krok = "typ" | "prevedenie" | "plocha" | "priestor" | "kontakt" | "hotovo";

/** Systém = konkrétne zloženie podlahy z NajCRM (kód + ceny za hrúbky). */
type CennikSystem = {
  code: string;
  label: string;
  binder: string | null;
  floor_type: string | null;
  vyber_hrubky: boolean;
  hrubky: { hrubka: string | null; label: string | null; price_per_m2: number }[];
};

type Cena =
  | {
      ok: true;
      total: number;
      zaklad: number;
      zlava: number;
      zlava_pct: number;
      doprava: number;
      price_per_m2: number;
      system_label: string;
      hrubka_label?: string;
    }
  | { ok: false; dovod: string }
  | null;

const PRIESTORY = [
  "Garáž",
  "Dom / byt",
  "Dielňa",
  "Hala, sklad",
  "Predajňa, kancelária",
  "Iné",
];

const TERMINY = ["Čo najskôr", "Do 3 mesiacov", "Do pol roka", "Zatiaľ zisťujem"];

const PODKLAD = ["Betón", "Poter", "Dlaždice", "Neviem"];

/** Čo predvolíme, kým si zákazník nevyberie sám. */
const PREDVOLENA_HRUBKA = "1mm";

/**
 * Čo znamená pojivo. Obe možnosti hovoria o tých istých troch veciach
 * v rovnakom poradí — odolnosť, slnko, kam sa hodí — nech sa dajú porovnať.
 */
const BINDER_POPIS: Record<string, string> = {
  epoxid:
    "Tvrdší a odolnejší proti oderu. Na priamom slnku časom zožltne. Hodí sa do garáže, dielne či pivnice.",
  polyuretan:
    "Pružnejší a príjemnejší naboso. Slnko aj teplotné zmeny mu neprekážajú. Hodí sa do obytných priestorov.",
};

/** Popiska hrúbky — CRM posiela „Náter", zákazníkovi to spresníme. */
const HRUBKA_NAZOV: Record<string, string> = {
  nater: "Náter (~0,3 mm)",
};

/** Čo znamená hrúbka vrstvy. */
const HRUBKA_POPIS: Record<string, string> = {
  nater:
    "Tenký náter valcom. Najlacnejšia ochrana betónu, nerovnosti nevyrovná. Do garáže, pivnice či technickej miestnosti.",
  "1mm":
    "Liata stierka. Prekryje drobné nerovnosti a dá súvislý hladký povrch. Najčastejšia voľba do domu aj garáže.",
  "2mm":
    "Najhrubšia vrstva a najvyššia odolnosť proti záťaži aj oderu. Do dielní, prevádzok a priemyslu.",
};

const DOVODY_NECHCE = [
  "Zatiaľ len zisťujem cenu",
  "Cena je pre mňa privysoká",
  "Riešim to až neskôr",
];

const KROK_NAZOV: Record<Krok, string> = {
  typ: "Typ podlahy",
  prevedenie: "Prevedenie",
  plocha: "Plocha",
  priestor: "Priestor",
  kontakt: "Kontakt",
  hotovo: "Hotovo",
};

function Krokovnik({ kroky, krok }: { kroky: Krok[]; krok: Krok }) {
  const teraz_i = kroky.indexOf(krok);
  return (
    <ol className="flex items-center gap-1.5 md:gap-2.5 mb-5" aria-label="Postup">
      {kroky.map((k, i) => {
        const n = KROK_NAZOV[k];
        const hotovo = i < teraz_i;
        const teraz = i === teraz_i;
        return (
          <li key={n} className="flex items-center gap-1.5 md:gap-2.5">
            <span
              className={[
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] md:text-xs font-bold whitespace-nowrap transition-colors",
                teraz
                  ? "bg-[#1B2430] text-white"
                  : hotovo
                    ? "bg-[#e6f4fb] text-[#15749e]"
                    : "bg-white text-[#1B2430]/45 ring-1 ring-[#1B2430]/8",
              ].join(" ")}
            >
              {hotovo ? <Check className="w-3 h-3" aria-hidden /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{n}</span>
            </span>
            {i < kroky.length - 1 && (
              <span aria-hidden className="w-3 md:w-5 h-px bg-[#1B2430]/15" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Rez podlahou — betón zdola, na ňom vrstva epoxidu v hrúbke, ktorú si
 * zákazník vyberá. User 2026-08-25: „musi to byt graficky spracovane nejako
 * ze nater je takyto 1mm vrstva je takato 2mm takato".
 *
 * Výšky sú vizuálne, nie v mierke — reálny náter (~0,3 mm) by pri 2 mm
 * vrstve bol jeden pixel a nebolo by ho vidieť.
 */
function RezVrstvy({ hrubka }: { hrubka: string | null }) {
  // Betón má pevnú výšku a spoločnú základňu — mení sa LEN modrá vrstva,
  // inak sa tri obrázky nedajú medzi sebou porovnať.
  const vrstva = hrubka === "nater" ? 4 : hrubka === "1mm" ? 10 : 17;
  const W = 64;
  const H = 52;
  const BETON = 22;
  const betonY = H - 2 - BETON;
  const vrstvaY = betonY - vrstva;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0">
      {/* betónový podklad */}
      <rect x="2" y={betonY} width={W - 4} height={BETON} rx="2" fill="#cfd3d8" />
      <g fill="#aeb4bc">
        <circle cx="12" cy={betonY + 7} r="1.7" />
        <circle cx="26" cy={betonY + 14} r="1.3" />
        <circle cx="39" cy={betonY + 6} r="1.5" />
        <circle cx="52" cy={betonY + 15} r="1.2" />
        <circle cx="20" cy={betonY + 18} r="1.2" />
        <circle cx="46" cy={betonY + 10} r="1.4" />
      </g>
      {/* vrstva epoxidu */}
      <rect x="2" y={vrstvaY} width={W - 4} height={vrstva} rx="1.5" fill="#2EA3DC" />
      {/* lesk na povrchu */}
      <rect x="5" y={vrstvaY + 1} width={W - 16} height="1.4" rx="0.7" fill="#fff" opacity="0.6" />
      {/* kóta hrúbky vpravo */}
      <line
        x1={W - 0.75}
        y1={vrstvaY}
        x2={W - 0.75}
        y2={betonY}
        stroke="#1B2430"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Pustí do poľa len číslice a jednu desatinnú čiarku. */
function lenCislo(v: string): string {
  const znaky = v.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const [prva, ...zvysok] = znaky.split(",");
  return zvysok.length > 0 ? `${prva},${zvysok.join("")}` : prva;
}

/** Predvolená hrúbka — 1 mm, keď ju systém vie; inak jediná, čo má. */
function predvolenaHrubka(sys: CennikSystem | null): string | null {
  if (!sys) return null;
  return (
    sys.hrubky.find((h) => h.hrubka === PREDVOLENA_HRUBKA)?.hrubka ??
    sys.hrubky[0]?.hrubka ??
    null
  );
}

/** Systémy z CRM, ktoré sa dajú pri danom type vybrať. */
function prevedeniaPreTyp(
  t: TypPodlahyKarta | null,
  cennik: CennikSystem[] | null,
  defaultSystem: Record<string, string>,
): CennikSystem[] {
  if (!t?.crmFloorType || !cennik) return [];
  const kody = t.crmSystemy?.length
    ? t.crmSystemy
    : [defaultSystem[t.crmFloorType]].filter(Boolean);
  return kody
    .map((k) => cennik.find((s) => s.code === k))
    .filter((s): s is CennikSystem => Boolean(s));
}

function euro(n: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function KonfiguratorCP() {
  const [krok, setKrok] = React.useState<Krok>("typ");
  const [cennik, setCennik] = React.useState<CennikSystem[] | null>(null);
  const [defaultSystem, setDefaultSystem] = React.useState<Record<string, string>>({});
  /** Minimálna cena zákazky z /admin/systems. 0 = neuplatňuje sa. */
  const [minOrder, setMinOrder] = React.useState(0);
  const [system, setSystem] = React.useState<CennikSystem | null>(null);
  const [hrubka, setHrubka] = React.useState<string | null>(null);
  const [typ, setTyp] = React.useState<TypPodlahyKarta | null>(null);
  const [m2, setM2] = React.useState<string>("");
  const [priestor, setPriestor] = React.useState("");
  const [lokalita, setLokalita] = React.useState("");
  const [stavPodkladu, setStavPodkladu] = React.useState("");
  const [termin, setTermin] = React.useState("");
  const [meno, setMeno] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefon, setTelefon] = React.useState("");
  const [chceKontakt, setChceKontakt] = React.useState(true);
  const [dovodNechce, setDovodNechce] = React.useState("");

  const [cena, setCena] = React.useState<Cena>(null);
  const [cenaBezi, setCenaBezi] = React.useState(false);
  const [odosielam, setOdosielam] = React.useState(false);
  // Verejný formulár — bez anti-bot vrstvy by sa dal spamovať do CRM aj mailu.
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [chyba, setChyba] = React.useState<string | null>(null);

  // Prevedenia a ceny ťaháme z NajCRM — na webe nesmie sedieť ani jedna cena.
  React.useEffect(() => {
    let zrusene = false;
    fetch("/api/cenova-ponuka/cennik")
      .then((r) => r.json())
      .then((d) => {
        if (zrusene || !d?.ok || !Array.isArray(d.systemy)) return;
        setCennik(d.systemy);
        setDefaultSystem(d.default_system ?? {});
        setMinOrder(Number(d.min_order_eur ?? 0) || 0);
      })
      .catch(() => {
        /* bez cenníka ide dopyt ďalej, cenu pripraví obchodník */
      });
    return () => {
      zrusene = true;
    };
  }, []);

  /**
   * Prevedenia pre zvolený typ. Keď typ nemá vymenované `crmSystemy`,
   * vezmeme default systém z /admin/systems — vďaka tomu stačí pridať nový
   * typ podlahy do @/content/typy-podlah a v ponuke funguje sám.
   */
  const prevedenia = React.useMemo(
    () => prevedeniaPreTyp(typ, cennik, defaultSystem),
    [typ, cennik, defaultSystem],
  );

  /** Krok „Prevedenie" má zmysel len keď je z čoho vyberať. */
  const maPrevedenie =
    prevedenia.length > 1 || (prevedenia.length === 1 && prevedenia[0].vyber_hrubky);

  const kroky = React.useMemo<Krok[]>(
    () =>
      maPrevedenie
        ? ["typ", "plocha", "priestor", "prevedenie", "kontakt", "hotovo"]
        : ["typ", "plocha", "priestor", "kontakt", "hotovo"],
    [maPrevedenie],
  );

  /** Cena €/m² pre práve zvolený systém a hrúbku — zdroj je cenník z CRM. */
  const cenaZaM2 =
    system?.hrubky.find((h) => h.hrubka === hrubka)?.price_per_m2 ??
    system?.hrubky[0]?.price_per_m2 ??
    null;

  const plocha = Number(m2.replace(",", "."));
  const plochaOk = isFinite(plocha) && plocha > 0;
  const vrch = React.useRef<HTMLDivElement | null>(null);

  const hore = () => vrch.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /** Cenu ťaháme z CRM hneď ako poznáme typ + plochu (lokalita ju spresní). */
  const nacitajCenu = React.useCallback(async () => {
    if (!typ?.crmFloorType || !plochaOk) {
      setCena(null);
      return;
    }
    setCenaBezi(true);
    try {
      const r = await fetch("/api/cenova-ponuka/cena", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          floor_type: typ.crmFloorType,
          m2: plocha,
          lokalita: lokalita || undefined,
          system_code: system?.code,
          hrubka,
        }),
      });
      setCena(await r.json());
    } catch {
      setCena({ ok: false, dovod: "cennik_nedostupny" });
    } finally {
      setCenaBezi(false);
    }
  }, [typ, plocha, plochaOk, lokalita, system, hrubka]);

  const chod = async (n: Krok) => {
    setKrok(n);
    hore();
    if (n === "kontakt") await nacitajCenu();
  };

  const posun = (o: 1 | -1) => {
    const i = kroky.indexOf(krok);
    const d = kroky[i + o];
    if (d) void chod(d);
  };

  const odosli = async () => {
    setChyba(null);
    if (!typ || !plochaOk || !meno.trim() || !email.trim() || !turnstileToken) return;
    setOdosielam(true);
    try {
      const r = await fetch("/api/cenova-ponuka/odoslat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: meno.trim(),
          email: email.trim(),
          phone: telefon.trim(),
          floor_type: typ.crmFloorType ?? "jednofarebna",
          m2: plocha,
          priestor,
          lokalita,
          termin,
          stav_podkladu: stavPodkladu,
          chce_kontakt: chceKontakt,
          dovod_nechce: chceKontakt ? "" : dovodNechce,
          system_code: system?.code,
          hrubka,
          turnstileToken,
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        setChyba("Odoslanie zlyhalo. Skús to prosím znovu alebo nám zavolaj.");
        return;
      }
      setKrok("hotovo");
      hore();
    } catch {
      setChyba("Nepodarilo sa spojiť so serverom. Skús to prosím znovu.");
    } finally {
      setOdosielam(false);
    }
  };

  return (
    <div ref={vrch} className="w-full">
      <Krokovnik kroky={kroky} krok={krok} />

      <div className="rounded-3xl bg-white p-4 md:p-6 shadow-[0_10px_40px_rgba(27,36,48,0.10)]">
        {/* ── KROK 1 — typ podlahy ─────────────────────────────────────── */}
        {krok === "typ" && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Akú podlahu chceš?
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/60">
              Vyber typ — ceny sú orientačné, presnú spočítame v ďalšom kroku.
            </p>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
              {TYPY_PODLAH.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => {
                    setTyp(t);
                    // Prevedenia počítame rovno z `t` — `typ` v state sa
                    // aktualizuje až po tomto renderi.
                    const dostupne = prevedeniaPreTyp(t, cennik, defaultSystem);
                    const prvy = dostupne[0] ?? null;
                    setSystem(prvy);
                    setHrubka(predvolenaHrubka(prvy));
                    void chod("plocha");
                  }}
                  className={[
                    "group flex h-full flex-col text-left rounded-2xl overflow-hidden ring-1 transition-all",
                    "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(27,36,48,0.16)]",
                    typ?.slug === t.slug
                      ? "ring-[3px] ring-[#2EA3DC]"
                      : "ring-[#1B2430]/10 hover:ring-[#2EA3DC]/60",
                  ].join(" ")}
                >
                  <span className="relative block aspect-[4/3] bg-[#f1f3f5]">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      sizes="(max-width: 1024px) 45vw, 260px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="flex flex-1 flex-col p-3">
                    <span className="block font-extrabold text-[#1B2430] leading-tight">
                      {t.name}
                    </span>
                    <span className="mt-auto pt-1 block text-sm font-bold text-[#15749e]">
                      {t.priceFrom > 0 ? (
                        <>
                          od {t.priceFrom} € <span className="text-[#1B2430]/50 font-semibold">/m²</span>
                        </>
                      ) : (
                        (t.priceLabel ?? "Cena na dopyt")
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── KROK: PREVEDENIE — materiál a hrúbka vrstvy ──────────────── */}
        {krok === "prevedenie" && typ && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Aké prevedenie?
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/60">
              Líšia sa cenou aj odolnosťou. Keď si nie si istý, nechaj
              predvolené — obchodník to s tebou prejde.
            </p>

            {prevedenia.length > 1 && (
              <div className="mt-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
                  Materiál
                </span>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                  {prevedenia.map((sys) => {
                    const zvoleny = system?.code === sys.code;
                    const odCeny = Math.min(...sys.hrubky.map((h) => h.price_per_m2));
                    return (
                      <button
                        key={sys.code}
                        type="button"
                        onClick={() => {
                          setSystem(sys);
                          setHrubka(predvolenaHrubka(sys));
                        }}
                        className={[
                          "rounded-2xl border-2 p-3 text-left transition-colors",
                          zvoleny
                            ? "border-[#2EA3DC] bg-[#eaf6fc]"
                            : "border-[#1B2430]/12 hover:border-[#2EA3DC] hover:bg-[#f7fcff]",
                        ].join(" ")}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-extrabold text-[#1B2430]">
                            {sys.binder === "polyuretan" ? "Polyuretán" : "Epoxid"}
                          </span>
                          <span className="text-sm font-bold text-[#15749e] whitespace-nowrap">
                            od {odCeny} €/m²
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-[#1B2430]/65 leading-snug">
                          {BINDER_POPIS[sys.binder ?? ""] ?? sys.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {system && system.hrubky.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
                  Hrúbka vrstvy
                </span>
                {/* Keď je hrúbka daná (polyuretán = vždy 2 mm), aj tak ju
                    ukážeme aj s rezom — user 2026-08-25: „daj noramlne ze
                    ukazuje vrstvu a nech tam je napisane ze PU sa da iba 2mm". */}
                {!system.vyber_hrubky && (
                  <p className="mt-1 text-sm text-[#1B2430]/65">
                    {system.binder === "polyuretan"
                      ? "Polyuretán sa lieva len v 2 mm — tenšia vrstva pri ňom neexistuje."
                      : "Pri tomto systéme je hrúbka daná."}
                  </p>
                )}
                <div className="mt-1.5 grid gap-2">
                  {system.hrubky.map((h) => {
                    const zvolena = hrubka === h.hrubka;
                    return (
                      <button
                        key={h.hrubka ?? "jedna"}
                        type="button"
                        onClick={() => setHrubka(h.hrubka)}
                        disabled={!system.vyber_hrubky}
                        className={[
                          "flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors",
                          zvolena
                            ? "border-[#2EA3DC] bg-[#eaf6fc]"
                            : "border-[#1B2430]/12 hover:border-[#2EA3DC] hover:bg-[#f7fcff]",
                          system.vyber_hrubky ? "" : "cursor-default",
                        ].join(" ")}
                      >
                        <RezVrstvy hrubka={h.hrubka} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="font-extrabold text-[#1B2430]">
                              {HRUBKA_NAZOV[h.hrubka ?? ""] ?? h.label}
                              {h.hrubka === PREDVOLENA_HRUBKA && system.vyber_hrubky && (
                                <span className="ml-2 align-middle rounded-full bg-[#e6f4fb] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#15749e] whitespace-nowrap">
                                  Odporúčame
                                </span>
                              )}
                            </span>
                            <span className="text-sm font-bold text-[#15749e] whitespace-nowrap">
                              {h.price_per_m2} €/m²
                            </span>
                          </span>
                          <span className="mt-1 block text-xs text-[#1B2430]/65 leading-snug">
                            {HRUBKA_POPIS[h.hrubka ?? ""] ?? ""}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {cenaZaM2 != null && plochaOk && (
              <div className="mt-4 rounded-2xl bg-[#f4f7fa] p-3.5">
                <div className="text-center font-extrabold text-[#1B2430] tabular-nums">
                  {cenaZaM2} €/m² × {plocha} m² ={" "}
                  <span className="text-[#15749e]">{euro(cenaZaM2 * plocha)}</span>
                </div>
                <p className="mt-1.5 text-center text-xs text-[#1B2430]/65 leading-snug">
                  V cene je brúsenie podkladu, penetrácia aj vyspravenie drobných
                  prasklín. Doprava sa doráta v ďalšom kroku.
                  {minOrder > 0 &&
                    ` Pri ploche pod 30 m² platí minimálna cena zákazky ${euro(minOrder)}.`}
                </p>
              </div>
            )}

            <Navigacia spat={() => posun(-1)} dalej={() => posun(1)} dalejOk={Boolean(system)} />
          </>
        )}

        {/* ── KROK 2 — plocha ──────────────────────────────────────────── */}
        {krok === "plocha" && typ && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Koľko m² potrebuješ?
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/60">
              Stačí odhad — pri obhliadke to premeriame presne.
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
                Plocha podlahy
              </span>
              <span className="mt-1 relative block">
                {/* type="text" zámerne — number input pridáva šípky, ktoré sa
                    prekrývali s príponou „m²". Do poľa sa aj tak nedostane nič
                    iné ako číslice a jedna desatinná čiarka. */}
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={m2}
                  onChange={(e) => setM2(lenCislo(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && plochaOk) {
                      e.preventDefault();
                      posun(1);
                    }
                  }}
                  placeholder="napr. 45"
                  className="w-full rounded-2xl border-2 border-[#1B2430]/12 bg-white px-4 py-3 pr-14 text-base font-bold text-[#1B2430] outline-none transition-colors focus:border-[#2EA3DC]"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1B2430]/45">
                  m²
                </span>
              </span>
            </label>
            <Navigacia spat={() => posun(-1)} dalej={() => posun(1)} dalejOk={plochaOk} />
          </>
        )}

        {/* ── KROK 3 — priestor a lokalita ─────────────────────────────── */}
        {krok === "priestor" && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Kde to bude?
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/60">
              Podľa mesta dorátame dopravu, podľa podkladu prípravu.
            </p>
            <MestoPole hodnota={lokalita} zmen={setLokalita} onEnter={() => posun(1)} />
            <Vyber label="Priestor" moznosti={PRIESTORY} hodnota={priestor} zmen={setPriestor} />
            <Vyber label="Podklad" moznosti={PODKLAD} hodnota={stavPodkladu} zmen={setStavPodkladu} />
            <Vyber label="Kedy to riešiš" moznosti={TERMINY} hodnota={termin} zmen={setTermin} />
            <Navigacia spat={() => posun(-1)} dalej={() => posun(1)} dalejOk />
          </>
        )}

        {/* ── KROK 4 — cena + kontakt ──────────────────────────────────── */}
        {krok === "kontakt" && typ && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Tvoja orientačná cena
            </h2>

            <div className="mt-3 rounded-2xl border-2 border-[#2EA3DC] bg-[#eaf6fc] p-4">
              <div className="flex items-start gap-3">
                {/* Hlavná fotka typu, nie prvá z galérie — poradie fotiek
                    v galérii sa na náhľad v cene nesmie prejaviť. */}
                <span className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white/60">
                  <Image
                    src={nahladTypu(typ)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-[#1B2430]">
                    {typ.name} · {plocha} m²
                    {lokalita ? ` · ${lokalita}` : ""}
                  </div>

                  {cenaBezi && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-[#1B2430]/60">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                      Počítam cenu…
                    </div>
                  )}

                  {!cenaBezi && cena?.ok && (
                    <>
                      <div className="mt-0.5 text-3xl font-black text-[#1B2430] tabular-nums">
                        {euro(cena.total)}
                      </div>
                      <div className="text-xs text-[#1B2430]/60">
                        {cena.system_label}
                        {cena.hrubka_label ? ` · ${cena.hrubka_label}` : ""} ·{" "}
                        {cena.price_per_m2} €/m²
                        {cena.zlava > 0 && ` · zľava ${cena.zlava_pct} % (−${euro(cena.zlava)})`}
                        {cena.doprava > 0 && ` · doprava ${euro(cena.doprava)}`}
                      </div>
                    </>
                  )}

                  {!cenaBezi && !cena?.ok && (
                    <div className="mt-1 text-sm text-[#1B2430]/70">
                      Cena je na dopyt — dohodneme ju telefonicky po preštudovaní
                      podkladov ku zákazke.
                    </div>
                  )}
                </div>
              </div>
              {cena?.ok && (
                <p className="mt-3 text-xs text-[#1B2430]/60">
                  Presná cena sa môže mierne líšiť v závislosti od reálneho
                  stavu podkladu, ktorý sa potvrdí na obhliadke.
                </p>
              )}
            </div>

            {/* Otázka HNEĎ pod cenou — user 2026-08-24: „musi sa tato tam
                opytat pod cenou ci mas zaujem o nezavazny telefonat
                s obchodnim zastupcom". */}
            <div className="mt-4 rounded-2xl border-2 border-[#1B2430]/12 p-5 text-center">
              <p className="font-extrabold text-[#1B2430]">
                Máš záujem o nezáväzný telefonát s obchodným zástupcom?
              </p>
              <p className="mt-0.5 text-sm text-[#1B2430]/60">
                Prejde s tebou podklad, termín aj možnosti. Nič tým nepodpisuješ.
              </p>
              <div className="mt-3.5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setChceKontakt(true)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-colors",
                    chceKontakt
                      ? "bg-[#2EA3DC] text-white shadow-[0_4px_14px_rgba(46,163,220,0.35)]"
                      : "bg-[#f1f3f5] text-[#1B2430] hover:bg-[#e6f4fb] hover:text-[#15749e]",
                  ].join(" ")}
                >
                  <Phone className="w-4 h-4" aria-hidden />
                  Áno, ozvite sa mi
                </button>
                <button
                  type="button"
                  onClick={() => setChceKontakt(false)}
                  className={[
                    "rounded-full px-5 py-2.5 text-sm font-bold transition-colors",
                    !chceKontakt
                      ? "bg-[#2EA3DC] text-white shadow-[0_4px_14px_rgba(46,163,220,0.35)]"
                      : "bg-[#f1f3f5] text-[#1B2430] hover:bg-[#e6f4fb] hover:text-[#15749e]",
                  ].join(" ")}
                >
                  Nie, stačí mi ponuka e-mailom
                </button>
              </div>
              {!chceKontakt && (
                <div className="[&_div]:justify-center">
                  <Vyber
                    label="Prečo zatiaľ nie (nepovinné)"
                    moznosti={DOVODY_NECHCE}
                    hodnota={dovodNechce}
                    zmen={setDovodNechce}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Pole label="Meno a priezvisko" hodnota={meno} zmen={setMeno} placeholder="Ján Novák" onEnter={odosli} />
              <Pole label="E-mail" hodnota={email} zmen={setEmail} placeholder="jan@email.sk" typ="email" onEnter={odosli} />
            </div>
            <Pole label="Telefón (nepovinné)" hodnota={telefon} zmen={setTelefon} placeholder="0900 000 000" typ="tel" onEnter={odosli} />

            {chyba && (
              <p className="mt-3 rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-semibold text-[#a4262c]">
                {chyba}
              </p>
            )}

            <div className="mt-4">
              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => posun(-1)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-[#1B2430]/70 transition-colors hover:bg-[#f1f3f5] hover:text-[#1B2430]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden />
                Späť
              </button>
              <button
                type="button"
                onClick={odosli}
                disabled={odosielam || !meno.trim() || !email.trim() || !turnstileToken}
                className="inline-flex items-center gap-2 rounded-full bg-[#ea580c] px-6 py-3 font-extrabold text-white transition-all hover:-translate-y-0.5 disabled:opacity-45 disabled:hover:translate-y-0 whitespace-nowrap"
              >
                {odosielam ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="w-4 h-4" aria-hidden />
                )}
                Poslať cenovú ponuku
              </button>
            </div>
          </>
        )}

        {/* ── KROK 5 — hotovo ──────────────────────────────────────────── */}
        {krok === "hotovo" && (
          <div className="py-6 text-center">
            <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-[#e6f7ee]">
              <Check className="w-7 h-7 text-[#1a7f4b]" aria-hidden />
            </span>
            <h2 className="mt-3 text-xl font-extrabold text-[#1B2430]">
              Hotovo, máme to
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/70 max-w-md mx-auto">
              Cenovú ponuku ti pošleme na <strong>{email}</strong> do pár minút.
              {chceKontakt
                ? " Obchodník sa ti ozve, aby prešiel podklad a termín."
                : " Keby si sa rozhodol inak, ozvi sa nám kedykoľvek."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Navigacia({
  spat,
  dalej,
  dalejOk,
}: {
  spat: () => void;
  dalej: () => void;
  dalejOk: boolean;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={spat}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-[#1B2430]/70 transition-colors hover:bg-[#f1f3f5] hover:text-[#1B2430]"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Späť
      </button>
      <button
        type="button"
        onClick={dalej}
        disabled={!dalejOk}
        className="rounded-full bg-[#1B2430] px-6 py-3 font-extrabold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 whitespace-nowrap"
      >
        Pokračovať
      </button>
    </div>
  );
}

function Vyber({
  label,
  moznosti,
  hodnota,
  zmen,
}: {
  label: string;
  moznosti: string[];
  hodnota: string;
  zmen: (v: string) => void;
}) {
  return (
    <div className="mt-4">
      <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
        {label}
      </span>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {moznosti.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => zmen(hodnota === m ? "" : m)}
            className={[
              "rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
              hodnota === m
                ? "bg-[#1B2430] text-white"
                : "bg-[#f1f3f5] text-[#1B2430] hover:bg-[#e6f4fb] hover:text-[#15749e]",
            ].join(" ")}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

function Pole({
  label,
  hodnota,
  zmen,
  placeholder,
  typ = "text",
  onEnter,
}: {
  label: string;
  hodnota: string;
  zmen: (v: string) => void;
  placeholder?: string;
  typ?: string;
  onEnter?: () => void;
}) {
  return (
    <label className="mt-3 block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
        {label}
      </span>
      <input
        type={typ}
        value={hodnota}
        onChange={(e) => zmen(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border-2 border-[#1B2430]/12 bg-white px-4 py-3 text-base font-semibold text-[#1B2430] outline-none transition-colors focus:border-[#2EA3DC]"
      />
    </label>
  );
}


/**
 * Pole mesta s napovedaním — user 2026-08-25: „ma to byt prediktivne a ma
 * sa to doplnat samo ked napisem Zi tak mi ma samo pitchnut zilinu".
 *
 * Zoznam obcí je ten istý, z akého NajCRM ráta dopravu (sk-places), takže
 * čo pole ponúkne, to vie CRM aj naceniť. Načítava sa až pri prvom písmene,
 * nech 64 kB nesedí v bundli pre každého, kto sem príde.
 */
function MestoPole({
  hodnota,
  zmen,
  onEnter,
}: {
  hodnota: string;
  zmen: (v: string) => void;
  /** Enter mimo otvorenej ponuky potvrdí krok. */
  onEnter?: () => void;
}) {
  const [obce, setObce] = React.useState<string[] | null>(null);
  const [otvorene, setOtvorene] = React.useState(false);
  const [aktivny, setAktivny] = React.useState(0);
  const obal = React.useRef<HTMLDivElement | null>(null);

  const nacitaj = React.useCallback(async () => {
    if (obce) return;
    const m = await import("@/content/sk-obce.json");
    setObce((m.default ?? m) as unknown as string[]);
  }, [obce]);

  // klik mimo zatvorí ponuku
  React.useEffect(() => {
    if (!otvorene) return;
    const mimo = (e: MouseEvent) => {
      if (obal.current && !obal.current.contains(e.target as Node)) setOtvorene(false);
    };
    document.addEventListener("mousedown", mimo);
    return () => document.removeEventListener("mousedown", mimo);
  }, [otvorene]);

  const navrhy = React.useMemo(() => {
    const q = bezDiakritiky(hodnota);
    if (!obce || q.length < 2) return [];
    const zaciatok: string[] = [];
    const vnutri: string[] = [];
    for (const o of obce) {
      const n = bezDiakritiky(o);
      if (n.startsWith(q)) zaciatok.push(o);
      else if (n.includes(q)) vnutri.push(o);
      if (zaciatok.length >= 8) break;
    }
    return [...zaciatok, ...vnutri].slice(0, 8);
  }, [obce, hodnota]);

  const vyber = (o: string) => {
    zmen(o);
    setOtvorene(false);
  };

  return (
    <div className="mt-4 relative" ref={obal}>
      <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
        Mesto alebo obec
      </span>
      <input
        value={hodnota}
        autoComplete="off"
        onFocus={() => void nacitaj()}
        onChange={(e) => {
          void nacitaj();
          zmen(e.target.value);
          setAktivny(0);
          setOtvorene(true);
        }}
        onKeyDown={(e) => {
          if (!otvorene || navrhy.length === 0) {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAktivny((i) => (i + 1) % navrhy.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setAktivny((i) => (i - 1 + navrhy.length) % navrhy.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            // Keď už je v poli presne to mesto, netreba ho „vyberať" znova —
            // Enter rovno potvrdí krok, nech to nechce dva stlačenia.
            if (bezDiakritiky(navrhy[aktivny]) === bezDiakritiky(hodnota)) {
              setOtvorene(false);
              onEnter?.();
            } else {
              vyber(navrhy[aktivny]);
            }
          } else if (e.key === "Escape") {
            setOtvorene(false);
          }
        }}
        placeholder="napr. Žilina"
        className="mt-1 w-full rounded-2xl border-2 border-[#1B2430]/12 bg-white px-4 py-3 text-base font-semibold text-[#1B2430] outline-none transition-colors focus:border-[#2EA3DC]"
      />
      {otvorene && navrhy.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(27,36,48,0.18)] ring-1 ring-[#1B2430]/10">
          {/* mousemove, nie mouseenter — ponuka sa otvorí pod kurzorom a
              mouseenter by hneď prepísal to, čo má človek vybrané klávesnicou,
              aj keď myšou vôbec nepohol */}
          {navrhy.map((o, i) => (
            <li key={o}>
              <button
                type="button"
                onMouseMove={() => setAktivny(i)}
                onClick={() => vyber(o)}
                className={[
                  "block w-full px-4 py-2.5 text-left text-sm font-bold transition-colors",
                  i === aktivny
                    ? "bg-[#e6f4fb] text-[#15749e]"
                    : "text-[#1B2430] hover:bg-[#f1f3f5]",
                ].join(" ")}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Porovnávame bez diakritiky — „Zi" musí nájsť „Žilinu". */
function bezDiakritiky(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
