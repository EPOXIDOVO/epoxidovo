"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ruler, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Sekcia "Štýlové a odolné podlahy" — 1:1 podľa pôvodného webu:
 * - Biele pozadie + tmavomodrý heading
 * - Vľavo: eyebrow + heading + 2 features (pravítko + tím) + 2 fajky + CTA
 * - Vpravo: 6 zaoblených fotiek (1024 horizontálne + 768 vertikálne)
 */

const FEATURES = [
  {
    icon: Ruler,
    text:
      "Každý projekt tvoríme podľa vášho vkusu, vyberiete si farby, efekty aj celkový štýl podlahy.",
  },
  {
    icon: Users,
    text:
      "Profesionálna realizácia bez zbytočného chaosu, čistá práca, rýchle dokončenie a dôvera postavená na stovkách úspešných projektov.",
  },
];

export function About() {
  return (
    <section className="relative bg-white overflow-hidden">
      <Container size="xl" className="py-20 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Ľavá časť — text + features */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 1 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="eyebrow">
                VYTVÁRAME JEDINEČNÉ PODLAHY, KTORÉ NIKTO INÝ NEMÁ
              </span>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-[var(--color-fg)]">
                Štýlové a odolné podlahy
              </h2>
              <p className="mt-5 text-base md:text-lg text-[var(--color-fg)]/80 leading-relaxed max-w-xl">
                Navrhnuté tak, aby boli jediné svojho druhu — s povrchom, ktorý vydrží roky a ľahko sa udržiava.
              </p>
            </motion.div>

            {/* 2 ikony s textom */}
            <motion.div
              initial={{ opacity: 1 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 space-y-6"
            >
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-start gap-4">
                    <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brand)]">
                      <Icon className="w-6 h-6 text-white" aria-hidden />
                    </div>
                    <p className="text-base md:text-lg text-[var(--color-fg)] font-semibold leading-relaxed pt-1">
                      {f.text}
                    </p>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 1 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10"
            >
              <Link href="/kontakt" className="btn btn-primary btn-lg">
                Kontaktuj nás
              </Link>
            </motion.div>
          </div>

          {/* Pravá časť — 6 zaoblených fotiek */}
          <motion.div
            initial={{ opacity: 1 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 order-1 lg:order-2 relative"
          >
            <PhotoCollage />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Asymetrické usporiadanie 6 zaoblených fotiek
 * Pôvodný web: foto1 (vľavo veľká vertical), foto2 (stred), foto3 (vpravo malá),
 * foto4 (dolu vľavo), foto5 (dolu stred), foto6 (dolu vpravo malá)
 */
function PhotoCollage() {
  return (
    <div className="relative grid grid-cols-3 gap-3 md:gap-4">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden col-span-1 row-span-2 mt-8">
        <Image
          src="/images/about/foto1.jpg"
          alt="Realizácia epoxidovej podlahy"
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover"
        />
      </div>
      <div className="relative aspect-square rounded-2xl overflow-hidden col-span-1">
        <Image
          src="/images/about/foto2.jpg"
          alt="Realizácia epoxidovej podlahy"
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover"
        />
      </div>
      <div className="relative aspect-square rounded-2xl overflow-hidden col-span-1 mt-12">
        <Image
          src="/images/about/foto3.jpg"
          alt="Realizácia epoxidovej podlahy"
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover"
        />
      </div>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden col-span-1">
        <Image
          src="/images/about/foto4.jpg"
          alt="Realizácia epoxidovej podlahy"
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover"
        />
      </div>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden col-span-1 -mt-4">
        <Image
          src="/images/about/foto5.jpg"
          alt="Realizácia epoxidovej podlahy"
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
