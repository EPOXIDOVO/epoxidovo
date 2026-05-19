import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * Kontakt hero — tmavé navy pozadie s jemným grid + glow.
 * - Veľký nadpis "Kontaktujte nás" + breadcrumb Home / Kontakty
 */
export function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a0f1e]">
      <div className="absolute inset-0 -z-10" aria-hidden>
        {/* Jemný grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Radial glow brand */}
        <div
          className="absolute inset-x-0 top-0 h-full"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(61,182,232,0.22), transparent 75%)",
          }}
        />
      </div>

      <Container size="xl" className="pt-[140px] md:pt-[180px] pb-[80px] md:pb-[120px] relative">
        <div className="text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Kontaktujte nás
          </h1>
          <nav
            aria-label="Breadcrumb"
            className="mt-5 text-sm md:text-base text-white/90"
          >
            <ol className="inline-flex items-center gap-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#3db6e8] transition-colors"
                >
                  Domovská stránka
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-[#3db6e8]">Kontakty</li>
            </ol>
          </nav>
        </div>
      </Container>
    </section>
  );
}
