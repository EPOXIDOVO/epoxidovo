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
      {/* ── MENU KATEGÓRIÍ (štýl Epodex — svetlé, pod hlavičkou) ── */}
      <nav aria-label="Kategórie e-shopu" className="bg-white border-b border-zinc-200">
        <Container size="xl" className="py-2.5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[14px]">
            <a href="/eshop?skupina=hlavne#katalog" className="font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors">Epoxidové a polyuretánové živice 🧪</a>
            <a href="/eshop?skupina=kamenny-koberec#katalog" className="font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors">Kamenný koberec 🪨</a>
            <a href="/eshop?skupina=priprava#katalog" className="font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors">Príprava podkladu 🏗️</a>
            <a href="/eshop?skupina=naradie#katalog" className="font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors">Náradie 🛠️</a>
            <span className="font-bold text-zinc-400 select-none cursor-default whitespace-nowrap">
              Mikrocement 🧊
              <span className="inline-block align-super -ml-0.5 px-1 py-px rounded-full bg-[#f97316] text-white text-[8px] font-bold uppercase leading-none">čoskoro</span>
            </span>
            <a href="/eshop?skupina=hlavne#katalog" className="font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors">Nátery na betón 🎨</a>
            <span className="font-bold text-zinc-400 select-none cursor-default whitespace-nowrap">
              Dekoratívne steny 🖌️
              <span className="inline-block align-super -ml-0.5 px-1 py-px rounded-full bg-[#f97316] text-white text-[8px] font-bold uppercase leading-none">čoskoro</span>
            </span>
          </div>
        </Container>
      </nav>

      {/* ── VIDEO HERO — jedno, na celú šírku ── */}
      <section className="bg-white">
        <div className="p-1.5">
          <a href="/eshop#katalog" className="group relative block h-[40vh] min-h-[300px] max-h-[440px] overflow-hidden">
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/images/categories/metalicke.jpg"
            >
              <source src="/video/eshop-hero-a.mp4" type="video/mp4" />
            </video>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-5 md:p-7 text-center text-white">
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight" style={{ textWrap: "balance" }}>
                Nalej si vlastnú podlahu
              </h2>
              <p className="mt-1 text-white/85 md:text-lg">
                Dáme ti presný návod, spotreby aj podporu na telefóne — s nami to zvládneš aj sám
              </p>
              <span className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0e1a3b] font-bold group-hover:bg-[#f97316] group-hover:text-white transition-colors">
                Prezrieť katalóg
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ── KATEGÓRIOVÉ DLAŽDICE (štýl Epodex) — fotka, pill, podlinky ── */}
      <section className="bg-white">
        <Container size="xl" className="py-10 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              {
                label: "EPOXIDOVÉ A PU ŽIVICE",
                img: "/images/categories/metalicke.jpg",
                packshot: "/images/produkty/sika/sikafloor-264-30.png",
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
                packshot: "/images/eshop/level30-cutout.png",
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
                  {"packshot" in d && d.packshot && (
                    <Image
                      src={d.packshot}
                      alt=""
                      width={340}
                      height={280}
                      quality={85}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[72%] w-auto object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
                    />
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


      {/* ── ZÁKAZNÍCKY SERVIS + REALIZAČNÁ FIRMA (štýl Epodex) ── */}
      <section className="bg-[#f7f7f4]">
        <Container size="xl" className="py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 flex items-center gap-5">
              <Image
                src="/images/eshop/medved-hlava.png"
                alt=""
                width={112}
                height={112}
                quality={85}
                className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full ring-4 ring-[#e3f3fb]"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-[#1a8cc4]">
                  Zákaznícky servis
                </div>
                <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-[#0e1a3b]" style={{ textWrap: "balance" }}>
                  Máš otázky? Rád ti pomôžem!
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Skladby, spotreby aj postup — poradíme zadarmo. Po–Pi 8:00–17:00.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-bold">
                  <a href={`tel:${SITE.contact.phoneRaw}`} className="inline-flex items-center gap-1.5 text-[#0e1a3b] hover:text-[#1a8cc4] transition-colors whitespace-nowrap">
                    <Phone className="w-4 h-4 text-[#16a34a]" aria-hidden />
                    {SITE.contact.phone}
                  </a>
                  <a href={`mailto:${SITE.contact.email}`} className="text-[#1a8cc4] hover:underline whitespace-nowrap">
                    {SITE.contact.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 flex items-center gap-5">
              <Image
                src="/images/site/logo_v2.png"
                alt="EPOXIDOVO logo"
                width={112}
                height={99}
                quality={85}
                className="w-24 md:w-28 h-auto shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-[#1a8cc4]">
                  Sme aj realizačná firma
                </div>
                <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-[#0e1a3b]" style={{ textWrap: "balance" }}>
                  Nechceš liať sám? Urobíme to za teba.
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Ten istý materiál lejeme dennodenne na realizáciách po celom
                  Slovensku — {SITE.legalName}, Ružomberok.
                </p>
                <a
                  href="/cenova-ponuka"
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f97316] text-white font-bold text-sm hover:bg-[#ea580c] transition-colors whitespace-nowrap"
                >
                  Nezáväzná cenová ponuka
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <div id="katalog" className="bg-[#f7f7f4] scroll-mt-20">
        <EshopClient />
      </div>

      {/* Galéria dôvery — ten istý materiál lejeme aj my (presunuté z hubu) */}
      <section className="bg-[#0e1a3b] text-white noise-overlay">
        <Container size="xl" className="py-14 md:py-20">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight" style={{ textWrap: "balance" }}>
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
