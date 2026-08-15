# EPOXIDOVO — Design System (e-shop + hlavný web + budúci landing)

Zdroj pravdy pre vizuál a interakcie. Tokeny žijú v `src/app/globals.css`
(@theme blok); tento dokument vysvetľuje PREČO a KEDY.

## Farby

| token | hodnota | použitie |
|---|---|---|
| `--color-fg` | `#0e1a3b` | navy — nadpisy, tmavé karty, footer súčtov |
| `--color-brand` | `#3db6e8` | cyan z loga — sekundárne CTA, aktívne stavy, linky |
| `--color-brand-deep` | `#1a8cc4` | hover cyanu, text linky na svetlom |
| oranžová | `#f97316` / hover `#ea580c` | PRIMÁRNE akčné CTA (kúpiť, vypočítať) |
| zelená | `#16a34a` / hover `#15803d` | LEN „zavolať / nechám si to spraviť" |
| fialový gradient | `#3db6e8→#a855f7` | LEN AI vizualizácia |
| `--color-copper` | `#b0511d` | teplé sekcie hlavného webu |
| telo e-shopu | `#f7f7f4` | svetlé pozadie sekcií; biela `#fff` pre karty |
| hero tmavé | `#0a0f1e` | navy-čierne hero s noise overlay |

Text na svetlom: telo `#4a5478` (4.6:1 na #f7f7f4 ✓), popisky `#6b7390`
len pre meta text ≥12px bold alebo sekundárne info. Na tmavom: `white/85`
telo, `white/60` len meta.

**Povinná veta pri cenách:** „Dodávateľ nie je platiteľom DPH. Ceny sú
konečné." — pri každom súčte, v košíku a v e-mailoch.

## Typografia

- Rodina: **Manrope** (400–800) + Geist Mono pre kódy/SKU. Žiadna tretia.
- Hero: `clamp(2.1rem, 5.4vw, 4.2rem)`, weight 800, `letter-spacing -0.03em`,
  `text-wrap: balance`.
- Sekčné H2: 2xl→4xl, weight 800. Telo max 65–75ch.
- **Ceny a množstvá vždy `.tnum`** (`font-variant-numeric: tabular-nums`).

## Tvary, tiene, easing

- Radius: karty 24px (`rounded-3xl`), vnorené prvky 16px (`rounded-2xl`),
  CTA vždy pill.
- Tiene: pokojové `0 4px 12px rgba(14,26,59,0.08)`, hover
  `0 18px 44px rgba(14,26,59,0.12–0.14)` + `-translate-y-0.5`.
- Easing: `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)` na všetko.
  Žiadny bounce, žiadny elastic.
- Trvanie: mikro 150–250 ms, reveal 600 ms, step prechod 380 ms.
- Tmavé hero vždy s `.noise-overlay` (SVG turbulence, opacity 0.05) proti
  bandingu gradientov.

## Interakčná vrstva (podpis značky)

Komponenty v `src/components/ui/` — nasadenie jedným importom:

| komponent | čo robí | ako zapnúť |
|---|---|---|
| `<CursorAura />` | bodka + lerp prstenec + oranžovo-modrá aura (soft-light, velocity stretch) + click ripple + magnetika | raz v layoute sekcie |
| `data-magnetic` | element sa priťahuje ku kurzoru (max ~8 px), prstenec ho „obalí" | atribút na CTA |
| `<SpotlightCard tilt>` | spotlight gradient sleduje kurzor (`--mx/--my`), voliteľný 3D tilt max 5° | wrapper karty |
| `<Reveal delay={i*60}>` | IntersectionObserver fade + 12 px posun, stagger | wrapper sekcie/položky |
| `showToast()` + `<Toaster/>` | navy pill toast (košík, potvrdenia) | Toaster raz v layoute |
| `.press-scale` | 0.97 scale pri stlačení | trieda na tlačidle |
| `.slider-aura` | custom range slider s fill gradientom | trieda + `--fill` |

**Tvrdé pravidlá vypínania (neporušovať):**
- `prefers-reduced-motion: reduce` → kurzor, aura, spotlight, reveal, tilt,
  animácie = VYPNUTÉ (CSS aj JS guard).
- `pointer: coarse` (touch) → custom kurzor a tilt vypnuté, natívny kurzor
  ostáva; magnetika sa nespúšťa.
- Kurzor má `pointer-events: none` a z-index 90–92 (pod modálmi z-100);
  inputy/textarey držia natívny text kurzor.
- Všetko beží na transform/opacity + rAF; žiadne layout properties.
- Bez JS je stránka plne funkčná (reveal je enhance-only, obsah sa
  neskrýva pred hydratáciou).

## Z-index škála

obsah 0–10 · sticky lišty 40 · CartBadge 50 · cursor 89–92 · toast 95 ·
modály 100.

## Vrstvy rozpisu (rez podlahou)

Farba bloku vrstvy podľa kategórie produktu: penetrácia `#E3C57E`,
nivelácia `#A8ADB5`, hlavná vrstva `#3db6e8`, vrchný lak `#D9E7F0`,
posyp `#D9B36A`, doplnok `#C4C9CF`. Číslo vrstvy v bloku, „na dopyt"
= žltý badge `bg-amber-100 text-amber-900`.

## Referencie (rešerš 08/2026) a čo z nich preberáme

1. [Magnetic mouse cursor — CODE Barcelona (Awwwards)](https://www.awwwards.com/inspiration/magnetic-mouse-cursor-code-barcelona-for-agencies) → magnetické CTA + prstenec obaľujúci tlačidlo
2. [Mouse pointer spotlight (Awwwards)](https://www.awwwards.com/inspiration/mouse-pointer-spotlight) → aura sledujúca kurzor (my: CSS radial namiesto WebGL)
3. [Pygar — colorful spotlight cursor (Awwwards)](https://www.awwwards.com/inspiration/colorful-spotlight-cursor-animation-pygar) → dvojfarebný oranžovo-modrý mix aury, blend soft-light
4. [Magnetic button — Aiyanna (Awwwards)](https://www.awwwards.com/inspiration/magnetic-button-aiyanna) → limit príťahu ~8 px, expo návrat
5. [Furrow Studio — mask cursor (Awwwards)](https://www.awwwards.com/inspiration/mask-cursor-interaction-and-project-menu) → bodka + oneskorený prstenec (lerp 0.22)
6. **Linear.app** → spotlight border karty cez `--mx/--my`, zdržanlivý product register
7. **Stripe checkout** → tabular-nums cenová typografia, hierarchia checkout formulára
8. **Vercel.com** → tmavé hero + noise/grain overlay proti bandingu
9. **rauno.me** → disciplína mikro-interakcií: rAF, transform-only, reduced-motion
10. **Lusion.co** → velocity stretch kurzora (u nás zoslabený na max 1.27×)

Princípy prevzaté, layouty nie.

## Kedy čo NEpoužiť

- Konfety cez obrazovku, bounce easing, neónové gradienty — nikdy.
- Spotlight/tilt na formulárových kartách checkout-u — formuláre majú byť
  pokojné; efekty patria na marketingové karty (hub, sady, dlaždice).
- Gradient text (`background-clip: text`) — zakázané; výnimka je len
  existujúci hero-vlajkový efekt na /realizacie (legacy, vlastník schválil).
- Glassmorphism len ako existujúce hero bubliny hlavného webu; nič nové.

## Ako nasadiť na hlavný web / landing

```tsx
import { CursorAura } from "@/components/ui/CursorAura";
// v layoute sekcie (alebo root layoute):
<CursorAura />
// na CTA:
<Link data-magnetic className="press-scale ..." />
```
Nič viac. Vypínanie je automatické (touch/reduced-motion).
