"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  FileDown,
  Mail,
  Phone,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { SYSTEMS, type System } from "@/data/systems";
import {
  calcSystem,
  sumRooms,
  ThicknessError,
  type SystemCalc,
} from "@/lib/calculator";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { trackEvent } from "@/components/analytics/Analytics";
import { showToast } from "@/components/ui/Toast";
import { SITE } from "@/lib/site";

/**
 * Kalkulátor skladby — prezentačná vrstva redizajnovaná (2 stĺpce na
 * desktope: vľavo otázka, vpravo živý náhľad povrchu + zhrnutie volieb).
 * VÝPOČTOVÁ LOGIKA NEDOTKNUTÁ — všetko počíta lib/calculator.ts.
 *
 * Klávesnica: Enter = Ďalej. Mobile: sticky spodná lišta s cenou + CTA.
 */

type Miesto = "garaz" | "byt" | "dielna" | "terasa" | "schody" | "ine";
type Podklad = "poter" | "beton" | "dlazba" | "anhydrit" | "natery" | "neviem";
type Stav = "rovny" | "mierne" | "vyrazne";
type Vzhlad = "jednofarebna" | "chipsy" | "metalik" | "marble";

const MIESTA: { id: Miesto; label: string; img: string }[] = [
  { id: "garaz", label: "Garáž", img: "/images/hero/garaz.webp" },
  { id: "byt", label: "Byt / dom", img: "/images/hero/byvanie-v2.webp" },
  { id: "dielna", label: "Dielňa", img: "/images/realizacie/r-42.jpg" },
  { id: "terasa", label: "Terasa", img: "/images/realizacie/r-22.jpg" },
  { id: "schody", label: "Schody", img: "/images/realizacie/r-17.jpg" },
  { id: "ine", label: "Iné", img: "/images/hero/hala.jpg" },
];

const PODKLADY: { id: Podklad; label: string }[] = [
  { id: "poter", label: "Cementový poter" },
  { id: "beton", label: "Betón" },
  { id: "dlazba", label: "Existujúca dlažba" },
  { id: "anhydrit", label: "Anhydrit" },
  { id: "natery", label: "Staré nátery" },
  { id: "neviem", label: "Neviem" },
];

const STAVY: { id: Stav; label: string }[] = [
  { id: "rovny", label: "Rovný" },
  { id: "mierne", label: "Mierne nerovný" },
  { id: "vyrazne", label: "Výrazne nerovný / spádovaný" },
];

/** Vizuálne swatche vzhľadu — reálne fotky povrchov z našich dát. */
const VZHLADY: { id: Vzhlad; label: string; img: string; desc: string }[] = [
  { id: "jednofarebna", label: "Jednofarebná", img: "/images/hero/byvanie-v2.webp", desc: "Čistý monolitický povrch" },
  { id: "chipsy", label: "Chipsy", img: "/images/categories/chipsove.jpg", desc: "Vločky skryjú nečistoty" },
  { id: "metalik", label: "Metalik", img: "/images/eshop/topstone-metallic/sequoia.jpg", desc: "3D efekt, každá je originál" },
  { id: "marble", label: "Marble efekt", img: "/images/realizacie/r-37.webp", desc: "Mramorová kresba 3000FX" },
];

/** Farba vrstvy v reze podlahou podľa kategórie produktu. */
const LAYER_COLORS: Record<string, string> = {
  penetracia: "#E3C57E",
  nivelacia: "#A8ADB5",
  "hlavna-vrstva": "#3db6e8",
  "vrchny-lak": "#D9E7F0",
  posyp: "#D9B36A",
  doplnok: "#C4C9CF",
};

function pickSystem(vzhlad: Vzhlad, miesto: Miesto): System | null {
  const id =
    vzhlad === "chipsy"
      ? "chipsova-epoxid"
      : vzhlad === "metalik"
        ? "metalik-topstone"
        : vzhlad === "marble"
          ? "marble-fx"
          : miesto === "byt"
            ? "pu-klasik"
            : "garaz-jednofarebna-epoxid";
  return SYSTEMS.find((s) => s.id === id) ?? null;
}

interface Room {
  lengthM: string;
  widthM: string;
}

function fmt(n: number): string {
  return n.toFixed(2).replace(".", ",") + " €";
}

const inputCls =
  "block w-full appearance-none px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-base text-zinc-900 placeholder:text-zinc-500";

const chipCls = (active: boolean) =>
  `press-scale inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-[15px] transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3db6e8] ${
    active
      ? "bg-[#3db6e8] border-[#3db6e8] text-white"
      : "bg-white border-zinc-200 text-zinc-800 hover:border-[#3db6e8]"
  }`;

export function KalkulatorWizard({ initialMiesto }: { initialMiesto?: string }) {
  const { add } = useCart();

  const [step, setStep] = React.useState(0);
  const [miesto, setMiesto] = React.useState<Miesto | null>(
    (MIESTA.find((m) => m.id === initialMiesto)?.id as Miesto) ?? null,
  );
  const [plocha, setPlocha] = React.useState("");
  const [showRooms, setShowRooms] = React.useState(false);
  const [rooms, setRooms] = React.useState<Room[]>([{ lengthM: "", widthM: "" }]);
  const [podklad, setPodklad] = React.useState<Podklad | null>(null);
  const [stav, setStav] = React.useState<Stav | null>(null);
  const [hrubka, setHrubka] = React.useState("4");
  const [vzhlad, setVzhlad] = React.useState<Vzhlad | null>(null);
  const [ral, setRal] = React.useState<string>("RAL 7032");
  const [customRal, setCustomRal] = React.useState("");
  const [rezerva, setRezerva] = React.useState(5);
  const [naradie, setNaradie] = React.useState(true);
  const [excludedTools, setExcludedTools] = React.useState<string[]>([]);
  const [added, setAdded] = React.useState(false);

  const [emailModal, setEmailModal] = React.useState(false);
  const [leadModal, setLeadModal] = React.useState(false);

  const areaM2 = React.useMemo(() => {
    const direct = Number(plocha.replace(",", "."));
    if (direct > 0) return direct;
    return sumRooms(
      rooms.map((r) => ({
        lengthM: Number(r.lengthM.replace(",", ".")) || 0,
        widthM: Number(r.widthM.replace(",", ".")) || 0,
      })),
    );
  }, [plocha, rooms]);

  const system = vzhlad && miesto ? pickSystem(vzhlad, miesto) : null;
  const needsThickness = Boolean(
    system?.layers.some((l) => l.consumptionUnit === "kg/m2/mm"),
  );
  const ralProduct = system?.layers
    .map((l) => l.productId)
    .some((id) => ["sika-264-30kg", "topstone-ep02-ral-25kg"].includes(id));

  const hrubkaNum = Number(hrubka.replace(",", "."));
  const hrubkaOk = !needsThickness || hrubkaNum >= 4;

  const calc: SystemCalc | null = React.useMemo(() => {
    if (!system || !(areaM2 > 0)) return null;
    try {
      return calcSystem(system, {
        areaM2,
        reservePct: rezerva,
        thicknessMm: needsThickness ? hrubkaNum : undefined,
        includeTools: naradie,
        excludedTools,
      });
    } catch (e) {
      if (e instanceof ThicknessError) return null;
      throw e;
    }
  }, [system, areaM2, rezerva, needsThickness, hrubkaNum, naradie, excludedTools]);

  const chosenColor =
    ral === "custom" ? customRal.trim() || "iný RAL (pastel)" : ral;

  const STEPS = ["Kde", "Plocha", "Podklad", "Stav", "Vzhľad", "Rozpis"];

  const canNext =
    (step === 0 && miesto != null) ||
    (step === 1 && areaM2 > 0) ||
    (step === 2 && podklad != null) ||
    (step === 3 && stav != null) ||
    (step === 4 && vzhlad != null);

  const goNext = React.useCallback(() => {
    if (step < 5 && canNext) setStep((s) => s + 1);
  }, [step, canNext]);

  // Enter = Ďalej (mimo textarea/modálov)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !emailModal && !leadModal) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag !== "TEXTAREA" && tag !== "BUTTON" && tag !== "A") {
        e.preventDefault();
        goNext();
      }
    }
  };

  const cartItems: CartItem[] = React.useMemo(() => {
    if (!calc || !system) return [];
    return [
      ...calc.layers
        .filter((l) => l.packs != null)
        .map((l) => ({
          productId: l.product.id,
          qty: l.packs as number,
          systemLabel: system.name,
          systemId: system.id,
          color: l.product.colorOptions ? chosenColor : undefined,
        })),
      ...calc.tools.map((t) => ({
        productId: t.product.id,
        qty: t.qty,
        systemLabel: system.name,
        systemId: system.id,
      })),
    ];
  }, [calc, system, chosenColor]);

  // Živý náhľad vpravo: vzhľad > miesto > default
  const previewImg =
    (vzhlad && VZHLADY.find((v) => v.id === vzhlad)?.img) ||
    (miesto && MIESTA.find((m) => m.id === miesto)?.img) ||
    "/images/categories/metalicke.jpg";

  const addAll = () => {
    add(cartItems);
    showToast("Materiál je v košíku", "cart");
    setAdded(true);
    trackEvent("kalkulator_add_to_cart", { system: system?.id ?? "", area: areaM2 });
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto" onKeyDown={onKeyDown}>
      {/* progress — animovaný fill s glow na aktívnom segmente */}
      <div className="flex items-center gap-1.5 mb-6 max-w-3xl mx-auto lg:mx-0" aria-label="Priebeh kalkulácie">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            disabled={i > step}
            onClick={() => setStep(i)}
            className={`wizard-seg flex-1 h-2 rounded-full ${
              i < step
                ? "bg-[#3db6e8]"
                : i === step
                  ? "bg-[#f97316] is-active"
                  : "bg-zinc-200"
            } disabled:cursor-default`}
            aria-label={`Krok ${i + 1}: ${s}`}
            aria-current={i === step ? "step" : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* ── ĽAVÝ STĹPEC: otázky ── */}
        <div className="rounded-3xl bg-white p-5 md:p-8 shadow-[0_18px_50px_rgba(14,26,59,0.1)]">
          <div key={step} className="step-in">
            {/* KROK 0 */}
            {step === 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">Kde to bude?</h2>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MIESTA.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMiesto(m.id)}
                      aria-pressed={miesto === m.id}
                      className={`press-scale group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3db6e8] ${
                        miesto === m.id ? "border-[#3db6e8]" : "border-transparent hover:border-zinc-300"
                      }`}
                    >
                      <Image
                        src={m.img}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        quality={70}
                        className="object-cover"
                        aria-hidden
                      />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-white font-bold text-sm md:text-[15px]">
                        {m.label}
                      </span>
                      {miesto === m.id && (
                        <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3db6e8] text-white">
                          <Check className="w-4 h-4" aria-hidden />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {miesto === "terasa" && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
                    <span>
                      Epoxid v exteriéri <strong>nie je UV stabilný</strong>, žltne.
                      Pre terasu odporúčame polyuretán na mieru:{" "}
                      <Link href="/kontakt" className="underline font-semibold">kontaktuj nás</Link>.
                    </span>
                  </div>
                )}
                {miesto === "schody" && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                    Schody riešime individuálne (hrany, protišmyk).{" "}
                    <Link href="/kontakt" className="underline font-semibold">Napíš nám</Link>{" "}
                    alebo pokračuj a rozpis pošleme ako dopyt.
                  </div>
                )}
              </div>
            )}

            {/* KROK 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">Aká je plocha?</h2>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={100000}
                    value={plocha}
                    onChange={(e) => setPlocha(e.target.value)}
                    placeholder="napr. 24"
                    className={`${inputCls} w-40 tnum text-lg font-bold`}
                    aria-label="Plocha v m²"
                    autoFocus
                  />
                  <span className="font-bold text-[#4a5478]">m²</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRooms((v) => !v)}
                  className="mt-3 text-sm font-semibold text-[#1a8cc4] hover:underline"
                >
                  {showRooms ? "Skryť pomôcku" : "Nemám zmerané — vypočítať z miestností"}
                </button>
                {showRooms && (
                  <div className="mt-3 space-y-2">
                    {rooms.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="number" inputMode="decimal" placeholder="dĺžka m" value={r.lengthM}
                          onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, lengthM: e.target.value } : x)))}
                          className={`${inputCls} w-28 tnum`} aria-label={`Miestnosť ${i + 1} dĺžka v metroch`}
                        />
                        <span className="text-zinc-400" aria-hidden>×</span>
                        <input
                          type="number" inputMode="decimal" placeholder="šírka m" value={r.widthM}
                          onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, widthM: e.target.value } : x)))}
                          className={`${inputCls} w-28 tnum`} aria-label={`Miestnosť ${i + 1} šírka v metroch`}
                        />
                        {rooms.length > 1 && (
                          <button type="button" onClick={() => setRooms(rooms.filter((_, j) => j !== i))}
                            className="text-zinc-400 hover:text-red-500 font-bold px-2" aria-label={`Odobrať miestnosť ${i + 1}`}>
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setRooms([...rooms, { lengthM: "", widthM: "" }])}
                      className="text-sm font-semibold text-[#1a8cc4] hover:underline">
                      + pridať miestnosť
                    </button>
                    {!plocha && areaM2 > 0 && (
                      <div className="tnum text-sm font-bold text-[#0e1a3b]">Spolu: {areaM2} m²</div>
                    )}
                  </div>
                )}
                {areaM2 > 200 && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
                    Pri ploche nad 200 m² odporúčame{" "}
                    <Link href="/cenova-ponuka" className="underline font-semibold">individuálnu cenovú ponuku</Link>,
                    vieme dať lepšie podmienky.
                  </div>
                )}
              </div>
            )}

            {/* KROK 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">Aký je podklad?</h2>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PODKLADY.map((p) => (
                    <button key={p.id} type="button" onClick={() => setPodklad(p.id)}
                      aria-pressed={podklad === p.id} className={chipCls(podklad === p.id)}>
                      {p.label}
                    </button>
                  ))}
                </div>
                {podklad === "dlazba" && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
                    <span>
                      Liatie na dlažbu nesie <strong>riziko odtrhnutia a kopírovania
                      škár</strong>. Robíme ho len po posúdení a so samostatnou zmluvou
                      s vylúčením záruky.{" "}
                      <Link href="/kontakt" className="underline font-semibold">Kontaktuj nás</Link>{" "}
                      pred objednávkou.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* KROK 3 */}
            {step === 3 && (
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">Stav podkladu?</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {STAVY.map((s) => (
                    <button key={s.id} type="button" onClick={() => setStav(s.id)}
                      aria-pressed={stav === s.id} className={chipCls(stav === s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
                {stav === "vyrazne" && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-900">
                    Výrazne nerovný podklad treba vyrovnať nivelačkou. Odporúčame
                    skladbu <strong>Marble FX s Level-30</strong> (v ďalšom kroku vyber
                    „Marble efekt"), alebo nám zavolaj.
                  </div>
                )}
              </div>
            )}

            {/* KROK 4 */}
            {step === 4 && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">Aký vzhľad?</h2>
                  {/* Vizuálne swatche povrchov */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {VZHLADY.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVzhlad(v.id)}
                        aria-pressed={vzhlad === v.id}
                        className={`press-scale group relative aspect-[16/10] rounded-2xl overflow-hidden border-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3db6e8] ${
                          vzhlad === v.id ? "border-[#3db6e8]" : "border-transparent hover:border-zinc-300"
                        }`}
                      >
                        <Image
                          src={v.img}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, 260px"
                          quality={70}
                          className="object-cover"
                          aria-hidden
                        />
                        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/85 via-[#0a0f1e]/15 to-transparent" />
                        <span className="absolute bottom-2.5 left-3 right-3">
                          <span className="block text-white font-extrabold text-[15px] md:text-base">{v.label}</span>
                          <span className="block text-white/70 text-[11px] md:text-xs leading-tight">{v.desc}</span>
                        </span>
                        {vzhlad === v.id && (
                          <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3db6e8] text-white">
                            <Check className="w-4 h-4" aria-hidden />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {system && stav === "vyrazne" && !needsThickness && (
                    <p className="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      Zvolená skladba nemá nivelačnú vrstvu. Pri výrazne nerovnom
                      podklade odporúčame Marble efekt alebo konzultáciu.
                    </p>
                  )}
                </div>

                {needsThickness && (
                  <div>
                    <h3 className="font-bold text-[#0e1a3b]">Hrúbka nivelačky (mm)</h3>
                    <input
                      type="number" inputMode="decimal" min={4} max={30} value={hrubka}
                      onChange={(e) => setHrubka(e.target.value)}
                      className={`${inputCls} mt-2 w-32 tnum font-bold`} aria-label="Hrúbka nivelačky v milimetroch"
                    />
                    {!hrubkaOk && (
                      <p className="mt-2 text-sm font-semibold text-red-600" role="alert">
                        Level-30 sa nesmie liať tenšie ako 4 mm. Pri menšej hrúbke
                        stráca pevnosť a praská.
                      </p>
                    )}
                  </div>
                )}

                {ralProduct && (
                  <div>
                    <h3 className="font-bold text-[#0e1a3b]">Odtieň</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { id: "RAL 7032", hex: "#B8B799" },
                        { id: "RAL 7035", hex: "#D7D7D7" },
                      ].map((r) => (
                        <button key={r.id} type="button" onClick={() => setRal(r.id)}
                          aria-pressed={ral === r.id} className={chipCls(ral === r.id)}>
                          <span
                            aria-hidden
                            className="w-5 h-5 rounded-full border-2 border-white shadow ring-1 ring-black/15"
                            style={{ background: r.hex }}
                          />
                          {r.id}
                          <span className={`text-xs ${ral === r.id ? "text-white/80" : "text-zinc-500"}`}>
                            bez príplatku
                          </span>
                        </button>
                      ))}
                      <button type="button" onClick={() => setRal("custom")}
                        aria-pressed={ral === "custom"} className={chipCls(ral === "custom")}>
                        <span
                          aria-hidden
                          className="w-5 h-5 rounded-full border-2 border-white shadow ring-1 ring-black/15"
                          style={{ background: "conic-gradient(#e63244,#f5d033,#57a639,#2271b3,#e63244)" }}
                        />
                        Iný RAL (pastel)
                      </button>
                    </div>
                    {ral === "custom" && (
                      <div className="mt-2">
                        <input
                          type="text" placeholder="napr. RAL 5015" value={customRal}
                          onChange={(e) => setCustomRal(e.target.value)}
                          className={`${inputCls} w-44`} aria-label="Vlastný RAL odtieň"
                        />
                        <p className="mt-1.5 text-xs text-amber-800">
                          Pastelové RAL majú príplatok a dlhšiu dodaciu lehotu, potvrdíme
                          e-mailom. Inšpiruj sa vo{" "}
                          <Link href="/vzorkovnik" target="_blank" className="underline">vzorkovníku</Link>.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-[#0e1a3b] flex items-baseline justify-between">
                    <span>Rezerva materiálu</span>
                    <span className="tnum text-[#1a8cc4] text-lg">{rezerva} %</span>
                  </h3>
                  <input
                    type="range" min={0} max={15} step={1} value={rezerva}
                    onChange={(e) => setRezerva(Number(e.target.value))}
                    className="slider-aura mt-3 w-full"
                    style={{ "--fill": `${(rezerva / 15) * 100}%` } as React.CSSProperties}
                    aria-label="Rezerva materiálu v percentách"
                    aria-valuetext={`${rezerva} percent`}
                  />
                  <p className="mt-1.5 text-xs text-[#6b7390]">
                    Odporúčame 5 % na strihy, dorovnanie a prípadnú opravu.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox" checked={naradie} onChange={(e) => setNaradie(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#3db6e8]"
                  />
                  <span className="font-semibold text-[#0e1a3b]">
                    Pridať náradie a ochranné pomôcky
                  </span>
                </label>
              </div>
            )}

            {/* KROK 5 — ROZPIS */}
            {step === 5 && system && (
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0e1a3b]">{system.name}</h2>
                <p className="mt-1 text-sm text-[#6b7390]">
                  {areaM2} m² · rezerva {rezerva} %
                  {needsThickness ? ` · nivelačka ${hrubkaNum} mm` : ""}
                  {ralProduct ? ` · ${chosenColor}` : ""}
                </p>

                {!hrubkaOk ? (
                  <p className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700" role="alert">
                    Level-30 sa nesmie liať tenšie ako 4 mm. Vráť sa a uprav hrúbku.
                  </p>
                ) : calc ? (
                  <>
                    {/* Vizuálny rez podlahou — vrstvy s farebnými pruhmi */}
                    <ol className="mt-5 space-y-2.5" aria-label="Skladba podlahy po vrstvách">
                      {calc.layers.map((l, i) => (
                        <li
                          key={i}
                          className="grid grid-cols-[44px_1fr_auto] gap-3 items-stretch rounded-2xl border border-zinc-100 bg-[#fafaf8] overflow-hidden"
                        >
                          {/* farebný blok vrstvy = fyzická vrstva v reze */}
                          <div
                            className="relative flex items-center justify-center text-white font-extrabold"
                            style={{ background: LAYER_COLORS[l.product.category] ?? "#C4C9CF" }}
                            aria-hidden
                          >
                            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">{i + 1}</span>
                          </div>
                          <div className="py-3 min-w-0">
                            <div className="font-bold text-[#0e1a3b] text-sm">{l.layer.label}</div>
                            <div className="text-sm text-[#4a5478] truncate">{l.product.name}</div>
                            {l.need != null ? (
                              <div className="tnum text-xs text-[#6b7390] mt-0.5">
                                {l.layer.consumption} {l.layer.consumptionUnit} → {l.need}{" "}
                                {l.product.packUnit} → <strong>{l.packs} bal.</strong>{" "}
                                (prebytok {l.leftover} {l.product.packUnit})
                              </div>
                            ) : (
                              <div className="text-xs mt-0.5">
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                                  na dopyt
                                </span>
                              </div>
                            )}
                            {l.layer.note && (
                              <div className="text-xs text-zinc-400 mt-0.5">{l.layer.note}</div>
                            )}
                          </div>
                          <div className="py-3 pr-4 text-right shrink-0">
                            {l.totalPrice != null ? (
                              <>
                                <div className="tnum font-extrabold text-[#0e1a3b]">{fmt(l.totalPrice)}</div>
                                <div className="tnum text-xs text-zinc-400">
                                  {l.packs} × {fmt(l.pricePerPack as number)}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-amber-700">na dopyt</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>

                    {calc.tools.length > 0 && (
                      <details className="mt-4 rounded-2xl border border-zinc-200 overflow-hidden">
                        <summary className="cursor-pointer px-4 py-3 font-bold text-[#0e1a3b] bg-zinc-50 hover:bg-zinc-100 transition-colors">
                          Náradie a pomôcky ({calc.tools.length})
                        </summary>
                        <div className="divide-y divide-zinc-100 px-4">
                          {calc.tools.map((t) => (
                            <div key={t.product.id} className="py-2.5 flex items-center justify-between gap-3">
                              <label className="flex items-center gap-2 cursor-pointer text-sm">
                                {t.ownableAtHome && (
                                  <input
                                    type="checkbox"
                                    checked={!excludedTools.includes(t.product.id)}
                                    onChange={(e) =>
                                      setExcludedTools(
                                        e.target.checked
                                          ? excludedTools.filter((x) => x !== t.product.id)
                                          : [...excludedTools, t.product.id],
                                      )
                                    }
                                    className="w-4 h-4 accent-[#3db6e8]"
                                  />
                                )}
                                <span className="text-[#0e1a3b]">
                                  {t.qty}× {t.product.name}
                                  {t.ownableAtHome && (
                                    <span className="text-xs text-zinc-400"> (mám doma → odškrtni)</span>
                                  )}
                                </span>
                              </label>
                              <span className="tnum text-sm font-semibold shrink-0">
                                {t.totalPrice != null ? fmt(t.totalPrice) : (
                                  <span className="text-amber-700">na dopyt</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Medzisúčet */}
                    <div className="mt-5 rounded-2xl bg-[#0e1a3b] text-white p-5 md:p-6">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-bold">
                          {calc.priceIsFinal ? "Spolu" : "Medzisúčet"}
                        </span>
                        <span className="tnum text-3xl md:text-4xl font-extrabold tracking-tight">
                          {fmt(calc.priceSubtotal)}
                        </span>
                      </div>
                      {calc.pricePerM2 != null && (
                        <div className="tnum text-right text-sm text-white/60">
                          ≈ {fmt(calc.pricePerM2)} / m²
                        </div>
                      )}
                      {!calc.priceIsFinal && (
                        <p className="mt-2 text-sm text-amber-300">
                          Niektoré položky sú „na dopyt", cenu doladíme e-mailom.
                        </p>
                      )}
                      <p className="mt-2.5 text-xs text-white/50">
                        Dodávateľ nie je platiteľom DPH. Ceny sú konečné. Predaj v celých baleniach.
                      </p>
                    </div>

                    {calc.warnings.map((w, i) => (
                      <p key={i} className="mt-3 text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-xl p-3">
                        {w}
                      </p>
                    ))}

                    {/* CTA hierarchia */}
                    <div className="mt-6 space-y-3">
                      <button
                        type="button"
                        data-magnetic
                        onClick={addAll}
                        className={`press-scale w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-extrabold text-lg text-white transition-colors ${
                          added
                            ? "bg-emerald-600"
                            : "bg-[#f97316] hover:bg-[#ea580c] shadow-[0_12px_36px_rgba(249,115,22,0.5)]"
                        }`}
                      >
                        {added ? (
                          <><Check className="w-5 h-5" aria-hidden /> Pridané do košíka</>
                        ) : (
                          <><ShoppingCart className="w-5 h-5" aria-hidden /> Pridať všetko do košíka</>
                        )}
                      </button>
                      {added && (
                        <Link
                          href="/kupit-material/kosik"
                          className="block text-center text-sm font-bold text-[#1a8cc4] hover:underline"
                        >
                          Prejsť do košíka →
                        </Link>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setEmailModal(true)}
                          className="press-scale inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-zinc-300 font-bold text-[#0e1a3b] hover:border-[#0e1a3b] transition-colors"
                        >
                          <Mail className="w-4 h-4" aria-hidden /> Poslať rozpis na e-mail
                        </button>
                        <button
                          type="button"
                          disabled
                          title="Pripravujeme"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-zinc-200 font-bold text-zinc-400 cursor-not-allowed"
                        >
                          <FileDown className="w-4 h-4" aria-hidden /> Stiahnuť PDF (čoskoro)
                        </button>
                      </div>
                      {/* Tretí button — plná veľkosť, nezmenšovať */}
                      <button
                        type="button"
                        data-magnetic
                        onClick={() => setLeadModal(true)}
                        className="press-scale w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#16a34a] text-white font-extrabold text-lg hover:bg-[#15803d] shadow-[0_12px_36px_rgba(22,163,74,0.4)] transition-colors"
                      >
                        <Phone className="w-5 h-5" aria-hidden /> Nechám si to spraviť
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-[#4a5478]">Chýbajú vstupy, vráť sa o krok späť.</p>
                )}
              </div>
            )}
          </div>

          {/* navigácia */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="press-scale inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 border-zinc-200 font-semibold text-[#4a5478] disabled:opacity-40 hover:border-zinc-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden /> Späť
            </button>
            {step < 5 && (
              <button
                type="button"
                data-magnetic
                onClick={goNext}
                disabled={!canNext}
                className="press-scale inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#3db6e8] text-white font-bold disabled:opacity-40 hover:bg-[#1a8cc4] shadow-[0_8px_24px_rgba(61,182,232,0.4)] transition-colors"
              >
                {step === 4 ? (
                  <><Calculator className="w-4 h-4" aria-hidden /> Vypočítať</>
                ) : (
                  <>Ďalej <ArrowRight className="w-4 h-4" aria-hidden /></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── PRAVÝ STĹPEC: živý náhľad (len desktop) ── */}
        <aside className="hidden lg:block sticky top-24 space-y-4" aria-label="Náhľad výberu">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_18px_50px_rgba(14,26,59,0.18)]">
            <Image
              key={previewImg}
              src={previewImg}
              alt={vzhlad ? `Náhľad povrchu: ${VZHLADY.find((v) => v.id === vzhlad)?.label}` : "Náhľad realizácie"}
              fill
              sizes="400px"
              quality={80}
              className="object-cover step-in"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Tvoj výber
              </div>
              <ul className="mt-1.5 space-y-1 text-sm font-semibold">
                {miesto && <li>📍 {MIESTA.find((m) => m.id === miesto)?.label}</li>}
                {areaM2 > 0 && <li className="tnum">📐 {areaM2} m²</li>}
                {podklad && <li>🧱 {PODKLADY.find((p) => p.id === podklad)?.label}</li>}
                {vzhlad && <li>🎨 {VZHLADY.find((v) => v.id === vzhlad)?.label}{ralProduct ? ` · ${chosenColor}` : ""}</li>}
                {calc && step === 5 && (
                  <li className="tnum pt-1 text-lg font-extrabold text-[#6fcded]">
                    {calc.priceIsFinal ? "" : "od "}{fmt(calc.priceSubtotal)}
                  </li>
                )}
              </ul>
            </div>
          </div>
          <p className="text-xs text-[#6b7390] text-center px-4">
            Fotky sú z našich realizácií — ten istý materiál, ktorý kupuješ.
          </p>
        </aside>
      </div>

      {/* Sticky mobilná lišta s cenou + CTA (len na rozpise) */}
      {step === 5 && calc && hrubkaOk && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-3 flex items-center justify-between gap-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <div>
            <div className="text-[11px] text-[#6b7390] leading-none">
              {calc.priceIsFinal ? "Spolu" : "Medzisúčet"}
            </div>
            <div className="tnum text-xl font-extrabold text-[#0e1a3b]">
              {fmt(calc.priceSubtotal)}
            </div>
          </div>
          <button
            type="button"
            onClick={addAll}
            className={`press-scale inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm ${
              added ? "bg-emerald-600" : "bg-[#f97316]"
            }`}
          >
            {added ? <Check className="w-4 h-4" aria-hidden /> : <ShoppingCart className="w-4 h-4" aria-hidden />}
            {added ? "V košíku" : "Do košíka"}
          </button>
        </div>
      )}

      {emailModal && calc && system && (
        <RozpisEmailModal
          onClose={() => setEmailModal(false)}
          systemId={system.id}
          areaM2={areaM2}
          reservePct={rezerva}
          thicknessMm={needsThickness ? hrubkaNum : undefined}
          includeTools={naradie}
        />
      )}
      {leadModal && calc && system && (
        <NechamSiToSpravitModal
          onClose={() => setLeadModal(false)}
          system={system}
          calc={calc}
          chosenColor={ralProduct ? chosenColor : undefined}
        />
      )}
    </div>
  );
}

/* ── modal: poslať rozpis na e-mail (logika nezmenená) ─────────────────── */
function RozpisEmailModal(props: {
  onClose: () => void;
  systemId: string;
  areaM2: number;
  reservePct: number;
  thicknessMm?: number;
  includeTools: boolean;
}) {
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "ok" | "err">("idle");

  const send = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/rozpis-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          systemId: props.systemId,
          areaM2: props.areaM2,
          reservePct: props.reservePct,
          thicknessMm: props.thicknessMm,
          includeTools: props.includeTools,
          turnstileToken: token,
        }),
      });
      setState(res.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
  };

  return (
    <Modal onClose={props.onClose} title="Poslať rozpis na e-mail">
      {state === "ok" ? (
        <p className="text-emerald-700 font-semibold">Rozpis letí do schránky. 📬</p>
      ) : (
        <>
          <input
            type="email" placeholder="tvoj@email.sk" value={email}
            onChange={(e) => setEmail(e.target.value)} className={inputCls} aria-label="E-mail"
          />
          <div className="mt-3 flex justify-center">
            <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />
          </div>
          {state === "err" && (
            <p className="mt-2 text-sm text-red-600">Nepodarilo sa odoslať, skús znova.</p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={state === "sending" || !token || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
            className="press-scale mt-4 w-full px-6 py-3.5 rounded-full bg-[#3db6e8] text-white font-bold disabled:opacity-50 hover:bg-[#1a8cc4] transition-colors"
          >
            {state === "sending" ? "Posielam…" : "Poslať rozpis"}
          </button>
        </>
      )}
    </Modal>
  );
}

/* ── modal: nechám si to spraviť (logika nezmenená) ────────────────────── */
function NechamSiToSpravitModal(props: {
  onClose: () => void;
  system: System;
  calc: SystemCalc;
  chosenColor?: string;
}) {
  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "ok" | "err">("idle");

  const send = async () => {
    setState("sending");
    const rozpis = props.calc.layers
      .map(
        (l, i) =>
          `${i + 1}. ${l.layer.label}: ${l.product.name}${l.packs != null ? ` — ${l.packs} bal.` : " — na dopyt"}`,
      )
      .join("\n");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          area: Math.round(props.calc.areaM2),
          message: [
            `Kalkulátor e-shopu — chce realizáciu na kľúč.`,
            `Skladba: ${props.system.name}`,
            props.chosenColor ? `Odtieň: ${props.chosenColor}` : null,
            `Medzisúčet materiálu: ${props.calc.priceSubtotal.toFixed(2)} €`,
            ``,
            rozpis,
          ]
            .filter((x) => x != null)
            .join("\n"),
          consent: true,
          source: "kalkulator_eshop",
          turnstileToken: token,
        }),
      });
      setState(res.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
  };

  const valid =
    name.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    /^[+\d\s\-/()]{9,30}$/.test(phone.trim());

  return (
    <Modal onClose={props.onClose} title="Nechám si to spraviť">
      {state === "ok" ? (
        <p className="text-emerald-700 font-semibold">
          Ďakujeme! Rozpis sme dostali, obchodník sa ozve do 24 hodín a dohodne obhliadku. 📞
        </p>
      ) : (
        <>
          <p className="text-sm text-[#4a5478] mb-3">
            Pošleme rozpis nášmu obchodníkovi. Ozve sa, dohodne obhliadku
            a podlahu spravíme za teba.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Meno *" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} aria-label="Meno" />
            <input placeholder="Priezvisko *" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} aria-label="Priezvisko" />
          </div>
          <input type="email" placeholder="E-mail *" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} mt-2`} aria-label="E-mail" />
          <input type="tel" placeholder="Telefón *" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputCls} mt-2`} aria-label="Telefón" />
          <div className="mt-3 flex justify-center">
            <TurnstileWidget onVerify={setToken} onExpire={() => setToken(null)} />
          </div>
          {state === "err" && (
            <p className="mt-2 text-sm text-red-600">Nepodarilo sa odoslať, skús znova.</p>
          )}
          <button
            type="button" onClick={send} disabled={state === "sending" || !token || !valid}
            className="press-scale mt-4 w-full px-6 py-3.5 rounded-full bg-[#16a34a] text-white font-bold disabled:opacity-50 hover:bg-[#15803d] transition-colors"
          >
            {state === "sending" ? "Posielam…" : "Odoslať a dohodnúť obhliadku"}
          </button>
        </>
      )}
    </Modal>
  );
}

/* ── zdieľaný modal wrapper (scrollovateľný, zatvárateľný) ─────────────── */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-[#0e1a3b]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavrieť"
            className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 font-bold"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
