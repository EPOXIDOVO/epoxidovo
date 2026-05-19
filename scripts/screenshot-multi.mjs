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

// 1) Categories close-up — scroll to kategorie + bigger viewport for badges
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.getElementById("kategorie")?.scrollIntoView({ block: "start" });
  window.scrollBy(0, 400);
});
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/m-categories.png", clip: { x: 0, y: 350, width: 1280, height: 550 } });

// 2) Reviews subtitle
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2")].find(h => /skúsenosti/i.test(h.textContent || ""));
  h?.scrollIntoView({ block: "center" });
  window.scrollBy(0, -120);
});
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/m-reviews.png", clip: { x: 0, y: 0, width: 1280, height: 320 } });

// 3) Footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/m-footer.png", clip: { x: 0, y: 350, width: 1280, height: 550 } });

await browser.close();
console.log("OK");
