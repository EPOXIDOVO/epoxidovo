import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { CategoriesShowcase } from "@/components/home/CategoriesShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Reviews } from "@/components/home/Reviews";

/**
 * Homepage — finálne poradie podľa briefu + UX optimalizácie:
 * 1. Hero (3 CTA + dummy pozadie)
 * 2. HeroFeatures (3 chlieviky s ikonami)
 * 3. CategoriesShowcase (oranzova s 4 kartami)
 * 4. UspSection ("TÚTO PODLAHU POTREBUJEŠ")
 * 5. About (Štýlové a odolné + 6 fotiek)
 * 6. Stats (200+ realizácií, 28 zákazníkov...)
 * 7. HowItWorks (Macko + 4 kroky)
 * 8. Projects (NAŠE PROJEKTY)
 * 9. Faq (najčastejšie otázky — SEO rich snippets)
 * 10. Reviews (28 rotujúcich recenzií)
 */
export default function HomePage() {
  return (
    <>
      <div className="-mt-20 md:-mt-24">
        <Hero />
      </div>
      <CategoriesShowcase />
      <Stats />
      <HowItWorks />
      <Reviews />
    </>
  );
}
