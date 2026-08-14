#!/usr/bin/env node
/**
 * Generátor materialy-extra.json — značky od HA-UZ (podlahauz.sk):
 * Arturo + UZIN. Oddelené od CRM importu (import-materialy.mjs), takže
 * CRM re-import ich NIKDY neprepíše.
 *
 * Zdroj cien: VOC cenníky HA-UZ platné od 1.5.2026
 *   - ~/Downloads/VOC Arturo 0526.pdf
 *   - ~/Downloads/VOC UZIN 0526.pdf
 * VOC = naša nákupná cena bez DPH (MOC −30 %), za m.j. (kg/ks/m).
 *
 * Cenotvorba = ROVNAKÁ ako CRM generátor (viď materialy.json metadata):
 *   predaj = nakup_s_dph / (1 − 0,265)
 *   nakup_s_dph = VOC_bez_dph × 1,23
 * Ceny sú KONEČNÉ (firma je neplatiteľ DPH) — nikde nepíšeme „bez DPH".
 *
 * Spustenie: node scripts/import-hauz.mjs
 * Pri novom cenníku uprav VOC hodnoty v tabuľkách nižšie a spusti znova.
 */

import fs from "node:fs";
import path from "node:path";

const DEST = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "src",
  "content",
  "materialy-extra.json",
);

const DPH = 1.23;
const MARZA_DIV = 1 - 0.265;

/** predajná konečná cena za CELÉ balenie */
function cena(vocPerUnit, units) {
  return Math.round(((vocPerUnit * units * DPH) / MARZA_DIV) * 100) / 100;
}

// ── ARTURO ──────────────────────────────────────────────────────────────
// [kod, nazov, balenie_kg|null, m.j. počet, VOC €/m.j., kategoria, spotreba_kg_m2|null, spotreba_poznamka|null, balenie_label|null]
const P = "Penetrácia", H = "Hlavná vrstva", V = "Vrchný lak", D = "Doplnok", N = "Nivelačná hmota";
const ARTURO = [
  ["11808",  "Arturo EP 6200 (25 kg)", 25, 25, 6.67, P, null, "záškrab 0,5–1,3 kg/m²", null],
  ["11935",  "Arturo EP 6200 (10 kg)", 10, 10, 7.48, P, null, "záškrab 0,5–1,3 kg/m²", null],
  ["89557",  "Arturo EP 6650 (7,5 kg)", 7.5, 7.5, 12.42, P, 0.15, "penetrácia 0,075–0,15 kg/m²", null],
  ["89558",  "Arturo EP 6650 (3,75 kg)", 3.75, 3.75, 13.04, P, 0.15, "penetrácia 0,075–0,15 kg/m²", null],
  ["173735", "Arturo EP 6600 (25 kg)", 25, 25, 8.42, P, 0.35, "náter 0,2–0,35 kg/m²; záškrab 0,5–1,3 kg/m²", null],
  ["173736", "Arturo EP 6600 (10 kg)", 10, 10, 9.40, P, 0.35, "náter 0,2–0,35 kg/m²; záškrab 0,5–1,3 kg/m²", null],
  ["173738", "Arturo EP 6600 (2,5 kg)", 2.5, 2.5, 11.80, P, 0.35, "náter 0,2–0,35 kg/m²; záškrab 0,5–1,3 kg/m²", null],
  ["11942",  "Arturo EP 6400 vodivá (8 kg)", 8, 8, 15.97, P, 0.12, "vodivá penetrácia 0,08–0,12 kg/m²", null],
  ["53832",  "Arturo EP 6960 pečatiaca (10 kg)", 10, 10, 23.66, P, 0.5, "pečatiaca penetrácia 0,25–0,5 kg/m²", null],
  ["165448", "Arturo PU 6000 záškrab (25 kg)", 25, 25, 5.97, P, null, "záškrab 0,5–1,3 kg/m²; membrána 3,0–3,5 kg/m²", null],
  ["72668",  "Arturo EP 1851 malta na fabióny (10 kg)", 10, 10, 4.06, D, null, "2,0 kg/bm pri 6 cm výške fabiónu", null],
  ["35633",  "Arturo EP 1500 malta (10 kg)", 10, 10, 3.97, D, null, "2,0 kg/m²/mm", null],
  ["155998", "Arturo EP 2500 liata stierka (25 kg, kat. A)", 25, 25, 7.15, H, null, "1,6 kg/m²/mm; 2 mm: 1,75 kg/m²/mm + kremičité plnivo", null],
  ["155999", "Arturo EP 2500 liata stierka (25 kg, kat. B)", 25, 25, 7.42, H, null, "1,6 kg/m²/mm; 2 mm: 1,75 kg/m²/mm + kremičité plnivo", null],
  ["156002", "Arturo EP 2500 liata stierka (10 kg, kat. A)", 10, 10, 7.78, H, null, "1,6 kg/m²/mm", null],
  ["156003", "Arturo EP 2500 liata stierka (10 kg, kat. B)", 10, 10, 8.26, H, null, "1,6 kg/m²/mm", null],
  ["185153", "Arturo EP 2580 viacúčelová stierka (25 kg, kat. A)", 25, 25, 7.88, H, null, "liata 1,44 kg/m²/mm; náter 0,6–0,7 kg/m²", null],
  ["185155", "Arturo EP 2580 viacúčelová stierka (25 kg, kat. B)", 25, 25, 8.19, H, null, "liata 1,44 kg/m²/mm; náter 0,6–0,7 kg/m²", null],
  ["185156", "Arturo EP 2580 viacúčelová stierka (10 kg, kat. A)", 10, 10, 8.48, H, null, "liata 1,44 kg/m²/mm", null],
  ["185157", "Arturo EP 2580 viacúčelová stierka (10 kg, kat. B)", 10, 10, 9.06, H, null, "liata 1,44 kg/m²/mm", null],
  ["156015", "Arturo EP 2480 ESD podlaha (25 kg)", 25, 25, 7.34, H, null, "1,5 kg/m²/mm, max 3 kg/m²", null],
  ["156022", "Arturo EP 2480 ESD podlaha (10 kg)", 10, 10, 8.04, H, null, "1,5 kg/m²/mm, max 3 kg/m²", null],
  ["156007", "Arturo EP 2490 vodivá ATEX (25 kg)", 25, 25, 9.14, H, null, "2,5 kg/m², max 3,75 kg/m²", null],
  ["156011", "Arturo EP 2490 vodivá ATEX (10 kg)", 10, 10, 9.80, H, null, "2,5 kg/m², max 3,75 kg/m²", null],
  ["155902", "Arturo PU 2060 liata stierka (25 kg, kat. A)", 25, 25, 5.89, H, null, "1,5 kg/m²/mm; tuhoplast (shore-D 60)", null],
  ["155915", "Arturo PU 2060 liata stierka (25 kg, kat. B)", 25, 25, 6.35, H, null, "1,5 kg/m²/mm; tuhoplast (shore-D 60)", null],
  ["155919", "Arturo PU 2060 liata stierka (10 kg, kat. A)", 10, 10, 6.58, H, null, "1,5 kg/m²/mm", null],
  ["155920", "Arturo PU 2060 liata stierka (10 kg, kat. B)", 10, 10, 7.00, H, null, "1,5 kg/m²/mm", null],
  ["155923", "Arturo PU 2060 liata stierka (5 kg)", 5, 5, 7.46, H, null, "1,5 kg/m²/mm", null],
  ["155943", "Arturo PU 2035 flexibilná stierka (25 kg, kat. A)", 25, 25, 5.48, H, null, "1,57 kg/m²/mm; flexibilná (shore-D 30)", null],
  ["155971", "Arturo PU 2035 flexibilná stierka (25 kg, kat. B)", 25, 25, 5.61, H, null, "1,57 kg/m²/mm; flexibilná (shore-D 30)", null],
  ["155975", "Arturo PU 2035 flexibilná stierka (10 kg, kat. A)", 10, 10, 6.17, H, null, "1,57 kg/m²/mm", null],
  ["155976", "Arturo PU 2035 flexibilná stierka (10 kg, kat. B)", 10, 10, 6.29, H, null, "1,57 kg/m²/mm", null],
  ["169834", "Arturo PU 2050 UV stierka (25 kg, kat. A)", 25, 25, 10.00, H, null, "1,53 kg/m²/mm; UV stabilná", null],
  ["169838", "Arturo PU 2050 UV stierka (25 kg, kat. B)", 25, 25, 10.56, H, null, "1,53 kg/m²/mm; UV stabilná", null],
  ["169844", "Arturo PU 2050 UV stierka (10 kg, kat. A)", 10, 10, 10.75, H, null, "1,53 kg/m²/mm", null],
  ["169845", "Arturo PU 2050 UV stierka (10 kg, kat. B)", 10, 10, 11.31, H, null, "1,53 kg/m²/mm", null],
  ["169864", "Arturo PU 2050 UV stierka (5 kg)", 5, 5, 11.84, H, null, "1,53 kg/m²/mm", null],
  ["155984", "Arturo PU 2030 UV flexi stierka (25 kg, kat. A)", 25, 25, 9.79, H, null, "1,56 kg/m²/mm; UV stabilná, flexibilná", null],
  ["155985", "Arturo PU 2030 UV flexi stierka (25 kg, kat. B)", 25, 25, 10.34, H, null, "1,56 kg/m²/mm; UV stabilná, flexibilná", null],
  ["155988", "Arturo PU 2030 UV flexi stierka (10 kg, kat. A)", 10, 10, 10.50, H, null, "1,56 kg/m²/mm", null],
  ["155990", "Arturo PU 2030 UV flexi stierka (10 kg, kat. B)", 10, 10, 11.06, H, null, "1,56 kg/m²/mm", null],
  ["155993", "Arturo PU 2030 UV flexi stierka (5 kg)", 5, 5, 11.61, H, null, "1,56 kg/m²/mm", null],
  ["175954", "Arturo Mistral dizajnová PU stierka (25 kg)", 25, 25, 10.31, H, null, "1,52 kg/m²/mm; patinovaný vzhľad, kolekcia CCL Mistral", null],
  ["175953", "Arturo Mistral dizajnová PU stierka (10 kg)", 10, 10, 11.16, H, null, "1,52 kg/m²/mm", null],
  ["156062", "Arturo EP 3900 farebný náter (25 kg, kat. A)", 25, 25, 8.04, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156066", "Arturo EP 3900 farebný náter (15 kg, kat. A)", 15, 15, 8.39, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156067", "Arturo EP 3900 farebný náter (15 kg, kat. B)", 15, 15, 8.92, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156070", "Arturo EP 3900 farebný náter (7,5 kg, kat. A)", 7.5, 7.5, 9.35, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156071", "Arturo EP 3900 farebný náter (7,5 kg, kat. B)", 7.5, 7.5, 9.88, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156074", "Arturo EP 3900 farebný náter (3,75 kg, kat. A)", 3.75, 3.75, 10.46, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156075", "Arturo EP 3900 farebný náter (3,75 kg, kat. B)", 3.75, 3.75, 11.05, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156034", "Arturo EP 3400 antistatický náter (7,5 kg)", 7.5, 7.5, 11.36, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156082", "Arturo EP 3910 protišmykový náter (15 kg, kat. A)", 15, 15, 8.30, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156083", "Arturo EP 3910 protišmykový náter (15 kg, kat. B)", 15, 15, 8.83, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156086", "Arturo EP 3910 protišmykový náter (7,5 kg, kat. A)", 7.5, 7.5, 9.27, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156087", "Arturo EP 3910 protišmykový náter (7,5 kg, kat. B)", 7.5, 7.5, 9.79, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156090", "Arturo EP 3910 protišmykový náter (3,75 kg, kat. A)", 3.75, 3.75, 10.39, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156091", "Arturo EP 3910 protišmykový náter (3,75 kg, kat. B)", 3.75, 3.75, 10.98, H, 0.3, "0,2–0,3 kg/m²/vrstva", null],
  ["156054", "Arturo EP 3010 difúzny náter (20 kg, kat. A)", 20, 20, 12.05, H, 0.25, "0,15–0,25 kg/m²/vrstva; na podlahu a stenu", null],
  ["156055", "Arturo EP 3010 difúzny náter (20 kg, kat. B)", 20, 20, 13.12, H, 0.25, "0,15–0,25 kg/m²/vrstva", null],
  ["156058", "Arturo EP 3010 difúzny náter (10 kg, kat. A)", 10, 10, 12.42, H, 0.25, "0,15–0,25 kg/m²/vrstva", null],
  ["156059", "Arturo EP 3010 difúzny náter (10 kg, kat. B)", 10, 10, 13.46, H, 0.25, "0,15–0,25 kg/m²/vrstva", null],
  ["156593", "Arturo EP 3010 difúzny náter (5 kg, kat. A)", 5, 5, 12.48, H, 0.25, "0,15–0,25 kg/m²/vrstva", null],
  ["156594", "Arturo EP 3010 difúzny náter (5 kg, kat. B)", 5, 5, 13.50, H, 0.25, "0,15–0,25 kg/m²/vrstva", null],
  ["156108", "Arturo PU 3320 saténový náter (6,65 kg, kat. A)", 6.65, 6.65, 29.26, H, 0.12, "0,1–0,12 kg/m²/vrstva; UV stabilný", null],
  ["156109", "Arturo PU 3320 saténový náter (6,65 kg, kat. B)", 6.65, 6.65, 30.37, H, 0.12, "0,1–0,12 kg/m²/vrstva; UV stabilný", null],
  ["156102", "Arturo PAS 3790 polyaspartický náter (5 kg)", 5, 5, 31.72, H, 0.35, "0,15–0,35 kg/m²/vrstva; rýchloschnúci, UV", null],
  ["156105", "Arturo PAS 3790 polyaspartický náter (10 kg)", 10, 10, 30.80, H, 0.35, "0,15–0,35 kg/m²/vrstva; rýchloschnúci, UV", null],
  ["89567",  "Arturo PU 7750 extra matný lak (10 kg)", 10, 10, 32.79, V, 0.1, "0,1 kg/m²/vrstva; UV stabilný", null],
  ["89568",  "Arturo PU 7750 extra matný lak (5 kg)", 5, 5, 33.13, V, 0.1, "0,1 kg/m²/vrstva; UV stabilný", null],
  ["163448", "Arturo PU 7310 matný lak (10 kg)", 10, 10, 26.79, V, 0.1, "0,09–0,1 kg/m²/vrstva; UV stabilný", null],
  ["163667", "Arturo PU 7310 matný lak (5 kg)", 5, 5, 30.27, V, 0.1, "0,09–0,1 kg/m²/vrstva; UV stabilný", null],
  ["163449", "Arturo PU 7310 matný lak (2,5 kg)", 2.5, 2.5, 34.59, V, 0.1, "0,09–0,1 kg/m²/vrstva; UV stabilný", null],
  ["178578", "Arturo PU 7320 saténový lak (6 kg)", 6, 6, 33.30, V, 0.1, "0,09–0,1 kg/m²/vrstva; UV stabilný", null],
  ["71935",  "Arturo PU 7180 lesklý lak 1K (5 kg)", 5, 5, 27.01, V, 0.1, "max 0,1 kg/m²/vrstva", null],
  ["181276", "Arturo EP 7600 extra matný EP lak (10 kg)", 10, 10, 15.82, V, 0.12, "0,12 kg/m²/vrstva; vodná báza", null],
  ["89565",  "Arturo PAS 7790 polyaspartický lak (5 kg)", 5, 5, 41.51, V, 0.4, "0,2–0,4 kg/m²/vrstva; rýchloschnúci, UV", null],
  ["89566",  "Arturo PAS 7790 polyaspartický lak (10 kg)", 10, 10, 42.45, V, 0.4, "0,2–0,4 kg/m²/vrstva; rýchloschnúci, UV", null],
  ["082949", "Arturo AC 6100 impregnácia (5 kg)", 5, 5, 12.93, V, null, "impregnačný náter pre cementové systémy Arturo", null],
  ["68153",  "Arturo Stelmiddel tixotropný prach (1 kg)", 1, 1, 42.98, D, null, "zahusťovací prášok pre EP a PU materiály", null],
  ["89655",  "Arturo EP Accelerator (0,7 kg)", 0.7, 1, 11.97, D, null, "urýchľovač EP penetrácií, 7 % na zmiešanú zmes", "0,7 kg balenie"],
  ["156591", "Arturo Flakes dekoratívne chipsy (1 kg)", 1, 1, 33.39, D, null, "vločky 3 a 5 mm", null],
  ["156592", "Arturo Chipsy zlaté/strieborné/bronzové (1 kg)", 1, 1, 79.12, D, null, "spotreba podľa požiadaviek", null],
  ["168958", "Arturo valec na epoxidy 10 cm", null, 1, 2.28, D, null, null, "kus"],
  ["168936", "Arturo valec na epoxidy 25 cm", null, 1, 6.45, D, null, null, "kus"],
  ["172996", "Arturo valec na epoxidy 50 cm", null, 1, 10.27, D, null, null, "kus"],
  ["168956", "Arturo valec na laky 10 cm", null, 1, 2.24, D, null, null, "kus"],
  ["168935", "Arturo valec na laky 25 cm", null, 1, 8.86, D, null, null, "kus"],
  ["172994", "Arturo valec na laky 50 cm", null, 1, 15.70, D, null, null, "kus"],
  ["66435",  "Arturo štetec 4 cm", null, 1, 2.32, D, null, null, "kus"],
  ["66496",  "Arturo držiak na valec 50–70 cm", null, 1, 39.26, D, null, null, "kus"],
  ["S1000",  "Piesok kremičitý GEBA múčka (25 kg)", 25, 25, 0.44, D, null, "suchá kremičitá múčka na plnenie živíc", null],
  ["S1001",  "Piesok kremičitý 0,1–0,3 mm (25 kg)", 25, 25, 0.41, D, null, "suchý jemný kremičitý piesok na plnenie živíc", null],
  ["S1010",  "Piesok kremičitý 0,4–0,8 mm (25 kg)", 25, 25, 0.38, D, null, "suchý kremičitý piesok na presyp", null],
  ["68820",  "Maskovacia páska 3M modrá (50 m × 25 mm)", null, 1, 6.91, D, null, null, "kus"],
  ["35254",  "Maskovacia páska strieborná (50 m × 50 mm)", null, 1, 8.22, D, null, null, "kus"],
  ["82975",  "Prázdna plechovka 25 l", null, 1, 6.29, D, null, null, "kus"],
  ["163053", "Sitko s gumovým límcom", null, 1, 6.14, D, null, null, "kus"],
  ["88402",  "Gumová stierka 25 cm", null, 1, 24.66, D, null, null, "kus"],
  ["59588",  "Gumová stierka 40 cm", null, 1, 37.01, D, null, null, "kus"],
  ["68823",  "Gumová stierka 60 cm", null, 1, 43.57, D, null, null, "kus"],
  ["68824",  "Teleskopická tyč na stierku", null, 1, 58.02, D, null, null, "kus"],
  ["83640",  "Obuv na lakovanie 2K lakov (pár)", null, 1, 74.05, D, null, null, "pár"],
];

// ── UZIN (podlahová chémia relevantná pre epoxidové systémy) ────────────
const UZIN = [
  ["PIESOK-0408", "UZIN piesok kremičitý 0,4–0,8 mm (25 kg)", 25, 25, 0.40, D, null, "kremičitý piesok na plnenie a presyp", null],
  ["077304", "UZIN PE 260 cube penetrácia (10 kg)", 10, 10, 6.29, P, null, "disperzná penetrácia", null],
  ["047523", "UZIN PE 280 rýchla penetrácia (12 kg)", 12, 12, 8.46, P, null, "penetrácia s karbónovou technológiou", null],
  ["047522", "UZIN PE 280 rýchla penetrácia (5 kg)", 5, 5, 8.43, P, null, "penetrácia s karbónovou technológiou", null],
  ["084256", "UZIN PE 350 penetrácia (10 kg)", 10, 10, 4.45, P, null, null, null],
  ["077299", "UZIN PE 360 PLUS cube penetrácia (10 kg)", 10, 10, 4.87, P, null, "disperzná penetrácia na savé podklady", null],
  ["087428", "UZIN PE 390 penetrácia (10 kg)", 10, 10, 6.80, P, null, null, null],
  ["041364", "UZIN PE 414 BiTurbo 1K PU penetrácia (12 kg)", 12, 12, 15.79, P, 0.15, "rýchla 1K PU penetrácia / parozábrana, 0,1–0,15 kg/m²", null],
  ["041365", "UZIN PE 414 BiTurbo 1K PU penetrácia (6 kg)", 6, 6, 17.40, P, 0.15, "rýchla 1K PU penetrácia / parozábrana", null],
  ["159351", "UZIN PE 425 Neu penetrácia (9 kg)", 9, 9, 28.13, P, null, null, null],
  ["017340", "UZIN PE 480 2K EP parozábrana (10 kg)", 10, 10, 24.25, P, 0.3, "2K epoxidová uzávera vlhkosti, ~0,3 kg/m²/vrstva", null],
  ["089631", "UZIN PE 650 kontaktná stierka (16 kg)", 16, 16, 3.71, P, null, null, null],
  ["165279", "UZIN NC 103 nivelačka (25 kg)", 25, 25, 0.75, N, null, "1,6 kg/m²/mm (cementová nivelačná hmota)", null],
  ["013141", "UZIN NC 105 nivelačka (25 kg)", 25, 25, 0.87, N, null, "1,6 kg/m²/mm", null],
  ["001272", "UZIN NC 110 nivelačka (25 kg)", 25, 25, 1.02, N, null, "1,6 kg/m²/mm", null],
  ["084528", "UZIN NC 118 nivelačka (20 kg)", 20, 20, 1.51, N, null, null, null],
  ["083051", "UZIN NC 140 nivelačka (25 kg)", 25, 25, 0.69, N, null, null, null],
  ["011295", "UZIN NC 150 nivelačka (25 kg)", 25, 25, 0.95, N, null, null, null],
  ["083052", "UZIN NC 152 Turbo nivelačka (25 kg)", 25, 25, 1.10, N, null, "rýchla nivelačná hmota", null],
  ["170470", "UZIN NC 160 nivelačka (20 kg)", 20, 20, 1.02, N, null, null, null],
  ["173283", "UZIN NC 161 nivelačka (20 kg)", 20, 20, 1.10, N, null, null, null],
  ["170471", "UZIN NC 170 LevelStar nivelačka (20 kg)", 20, 20, 1.34, N, null, "prémiová nivelačná hmota", null],
  ["001179", "UZIN NC 172 BiTurbo nivelačka (25 kg)", 25, 25, 1.75, N, null, "rýchla prémiová nivelačná hmota", null],
  ["001136", "UZIN NC 175 nivelačka (25 kg)", 25, 25, 1.77, N, null, null, null],
  ["087569", "UZIN NC 182 New stierka (20 kg)", 20, 20, 1.48, N, null, null, null],
  ["047435", "UZIN NC 195 nivelačka (25 kg)", 25, 25, 1.04, N, null, null, null],
  ["063763", "UZIN NC 196 New nivelačka (25 kg)", 25, 25, 0.74, N, null, null, null],
  ["176915", "UZIN NC 550 nivelačka (20 kg)", 20, 20, 0.88, N, null, null, null],
  ["176913", "UZIN NC 560 nivelačka (20 kg)", 20, 20, 0.98, N, null, null, null],
  ["176932", "UZIN NC 567 nivelačka (20 kg)", 20, 20, 0.77, N, null, null, null],
  ["176784", "UZIN NC 570 nivelačka (20 kg)", 20, 20, 1.18, N, null, null, null],
  ["176781", "UZIN NC 580 nivelačka (20 kg)", 20, 20, 1.33, N, null, null, null],
  ["176917", "UZIN NC 585 F nivelačka (20 kg)", 20, 20, 1.70, N, null, null, null],
  ["176934", "UZIN NC 587 nivelačka (20 kg)", 20, 20, 1.03, N, null, null, null],
  ["167686", "UZIN NC 740 vyrovnávacia hmota (25 kg)", 25, 25, 0.56, N, null, null, null],
  ["054791", "UZIN NC 888 S opravná stierka (4,5 kg)", 4.5, 4.5, 4.96, N, null, "rýchla opravná stierka", null],
  ["010126", "codex NC 395 nivelačka (25 kg)", 25, 25, 1.29, N, null, null, null],
  ["053402", "UZIN SC 914 Turbo rýchly poter (21 kg)", 21, 21, 2.01, N, null, null, null],
  ["001177", "UZIN SC 960 poterový spevňovač (25 kg)", 25, 25, 1.77, N, null, null, null],
  ["159459", "UZIN SC 968 poter (20 kg)", 20, 20, 0.50, N, null, null, null],
  ["061834", "UZIN Levelpin nivelačný kolík", null, 1, 0.67, D, null, "meranie hrúbky nivelačky", "kus"],
  ["011725", "UZIN vlákna armovacie (0,25 kg)", 0.25, 1, 6.38, D, null, null, "0,25 kg balenie"],
  ["010122", "UZIN páska dilatačná samolepiaca (25 m)", null, 25, 0.81, D, null, null, "25 m rolka"],
  ["060378", "UZIN páska dilatačná samolepiaca B (20 m)", null, 20, 1.55, D, null, null, "20 m rolka"],
  ["009191", "UZIN vedro miešacie 30 l", null, 1, 7.09, D, null, null, "kus"],
  ["087607", "UZIN vedro odmerkové s vekom 10 l", null, 1, 3.19, D, null, null, "kus"],
];

function makeProdukt(vyrobca, prefix, row) {
  const [kod, nazov, kg, units, voc, kategoria, spotreba, poznamka, balenieLabel] = row;
  const balenie =
    balenieLabel ?? (kg != null ? `${String(kg).replace(".", ",")} kg` : null);
  const c = cena(voc, units);
  return {
    sku: `${prefix}-${kod}`,
    nazov,
    vyrobca,
    kategoria,
    balenie,
    balenie_kg: kg,
    cena_eur_s_dph: c,
    cena_pevna: false,
    spotreba_kg_m2: spotreba,
    pokryje_m2_z_balenia:
      spotreba != null && kg != null
        ? Math.round((kg / spotreba) * 10) / 10
        : null,
    spotreba_poznamka: poznamka,
    spracovatelnost_min: null,
    dalsia_vrstva_od_h: null,
    dalsia_vrstva_do_h: null,
    pochodzne_h: null,
    plne_vytvrdnute_dni: null,
    vyzaduje_podklad_mpa: null,
    technicky_list: null,
    typy_podlah: null,
    foto: null,
    foto_typ: null,
    foto_sud: null,
    foto_zdroj: null,
    foto_licencia: null,
  };
}

const produkty = [
  ...ARTURO.map((r) => makeProdukt("Arturo", "AR", r)),
  ...UZIN.map((r) => makeProdukt("UZIN", "UZ", r)),
];

// sanity: unikátne SKU
const seen = new Set();
for (const p of produkty) {
  if (seen.has(p.sku)) {
    console.error("✗ duplicitné SKU:", p.sku);
    process.exit(1);
  }
  seen.add(p.sku);
}

const out = {
  vygenerovane: "2026-08-14",
  zdroj: "HA-UZ (podlahauz.sk) VOC cenníky Arturo + UZIN, platné od 1.5.2026",
  cenotvorba: {
    poznamka:
      "predaj = VOC_bez_dph × 1,23 (DPH na vstupe) / 0,735 (marža 26,5 % ako CRM generátor). Ceny KONEČNÉ — neplatiteľ DPH.",
  },
  pocet: produkty.length,
  produkty,
};

fs.writeFileSync(DEST, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`✓ ${produkty.length} produktov (Arturo ${ARTURO.length}, UZIN ${UZIN.length}) → ${path.relative(process.cwd(), DEST)}`);
