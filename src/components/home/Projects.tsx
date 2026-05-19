"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Sekcia "NAŠE PROJEKTY" — z HTML pôvodného webu:
 * - h3: "NAŠE PROJEKTY"
 * - h2: "Ukážka našej overenej práce s epoxidovými podlahami"
 * - 4 projektové fotky (project-1, 2, 3, 4)
 *
 * POZN: pôvodný web mal HVAC content tu (Multi-Zone Cooling, Hotel HVAC, atď.) —
 * to bol bug ktorý sa zachoval z theme-template (Coolify theme bola HVAC theme).
 * Náhradou: použijeme nadpisy z briefu klienta a fotky z Drive kategórií.
 */

// Pôvodný web mal v 'project-1..4.jpg' HVAC klima fotky (template residue) — odhadzujeme ich.
// Použijeme fotky podláh z about-galérie + kategórií (skutočné fotky epoxidov).
const PROJECTS = [
  {
    title: "Mramorová obývačka",
    category: "Mramorové",
    image: "/images/about/foto2.jpg",
    href: "/realizacie?kategoria=mramorove",
  },
  {
    title: "Garáž s chipsmi",
    category: "Chipsové",
    image: "/images/about/foto5.jpg",
    href: "/realizacie?kategoria=chipsove",
  },
  {
    title: "Metalická hala",
    category: "Metalické",
    image: "/images/about/foto1.jpg",
    href: "/realizacie?kategoria=metalicke",
  },
  {
    title: "Jednofarebná kuchyňa",
    category: "Jednofarebné",
    image: "/images/about/foto3.jpg",
    href: "/realizacie?kategoria=jednofarebne",
  },
];

export function Projects() {
  return (
    <section className="relative bg-white overflow-hidden">
      <Container size="xl" className="py-20 md:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 1 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="eyebrow justify-center">NAŠE PROJEKTY</span>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[var(--color-fg)]">
            Ukážka našej overenej práce s epoxidovými podlahami
          </h2>
        </motion.div>

        <div className="mt-14 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {PROJECTS.map((p, idx) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 1 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.7,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={p.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--color-bg-soft)]"
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Hover šípka */}
                <span
                  aria-hidden
                  className="absolute top-5 right-5 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-[var(--color-fg)] backdrop-blur-md transition-all duration-500"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </span>

                {/* Spodný text */}
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#3db6e8] font-semibold mb-2">
                    {p.category}
                  </p>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight">
                    {p.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/realizacie"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[var(--color-brand)] text-white font-semibold hover:bg-[var(--color-brand-deep)] hover:shadow-[var(--shadow-cta)] transition-all duration-300"
          >
            Pozrieť všetky realizácie
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  );
}
