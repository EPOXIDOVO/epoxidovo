"use client";

import * as React from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { AlertTriangle, RotateCcw, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { trackEvent } from "@/components/analytics/Analytics";

/**
 * Reusable Turnstile widget — Cloudflare CAPTCHA replacement.
 *
 * Validuje že odosielateľ formulára nie je bot. Token sa pripojí
 * k POST /api/lead → server-side verify cez CF Turnstile API.
 *
 * Usage:
 *   <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
 *
 * PREČO tá hláška dole: odosielacie tlačidlá sú zamknuté na token. Keď
 * overenie ticho zlyhalo (blokovač reklám, firemná sieť, výpadok CF),
 * človek videl len navždy šedé tlačidlo bez dôvodu a odišiel. Preto
 * každé zlyhanie povie, čo sa stalo, dá „skúsiť znova" a telefón ako
 * záchranu — objednávku vieme dokončiť aj po telefóne.
 */

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  /** Farebná téma widgetu — default light (biele formuláre), dark pre tmavé landingy. */
  theme?: "light" | "dark" | "auto";
}

/** Ako dlho čakáme na vykreslenie widgetu, kým to vyhlásime za nenačítané. */
const WATCHDOG_MS = 12_000;
/**
 * Ako dlho po vykreslení kontajnera čakáme na samotnú výzvu (iframe).
 * Kontajner totiž vznikne aj vtedy, keď sa výzva nikdy nevykreslí — vtedy
 * ostane vnútri prázdny <div> a token nepríde. Bez tejto kontroly by človek
 * videl len navždy šedé tlačidlo bez jediného vysvetlenia.
 */
const IFRAME_WATCHDOG_MS = 8_000;

type Stav = "cakam" | "nacitane" | "ok" | "nenacitalo" | "zlyhalo" | "nepodporovane";

export function TurnstileWidget({ onVerify, onExpire, theme = "light" }: Props) {
  const ref = React.useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [stav, setStav] = React.useState<Stav>("cakam");
  /** Obal okolo widgetu — hľadáme v ňom iframe s výzvou. */
  const obal = React.useRef<HTMLDivElement>(null);
  // Zmena kľúča = remount widgetu; „skúsiť znova" musí zabrať aj vtedy,
  // keď sa nenačítal ani samotný CF skript (vtedy reset() nemá čo resetovať).
  const [pokus, setPokus] = React.useState(0);

  // V dev (žiadny site key) preskočíme widget — vrátime fake token aby
  // formulár nebol blokovaný počas lokálneho testovania.
  React.useEffect(() => {
    if (!siteKey) {
      onVerify("dev-bypass");
    }
  }, [siteKey, onVerify]);

  // Watchdog — CF skript pri blokovaní nemusí vyvolať žiadny error event,
  // widget proste nikdy nenabehne. Bez tohto by hláška nikdy neprišla.
  React.useEffect(() => {
    if (!siteKey || stav !== "cakam") return;
    const t = window.setTimeout(() => setStav("nenacitalo"), WATCHDOG_MS);
    return () => window.clearTimeout(t);
  }, [siteKey, stav, pokus]);

  /**
   * Druhý watchdog — kontajner sa vykreslil, ale výzva v ňom nie je.
   * Prítomnosť iframe je presný rozlišovač: keď tam je, výzva len čaká na
   * kliknutie človeka a nesmieme mu podsúvať chybu. Keď tam nie je ani po
   * ôsmich sekundách, widget je rozbitý a treba ponúknuť náhradnú cestu.
   */
  React.useEffect(() => {
    if (!siteKey || stav !== "nacitane") return;
    const t = window.setTimeout(() => {
      if (!obal.current?.querySelector("iframe")) setStav("zlyhalo");
    }, IFRAME_WATCHDOG_MS);
    return () => window.clearTimeout(t);
  }, [siteKey, stav, pokus]);

  /* Zlyhanie overenia meriame — inak je to neviditeľný problém, ktorý sa
     prejaví len tým, že sa človek nedovolá a odíde. */
  const zlyhaloRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (stav !== "nenacitalo" && stav !== "zlyhalo" && stav !== "nepodporovane") return;
    if (zlyhaloRef.current === stav) return;
    zlyhaloRef.current = stav;
    trackEvent("turnstile_failed", { reason: stav });
  }, [stav]);

  const skusZnova = () => {
    setStav("cakam");
    setPokus((p) => p + 1);
  };

  if (!siteKey) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ⚠️ Turnstile site key chýba (dev mode — formulár prejde bez ochrany)
      </div>
    );
  }

  const jeChyba = stav === "nenacitalo" || stav === "zlyhalo" || stav === "nepodporovane";
  const tmava = theme === "dark";

  return (
    <div className="w-full">
      <div ref={obal}>
      <Turnstile
        key={pokus}
        ref={ref}
        siteKey={siteKey}
        options={{
          theme,
          size: "flexible",
          language: "sk",
        }}
        scriptOptions={{ onError: () => setStav("nenacitalo") }}
        /* Vykreslený kontajner NIE JE úspech — úspech je až token.
           Kým ho nemáme, ostávame v "nacitane" a beží druhý watchdog. */
        onWidgetLoad={() => setStav((s) => (s === "cakam" ? "nacitane" : s))}
        onSuccess={(token) => {
          setStav("ok");
          onVerify(token);
        }}
        onExpire={() => {
          onExpire?.();
          // Späť do "nacitane", nech sa watchdog znova ozbrojí — inak by
          // vypršaný token, ktorý sa už neobnoví, nechal tlačidlo navždy šedé.
          setStav("nacitane");
          ref.current?.reset();
        }}
        onTimeout={() => {
          onExpire?.();
          setStav("zlyhalo");
        }}
        onUnsupported={() => {
          onExpire?.();
          setStav("nepodporovane");
        }}
        onError={() => {
          onExpire?.();
          setStav("zlyhalo");
        }}
      />
      </div>

      {jeChyba && (
        <div
          role="alert"
          className={`mt-2 rounded-xl border px-3 py-2.5 text-left text-xs leading-relaxed ${
            tmava
              ? "border-amber-300/30 bg-amber-400/10 text-amber-50"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="flex items-start gap-1.5 font-bold">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {stav === "nepodporovane"
                ? "Tento prehliadač overenie „nie som robot“ nepodporuje."
                : stav === "zlyhalo"
                  ? "Overenie „nie som robot“ zlyhalo."
                  : "Overenie „nie som robot“ sa nenačítalo."}
            </span>
          </p>
          <p className={tmava ? "mt-1 text-amber-100/80" : "mt-1 text-amber-800"}>
            {stav === "nepodporovane"
              ? "Skús iný alebo novší prehliadač — alebo nám rovno zavolaj a vybavíme to spolu."
              : "Býva za tým blokovač reklám alebo prísnejšia sieť (firma, škola). Skús to znova, vypni blokovač — alebo nám zavolaj a dokončíme to za teba."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {stav !== "nepodporovane" && (
              <button
                type="button"
                onClick={skusZnova}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  tmava
                    ? "bg-amber-300/20 text-amber-50 hover:bg-amber-300/30"
                    : "bg-amber-200/70 text-amber-900 hover:bg-amber-200"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Skúsiť znova
              </button>
            )}
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className={`inline-flex items-center gap-1.5 text-xs font-bold underline ${
                tmava ? "text-amber-50" : "text-amber-900"
              }`}
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {SITE.contact.phone}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
