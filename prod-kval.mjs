import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1450, height: 1000 } });
let live = false;
for (let i = 0; i < 30; i++) {
  await p.goto("https://epoxidovo.sk/vzorkovnik?typ=mistral", { waitUntil: "domcontentloaded", timeout: 90000 });
  await p.waitForTimeout(7000);
  // otvor nahlad a odmeraj skutocne rozlisenie stiahnutej vzorky
  const vz = p.locator("button[aria-label*='otvoriť náhľad']").first();
  if (await vz.count()) {
    await vz.click().catch(() => {});
    await p.waitForTimeout(2500);
    const w = await p.evaluate(() => {
      const im = [...document.querySelectorAll("img")].filter(i => /arturo/.test(i.currentSrc||"")).sort((a,b)=>b.naturalWidth-a.naturalWidth)[0];
      return im ? im.naturalWidth : 0;
    });
    if (w >= 800) { console.log("NASADENE | najväčšia vzorka v náhľade:", w, "px"); live = true; break; }
    console.log("ešte staré:", w, "px");
    await p.keyboard.press("Escape").catch(() => {});
  }
  await p.waitForTimeout(25000);
}
if (live) await p.screenshot({ path: "/tmp/prod-kvalita.png" });
else console.log("nedobehlo");
await b.close();
