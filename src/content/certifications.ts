/**
 * Certifikačné landing pages — obsah pre 4 stránky:
 * /podlahy/esd, /podlahy/haccp, /podlahy/atex, /podlahy/protismyk
 *
 * Cieľ: B2B commercial-intent SEO. Každá stránka mieri na high-intent
 * vyhľadávania ("esd podlaha cena", "haccp podlaha", "atex sklad chémia",
 * "protišmyková podlaha nemocnica"), s reálnym obsahom pre Google + FAQ
 * pre AEO (rich snippets), silnou CTA na /cenova-ponuka.
 */

export type CertSlug = "esd" | "haccp" | "atex" | "protismyk";

export interface CertificationContent {
  slug: CertSlug;
  // Krátky názov pre badge / breadcrumb
  shortName: string;
  emoji: string;
  // Full title na hero + <title>
  h1: string;
  // Meta title/description — SEO
  metaTitle: string;
  metaDescription: string;
  // Tagline pod H1 (1 veta)
  heroTagline: string;
  // Hero accent color pre gradient
  accent: string; // hex
  // Hlavné intro (1-2 odst.)
  intro: string[];
  // Sekcia „Čo to je"
  whatIsTitle: string;
  whatIs: string[];
  // Sekcia „Kde sa vyžaduje"
  applicationsTitle: string;
  applications: { title: string; description: string; icon: string }[];
  // Sekcia „Normy a certifikácie"
  standardsTitle: string;
  standards: { code: string; description: string }[];
  // Ceny orientačne
  priceLabel: string;
  priceFrom: number; // €/m²
  priceNote: string;
  // Kľúčové výhody
  benefits: { title: string; description: string }[];
  // FAQ (pre JSON-LD + zobrazenie)
  faq: { question: string; answer: string }[];
  // Súvisiace certifikácie (interné linky)
  relatedCerts: CertSlug[];
}

export const CERTIFICATIONS: Record<CertSlug, CertificationContent> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ESD — Electrostatic Discharge
  // ═══════════════════════════════════════════════════════════════════════════
  esd: {
    slug: "esd",
    shortName: "ESD",
    emoji: "⚡",
    h1: "ESD antistatické epoxidové podlahy",
    metaTitle: "ESD antistatické epoxidové podlahy | EPOXIDOVO",
    metaDescription:
      "ESD podlahy zvádzajú statickú elektrinu — pre elektroniku, serverovne a laboratóriá. Podľa DIN EN 61340, od 85 €/m², realizácia po celom Slovensku.",
    heroTagline:
      "Nulové riziko iskry, ochrana citlivej elektroniky, súlad s DIN EN 61340.",
    accent: "#3DB6E8",
    intro: [
      "ESD (Electrostatic Discharge) podlahy sú špeciálne vodivé alebo dissipatívne epoxidové systémy, ktoré kontrolovane odvádzajú statickú elektrinu z ľudí, strojov a materiálov do uzemnenia.",
      "V prevádzkach kde jedna iskra môže zničiť polovodičové súčiastky, spôsobiť požiar horľavých pár alebo poškodiť životy pacientov v nemocnici — ESD podlaha nie je luxus, ale povinná ochrana.",
    ],
    whatIsTitle: "Čo je ESD podlaha a ako funguje",
    whatIs: [
      "Klasický epoxid je elektrický izolant — statická elektrina sa na ňom hromadí. ESD podlaha obsahuje vodivé pigmenty (uhlíkové vlákna, grafit, kovové mikroplniva), ktoré vytvárajú kontinuálnu vodivú sieť v celej hrúbke povrchu.",
      "Táto sieť je prepojená s medenými uzemňovacími páskami zabudovanými v podklade a odvedenými cez uzemňovací bod (obvykle na stĺp haly alebo do zeme). Elektrický náboj z topánok pracovníka alebo kolies vozíka sa cez podlahu odvedie do zeme za milisekundy.",
      "Rozlišujeme dva hlavné typy: **dissipatívne podlahy** (odpor 10⁶ – 10⁹ Ω, pomalý riadený odvod) pre bežné výrobné prevádzky, a **vodivé podlahy** (10⁴ – 10⁶ Ω, okamžitý odvod) pre kritické prostredia ako muničné sklady či servery.",
    ],
    applicationsTitle: "Kde sa ESD podlaha vyžaduje",
    applications: [
      {
        title: "Výroba elektroniky",
        description:
          "SMT linky, montáž DPS, testovacie stanice. Bez ESD ochrany môže jedna iskra spôsobiť škody v tisíckach €.",
        icon: "🔌",
      },
      {
        title: "Serverovne a dátové centrá",
        description:
          "Ochrana serverov, sieťových prvkov, storage systémov pred latentným ESD poškodením.",
        icon: "🖥️",
      },
      {
        title: "Muničné sklady a výbušniny",
        description:
          "Zákon vyžaduje vodivú podlahu — jedna iskra znamená katastrofu.",
        icon: "💥",
      },
      {
        title: "Farmácia a čisté priestory",
        description:
          "GMP prostredia, výroba liečiv, laboratóriá. ESD chráni prístroje aj presnosť merania.",
        icon: "💊",
      },
      {
        title: "Zdravotníctvo — operačné sály",
        description:
          "Elektrostatický výboj v prítomnosti anestézy alebo kyslíka = riziko požiaru.",
        icon: "🏥",
      },
      {
        title: "Petrochemický a plynárenský priemysel",
        description:
          "Kombinácia s ATEX klasifikáciou — sklady rozpúšťadiel, lakovne, mlyny.",
        icon: "⛽",
      },
    ],
    standardsTitle: "Normy a certifikácie",
    standards: [
      {
        code: "DIN EN 61340-5-1",
        description:
          "Ochrana elektronických súčiastok pred elektrostatickými javmi — všeobecné požiadavky.",
      },
      {
        code: "IEC 61340-4-1",
        description:
          "Meranie elektrického odporu podlahových krytín — metodika testovania.",
      },
      {
        code: "DIN EN 1081",
        description:
          "Stanovenie elektrického odporu voči zemi (Rg) — konkrétny test hodnôt.",
      },
      {
        code: "ATEX 2014/34/EU",
        description:
          "Ak sa ESD podlaha kombinuje s výbušným prostredím — vyžaduje sa aj ATEX certifikát.",
      },
    ],
    priceLabel: "Orientačná cena",
    priceFrom: 85,
    priceNote:
      "Cena zahŕňa dodávku aj montáž vrátane vodivého systému (medené pásky + uzemnenie). Meranie elektrického odporu po realizácii je súčasťou dodávky, protokol o meraní odovzdáme zákazníkovi. Presná cena podľa plochy, členitosti a požadovanej vodivosti (dissipatívna vs vodivá).",
    benefits: [
      {
        title: "Kontrolovaný odvod elektriny",
        description:
          "Odpor v rozsahu 10⁴ – 10⁹ Ω podľa DIN EN 61340. Meraný v každom projekte.",
      },
      {
        title: "Bezšpárový monolit",
        description:
          "Žiadne škáry kde by sa mohla ukladať prachu — ideálne pre čisté prevádzky.",
      },
      {
        title: "Dlhá životnosť",
        description:
          "Vodivé pigmenty sú súčasťou celej hrúbky — funkčnosť neklesá časom ani opotrebovaním.",
      },
      {
        title: "Certifikát merania",
        description:
          "Po dokončení meriame odpor a odovzdávame protokol pre poisťovňu alebo audit.",
      },
    ],
    faq: [
      {
        question: "Ako často treba obnovovať ESD podlahu?",
        answer:
          "ESD funkcionalita je zabudovaná v celej hrúbke povrchu — pokiaľ nedôjde k mechanickému preseknutiu (hlboká trhlina, poškodenie uzemnenia), životnosť je 15+ rokov. Odporúčame ročné kontrolné meranie odporu — trvá 30 minút a potvrdí súlad s normami.",
      },
      {
        question: "Aký je rozdiel medzi dissipatívnou a vodivou podlahou?",
        answer:
          "Dissipatívna podlaha (10⁶–10⁹ Ω) odvádza náboj postupne — ideálne pre bežné výrobné haly, servery, laboratóriá. Vodivá podlaha (10⁴–10⁶ Ω) odvádza okamžite — nevyhnutné pre muničné sklady, výbušné prostredia, operačné sály.",
      },
      {
        question: "Aké obuvie treba mať na ESD podlahe?",
        answer:
          "ESD topánky s vodivou podrážkou (odpor <10⁸ Ω). Ich funkcia sa kontroluje pri vstupe do priestoru testovacím prístrojom. Bez ESD obuvi je aj najlepšia podlaha neúčinná — ochrana funguje ako reťaz.",
      },
      {
        question: "Kombinuje sa ESD s HACCP alebo protišmykom?",
        answer:
          "Áno, časté kombinácie. ESD+HACCP pre farmaceutickú výrobu, ESD+protišmyk pre muničné sklady s mokrým čistením. Volíme systém tak, aby všetky požiadavky boli splnené súčasne.",
      },
      {
        question: "Ako dlho trvá realizácia?",
        answer:
          "200 m² ESD podlaha vrátane uzemnenia sa realizuje typicky 5–7 dní (2 dni príprava + medené pásky, 2–3 dni pokládka epoxidu, 1–2 dni vytvrdenie). Meranie protokolu odovzdávame na konci.",
      },
      {
        question: "Aký je servis po realizácii?",
        answer:
          "Poskytujeme 2-ročnú záruku na materiál aj prácu. Na požiadanie robíme ročné kontrolné merania odporu — 30 minút, protokol pre audit / poisťovňu.",
      },
    ],
    relatedCerts: ["atex", "haccp", "protismyk"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HACCP — Hazard Analysis Critical Control Points
  // ═══════════════════════════════════════════════════════════════════════════
  haccp: {
    slug: "haccp",
    shortName: "HACCP",
    emoji: "🥗",
    h1: "HACCP epoxidové podlahy pre potravinárstvo",
    metaTitle: "HACCP podlahy do potravinárstva | EPOXIDOVO",
    metaDescription:
      "HACCP-vhodné bezšpárové podlahy s antibakteriálnou úpravou. Súlad s Nariadením EÚ 852/2004. Pre kuchyne, cukrárne, mliekarne, mäsokombináty. Cena od 75 €/m².",
    heroTagline:
      "Bezšpárový hygienický povrch v súlade s Nariadením EÚ 852/2004.",
    accent: "#6ABF4B",
    intro: [
      "HACCP epoxidové podlahy sú monolitické bezšpárové systémy s antibakteriálnou úpravou, ktoré spĺňajú prísne hygienické požiadavky pre prevádzky prichádzajúce do kontaktu s potravinami.",
      "Ich hlavná výhoda: žiadne škáry, žiadne pory, žiadne miesta kde by sa mohli usadzovať baktérie alebo plesne. Umývanie tlakovou vodou aj dezinfekcia sú bez rizika prieniku.",
    ],
    whatIsTitle: "Čo HACCP požaduje od podlahy",
    whatIs: [
      "HACCP (Hazard Analysis and Critical Control Points) je medzinárodný systém riadenia bezpečnosti potravín zakotvený v Nariadení EÚ 852/2004 o hygiene potravín. Vyžaduje aby všetky povrchy v priestoroch spracovania potravín boli **hladké, nenasiakavé, umývateľné a netoxické**.",
      "Klasická dlažba s fugami je pre HACCP problematická — fugy sú miesta kde sa hromadia zvyšky, baktérie a plesne. Betón absorbuje tekutiny. Epoxidová podlaha s antibakteriálnou úpravou eliminuje obidva problémy: je úplne uzavretá (bezšpárová), nenasiakavá, chemicky inertná a znáša agresívne čistiace prostriedky.",
      "Náš HACCP systém zahŕňa: **bezšpárový epoxid v hrúbke 3–5 mm**, **koveto zaoblenie ku stenám** (fabión — nesmie byť pravouhlý roh kde sa hromadí špina), **antibakteriálne aditíva** (najčastejšie striebro alebo trikloxán) v topovej vrstve, a **odtokové žľaby integrované do plochy**.",
    ],
    applicationsTitle: "Kde je HACCP podlaha povinná",
    applications: [
      {
        title: "Reštauračné kuchyne",
        description:
          "Otvorené aj priemyselné kuchyne, catering, hotely. Odolnosť voči tuku, agresívnej dezinfekcii a vysokým teplotám (napr. rozliata polievka 90°C).",
        icon: "👨‍🍳",
      },
      {
        title: "Cukrárne a pekárne",
        description:
          "Znášanie muky, cukru, kvasnicových prostredí. Ľahká údržba, žiadne pory ktoré by absorbovali oleje.",
        icon: "🥐",
      },
      {
        title: "Mliekárne a syrárne",
        description:
          "Konštantné mokré prostredie, agresívne čistenie CIP, kombinácia s protišmykom R11/R12 pre bezpečnosť personálu.",
        icon: "🧀",
      },
      {
        title: "Mäsokombináty a bitúnky",
        description:
          "Najagresívnejšie prostredie — krv, tuky, soľanky, denné umývanie tlakovou vodou 60°C. Vyžaduje najodolnejší HACCP systém.",
        icon: "🥩",
      },
      {
        title: "Pivovary a nápojárne",
        description:
          "Odolnosť voči kvasným kyselinám, cukorným zvyškom, konštantnému mokru. Antibakteriálna úprava proti divokým kvasiniciam.",
        icon: "🍺",
      },
      {
        title: "Nemocnice a lekárne",
        description:
          "Operačné sály, sterilizačné centrá, lekárenské výrobne. Kombinácia HACCP + ESD + protišmyk.",
        icon: "🏥",
      },
    ],
    standardsTitle: "Normy a legislatíva",
    standards: [
      {
        code: "Nariadenie EÚ 852/2004",
        description:
          "O hygiene potravín — Príloha II, Kapitola II, bod 1(a): podlahy musia byť z materiálov nepresakujúcich vodou, umývateľných a dezinfikovaných.",
      },
      {
        code: "Nariadenie EÚ 853/2004",
        description:
          "Špecifické hygienické pravidlá pre potraviny živočíšneho pôvodu — prísnejšie požiadavky pre mäso, mlieko, ryby.",
      },
      {
        code: "Vyhláška MZ SR 533/2007 Z. z.",
        description:
          "Podrobnosti o hygienických požiadavkách na výrobu a manipuláciu s potravinami — priama slovenská implementácia EÚ nariadenia.",
      },
      {
        code: "ISO 22000",
        description:
          "Medzinárodná norma pre systémy manažérstva bezpečnosti potravín. HACCP podlaha je jedna z požiadaviek certifikácie.",
      },
    ],
    priceLabel: "Orientačná cena",
    priceFrom: 75,
    priceNote:
      "Cena zahŕňa dodávku aj montáž bezšpárového HACCP systému 3–5 mm hrúbky s antibakteriálnou úpravou, zaoblenie ku stenám (fabión) a integráciu odtokov. Certifikát o použitých materiáloch (potvrdenie súladu s EÚ 852/2004) odovzdávame zákazníkovi. Presná cena podľa plochy, členitosti a agresivity prevádzky (kuchyňa vs mäsokombinát).",
    benefits: [
      {
        title: "100% bezšpárový",
        description:
          "Ani jedna fuga v podlahe — nikde sa nemá kde usadzovať špina alebo baktérie.",
      },
      {
        title: "Antibakteriálna úprava",
        description:
          "Striebrom aktivovaná topová vrstva bráni rastu baktérií, plesní a kvasiniek.",
      },
      {
        title: "Kovetový fabión",
        description:
          "Zaoblený prechod ku stene bez pravouhlého rohu — kľúčové pre HACCP audit.",
      },
      {
        title: "Odolnosť voči chémii",
        description:
          "Znáša CIP čistenie, tlakovú vodu 60°C, dezinfekciu chlorom, kyselinami aj hydroxidmi.",
      },
    ],
    faq: [
      {
        question: "Prejde nová podlaha HACCP auditom?",
        answer:
          "Áno. Náš systém spĺňa Nariadenie EÚ 852/2004 aj ISO 22000. Po dodaní vystavujeme certifikát o použitých materiáloch s deklaráciou zhody. Doteraz sme mali 100% úspešnosť pri hygienických auditoch (ŠVPS SR, HACCP audítori).",
      },
      {
        question: "Ako dlho vydrží antibakteriálna úprava?",
        answer:
          "Antibakteriálne aditíva (striebro alebo trikloxán) sú súčasťou topovej vrstvy s hrúbkou 0,5–1 mm. Pri bežnej údržbe funkčnosť vydrží 8–12 rokov. Ak podlaha stráca lesk kvôli abrázii, doporučujeme obnoviť topovú vrstvu — ostáva zachovaná pôvodná HACCP štruktúra pod ňou.",
      },
      {
        question: "Znesie CIP čistenie a horúcu vodu?",
        answer:
          "Áno. HACCP systém je špecifikovaný na teplotu čistenia do 80°C krátkodobo, dlhodobo do 60°C. Odolá bežným CIP roztokom (NaOH, HNO₃, chlórové prípravky) v koncentráciách používaných v potravinárstve.",
      },
      {
        question: "Prečo je zaoblenie ku stenám (fabión) dôležité?",
        answer:
          "Pravouhlý roh medzi stenou a podlahou je pri denníkom umývaní tlakovou vodou nedosiahnuteľný — hromadia sa tam zvyšky, tuky, prípadne krv. HACCP auditor to okamžite označí ako nesplnenie. Fabión (zaoblenie r=30–50 mm) tento problém eliminuje.",
      },
      {
        question: "Aký je rozdiel medzi HACCP epoxidom a bežnou dlažbou?",
        answer:
          "Dlažba má fugy (miesta na baktérie) a je krehká — ľahko sa poškodí pri páde nástroja alebo prevrhnutí varnej nádoby. HACCP epoxid je monolitický, nemá fugy, znáša mechanické zaťaženie, a jeho antibakteriálna úprava aktívne obmedzuje mikrobiálny rast (dlažba nemá).",
      },
      {
        question: "Môže sa realizovať počas prevádzky?",
        answer:
          "Áno, plánujeme etapovito. Väčšie prevádzky rozdelíme do 2–3 sekcií — vždy jednu časť odstavíme, dokončíme, sprevádzkujeme, prejdeme na ďalšiu. Typický vyhradený víkend + 2–3 pracovné dni na 200 m².",
      },
    ],
    relatedCerts: ["protismyk", "esd", "atex"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ATEX — ATmosphères EXplosibles
  // ═══════════════════════════════════════════════════════════════════════════
  atex: {
    slug: "atex",
    shortName: "ATEX",
    emoji: "🔥",
    h1: "ATEX podlahy pre výbušné prostredia",
    metaTitle: "ATEX podlahy do výbušných prostredí | EPOXIDOVO",
    metaDescription:
      "ATEX certifikované vodivé podlahy pre zóny 20/21/22 a 0/1/2. Súlad so smernicou 2014/34/EU. Sklady rozpúšťadiel, mlyny, chemické prevádzky. Cena od 95 €/m².",
    heroTagline:
      "Vodivá podlaha pre zóny 0/1/2 a 20/21/22 — bezpečnosť v prítomnosti výbušných zmesí.",
    accent: "#E85D3D",
    intro: [
      "ATEX (ATmosphères EXplosibles) podlahy sú špeciálne vodivé epoxidové systémy určené pre priestory, kde môže vzniknúť výbušná atmosféra z horľavých plynov, pár, hmiel alebo prachu.",
      "Právny základ: **Smernica 2014/34/EÚ** (ATEX 114) a jej slovenská implementácia — Nariadenie vlády SR 149/2016 Z. z. Pre priestory zaradené do zón 0/1/2 (plyny) alebo 20/21/22 (prachy) je vodivá podlaha zákonná požiadavka, nie odporúčanie.",
    ],
    whatIsTitle: "Ako ATEX podlaha funguje a prečo je povinná",
    whatIs: [
      "V ATEX priestoroch stačí jedna iskra — statická elektrina z topánok, oder kolies vozíka, elektromagnetický náboj z plastových obalov — a horľavá atmosféra sa vznieti. Rezultát: požiar, výbuch, obete a milióny € škody.",
      "ATEX podlaha rieši statickú elektrinu **kontinuálnym odvodom** do uzemnenia. Vodivé pigmenty zabudované v epoxide (uhlík, grafit) vytvárajú elektricky vodivú sieť s odporom **<10⁶ Ω** — teda výrazne prísnejšia požiadavka ako pri ESD (kde stačí 10⁹).",
      "Vodivá sieť je prepojená medenými páskami s uzemňovacím bodom. Náboj z osoby alebo zariadenia sa odvedie do zeme za mikrosekundy — skôr než by mohol vytvoriť iskru.",
      "**Dôležité**: ATEX zóna sa nezaraďuje podľa toho čo tam sklaudujete, ale podľa toho ako dlho je výbušná atmosféra prítomná. Zóna 0 = trvale, zóna 1 = občas počas normálnej prevádzky, zóna 2 = len pri poruche. Presné zaradenie robí revízny technik s licenciou.",
    ],
    applicationsTitle: "Kde je ATEX povinný",
    applications: [
      {
        title: "Sklady rozpúšťadiel a farby",
        description:
          "Aceton, xylén, riedidlá, lakovne. Pare tvoria zónu 1 alebo 2 — vodivá podlaha povinná.",
        icon: "🎨",
      },
      {
        title: "Chemické laboratóriá a výroba",
        description:
          "Farmaceutické syntézy, výroba pesticídov, agrochémia. Časté vodivé + ESD kombinácie.",
        icon: "⚗️",
      },
      {
        title: "Mlyny — múka, cukor, drevná múčka",
        description:
          "Prach múky, obilia, cukru vytvára zónu 20/21/22 (výbušný prach). Vodivá podlaha znižuje riziko iniciácie iskrou.",
        icon: "🌾",
      },
      {
        title: "Plynové stanice a rozvádzače",
        description:
          "Zemný plyn, propán-bután, vodík. Kompresorovne a stanice majú zónu 1 alebo 2.",
        icon: "⛽",
      },
      {
        title: "Petrochemický priemysel",
        description:
          "Rafinérie, ropovody, plnenie cisterien. Najprísnejšie ATEX požiadavky — zóna 0/1.",
        icon: "🛢️",
      },
      {
        title: "Batériová výroba a skladovanie",
        description:
          "Li-Ion články, elektrolyty. Nová oblasť s rýchlo rastúcim regulačným rámcom.",
        icon: "🔋",
      },
    ],
    standardsTitle: "Normy a legislatíva",
    standards: [
      {
        code: "Smernica 2014/34/EÚ (ATEX 114)",
        description:
          "Zariadenia a ochranné systémy na použitie v prostredí s nebezpečenstvom výbuchu. Definuje požiadavky pre uvedenie výrobkov na trh v EÚ.",
      },
      {
        code: "Smernica 1999/92/ES (ATEX 153)",
        description:
          "Minimálne požiadavky na zvýšenie bezpečnosti a ochrany zdravia pracovníkov pri práci v priestoroch s výbušnou atmosférou.",
      },
      {
        code: "Nariadenie vlády SR 149/2016 Z. z.",
        description:
          "Slovenská implementácia — sprístupňovanie výrobkov určených na použitie v prostredí s nebezpečenstvom výbuchu na trhu.",
      },
      {
        code: "STN EN 60079-10-1 / -10-2",
        description:
          "Klasifikácia priestorov s výbušnou atmosférou plynov (10-1) a prachov (10-2). Podklad pre zaradenie do zón.",
      },
      {
        code: "STN EN 1081",
        description:
          "Meranie elektrického odporu voči zemi — konkrétna testovacia metóda pre ATEX podlahy.",
      },
    ],
    priceLabel: "Orientačná cena",
    priceFrom: 95,
    priceNote:
      "Cena zahŕňa dodávku, montáž vodivého systému, medené uzemňovacie pásky, prepojenie s uzemňovacím bodom a **certifikát o meraní elektrického odporu** po realizácii (nevyhnutný pre revíznu správu). ATEX systém je zložitejší než ESD a vyžaduje precíznu prípravu podkladu — cena rastie s prísnosťou zóny a nutnosťou dodatočnej dokumentácie.",
    benefits: [
      {
        title: "Odpor <10⁶ Ω",
        description:
          "Splňuje najprísnejšie požiadavky pre ATEX zóny — okamžitý odvod elektrostatického náboja.",
      },
      {
        title: "Certifikované meranie",
        description:
          "Po realizácii meriame odpor a vystavujeme certifikát pre revíziu / poisťovňu.",
      },
      {
        title: "Odolnosť voči chémii",
        description:
          "Znáša rozliate rozpúšťadlá, kyseliny, hydroxidy — bežná realita ATEX prevádzok.",
      },
      {
        title: "Kombinácia s protišmykom",
        description:
          "V mokrých ATEX priestoroch (napr. plynové stanice v daždi) kombinujeme s R11/R12.",
      },
    ],
    faq: [
      {
        question: "Ako zistím do akej ATEX zóny patrí môj priestor?",
        answer:
          "Zaradenie robí revízny technik elektrických zariadení s licenciou pre výbušné prostredia. On vypracuje **protokol o určení vonkajších vplyvov (PoUVV)**. Podľa tohto protokolu vieme vybrať správny typ ATEX podlahy. Ak ho nemáš, odporúčame osloviť certifikovaného revízneho technika ešte pred realizáciou.",
      },
      {
        question: "Aký je rozdiel medzi ATEX a ESD podlahou?",
        answer:
          "ATEX je prísnejší (odpor <10⁶ Ω vs ESD 10⁶–10⁹) a rieši **ochranu pred výbuchom**. ESD je určený hlavne pre ochranu elektroniky pred poškodením statikou. ATEX podlaha automaticky spĺňa ESD, ale nie naopak. Ak máš výbušné prostredie, potrebuješ ATEX — ESD nestačí.",
      },
      {
        question: "Ako často treba merať odpor po realizácii?",
        answer:
          "Právne požiadavky odporúčajú **ročné kontrolné meranie** ako súčasť pravidelnej revízie elektrických zariadení. My poskytujeme túto službu — trvá cca 60 minút na 200 m², odovzdávame protokol pre poistku aj audítora BOZP.",
      },
      {
        question: "Sme malá dielňa — potrebujeme ATEX?",
        answer:
          "Závisí od toho čo tam robíte. Ak používate horľavé rozpúšťadlá, riedidlá, benzín v nevetraných priestoroch — pravdepodobne áno. Ak ide iba o mechanickú opracovku (kov, drevo) — nie. Presné zaradenie určí revízny technik. **My poradíme zdarma** pri obhliadke — netreba platiť za konzultáciu, kým nezistíme či je ATEX vôbec potrebný.",
      },
      {
        question: "Aký je poistný dopad ATEX podlahy?",
        answer:
          "Významný. Poisťovne často **odmietnu plniť** plnenie za škody z výbuchu, ak podnik nemá dokumentovaný súlad s ATEX 114/153. Certifikát merania odporu ATEX podlahy je jedným z kľúčových dokumentov pre poistenie a interné audity BOZP. Ušetrené peniaze na certifikácii sa v prípade škody vypomstia mnoho násobne.",
      },
      {
        question: "Môžeme kombinovať ATEX s HACCP?",
        answer:
          "Áno, časté v potravinárskych mlynoch (múka, cukor, korenie) — kde je prach výbušný (ATEX) A zároveň platia hygienické požiadavky (HACCP). Riešime to špecifickým systémom, ktorý spĺňa obidve normy súčasne. Cena je vyššia (~120 €/m²+), ale je to jediná legálne dovolená cesta.",
      },
    ],
    relatedCerts: ["esd", "haccp", "protismyk"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTIŠMYK — R9/R10/R11/R12/R13 classification
  // ═══════════════════════════════════════════════════════════════════════════
  protismyk: {
    slug: "protismyk",
    shortName: "Protišmyk",
    emoji: "🛡",
    h1: "Protišmykové epoxidové podlahy R9–R13",
    metaTitle: "Protišmykové epoxidové podlahy R9-R13 | EPOXIDOVO",
    metaDescription:
      "Protišmykové podlahy s klasifikáciou R9/R10/R11/R12/R13 podľa DIN 51130. Pre kuchyne, nemocnice, rampy, mokré prevádzky. Znížené riziko úrazov. Cena od 72 €/m².",
    heroTagline:
      "Kontrolovaný súčiniteľ trenia podľa DIN 51130 — R9 až R13 podľa prostredia.",
    accent: "#F5A623",
    intro: [
      "Protišmykové epoxidové podlahy sú systémy s riadeným povrchovým súčiniteľom trenia, ktoré znižujú riziko úrazu v mokrých, mastných alebo prašných prevádzkach.",
      "Miera protišmyku sa klasifikuje podľa nemeckej normy **DIN 51130** v triedach R9 (najmiernejší, napr. vstupné haly), cez R10 (kuchyne), R11 (mokré prevádzky), R12 (mäsokombináty) až po R13 (najprísnejší, napr. bitúnky, zóny s tukom).",
    ],
    whatIsTitle: "R-klasifikácia — ako si vybrať správnu triedu",
    whatIs: [
      "Klasifikácia R9–R13 vychádza z testu podľa DIN 51130 (**tzv. „test kolísavej roviny”**): osoba v testovacej obuvi kráča po podlahe naklonenej pod uhlom, ktorý sa postupne zvyšuje. Uhol pri ktorom osoba stráca stabilitu určuje triedu.",
      "**R9** (6°–10°): interiéry, kancelárie, hotelové lobby. Klasický lesklý epoxid.",
      "**R10** (10°–19°): kuchyne, sanitárne zariadenia, výrobne. Jemné povrchové zdrsnenie.",
      "**R11** (19°–27°): mliekarne, potravinárske haly, umyvárne, garáže. Výrazné zdrsnenie + kremenné mikroplniva.",
      "**R12** (27°–35°): mäsokombináty, spracovanie rýb, cukrovary. Hrubé kremenné plniva 0,4–0,8 mm.",
      "**R13** (>35°): bitúnky, zóny s tukom a krvou, chladiarne s trvale mokrým povrchom. Hrubé plniva 0,8–1,5 mm — povrch pripomínajúci šmirgeľ.",
      "Doplnková klasifikácia **V** (V4/V6/V8/V10) hovorí o **objeme priestoru medzi zrnami** — schopnosti podlahy „pohltiť” vodu alebo tuk pod nohu. Nemocnica potrebuje R10 V4, mliekáreň R11 V6, mäsokombinát R12 V8.",
    ],
    applicationsTitle: "Kde je protišmyk povinný alebo nevyhnutný",
    applications: [
      {
        title: "Nemocnice a kliniky",
        description:
          "Chodby, kúpelne, spŕchy, operačné umyvárne. Typicky R10 alebo R11 s antibakteriálnou úpravou.",
        icon: "🏥",
      },
      {
        title: "Reštauračné a priemyselné kuchyne",
        description:
          "R10 pre bežné kuchyne, R11 pre mokré zóny (umyváky), R12 pre mäsové úseky.",
        icon: "🍽️",
      },
      {
        title: "Rampy, schody, exteriéry",
        description:
          "Nakládkové rampy, vstupy do budov, exteriérové schody. R11/R12 kvôli daždi a snehu.",
        icon: "🚚",
      },
      {
        title: "Verejné bazény a wellness",
        description:
          "Ochodze bazénov, sauny, umyvárne. R11 V4 minimum (mokrá noha + bosonohý pohyb).",
        icon: "🏊",
      },
      {
        title: "Mäsokombináty a bitúnky",
        description:
          "R12 alebo R13 kvôli kombinácii krvi, tuku a vody. Najprísnejší protišmyk + HACCP.",
        icon: "🥩",
      },
      {
        title: "Autoservisy a garáže",
        description:
          "Ropolej, mastné škvrny, mokré kolesá. R10/R11 podľa toho, či ide o dielňu alebo umyváreň.",
        icon: "🚗",
      },
    ],
    standardsTitle: "Normy a legislatíva",
    standards: [
      {
        code: "DIN 51130",
        description:
          "Testovanie protišmykových vlastností — pracovné plochy s vysokým rizikom šmyku. Definuje triedy R9–R13.",
      },
      {
        code: "DIN 51097",
        description:
          "Testovanie protišmyku pre bosou nohou (bazény, spŕchy) — trieda A/B/C.",
      },
      {
        code: "BGR 181 / DGUV 208-041",
        description:
          "Nemecký úradný predpis — priraďuje R-triedy ku konkrétnym pracoviskám a činnostiam. Napríklad kuchyňa R10, mäsokombinát R12, chladiareň R13.",
      },
      {
        code: "Nariadenie vlády SR 391/2006 Z. z.",
        description:
          "Minimálne bezpečnostné a zdravotné požiadavky na pracovisko. Vyžaduje protišmykové úpravy tam, kde hrozí riziko šmyku.",
      },
      {
        code: "Vyhláška MZ SR 259/2008 Z. z.",
        description:
          "Podrobnosti o hygienických požiadavkách pre zariadenia verejného stravovania — implicitne vyžaduje protišmyk pre kuchyne.",
      },
    ],
    priceLabel: "Orientačná cena",
    priceFrom: 72,
    priceNote:
      "Cena zahŕňa dodávku a montáž protišmykového systému s kremennými plnivami. Trieda protišmyku sa volí podľa prevádzky — R10 je najlacnejší (~72 €/m²), R13 najdrahší (~110 €/m²) kvôli väčšej spotrebe hrubých plniv a náročnejšej pokládke. Kombinácia s HACCP alebo ESD zvyšuje cenu o 15–25 %.",
    benefits: [
      {
        title: "Certifikovaná trieda R",
        description:
          "Systém pripravujeme presne pre potrebnú triedu — od R10 pre kuchyne po R13 pre bitúnky.",
      },
      {
        title: "Znížené riziko úrazov",
        description:
          "Pri správnej triede R sa zdokumentovaná úrazovosť znižuje o 60–85 % (podľa štúdií nemeckej BGN).",
      },
      {
        title: "Kombinovateľný s HACCP",
        description:
          "Väčšina protišmykových systémov je zároveň HACCP-vhodná — bezšpárová, antibakteriálna.",
      },
      {
        title: "Ľahká údržba",
        description:
          "Kremenné plnivá netvoria hlboké dutiny — čistenie tlakovou vodou stačí.",
      },
    ],
    faq: [
      {
        question: "Akú triedu R potrebujem pre kuchyňu?",
        answer:
          "Pre klasické reštauračné kuchyne stačí **R10**. Pre mokré zóny s odtokmi (umyváky, priestor pred konvektomatmi) odporúčame **R11**. Ak spracúvate mäso alebo ryby, potrebujete **R12** (mokro + tuk). Presné zaradenie hovorí nemecký predpis DGUV 208-041 — my ho pre teba interpretujeme zdarma pri obhliadke.",
      },
      {
        question: "Je protišmyková podlaha ťažko čistiteľná?",
        answer:
          "Nie. Kremenné plnivá vytvárajú štruktúru ako jemný šmirgeľ — voda a čistiace roztoky sa cez ňu dostanú bez problémov. Používa sa tlaková voda alebo automatický umývací stroj so škrabkou. **Dôležité**: nepoužívať drôtenky ani abrazívne špagety — poškodia povrch.",
      },
      {
        question: "Môžem chodiť naboso alebo v spoločenskej obuvi?",
        answer:
          "R10 a R11 sú komfortné pre bežnú obuv, aj bosonohú chôdzu (napr. spŕchy). R12 a R13 sú výrazne agresívnejšie — bosonohá chôdza je nepríjemná, spoločenská obuv na nich rýchlo trpí. Preto R12/R13 volíme len tam, kde je to naozaj nevyhnutné (mäsokombinát, bitúnok).",
      },
      {
        question: "Ako dlho vydrží protišmyk?",
        answer:
          "Kremenné plnivá sú tvrdšie ako epoxidová matrica — trieda R sa časom skôr zväčšuje ako zmenšuje (epoxid sa opotrebováva, plnivá vystupujú). Praktická životnosť triedy R je **10–15 rokov** v bežnej prevádzke, **6–10 rokov** v najagresívnejších (mäsokombináty).",
      },
      {
        question: "Dá sa protišmyk pridať k existujúcej epoxidovej podlahe?",
        answer:
          "Áno, robíme aj **dodatočné protišmykové úpravy** — na existujúci povrch nanesieme adhézny nátier a novú topovú vrstvu s kremennými plnivami. Trvá 1–2 dni, cena je zhruba polovičná než nová podlaha. Vhodné ak podlaha ako celok drží, len sa stala klzkou.",
      },
      {
        question: "Aký je vplyv na poisťovňu / BOZP audit?",
        answer:
          "Zdokumentovaný súlad s DIN 51130 (uvedená trieda R) je kľúčový dôkaz splnenia povinností zamestnávateľa podľa Nariadenia vlády SR 391/2006 Z. z. Poisťovne často znižujú poistné pri preukázaní certifikovaného protišmyku, BOZP audítori ho vyžadujú. Odovzdávame technický list s deklarovanou triedou.",
      },
    ],
    relatedCerts: ["haccp", "esd", "atex"],
  },
};

export const CERT_LIST: CertSlug[] = ["esd", "haccp", "atex", "protismyk"];
