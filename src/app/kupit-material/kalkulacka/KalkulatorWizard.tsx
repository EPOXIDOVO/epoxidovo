"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Mail,
  Phone,
  ShoppingCart,
  AlertTriangle,
  Check,
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
import { SITE } from "@/lib/site";

/**
 * FÁZA 2 — kalkulátor skladby. Jednostránkový sprievodca s krokmi späť,
 * mobile-first (ovládateľný jednou rukou — veľké taply, spodné CTA).
 *
 * Ochrany (zo zadania):
 *  - terasa/exteriér + epoxid → UV varovanie, odporučiť PU + kontakt
 *  - existujúca dlažba → varovanie o rizikách + kontakt
 *  - > 200 m² → odporučiť individuálnu ponuku
 *  - nivelačka < 4 mm → zablokované s presnou hláškou
 */

type Miesto = "garaz" | "byt" | "dielna" | "terasa" | "schody" | "ine";
type Podklad = "poter" | "beton" | "dlazba" | "anhydrit" | "natery" | "neviem";
type Stav = "rovny" | "mierne" | "vyrazne";
type Vzhlad = "jednofarebna" | "chipsy" | "metalik" | "marble";

const MIESTA: { id: Miesto; label: string; emoji: string }[] = [
  { id: "garaz", label: "Garáž", emoji: "🚗" },
  { id: "byt", label: "Byt / dom", emoji: "🏠" },
  { id: "dielna", label: "Dielňa", emoji: "🔧" },
  { id: "terasa", label: "Terasa", emoji: "☀️" },
  { id: "schody", label: "Schody", emoji: "🪜" },
  { id: "ine", label: "Iné", emoji: "📦" },
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

const VZHLADY: { id: Vzhlad; label: string; emoji: string }[] = [
  { id: "jednofarebna", label: "Jednofarebná", emoji: "🎨" },
  { id: "chipsy", label: "Chipsy", emoji: "✨" },
  { id: "metalik", label: "Metalik", emoji: "🌊" },
  { id: "marble", label: "Marble efekt", emoji: "🪨" },
];

/** Mapovanie vzhľad + miesto → skladba (dáta zo systems.ts). */
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
  "block w-full appearance-none px-4 py-3 rounded-xl border border-zinc-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3db6e8] focus:border-transparent text-base text-zinc-900 placeholder:text-zinc-400";

const chipCls = (active: boolean) =>
  `inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-2 font-semibold text-[15px] transition-colors text-left ${
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

  // email / lead modaly
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

  // kroky: 0 miesto → 1 plocha → 2 podklad → 3 stav → 4 vzhľad → 5 zhrnutie
  const STEPS = ["Kde", "Plocha", "Podklad", "Stav", "Vzhľad", "Rozpis"];

  const canNext =
    (step === 0 && miesto != null) ||
    (step === 1 && areaM2 > 0) ||
    (step === 2 && podklad != null) ||
    (step === 3 && stav != null) ||
    (step === 4 && vzhlad != null);

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* progress */}
      <div className="flex items-center gap-1.5 mb-6" aria-label="Priebeh">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            disabled={i > step}
            onClick={() => setStep(i)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i < step ? "bg-[#3db6e8]" : i === step ? "bg-[#f97316]" : "bg-zinc-200"
            }`}
            aria-label={`Krok ${i + 1}: ${s}`}
          />
        ))}
      </div>

      <div className="rounded-3xl bg-white p-5 md:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
        {/* ── KROK 0: miesto ── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Kde to bude?</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {MIESTA.map((m) => (
                <button key={m.id} type="button" onClick={() => setMiesto(m.id)} className={chipCls(miesto === m.id)}>
                  <span aria-hidden>{m.emoji}</span> {m.label}
                </button>
              ))}
            </div>
            {miesto === "terasa" && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
                <span>
                  Epoxid v exteriéri <strong>nie je UV stabilný</strong> — žltne.
                  Pre terasu odporúčame polyuretánový systém na mieru —{" "}
                  <Link href="/kontakt" className="underline font-semibold">kontaktujte nás</Link>,
                  online skladbu pre exteriér zatiaľ nemáme.
                </span>
              </div>
            )}
            {miesto === "schody" && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                Schody riešime individuálne (hrany, protišmyk) —{" "}
                <Link href="/kontakt" className="underline font-semibold">napíšte nám</Link>{" "}
                alebo pokračujte a rozpis pošleme ako dopyt.
              </div>
            )}
          </div>
        )}

        {/* ── KROK 1: plocha ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Aká je plocha?</h2>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="number" inputMode="decimal" min={1} max={100000}
                value={plocha} onChange={(e) => setPlocha(e.target.value)}
                placeholder="napr. 24" className={`${inputCls} w-40`} aria-label="Plocha v m²"
              />
              <span className="font-bold text-zinc-600">m²</span>
            </div>
            <button
              type="button"
              onClick={() => setShowRooms((v) => !v)}
              className="mt-3 text-sm font-semibold text-[#3db6e8] hover:underline"
            >
              {showRooms ? "Skryť pomôcku" : "Nemám zmerané — vypočítať z miestností"}
            </button>
            {showRooms && (
              <div className="mt-3 space-y-2">
                {rooms.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="number" inputMode="decimal" placeholder="dĺžka m" value={r.lengthM}
                      onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, lengthM: e.target.value } : x)))}
                      className={`${inputCls} w-28`} aria-label={`Miestnosť ${i + 1} dĺžka`} />
                    <span className="text-zinc-400">×</span>
                    <input type="number" inputMode="decimal" placeholder="šírka m" value={r.widthM}
                      onChange={(e) => setRooms(rooms.map((x, j) => (j === i ? { ...x, widthM: e.target.value } : x)))}
                      className={`${inputCls} w-28`} aria-label={`Miestnosť ${i + 1} šírka`} />
                    {rooms.length > 1 && (
                      <button type="button" onClick={() => setRooms(rooms.filter((_, j) => j !== i))}
                        className="text-zinc-400 hover:text-red-500 font-bold px-2" aria-label="Odobrať miestnosť">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setRooms([...rooms, { lengthM: "", widthM: "" }])}
                  className="text-sm font-semibold text-[#3db6e8] hover:underline">+ pridať miestnosť</button>
                {!plocha && areaM2 > 0 && (
                  <div className="text-sm font-bold text-zinc-800">Spolu: {areaM2} m²</div>
                )}
              </div>
            )}
            {areaM2 > 200 && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
                Pri ploche nad 200 m² odporúčame{" "}
                <Link href="/cenova-ponuka" className="underline font-semibold">individuálnu cenovú ponuku</Link>{" "}
                — vieme dať lepšie podmienky.
              </div>
            )}
          </div>
        )}

        {/* ── KROK 2: podklad ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Aký je podklad?</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PODKLADY.map((p) => (
                <button key={p.id} type="button" onClick={() => setPodklad(p.id)} className={chipCls(podklad === p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            {podklad === "dlazba" && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden />
                <span>
                  Liatie na existujúcu dlažbu nesie <strong>riziko odtrhnutia
                  a kopírovania škár</strong> — robíme ho len po posúdení a so
                  samostatnou zmluvou s vylúčením záruky.{" "}
                  <Link href="/kontakt" className="underline font-semibold">Kontaktujte nás</Link> pred objednávkou.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── KROK 3: stav podkladu + hrúbka nivelačky ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Stav podkladu?</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STAVY.map((s) => (
                <button key={s.id} type="button" onClick={() => setStav(s.id)} className={chipCls(stav === s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            {stav === "vyrazne" && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
                Výrazne nerovný podklad treba vyrovnať nivelačkou — odporúčame
                skladbu <strong>Marble FX s Level-30</strong> (vyber „Marble efekt"
                v ďalšom kroku), alebo nás kontaktuj.
              </div>
            )}
          </div>
        )}

        {/* ── KROK 4: vzhľad + RAL + rezerva + náradie ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Aký vzhľad?</h2>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {VZHLADY.map((v) => (
                  <button key={v.id} type="button" onClick={() => setVzhlad(v.id)} className={chipCls(vzhlad === v.id)}>
                    <span aria-hidden>{v.emoji}</span> {v.label}
                  </button>
                ))}
              </div>
              {system && stav === "vyrazne" && !needsThickness && (
                <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  Zvolená skladba nemá nivelačnú vrstvu — pri výrazne nerovnom
                  podklade ju treba doplniť. Odporúčame Marble efekt alebo konzultáciu.
                </p>
              )}
            </div>

            {needsThickness && (
              <div>
                <h3 className="font-bold text-zinc-900">Hrúbka nivelačky (mm)</h3>
                <input
                  type="number" inputMode="decimal" min={4} max={30} value={hrubka}
                  onChange={(e) => setHrubka(e.target.value)}
                  className={`${inputCls} mt-2 w-32`} aria-label="Hrúbka nivelačky v mm"
                />
                {!hrubkaOk && (
                  <p className="mt-2 text-sm font-semibold text-red-600">
                    Level-30 sa nesmie liať tenšie ako 4 mm. Pri menšej hrúbke
                    stráca pevnosť a praská.
                  </p>
                )}
              </div>
            )}

            {ralProduct && (
              <div>
                <h3 className="font-bold text-zinc-900">Odtieň</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["RAL 7032", "RAL 7035"].map((r) => (
                    <button key={r} type="button" onClick={() => setRal(r)}
                      className={chipCls(ral === r)}>
                      <span aria-hidden className="w-4 h-4 rounded-full border border-black/20"
                        style={{ background: r === "RAL 7032" ? "#B8B799" : "#D7D7D7" }} />
                      {r} <span className="text-xs opacity-70">bez príplatku</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => setRal("custom")} className={chipCls(ral === "custom")}>
                    Iný RAL (pastel)
                  </button>
                </div>
                {ral === "custom" && (
                  <div className="mt-2">
                    <input type="text" placeholder="napr. RAL 5015" value={customRal}
                      onChange={(e) => setCustomRal(e.target.value)} className={`${inputCls} w-44`} aria-label="Vlastný RAL" />
                    <p className="mt-1.5 text-xs text-amber-700">
                      Pastelové RAL majú príplatok a dlhšiu dodaciu lehotu — potvrdíme e-mailom.
                      Inšpiruj sa vo <Link href="/vzorkovnik" target="_blank" className="underline">vzorkovníku</Link>.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="font-bold text-zinc-900">
                Rezerva: <span className="text-[#3db6e8]">{rezerva} %</span>
              </h3>
              <input
                type="range" min={0} max={15} step={1} value={rezerva}
                onChange={(e) => setRezerva(Number(e.target.value))}
                className="mt-2 w-full accent-[#3db6e8]" aria-label="Rezerva v percentách"
              />
              <p className="text-xs text-zinc-500">
                Odporúčame 5 % na strihy, dorovnanie a prípadnú opravu.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={naradie} onChange={(e) => setNaradie(e.target.checked)}
                className="w-5 h-5 rounded accent-[#3db6e8]" />
              <span className="font-semibold text-zinc-800">
                Pridať náradie a ochranné pomôcky
              </span>
            </label>
          </div>
        )}

        {/* ── KROK 5: rozpis ── */}
        {step === 5 && system && (
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">{system.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {areaM2} m² · rezerva {rezerva} %{needsThickness ? ` · nivelačka ${hrubkaNum} mm` : ""}
              {ralProduct ? ` · ${chosenColor}` : ""}
            </p>

            {!hrubkaOk ? (
              <p className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700">
                Level-30 sa nesmie liať tenšie ako 4 mm. Vráť sa a uprav hrúbku.
              </p>
            ) : calc ? (
              <>
                <div className="mt-5 divide-y divide-zinc-100">
                  {calc.layers.map((l, i) => (
                    <div key={i} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-zinc-900 text-sm">
                          {i + 1}. {l.layer.label}
                        </div>
                        <div className="text-sm text-zinc-600">{l.product.name}</div>
                        {l.layer.note && (
                          <div className="text-xs text-zinc-400 mt-0.5">{l.layer.note}</div>
                        )}
                        {l.need != null && (
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {l.layer.consumption} {l.layer.consumptionUnit}
                            {" → "}{l.need} {l.product.packUnit} → <strong>{l.packs} bal.</strong>
                            {" "}(prebytok {l.leftover} {l.product.packUnit})
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {l.totalPrice != null ? (
                          <>
                            <div className="font-extrabold text-zinc-900">{fmt(l.totalPrice)}</div>
                            <div className="text-xs text-zinc-400">
                              {l.packs} × {fmt(l.pricePerPack as number)}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-amber-600">na dopyt</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {calc.tools.length > 0 && (
                  <details className="mt-4 rounded-xl border border-zinc-200 overflow-hidden">
                    <summary className="cursor-pointer px-4 py-3 font-bold text-zinc-900 bg-zinc-50">
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
                            <span className="text-zinc-800">
                              {t.qty}× {t.product.name}
                              {t.ownableAtHome && (
                                <span className="text-xs text-zinc-400"> (mám už doma → odškrtni)</span>
                              )}
                            </span>
                          </label>
                          <span className="text-sm font-semibold shrink-0">
                            {t.totalPrice != null ? fmt(t.totalPrice) : <span className="text-amber-600">na dopyt</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                <div className="mt-5 rounded-2xl bg-zinc-900 text-white p-5">
                  {calc.priceIsFinal ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold">Spolu</span>
                        <span className="text-3xl font-extrabold">{fmt(calc.priceSubtotal)}</span>
                      </div>
                      {calc.pricePerM2 != null && (
                        <div className="text-right text-sm text-white/60">
                          ≈ {fmt(calc.pricePerM2)} / m²
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold">Medzisúčet</span>
                        <span className="text-2xl font-extrabold">{fmt(calc.priceSubtotal)}</span>
                      </div>
                      <p className="mt-1 text-sm text-amber-300">
                        Niektoré položky sú „na dopyt" — cenu doladíme e-mailom.
                      </p>
                    </>
                  )}
                  <p className="mt-2 text-xs text-white/50">
                    Dodávateľ nie je platiteľom DPH. Ceny sú konečné. Predaj v celých baleniach.
                  </p>
                </div>

                {calc.warnings.map((w, i) => (
                  <p key={i} className="mt-3 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3">{w}</p>
                ))}

                {/* 3 CTA */}
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      add(cartItems);
                      setAdded(true);
                      trackEvent("kalkulator_add_to_cart", { system: system.id, area: areaM2 });
                      setTimeout(() => setAdded(false), 3000);
                    }}
                    className={`w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-extrabold text-lg text-white transition-colors ${
                      added ? "bg-emerald-600" : "bg-[#f97316] hover:bg-[#ea580c] shadow-[0_12px_36px_rgba(249,115,22,0.5)]"
                    }`}
                  >
                    {added ? (<><Check className="w-5 h-5" aria-hidden /> Pridané do košíka</>) : (<><ShoppingCart className="w-5 h-5" aria-hidden /> Pridať všetko do košíka</>)}
                  </button>
                  {added && (
                    <Link href="/kupit-material/kosik"
                      className="block text-center text-sm font-bold text-[#3db6e8] hover:underline">
                      Prejsť do košíka →
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setEmailModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border-2 border-zinc-300 font-bold text-zinc-800 hover:border-zinc-500 transition-colors"
                  >
                    <Mail className="w-5 h-5" aria-hidden /> Poslať rozpis na e-mail
                  </button>
                  {/* Tretí button — dôležitý, plná veľkosť */}
                  <button
                    type="button"
                    onClick={() => setLeadModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#16a34a] text-white font-extrabold text-lg hover:bg-[#15803d] shadow-[0_12px_36px_rgba(22,163,74,0.4)] transition-colors"
                  >
                    <Phone className="w-5 h-5" aria-hidden /> Nechám si to spraviť
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-4 text-zinc-600">Chýbajú vstupy — vráť sa o krok späť.</p>
            )}
          </div>
        )}

        {/* navigácia */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 border-zinc-200 font-semibold text-zinc-700 disabled:opacity-40 hover:border-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Späť
          </button>
          {step < 5 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#3db6e8] text-white font-bold disabled:opacity-40 hover:bg-[#1a8cc4] transition-colors"
            >
              {step === 4 ? (<><Calculator className="w-4 h-4" aria-hidden /> Vypočítať</>) : (<>Ďalej <ArrowRight className="w-4 h-4" aria-hidden /></>)}
            </button>
          )}
        </div>
      </div>

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

/* ── modal: poslať rozpis na e-mail ────────────────────────────────────── */
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
            <p className="mt-2 text-sm text-red-600">Nepodarilo sa odoslať — skús znova.</p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={state === "sending" || !token || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
            className="mt-4 w-full px-6 py-3.5 rounded-full bg-[#3db6e8] text-white font-bold disabled:opacity-50 hover:bg-[#1a8cc4] transition-colors"
          >
            {state === "sending" ? "Posielam…" : "Poslať rozpis"}
          </button>
        </>
      )}
    </Modal>
  );
}

/* ── modal: nechám si to spraviť (lead do CRM) ─────────────────────────── */
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
            ``, rozpis,
          ].filter((x) => x != null).join("\n"),
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
          Ďakujeme! Rozpis sme dostali — obchodník sa ozve do 24 hodín a dohodne obhliadku. 📞
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-600 mb-3">
            Pošleme rozpis nášmu obchodníkovi — ozve sa, dohodne obhliadku a
            spravíme podlahu za teba.
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
            <p className="mt-2 text-sm text-red-600">Nepodarilo sa odoslať — skús znova.</p>
          )}
          <button
            type="button" onClick={send} disabled={state === "sending" || !token || !valid}
            className="mt-4 w-full px-6 py-3.5 rounded-full bg-[#16a34a] text-white font-bold disabled:opacity-50 hover:bg-[#15803d] transition-colors"
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
          <h3 className="text-lg font-extrabold text-zinc-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Zavrieť"
            className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 font-bold">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
