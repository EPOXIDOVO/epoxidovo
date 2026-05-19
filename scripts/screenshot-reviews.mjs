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

// scroll to reviews
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.getElementById("recenzie")?.scrollIntoView({ block: "start" });
  window.scrollBy(0, -90);
});
await page.waitForTimeout(700);

const section = await page.$("#recenzie");
if (section) {
  await section.screenshot({ path: "/tmp/reviews.png" });
} else {
  await page.screenshot({ path: "/tmp/reviews.png", fullPage: false });
}
await browser.close();
console.log("OK");
