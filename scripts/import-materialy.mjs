#!/usr/bin/env node
/**
 * Import materiálov z CRM exportu do webu.
 *
 * Zdroj pravdy je NajCRM (/admin/materialy). Tento script sa dá spustiť
 * opakovane — pri novom exporte prepíše ceny aj produkty:
 *
 *   node scripts/import-materialy.mjs [cesta-k-exportu.json]
 *   (default: ~/Downloads/epoxidovo-materialy-na-web.json)
 *
 * Robí:
 *  - validáciu povinných polí + unikátnosti a URL-safe tvaru SKU
 *  - kontrolu pevných cien (cena_pevna=true sa NIKDY neprepočítava,
 *    len preberá — SIKAFLOOR-264-30 a SIKAFLOOR-151 sú ručne podľa trhu)
 *  - zachová manuálne doplnené foto polia (foto, foto_zdroj, foto_licencia)
 *    z existujúceho src/content/materialy.json, ak ich export nemá
 *  - zápis do src/content/materialy.json (commitované, buildí sa z neho)
 *
 * Ceny sa NEPREPOČÍTAVAJÚ — sú finálne (firma je neplatiteľ DPH, marža
 * 26,5 % už započítaná v CRM). Nikde na webe nepíšeme „bez DPH".
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SRC =
  process.argv[2] ??
  path.join(os.homedir(), "Downloads", "epoxidovo-materialy-na-web.json");
const DEST = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "src",
  "content",
  "materialy.json",
);

const KATEGORIE = ["Penetrácia", "Hlavná vrstva", "Vrchný lak", "Doplnok"];
const VYROBCOVIA = ["Sika", "TopStone"];
const SKU_RE = /^[A-Za-z0-9._\-]+$/;

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
const produkty = raw.produkty ?? raw;
if (!Array.isArray(produkty) || produkty.length === 0) {
  console.error("✗ Export neobsahuje pole `produkty`.");
  process.exit(1);
}

// Foto polia z predchádzajúceho importu (manuálne dopĺňané) — nech ich
// nový export nezmaže.
let prevFoto = new Map();
if (fs.existsSync(DEST)) {
  try {
    const prev = JSON.parse(fs.readFileSync(DEST, "utf8"));
    for (const p of prev.produkty ?? []) {
      if (p.foto || p.foto_zdroj || p.foto_licencia) {
        prevFoto.set(p.sku, {
          foto: p.foto ?? null,
          foto_zdroj: p.foto_zdroj ?? null,
          foto_licencia: p.foto_licencia ?? null,
        });
      }
    }
  } catch {
    /* prvý import */
  }
}

const errors = [];
const seen = new Set();
for (const p of produkty) {
  if (!p.sku || !SKU_RE.test(p.sku)) errors.push(`SKU chýba/neplatné: ${JSON.stringify(p.sku)}`);
  if (seen.has(p.sku)) errors.push(`Duplicitné SKU: ${p.sku}`);
  seen.add(p.sku);
  if (!p.nazov) errors.push(`${p.sku}: chýba nazov`);
  if (!VYROBCOVIA.includes(p.vyrobca)) errors.push(`${p.sku}: neznámy vyrobca ${p.vyrobca}`);
  if (!KATEGORIE.includes(p.kategoria)) errors.push(`${p.sku}: neznáma kategoria ${p.kategoria}`);
  if (typeof p.cena_eur_s_dph !== "number" || p.cena_eur_s_dph <= 0)
    errors.push(`${p.sku}: neplatná cena ${p.cena_eur_s_dph}`);
}
if (errors.length) {
  console.error("✗ Validácia zlyhala:");
  for (const e of errors.slice(0, 20)) console.error("  -", e);
  process.exit(1);
}

// Pevné ceny — sanity check proti metadátam exportu
const pevneMeta = raw.cenotvorba?.pevne_ceny ?? {};
for (const [sku, cena] of Object.entries(pevneMeta)) {
  const p = produkty.find((x) => x.sku === sku);
  if (!p) { console.warn(`⚠ pevná cena pre neexistujúce SKU ${sku}`); continue; }
  if (!p.cena_pevna) errors.push(`${sku}: v metadátach pevná, v dátach cena_pevna=false`);
  if (p.cena_eur_s_dph !== cena)
    errors.push(`${sku}: pevná cena nesedí (export ${p.cena_eur_s_dph} ≠ meta ${cena})`);
}
if (errors.length) {
  console.error("✗ Kontrola pevných cien zlyhala:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}

const out = {
  vygenerovane: raw.vygenerovane ?? new Date().toISOString().slice(0, 10),
  zdroj: raw.zdroj ?? "NajCRM sika_catalog (app.najcrm.sk)",
  cenotvorba: raw.cenotvorba ?? null,
  pocet: produkty.length,
  produkty: produkty.map((p) => ({
    ...p,
    ...(prevFoto.get(p.sku) ?? { foto: p.foto ?? null, foto_zdroj: p.foto_zdroj ?? null, foto_licencia: p.foto_licencia ?? null }),
  })),
};

fs.writeFileSync(DEST, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`✓ Import OK — ${produkty.length} produktov → ${path.relative(process.cwd(), DEST)}`);
console.log(`  snímka: ${out.vygenerovane}, pevné ceny: ${Object.keys(pevneMeta).join(", ") || "—"}`);
console.log(`  zachované foto polia: ${prevFoto.size}`);
