/**
 * Obsah kurzu EPOXIDOVO — single source of truth pre /kurz.
 * Ceny sú bez DPH (EPOXIDOVO je neplatca DPH → finálne ceny).
 */

export const KURZ = {
  name: "EPOXIDOVO Akadémia — online kurz liatych podláh",
  shortName: "Online kurz epoxidových podláh",
  claim: "Nauč sa liať podlahy z videí, ktoré nakrúcame na reálnych zákazkách.",
  place: "online (prístup okamžite po zaplatení, navždy)",
  duration: "8+ hodín videa · 40+ lekcií · vlastné tempo",
  groupSize: 0,
  priceStandard: 499,
  pricePro: 1499,
  language: "angličtina (podklady aj v slovenčine)",
  hoursVideo: 8,
  lessons: 40,
  // ponechané pre spätnosť typov; online kurz termíny nemá
  nextTerms: [] as { date: string; iso: string; left: number }[],
} as const;

export const KURZ_STATS = [
  { value: "8+ h", label: "videa z reálnych zákaziek" },
  { value: "40+", label: "lekcií od podkladu po fakturáciu" },
  { value: "24/7", label: "prístup navždy, vlastné tempo" },
  { value: "EN", label: "v angličtine, podklady aj po slovensky" },
];

export const KURZ_FOR = [
  {
    title: "Podlahár a remeselník",
    text: "Robíš stierky, sadrokartón alebo obklady a chceš k tomu službu, ktorá sa účtuje od 45 €/m² a nie od hodiny.",
  },
  {
    title: "Začínajúci živnostník",
    text: "Nemáš skúsenosť s epoxidom, ale máš ruky a chuť. Odchádzaš s postupom, ktorý vieš zopakovať sám.",
  },
  {
    title: "Firma s partiou",
    text: "Chceš zaškoliť dvoch–troch chalanov naraz, aby robili rovnako a neplatil si za ich chyby na zákazke.",
  },
  {
    title: "Majiteľ, ktorý si robí sám",
    text: "Garáž, dielňa, prevádzka. Radšej to spravíš raz poriadne, ako trikrát dokola.",
  },
];

export const KURZ_PROGRAM = [
  {
    day: "Modul 1",
    subtitle: "Podklad a materiály",
    items: [
      "Materiály bez marketingu — epoxid, PU, polyaspartik: čo kedy použiť a prečo",
      "Diagnostika podkladu: vlhkosť, pevnosť v odtrhu, dilatácie, staré nátery",
      "Brúsenie a frézovanie na kamere zblízka: diamanty, zrnitosti, odsávanie",
      "Penetrácia, vysprávky, kotviace zárezy, riešenie prasklín",
      "Miešanie A + B: pomery, teplota, potlife a čo sa stane keď to podceníš",
    ],
  },
  {
    day: "Modul 2",
    subtitle: "Liatie, dekor a cenotvorba",
    items: [
      "Jednofarebná liata podlaha od kraja po kraj, celý postup v reálnom čase",
      "Chipsy: sypanie, prebrúsenie, transparentný uzáver",
      "Metalický efekt — pigmenty, fén, tvorba kresby (a kedy prestať)",
      "Sokle, prechody, odtoky a detaily, na ktorých padne 90 % amatérov",
      "Cenotvorba: kalkulácia m², spotreby, marže a čo dať do cenovej ponuky",
    ],
  },
];

export const KURZ_INCLUDED = [
  "40+ video lekcií nakrútených na reálnych zákazkách",
  "Prístup navždy vrátane všetkých budúcich aktualizácií",
  "Pracovný manuál (PDF) s postupmi a spotrebami",
  "Kalkulačka spotreby a vzorová cenová ponuka pre tvojich zákazníkov",
  "Certifikát o absolvovaní EPOXIDOVO Akadémie po záverečnom teste",
  "Zoznam overených dodávateľov materiálu a náradia",
  "Otázky k lekciám priamo pod videom, odpovedá lektor",
];

export const KURZ_FAQ = [
  {
    q: "Ako kurz prebieha?",
    a: "Po zaplatení ti príde e-mail s prístupom do členskej sekcie. Pozeráš video lekcie vlastným tempom, kedykoľvek a na čomkoľvek — všetko je interaktívne a intuitívne. Počas celého procesu si v kontakte s naším realizačným technikom, ktorého sa môžeš pýtať, keď niečomu nerozumieš. Dozvieš sa všetko o tom, ako založiť, riadiť a škálovať úspešnú epoxidovú firmu. Prístup nemá časové obmedzenie a dostávaš aj všetky budúce aktualizácie.",
  },
  {
    q: "Potrebujem nejakú skúsenosť?",
    a: "Nie. Kurz začína od podkladu a materiálov a každý krok je nakrútený zblízka na reálnej zákazke. Ak už epoxid robíš, preskočíš na moduly o dekore a cenotvorbe.",
  },
  {
    q: "V akom jazyku sú lekcie?",
    a: "Videá sú v angličtine, pracovný manuál, kalkulačka a cenová ponuka sú v angličtine aj slovenčine. Otázky pod lekciami môžeš písať po slovensky, odpovedáme v tvojom jazyku.",
  },
  {
    q: "Viem po kurze rovno robiť zákazky?",
    a: "Kurz ťa prevedie celým postupom vrátane cenotvorby, takže garáže, dielne a menšie interiéry zvládneš. V balíku PRO ti pri prvých realizáciách pomáha lektor cez mentoring. Takže odpoveď je áno — po absolvovaní môžeš rovno robiť a začať zarábať sám.",
  },
  {
    q: "Kde nakúpim materiál?",
    a: "V kurze je zoznam overených dodávateľov a presné spotreby. My ti dáme najlepšie veľkoobchodné ceny, pretože cez našu realizačnú firmu máme veľké odbery — absolventi nakupujú materiál v našom e-shope za tieto ceny.",
  },
  {
    q: "Dá sa kurz kúpiť na firmu / na faktúru?",
    a: "Áno. Pri objednávke vyplníš IČO a vystavíme faktúru, kurz je bežne uznateľný náklad. Nie sme platcami DPH, cena je konečná.",
  },
];

/** Faktová tabuľka — strojovo čitateľné zhrnutie pre AI odpovedače (GEO). */
export const KURZ_FAKTY: { label: string; value: string }[] = [
  { label: "Názov kurzu", value: KURZ.name },
  { label: "Forma", value: "Online video kurz, vlastné tempo, prístup navždy" },
  { label: "Rozsah", value: "8+ hodín videa, 40+ lekcií v 2 moduloch" },
  { label: "Cena", value: `${KURZ.priceStandard} € štandard / ${KURZ.pricePro} € balík PRO s mentoringom, nie sme platcami DPH` },
  { label: "Vstupné požiadavky", value: "Žiadne, kurz je vhodný aj pre úplných začiatočníkov" },
  { label: "Jazyk", value: "Angličtina, podklady aj v slovenčine" },
  { label: "Certifikát", value: "Osvedčenie o absolvovaní od EPOXIDOVO s. r. o. po záverečnom teste" },
  { label: "Čo sa naučíš", value: "Diagnostika a brúsenie podkladu, penetrácia, miešanie, jednofarebná liata podlaha, chipsy, metalický efekt, sokle, cenotvorba" },
  { label: "Garancia", value: "14 dní na vrátenie peňazí bez udania dôvodu" },
  { label: "Poskytovateľ", value: "EPOXIDOVO s. r. o., IČO 56 966 237, Slovensko" },
];

/**
 * Zhrnutie pre AI vyhľadávače — jeden odsek, ktorý sa dá citovať bez kontextu.
 * Zobrazuje sa aj vizuálne na stránke (GEO: extrahovateľná definícia).
 */
export const KURZ_SUMMARY =
  "Online kurz epoxidových podláh EPOXIDOVO Akadémia obsahuje vyše 8 hodín videa a 40 lekcií " +
  "nakrútených na reálnych zákazkách: diagnostiku a brúsenie betónového podkladu, penetráciu, " +
  "miešanie dvojzložkových živíc, liatie jednofarebnej podlahy, chipsový a metalický dekor, sokle " +
  "a detaily, a cenotvorbu zákazky. Lekcie sú v angličtine, podklady aj v slovenčine. Prístup je " +
  "okamžitý po zaplatení a bez časového obmedzenia. Cena je 499 € (štandard) alebo 1 499 € (balík " +
  "PRO s 3 mesiacmi osobného mentoringu). Súčasťou je manuál so spotrebami, kalkulačka, vzorová " +
  "cenová ponuka a certifikát. Na kurz sa vzťahuje 14-dňová garancia vrátenia peňazí.";
