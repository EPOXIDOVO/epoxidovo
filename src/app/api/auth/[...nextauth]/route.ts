export const runtime = "edge";

import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

// Wrapped GET handler s logovaním pre debug — vidíme všetky callback requesty
async function GET(req: NextRequest) {
  const url = new URL(req.url);
  console.log(
    "[/api/auth GET]",
    url.pathname,
    "params:",
    Object.fromEntries(url.searchParams),
  );
  const response = await handlers.GET(req);
  console.log(
    "[/api/auth GET response]",
    response.status,
    "→",
    response.headers.get("location"),
  );
  return response;
}

async function POST(req: NextRequest) {
  console.log("[/api/auth POST]", new URL(req.url).pathname);
  const response = await handlers.POST(req);
  console.log(
    "[/api/auth POST response]",
    response.status,
    "→",
    response.headers.get("location"),
  );
  return response;
}

export { GET, POST };
