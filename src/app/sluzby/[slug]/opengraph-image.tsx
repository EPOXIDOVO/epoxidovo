import { ImageResponse } from "next/og";
import { OgTemplate, OG_SIZE } from "@/lib/og-template";
import { CATEGORIES } from "@/content/categories";
import { SERVICE_DETAILS } from "@/content/serviceDetails";

export const runtime = "edge";
export const alt = "Typ epoxidovej podlahy | EPOXIDOVO";
export const size = OG_SIZE;
export const contentType = "image/png";

interface OgParams {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: OgParams) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const detail = SERVICE_DETAILS[slug];

  if (!cat) {
    return new ImageResponse(
      <OgTemplate title="Epoxidové podlahy | EPOXIDOVO" />,
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <OgTemplate
        badge={`EPOXIDOVO.SK · ${cat.name.toUpperCase()}`}
        title={`${cat.name} epoxidové podlahy`}
        subtitle={
          detail?.intro
            ? detail.intro.length > 130
              ? detail.intro.slice(0, 127) + "…"
              : detail.intro
            : "Ručne tvorené podlahy s 20+ rokov životnosťou."
        }
      />
    ),
    { ...size },
  );
}
