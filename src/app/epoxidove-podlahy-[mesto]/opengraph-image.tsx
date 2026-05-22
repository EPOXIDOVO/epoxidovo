import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";
import { findCity } from "@/content/cities";

export const runtime = "edge";
export const alt = "Epoxidové podlahy v meste | EPOXIDOVO";
export const size = OG_SIZE;
export const contentType = "image/png";

interface OgParams {
  params: Promise<{ mesto: string }>;
}

export default async function Image({ params }: OgParams) {
  const { mesto } = await params;
  const city = findCity(mesto);

  if (!city) {
    return new ImageResponse(
      <OgTemplate title="Epoxidové podlahy | EPOXIDOVO" />,
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <OgTemplate
        badge={`EPOXIDOVO.SK · ${city.name.toUpperCase()}`}
        title={`Epoxidové podlahy ${city.inCity}`}
        subtitle={`${city.region} — bezplatná obhliadka a cenová ponuka do 24 hodín.`}
      />
    ),
    { ...size },
  );
}
