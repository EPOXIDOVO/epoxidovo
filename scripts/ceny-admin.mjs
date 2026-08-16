/**
 * Lokálny zapisovač cien pre /admin/ceny.
 *
 * CF Pages (produkcia) nemá zapisovateľný disk, preto úprava cien beží len
 * na localhoste: stránka /admin/ceny POSTne nový override sem a tento server
 * ho zapíše do src/content/ceny-override.json. Next dev si zmenu prevezme
 * po refreshi; do produkcie ide commit + push.
 *
 * Štartuje sa spolu s `npm run dev` (viď package.json). Žiadne závislosti.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 8798;
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILE = path.join(ROOT, "src/content/ceny-override.json");
const LAYOUT = path.join(ROOT, "src/content/eshop-layout.json");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method === "GET" && req.url === "/ping") {
    res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.method === "POST" && req.url === "/layout") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        for (const k of ["sekcie", "skryteSekcie", "dlazdice", "skryteDlazdice"]) {
          if (!Array.isArray(parsed[k]) || !parsed[k].every((x) => typeof x === "string")) {
            throw new Error(`neplatné pole ${k}`);
          }
        }
        const out = {
          _komentar:
            "Poradie a viditeľnosť blokov e-shopu — upravuje sa v admin režime (/eshop?admin=1), ukladá lokálny zapisovač.",
          sekcie: parsed.sekcie,
          skryteSekcie: parsed.skryteSekcie,
          dlazdice: parsed.dlazdice,
          skryteDlazdice: parsed.skryteDlazdice,
        };
        fs.writeFileSync(LAYOUT, JSON.stringify(out, null, 1) + "\n");
        res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        console.log("[ceny-admin] layout uložený");
      } catch (e) {
        res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: String(e.message ?? e) }));
      }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/save") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed !== "object" || typeof parsed.ceny !== "object") {
          throw new Error("očakávam { ceny: { SKU: number } }");
        }
        for (const [sku, cena] of Object.entries(parsed.ceny)) {
          if (typeof cena !== "number" || !isFinite(cena) || cena <= 0) {
            throw new Error(`neplatná cena pre ${sku}`);
          }
        }
        const out = {
          _komentar:
            "Ručné ceny e-shopu (s DPH, konečné) — prepíšu cenu z CRM importu. Upravuj cez /admin/ceny.",
          ceny: Object.fromEntries(
            Object.entries(parsed.ceny).sort(([a], [b]) => a.localeCompare(b)),
          ),
        };
        fs.writeFileSync(FILE, JSON.stringify(out, null, 1) + "\n");
        res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, pocet: Object.keys(parsed.ceny).length }));
        console.log(`[ceny-admin] uložených ${Object.keys(parsed.ceny).length} cien`);
      } catch (e) {
        res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: String(e.message ?? e) }));
      }
    });
    return;
  }
  res.writeHead(404, CORS);
  res.end();
});

server.on("error", (e) => {
  // druhá inštancia dev servera — admin už beží, ticho skonči
  if (e.code === "EADDRINUSE") process.exit(0);
  console.error("[ceny-admin]", e.message);
});
server.listen(PORT, "127.0.0.1", () =>
  console.log(`[ceny-admin] zapisovač cien beží na http://localhost:${PORT}`),
);
