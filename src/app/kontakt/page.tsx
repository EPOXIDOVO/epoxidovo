import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontaktujte EPOXIDOVO — nezáväzná cenová ponuka pre vašu epoxidovú podlahu. Telefón ${SITE.contact.phone}, email ${SITE.contact.email}.`,
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <ContactHero />

      <section className="bg-[var(--color-copper)] text-white py-10 md:py-14">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5">
              <ContactInfo />
            </div>
            <div className="lg:col-span-7" id="cenova-ponuka">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
