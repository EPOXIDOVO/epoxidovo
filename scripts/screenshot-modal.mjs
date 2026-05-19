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

// Click "Ukážky podláh" in header
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button, a")].find((b) =>
    /Ukážky podláh/i.test(b.textContent || ""),
  );
  if (btn) btn.click();
});
await page.waitForTimeout(700);

const dialog = await page.$('[role="dialog"][aria-labelledby="sample-picker-title"]');
if (dialog) {
  await dialog.screenshot({ path: "/tmp/modal.png" });
} else {
  await page.screenshot({ path: "/tmp/modal.png", fullPage: false });
}
await browser.close();
console.log("OK");
