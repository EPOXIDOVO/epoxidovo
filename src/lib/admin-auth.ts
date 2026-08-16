/**
 * Admin prihlásenie cez e-mailový kód (OTP) — bez next-auth, edge-safe.
 *
 * Tok: /api/admin/auth/request pošle 6-miestny kód na ADMIN_EMAILS,
 * hash kódu čaká vo VerificationToken (10 min). /api/admin/auth/verify
 * kód overí a vystaví cookie podpísanú AUTH_SECRET (HMAC-SHA256, 30 dní).
 * Žiadny stav na serveri okrem jednorazového tokenu v DB.
 */

export const ADMIN_COOKIE = "epx_admin";
const SESSION_DAYS = 30;
const OTP_MINUTES = 10;

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET nie je nastavený");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(new Uint8Array(sig));
}

/** Vytvorí hodnotu session cookie: exp.podpis */
export async function createSession(): Promise<{ value: string; maxAge: number }> {
  const exp = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
  const sig = await hmac(`session:${exp}`);
  return { value: `${exp}.${sig}`, maxAge: SESSION_DAYS * 24 * 3600 };
}

/** Overí session cookie — konštantný tvar, bez DB. */
export async function verifySession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  try {
    return (await hmac(`session:${exp}`)) === sig;
  } catch {
    return false;
  }
}

/** SHA-256 hex hash OTP kódu. */
export async function hashCode(code: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  return Array.from(new Uint8Array(d))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Bezstavový OTP token: `exp.hash(kód).podpis` — server si nič nepamätá,
 * klient ho vráti spolu s kódom z e-mailu. Kód pozná len majiteľ schránky,
 * token bez kódu je nanič (hash + HMAC).
 */
export async function createOtpToken(code: string): Promise<string> {
  const exp = Date.now() + OTP_MINUTES * 60_000;
  const h = await hashCode(code);
  const sig = await hmac(`otp:${exp}:${h}`);
  return `${exp}.${h}.${sig}`;
}

export async function verifyOtpToken(token: string, code: string): Promise<boolean> {
  const [expStr, h, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !h || !sig || exp < Date.now()) return false;
  try {
    if ((await hmac(`otp:${exp}:${h}`)) !== sig) return false;
    return (await hashCode(code)) === h;
  } catch {
    return false;
  }
}

/** Prvý (a jediný oprávnený) admin e-mail z ADMIN_EMAILS. */
export function adminEmail(): string | null {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const first = raw.split(",")[0]?.trim();
  return first || null;
}
