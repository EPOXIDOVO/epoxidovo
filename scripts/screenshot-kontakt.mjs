import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/kontakt", { waitUntil: "networkidle", timeout: 20000 });

// dismiss cookie banner
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await page.waitForTimeout(500);

// scroll to bottom to verify map is gone
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);

await page.screenshot({ path: "/tmp/kontakt-bottom.png", fullPage: false });
await browser.close();
console.log("OK");
