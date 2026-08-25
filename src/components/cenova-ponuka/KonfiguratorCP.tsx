"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, Check, Loader2, Phone, Sparkles } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { TYPY_PODLAH, type TypPodlahyKarta } from "@/content/typy-podlah";

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

type Krok = 1 | 2 | 3 | 4 | 5;

type Cena =
  | { ok: true; total: number; zaklad: number; zlava: number; zlava_pct: number; doprava: number; price_per_m2: number; system_label: string }
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

const STAV_PODKLADU = [
  "Nový betón",
  "Starý betón",
  "Dlažba",
  "Poter / nivelačka",
  "Neviem posúdiť",
];

const PLOCHY_RYCHLO = [20, 40, 60, 100, 150];

const DOVODY_NECHCE = [
  "Zatiaľ len zisťujem cenu",
  "Cena je pre mňa privysoká",
  "Riešim to až neskôr",
];

function Krokovnik({ krok }: { krok: Krok }) {
  const nazvy = ["Typ podlahy", "Plocha", "Priestor", "Kontakt", "Hotovo"];
  return (
    <ol className="flex items-center gap-1.5 md:gap-2.5 mb-5" aria-label="Postup">
      {nazvy.map((n, i) => {
        const c = (i + 1) as Krok;
        const hotovo = c < krok;
        const teraz = c === krok;
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
              {hotovo ? <Check className="w-3 h-3" aria-hidden /> : <span>{c}</span>}
              <span className="hidden sm:inline">{n}</span>
            </span>
            {i < nazvy.length - 1 && (
              <span aria-hidden className="w-3 md:w-5 h-px bg-[#1B2430]/15" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Pustí do poľa len číslice a jednu desatinnú čiarku. */
function lenCislo(v: string): string {
  const znaky = v.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const [prva, ...zvysok] = znaky.split(",");
  return zvysok.length > 0 ? `${prva},${zvysok.join("")}` : prva;
}

function euro(n: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function KonfiguratorCP() {
  const [krok, setKrok] = React.useState<Krok>(1);
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
        }),
      });
      setCena(await r.json());
    } catch {
      setCena({ ok: false, dovod: "cennik_nedostupny" });
    } finally {
      setCenaBezi(false);
    }
  }, [typ, plocha, plochaOk, lokalita]);

  const dalej = async (n: Krok) => {
    setKrok(n);
    hore();
    if (n >= 4) await nacitajCenu();
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
          turnstileToken,
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        setChyba("Odoslanie zlyhalo. Skús to prosím znovu alebo nám zavolaj.");
        return;
      }
      setKrok(5);
      hore();
    } catch {
      setChyba("Nepodarilo sa spojiť so serverom. Skús to prosím znovu.");
    } finally {
      setOdosielam(false);
    }
  };

  return (
    <div ref={vrch} className="w-full">
      <Krokovnik krok={krok} />

      <div className="rounded-3xl bg-white p-4 md:p-6 shadow-[0_10px_40px_rgba(27,36,48,0.10)]">
        {/* ── KROK 1 — typ podlahy ─────────────────────────────────────── */}
        {krok === 1 && (
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
                    void dalej(2);
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

        {/* ── KROK 2 — plocha ──────────────────────────────────────────── */}
        {krok === 2 && typ && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Koľko m² potrebuješ?
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/60">
              Stačí odhad — pri obhliadke to premeriame presne.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PLOCHY_RYCHLO.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setM2(String(p))}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                    m2 === String(p)
                      ? "bg-[#1B2430] text-white"
                      : "bg-[#f1f3f5] text-[#1B2430] hover:bg-[#e6f4fb] hover:text-[#15749e]",
                  ].join(" ")}
                >
                  {p} m²
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
                Alebo zadaj presne
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
                  placeholder="napr. 45"
                  className="w-full rounded-2xl border-2 border-[#1B2430]/12 bg-white px-4 py-3 pr-14 text-base font-bold text-[#1B2430] outline-none transition-colors focus:border-[#2EA3DC]"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1B2430]/45">
                  m²
                </span>
              </span>
            </label>
            <Navigacia
              spat={() => dalej(1)}
              dalej={() => dalej(3)}
              dalejOk={plochaOk}
            />
          </>
        )}

        {/* ── KROK 3 — priestor a lokalita ─────────────────────────────── */}
        {krok === 3 && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Kde to bude?
            </h2>
            <p className="mt-1 text-sm text-[#1B2430]/60">
              Podľa mesta dorátame dopravu, podľa podkladu prípravu.
            </p>
            <label className="mt-4 block">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B2430]/55">
                Mesto alebo obec
              </span>
              <input
                value={lokalita}
                onChange={(e) => setLokalita(e.target.value)}
                placeholder="napr. Žilina"
                className="mt-1 w-full rounded-2xl border-2 border-[#1B2430]/12 bg-white px-4 py-3 text-base font-semibold text-[#1B2430] outline-none transition-colors focus:border-[#2EA3DC]"
              />
            </label>
            <Vyber label="Priestor" moznosti={PRIESTORY} hodnota={priestor} zmen={setPriestor} />
            <Vyber label="Stav podkladu" moznosti={STAV_PODKLADU} hodnota={stavPodkladu} zmen={setStavPodkladu} />
            <Vyber label="Kedy to riešiš" moznosti={TERMINY} hodnota={termin} zmen={setTermin} />
            <Navigacia spat={() => dalej(2)} dalej={() => dalej(4)} dalejOk />
          </>
        )}

        {/* ── KROK 4 — cena + kontakt ──────────────────────────────────── */}
        {krok === 4 && typ && (
          <>
            <h2 className="text-lg md:text-xl font-extrabold text-[#1B2430]">
              Tvoja orientačná cena
            </h2>

            <div className="mt-3 rounded-2xl border-2 border-[#2EA3DC] bg-[#eaf6fc] p-4">
              <div className="flex items-start gap-3">
                <span className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white/60">
                  <Image src={typ.image} alt="" fill sizes="64px" className="object-cover" />
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
                        {cena.system_label} · {cena.price_per_m2} €/m²
                        {cena.zlava > 0 && ` · zľava ${cena.zlava_pct} % (−${euro(cena.zlava)})`}
                        {cena.doprava > 0 && ` · doprava ${euro(cena.doprava)}`}
                      </div>
                    </>
                  )}

                  {!cenaBezi && !cena?.ok && (
                    <div className="mt-1 text-sm text-[#1B2430]/70">
                      Túto podlahu ceníme individuálne — presnú ponuku ti pripraví
                      náš obchodník a pošleme ju na e-mail.
                    </div>
                  )}
                </div>
              </div>
              {cena?.ok && (
                <p className="mt-3 text-xs text-[#1B2430]/60">
                  Orientačná cena vrátane materiálu aj práce. Kompletnú
                  ponuku v PDF ti pošleme na e-mail, presnú potvrdíme po obhliadke.
                </p>
              )}
            </div>

            {/* Otázka HNEĎ pod cenou — user 2026-08-24: „musi sa tato tam
                opytat pod cenou ci mas zaujem o nezavazny telefonat
                s obchodnim zastupcom". */}
            <div className="mt-4 rounded-2xl border-2 border-[#1B2430]/12 p-4">
              <p className="font-extrabold text-[#1B2430]">
                Máš záujem o nezáväzný telefonát s obchodným zástupcom?
              </p>
              <p className="mt-0.5 text-sm text-[#1B2430]/60">
                Prejde s tebou podklad, termín aj možnosti. Nič tým nepodpisuješ.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setChceKontakt(true)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
                    chceKontakt
                      ? "bg-[#1B2430] text-white"
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
                    "rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
                    !chceKontakt
                      ? "bg-[#1B2430] text-white"
                      : "bg-[#f1f3f5] text-[#1B2430] hover:bg-[#e6f4fb] hover:text-[#15749e]",
                  ].join(" ")}
                >
                  Nie, stačí mi ponuka e-mailom
                </button>
              </div>
              {!chceKontakt && (
                <Vyber
                  label="Prečo zatiaľ nie (nepovinné)"
                  moznosti={DOVODY_NECHCE}
                  hodnota={dovodNechce}
                  zmen={setDovodNechce}
                />
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Pole label="Meno a priezvisko" hodnota={meno} zmen={setMeno} placeholder="Ján Novák" />
              <Pole label="E-mail" hodnota={email} zmen={setEmail} placeholder="jan@email.sk" typ="email" />
            </div>
            <Pole label="Telefón (nepovinné)" hodnota={telefon} zmen={setTelefon} placeholder="0900 000 000" typ="tel" />

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
                onClick={() => dalej(3)}
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
        {krok === 5 && (
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
}: {
  label: string;
  hodnota: string;
  zmen: (v: string) => void;
  placeholder?: string;
  typ?: string;
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
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border-2 border-[#1B2430]/12 bg-white px-4 py-3 text-base font-semibold text-[#1B2430] outline-none transition-colors focus:border-[#2EA3DC]"
      />
    </label>
  );
}
