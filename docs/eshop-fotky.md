# E-shop — fotky produktov (TODO)

Stav k 2026-08: všetkých 202 produktov beží na **jednotných placeholderoch**
(farba podľa kategórie + emoji + badge výrobcu). Oficiálne produktovky sa
nedali zohnať hromadne bez porušenia licencií — z cudzích e-shopov obrázky
zámerne NEberieme (cudzí obsah).

## Ako doplniť reálnu fotku produktu

1. Zožeň fotku z oficiálneho zdroja:
   - **Sika**: https://svk.sika.com (produktové stránky) alebo Sika media
     centrum — pri každej fotke over podmienky použitia pre dealerov
   - **TopStone**: https://www.topstone.cz — sekcia na stiahnutie /
     požiadať priamo distribútora (HA-UZ) o produktové fotky
2. Ulož do `public/images/eshop/<SKU>.jpg` (alebo .webp)
3. Do `src/content/materialy.json` pri produkte doplň:
   ```json
   "foto": "/images/eshop/SIKAFLOOR-264-30.webp",
   "foto_zdroj": "svk.sika.com — produktová stránka Sikafloor-264",
   "foto_licencia": "dealerské použitie povolené (email potvrdenie 2026-08-20)"
   ```
4. Import script `scripts/import-materialy.mjs` tieto tri polia **zachováva**
   pri ďalšom CRM re-importe — nemusíš ich dopĺňať znova.

> UI zatiaľ `foto` pole nerenderuje (placeholder je hardcoded) — keď pribudnú
> prvé reálne fotky, treba v `EshopClient.tsx` + `eshop/[sku]/page.tsx`
> podmieniť `m.foto ? <Image .../> : <placeholder/>`.

## Referenčné fotky hotovej podlahy

Na detailoch hlavných vrstiev sa zobrazujú **vlastné fotky realizácií**
(zdroj: náš web, licencia: vlastné dielo EPOXIDOVO):

| typ | súbor |
|---|---|
| jednofarebná | `/images/hero/byvanie-v2.webp` |
| chipsová | `/images/categories/chipsove.jpg` |
| metalická | `/images/categories/metalicke.jpg` |

Mapovanie je heuristické podľa názvu produktu (`referencnaFotka()` v
`src/lib/materialy.ts`) — pole `typy_podlah` je v CRM exporte zatiaľ prázdne.
Keď ho CRM začne plniť, prepnúť mapovanie na dáta.

## Re-import cien / produktov

```bash
node scripts/import-materialy.mjs ~/Downloads/epoxidovo-materialy-na-web.json
```

Zdroj pravdy je CRM (`/admin/materialy`). Pevné ceny (`cena_pevna: true` —
SIKAFLOOR-264-30 za 295 €, SIKAFLOOR-151 za 239 €) script kontroluje proti
metadátam exportu a nikdy neprepočítava.
