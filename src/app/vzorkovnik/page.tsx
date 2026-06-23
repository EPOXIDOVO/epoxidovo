import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { RAL_CLASSIC_FULL, RAL_GROUPS } from "@/content/ral-classic";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vzorkovník RAL — farby epoxidových podláh",
  description:
    "Kompletný RAL Classic vzorkovník. Vyber si farbu svojej epoxidovej podlahy z 50+ overených RAL odtieňov. Bielé, sivé, béžové, modré, zelené, čierné a viac.",
  alternates: { canonical: "/vzorkovnik" },
};

export default function VzorkovnikPage() {
  return (
    <div className="bg-[#F8FAFC]">
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Vzorkovník RAL", path: "/vzorkovnik" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a0f1e] via-[#1B2430] to-[#0a0f1e] text-white">
        <Container size="xl" className="py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-[11px] md:text-xs font-extrabold uppercase tracking-wider mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-[#3db6e8] via-[#5cb8e8] to-[#1a8cc4] text-white text-[10px] font-black">
              R
            </span>
            Vzorkovník RAL Classic
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            Vyber si{" "}
            <span className="text-[#3db6e8]">farbu</span>{" "}
            svojej podlahy
          </h1>
          <p className="mt-4 md:mt-6 text-sm md:text-lg font-bold text-white/80 max-w-2xl mx-auto leading-relaxed">
            Pracujeme s celou RAL Classic paletou. Tu je výber{" "}
            <strong className="text-white">{RAL_CLASSIC_FULL.length} najpopulárnejších odtieňov</strong>{" "}
            pre epoxidové podlahy. Klikni na ľubovoľnú farbu pre detail.
          </p>
          <nav
            aria-label="Breadcrumb"
            className="mt-5 md:mt-6 text-xs md:text-sm text-white/70 font-semibold"
          >
            <ol className="inline-flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-[#3db6e8] transition-colors">
                  Domov
                </Link>
              </li>
              <li className="text-white/30">/</li>
              <li className="text-[#3db6e8]">Vzorkovník RAL</li>
            </ol>
          </nav>
        </Container>
      </section>

      {/* RAL grid — grouped by family */}
      <Section tone="default" size="lg">
        <Container size="xl">
          {RAL_GROUPS.map((group) => {
            const colors = RAL_CLASSIC_FULL.filter((c) => c.skupina === group.key);
            if (colors.length === 0) return null;
            return (
              <section key={group.key} className="mb-10 md:mb-14 last:mb-0">
                <div className="flex items-baseline gap-3 mb-4 md:mb-5">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#1B2430]">
                    {group.label}
                  </h2>
                  <span className="text-xs md:text-sm font-bold text-[#1B2430]/50">
                    {colors.length} {colors.length === 1 ? "farba" : "farieb"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {colors.map((c) => {
                    // Auto-detect text color: dark text on light bg, light text on dark bg
                    const hexNum = parseInt(c.hex.replace("#", ""), 16);
                    const r = (hexNum >> 16) & 0xff;
                    const g = (hexNum >> 8) & 0xff;
                    const b = hexNum & 0xff;
                    // Perceived luminance
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    const isLight = lum > 128;
                    return (
                      <div
                        key={c.kod}
                        className="group rounded-2xl overflow-hidden ring-1 ring-[#1B2430]/10 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div
                          className="aspect-square flex items-end p-3 md:p-4 transition-transform group-hover:scale-[1.02]"
                          style={{ backgroundColor: c.hex }}
                        >
                          <span
                            className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${
                              isLight ? "text-[#1B2430]" : "text-white"
                            }`}
                          >
                            {c.kod}
                          </span>
                        </div>
                        <div className="p-3 md:p-4">
                          <div className="text-xs md:text-sm font-black text-[#1B2430] leading-tight">
                            {c.nazov}
                          </div>
                          <div className="mt-0.5 text-[10px] md:text-[11px] font-bold text-[#1B2430]/55">
                            {c.hex.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </Container>
      </Section>

      {/* CTA — Cenová ponuka */}
      <section className="bg-gradient-to-br from-[#F0851A] to-[#D9760F] text-white">
        <Container size="lg" className="py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Vybral si farbu? Pošleme ti{" "}
            <span className="underline decoration-2 underline-offset-4">
              nezáväznú cenovú ponuku
            </span>
            .
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base font-bold text-white/90 max-w-xl mx-auto">
            Pripravíme ti kalkuláciu na mieru — do 24 hodín. Volaj{" "}
            <a
              href={`tel:${SITE.contact.phone.replace(/\s/g, "")}`}
              className="underline font-black hover:text-white/95"
            >
              {SITE.contact.phone}
            </a>{" "}
            alebo:
          </p>
          <Link
            href="/cenova-ponuka"
            className="mt-6 md:mt-7 inline-flex items-center gap-2 px-7 md:px-9 py-3.5 md:py-4 rounded-full bg-white text-[#D9760F] font-black text-sm md:text-base hover:bg-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all duration-300"
          >
            Nezáväzná cenová ponuka
          </Link>
        </Container>
      </section>
    </div>
  );
}
