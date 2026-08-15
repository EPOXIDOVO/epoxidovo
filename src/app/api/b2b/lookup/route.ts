import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Predikcia firmy pre B2B formulár — proxy na Register právnických osôb
 * (api.statistics.sk, verejné dáta ŠÚ SR pod CC-BY). Číselný dopyt hľadá
 * podľa IČO, textový podľa názvu. Vraciame len to, čo formulár potrebuje.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }
  const isIco = /^\d{6,8}$/.test(q.replace(/\s/g, ""));
  const url = isIco
    ? `https://api.statistics.sk/rpo/v1/search?identifier=${q.replace(/\s/g, "")}&onlyActive=true`
    : `https://api.statistics.sk/rpo/v1/search?fullName=${encodeURIComponent(q)}&onlyActive=true`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // RPO sa mení zriedka — hodinová cache šetrí ich aj náš limit
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = (await res.json()) as {
      results?: {
        identifiers?: { value?: string }[];
        fullNames?: { value?: string }[];
        addresses?: {
          street?: string;
          buildingNumber?: string;
          postalCodes?: string[];
          municipality?: { value?: string };
        }[];
      }[];
    };
    const results = (data.results ?? [])
      .map((r) => {
        const a = r.addresses?.[0];
        const adresa = a
          ? [
              [a.street, a.buildingNumber].filter(Boolean).join(" "),
              [a.postalCodes?.[0], a.municipality?.value].filter(Boolean).join(" "),
            ]
              .filter(Boolean)
              .join(", ")
          : "";
        return {
          nazov: r.fullNames?.[0]?.value ?? "",
          ico: r.identifiers?.[0]?.value ?? "",
          adresa,
        };
      })
      .filter((r) => r.nazov && r.ico)
      .slice(0, 8);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
