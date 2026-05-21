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

      <Container size="xl" className="pt-[120px] md:pt-[140px] pb-10 md:pb-14 relative">
        <div className="text-center text-white">
          {/* Bublina s nadpisom */}
          <div className="inline-block px-8 md:px-14 py-5 md:py-7 rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Kontaktujte nás
            </h1>
          </div>
          {/* Breadcrumb pod bublinou */}
          <nav
            aria-label="Breadcrumb"
            className="mt-5 md:mt-6 text-base md:text-lg text-white/90"
          >
            <ol className="inline-flex items-center gap-2.5">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#3db6e8] transition-colors"
                >
                  Domovská stránka
                </Link>
              </li>
              <li className="text-white/40" aria-hidden>/</li>
              <li>
                <Link
                  href="/realizacie"
                  className="text-[#3db6e8] hover:text-white transition-colors font-semibold"
                >
                  Ukážky realizácií
                </Link>
              </li>
            </ol>
          </nav>
        </div>
      </Container>
    </section>
  );
}
