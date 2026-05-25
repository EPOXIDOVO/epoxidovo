"use client";

import * as React from "react";
import { Brush, Shield, Home } from "lucide-react";

/**
 * Sekcia "3 chlieviky s ikonami" — pod Hero (z briefu klienta).
 * Nahrádza 4 bullety s fajkami textom v 3 chlievikoch s modrými ikonami.
 *
 * Layout: vodorovne 3 karty na dark gradient pozadí, vertikálne separátory,
 * modré okrúhle ikony hore + bold biely názov + svetlejší sivý popis.
 */

const FEATURES = [
  {
    icon: Brush,
    title: "Originálny dizajn na mieru",
    description: "Každá podlaha je unikát.",
  },
  {
    icon: Shield,
    title: "Bezšpárový a bezúdržbový",
    description: "Odolný povrch bez škár a starostí.",
  },
  {
    icon: Home,
    title: "Pre domy, garáže aj firmy",
    description: "Vhodné do každého priestoru.",
  },
];

export function HeroFeatures() {
  return (
    <section
      aria-label="Hlavné výhody"
      className="relative bg-[#1a202c] text-white border-y border-white/5"
    >
      {/* Subtle gradient pre depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 50% 0%, rgba(61,182,232,0.18) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center px-4 md:px-8 py-4 md:py-2"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#3db6e8] shadow-[0_8px_24px_rgba(61,182,232,0.45)]">
                  <Icon className="w-6 h-6 text-white" aria-hidden />
                </div>
                <h3 className="mt-4 text-base md:text-lg font-bold tracking-tight text-white max-w-[14rem] leading-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm font-bold text-zinc-300 leading-relaxed max-w-[14rem]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
