/**
 * EPOXIDOVO — single source of truth pre firemné údaje.
 * Tieto údaje sa používajú v footeri, legal pages, JSON-LD, meta tagoch.
 * Ak sa zmení čokoľvek (adresa, IČO...), meníme TU.
 */

export const SITE = {
  name: "EPOXIDOVO",
  legalName: "EPOXIDOVO s. r. o.",
  domain: "epoxidovo.sk",
  url: "https://epoxidovo.sk",
  description:
    "Ručne tvorené epoxidové a polyuretánové podlahy. Jednofarebné, chipsové, mramorové a metalické. Realizácie v rodinných domoch, garážach a halách po celom Slovensku.",
  shortDescription: "Epoxidové podlahy s dušou. Každá je originál.",

  contact: {
    phone: "+421 948 143 981",
    phoneRaw: "+421948143981",
    email: "info@epoxidovo.sk",
  },

  // Sídlo firmy
  address: {
    street: "Plavisko 1956/35",
    city: "Ružomberok",
    postalCode: "034 01",
    country: "Slovensko",
    countryCode: "SK",
  },

  // Obchodný register
  business: {
    ico: "56 966 237",
    icoRaw: "56966237",
    dic: "2122519135",
    icDph: null, // neplatca DPH
    isVatPayer: false,
    court: "Obchodný register Okresného súdu Žilina",
    section: "Sro",
    insertNo: "87697/L",
    foundedAt: "2025-05-13",
  },

  // Sociálne siete
  social: {
    facebook: "https://www.facebook.com/share/181TPCyd18/?mibextid=wwXIfr" as string,
    instagram: "https://www.instagram.com/epoxidovo.sk/" as string,
    tiktok: "https://www.tiktok.com/@epoxidovo.sk" as string,
    youtube: "" as string,
  },

  // Default OG
  og: {
    title: "EPOXIDOVO — Epoxidové a polyuretánové podlahy",
    description:
      "Originálne epoxidové a polyuretánové podlahy pre tvoj domov, garáž alebo firmu. Realizácie po celom Slovensku.",
  },
} as const;

/** Helper: vykreslené sídlo na jeden riadok */
export function getAddressLine(): string {
  const a = SITE.address;
  return `${a.street}, ${a.postalCode} ${a.city}`;
}

/** Helper: legálny boilerplate pre footer / pravna sekcia */
export function getLegalLine(): string {
  const b = SITE.business;
  return `${SITE.legalName}, IČO: ${b.ico}, DIČ: ${b.dic}. Spoločnosť zapísaná v ${b.court}, oddiel: ${b.section}, vložka č. ${b.insertNo}.`;
}
