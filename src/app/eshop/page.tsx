import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { EshopClient } from "./EshopClient";
import { MATERIALY } from "@/lib/materialy";
import Image from "next/image";
import { Phone, ChevronRight, ArrowDown } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "E-shop — epoxidové materiály Sika, TopStone, Arturo a UZIN",
  description:
    "Profesionálne epoxidové materiály, ktoré používame na vlastných realizáciách — penetrácie, hlavné vrstvy, vrchné laky, nivelačné hmoty, pigmenty, chipsy a kremičité piesky. Sika, TopStone, Arturo a UZIN, konečné ceny.",
  alternates: { canonical: "/eshop" },
};

/**
 * E-shop — katalóg materiálov (Sika + TopStone z CRM, Arturo + UZIN z HA-UZ cenníkov).
 * Ceny sú finálne (neplatiteľ DPH). Objednávka zatiaľ cez telefón/email
 * z detailu produktu — bez košíka.
 */
export default function EshopPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
        ]}
      />
      {/* ── VIDEO HERO — nahraj public/video/eshop-hero.mp4 a hrá; dovtedy poster ── */}
      <section className="relative isolate overflow-hidden bg-[#0a0f1e] text-white">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/categories/metalicke.jpg"
        >
          <source src="/video/eshop-hero.mp4" type="video/mp4" />
        </video>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-[#0a0f1e]/70" />
        <Container size="xl" className="relative pt-28 md:pt-40 pb-16 md:pb-24 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ textWrap: "balance" }}>
            Materiály a náradie
            <br />
            <span className="text-[#3db6e8]">na epoxidové podlahy</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {MATERIALY.length} produktov Sika, TopStone, Arturo a UZIN — presne tie, ktoré
            používame na vlastných realizáciách. Konečné ceny, predaj v celých
            baleniach.
          </p>
          <a
            href="#katalog"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#f97316] text-white font-extrabold text-lg hover:bg-[#ea580c] shadow-[0_14px_40px_rgba(249,115,22,0.5)] transition-colors"
          >
            Prezrieť celý katalóg
            <ArrowDown className="w-5 h-5" aria-hidden />
          </a>
        </Container>
      </section>

      {/* ── KATEGÓRIOVÉ DLAŽDICE (štýl Epodex) — fotka, pill, podlinky ── */}
      <section className="bg-white">
        <Container size="xl" className="py-10 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              {
                label: "EPOXIDOVÉ ŽIVICE",
                img: "/images/categories/metalicke.jpg",
                linky: [
                  { text: "Penetrácie", href: "/eshop?skupina=penetracie#katalog" },
                  { text: "Hlavné vrstvy a nátery", href: "/eshop?skupina=hlavne#katalog" },
                  { text: "Vrchné laky", href: "/eshop?skupina=laky#katalog" },
                ],
              },
              {
                label: "KAMENNÝ KOBEREC",
                img: "/images/categories/mramorove.jpg",
                linky: [
                  { text: "Kamene a spojivá", href: "/eshop?skupina=kamenny-koberec#katalog" },
                  { text: "Chipsy a posypy", href: "/eshop?kat=chipsy#katalog" },
                ],
              },
              {
                label: "PRÍPRAVA PODKLADU",
                img: "/images/categories/jednofarebne.jpg",
                linky: [
                  { text: "Nivelácie a potery", href: "/eshop?skupina=priprava#katalog" },
                  { text: "Prísady a plnivá", href: "/eshop?skupina=prisady#katalog" },
                ],
              },
              {
                label: "NÁRADIE",
                img: "/images/realizacie/r-35.jpg",
                linky: [
                  { text: "Valce, stierky a pomôcky", href: "/eshop?skupina=naradie#katalog" },
                ],
              },
              { label: "MIKROCEMENT", img: "/images/hero/byvanie-v2.webp", coskoro: true },
              { label: "FARBY A DEKORATÍVNE STENY", img: "/images/realizacie/r-17.jpg", coskoro: true },
            ].map((d) => (
              <div
                key={d.label}
                className={`relative rounded-3xl overflow-hidden border border-zinc-200 bg-white flex flex-col ${d.coskoro ? "select-none" : ""}`}
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={d.img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    quality={85}
                    className={`object-cover ${d.coskoro ? "grayscale-[0.5] opacity-70" : ""}`}
                  />
                  <span className="absolute top-4 left-4 px-4 py-1.5 rounded-xl bg-white shadow text-[#0e1a3b] text-xs md:text-sm font-extrabold tracking-wide">
                    {d.label}
                  </span>
                  {d.coskoro && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#f97316] text-white text-xs font-bold uppercase tracking-wide shadow">
                      Čoskoro
                    </span>
                  )}
                </div>
                <div className="divide-y divide-zinc-100">
                  {d.coskoro ? (
                    <div className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-zinc-400 cursor-default">
                      Pripravujeme
                    </div>
                  ) : (
                    d.linky!.map((l) => (
                      // plné <a> (nie next/Link) — navigácia na tú istú stránku
                      // musí re-mountnúť katalóg, aby sa deep-link aplikoval
                      <a
                        key={l.text}
                        href={l.href}
                        className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-zinc-800 hover:bg-[#e3f3fb]/50 hover:text-[#1a8cc4] transition-colors"
                      >
                        {l.text}
                        <ChevronRight className="w-4 h-4 text-zinc-400" aria-hidden />
                      </a>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <div id="katalog" className="bg-[#f7f7f4] scroll-mt-20">
        <EshopClient />
      </div>

      {/* Galéria dôvery — ten istý materiál lejeme aj my (presunuté z hubu) */}
      <section className="bg-[#0e1a3b] text-white noise-overlay">
        <Container size="xl" className="py-14 md:py-20">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ textWrap: "balance" }}>
            Ten istý materiál lejeme aj my
          </h2>
          <p className="mt-2 text-white/70 max-w-2xl">
            Nepredávame nič, čo sme sami nemali na valci. Pozri si realizácie
            z materiálov, ktoré tu kupuješ.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: "/images/categories/metalicke.jpg", alt: "Metalická epoxidová podlaha — realizácia EPOXIDOVO" },
              { src: "/images/realizacie/r-48.jpg", alt: "Chipsová podlaha v garáži — realizácia EPOXIDOVO" },
              { src: "/images/hero/byvanie-v2.webp", alt: "Jednofarebná liata podlaha v interiéri — realizácia EPOXIDOVO" },
              { src: "/images/realizacie/r-20.jpg", alt: "Modrá priemyselná podlaha v hale — realizácia EPOXIDOVO" },
            ].map((f) => (
              <div key={f.src} className="relative aspect-square rounded-2xl overflow-hidden">
                <Image src={f.src} alt={f.alt} fill sizes="(max-width: 768px) 50vw, 25vw" quality={85} className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-amber-400" aria-hidden>★★★★★</div>
              <div className="mt-1 font-extrabold text-lg">
                Nevieš, ktorú skladbu zvoliť? Zavoláme ti a poradíme zadarmo.
              </div>
              <div className="mt-1 text-sm text-white/60">
                Po–Pi 8:00 – 17:00 · {SITE.contact.phone}
              </div>
            </div>
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#16a34a] text-white font-bold hover:bg-[#15803d] shadow-[0_10px_28px_rgba(22,163,74,0.4)] transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4" aria-hidden />
              Zavolať teraz
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
