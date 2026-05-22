import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Nezáväzná cenová ponuka | EPOXIDOVO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        badge="EPOXIDOVO.SK · CENOVÁ PONUKA"
        title="Nezáväzná cenová ponuka do 24 hodín."
        subtitle="Vyplň formulár — bezplatne pošleme kalkuláciu na mieru."
      />
    ),
    { ...size },
  );
}
