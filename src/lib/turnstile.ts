/**
 * Server-side Turnstile token verifier.
 *
 * Volá CF Turnstile siteverify API a vráti true ak token je platný.
 * Bez TURNSTILE_SECRET_KEY (dev) vráti true (bypass).
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Bez secret kľúča:
  //  - v PRODUKCII: fail-closed (odmietame request) — bráni boti spamovať
  //    keby sa nedopatrením vymazal env var v CF Pages dashboarde.
  //  - v DEVE: bypass (prepustíme) — vývojár nemá Turnstile pre localhost.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[turnstile] FATAL: TURNSTILE_SECRET_KEY missing in production — refusing request",
      );
      return { ok: false, reason: "secret_missing_in_prod" };
    }
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY not set — dev bypass (NOT for production)",
    );
    return { ok: true };
  }

  if (!token || token === "dev-bypass") {
    return { ok: false, reason: "missing_token" };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.append("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );

    if (!res.ok) {
      return { ok: false, reason: `verify_failed_${res.status}` };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return {
        ok: false,
        reason: data["error-codes"]?.join(",") ?? "rejected",
      };
    }

    return { ok: true };
  } catch (err) {
    console.error("[turnstile] verify error:", err);
    return { ok: false, reason: "exception" };
  }
}
