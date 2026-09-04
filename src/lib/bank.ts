import { SITE } from "./site";

/**
 * Platobné údaje pre bankový prevod.
 *
 * Držané v env, nie v kóde — číslo účtu nepatrí do repozitára a mení sa
 * nezávisle od nasadenia:
 *   BANK_IBAN    povinné; kým nie je nastavené, pokyny sa nezobrazia vôbec
 *   BANK_HOLDER  majiteľ účtu (default: obchodné meno)
 *   BANK_SWIFT   nepovinné, pre platby zo zahraničia
 *
 * Kým IBAN nie je nastavený, e-mail zákazníkovi NESĽUBUJE číslo účtu —
 * povie pravdu, že platobné údaje pošleme do 24 hodín. Radšej menej
 * sľúbiť než poslať človeku objednávku, ktorú nemá ako zaplatiť.
 */
export interface BankDetails {
  iban: string;
  holder: string;
  swift: string | null;
}

export function bankDetails(): BankDetails | null {
  const iban = process.env.BANK_IBAN?.replace(/\s+/g, " ").trim();
  if (!iban) return null;
  return {
    iban,
    holder: process.env.BANK_HOLDER?.trim() || SITE.legalName,
    swift: process.env.BANK_SWIFT?.trim() || null,
  };
}

/**
 * Variabilný symbol = číslice z čísla objednávky.
 * KURZ-260904-1234 → 2609041234 (10 číslic, presne strop pre VS).
 * Preto má orderNumber() číselnú príponu — z písmen by sa VS odvodiť nedal.
 */
export function variabilnySymbol(orderId: string): string {
  return orderId.replace(/\D/g, "").slice(0, 10);
}
