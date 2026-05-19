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
await page.waitForTimeout(400);

// click floating button to open form
await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="kontaktný"], button[aria-label*="formulár"], button[aria-label*="chat"]');
  if (btn) btn.click();
});
await page.waitForTimeout(600);

// Zoom into the panel area (right side, bottom)
const panel = await page.$('[role="dialog"][aria-label="Kontaktný formulár"]');
if (panel) {
  await panel.screenshot({ path: "/tmp/form-open.png" });
} else {
  await page.screenshot({ path: "/tmp/form-open.png", clip: { x: 880, y: 80, width: 400, height: 720 } });
}
await browser.close();
console.log("OK");
