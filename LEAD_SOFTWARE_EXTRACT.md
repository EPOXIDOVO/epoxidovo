# Lead Software → standalone projekt (extraction guide)

> **Účel:** Tento dokument je manifest pre presun "Lead Software" (call agent CRM) z monorepo Epoxidovo do samostatného projektu. Vytvorené 2026-05-25. Cieľ: budú ho používať call agenti Epoxidova, ale neskôr ho ponúknuť aj iným firmám ako SaaS.
>
> **Použitie v ďalšej Claude session:** "Pomocou `LEAD_SOFTWARE_EXTRACT.md` v `/Users/puska/epoxidovo/` extrahuj lead software do nového projektu v `/Users/puska/leady-software/`. Postupuj presne podľa manifestu."

---

## 📁 Štruktúra cieľového projektu

```
/Users/puska/leady-software/
├── prisma/
│   └── schema.prisma                  # Lead + User + Account + Session
├── src/
│   ├── app/
│   │   ├── (dashboard)/               # ← bývalé /leady/(dashboard)
│   │   │   ├── page.tsx               # main dashboard s 5 tabmi
│   │   │   └── layout.tsx             # auth check
│   │   ├── login/                     # ← bývalé /leady/login
│   │   │   └── page.tsx               # OTP login UI
│   │   ├── admin/
│   │   │   ├── agents/                # správa agentov
│   │   │   │   └── page.tsx
│   │   │   └── login/
│   │   │       └── page.tsx           # admin OTP login
│   │   ├── api/
│   │   │   ├── lead/
│   │   │   │   ├── route.ts           # POST nová lead (webhook from external sites)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts       # PATCH/DELETE lead
│   │   │   │       └── missed-call/route.ts
│   │   │   ├── admin/
│   │   │   │   └── agents/route.ts
│   │   │   └── cron/
│   │   │       └── lead-followup/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                   # landing page (možno marketing /sales)
│   ├── components/
│   │   ├── leady/
│   │   │   ├── LeadCard.tsx
│   │   │   └── LoginButtons.tsx
│   │   └── admin/
│   │       └── AgentsManager.tsx
│   └── lib/
│       ├── auth.ts                    # NextAuth config
│       └── prisma.ts                  # Prisma client (edge-compat)
├── cron-worker/                       # Cloudflare Cron Worker
│   ├── src/index.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.local                          # DATABASE_URL, RESEND_API_KEY, AUTH_SECRET, CRON_SECRET
```

---

## 📋 Súbory na presun (z Epoxidovo → leady-software)

### Routes
- `src/app/leady/(dashboard)/page.tsx` → `src/app/(dashboard)/page.tsx`
- `src/app/leady/(dashboard)/layout.tsx` → `src/app/(dashboard)/layout.tsx`
- `src/app/leady/login/page.tsx` → `src/app/login/page.tsx`
- `src/app/admin/agents/page.tsx` → `src/app/admin/agents/page.tsx`
- `src/app/admin/login/page.tsx` → `src/app/admin/login/page.tsx` (môže byť rovnaký ako /login)

### API
- `src/app/api/lead/route.ts` → `src/app/api/lead/route.ts` (POST endpoint, pre webhook z externých webov)
- `src/app/api/lead/[id]/route.ts` → `src/app/api/lead/[id]/route.ts`
- `src/app/api/lead/[id]/missed-call/route.ts` → `src/app/api/lead/[id]/missed-call/route.ts`
- `src/app/api/admin/agents/route.ts` → `src/app/api/admin/agents/route.ts`
- `src/app/api/cron/lead-followup/route.ts` → `src/app/api/cron/lead-followup/route.ts`

### Components
- `src/components/leady/LeadCard.tsx`
- `src/components/leady/LoginButtons.tsx`
- `src/components/admin/AgentsManager.tsx`

### Lib
- `src/lib/auth.ts` — NextAuth setup (OTP cez Resend)
- `src/lib/prisma.ts` — lazy Prisma + Neon adapter
- `src/lib/utils.ts` — cn() helper

### Cron worker (samostatný subprojekt)
- Celý folder `cron-worker/` → `cron-worker/` v novom projekte

### Prisma schema
- Vytvor novú `prisma/schema.prisma` s týmito modelmi (skopíruj z `/Users/puska/epoxidovo/prisma/schema.prisma`):
  - `Lead` — celý model so všetkými fieldmi (failedCallCount, nextCallAt, followupSentAt, atď.)
  - `User` — pre NextAuth + agent management
  - `Account` — NextAuth
  - `Session` — NextAuth
  - `VerificationToken` — pre OTP

---

## 📦 Závislosti (package.json)

```json
{
  "dependencies": {
    "next": "15.5.2",
    "react": "^19",
    "react-dom": "^19",
    "@prisma/client": "^7",
    "@prisma/adapter-neon": "^7",
    "@neondatabase/serverless": "^1",
    "next-auth": "5.0.0-beta.x",
    "@auth/prisma-adapter": "latest",
    "resend": "^4",
    "lucide-react": "latest",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "typescript": "^5",
    "tailwindcss": "^3.4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "prisma": "^7",
    "eslint": "^9",
    "@cloudflare/next-on-pages": "^1.13"
  }
}
```

---

## 🔐 Environment variables

```bash
# .env.local
DATABASE_URL=postgresql://...@neon.tech/...
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://leady.your-domain.com
RESEND_API_KEY=re_...
EMAIL_FROM="Lead Software <noreply@your-domain.com>"
CRON_SECRET=<openssl rand -base64 24>
ADMIN_EMAILS=info@epoxidovo.sk,other@example.com
```

---

## 🌐 Deployment

### Option A — Subdoména pre Epoxidovo
- Doména: `leady.epoxidovo.sk`
- DNS: CNAME → cloudflare-pages-project.pages.dev
- Cloudflare Pages: nový projekt `leady-software`
- DB: zdieľaná s Epoxidovo Neon DB (jedna `Lead` tabuľka)

### Option B — Standalone produkt (SaaS budúcnosť)
- Vlastná doména: `app.leadflow.sk` alebo podobne
- Cloudflare Pages: vlastný projekt
- DB: vlastná Neon inštancia (multi-tenant ready)
- Pridať: Stripe billing, multi-tenant schema (Organization, Membership)

---

## 🔄 Migration steps (pre novú Claude session)

1. **Vytvor projekt:**
   ```bash
   cd /Users/puska
   npx create-next-app@latest leady-software --typescript --tailwind --app --turbopack
   cd leady-software
   ```

2. **Inštaluj závislosti:**
   ```bash
   npm install @prisma/client@latest @prisma/adapter-neon @neondatabase/serverless \
     next-auth@beta @auth/prisma-adapter resend lucide-react clsx tailwind-merge zod
   npm install -D prisma @cloudflare/next-on-pages
   ```

3. **Skopíruj súbory** podľa zoznamu vyššie. Použi `cp -R /Users/puska/epoxidovo/src/app/leady/* src/app/(dashboard)/` atď.

4. **Aktualizuj importy** — zo starých ciest (napr. `@/lib/site`, `@/lib/prisma`) na nové. Niektoré závislosti (napr. `@/lib/site`) z Epoxidovo nepotrebuješ — odstráň ich.

5. **Prisma schema** — skopíruj len Lead + User + Account + Session + VerificationToken modely.

6. **Spusti Prisma generate:**
   ```bash
   npx prisma generate
   npx prisma db push   # ak zdieľame DB, len overí; inak vytvorí tabuľky
   ```

7. **NextAuth setup** — aktualizuj `auth.ts` na novú doménu (`AUTH_URL`, cookie config).

8. **Deploy:**
   ```bash
   npm run build
   npx wrangler pages deploy .vercel/output/static --project-name=leady-software
   ```

9. **DNS:** v Cloudflare DNS pridaj CNAME `leady.epoxidovo.sk` → `leady-software.pages.dev`.

10. **Test:** Otvor `https://leady.epoxidovo.sk/login`, prihlás sa cez OTP, over že vidíš leady z Epoxidovo DB.

---

## 🧹 Po úspešnom presune — cleanup v Epoxidovo

Až keď bude leady-software bežať a tvoji agenti tam vedia loginovať, môžeš v Epoxidovo:

1. Vymazať frontend (Claude session): `src/app/leady`, `src/app/admin/agents`, `src/components/leady`, `src/components/admin/AgentsManager.tsx`, `src/app/api/lead/[id]/*`, `src/app/api/admin/agents`, `src/app/api/cron`, `cron-worker/`
2. **NEMAZAŤ:** `src/app/api/lead/route.ts` (POST endpoint pre website form) — alebo prepíš na webhook ktorý posiela leady do leady-software cez HTTP.
3. **DB schema (Lead model):** NECHAŤ ako je. Tabuľka stále príma leady z webu. Ak je leady-software v rovnakom Neon DB, číta priamo. Ak má vlastný DB, robí periodic sync.

---

## 💡 Rozhodnutia ktoré treba urobiť

| Rozhodnutie | Možnosti | Odporúčanie |
|---|---|---|
| **Doména** | `leady.epoxidovo.sk` vs `vlastna.sk` | `leady.epoxidovo.sk` pre štart |
| **DB** | Zdieľaná s Epoxidovo vs vlastná | Zdieľaná v MVP, neskôr separate |
| **Auth** | OTP cez Resend (ako teraz) vs Google/Apple SSO | OTP — netreba meniť |
| **Brand** | Epoxidovo branding vs vlastný brand | Vlastný — bude to budúci SaaS produkt |
| **Multi-tenant** | Single-tenant teraz vs multi-tenant na začiatok | Single, refactor neskôr |

---

## 📞 Po prerobení — workflow Epoxidovo agentov

1. Lead príde z `epoxidovo.sk/cenova-ponuka` → POST `/api/lead`
2. POST endpoint v Epoxidovo zapíše do **zdieľanej DB** (alebo pošle webhook do leady-software)
3. Agent sa prihlasi na `leady.epoxidovo.sk` (alebo `app.leadflow.sk`)
4. Vidí nové leady, volá, mení status — všetko cez nový samostatný projekt
5. Epoxidovo web zostáva čistý — len marketing + intake form

---

**Vytvorené:** 2026-05-25
**Zdroj:** `/Users/puska/epoxidovo/` commit `daa73de`
**Cieľ:** `/Users/puska/leady-software/`
