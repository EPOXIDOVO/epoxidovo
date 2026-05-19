import { chromium } from "playwright";

const browser = await chromium.launch();

const sizes = [
  { name: "Mobile (iPhone 13)",       w: 390, h: 844 },
  { name: "Mobile (široký)",          w: 430, h: 932 },
  { name: "Tablet (iPad)",            w: 768, h: 1024 },
  { name: "Laptop 13\"",              w: 1280, h: 800 },
  { name: "Desktop FullHD",           w: 1920, h: 1080 },
  { name: "Desktop QHD",              w: 2560, h: 1440 },
];

console.log("Sekcia /kontakt hero — reálne rozmery v rôznych zariadeniach:");
console.log("─".repeat(70));

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/kontakt", { waitUntil: "networkidle", timeout: 20000 });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      /iba nutné|prijať/i.test(b.textContent || ""),
    );
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);

  const dims = await page.evaluate(() => {
    const section = document.querySelector("main section, body section");
    const img = document.querySelector('img[src*="hero-kontakt"]');
    return {
      sectionW: section?.offsetWidth,
      sectionH: section?.offsetHeight,
      imgW: img?.offsetWidth,
      imgH: img?.offsetHeight,
    };
  });

  console.log(
    `${s.name.padEnd(22)} ${String(s.w).padStart(4)}px wide → sekcia: ${dims.sectionW}×${dims.sectionH}px`,
  );
  await ctx.close();
}

await browser.close();
