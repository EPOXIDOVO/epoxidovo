import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Realizácie — naše práce | EPOXIDOVO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        badge="EPOXIDOVO.SK · REALIZÁCIE"
        title="Pozri si naše podlahy."
        subtitle="200+ realizácií — domy, garáže, priemyselné haly po celom Slovensku."
      />
    ),
    { ...size },
  );
}
