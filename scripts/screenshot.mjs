import { chromium } from "playwright";

const URL = "http://localhost:3000";
const OUT = "/tmp/epoxidovo-shots";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await context.addInitScript(() => {
  localStorage.setItem(
    "epoxidovo-consent",
    JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }),
  );
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);

await page.screenshot({ path: `${OUT}/hero.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
console.log(`✓ Hero → ${OUT}/hero.png`);

// Categories sekcia — scroll na ňu
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  const el = document.querySelector("#kategorie");
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - 80);
  }
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/categories.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
console.log(`✓ Categories → ${OUT}/categories.png`);

await browser.close();
console.log("Done.");
