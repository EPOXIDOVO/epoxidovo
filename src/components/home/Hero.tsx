"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Images,
  Brush,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SamplePicker } from "./SamplePicker";

/**
 * Hero — podľa klientovho mockupu:
 * - Tmavé navy pozadie, jemný grid + veľké faded ikony rozprestreté CEZ celý hero
 *   (placeholdere za reálne fotky priemyselnej haly, interiéru domu a garáže)
 * - Centrovaný pill-eyebrow + h1 + 2 CTA
 * - Pod CTA sú malé tag-chips (PRIEMYSEL / BÝVANIE / GARÁŽ) s krátkym popisom
 * - Spodný oranžový pruh: 3 výhody v horizontálnom layoute (ikona + text)
 */

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Certifikované riešenia",
    badges: ["⚡ ESD", "🥗 HACCP", "🔥 ATEX", "🛡 Protišmyk"],
  },
  {
    icon: Brush,
    title: "Originálny dizajn na mieru",
    description: "Farbu a vzor si vyberieš sám.",
  },
  {
    icon: Shield,
    title: "Bezšpárový a bezúdržbový",
    description: "Odolný povrch bez škár a starostí.",
  },
];

const CHIPS = [
  {
    tag: "PRIEMYSEL",
    description: "Haly, nemocnice, výroba, sklady, parkovacie domy",
    image: "/images/hero/hala.jpg",
    href: "/realizacie?priestor=hala-firma",
    objectPosition: "center 65%",
  },
  {
    tag: "BÝVANIE",
    description: "Domy, byty, interiéry",
    image: "/images/hero/byvanie-kitchen.jpg",
    href: "/realizacie?priestor=dom",
    objectPosition: "center 75%",
  },
  {
    tag: "GARÁŽ",
    description: "Garáže, dielne",
    image: "/images/hero/garaz.webp",
    href: "/realizacie?priestor=garaz",
    objectPosition: "center center",
  },
];

export function Hero() {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const activeIndexRef = React.useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== activeIndexRef.current) {
      activeIndexRef.current = i;
      setActiveIndex(i);
    }
  };

  const scrollToIndex = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  // Auto-rotácia každé 2s (mobile carousel — desktop nemá scroll)
  React.useEffect(() => {
    const id = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el || el.clientWidth === 0) return;
      const next = (activeIndexRef.current + 1) % CHIPS.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <section
        id="uvod"
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden bg-[#0a0f1e] text-white min-h-screen md:h-screen flex flex-col"
      >
        {/* Pozadie: grid + radial glow + 3 veľké faded ikony (placeholder za fotky) */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-[700px]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(61,182,232,0.18), transparent 70%)",
            }}
          />
          {/* Mobile — pohyblivý marquee close-up fotiek mramoru/metaliku
              + tmavý overlay (vzor podlahy je dominantný) */}
          <div className="md:hidden absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 flex w-max animate-stats-marquee">
              {[
                "/images/realizacie/r-35.jpg",
                "/images/realizacie/r-32.jpg",
                "/images/realizacie/r-33.jpg",
                "/images/realizacie/r-11.jpg",
                "/images/realizacie/r-35.jpg",
                "/images/realizacie/r-32.jpg",
                "/images/realizacie/r-33.jpg",
                "/images/realizacie/r-11.jpg",
                "/images/realizacie/r-35.jpg",
                "/images/realizacie/r-32.jpg",
                "/images/realizacie/r-33.jpg",
                "/images/realizacie/r-11.jpg",
              ].map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative h-full w-[80vw] shrink-0"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="80vw"
                    className="object-cover"
                    priority={i < 3}
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-[#0a0f1e]/70" />
          </div>
        </div>

        {/* Desktop — 3 klikateľné stĺpce s fotkami (Priemysel / Bývanie / Garáž).
            pointer-events-none na wrapperi, pointer-events-auto na Linkoch,
            aby Container (hero bubble) nad nimi ostal interaktívny. */}
        <div className="absolute inset-0 hidden md:grid grid-cols-3 pointer-events-none">
          <Link
            href="/realizacie?priestor=hala-firma"
            aria-label="Pozrieť realizácie — Priemysel"
            className="pointer-events-auto relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] focus-visible:ring-inset"
          >
            <Image
              src="/images/hero/hala.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              quality={92}
              className="object-cover scale-[1.12] origin-bottom group-hover:scale-[1.18] transition-transform duration-700 ease-out"
              style={{ objectPosition: "center 65%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/25 via-[#0a0f1e]/15 to-[#0a0f1e]/45 group-hover:from-[#0a0f1e]/10 group-hover:via-transparent group-hover:to-[#0a0f1e]/30 transition-colors duration-500" />
            <div className="absolute inset-0 ring-0 group-hover:ring-[3px] ring-inset ring-[#3db6e8]/0 group-hover:ring-[#3db6e8]/70 transition-all duration-300" />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3db6e8] text-white text-xs font-bold uppercase tracking-[0.14em] shadow-[0_8px_24px_rgba(61,182,232,0.5)] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              Pozrieť realizácie →
            </span>
          </Link>
          <Link
            href="/realizacie?priestor=dom"
            aria-label="Pozrieť realizácie — Bývanie"
            className="pointer-events-auto relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] focus-visible:ring-inset"
          >
            <Image
              src="/images/hero/byvanie-kitchen.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              quality={92}
              className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
              style={{ objectPosition: "25% 65%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/10 via-transparent to-[#0a0f1e]/15 group-hover:from-transparent group-hover:via-transparent group-hover:to-[#0a0f1e]/5 transition-colors duration-500" />
            <div className="absolute inset-0 ring-0 group-hover:ring-[3px] ring-inset ring-[#3db6e8]/0 group-hover:ring-[#3db6e8]/70 transition-all duration-300" />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3db6e8] text-white text-xs font-bold uppercase tracking-[0.14em] shadow-[0_8px_24px_rgba(61,182,232,0.5)] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              Pozrieť realizácie →
            </span>
          </Link>
          <Link
            href="/realizacie?priestor=garaz"
            aria-label="Pozrieť realizácie — Garáž"
            className="pointer-events-auto relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] focus-visible:ring-inset"
          >
            <Image
              src="/images/hero/garaz.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              quality={92}
              className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-[#0a0f1e]/25 via-[#0a0f1e]/15 to-[#0a0f1e]/45 group-hover:from-[#0a0f1e]/10 group-hover:via-transparent group-hover:to-[#0a0f1e]/30 transition-colors duration-500" />
            <div className="absolute inset-0 ring-0 group-hover:ring-[3px] ring-inset ring-[#3db6e8]/0 group-hover:ring-[#3db6e8]/70 transition-all duration-300" />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3db6e8] text-white text-xs font-bold uppercase tracking-[0.14em] shadow-[0_8px_24px_rgba(61,182,232,0.5)] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              Pozrieť realizácie →
            </span>
          </Link>
        </div>

        <Container
          size="xl"
          className="pt-[120px] md:pt-[150px] lg:pt-[170px] pb-10 md:pb-14 relative flex-1 flex flex-col justify-center md:pointer-events-none"
        >
          {/* Centrovaný obsah — v "bubline" pre čitateľnosť na fotkách */}
          <div className="text-center max-w-3xl mx-auto rounded-3xl bg-[#0a0f1e]/80 backdrop-blur-md ring-1 ring-white/10 px-5 md:px-10 py-5 md:py-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:pointer-events-auto">
            <h1
              id="hero-title"
              className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              <span className="text-[#3db6e8]">Epoxidové</span>{" "}
              <span className="text-white">a</span>{" "}
              <span className="text-[#3db6e8]">Polyuretánové</span>
              <br />
              podlahy na mieru
            </h1>

            <div className="mt-4 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3">
              <Link
                href="/kontakt"
                className="btn btn-primary btn-lg max-md:!px-4 max-md:!py-2.5 max-md:!text-[13px]"
              >
                Cenová ponuka
              </Link>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="btn btn-outline btn-lg max-md:!px-4 max-md:!py-2.5 max-md:!text-[13px]"
              >
                <Images className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden />
                Ukážky realizácií
              </button>
            </div>

          </div>

        </Container>

        {/* MOBILE — horizontálny carousel 3 kariet (swipe ←/→) + šípky + dot indikátory.
            Pozadie použité identicky z desktop hero. */}
        <div className="relative md:hidden mt-6 pb-8">
          {/* Šípky pre manuálnu navigáciu */}
          <button
            type="button"
            aria-label="Predchádzajúca karta"
            onClick={() =>
              scrollToIndex(
                (activeIndexRef.current - 1 + CHIPS.length) % CHIPS.length,
              )
            }
            style={{ touchAction: "manipulation" }}
            className="absolute left-2 top-[160px] -translate-y-1/2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/55 active:bg-black/75 backdrop-blur-sm text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] ring-1 ring-white/25 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Ďalšia karta"
            onClick={() =>
              scrollToIndex((activeIndexRef.current + 1) % CHIPS.length)
            }
            style={{ touchAction: "manipulation" }}
            className="absolute right-2 top-[160px] -translate-y-1/2 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/55 active:bg-black/75 backdrop-blur-sm text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] ring-1 ring-white/25 transition-colors"
          >
            <ChevronRight className="w-5 h-5" aria-hidden />
          </button>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {CHIPS.map(({ tag, description, image, href, objectPosition }) => (
              <div key={tag} className="snap-center shrink-0 w-full px-5">
                <Link
                  href={href}
                  aria-label={`${tag} — ${description}`}
                  className="relative block w-full h-[320px] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:scale-[0.99] transition-transform"
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="100vw"
                    quality={85}
                    className="object-cover"
                    style={{ objectPosition }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/75" />
                  <div className="absolute inset-x-0 bottom-5 text-center px-4">
                    <span className="inline-block px-5 py-2 rounded-full bg-[#f97316] text-white text-sm font-black tracking-[0.16em] shadow-[0_4px_14px_rgba(249,115,22,0.55)]">
                      {tag}
                    </span>
                    <p
                      className="mt-3 text-[15px] font-bold text-white leading-snug"
                      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                    >
                      {description}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          {/* Dot indikátory */}
          <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Navigácia kariet">
            {CHIPS.map((c, i) => (
              <button
                key={c.tag}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Karta ${i + 1}: ${c.tag}`}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-8 bg-[#f97316]" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP — 3 tag-chips zarovnané na stred každej 1/3 fotky pozadia.
            Každý chip je klikateľný Link na /realizacie?priestor=X. */}
        <div className="relative hidden md:grid mt-10 md:mt-14 pb-10 md:pb-14 grid-cols-3 gap-0">
          {CHIPS.map(({ tag, description, href }) => (
            <Link
              key={tag}
              href={href}
              aria-label={`Pozrieť realizácie — ${tag}`}
              className="group text-center px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3db6e8] rounded-lg"
            >
              <span className="inline-block px-4 py-2 rounded-md bg-[#f97316] text-white text-sm md:text-base font-black tracking-[0.16em] shadow-[0_4px_14px_rgba(249,115,22,0.45)] group-hover:bg-[#3db6e8] group-hover:shadow-[0_6px_20px_rgba(61,182,232,0.55)] group-hover:-translate-y-0.5 transition-all duration-300">
                {tag}
              </span>
              <p className="mt-3 text-base md:text-lg font-bold text-white leading-snug group-hover:text-[#3db6e8] transition-colors duration-300">
                {description}
              </p>
            </Link>
          ))}
        </div>

        {/* Spodný oranžový pruh — 3 výhody (horizontálny layout: ikona + text) */}
        <div
          className="relative text-white"
          style={{
            background:
              "linear-gradient(180deg, #c0581c 0%, #b0511d 50%, #9a4818 100%)",
          }}
        >
          <Container size="xl" className="py-6 md:py-8 lg:py-8">
            <div
              className="grid grid-cols-3 divide-x divide-white/25"
              aria-label="Hlavné výhody"
            >
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4 px-2.5 md:px-4 py-3 md:py-4"
                  >
                    <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                      <Icon
                        className="w-5 h-5 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-[11px] md:text-lg lg:text-xl tracking-tight text-white leading-tight"
                        style={{ fontWeight: 800 }}
                      >
                        {f.title}
                      </h3>
                      {"badges" in f ? (
                        <div className="mt-1.5 md:mt-2 grid grid-cols-2 md:flex md:flex-wrap md:justify-start gap-1 md:gap-2 justify-items-center md:justify-items-stretch">
                          {f.badges?.map((b) => (
                            <span
                              key={b}
                              className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap rounded-full bg-black/40 px-1 md:px-3 py-0.5 md:py-1 text-[9px] md:text-base font-medium md:font-semibold text-white ring-1 ring-white/30 hover:bg-black/60 hover:ring-white/55 transition-colors"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 md:mt-1.5 text-[10px] md:text-base font-medium md:font-semibold text-[#fbe1c4] leading-snug">
                          {f.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </div>
      </section>

      <SamplePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
}
