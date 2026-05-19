import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/content/categories";

export const metadata: Metadata = {
  title: "Služby — Typy epoxidových podláh",
  description:
    "Jednofarebné, chipsové, mramorové a metalické epoxidové podlahy. Ručne tvorené, odolné a originálne — pre domov, garáž alebo firmu.",
  alternates: { canonical: "/sluzby" },
};

export default function SluzbyPage() {
  return (
    <>
      <Section tone="default" size="md">
        <Container size="xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand)]">
              Naše služby
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Štyri typy podláh.
              <br />
              <span className="text-[var(--color-fg-muted)] font-normal">
                Nekonečné možnosti.
              </span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-[var(--color-fg-muted)] leading-relaxed">
              Každá kategória má svoj charakter, svoju cenu a svoj príbeh.
              Pomôžeme ti vybrať to, čo presne sedí tvojmu priestoru.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="default" size="md">
        <Container size="xl">
          <div className="space-y-5">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.slug}
                href={`/sluzby/${cat.slug}`}
                className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 p-6 md:p-10 rounded-3xl border border-[var(--color-border)] hover:border-[var(--color-fg)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500"
              >
                <div className="md:col-span-1">
                  <span className="inline-block text-xs font-mono text-[var(--color-fg-subtle)]">
                    0{idx + 1}
                  </span>
                </div>
                <div className="md:col-span-7">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight group-hover:text-[var(--color-brand)] transition-colors duration-300">
                    {cat.name}
                  </h2>
                  <p className="mt-2 text-sm md:text-base text-[var(--color-brand)] font-medium">
                    {cat.tagline}
                  </p>
                  <p className="mt-4 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed max-w-2xl">
                    {cat.description}
                  </p>
                </div>
                <div className="md:col-span-4 flex md:justify-end items-center">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    Zobraziť detaily
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button href="/kontakt" variant="primary" size="lg">
              Nezáväzná cenová ponuka
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
