import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1450, height: 1000 } });
let live = false;
for (let i = 0; i < 26; i++) {
  await p.goto("https://epoxidovo.sk/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await p.waitForTimeout(6000);
  const h = p.locator("text=Čo všetko vieme vyčarovať").first();
  await h.scrollIntoViewIfNeeded().catch(() => {});
  await p.waitForTimeout(1500);
  const t = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
  if (/Mistral od 104/.test(t)) {
    const i2 = t.indexOf("Čo všetko vieme");
    console.log("NASADENE | ceny:", t.slice(i2, i2 + 210));
    live = true;
    // farba prec pri priemyselnych
    const pf = p.locator('button[aria-label*="Priemyseln"]').first();
    if (await pf.count()) {
      await pf.scrollIntoViewIfNeeded(); await pf.click();
      await p.waitForTimeout(1800);
      console.log("Farba v náhľade:", /Farba:/.test(await p.evaluate(() => document.body.innerText)) ? "STÁLE TAM" : "prec OK");
    }
    // kvalita vzoriek
    await p.goto("https://epoxidovo.sk/vzorkovnik?typ=mistral", { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.waitForTimeout(6000);
    const w = await p.evaluate(() => Math.max(...[...document.querySelectorAll("img")].filter(i => /arturo/.test(i.currentSrc||"")).map(i => i.naturalWidth), 0));
    console.log("najväčšia Arturo vzorka:", w, "px", w >= 300 ? "(vyššia kvalita OK)" : "");
    break;
  }
  await p.waitForTimeout(25000);
}
if (!live) console.log("deploy nedobehol v limite");
await b.close();
