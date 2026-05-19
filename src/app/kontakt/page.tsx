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

      <section className="bg-[var(--color-copper)] text-white py-16 md:py-24">
        <Container size="xl">
          {/* Spoločný header — eyebrow + h2 nad gridom, aby boli bubla a form prirodzene zarovnané */}
          <div className="max-w-3xl mb-10 md:mb-14">
            <span className="eyebrow eyebrow-white text-white">
              KONTAKTUJTE NÁS
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              <span className="text-[#3db6e8]">Kontaktujte nás</span> a získajte
              nezáväznú{" "}
              <span className="text-[#3db6e8]">Cenovú Ponuku</span> pre váš
              projekt
            </h2>
          </div>

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
