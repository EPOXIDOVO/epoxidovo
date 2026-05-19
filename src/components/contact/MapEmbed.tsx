import * as React from "react";
import { SITE, getAddressLine } from "@/lib/site";

/**
 * Google Maps embed — iframe s adresou firmy.
 * Bez API key (verejný embed link), takže funguje out-of-the-box.
 *
 * POZN: ak chceš custom marker / styling, potrebuješ Google Maps JavaScript API
 * a registráciu kľúča (paid).
 */
export function MapEmbed() {
  const query = encodeURIComponent(
    `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`,
  );
  const src = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)] bg-white">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-base font-bold tracking-tight">Nájdete nás tu</h3>
        <p className="text-sm text-[var(--color-fg-muted)] mt-0.5">
          {getAddressLine()}
        </p>
      </div>
      <iframe
        title={`Mapa — ${SITE.legalName}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-[300px] md:h-[360px] block border-0"
        allowFullScreen
      />
    </div>
  );
}
