import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely (later classes override earlier).
 * Used by all UI primitives (Button, Card, Input...).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Slovak phone formatter — display-friendly.
 * Input: "+421948143981" → Output: "+421 948 143 981"
 */
export function formatPhoneSk(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+421") && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
}

/**
 * Slovak slug generator (handles diacritics).
 * "Epoxidové podlahy" → "epoxidove-podlahy"
 */
export function slugifySk(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Je to vôbec e-mailová adresa?
 *
 * Formulár cenovej ponuky doteraz overoval len to, že pole nie je prázdne,
 * takže cez neho prešlo aj „novak" — a vznikol dopyt s adresou, na ktorú sa
 * ponuka nikdy nedala poslať. Klient aj server musia súhlasiť, preto jedna
 * funkcia pre oboch.
 *
 * Zámerne voľné: nevalidujeme podľa RFC, len odmietame to, čo evidentne
 * adresa nie je. Prísnejšia kontrola stráca viac reálnych zákazníkov,
 * než koľko preklepov zachytí.
 */
export function jeEmail(v: string): boolean {
  const s = v.trim();
  return s.length <= 200 && /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(s);
}
