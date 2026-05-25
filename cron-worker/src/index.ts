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
  CRON_TARGET_URL: string; // napr. "https://epoxidovo.sk/api/cron/lead-followup"
}

export default {
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(runFollowup(env));
  },

  // Manuálny trigger pre testovanie: curl https://<worker>.workers.dev/run
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/run") {
      const result = await runFollowup(env);
      return Response.json(result);
    }
    return new Response("epoxidovo cron worker — POST /run to trigger manually", {
      status: 200,
    });
  },
};

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
