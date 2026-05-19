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
