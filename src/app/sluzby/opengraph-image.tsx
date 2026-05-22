import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";

export const runtime = "edge";
export const alt = "Služby — typy epoxidových podláh | EPOXIDOVO";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        badge="EPOXIDOVO.SK · SLUŽBY"
        title="Štyri typy podláh. Nekonečné možnosti."
        subtitle="Jednofarebné, chipsové, mramorové a metalické epoxidové podlahy."
      />
    ),
    { ...size },
  );
}
