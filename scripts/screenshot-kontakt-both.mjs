import { chromium } from "playwright";

const browser = await chromium.launch();

// Mobile
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mctx.newPage();
await mpage.goto("http://localhost:3000/kontakt", { waitUntil: "networkidle", timeout: 20000 });
await mpage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await mpage.waitForTimeout(800);
await mpage.screenshot({ path: "/tmp/kontakt-hero-mobile.png", clip: { x: 0, y: 0, width: 390, height: 360 } });
await mctx.close();

// Desktop
const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const dpage = await dctx.newPage();
await dpage.goto("http://localhost:3000/kontakt", { waitUntil: "networkidle", timeout: 20000 });
await dpage.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    /iba nutné|prijať/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await dpage.waitForTimeout(800);
await dpage.screenshot({ path: "/tmp/kontakt-hero-desktop.png", clip: { x: 0, y: 0, width: 1280, height: 500 } });
await dctx.close();

await browser.close();
console.log("OK");
