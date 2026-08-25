import { TYPY_PODLAH, type TypPodlahyKarta } from "@/content/typy-podlah";

/**
 * „od X €/m²" pre dlaždice typov podláh — z tej istej matice materiál ×
 * hrúbka, akú používa konfigurátor, aby galéria a ponuka nikdy neukazovali
 * iné číslo (user 2026-08-25: „Ceny „od" v galérii generuj z tej istej
 * matice ako konfigurátor").
 *
 * Zdroj pravdy je NajCRM (/admin/systems). Statické `priceFrom` v
 * @/content/typy-podlah je iba záchranná sieť pre prípad, že CRM neodpovie —
 * stránka vtedy radšej ukáže poslednú známu cenu, než nič.
 */

type CennikSystem = {
  code: string;
  floor_type: string | null;
  hrubky: { price_per_m2: number }[];
};

const CRM_URL = process.env.NAJCRM_BASE_URL ?? "https://app.najcrm.sk";

/** Najnižšia cena €/m² pre každý typ podlahy, kľúčované slugom dlaždice. */
export async function cenyOdZCrm(): Promise<Record<string, number>> {
  const secret = process.env.EPX_PUSH_SECRET ?? process.env.BDSMANAGER_WEBHOOK_SECRET;
  if (!secret) return {};

  try {
    const res = await fetch(`${CRM_URL}/api/public/cennik`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-epx-secret": secret },
      // cenník sa mení zriedka; hodina je kompromis medzi čerstvosťou
      // a tým, aby homepage nečakala na CRM pri každom zobrazení
      next: { revalidate: 3600 },
    });
    const d = (await res.json()) as {
      ok?: boolean;
      systemy?: CennikSystem[];
      default_system?: Record<string, string>;
    };
    if (!d?.ok || !Array.isArray(d.systemy)) return {};

    const vysledok: Record<string, number> = {};
    for (const t of TYPY_PODLAH) {
      const cena = najnizsiaCena(t, d.systemy, d.default_system ?? {});
      if (cena != null) vysledok[t.slug] = cena;
    }
    return vysledok;
  } catch {
    return {};
  }
}

function najnizsiaCena(
  t: TypPodlahyKarta,
  systemy: CennikSystem[],
  defaultSystem: Record<string, string>,
): number | null {
  if (!t.crmFloorType) return null;
  const kody = t.crmSystemy?.length
    ? t.crmSystemy
    : [defaultSystem[t.crmFloorType]].filter(Boolean);
  const ceny = kody
    .map((k) => systemy.find((s) => s.code === k))
    .filter((s): s is CennikSystem => Boolean(s))
    .flatMap((s) => s.hrubky.map((h) => h.price_per_m2))
    .filter((n) => typeof n === "number" && n > 0);
  return ceny.length ? Math.min(...ceny) : null;
}
