import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, Package, Phone, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/Spotlight";
import { SADY } from "@/data/sady";
import { getSystem } from "@/data/systems";
import { calcSystem } from "@/lib/calculator";
import { SITE } from "@/lib/site";
import { SadaCard } from "./SadaCard";
import { CartBadge } from "./CartBadge";
import type { CartItem } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Kúpiť materiál — kalkulátor skladby a sady",
  description:
    "Vypočítaj si presne koľko materiálu potrebuješ na epoxidovú alebo liatu podlahu, alebo si kúp hotovú sadu. Predaj v celých baleniach, konečné ceny.",
  alternates: { canonical: "/kupit-material" },
};

/**
 * E-shop hub — hero s reálnou realizáciou, use-case dlaždice s fotkami,
 * sady počítané kalkulátorom, sekcia dôvery. Vizuálny jazyk hlavného webu
 * (navy hero, pill CTA, copper akcenty) — viď DESIGN_SYSTEM.md.
 */

const USE_CASES: {
  label: string;
  desc: string;
  href: string;
  img: string;
}[] = [
  { label: "Garáž", desc: "Odolný epoxid, ktorý znesie autá aj chémiu", href: "/kupit-material/kalkulacka?miesto=garaz", img: "/images/hero/garaz.webp" },
  { label: "Byt a dom", desc: "Liate podlahy bez škár do interiéru", href: "/kupit-material/kalkulacka?miesto=byt", img: "/images/hero/byvanie-v2.webp" },
  { label: "Dielňa", desc: "Protišmyk a odolnosť pre každodennú prácu", href: "/kupit-material/kalkulacka?miesto=dielna", img: "/images/realizacie/r-42.jpg" },
  { label: "Terasa", desc: "Exteriér riešime na mieru — poradíme", href: "/kupit-material/kalkulacka?miesto=terasa", img: "/images/realizacie/r-22.jpg" },
  { label: "Schody", desc: "Hrany a protišmyk, riešenie na mieru", href: "/kupit-material/kalkulacka?miesto=schody", img: "/images/realizacie/r-17.jpg" },
  { label: "Náradie a ochrana", desc: "Valce, stierky, respirátory a pomôcky", href: "/eshop", img: "/images/realizacie/r-35.jpg" },
];

const GALERIA = [
  { src: "/images/categories/metalicke.jpg", alt: "Metalická epoxidová podlaha — realizácia EPOXIDOVO" },
  { src: "/images/realizacie/r-48.jpg", alt: "Chipsová podlaha v garáži — realizácia EPOXIDOVO" },
  { src: "/images/hero/byvanie-v2.webp", alt: "Jednofarebná liata podlaha v interiéri — realizácia EPOXIDOVO" },
  { src: "/images/realizacie/r-20.jpg", alt: "Modrá priemyselná podlaha v hale — realizácia EPOXIDOVO" },
];

export default function KupitMaterialPage() {
  // sady sa počítajú kalkulátorom pri renderi — žiadny drift cien
  const sadyData = SADY.map((sada) => {
    const system = getSystem(sada.systemId)!;
    const calc = calcSystem(system, {
      areaM2: sada.areaM2,
      reservePct: sada.reservePct,
      thicknessMm: sada.thicknessMm,
    });
    const items: CartItem[] = [
      ...calc.layers
        .filter((l) => l.packs != null)
        .map((l) => ({
          productId: l.product.id,
          qty: l.packs as number,
          systemLabel: sada.name,
          systemId: system.id,
        })),
      ...calc.tools.map((t) => ({
        productId: t.product.id,
        qty: t.qty,
        systemLabel: sada.name,
        systemId: system.id,
      })),
    ];
    const obsah = [
      ...calc.layers.map((l) =>
        l.packs != null
          ? `${l.packs}× ${l.product.name}`
          : `${l.product.name} (na dopyt)`,
      ),
      `${calc.tools.length}× náradie a pomôcky`,
    ];
    return {
      sada,
      items,
      obsah,
      priceLabel: calc.priceIsFinal
        ? `${calc.priceSubtotal.toFixed(2).replace(".", ",")} €`
        : `od ${calc.priceSubtotal.toFixed(2).replace(".", ",")} €`,
    };
  });

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "Kúpiť materiál", path: "/kupit-material" },
        ]}
      />
      <CartBadge />

      {/* ── HERO: reálna realizácia + tmavý overlay + glow CTA ── */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] text-white noise-overlay">
        <Image
          src="/images/categories/metalicke.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={75}
          className="object-cover opacity-40"
          aria-hidden
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,15,30,0.55) 0%, rgba(10,15,30,0.82) 62%, #0a0f1e 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 48% at 50% 8%, rgba(61,182,232,0.25), transparent 72%)",
          }}
        />
        <Container size="xl" className="relative pt-24 md:pt-36 pb-16 md:pb-24 text-center">
          <h1
            className="text-[clamp(2.1rem,5.4vw,4.2rem)] font-extrabold tracking-tight leading-[1.04]"
            style={{ textWrap: "balance" }}
          >
            Kúpiť materiál —
            <br />
            <span className="text-[#3db6e8]">presne toľko, koľko treba</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Kalkulátor prepočíta skladbu vrstvu po vrstve a naplní košík celými
            baleniami. Materiály, ktoré sami lejeme na realizáciách.
          </p>
          <div className="relative mt-9 inline-block">
            <span
              aria-hidden
              className="absolute -inset-3 rounded-full opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(249,115,22,0.55), transparent)",
              }}
            />
            <Link
              href="/kupit-material/kalkulacka"
              data-magnetic
              className="press-scale relative inline-flex items-center gap-3 px-9 md:px-12 py-4 md:py-5 rounded-full bg-[#f97316] text-white font-extrabold text-lg md:text-xl shadow-[0_14px_40px_rgba(249,115,22,0.55)] hover:bg-[#ea580c] transition-colors"
            >
              <Calculator className="w-6 h-6" aria-hidden />
              Spustiť kalkulátor materiálu
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/60">
            Dodávateľ nie je platiteľom DPH. Ceny sú konečné.
          </p>
        </Container>
      </section>

      {/* ── USE-CASE DLAŽDICE s fotkami ── */}
      <section className="bg-[#f7f7f4]">
        <Container size="xl" className="py-14 md:py-20">
          <Reveal>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#0e1a3b]" style={{ textWrap: "balance" }}>
              Kde budeš lievať?
            </h2>
            <p className="mt-2 text-[#4a5478] max-w-2xl">
              Vyber priestor — kalkulátor sa predvyplní a povedie ťa ďalej.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {USE_CASES.map((u, i) => (
              <Reveal key={u.label} delay={i * 60}>
                <Link href={u.href} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3db6e8] rounded-3xl">
                  <SpotlightCard
                    tilt
                    className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-[#0e1a3b]"
                  >
                    <Image
                      src={u.img}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      quality={75}
                      className="object-cover opacity-80 group-hover:opacity-90 group-hover:scale-[1.05] transition-all duration-700"
                      aria-hidden
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/85 via-[#0a0f1e]/20 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white font-extrabold text-lg md:text-2xl tracking-tight">
                          {u.label}
                        </span>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white group-hover:bg-[#f97316] transition-colors">
                          <ArrowRight className="w-4 h-4" aria-hidden />
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] md:text-sm text-white/75 leading-snug hidden sm:block">
                        {u.desc}
                      </p>
                    </div>
                  </SpotlightCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── SADY ── */}
      <section className="bg-white">
        <Container size="xl" className="py-14 md:py-20">
          <Reveal>
            <div className="flex items-center gap-3">
              <Package className="w-7 h-7 text-[#3db6e8]" aria-hidden />
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#0e1a3b]">
                Hotové sady na typické plochy
              </h2>
            </div>
            <p className="mt-2 text-[#4a5478] max-w-2xl">
              Rovnaké položky, aké by ti vypočítal kalkulátor — jedným klikom
              do košíka.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {sadyData.map(({ sada, items, obsah, priceLabel }, i) => (
              <Reveal key={sada.id} delay={i * 80}>
                <SadaCard
                  sada={sada}
                  items={items}
                  obsah={obsah}
                  priceLabel={priceLabel}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── GALÉRIA DÔVERY ── */}
      <section className="bg-[#0e1a3b] text-white noise-overlay">
        <Container size="xl" className="py-14 md:py-20">
          <Reveal>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ textWrap: "balance" }}>
              Ten istý materiál lejeme aj my
            </h2>
            <p className="mt-2 text-white/70 max-w-2xl">
              Nepredávame nič, čo sme sami nemali na valci. Pozri si realizácie
              z materiálov, ktoré tu kupuješ.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {GALERIA.map((g, i) => (
              <Reveal key={g.src} delay={i * 70}>
                <Link
                  href="/realizacie"
                  className="group block relative aspect-square rounded-2xl overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3db6e8]"
                >
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    quality={75}
                    className="object-cover group-hover:scale-[1.06] transition-transform duration-700"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[#0a0f1e]/0 group-hover:bg-[#0a0f1e]/25 transition-colors"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 rounded-3xl bg-white/[0.06] border border-white/10 p-6 md:p-8">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400" aria-label="5 z 5 hviezdičiek">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" aria-hidden />
                  ))}
                </div>
                <p className="mt-2 text-lg md:text-xl font-bold" style={{ textWrap: "balance" }}>
                  Nevieš, ktorú skladbu zvoliť? Zavoláme ti a poradíme zadarmo.
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Po-Pi 8:00 – 17:00 · {SITE.contact.phone}
                </p>
              </div>
              <a
                href={`tel:${SITE.contact.phoneRaw}`}
                data-magnetic
                className="press-scale shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#16a34a] text-white font-bold hover:bg-[#15803d] shadow-[0_10px_28px_rgba(22,163,74,0.4)] transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden />
                Zavolať teraz
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── TRI CESTY ĎALEJ ── */}
      <section className="bg-[#f7f7f4]">
        <Container size="xl" className="py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                href: "/eshop",
                title: "Katalóg produktov",
                desc: "352 materiálov Sika, TopStone, Arturo a UZIN s filtrami a vyhľadávaním podľa SKU.",
              },
              {
                href: "/kupit-material/b2b",
                title: "Pre realizačné firmy",
                desc: "Registrácia cez IČO — veľkoobchodné podmienky po schválení účtu.",
              },
              {
                href: "/cenova-ponuka",
                title: "Radšej na kľúč?",
                desc: "Nechaj podlahu na nás — nezáväzná cenová ponuka do 24 hodín.",
              },
            ].map((c, i) => (
              <Reveal key={c.href} delay={i * 70}>
                <Link href={c.href} className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3db6e8] rounded-3xl">
                  <SpotlightCard className="h-full rounded-3xl border border-[#e4e4e7] bg-white p-6 md:p-7 hover:shadow-[0_18px_44px_rgba(14,26,59,0.12)] hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg md:text-xl font-extrabold text-[#0e1a3b] tracking-tight">
                        {c.title}
                      </h3>
                      <span className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-[#0e1a3b]/5 text-[#0e1a3b] group-hover:bg-[#f97316] group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" aria-hidden />
                      </span>
                    </div>
                    <p className="mt-2 text-sm md:text-[15px] text-[#4a5478] leading-relaxed">
                      {c.desc}
                    </p>
                  </SpotlightCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
