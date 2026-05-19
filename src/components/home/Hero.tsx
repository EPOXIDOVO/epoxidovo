"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Images,
  Brush,
  Shield,
  House,
  ShieldCheck,
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
    badges: ["⚡ ESD", "🔥 ATEX", "🛡 Protišmyk", "🥗 HACCP"],
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
  },
  { tag: "BÝVANIE", description: "Domy, byty, interiéry" },
  { tag: "GARÁŽ", description: "Garáže, dielne" },
];

export function Hero() {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  return (
    <>
      <section
        id="uvod"
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden bg-[#0a0f1e] text-white h-screen flex flex-col"
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
          {/* 3 stĺpce pozadia: 1/3 priemyselná hala (fotka) + 2/3 placeholdere */}
          <div className="absolute inset-0 hidden md:grid grid-cols-3">
            {/* Priemysel — reálna fotka haly */}
            <div className="relative overflow-hidden">
              <Image
                src="/images/hero/hala.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                quality={92}
                className="object-cover scale-[1.12] origin-bottom"
                style={{ objectPosition: "center 65%" }}
              />
              {/* jemný overlay len pre lepšiu nadväznosť */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/25 via-[#0a0f1e]/15 to-[#0a0f1e]/45" />
            </div>
            {/* Bývanie — placeholder (1920×1920) kým klient nepošle finálnu fotku */}
            <div className="relative overflow-hidden">
              <Image
                src="/images/hero/byvanie-kitchen.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                quality={92}
                className="object-cover"
                style={{ objectPosition: "center 75%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/25 via-[#0a0f1e]/15 to-[#0a0f1e]/45" />
            </div>
            {/* Garáž — reálna fotka epoxidovej garáže */}
            <div className="relative overflow-hidden">
              <Image
                src="/images/hero/garaz.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                quality={92}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0a0f1e]/25 via-[#0a0f1e]/15 to-[#0a0f1e]/45" />
            </div>
          </div>
          {/* Na mobile: jedna centrálna faded ikona */}
          <div className="absolute inset-0 flex items-center justify-center md:hidden">
            <House
              className="w-[260px] h-[260px] text-white/[0.05]"
              strokeWidth={1}
              aria-hidden
            />
          </div>
        </div>

        <Container
          size="xl"
          className="pt-[120px] md:pt-[150px] lg:pt-[170px] pb-10 md:pb-14 relative flex-1 flex flex-col justify-center"
        >
          {/* Centrovaný obsah — v "bubline" pre čitateľnosť na fotkách */}
          <div className="text-center max-w-3xl mx-auto rounded-3xl bg-[#0a0f1e]/80 backdrop-blur-md ring-1 ring-white/10 px-6 md:px-10 py-8 md:py-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h1
              id="hero-title"
              className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              <span className="text-[#3db6e8]">Epoxidové a Polyuretánové</span>
              <br />
              podlahy na mieru
            </h1>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/kontakt#cenova-ponuka"
                className="btn btn-primary btn-lg"
              >
                Cenová ponuka
              </Link>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="btn btn-outline btn-lg"
              >
                <Images className="w-4 h-4" aria-hidden />
                Ukážky realizácií
              </button>
            </div>

          </div>

        </Container>

        {/* 3 tag-chips zarovnané na stred každej 1/3 fotky pozadia */}
        <div className="relative mt-10 md:mt-14 pb-10 md:pb-14 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-0">
          {CHIPS.map(({ tag, description }) => (
            <div key={tag} className="text-center px-3">
              <span className="inline-block px-4 py-2 rounded-md bg-[#f97316] text-white text-sm md:text-base font-black tracking-[0.16em] shadow-[0_4px_14px_rgba(249,115,22,0.45)]">
                {tag}
              </span>
              <p className="mt-3 text-base md:text-lg font-bold text-white leading-snug">
                {description}
              </p>
            </div>
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
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/25"
              aria-label="Hlavné výhody"
            >
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="flex items-start gap-4 px-3 md:px-4 py-4"
                  >
                    <div className="shrink-0 inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                      <Icon
                        className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </div>
                    <div className="text-left min-w-0">
                      <h3
                        className="text-base md:text-lg lg:text-xl tracking-tight text-white leading-tight"
                        style={{ fontWeight: 800 }}
                      >
                        {f.title}
                      </h3>
                      {"badges" in f ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {f.badges.map((b) => (
                            <span
                              key={b}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-black/40 px-3 py-1 text-sm md:text-base font-semibold text-white ring-1 ring-white/30 hover:bg-black/60 hover:ring-white/55 transition-colors"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p
                          className="mt-1 md:mt-1.5 text-sm md:text-base text-[#fbe1c4] leading-snug"
                          style={{ fontWeight: 600 }}
                        >
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
