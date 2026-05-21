import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactCards } from "@/components/contact/ContactCards";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontaktujte EPOXIDOVO — zavolaj, napíš email alebo otvor chat. Telefón ${SITE.contact.phone}, email ${SITE.contact.email}.`,
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <ContactHero />

      <Section
        tone="default"
        size="md"
        className="bg-[var(--color-copper)] !text-white"
      >
        <Container size="xl" className="py-10 md:py-14">
          <ContactCards />
        </Container>
      </Section>
    </>
  );
}
