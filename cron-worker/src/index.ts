/**
 * Cloudflare Cron Worker — epoxidovo lead follow-up
 *
 * Spúšťa sa každý deň o 9:00 SK leto / 10:00 SK zima (8:00 UTC), zavolá
 * Pages API endpoint ktorý posiela follow-up emaily.
 *
 * Logika je v Pages (/api/cron/lead-followup) — tento worker je len trigger
 * s authentikáciou cez shared secret.
 */

export interface Env {
  CRON_SECRET: string;
  CRON_TARGET_URL: string; // denný follow-up: "https://epoxidovo.sk/api/cron/lead-followup"
  // Automatická CP (user 2026-08-27) — každých 5 min, aby CP odišla aj v noci
  // a cez víkend (dovtedy bežala len keď mal niekto CRM otvorený).
  AUTOCP_TARGET_URL?: string; // "https://app.najcrm.sk/api/cron/auto-cp"
  AUTOCP_SECRET?: string;     // = CRM CRON_SECRET (X-Cron-Secret header)
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    // Dva rozvrhy v jednom workeri — rozlíšime podľa cron patternu:
    //   "0 8 * * *"   → denný lead follow-up (Pages)
    //   "*/5 * * * *" → automatická CP splatná (~5 min po dopyte, CRM)
    if (event.cron === "*/5 * * * *") {
      ctx.waitUntil(runAutoCp(env));
    } else {
      ctx.waitUntil(runFollowup(env));
    }
  },

  // Manuálny trigger — VYŽADUJE Bearer auth (rovnaký secret ako cron).
  // curl -H "Authorization: Bearer $CRON_SECRET" https://<worker>.workers.dev/run
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/run") {
      // Auth check — bez secret-u nikto nemôže ručne spustiť cron.
      const authHeader = req.headers.get("authorization") ?? "";
      if (!constantTimeEqual(authHeader, `Bearer ${env.CRON_SECRET ?? ""}`)) {
        return new Response("unauthorized", { status: 401 });
      }
      const result = await runFollowup(env);
      return Response.json(result);
    }
    return new Response("epoxidovo cron worker — POST /run with Bearer auth to trigger", {
      status: 200,
    });
  },
};

/** Konštantný-časový string compare (timing-safe). */
function constantTimeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

async function runAutoCp(env: Env): Promise<{ ok: boolean; status?: number; body?: unknown; error?: string }> {
  const target = env.AUTOCP_TARGET_URL;
  const secret = env.AUTOCP_SECRET;
  if (!target || !secret) {
    // Nie je nakonfigurované → ticho preskoč (nezhadzuj follow-up worker).
    return { ok: false, error: "autocp_not_configured" };
  }
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "X-Cron-Secret": secret, "Content-Type": "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    console.log(`[cron-worker] auto-cp target=${target} status=${res.status}`, body);
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[cron-worker] auto-cp fetch failed:", msg);
    return { ok: false, error: msg };
  }
}

async function runFollowup(env: Env): Promise<{ ok: boolean; status?: number; body?: unknown; error?: string }> {
  const target = env.CRON_TARGET_URL;
  const secret = env.CRON_SECRET;
  if (!target || !secret) {
    console.error("[cron-worker] CRON_TARGET_URL alebo CRON_SECRET chýba");
    return { ok: false, error: "missing_env" };
  }

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
    });
    const body = await res.json().catch(() => ({}));
    console.log(`[cron-worker] target=${target} status=${res.status}`, body);
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[cron-worker] fetch failed:", msg);
    return { ok: false, error: msg };
  }
}
