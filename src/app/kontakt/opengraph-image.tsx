import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = "Kontakt | EPOXIDOVO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        badge="EPOXIDOVO.SK · KONTAKT"
        title="Zavolaj, napíš, alebo chatuj."
        subtitle={`Telefón ${SITE.contact.phone} · Email ${SITE.contact.email}`}
      />
    ),
    { ...size },
  );
}
