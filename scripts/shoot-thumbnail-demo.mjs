import { chromium } from "playwright";
import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";

const OUT = "/Users/m/portfolio-review/.paper-tmp/thumbnail-demo";
const BASE = "http://localhost:3107/dev/dialogue-thumbnail";
const IDS = ["product", "story", "tight"];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function decorate(page, theme = "light") {
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.removeAttribute("data-intro");
    for (const el of document.querySelectorAll("body *")) {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (s.position === "fixed" && r.width >= 220 && r.height >= 200 && (r.left > 900 || r.right < 80)) {
        el.style.setProperty("display", "none", "important");
      }
    }
  }, theme);
}

async function open(url, theme = "light") {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "no-preference",
    colorScheme: theme,
  });
  await page.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch {} }, theme);
  await page.goto(url, { waitUntil: "networkidle" });
  await decorate(page, theme);
  await page.waitForSelector("[data-demo-frame] .dlg-thumb");
  return page;
}

async function captureBeats(page, id, wanted) {
  const frame = page.locator("[data-demo-frame]");
  const seen = new Set();
  const t0 = Date.now();
  while (seen.size < wanted.length && Date.now() - t0 < 20000) {
    const beat = await page.evaluate(() => {
      const t = document.querySelector("[data-demo-frame] .dlg-thumb");
      return t ? `${t.getAttribute("data-beat")}|${t.getAttribute("data-side")}` : "";
    });
    const [b] = beat.split("|");
    if (wanted.includes(b) && !seen.has(b)) {
      if (b === "unsure") await page.waitForTimeout(120);
      await frame.screenshot({ path: path.join(OUT, `${id}-${b}.png`) });
      seen.add(b);
    }
    await page.waitForTimeout(40);
  }
  console.log(id, [...seen].join(","));
  if (seen.size < wanted.length) throw new Error(`${id} missed ${wanted.filter((w) => !seen.has(w)).join(",")}`);
}

const poster = await open(`${BASE}?poster=1`);
await poster.locator("[data-demo-frame]").screenshot({ path: path.join(OUT, "poster-light.png") });
await poster.locator("[data-card-frame]").screenshot({ path: path.join(OUT, "poster-card-chrome-light.png") });
await poster.close();

for (const id of IDS) {
  const page = await open(`${BASE}?variant=${id}`);
  await captureBeats(page, id, ["hover-unsure", "unsure", "hover-friday", "poster"]);
  // The first poster beat is the start; captureBeats will record the first time it sees poster, which is the opening frame.
  // Rename if needed after: we also want back-to-225. Poll one more cycle's poster after unsure? 
  await page.close();
}

for (const id of IDS) {
  const recDir = path.join(OUT, `rec-${id}`);
  await mkdir(recDir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 760, height: 620 },
    recordVideo: { dir: recDir, size: { width: 760, height: 620 } },
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
  await p.goto(`${BASE}?variant=${id}`, { waitUntil: "networkidle" });
  await decorate(p, "light");
  await p.locator("[data-demo-frame]").scrollIntoViewIfNeeded();
  const timing = { product: 6500, story: 7500, tight: 4200 }[id];
  await p.waitForTimeout(timing * 2 + 1000);
  await ctx.close();
  const files = (await readdir(recDir)).filter((f) => f.endsWith(".webm"));
  if (files[0]) await rename(path.join(recDir, files[0]), path.join(OUT, `${id}-loop.webm`));
}

const home = await browser.newPage({
  viewport: { width: 1440, height: 1600 },
  reducedMotion: "no-preference",
  colorScheme: "light",
});
await home.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });
await home.goto("http://localhost:3107/", { waitUntil: "networkidle" });
await home.waitForTimeout(5500);
await decorate(home, "light");
const card = home.locator('[data-grid-card="project-dialogue"]');
if (await card.count()) {
  await card.scrollIntoViewIfNeeded();
  await home.waitForTimeout(800);
  await card.screenshot({ path: path.join(OUT, "homepage-dialogue-card.png") });
  await home.screenshot({ path: path.join(OUT, "homepage-1440-light.png") });
} else {
  await home.screenshot({ path: path.join(OUT, "homepage-1440-light-missing-card.png") });
  console.log("missing homepage card");
}

await browser.close();
console.log("shot ok");
