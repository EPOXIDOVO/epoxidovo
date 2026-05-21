"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/site";

export function FinalCta() {
  return (
    <Section tone="default" size="lg" id="kontakt-cta">
      <Container size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-[var(--color-ink)] text-white p-10 md:p-16 lg:p-20"
        >
          {/* Pozadie */}
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[var(--color-brand)] opacity-20 blur-3xl pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[var(--color-brand-soft)] opacity-10 blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-brand-soft)]">
              Začni svoju realizáciu
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Ozvi sa a do 24 hodín máš{" "}
              <span className="italic font-light text-[var(--color-brand-soft)]">
                cenovú ponuku.
              </span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-zinc-300 leading-relaxed">
              Bezplatná obhliadka po celom Slovensku. Pošli nám pár fotiek
              priestoru a rozmery — ozveme sa s návrhom riešenia a transparentnou
              cenou.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row flex-wrap gap-3">
              <Button href="/cenova-ponuka" variant="brand" size="lg">
                Mám záujem
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
              <Button
                href={`tel:${SITE.contact.phoneRaw}`}
                external
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[var(--color-fg)]"
              >
                <Phone className="w-4 h-4" aria-hidden />
                {SITE.contact.phone}
              </Button>
              <Button
                href={`mailto:${SITE.contact.email}`}
                external
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                <Mail className="w-4 h-4" aria-hidden />
                {SITE.contact.email}
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
