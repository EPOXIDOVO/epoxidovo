export const runtime = "edge";

import { handlers } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Rate limit OTP / magic-link signin requesty — bráni email spam-u
  // a brute force na cudzie emaily (5 / 20 min / IP)
  if (pathname.includes("/signin/")) {
    const ip = getClientIp(req.headers);
    const rl = rateLimit({
      key: "auth-signin",
      identifier: ip,
      limit: 5,
      windowMs: 20 * 60 * 1000,
    });
    if (!rl.ok) {
      const retryAfter = Math.ceil(rl.resetMs / 1000);
      console.warn("[auth] signin rate limit exceeded ip:", ip);
      return NextResponse.json(
        {
          error: "rate_limited",
          message:
            "Príliš veľa pokusov o prihlásenie. Skús to znova o pár minút.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(retryAfter),
          },
        },
      );
    }
  }

  console.log("[/api/auth POST]", pathname);
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
