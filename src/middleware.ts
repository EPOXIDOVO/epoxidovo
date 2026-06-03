import { NextResponse, type NextRequest } from "next/server";

/**
 * Global Next.js middleware — defense-in-depth auth gate.
 *
 * Cieľ: aj keby som zabudol pridať auth check do nového admin route, middleware
 * odmietne neautentifikovaný request ešte pred tým, než ide do route handlera.
 *
 * Logika:
 *   - /admin/* a /leady/* (okrem login pages) — vyžaduje session cookie
 *     (presnejšie validuje route handler, my len bránime úplnému no-auth prístupu)
 *   - /api/admin/* — vyžaduje session cookie
 *   - /api/lead/[id]/* — vyžaduje session cookie (call agenti)
 *   - Verejné routes (lead POST, web pages, cron) — bez kontroly
 *
 * Toto je IBA presence-check session cookie, nie validácia. Route handler
 * stále musí robiť `auth()` + role check. Ale ak útočník vystrelí na admin URL
 * bez cookie, dostane 401 už tu — nie až v route handleri.
 */

const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token", // production
  "authjs.session-token", // dev
];

function hasSessionCookie(req: NextRequest): boolean {
  for (const name of SESSION_COOKIE_NAMES) {
    const c = req.cookies.get(name);
    if (c && c.value && c.value.length > 0) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // === Verejné cesty — bez kontroly ===
  // Login pages musia byť accessible bez session
  if (pathname === "/leady/login" || pathname === "/admin/login") {
    return NextResponse.next();
  }
  // NextAuth callback endpointy musia byť accessible (na nich sa user prihlasuje)
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }
  // Cron endpoint má vlastnú Bearer auth (nie session)
  if (pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }
  // Verejný lead submit
  if (pathname === "/api/lead") {
    return NextResponse.next();
  }

  // === Chránené cesty — vyžadujú session cookie ===
  const requiresAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/leady") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/lead/");

  if (requiresAuth && !hasSessionCookie(req)) {
    // API → JSON 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    // Page → redirect na login
    const loginUrl = new URL(
      pathname.startsWith("/admin") ? "/admin/login" : "/leady/login",
      req.url,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Matcher — bežíme len na potrebných routes, nie pre static assets.
 * Vylučujeme: _next/static, _next/image, favicon, public images, atď.
 */
export const config = {
  matcher: [
    /*
     * Bežíme na všetkých routes okrem:
     * - _next/static (build artifacts)
     * - _next/image (image optimizer)
     * - favicon.ico, sitemap.xml, robots.txt
     * - statické súbory s príponou (.png .jpg .svg .webp .avif atď.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf|eot|css|js)$).*)",
  ],
};
