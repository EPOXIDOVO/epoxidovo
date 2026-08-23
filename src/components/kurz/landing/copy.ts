/**
 * Texty landingu kurzu — štruktúra 1:1 podľa TicketWave (hello → about →
 * events → cta → highlights → tools → faq → contact), obsah EPOXIDOVO kurz.
 * Čísla (ceny, termíny, kapacita) ťahame z content/kurz.ts.
 */
import { KURZ, KURZ_FAQ, KURZ_PROGRAM } from "@/content/kurz";
import { COURSE_EN, COURSE_EN_FAQ, COURSE_EN_PROGRAM } from "@/content/kurz-en";

export type Locale = "sk" | "en";

export interface LandingCopy {
  htmlLang: string;
  path: string;
  otherPath: string;
  otherLabel: string;
  nav: { home: string; about: string; program: string; price: string; faq: string; contact: string; cta: string };
  hero: { h1: string; scroll: string };
  about: { h2: string; t1: string; t2: string; t3: string; t4: string; t5: string };
  events: {
    h2: string;
    p: string;
    more: string;
    cards: {
      tag: string;
      title: string;
      image: string;
      backName: string;
      backLabel: string;
      backValue: string;
      items: string[];
    }[];
  };
  cta: { h2: string };
  highlights: { value: string; label: string }[];
  tools: {
    h2: string;
    boxes: {
      number: string;
      title: string;
      price?: { value: string; suffix: string };
      text: string;
      items?: string[];
      button?: string;
      muted?: boolean;
    }[];
  };
  faq: { h2: string; items: { q: string; a: string }[] };
  contact: {
    h2: string;
    p: string;
    formTitle: string;
    formSub: string;
    socials: string;
    labels: {
      name: string; lastName: string; phone: string; email: string;
      term: string; variant: string; experience: string; message: string;
      termOther: string; seatsLeft: string;
      consent: string; consentLink: string; submit: string; sending: string;
      okTitle: string; okText: string;
    };
    variants: Record<string, string>;
    experience: Record<string, string>;
    errors: { name: string; last: string; phone: string; email: string; consent: string; bot: string; send: string };
  };
  footer: { copy: string; links: { label: string; href: string }[] };
}

const CARD_IMAGES = [
  "/images/hero/hala.webp",
  "/images/hero/garaz.webp",
  "/images/realizacie/r-01.jpg",
  "/images/realizacie/r-05.jpg",
];

export const COPY: Record<Locale, LandingCopy> = {
  sk: {
    htmlLang: "sk",
    path: "/kurz",
    otherPath: "/en/epoxy-flooring-course",
    otherLabel: "EN",
    nav: { home: "Úvod", about: "O kurze", program: "Program", price: "Cena", faq: "FAQ", contact: "Kontakt", cta: "Prihlásiť sa" },
    hero: { h1: "Nauč sa liať podlahy", scroll: "Scrolluj dole" },
    about: {
      h2: "Staň sa súčasťou najpraktickejšieho kurzu epoxidových podláh na Slovensku",
      t1: "Zarábaš od prvej zákazky — bez drahých chýb na vlastnom materiáli.",
      t2: "Nepotrebuješ žiadne skúsenosti — všetko ťa naučíme rýchlo a na reálnej ploche.",
      t3: "Dostaneš postupy, spotreby a kalkulácie, ktoré inde nikto nezverejňuje.",
      t4: "Získaj náskok a premeň ho na zákazky od 45 €/m².",
      t5: "S EPOXIDOVO Akadémiou predbehneš konkurenciu, ktorá sa učí z YouTube.",
    },
    events: {
      h2: "Program",
      p: "Vďaka tomu, že denne lejeme podlahy po celom Slovensku, vieme presne, kde začiatočníci padajú. Za dva dni prejdeme od diagnostiky podkladu po cenovú ponuku — a ty si každý krok spravíš sám na vlastnej ploche 12 m². Je to jednoduché, stačí pracovať systematicky, učiť sa a dôverovať postupu, ktorý máme odskúšaný na stovkách realizácií.",
      more: "Viac info",
      cards: [
        {
          tag: "Deň 1 · doobeda",
          title: "Podklad a materiály",
          image: CARD_IMAGES[0],
          backName: "Podklad rozhoduje o všetkom",
          backLabel: "Čas",
          backValue: "4 h",
          items: KURZ_PROGRAM[0].items.slice(0, 3),
        },
        {
          tag: "Deň 1 · poobede",
          title: "Brúsenie a miešanie",
          image: CARD_IMAGES[3],
          backName: "Ruky na náradí",
          backLabel: "Čas",
          backValue: "4 h",
          items: KURZ_PROGRAM[0].items.slice(3),
        },
        {
          tag: "Deň 2 · doobeda",
          title: "Liatie a dekor",
          image: CARD_IMAGES[1],
          backName: "Liatie, chipsy, metalika",
          backLabel: "Čas",
          backValue: "5 h",
          items: KURZ_PROGRAM[1].items.slice(0, 3),
        },
        {
          tag: "Deň 2 · poobede",
          title: "Detaily a cenotvorba",
          image: CARD_IMAGES[2],
          backName: "Z kurzu rovno na zákazku",
          backLabel: "Čas",
          backValue: "3 h",
          items: KURZ_PROGRAM[1].items.slice(3),
        },
      ],
    },
    cta: { h2: "Prihlás sa na najbližší termín" },
    highlights: [
      { value: "200 +", label: "realizácií, z ktorých kurz vychádza" },
      { value: "12 m²", label: "vlastnej plochy pre každého účastníka" },
      { value: "80 %", label: "času s náradím v ruke" },
      { value: "6", label: "ľudí max. v jednej skupine" },
      { value: "2 dni", label: "od podkladu po cenovú ponuku" },
      { value: "30 dní", label: "podpory lektora po kurze" },
      { value: "EN", label: "kurz v angličtine, lektor rozumie slovensky" },
      { value: `${KURZ.priceStandard} €`, label: "cena vrátane materiálu a náradia" },
    ],
    tools: {
      h2: "Balíky kurzu",
      boxes: [
        {
          number: "01 · Štandard",
          title: "Kurz Štandard",
          price: { value: `${KURZ.priceStandard} €`, suffix: "/ osoba" },
          text: "Kompletné dvojdňové školenie s vlastnou plochou, manuálom, kalkulačkou spotreby a certifikátom. Nie sme platcami DPH — cena je konečná.",
          items: ["2 dni, 16 hodín praxe", "Vlastná plocha 12 m²", "Manuál + kalkulačka spotreby", "Certifikát a 30 dní podpory"],
          button: "Chcem Štandard",
        },
        {
          number: "02 · PRO",
          title: "Kurz PRO + štartovací balík",
          price: { value: `${KURZ.pricePro} €`, suffix: "/ osoba" },
          text: "Všetko zo Štandardu a k tomu materiál na prvú zákazku (~20 m²), sada náradia, partnerské ceny v e-shope natrvalo a 3 mesiace konzultácií.",
          items: ["Všetko zo Štandardu", "Materiál na ~20 m²", "Sada náradia", "Partnerské ceny + 3 mesiace konzultácií"],
          button: "Chcem PRO",
        },
        {
          number: "03 · Firma",
          title: "Firemné školenie",
          text: "Tri a viac ľudí z jednej partie? Spravíme súkromný termín len pre vás — u nás alebo na vašej hale.",
          button: "Dohodnúť termín",
        },
        {
          number: "04 · Absolventi",
          title: "Materiál po kurze",
          text: "Absolventi nakupujú materiál Sika a TopStone v našom e-shope za partnerské ceny a s prístupom k technickej podpore.",
          muted: true,
        },
      ],
    },
    faq: { h2: "FAQ", items: KURZ_FAQ.map((f) => ({ q: f.q, a: f.a })) },
    contact: {
      h2: "Kontakt",
      p: "Sme EPOXIDOVO s. r. o. — realizujeme liate podlahy po celom Slovensku a v Ružomberku školíme nových podlahárov. Ak máš otázku, napíš nám cez formulár — na všetky dopyty odpovedáme do 24 hodín.",
      formTitle: "Prihláška na kurz",
      formSub: "Nezáväzne. Zavoláme ti, potvrdíme voľné miesto a až potom sa platí.",
      socials: "Sleduj nás",
      labels: {
        name: "Meno *", lastName: "Priezvisko *", phone: "Telefón *", email: "E-mail *",
        term: "Termín", variant: "Balík", experience: "Skúsenosti", message: "Správa",
        termOther: "Zatiaľ neviem / iný termín", seatsLeft: "voľné",
        consent: "Súhlasím so", consentLink: "spracovaním osobných údajov", submit: "Odoslať prihlášku", sending: "Odosielam…",
        okTitle: "Miesto ti držíme", okText: "Ozveme sa do 24 hodín, potvrdíme termín a pošleme faktúru. Nič vopred neplatíš.",
      },
      variants: {
        standard: `Štandard (${KURZ.priceStandard} €)`,
        pro: `PRO + štartovací balík (${KURZ.pricePro} €)`,
        firma: "Firemné školenie (3+ ľudí)",
      },
      experience: {
        zaciatocnik: "Začiatočník — epoxid som ešte nerobil",
        remeselnik: "Remeselník — robím stierky/podlahy, epoxid nie",
        skuseny: "Už epoxid robím, chcem sa zlepšiť",
      },
      errors: {
        name: "Zadaj meno.", last: "Zadaj priezvisko.", phone: "Zadaj platné telefónne číslo.",
        email: "Zadaj platnú e-mailovú adresu.", consent: "Bez súhlasu ťa nevieme prihlásiť.",
        bot: "Počkaj chvíľu na overenie, že nie si bot.", send: "Nepodarilo sa odoslať. Skús znova alebo zavolaj.",
      },
    },
    footer: {
      copy: "© 2026 EPOXIDOVO s. r. o. Všetky práva vyhradené.",
      links: [
        { label: "epoxidovo.sk", href: "/" },
        { label: "Ochrana súkromia", href: "/ochrana-sukromia" },
        { label: "Obchodné podmienky", href: "/obchodne-podmienky" },
      ],
    },
  },

  en: {
    htmlLang: "en",
    path: "/en/epoxy-flooring-course",
    otherPath: "/kurz",
    otherLabel: "SK",
    nav: { home: "Home", about: "About", program: "Curriculum", price: "Pricing", faq: "FAQ", contact: "Contact", cta: "Apply now" },
    hero: { h1: "Learn to pour floors", scroll: "Scroll down" },
    about: {
      h2: "Become part of the most hands-on epoxy flooring course in Central Europe",
      t1: "Earn from your first job — without expensive mistakes on your own material.",
      t2: "No experience needed — we teach you everything fast, on a real floor.",
      t3: "You get the procedures, consumption rates and pricing sheets nobody else publishes.",
      t4: "Get an edge and turn it into jobs billed from €45/m².",
      t5: "With EPOXIDOVO Academy you outrun competitors who learn from YouTube.",
    },
    events: {
      h2: "Curriculum",
      p: "Because we pour floors across Slovakia every day, we know exactly where beginners fail. In two days we go from substrate diagnostics to the final quote — and you do every step yourself on your own 12 m² area. It is simple: work systematically, learn, and trust a process proven on hundreds of installations.",
      more: "More info",
      cards: [
        { tag: "Day 1 · morning", title: "Substrate & materials", image: CARD_IMAGES[0], backName: "The substrate decides everything", backLabel: "Time", backValue: "4 h", items: COURSE_EN_PROGRAM[0].items.slice(0, 3) },
        { tag: "Day 1 · afternoon", title: "Grinding & mixing", image: CARD_IMAGES[3], backName: "Hands on the tools", backLabel: "Time", backValue: "4 h", items: COURSE_EN_PROGRAM[0].items.slice(3) },
        { tag: "Day 2 · morning", title: "Pouring & decoration", image: CARD_IMAGES[1], backName: "Pour, flakes, metallic", backLabel: "Time", backValue: "5 h", items: COURSE_EN_PROGRAM[1].items.slice(0, 3) },
        { tag: "Day 2 · afternoon", title: "Details & pricing", image: CARD_IMAGES[2], backName: "From course straight to a job", backLabel: "Time", backValue: "3 h", items: COURSE_EN_PROGRAM[1].items.slice(3) },
      ],
    },
    cta: { h2: "Apply for the next date" },
    highlights: [
      { value: "200 +", label: "installations the course is built on" },
      { value: "12 m²", label: "of real floor for every participant" },
      { value: "80 %", label: "of the time with tools in hand" },
      { value: "6", label: "people max. per group" },
      { value: "2 days", label: "from substrate to final quote" },
      { value: "30 days", label: "of instructor support afterwards" },
      { value: "EN", label: "taught in English — participants from all over Europe" },
      { value: `€${COURSE_EN.priceStandard}`, label: "all-in, material and tools included" },
    ],
    tools: {
      h2: "Course packages",
      boxes: [
        { number: "01 · Standard", title: "Standard course", price: { value: `€${COURSE_EN.priceStandard}`, suffix: "/ person" }, text: "The complete two-day training with your own area, manual, consumption calculator and certificate. We are not VAT registered — this is the final price.", items: ["2 days, 16 hours of practice", "Your own 12 m² area", "Manual + consumption calculator", "Certificate and 30 days of support"], button: "Choose Standard" },
        { number: "02 · PRO", title: "PRO course + starter kit", price: { value: `€${COURSE_EN.pricePro}`, suffix: "/ person" }, text: "Everything in Standard plus material for your first job (~20 m²), a tool set, permanent partner pricing in our e-shop and 3 months of consulting.", items: ["Everything in Standard", "Material for ~20 m²", "Tool set", "Partner pricing + 3 months of consulting"], button: "Choose PRO" },
        { number: "03 · Company", title: "Company training", text: "Three or more people from one crew? We run a private date just for you — at our centre or in your hall.", button: "Arrange a date" },
        { number: "04 · Graduates", title: "Material after the course", text: "Graduates buy Sika and TopStone material in our e-shop at partner prices with access to technical support.", muted: true },
      ],
    },
    faq: { h2: "FAQ", items: COURSE_EN_FAQ.map((f) => ({ q: f.q, a: f.a })) },
    contact: {
      h2: "Contact",
      p: "We are EPOXIDOVO s. r. o. — we install poured floors across Slovakia and train new installers in Ružomberok. If you have a question, use the form — we answer every inquiry within 24 hours.",
      formTitle: "Course application",
      formSub: "No commitment. We call you, confirm a free seat, and only then you pay.",
      socials: "Follow us",
      labels: {
        name: "First name *", lastName: "Last name *", phone: "Phone *", email: "E-mail *",
        term: "Date", variant: "Package", experience: "Experience", message: "Message",
        termOther: "Not sure yet / another date", seatsLeft: "seats left:",
        consent: "I agree to the", consentLink: "processing of personal data", submit: "Send application", sending: "Sending…",
        okTitle: "Your seat is on hold", okText: "We call you within 24 hours, confirm the date and send the invoice. Nothing is paid upfront.",
      },
      variants: {
        standard: `Standard (€${COURSE_EN.priceStandard})`,
        pro: `PRO + starter kit (€${COURSE_EN.pricePro})`,
        firma: "Company training (3+ people)",
      },
      experience: {
        zaciatocnik: "Beginner — never worked with epoxy",
        remeselnik: "Tradesman — screeds/floors, not epoxy",
        skuseny: "Already work with epoxy, want to improve",
      },
      errors: {
        name: "Please enter your first name.", last: "Please enter your last name.", phone: "Please enter a valid phone number.",
        email: "Please enter a valid e-mail.", consent: "We cannot register you without consent.",
        bot: "Hold on while we verify you are not a bot.", send: "Sending failed. Try again or call us.",
      },
    },
    footer: {
      copy: "© 2026 EPOXIDOVO s. r. o. All rights reserved.",
      links: [
        { label: "epoxidovo.sk", href: "/" },
        { label: "Privacy policy", href: "/ochrana-sukromia" },
        { label: "Terms", href: "/obchodne-podmienky" },
      ],
    },
  },
};
