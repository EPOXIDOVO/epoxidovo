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
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Cenová ponuka", path: "/cenova-ponuka" },
        ]}
      />
      {/* Hero — pohyblivý marquee fotiek podláh + tmavý overlay + bublina */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e]">
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
          className="pointer-events-none absolute inset-0 bg-black/60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(61,182,232,0.18), transparent 75%)",
          }}
        />
        <Container
          size="xl"
          className="pt-[120px] md:pt-[140px] pb-10 md:pb-14 relative z-10"
        >
          <div className="text-center text-white">
            <div className="inline-block px-6 md:px-12 py-5 md:py-7 rounded-3xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Nezáväzná{" "}
                <span className="text-[#3db6e8]">cenová ponuka</span>
              </h1>
            </div>
            <p className="mt-5 md:mt-6 text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
              Vyplň formulár a do <strong>24 hodín</strong> ti pošleme cenovú
              kalkuláciu na mieru.
            </p>
            <nav
              aria-label="Breadcrumb"
              className="mt-5 md:mt-6 text-sm md:text-base text-white/80"
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
                <li className="text-white/40" aria-hidden>
                  /
                </li>
                <li>
                  <Link
                    href="/kontakt"
                    className="text-[#3db6e8] hover:text-white transition-colors font-semibold"
                  >
                    Kontaktujte nás
                  </Link>
                </li>
              </ol>
            </nav>
          </div>
        </Container>
      </section>

      <Section
        tone="default"
        size="md"
        className="bg-[var(--color-copper)] !text-white"
      >
        <Container size="xl" className="py-8 md:py-12">
          <CenovaPonukaForm />
        </Container>
      </Section>
    </>
  );
}
