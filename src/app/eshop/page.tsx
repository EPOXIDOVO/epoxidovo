import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";

export const metadata: Metadata = {
  title: "E-shop — materiály a náradie (čoskoro)",
  description:
    "Pripravujeme e-shop s profesionálnymi epoxidovými materiálmi Sika a Topstone, pigmentami a náradím na epoxidové podlahy. Spúšťame čoskoro.",
  alternates: { canonical: "/eshop" },
};

/**
 * Dummy produkty pre coming-soon teaser. Fotky zatiaľ placeholder
 * (gradient + emoji) — nahradia sa reálnymi produktovkami pri spustení.
 * Karty sú zámerne NEklikateľné (žiadny link, žiadny buy button).
 */
const DUMMY_PRODUCTS: {
  name: string;
  category: string;
  emoji: string;
  gradient: string;
}[] = [
  {
    name: "Epoxidová živica — set na 30 m²",
    category: "Materiál",
    emoji: "🪣",
    gradient: "linear-gradient(135deg, #3db6e8 0%, #1a5f8a 100%)",
  },
  {
    name: "Metalický epoxid + pigmenty",
    category: "Materiál",
    emoji: "✨",
    gradient: "linear-gradient(135deg, #a855f7 0%, #4c1d95 100%)",
  },
  {
    name: "Farebné chipsy / vločky 1 kg",
    category: "Materiál",
    emoji: "🎨",
    gradient: "linear-gradient(135deg, #f97316 0%, #9a3412 100%)",
  },
  {
    name: "Penetrácia / primer na betón",
    category: "Materiál",
    emoji: "🧪",
    gradient: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)",
  },
  {
    name: "Ihlový odvzdušňovací valček",
    category: "Náradie",
    emoji: "🛠️",
    gradient: "linear-gradient(135deg, #64748b 0%, #1e293b 100%)",
  },
  {
    name: "Raklo + zubová stierka set",
    category: "Náradie",
    emoji: "📏",
    gradient: "linear-gradient(135deg, #eab308 0%, #713f12 100%)",
  },
  {
    name: "PU vrchný lak — matný / lesklý",
    category: "Materiál",
    emoji: "💧",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #164e63 100%)",
  },
  {
    name: "Kompletný DIY set pre garáž",
    category: "Set",
    emoji: "📦",
    gradient: "linear-gradient(135deg, #ec4899 0%, #831843 100%)",
  },
];

export default function EshopPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
        ]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 0%, rgba(61,182,232,0.22), transparent 75%)",
          }}
        />
        <Container size="xl" className="pt-28 md:pt-36 pb-14 md:pb-20 relative text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3db6e8]/15 border border-[#3db6e8]/50 text-[#3db6e8] font-bold uppercase tracking-wide text-sm">
            <ShoppingBag className="w-4 h-4" aria-hidden />
            Čoskoro spúšťame
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            E-shop s materiálmi
            <br />
            <span className="text-[#3db6e8]">a náradím na epoxid</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Profesionálne materiály, ktoré používame na vlastných realizáciách —
            živice, pigmenty, chipsy a náradie. Všetko na jednom mieste, čoskoro
            aj pre teba.
          </p>
        </Container>
      </section>

      {/* Product grid — dummy, non-clickable */}
      <Section tone="default" size="md">
        <Container size="xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {DUMMY_PRODUCTS.map((p) => (
              <div
                key={p.name}
                aria-disabled
                className="relative rounded-2xl border border-zinc-200 bg-white overflow-hidden select-none cursor-default"
              >
                {/* Čoskoro badge */}
                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-[#0a0f1e]/85 backdrop-blur-sm text-white text-[11px] md:text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  Čoskoro
                </div>
                {/* Placeholder "fotka" */}
                <div
                  aria-hidden
                  className="aspect-square flex items-center justify-center text-6xl md:text-7xl"
                  style={{ background: p.gradient }}
                >
                  <span className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                    {p.emoji}
                  </span>
                </div>
                <div className="p-3.5 md:p-4">
                  <div className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-[#3db6e8]">
                    {p.category}
                  </div>
                  <h2 className="mt-1 text-sm md:text-base font-bold text-zinc-900 leading-snug">
                    {p.name}
                  </h2>
                  <div className="mt-2 text-sm md:text-base font-extrabold text-zinc-300">
                    — €
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notify CTA */}
          <div className="mt-12 md:mt-16 rounded-3xl bg-[#0a0f1e] text-white p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#3db6e8]/15 text-[#3db6e8] mb-5">
              <Bell className="w-7 h-7" aria-hidden />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Chceš vedieť, keď spustíme?
            </h2>
            <p className="mt-3 text-white/75 max-w-xl mx-auto leading-relaxed">
              Napíš nám a dáme ti vedieť medzi prvými. Medzitým ti radi
              poradíme s výberom materiálu alebo pripravíme cenovú ponuku na
              realizáciu na kľúč.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3db6e8] text-white font-semibold hover:bg-[#1a8cc4] transition-colors"
              >
                Napíš nám
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/cenova-ponuka"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                Cenová ponuka na realizáciu
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
