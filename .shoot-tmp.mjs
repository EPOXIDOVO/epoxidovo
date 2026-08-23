import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-puska-Downloads-veelyn-export/1bdca81a-a965-49de-93fc-7fe05dea9b23/scratchpad";
const url = process.argv[2] || "http://localhost:3010/kurz";
const tag = process.argv[3] || "sk";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
// hero at start
await page.screenshot({ path: `${OUT}/${tag}-0-hero.png` });
// hero mid-scroll (pinned)
await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, window.innerHeight * 1.2); });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/${tag}-1-hero-scrolled.png` });
const ids = ["about", "program", "cena", "faq", "kontakt"];
for (const id of ids) {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" }), id);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${tag}-2-${id}.png` });
}
// marquee + cta between
await page.evaluate(() => { const el = document.querySelector(".kl-cta"); el?.scrollIntoView({ behavior: "instant", block: "start" }); });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/${tag}-3-cta.png` });
// flip a card
await page.evaluate(() => document.getElementById("program")?.scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(400);
await page.hover(".kl-card:nth-child(2)");
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/${tag}-4-card-flip.png` });
// full page
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
// trigger all reveals by scrolling through
const h = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80); }
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/${tag}-9-full.png`, fullPage: true });
// footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/${tag}-5-footer.png` });
console.log("done", h);
await browser.close();
