import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactCards } from "@/components/contact/ContactCards";
import { ContactMessageForm } from "@/components/contact/ContactMessageForm";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontaktujte EPOXIDOVO — zavolaj, napíš email alebo otvor chat. Telefón ${SITE.contact.phone}, email ${SITE.contact.email}.`,
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kontakt", path: "/kontakt" },
        ]}
      />
      <ContactHero />

      <Section
        tone="default"
        size="md"
        className="bg-[var(--color-copper)] !text-white"
      >
        <Container size="xl" className="py-10 md:py-14">
          <ContactCards />

          <div className="mt-10 md:mt-14">
            <ContactMessageForm />
          </div>

          {/* Mapa */}
          <div className="mt-10 md:mt-14 max-w-3xl mx-auto">
            <MapEmbed />
          </div>

          {/* Firemné údaje */}
          <div className="mt-12 md:mt-16 text-center text-white/90 text-sm md:text-base leading-relaxed">
            <p className="font-bold tracking-tight text-base md:text-lg">
              EPOXIDOVO s.r.o.
            </p>
            <p className="mt-1.5">
              IČO: <span className="font-semibold">56 966 237</span>
              <span className="mx-2 text-white/40">·</span>
              DIČ: <span className="font-semibold">2122519135</span>
            </p>
            <p className="mt-1">Plavisko 1956/35, 034 01 Ružomberok</p>
          </div>
        </Container>
      </Section>
    </>
  );
}
