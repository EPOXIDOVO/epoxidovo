# Epoxidovo Cron Worker

Cloudflare Worker s **Cron Trigger** ktorý každý deň o 8:00 UTC (10:00 SK leto / 9:00 SK zima) zavolá `https://epoxidovo.sk/api/cron/lead-followup` a spustí posielanie follow-up emailov leadom čo 3× nedvíhali.

## Architektúra

```
┌──────────────────────────┐         ┌──────────────────────────┐
│  Cloudflare Cron Worker  │  POST   │  Pages /api/cron/...    │
│  (this folder)           │ ──────► │  Bearer <CRON_SECRET>    │
│  schedule: 0 8 * * *     │         │  Prisma + Resend         │
└──────────────────────────┘         └──────────────────────────┘
```

## Prvý deploy

```bash
cd cron-worker

# 1. Inštaluj wrangler + types
npm install

# 2. Login do Cloudflare (otvorí browser, autorizuj)
npx wrangler login

# 3. Nastav secret CRON_SECRET (zhodný s Pages env premennou)
#    Vygeneruj náhodný 32-char token:
#    node -e "console.log(crypto.randomBytes(24).toString('base64url'))"
npx wrangler secret put CRON_SECRET
# → vloží sa rovnaký token aj do Cloudflare Pages env vars
#   (Pages → epoxidovoweb → Settings → Environment variables → Production → CRON_SECRET)

# 4. Deploy
npm run deploy
```

## Manuálny trigger (pre testovanie)

Worker má aj `fetch` handler — po deploy môžeš trigger spustiť ručne:

```bash
curl https://epoxidovo-cron.<your-cf-subdomain>.workers.dev/run
```

Vráti JSON s počtom poslaných emailov (`{"ok":true,"status":200,"body":{...}}`).

## Lokálny vývoj

```bash
# Lokálny dev server na :8787
npm run dev

# Otestuj scheduled handler bez čakania na cron:
curl http://localhost:8787/__scheduled?cron=0+8+*+*+*
```

## Zmena času spúšťania

Edituj `wrangler.toml` → `[triggers] crons = ["..."]`. Format = klasický cron (https://crontab.guru).

Po zmene: `npm run deploy`.

## Logy

```bash
npm run tail
```

Live stream logov z Workera (vidíš každé spustenie).
