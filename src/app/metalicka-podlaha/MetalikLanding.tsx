"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart, Phone, Sparkles, ChevronDown, Ruler, Clock, Droplets, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/lib/cart";
import { showToast } from "@/components/ui/Toast";
import { getMaterial } from "@/lib/materialy";
import { SITE } from "@/lib/site";
import { REVIEWS } from "@/content/reviews";

/**
 * Landing na metalickú podlahu — jeden produkt, jedna cesta: vyber efekt,
 * zadaj m², vlož set do košíka. Žiadne odbočky do katalógu, žiadna CP —
 * toto je stránka na predaj materiálu pre svojpomoc (Google Ads).
 *
 * Skladba a spotreby sú TIE ISTÉ ako v konfigurátore (TopStone rad):
 *   EP02 penetrácia 0,8 kg/m² (2 vrstvy), EP11 Metallic 1,22 kg/m²,
 *   EP22 Plus 1,19 kg/m² (2 vrstvy). Ceny z katalógu, konečné.
 */

type Vrstva = { sku: string; nazov: string; produkt: string; spotreba: number; balenie: number; poznamka?: string; h: number };
const SET: Vrstva[] = [
  { sku: "TS-EP02", nazov: "Penetrácia", produkt: "TopStone EP02", spotreba: 0.8, balenie: 30, poznamka: "2 vrstvy", h: 12 },
  { sku: "TS-EP11-METALLIC", nazov: "Metalická báza", produkt: "TopStone EP11 Metallic", spotreba: 1.22, balenie: 20, h: 24 },
  { sku: "TS-EP22-PLUS", nazov: "Vrchný lak", produkt: "TopStone EP22 Plus", spotreba: 1.19, balenie: 20, poznamka: "2 vrstvy", h: 24 },
];

const EFEKTY = [
  "azuro", "gold", "copper", "charcoal", "pearl", "slate", "midnight-blue", "moose-green",
  "wine-red", "white", "gun-metal", "sequoia", "brass", "bronze", "burnt-orange", "champagne",
  "dark-brown", "royal-blue",
] as const;
const EFEKT_LABEL: Record<string, string> = {
  azuro: "Azuro", gold: "Gold", copper: "Copper", charcoal: "Charcoal", pearl: "Pearl", slate: "Slate",
  "midnight-blue": "Midnight Blue", "moose-green": "Moose Green", "wine-red": "Wine Red", white: "White",
  "gun-metal": "Gun Metal", sequoia: "Sequoia", brass: "Brass", bronze: "Bronze", "burnt-orange": "Burnt Orange",
  champagne: "Champagne", "dark-brown": "Dark Brown", "royal-blue": "Royal Blue",
};

const REZERVA = 1.1;
const fmt = (n: number) => new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function spocitaj(m2: number) {
  const plocha = m2 * REZERVA;
  return SET.map((v) => {
    const kg = Math.round(v.spotreba * plocha * 10) / 10;
    const bal = Math.ceil(kg / v.balenie);
    const cena = getMaterial(v.sku)?.cena_eur_s_dph ?? null;
    return { ...v, kg, bal, cena, spolu: cena != null ? Math.round(cena * bal * 100) / 100 : null };
  });
}

export function MetalikLanding() {
  const { add } = useCart();
  const [efekt, setEfekt] = React.useState<string>("azuro");
  const [m2, setM2] = React.useState<number>(30);
  const [pridane, setPridane] = React.useState(false);
  const riadky = React.useMemo(() => spocitaj(m2), [m2]);
  const spolu = riadky.reduce((s, r) => s + (r.spolu ?? 0), 0);
  const naM2 = m2 > 0 ? spolu / m2 : 0;
  const hodiny = SET.reduce((s, v) => s + v.h, 0);
  const dni = Math.max(1, Math.ceil(hodiny / 24) + 1);

  const doKosika = () => {
    add(riadky.map((r) => ({ productId: r.sku, qty: r.bal, systemLabel: "Metalická podlaha — TopStone set", systemId: "metalik-premium", color: EFEKT_LABEL[efekt] })));
    setPridane(true);
    showToast("Set na metalickú podlahu je v košíku", "cart");
  };

  const recenzie = REVIEWS.filter((r) => /metal/i.test(r.text)).slice(0, 3);

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden bg-[#0e1a3b] text-white">
        <Image src="/images/categories/metalicke.jpg" alt="" fill priority sizes="100vw" quality={85} className="object-cover opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0e1a3b] via-[#0e1a3b]/80 to-transparent" />
        <Container size="xl" className="relative py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-xs font-bold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" aria-hidden /> TopStone METALIC — set na svojpomoc
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]" style={{ textWrap: "balance" }}>
              Metalická podlaha, ktorú si naleješ sám
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/85 leading-snug max-w-xl">
              Vyber efekt, zadaj m² a dostaneš presne toľko materiálu, koľko treba — s návodom krok za krokom a poradenstvom na telefóne v cene.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#set" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#ea580c] text-white font-extrabold text-base md:text-lg shadow-[0_12px_32px_rgba(234,88,12,0.5)] hover:bg-[#c2410c] transition-colors whitespace-nowrap">
                Zostaviť si set →
              </a>
              <a href="#efekty" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/70 text-white font-bold text-base md:text-lg hover:bg-white hover:text-[#0e1a3b] transition-colors whitespace-nowrap">
                Pozrieť 18 efektov
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/85">
              {["Presný rozpis na tvoje m²", "Návod krok za krokom", "Poradíme aj počas liatia"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-[#6fe3a1]" aria-hidden />{t}</span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── EFEKTY ── */}
      <section id="efekty" className="scroll-mt-24">
        <Container size="xl" className="py-12 md:py-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#0e1a3b] tracking-tight">Vyber si efekt</h2>
          <p className="mt-2 text-[#4a5478] max-w-2xl">Reálne vzorky TopStone. Každá liata plocha vyzerá trochu inak — to je podstata metaliky, žiadne dve podlahy nie sú rovnaké.</p>
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {EFEKTY.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEfekt(e)}
                aria-pressed={efekt === e}
                className={`group relative aspect-square rounded-2xl overflow-hidden ring-2 transition-all duration-300 ${efekt === e ? "ring-[#ea580c] scale-[1.03] shadow-[0_10px_30px_rgba(234,88,12,0.35)]" : "ring-transparent hover:ring-[#3db6e8] hover:scale-[1.03]"}`}
              >
                <Image src={`/images/eshop/topstone-metallic/${e}.jpg`} alt={`Metalický efekt ${EFEKT_LABEL[e]}`} fill sizes="(max-width: 768px) 33vw, 16vw" quality={85} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/75 to-transparent text-white text-xs font-bold text-left">{EFEKT_LABEL[e]}</span>
                {efekt === e && <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#ea580c] text-white inline-flex items-center justify-center"><Check className="w-4 h-4" aria-hidden /></span>}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* ── SET + KALKULÁCIA ── */}
      <section id="set" className="scroll-mt-24 bg-[#f7f7f4]">
        <Container size="xl" className="py-12 md:py-16">
          <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10 lg:items-start">
            <div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#0e1a3b] tracking-tight">Čo je v sete</h2>
              <p className="mt-2 text-[#4a5478] max-w-2xl">Tri vrstvy, tri produkty. Rovnaká skladba, akú lejeme my — bez experimentov.</p>

              <div className="mt-6 space-y-3">
                {riadky.map((r, i) => (
                  <div key={r.sku} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-[#0e1a3b] text-white font-extrabold inline-flex items-center justify-center tabular-nums">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-[#0e1a3b]">{r.nazov}</div>
                      <div className="text-sm text-[#4a5478]">{r.produkt} · {r.spotreba} kg/m²{r.poznamka ? ` · ${r.poznamka}` : ""}</div>
                      <div className="mt-1 text-xs text-[#6b7390] tabular-nums">{r.bal} × {r.balenie} kg = {r.bal * r.balenie} kg · spotreba {r.kg} kg</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-extrabold text-[#0e1a3b] tabular-nums">{r.spolu != null ? `${fmt(r.spolu)} €` : "na dopyt"}</div>
                      {r.cena != null && <div className="text-xs text-[#6b7390] tabular-nums">{fmt(r.cena)} € / bal.</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { I: Clock, t: `~${dni} dni`, p: "vrátane technologických prestávok" },
                  { I: Ruler, t: "2 mm", p: "hrúbka metalickej vrstvy" },
                  { I: Droplets, t: "Bezškárová", p: "ľahko umývateľná plocha" },
                  { I: Sun, t: "Do interiéru", p: "UV by efekt zničilo, vonku nie" },
                ].map(({ I, t, p }) => (
                  <div key={t} className="rounded-2xl bg-white border border-zinc-200 p-4">
                    <I className="w-5 h-5 text-[#12729f]" aria-hidden />
                    <div className="mt-2 font-extrabold text-[#0e1a3b]">{t}</div>
                    <div className="text-xs text-[#4a5478] leading-snug">{p}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* panel s cenou — lepí sa */}
            <aside className="mt-8 lg:mt-0 lg:sticky lg:top-28 rounded-3xl bg-[#0e1a3b] text-white p-6 shadow-[0_24px_60px_rgba(14,26,59,0.35)]">
              <div className="text-xs font-bold uppercase tracking-wide text-white/60">Tvoj set</div>
              <div className="mt-1 flex items-center gap-3">
                <span className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white/30 shrink-0">
                  <Image src={`/images/eshop/topstone-metallic/${efekt}.jpg`} alt="" fill sizes="48px" quality={85} className="object-cover" />
                </span>
                <div>
                  <div className="font-extrabold">Metalická · {EFEKT_LABEL[efekt]}</div>
                  <a href="#efekty" className="text-xs text-[#9fdcf5] hover:underline">zmeniť efekt</a>
                </div>
              </div>

              <label className="mt-5 block">
                <span className="block text-sm font-bold text-white/80 mb-1.5">Plocha podlahy</span>
                <span className="flex items-center gap-2">
                  <input
                    type="number" min={1} max={2000} value={m2}
                    onChange={(e) => setM2(Math.max(0, Number(e.target.value) || 0))}
                    className="w-32 px-4 py-3 rounded-xl bg-white text-[#0e1a3b] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#3db6e8]"
                  />
                  <span className="font-semibold text-white/80">m²</span>
                </span>
                <span className="block mt-1 text-xs text-white/55">Rátame s 10 % rezervou na strihy a dorovnanie.</span>
              </label>

              <div className="mt-5 pt-5 border-t border-white/15">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold">Celý set</span>
                  <span className="text-3xl font-extrabold tabular-nums">{fmt(spolu)} €</span>
                </div>
                <div className="mt-0.5 flex justify-between text-sm text-white/65 tabular-nums">
                  <span>to je</span><span>{fmt(naM2)} € / m²</span>
                </div>
                <p className="mt-1.5 text-[11px] text-white/55">Konečné ceny. Nie sme platiteľmi DPH.</p>
              </div>

              <button
                type="button"
                onClick={doKosika}
                disabled={m2 <= 0}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#ea580c] text-white font-extrabold hover:bg-[#c2410c] disabled:opacity-50 shadow-[0_10px_28px_rgba(234,88,12,0.45)] transition-colors"
              >
                {pridane ? <><Check className="w-5 h-5" aria-hidden /> V košíku</> : <><ShoppingCart className="w-5 h-5" aria-hidden /> Vložiť set do košíka</>}
              </button>
              {pridane && (
                <Link href="/kupit-material/kosik" className="mt-2 block text-center text-sm font-bold text-[#9fdcf5] hover:underline">Prejsť do košíka →</Link>
              )}
              <a href={`tel:${SITE.contact.phoneRaw}`} className="mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-colors">
                <Phone className="w-4 h-4" aria-hidden /> Poradiť sa: {SITE.contact.phone}
              </a>
            </aside>
          </div>
        </Container>
      </section>

      {/* ── POSTUP ── */}
      <section>
        <Container size="xl" className="py-12 md:py-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#0e1a3b] tracking-tight">Ako to naleješ — 3 kroky</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "1", t: "Penetrácia EP02", p: "Podklad prebrús, povysávaj a natri dvoma vrstvami penetrácie. Uzavrie póry, aby metalika neutekala do betónu.", h: "12 h prestávka" },
              { n: "2", t: "Metalická báza EP11", p: "Nalej, rozťahaj stierkou a efekt vytvor valčekom alebo pohybom ruky — každý ťah je iný. Tu vzniká kresba.", h: "24 h prestávka" },
              { n: "3", t: "Vrchný lak EP22", p: "Dve vrstvy laku zafixujú efekt a chránia ho pred oderom. Po vytvrdnutí je podlaha pochôdzna a umývateľná.", h: "24 h do pochôdznosti" },
            ].map((k) => (
              <div key={k.n} className="rounded-3xl border border-zinc-200 bg-white p-6">
                <span className="w-10 h-10 rounded-full bg-[#ea580c] text-white font-extrabold inline-flex items-center justify-center">{k.n}</span>
                <h3 className="mt-3 text-lg font-extrabold text-[#0e1a3b]">{k.t}</h3>
                <p className="mt-1.5 text-sm text-[#4a5478] leading-relaxed">{k.p}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#12729f]"><Clock className="w-3.5 h-3.5" aria-hidden />{k.h}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-[#4a5478]">Podrobný návod s fotkami dostaneš k objednávke. Keď sa zasekneš, zavolaj — dvíhame aj cez víkend.</p>
        </Container>
      </section>

      {/* ── RECENZIE ── */}
      {recenzie.length > 0 && (
        <section className="bg-[#f7f7f4]">
          <Container size="xl" className="py-12 md:py-16">
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#0e1a3b] tracking-tight">Čo hovoria ľudia, čo už liali</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {recenzie.map((r) => (
                <blockquote key={r.name} className="rounded-3xl bg-white border border-zinc-200 p-6">
                  <div className="text-amber-400 tracking-wide" aria-hidden>★★★★★</div>
                  <p className="mt-2 text-[#0e1a3b] leading-relaxed">{r.text}</p>
                  <footer className="mt-3 text-sm font-bold text-[#4a5478]">{r.name}{r.location ? ` · ${r.location}` : ""}</footer>
                </blockquote>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── FAQ ── */}
      <section>
        <Container size="xl" className="py-12 md:py-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#0e1a3b] tracking-tight">Časté otázky</h2>
          <div className="mt-6 max-w-3xl divide-y divide-zinc-200 border-y border-zinc-200">
            {[
              ["Zvládnem to bez skúseností?", "Áno, ak máš rovný a suchý betón a dodržíš postup. Najťažšie je nie liatie, ale príprava podkladu — preto máme v návode aj to. A keď si nie si istý, zavolaj pred objednávkou."],
              ["Môžem metaliku dať do garáže alebo vonku?", "Vonku nie — UV žiarenie efekt zničí a povrch by bol klzký. Do garáže neodporúčame kvôli pneumatikám a bodovému zaťaženiu; tam sa hodí jednofarebný epoxid."],
              ["Ako vyzerá výsledok oproti vzorke?", "Vzorka ukazuje farbu a charakter, ale kresba je vždy iná — vzniká pri liatí. Dve podlahy v tom istom efekte nikdy nevyzerajú rovnako."],
              ["Čo ak mi materiál nevyjde alebo ostane?", "Rátame s 10 % rezervou. Balenia sú vždy celé, takže niečo ostane — píšeme ti presne koľko. Neotvorené balenie vieš vrátiť."],
              ["Koľko to stojí na m²?", `Pri ${m2} m² vychádza set na ${fmt(naM2)} €/m² — je to konečná cena materiálu, nie sme platiteľmi DPH. Čím väčšia plocha, tým menej na m², lebo balenia sa lepšie využijú.`],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-extrabold text-[#0e1a3b]">
                  {q}
                  <ChevronDown className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform shrink-0" aria-hidden />
                </summary>
                <p className="mt-2 text-[#4a5478] leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0e1a3b] text-white">
        <Container size="xl" className="py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ textWrap: "balance" }}>Prvá podlaha je najťažšia. Druhú už budeš liať kamošom.</h2>
          <a href="#set" className="mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#ea580c] text-white font-extrabold text-lg shadow-[0_12px_32px_rgba(234,88,12,0.5)] hover:bg-[#c2410c] transition-colors">
            Zostaviť si set →
          </a>
        </Container>
      </section>
    </div>
  );
}
