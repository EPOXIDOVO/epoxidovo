import { SITE } from "@/lib/site";

/**
 * Zdieľaný layout pre dynamic OG image (1200×630px).
 *
 * Použitie v `opengraph-image.tsx`:
 *
 *   import { OgTemplate, OG_SIZE } from "@/lib/og-template";
 *   import { ImageResponse } from "next/og";
 *
 *   export const runtime = "edge";
 *   export const size = OG_SIZE;
 *   export const contentType = "image/png";
 *
 *   export default async function Image() {
 *     return new ImageResponse(
 *       <OgTemplate title="..." subtitle="..." badge="..." />,
 *       { ...size },
 *     );
 *   }
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

interface OgTemplateProps {
  /** Hlavný nadpis — biely, veľký */
  title: string;
  /** Podnadpis pod titulom — sivý */
  subtitle?: string;
  /** Malý badge nad titulom — modrý, uppercase */
  badge?: string;
  /** Spodný riadok (default: telefón + doména) */
  footer?: string;
}

export function OgTemplate({
  title,
  subtitle = "Ručne tvorené epoxidové podlahy po celom Slovensku.",
  badge,
  footer,
}: OgTemplateProps) {
  const footerText = footer || `${SITE.contact.phone} · ${SITE.domain}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0a0a0c 0%, #1a202c 60%, #3db6e8 200%)",
        color: "white",
      }}
    >
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#3db6e8",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {badge ?? `${SITE.name}.sk`}
      </div>
      <div
        style={{
          fontSize: 84,
          fontWeight: 800,
          lineHeight: 1.05,
          marginTop: 32,
          letterSpacing: "-0.03em",
          maxWidth: 1040,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#a1a1aa",
          marginTop: 28,
          maxWidth: 920,
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          fontSize: 22,
          color: "#3db6e8",
          marginTop: 56,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <span>{footerText}</span>
      </div>
    </div>
  );
}
