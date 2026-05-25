import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Browser tab favicon — dynamicky generovaný cez ImageResponse.
 * Nahrádza pôvodný icon.png (medvedík mascot) za clean brand wordmark
 * v štýle nového header logo: modré pozadie + biele "E" + bodka.
 */
export default function Icon() {
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
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            color: "white",
            fontWeight: 900,
            fontSize: 46,
            lineHeight: 1,
            letterSpacing: -2,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          E
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "white",
              marginLeft: 2,
              marginBottom: 6,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
