/**
 * Admin prihlásenie e-mailom + heslom (edge-safe, Cloudflare Pages).
 *
 * Tok:
 *   1. Prvé prihlásenie: admin heslo nepozná → „Zabudol som heslo" → na
 *      admin e-mail (ADMIN_EMAILS) príde odkaz s jednorazovým reset tokenom
 *      → nastaví si heslo. Odvtedy sa prihlasuje e-mailom + heslom.
 *   2. Login: e-mail + heslo → PBKDF2 overenie → podpísaná session cookie (30 dní).
 *
 * Úložisko: NEROBÍME migráciu schémy. Heslo aj reset tokeny žijú v existujúcej
 * tabuľke `VerificationToken` (identifier + token + expires):
 *   - `pw:<email>`     → PBKDF2 hash hesla (expires = ďaleká budúcnosť)
 *   - `reset:<email>`  → SHA-256 hash jednorazového reset tokenu (expires +30 min)
 * Všetko edge-writeable cez Prisma + Neon HTTP driver.
 *
 * Heslá: PBKDF2-SHA256, 210 000 iterácií, náhodná 16B soľ (OWASP 2023+).
 * Session: HMAC-SHA256 cookie podpísaná AUTH_SECRET, žiadny stav na serveri.
 */

import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE = "epx_admin";
const SESSION_DAYS = 30;
const RESET_MINUTES = 30;
const PBKDF2_ITERS = 210_000;
const MIN_PASSWORD_LEN = 8;
// „nekonečná" expirácia pre heslo (VerificationToken.expires je NOT NULL).
const PW_EXPIRES = new Date("2099-01-01T00:00:00Z");

// ─── kódovanie ──────────────────────────────────────────────────────────
function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ─── admin e-maily ──────────────────────────────────────────────────────
/** Všetky oprávnené admin e-maily z ADMIN_EMAILS (comma-separated). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
/** Prvý (predvolený) admin e-mail — kam chodia reset odkazy. */
export function adminEmail(): string | null {
  return adminEmails()[0] ?? null;
}
export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

// ─── heslá (PBKDF2) ─────────────────────────────────────────────────────
async function pbkdf2(password: string, salt: BufferSource, iters: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: iters, hash: "SHA-256" },
    key,
    256,
  );
  return b64url(new Uint8Array(bits));
}

/** Vyrobí `pbkdf2$<iters>$<salt>$<hash>` string. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERS);
  return `pbkdf2$${PBKDF2_ITERS}$${b64url(salt)}$${hash}`;
}

/** Overí heslo proti uloženému stringu (konštantný čas). */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterStr, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterStr || !saltB64 || !hashB64) return false;
  const iters = Number(iterStr);
  if (!Number.isFinite(iters) || iters < 1) return false;
  const got = await pbkdf2(password, fromB64url(saltB64) as BufferSource, iters);
  return timingSafeEqual(got, hashB64);
}

export function passwordProblem(password: string): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LEN) {
    return `Heslo musí mať aspoň ${MIN_PASSWORD_LEN} znakov.`;
  }
  if (password.length > 200) return "Heslo je príliš dlhé.";
  return null;
}

// ─── úložisko hesla vo VerificationToken ────────────────────────────────
const pwId = (email: string) => `pw:${email.trim().toLowerCase()}`;
const resetId = (email: string) => `reset:${email.trim().toLowerCase()}`;

export async function getPasswordHash(email: string): Promise<string | null> {
  const row = await prisma.verificationToken.findFirst({
    where: { identifier: pwId(email) },
    select: { token: true },
  });
  return row?.token ?? null;
}

export async function setPassword(email: string, password: string): Promise<void> {
  const hash = await hashPassword(password);
  const id = pwId(email);
  await prisma.verificationToken.deleteMany({ where: { identifier: id } });
  await prisma.verificationToken.create({
    data: { identifier: id, token: hash, expires: PW_EXPIRES },
  });
}

export async function hasPassword(email: string): Promise<boolean> {
  return (await getPasswordHash(email)) != null;
}

// ─── reset tokeny ───────────────────────────────────────────────────────
async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vyrobí jednorazový reset token, uloží jeho hash, vráti RAW token do e-mailu. */
export async function createResetToken(email: string): Promise<string> {
  const raw = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const id = resetId(email);
  await prisma.verificationToken.deleteMany({ where: { identifier: id } });
  await prisma.verificationToken.create({
    data: {
      identifier: id,
      token: await sha256Hex(raw),
      expires: new Date(Date.now() + RESET_MINUTES * 60_000),
    },
  });
  return raw;
}

/** Overí a SPOTREBUJE reset token (jednorazový). */
export async function consumeResetToken(email: string, raw: string): Promise<boolean> {
  const id = resetId(email);
  const row = await prisma.verificationToken.findFirst({ where: { identifier: id } });
  if (!row) return false;
  const valid = row.expires > new Date() && timingSafeEqual(row.token, await sha256Hex(raw));
  // token je jednorazový — zmažeme ho po pokuse (aj neúspešnom, proti brute-force)
  await prisma.verificationToken.deleteMany({ where: { identifier: id } });
  return valid;
}

// ─── session cookie (HMAC, bezstavová) ──────────────────────────────────
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

export async function createSession(): Promise<{ value: string; maxAge: number }> {
  const exp = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
  const sig = await hmac(`session:${exp}`);
  return { value: `${exp}.${sig}`, maxAge: SESSION_DAYS * 24 * 3600 };
}

export async function verifySession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now()) return false;
  try {
    return timingSafeEqual(await hmac(`session:${exp}`), sig);
  } catch {
    return false;
  }
}
