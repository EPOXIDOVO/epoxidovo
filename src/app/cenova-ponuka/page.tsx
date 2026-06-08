import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CenovaPonukaForm } from "@/components/cenova-ponuka/CenovaPonukaForm";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nezáväzná cenová ponuka",
  description: `Vyplň formulár a do 24 hodín ti pošleme cenovú kalkuláciu na mieru pre tvoju epoxidovú podlahu. Bezplatne a nezáväzne. ${SITE.contact.phone}.`,
  alternates: { canonical: "/cenova-ponuka" },
};

const MARQUEE_PHOTOS = [
  "/images/realizacie/r-35.jpg",
  "/images/realizacie/r-32.jpg",
  "/images/realizacie/r-33.jpg",
  "/images/realizacie/r-11.jpg",
];

export default function CenovaPonukaPage() {
  return (
    // SiteChrome dáva main h-[100dvh] flex flex-col → tento div vyplní zvyšok.
    // Žiadny scroll na desktope (1-page UX). Mobile: scroll povolený (form je dlhý).
    <div className="flex-1 min-h-0 bg-[var(--color-copper)] overflow-y-auto md:overflow-hidden flex flex-col">
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Cenová ponuka", path: "/cenova-ponuka" },
        ]}
      />
      {/* Kompaktný hero strip — tmavé pozadie, len titulok + breadcrumb */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] shrink-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex w-max animate-stats-marquee"
        >
          {[...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS, ...MARQUEE_PHOTOS].map(
            (src, i) => (
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
            ),
          )}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/65"
        />
        <Container size="xl" className="py-4 md:py-5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-white">
            <div>
              <h1 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Nezáväzná{" "}
                <span className="text-[#3db6e8]">cenová ponuka</span>
              </h1>
              <p className="mt-0.5 text-xs md:text-sm text-white/85 font-bold">
                Vyplň formulár a do <strong>24 hodín</strong> ti pošleme
                kalkuláciu na mieru.
              </p>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="text-xs md:text-sm text-white/85 font-bold shrink-0"
            >
              <ol className="inline-flex items-center gap-1.5">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[#3db6e8] transition-colors"
                  >
                    Domovská stránka
                  </Link>
                </li>
                <li className="text-white/40" aria-hidden>
                  /
                </li>
                <li className="text-[#3db6e8] font-black">Cenová ponuka</li>
              </ol>
            </nav>
          </div>
        </Container>
      </section>

      {/* Form section — vyplní zvyšok výšky */}
      <Section
        tone="default"
        size="md"
        className="bg-[var(--color-copper)] !text-white flex-1 min-h-0 overflow-y-auto !py-4 md:!py-6"
      >
        <Container size="xl" className="py-2 md:py-2">
          <CenovaPonukaForm />
        </Container>
      </Section>
    </div>
  );
}
