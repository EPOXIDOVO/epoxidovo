import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 20000 });

// dismiss cookie banner
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await page.waitForTimeout(500);

// Zoom on header button
const btn = await page.$('header a.btn-primary');
if (btn) {
  const box = await btn.boundingBox();
  if (box) {
    await page.screenshot({ path: "/tmp/btn-zoom.png", clip: { x: box.x - 30, y: box.y - 20, width: box.width + 200, height: box.height + 40 } });
  }
}
// Also hero button
const heroBtn = await page.$('main a.btn-primary, section a.btn-primary');
if (heroBtn) {
  const box = await heroBtn.boundingBox();
  if (box) {
    await page.screenshot({ path: "/tmp/hero-btn-zoom.png", clip: { x: box.x - 30, y: box.y - 20, width: box.width + 200, height: box.height + 40 } });
  }
}
await browser.close();
console.log("OK");
