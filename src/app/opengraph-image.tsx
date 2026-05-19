import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = SITE.og.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamický OG image — pre social sharing (FB, LinkedIn, Twitter…)
 */
export default async function Image() {
  return new ImageResponse(
    (
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
          {SITE.name}.sk
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 32,
            letterSpacing: "-0.03em",
            maxWidth: 1000,
          }}
        >
          {SITE.shortDescription}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          Ručne tvorené epoxidové podlahy po celom Slovensku.
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
          <span>{SITE.contact.phone}</span>
          <span style={{ color: "#52525b" }}>·</span>
          <span>{SITE.domain}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
