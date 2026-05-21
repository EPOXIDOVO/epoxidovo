import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * Kontakt hero — pohyblivý marquee s fotkami podláh + tmavý overlay.
 * - Veľký nadpis "Kontaktujte nás" v bubline + breadcrumb pod ňou.
 */
const MARQUEE_PHOTOS = [
  "/images/realizacie/r-19.jpg",
  "/images/realizacie/r-35.jpg",
  "/images/realizacie/r-32.jpg",
  "/images/realizacie/r-37.webp",
  "/images/realizacie/r-40.jpg",
];

export function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a0f1e]">
      {/* Pohyblivý pásik fotiek podláh (right → left). 3× duplikovaný pre seamless loop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex w-max animate-stats-marquee"
      >
        {[...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS].map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full w-[60vw] md:w-[32vw] lg:w-[24vw] shrink-0"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 768px) 60vw, 32vw"
              className="object-cover"
              priority={i < 3}
            />
          </div>
        ))}
      </div>
      {/* Tmavý overlay nad marquee pre čitateľnosť textu */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/60"
      />
      {/* Radial glow brand — jemný akcent navrchu */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(61,182,232,0.18), transparent 75%)",
        }}
      />

      <Container size="xl" className="pt-[120px] md:pt-[140px] pb-10 md:pb-14 relative z-10">
        <div className="text-center text-white">
          {/* Bublina s nadpisom */}
          <div className="inline-block px-8 md:px-14 py-5 md:py-7 rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Kontaktujte nás
            </h1>
          </div>
          <p className="mt-5 md:mt-6 text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
            Zavolaj, napíš alebo otvor chat — odpovieme rýchlo.
          </p>
          {/* Breadcrumb pod bublinou */}
          <nav
            aria-label="Breadcrumb"
            className="mt-4 md:mt-5 text-sm md:text-base text-white/80"
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
                  href="/cenova-ponuka"
                  className="text-[#3db6e8] hover:text-white transition-colors font-semibold"
                >
                  Cenová ponuka
                </Link>
              </li>
            </ol>
          </nav>
        </div>
      </Container>
    </section>
  );
}
