"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, Droplets, Hammer } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BENEFITS } from "@/content/benefits";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Shield,
  Droplets,
  Hammer,
};

/**
 * 4 výhody v "chlievikoch" so symbolom navrchu (z briefu klienta).
 * Vodorovne v rade na desktope, stack na mobile.
 */
export function Benefits() {
  return (
    <Section tone="default" size="lg" id="vyhody">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Prečo epoxid
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Štyri dôvody, prečo ľudia volia EPOXIDOVO.
          </h2>
        </motion.div>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {BENEFITS.map((benefit, idx) => {
            const Icon = ICONS[benefit.icon] ?? Sparkles;
            return (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative h-full p-6 md:p-7 rounded-2xl bg-[var(--color-bg-soft)] border border-[var(--color-border)] hover:border-[var(--color-fg)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-500"
              >
                {/* Symbol navrchu (z briefu) */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-fg)] text-white group-hover:bg-[var(--color-brand)] transition-colors duration-500">
                  <Icon className="w-6 h-6" aria-hidden />
                </div>

                <h3 className="mt-5 text-lg md:text-xl font-semibold tracking-tight">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-fg-muted)] leading-relaxed">
                  {benefit.description}
                </p>

                {/* Indicator number */}
                <span className="absolute top-6 right-6 text-xs font-mono text-[var(--color-fg-subtle)]">
                  0{idx + 1}
                </span>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
