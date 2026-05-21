"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Ruler, Brush, Check, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Sekcia "Ako to funguje?" — prerobená podľa zákazníckeho mockupu (1:1):
 * - Biele pozadie, centrovaný header s eyebrow pill + h2 + podtitulok
 * - 2×2 grid 4 krokov v béžových kartách s oranžovým ľavým borderom
 * - Kroky: konzultácia → obhliadka/ponuka → realizácia → hotovo
 * - 4. krok zvýraznený tmavým pozadím s modrou ikonou (aktuálny "cieľ")
 * - CTA tlačidlo "Chcem cenovú ponuku →"
 */

type Step = {
  number: string;
  icon: typeof Phone;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: Phone,
    title: "Nezáväzná konzultácia",
    description:
      "Zavoláš nám alebo vyplníš formulár. Povieš nám o priestore, štýle a tom, akú podlahu si predstavuješ.",
  },
  {
    number: "02",
    icon: Ruler,
    title: "Obhliadka a ponuka",
    description:
      "Prídeme za tebou, premeriame priestor, posúdime podklad a pripravíme presnú cenovú ponuku.",
  },
  {
    number: "03",
    icon: Brush,
    title: "Realizácia",
    description:
      "Pripravíme podklad, ručne nalejeme epoxid a vytvoríme dizajn podľa dohody. Každá podlaha je unikát.",
  },
  {
    number: "04",
    icon: Check,
    title: "Hotovo. Užívaš.",
    description:
      "Podlaha vytvrdne, prejdeme si detaily a odovzdáme ti priestor, ktorý vydrží roky.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-[var(--color-copper)] text-white overflow-hidden">
      <Container size="xl" className="py-10 md:py-20 lg:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-[0.7rem] md:text-xs font-extrabold uppercase tracking-[0.18em] text-white">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-white"
              aria-hidden
            />
            AKO TO FUNGUJE
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Od konzultácie po hotovú podlahu
          </h2>
          <p className="mt-3 text-base md:text-lg font-bold text-white/85">
            4 kroky a máš podlahu, ktorá vydrží roky
          </p>
        </motion.div>

        {/* Grid 2×2 */}
        <div className="mt-6 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 max-w-4xl mx-auto">
          {STEPS.map((step, idx) => {
            const isFinal = idx === STEPS.length - 1;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={
                  isFinal
                    ? "relative rounded-2xl border-l-4 border-[var(--color-copper)] bg-[#0e1a3b] p-5 md:p-7 overflow-hidden"
                    : "relative rounded-2xl border-l-4 border-[var(--color-copper)] bg-[#f5efe9] p-5 md:p-7 overflow-hidden"
                }
              >
                {/* Veľké faded číslo vpravo hore */}
                <span
                  aria-hidden
                  className={
                    isFinal
                      ? "absolute top-3 right-5 text-5xl md:text-6xl font-black tracking-tight text-white/[0.08] select-none"
                      : "absolute top-3 right-5 text-5xl md:text-6xl font-black tracking-tight text-[var(--color-copper)]/15 select-none"
                  }
                >
                  {step.number}
                </span>

                {/* Ikona */}
                <div
                  className={
                    isFinal
                      ? "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brand)] text-white"
                      : "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-copper)] text-white"
                  }
                >
                  <step.icon className="w-6 h-6" aria-hidden />
                </div>

                {/* Title */}
                <h3
                  className={
                    isFinal
                      ? "mt-6 text-xl md:text-2xl font-black tracking-tight text-white"
                      : "mt-6 text-xl md:text-2xl font-black tracking-tight text-[var(--color-fg)]"
                  }
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className={
                    isFinal
                      ? "mt-2 text-sm md:text-base font-bold leading-relaxed text-white/85"
                      : "mt-2 text-sm md:text-base font-bold leading-relaxed text-[var(--color-fg)]/80"
                  }
                >
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 md:mt-12 flex justify-center"
        >
          <Link
            href="/cenova-ponuka"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#3db6e8] hover:bg-[#1a8cc4] text-white text-base md:text-lg font-extrabold ring-2 ring-white/20 hover:ring-white/40 shadow-[0_12px_36px_rgba(61,182,232,0.5)] hover:shadow-[0_16px_44px_rgba(61,182,232,0.7)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Chcem cenovú ponuku
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
