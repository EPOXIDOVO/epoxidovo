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
await page.waitForTimeout(700);

await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  const h = [...document.querySelectorAll("h2")].find(h => /Skutočné skúsenosti/.test(h.textContent || ""));
  h?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/reviews-head.png", clip: { x: 0, y: 200, width: 1280, height: 400 } });

await browser.close();
console.log("OK");
