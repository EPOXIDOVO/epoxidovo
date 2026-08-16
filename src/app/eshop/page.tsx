import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BreadcrumbsJsonLd } from "@/components/seo/BreadcrumbsJsonLd";
import { EshopClient } from "./EshopClient";
import { KategorieMenu } from "./KategorieMenu";
import { SekciaObal, DlazdicaObal, AdminLayoutPanel, type Layout } from "./AdminLayout";
import { MATERIALY } from "@/lib/materialy";
import Image from "next/image";
import { Phone, Mail, Check, ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";
import eshopLayout from "@/content/eshop-layout.json";
import { REVIEWS } from "@/content/reviews";
import { RecenzieRotator } from "./RecenzieRotator";

export const metadata: Metadata = {
  title: "E-shop — epoxidové materiály Sika, TopStone, Arturo a UZIN",
  description:
    "Profesionálne epoxidové materiály, ktoré používame na vlastných realizáciách — penetrácie, hlavné vrstvy, vrchné laky, nivelačné hmoty, pigmenty, chipsy a kremičité piesky. Sika, TopStone, Arturo a UZIN, konečné ceny.",
  alternates: { canonical: "/eshop" },
};

/**
 * E-shop — poradie a viditeľnosť sekcií riadi src/content/eshop-layout.json.
 * V admin režime (/eshop?admin=1) sa bloky dajú preskladať/skryť ako na
 * iPhone (wiggle + mínus + šípky); zmeny ukladá lokálny zapisovač.
 */

const DLAZDICE: Record<
  string,
  {
    label: string;
    img: string;
    packshot?: string;
    linky?: { text: string; href: string }[];
    coskoro?: boolean;
  }
> = {
  zivice: {
    label: "EPOXIDOVÉ A PU ŽIVICE",
    img: "/images/categories/metalicke.jpg",
    packshot: "/images/produkty/sika/sikafloor-264-30.png",
    linky: [
      { text: "Penetrácie", href: "/eshop?skupina=penetracie#katalog" },
      { text: "Hlavné vrstvy a nátery", href: "/eshop?skupina=hlavne#katalog" },
      { text: "Vrchné laky", href: "/eshop?skupina=laky#katalog" },
    ],
  },
  koberec: {
    label: "KAMENNÝ KOBEREC",
    img: "/images/categories/mramorove.jpg",
    linky: [
      { text: "Kamene a spojivá", href: "/eshop?skupina=kamenny-koberec#katalog" },
      { text: "Chipsy a posypy", href: "/eshop?kat=chipsy#katalog" },
    ],
  },
  priprava: {
    label: "PRÍPRAVA PODKLADU",
    img: "/images/categories/jednofarebne.jpg",
    packshot: "/images/eshop/level30-cutout.png",
    linky: [
      { text: "Nivelácie a potery", href: "/eshop?skupina=priprava#katalog" },
      { text: "Prísady a plnivá", href: "/eshop?skupina=prisady#katalog" },
    ],
  },
  naradie: {
    label: "NÁRADIE",
    img: "/images/realizacie/r-35.jpg",
    linky: [{ text: "Valce, stierky a pomôcky", href: "/eshop?skupina=naradie#katalog" }],
  },
  mikrocement: { label: "MIKROCEMENT", img: "/images/hero/byvanie-v2.webp", coskoro: true },
  farby: { label: "FARBY A DEKORATÍVNE STENY", img: "/images/realizacie/r-17.jpg", coskoro: true },
};

export default function EshopPage() {
  const layout = eshopLayout as Layout;

  const sekcie: Record<string, React.ReactNode> = {
    vyhody: (
      /* USP pás — prečo kupovať u nás (štýl GymBeam) */
      <section className="bg-[#0e1a3b] text-white">
        <Container size="xl" className="py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
            {[
              { ikona: "🏆", cislo: "50 000+", text: "spokojných zákazníkov", href: "#dovera" },
              { img: "/images/eshop/medved-hlava.png", cislo: "Sme aj realizačná firma", text: "podlahy lejeme dennodenne", href: "/" },
              { ikona: "📦", cislo: "350+ produktov", text: "4 top značky skladom", href: "/eshop/znacky" },
              { ikona: "📞", cislo: "Poradenstvo zadarmo", text: "od reálnych realizátorov", href: "/kontakt" },
            ].map((u) => {
              const jeLink = "href" in u && !!u.href;
              const Obal = (jeLink ? "a" : "div") as "a" | "div";
              return (
              <Obal
                key={u.cislo}
                {...(jeLink ? { href: (u as { href: string }).href } : {})}
                className={`flex items-center gap-3 justify-center lg:justify-start rounded-xl px-3 py-2 -mx-1 transition-colors ${
                  jeLink ? "hover:bg-white/10 hover:text-[#6fcded] cursor-pointer" : ""
                }`}
              >
                {"img" in u && u.img ? (
                  <Image src={u.img} alt="" width={40} height={40} quality={85} className="w-9 h-9 rounded-full shrink-0" />
                ) : (
                  <span className="text-2xl" aria-hidden>{"ikona" in u ? u.ikona : null}</span>
                )}
                <span className="min-w-0">
                  <span className="block text-[15px] font-extrabold uppercase tracking-wide whitespace-nowrap">{u.cislo}</span>
                  <span className="block text-[13px] font-medium text-white whitespace-nowrap">
                    {u.text}
                    {jeLink ? " →" : ""}
                  </span>
                </span>
              </Obal>
              );
            })}
          </div>
        </Container>
      </section>
    ),

    hero: (
      /* Full-bleed hero — bez bielych okrajov a zaoblenia, text vľavo.
         Video na mobile nenačítavame (dáta) a pri reduced-motion tiež nie. */
      <section className="relative isolate w-full overflow-hidden min-h-[440px] md:min-h-[520px] flex items-end">
        <Image
          src="/images/categories/metalicke.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          priority
          className="object-cover"
        />
        <video
          className="hidden md:block motion-reduce:md:hidden absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/categories/metalicke.jpg"
        >
          <source src="/video/eshop-hero-a.mp4" type="video/mp4" />
        </video>
        {/* gradient zľava — text sedí na tmavom, fotka ostáva vidieť vpravo */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        <Container size="xl" className="relative py-10 md:py-14">
          <div className="max-w-xl text-white">
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight"
              style={{ textWrap: "balance", textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
            >
              Prvú podlahu zvládneš aj sám
            </h2>
            <p
              className="mt-3 text-lg md:text-xl font-medium text-white leading-snug"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
            >
              Presné množstvá na tvoje m², návod krok za krokom a poradenstvo
              na telefóne. Podlahy aj steny.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/navrhni-podlahu"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#f97316] text-white font-extrabold text-base md:text-lg shadow-[0_12px_32px_rgba(249,115,22,0.5)] hover:bg-[#ea580c] transition-colors whitespace-nowrap"
              >
                Navrhni si podlahu →
              </a>
              <a
                href="/eshop#katalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/80 text-white font-bold text-base md:text-lg hover:bg-white hover:text-[#0e1a3b] transition-colors whitespace-nowrap"
              >
                Prezrieť katalóg
              </a>
            </div>
            {/* odrážky až pod tlačidlami — neodďaľujú klik */}
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-white/90">
              {["Presný rozpis materiálu", "Návod krok za krokom", "Poradíme počas liatia"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    ),

    dlazdice: (
      <section className="bg-white">
        <div className="px-3 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {layout.dlazdice
              .filter((id) => !layout.skryteDlazdice.includes(id) && DLAZDICE[id])
              .map((id) => {
                const d = DLAZDICE[id];
                return (
                  <DlazdicaObal key={id} id={id} layout={layout}>
                    <div
                      className={`relative rounded-3xl overflow-hidden border border-zinc-200 bg-white flex flex-col h-full ${d.coskoro ? "select-none" : ""}`}
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={d.img}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          quality={85}
                          className={`object-cover ${d.coskoro ? "grayscale-[0.5] opacity-70" : ""}`}
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-white shadow text-[#0e1a3b] text-[11px] md:text-xs font-extrabold tracking-wide">
                          {d.label}
                        </span>
                        {d.coskoro && (
                          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#f97316] text-white text-xs font-bold uppercase tracking-wide shadow">
                            Čoskoro
                          </span>
                        )}
                        {d.packshot && (
                          <Image
                            src={d.packshot}
                            alt=""
                            width={340}
                            height={280}
                            quality={85}
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[66%] w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.4)]"
                          />
                        )}
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {d.coskoro ? (
                          <div className="flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-zinc-400 cursor-default">
                            Pripravujeme
                          </div>
                        ) : (
                          d.linky!.map((l) => (
                            // plné <a> — navigácia na tú istú stránku musí
                            // re-mountnúť katalóg, aby sa deep-link aplikoval
                            <a
                              key={l.text}
                              href={l.href}
                              className="flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-zinc-800 hover:bg-[#e3f3fb]/50 hover:text-[#1a8cc4] transition-colors"
                            >
                              {l.text}
                              <ChevronRight className="w-4 h-4 text-zinc-400" aria-hidden />
                            </a>
                          ))
                        )}
                      </div>
                    </div>
                  </DlazdicaObal>
                );
              })}
          </div>
        </div>
      </section>
    ),

    servis: (
      /* Zákaznícky servis + dôveryhodnosť (podľa Epodexu) — fotka na pozadí,
         karta tímu vľavo (foto cez celú šírku), panel s číslami vpravo. */
      <section id="dovera" className="relative isolate bg-[#0e1a3b] scroll-mt-24">
        <Image
          src="/images/hero/byvanie-v2.webp"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          className="object-cover opacity-25"
        />
        <Container size="xl" className="relative py-10 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-stretch">
            {/* Karta tímu */}
            <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">
              <div className="relative h-44 bg-[#e3f3fb] shrink-0">
                <Image
                  src="/images/eshop/medved-hlava.png"
                  alt=""
                  fill
                  sizes="300px"
                  quality={85}
                  className="object-contain p-2"
                />
              </div>
              <div className="flex-1 p-5 flex flex-col justify-center">
                <div className="text-lg font-extrabold text-[#0e1a3b] text-center">
                  Tím EPOXIDOVO
                </div>
                <p className="mt-1 text-[15px] text-zinc-500 text-center">
                  Máš otázky? Radi ti pomôžeme!
                </p>
                {/* ikony pod sebou lícujú — bloky majú rovnakú šírku ikony */}
                <div className="mt-4 mx-auto w-fit space-y-2.5">
                  <a href={`tel:${SITE.contact.phoneRaw}`} className="flex items-center gap-3 text-[15px] font-bold text-[#0e1a3b] hover:text-[#1a8cc4] transition-colors">
                    <span className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full bg-[#3db6e8] text-white">
                      <Phone className="w-4 h-4" aria-hidden />
                    </span>
                    {SITE.contact.phone}
                  </a>
                  <a href={`mailto:${SITE.contact.email}`} className="flex items-center gap-3 text-[15px] text-zinc-600 hover:text-[#1a8cc4] transition-colors">
                    <span className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full bg-[#3db6e8] text-white">
                      <Mail className="w-4 h-4" aria-hidden />
                    </span>
                    {SITE.contact.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Panel s číslami a recenziou */}
            <div className="rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                <div className="px-6 py-7 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl md:text-5xl font-extrabold text-[#0e1a3b] tabular-nums leading-none">
                    50 000+
                  </div>
                  <div className="mt-3 text-2xl" aria-hidden>🤝</div>
                  <div className="mt-2 text-[15px] text-zinc-500">spokojných zákazníkov</div>
                </div>
                <div className="px-6 py-7 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl md:text-5xl font-extrabold text-[#0e1a3b] tabular-nums leading-none">
                    4,87/5
                  </div>
                  <div className="mt-3 text-amber-400 text-2xl tracking-wide leading-none" aria-hidden>★★★★★</div>
                  <div className="mt-2 text-[15px] text-zinc-500">
                    na základe 1 638 hodnotení
                  </div>
                </div>
                <div className="px-6 py-7">
                  <RecenzieRotator
                    recenzie={REVIEWS.slice(0, 8).map((r) => ({
                      text: r.text,
                      name: r.name,
                      location: r.location,
                    }))}
                  />
                </div>
              </div>
              <div className="bg-[#3db6e8] text-white grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
                {["Konečné ceny bez prekvapení", "Materiál, ktorý sami lejeme", "Poradenstvo zadarmo"].map((t) => (
                  <div key={t} className="px-4 py-3.5 flex items-center justify-center gap-2 font-bold text-[15px] text-center">
                    <Check className="w-4 h-4 shrink-0" aria-hidden />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sme aj realizačná firma */}
          <div className="mt-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-5 flex flex-wrap items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4 min-w-0">
              <Image
                src="/images/site/logo_v2.png"
                alt="EPOXIDOVO logo"
                width={80}
                height={71}
                quality={85}
                className="w-14 h-auto shrink-0"
              />
              <div className="min-w-0">
                <div className="font-extrabold text-lg">Nechceš liať sám? Urobíme to za teba.</div>
                <div className="mt-0.5 text-[15px] text-white/70">
                  Sme aj realizačná firma — {SITE.legalName}, Ružomberok.
                </div>
              </div>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-colors whitespace-nowrap"
            >
              Prejsť na realizačnú stránku →
            </a>
          </div>
        </Container>
      </section>
    ),

    katalog: (
      <div id="katalog" className="bg-[#f7f7f4] scroll-mt-20">
        <EshopClient />
      </div>
    ),

    galeria: (
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
    ),
  };

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Domov", path: "/" },
          { name: "E-shop", path: "/eshop" },
        ]}
      />
      <KategorieMenu />
      {layout.sekcie
        .filter((id) => !layout.skryteSekcie.includes(id) && sekcie[id])
        .map((id) => (
          <SekciaObal key={id} id={id} layout={layout}>
            {sekcie[id]}
          </SekciaObal>
        ))}
      <AdminLayoutPanel layout={layout} />
    </>
  );
}
