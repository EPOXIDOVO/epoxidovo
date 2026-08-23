/**
 * Obsah kurzu EPOXIDOVO — single source of truth pre /kurz.
 * Ceny sú bez DPH (EPOXIDOVO je neplatca DPH → finálne ceny).
 */

export const KURZ = {
  name: "EPOXIDOVO Akadémia — 2-dňový kurz liatych podláh",
  shortName: "Kurz epoxidových podláh",
  claim: "Za dva dni sa naučíš liať podlahu, ktorú si zákazník odfotí.",
  place: "Ružomberok (školiace centrum EPOXIDOVO)",
  duration: "2 dni · 9:00 — 17:00",
  groupSize: 6,
  priceStandard: 499,
  pricePro: 1499,
  language: "angličtina (lektor rozumie aj po slovensky)",
  nextTerms: [
    { date: "12. — 13. september 2026", iso: "2026-09-12", left: 3 },
    { date: "10. — 11. október 2026", iso: "2026-10-10", left: 6 },
    { date: "14. — 15. november 2026", iso: "2026-11-14", left: 6 },
  ],
} as const;

export const KURZ_STATS = [
  { value: "2 dni", label: "od teórie po hotovú plochu" },
  { value: "6 ľudí", label: "max. v skupine — na každého sa dostane" },
  { value: "80 %", label: "času s valcom a stierkou v ruke" },
  { value: "12 m²", label: "reálnej plochy, ktorú si odleješ sám" },
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
    day: "Deň 1",
    subtitle: "Podklad rozhoduje o všetkom",
    items: [
      "Materiály bez marketingu — epoxid, PU, polyaspartik: čo kedy použiť a prečo",
      "Diagnostika podkladu: vlhkosť, pevnosť v odtrhu, dilatácie, staré nátery",
      "Brúsenie a frézovanie naživo — diamanty, zrnitosti, odsávanie",
      "Penetrácia, vysprávky, kotviace zárezy, riešenie prasklín",
      "Miešanie A + B: pomery, teplota, potlife a čo sa stane keď to podceníš",
    ],
  },
  {
    day: "Deň 2",
    subtitle: "Liatie, dekor, finiš",
    items: [
      "Jednofarebná liata podlaha od kraja po kraj — ty, valec, ježko",
      "Chipsy: sypanie, prebrúsenie, transparentný uzáver",
      "Metalický efekt — pigmenty, fén, tvorba kresby (a kedy prestať)",
      "Sokle, prechody, odtoky a detaily, na ktorých padne 90 % amatérov",
      "Cenotvorba: kalkulácia m², spotreby, marže a čo dať do cenovej ponuky",
    ],
  },
];

export const KURZ_INCLUDED = [
  "Všetok materiál a spotrebák na dva dni tréningu",
  "Zapožičanie profi náradia — brúska, miešadlo, ježko, stierka",
  "Pracovný manuál (PDF + tlačený) s postupmi a spotrebami",
  "Kalkulačka spotreby a vzorová cenová ponuka pre tvojich zákazníkov",
  "Certifikát o absolvovaní EPOXIDOVO Akadémie",
  "Obed a káva oba dni",
  "30 dní podpory po kurze — píšeš priamo lektorovi",
];

export const KURZ_FAQ = [
  {
    q: "Potrebujem nejakú skúsenosť?",
    a: "Nie. Kurz začína od podkladu a materiálov. Väčšina účastníkov drží stierku prvýkrát práve u nás. Ak už epoxid robíš, povedz nám to vopred — druhý deň ti pritvrdíme.",
  },
  {
    q: "Budem naozaj liať, alebo sa len pozerám?",
    a: "Lejeme. Každý účastník má vlastnú plochu cca 12 m², ktorú si celú spraví sám od brúsenia po finiš. Skupina je max. 6 ľudí presne preto.",
  },
  {
    q: "Čo si mám priniesť?",
    a: "Pracovné oblečenie a obuv, ktorú nie je škoda. Náradie, materiál aj ochranné pomôcky dostaneš na mieste.",
  },
  {
    q: "Viem po kurze rovno robiť zákazky?",
    a: "Vieš robiť garáže, dielne a menšie interiéry. Na veľké haly a priemysel odporúčame ísť najprv ako druhý človek na pár realizácií — a to ti vieme pomôcť dohodnúť.",
  },
  {
    q: "Kde materiál nakúpim?",
    a: "Na kurze dostaneš zoznam overených dodávateľov aj naše nákupné podmienky. Cez náš e-shop nakupuješ ako absolvent za partnerské ceny.",
  },
  {
    q: "V akom jazyku kurz prebieha?",
    a: "Kurz vedieme v angličtine — chodia k nám ľudia z celej Európy. Lektor rozumie aj po slovensky, takže otázku môžeš položiť v slovenčine a odpoveď dostaneš aj tak. Manuál dostaneš v angličtine aj slovenčine.",
  },
  {
    q: "Dá sa kurz zaplatiť na firmu / na faktúru?",
    a: "Áno. Vystavíme faktúru na IČO, kurz je bežne uznateľný náklad. Pri prihlásení 3 a viac ľudí z jednej firmy dávame skupinovú cenu.",
  },
];

/** Faktová tabuľka — strojovo čitateľné zhrnutie pre AI odpovedače (GEO). */
export const KURZ_FAKTY: { label: string; value: string }[] = [
  { label: "Názov kurzu", value: KURZ.name },
  { label: "Forma", value: "Prezenčný praktický workshop (nie online video)" },
  { label: "Dĺžka", value: "2 po sebe idúce dni, 9:00 — 17:00 (16 hodín)" },
  { label: "Miesto", value: "Ružomberok, Slovensko — školiace centrum EPOXIDOVO" },
  { label: "Veľkosť skupiny", value: `Maximálne ${KURZ.groupSize} účastníkov` },
  { label: "Cena", value: `${KURZ.priceStandard} € štandard / ${KURZ.pricePro} € balík PRO za osobu, nie sme platcami DPH` },
  { label: "Vstupné požiadavky", value: "Žiadne — kurz je vhodný aj pre úplných začiatočníkov" },
  { label: "Jazyk", value: "Angličtina — kurz vedieme po anglicky, lektor rozumie aj slovensky" },
  { label: "Certifikát", value: "Osvedčenie o absolvovaní od EPOXIDOVO s. r. o." },
  { label: "Čo si prakticky vyskúšaš", value: "Brúsenie, penetrácia, miešanie, jednofarebná liata podlaha, chipsy, metalický efekt, sokle, cenotvorba" },
  { label: "Poskytovateľ", value: "EPOXIDOVO s. r. o., IČO 56 966 237, Slovensko" },
];

/**
 * Zhrnutie pre AI vyhľadávače — jeden odsek, ktorý sa dá citovať bez kontextu.
 * Zobrazuje sa aj vizuálne na stránke (GEO: extrahovateľná definícia).
 */
export const KURZ_SUMMARY =
  "Kurz epoxidových podláh EPOXIDOVO Akadémia je dvojdňové prezenčné školenie v Ružomberku, " +
  "kde sa maximálne 6 účastníkov naučí kompletný postup liatej epoxidovej podlahy: diagnostiku a " +
  "brúsenie betónového podkladu, penetráciu, miešanie dvojzložkových živíc, liatie jednofarebnej " +
  "podlahy, chipsový a metalický dekor, riešenie soklov a detailov, a napokon cenotvorbu zákazky. " +
  "Kurz prebieha v angličtine. Každý účastník si sám odleje vlastnú plochu približne 12 m². Cena je 499 € (štandard) alebo " +
  "1 499 € (balík PRO s mentoringom a štartovacím materiálom), vrátane materiálu, náradia, manuálu, obedu, " +
  "certifikátu a 30 dní podpory po kurze; balík PRO pridáva 3 mesiace osobného mentoringu. Kurz je vhodný pre remeselníkov, začínajúcich živnostníkov, " +
  "firemné partie aj majiteľov, ktorí si podlahu robia sami.";
