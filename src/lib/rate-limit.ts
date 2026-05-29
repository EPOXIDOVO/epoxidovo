/**
 * In-memory sliding-window rate limiter pre Cloudflare Pages edge runtime.
 *
 * Limity:
 *   - per IP + endpoint key
 *   - sliding window: ak posledné N requestov za window prekročia limit → block
 *
 * Pozn.: V edge runtime každý isolate má vlastnú Map. Cloudflare drží warm
 * instance pre opakované requesty z rovnakej oblasti, takže reálne to kryje
 * 95%+ realistických útokov. Pre 100% distributed rate limit by sme potrebovali
 * Cloudflare KV / Durable Object — overkill pre náš traffic.
 *
 * Cleanup: každých 5 min sa odmaže expired entries (zabráni memory leaku).
 */

interface Bucket {
  // timestamps of recent requests (ms since epoch), kept sorted ascending
  timestamps: number[];
}

const STORE = new Map<string, Bucket>();
let lastCleanup = 0;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 min

function cleanup(now: number, maxWindow: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - maxWindow;
  for (const [key, bucket] of STORE) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) {
      STORE.delete(key);
    }
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number; // čas v ms kedy sa najstarší request "vyrolluje"
}

export interface RateLimitOptions {
  /** Unikátny kľúč endpoint-u (napr. "lead-submit") */
  key: string;
  /** Identifier klienta — typicky IP adresa */
  identifier: string;
  /** Max počet requestov v okne */
  limit: number;
  /** Veľkosť okna v ms */
  windowMs: number;
}

/**
 * Skontroluj a zarátaj request. Vráti `{ ok: true }` ak je v limite,
 * `{ ok: false }` ak treba blokovať.
 */
export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanup(now, opts.windowMs);

  const bucketKey = `${opts.key}:${opts.identifier}`;
  const bucket = STORE.get(bucketKey) ?? { timestamps: [] };
  const cutoff = now - opts.windowMs;

  // Drop staré timestamps mimo window
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= opts.limit) {
    const oldestInWindow = bucket.timestamps[0];
    const resetMs = oldestInWindow + opts.windowMs - now;
    STORE.set(bucketKey, bucket);
    return { ok: false, remaining: 0, resetMs };
  }

  bucket.timestamps.push(now);
  STORE.set(bucketKey, bucket);
  return {
    ok: true,
    remaining: opts.limit - bucket.timestamps.length,
    resetMs: opts.windowMs,
  };
}

/**
 * Helper: vytiahne IP z requestu (Cloudflare-aware).
 * Fallback na "unknown" — radšej rate limit po IP+anon koš než nič.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
