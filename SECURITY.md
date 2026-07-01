# Security — epoxidovo.sk

## Stav po audite (2026-06-27)

Komprehensívny security audit kompletný. Aplikované fixes:

- **Commit `f481e75`** — SSRF v visualizer, PII leak v CF logoch, CSRF/Origin
  guard na `/api/lead`, email-header injection sanitization, JSON-LD
  `</script>` breakout escape (5 súborov)
- **Commit `8f4fdfd`** — Content-Security-Policy Report-Only, TS strict build
  pipeline (cron-worker excluded z hlavného tsconfig)

### Existing security layers (pre-audit)

- **Headers** (`public/_headers`): X-Frame-Options DENY, HSTS 2y+preload,
  Permissions-Policy, Referrer-Policy strict-origin, X-Content-Type-Options
  nosniff, COOP same-origin-allow-popups, `/api/*` no-cache
- **Turnstile** fail-closed v produkcii
- **Rate limit** 5/20min per IP na `/api/lead`
- **Visualizer multi-layer**: Origin check, Turnstile, IP rate limit (5/24h),
  global cap (30/24h), hardcoded enum slugs (no prompt injection)
- **Honeypot** field na lead forme
- **Disposable email blocker** (648 entries)
- **No raw SQL queries** (Prisma ORM)
- **No admin/auth routes** (čistý public site)

---

## 🗓️ 3-mesačný review checklist — **2026-09-27**

> Otvor tento súbor okolo 27. septembra 2026 a prejdi nasledovný checklist.
> Audit z 27. júna 2026 odporúča druhé kolo zabezpečenia po ~3 mesiacoch.

### 1. CSP Report-Only → enforcing

```bash
curl -sI https://epoxidovo.sk/ | grep -i content-security
```

- [ ] V CF Pages logoch overiť že nie sú žiadne CSP violations za posledné
      týždne
- [ ] Otvoriť stránku v Chrome devtools → Console → reload každú page
      (`/`, `/realizacie`, `/kontakt`, `/cenova-ponuka`, `/ai-vizualizer`,
      `/vzorkovnik`) — žiadne CSP warningy
- [ ] V `public/_headers` prepnúť `Content-Security-Policy-Report-Only`
      na `Content-Security-Policy` (enforcing mode)
- [ ] Commit + push, monitor produkcie 24h

### 2. npm audit + dep updates

```bash
cd /Users/puska/epoxidovo && npm audit
npx npm-check-updates -i
```

- [ ] Update `@cloudflare/next-on-pages`, `next`, `prisma`, `@auth/*` na latest
- [ ] Test build (`npx next build`) + `npx tsc --noEmit`
- [ ] Skontroluj že žiadne nové HIGH/CRITICAL CVEs nezasahujú production
      runtime (dev deps OK)

### 3. CF Pages env vars audit

V CF dashboard (Pages → epoxidovoweb → Settings → Environment Variables → Production):

- [ ] `TURNSTILE_SECRET_KEY` existuje (fail-closed v prod ak chýba)
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` existujú
- [ ] `DATABASE_URL` (Neon Postgres) existuje + funguje
- [ ] `BDSMANAGER_WEBHOOK_URL` + `BDSMANAGER_WEBHOOK_SECRET` existujú
      (forward leadov do CRM)
- [ ] `GEMINI_API_KEY` (visualizer) existuje
- [ ] Žiadne neexpirované — rotácia secrets ak prešlo 6+ mesiacov

### 4. Rate limit metrics

CF dashboard → Pages → epoxidovoweb → Logs:

- [ ] Filter `status:429` za posledných 90 dní
- [ ] Ak >100/deň → upgrade z in-memory na CF KV (`@cloudflare/kv`)
      alebo Durable Objects
- [ ] Ak <10/deň → in-memory stačí (lacnejšie, menej overhead)

### 5. Cloudflare account hardening

- [ ] `info@epoxidovo.sk` CF account má **2FA zapnuté**
- [ ] Ideálne **hardware key (YubiKey)** namiesto SMS
- [ ] Audit logs CF dashboard za posledných 90 dní — žiadne neznáme
      login attempts

### 6. Visualizer abuse review

```sql
-- Neon DB / Prisma Studio
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) FILTER (WHERE ok = true) as success,
  COUNT(*) FILTER (WHERE ok = false) as failed
FROM "VisualizerGeneration"
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY day ORDER BY day DESC;
```

- [ ] Koľko reálnych úspešných generácií / mesiac → posúdiť cenu
      ($0.067/gen × N)
- [ ] Ak >300/mesiac (>$20) → zníž `GLOBAL_DAILY_CAP` v
      `src/app/api/visualizer/generate/route.ts`
- [ ] Ak prevažujú failed (rate-limited) → zvážiť CAPTCHA hardening alebo
      strict per-IP limit

### 7. Bonus — Cloudflare Bot Fight Mode

CF dashboard → epoxidovo.sk zone → Security → Bots:

- [ ] Bot Fight Mode = ON (Free tier)
- [ ] Super Bot Fight Mode = ON (ak je business plan, blokuje known bots)
- [ ] Email summary alerts zapnuté

### 8. Pridané features za 3 mesiace?

Ak medzi 2026-06-27 a 2026-09-27 pribudli nové:

- **API endpoints** → urob mini-audit (Origin check? Rate limit? Validation?)
- **Formuláre** → Turnstile, validation, honeypot
- **Third-party scripts** → pridať do CSP allowlist
- **Admin/auth routes** → posúdiť auth model

---

## Reportovanie security issues

Ak niekto nájde vulnerability v epoxidovo.sk:
- Email: `info@epoxidovo.sk` (subject prefix `[SECURITY]`)
- Žiadne public disclosure pred fixom
- Response SLA: 7 dní

---

**Last updated:** 2026-06-27
**Audit commits:** `f481e75`, `8f4fdfd`
**Next review:** 2026-09-27 (tento súbor obsahuje checklist)
