import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 20000 });

await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await page.waitForTimeout(500);

await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.getElementById("kategorie")?.scrollIntoView({ block: "start" });
  window.scrollBy(0, 300);
});
await page.waitForTimeout(800);

await page.screenshot({ path: "/tmp/categories.png", clip: { x: 0, y: 0, width: 1280, height: 800 } });
await browser.close();
console.log("OK");
