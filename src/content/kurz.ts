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
  priceStandard: 690,
  pricePro: 1190,
  nextTerms: [
    { date: "12. — 13. september 2026", left: 3 },
    { date: "10. — 11. október 2026", left: 6 },
    { date: "14. — 15. november 2026", left: 6 },
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
    q: "Dá sa kurz zaplatiť na firmu / na faktúru?",
    a: "Áno. Vystavíme faktúru na IČO, kurz je bežne uznateľný náklad. Pri prihlásení 3 a viac ľudí z jednej firmy dávame skupinovú cenu.",
  },
];
