import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 20000 });

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await page.waitForTimeout(600);

// 1) HowItWorks — scroll to AKO TO FUNGUJE? then capture
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  const h = [...document.querySelectorAll("h2")].find(h => /Takto vzniká podlaha/.test(h.textContent || ""));
  h?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/v-howitworks.png", clip: { x: 0, y: 0, width: 1280, height: 900 } });

// 2) Categories — scroll, capture cards
await page.evaluate(() => {
  document.getElementById("kategorie")?.scrollIntoView({ block: "start" });
  window.scrollBy(0, 400);
});
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/v-categories.png", clip: { x: 0, y: 350, width: 1280, height: 550 } });

await browser.close();
console.log("OK");
