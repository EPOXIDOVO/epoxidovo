import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS / Android home screen icon — 180×180 PNG.
 * Rovnaký dizajn ako browser tab favicon, len väčší pre Retina home screen.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#3db6e8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            color: "white",
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 1,
            letterSpacing: -6,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          E
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "white",
              marginLeft: 6,
              marginBottom: 16,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
