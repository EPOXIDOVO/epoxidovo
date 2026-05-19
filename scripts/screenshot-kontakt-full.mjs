import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/kontakt", { waitUntil: "networkidle", timeout: 20000 });
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await page.waitForTimeout(700);

await page.evaluate(() => window.scrollTo(0, 350));
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/kontakt-form.png", clip: { x: 0, y: 0, width: 1280, height: 800 } });
await browser.close();
console.log("OK");
