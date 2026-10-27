#!/usr/bin/env node
/**
 * Preview gate for the Dialogue case study.
 *   npm run check:dialogue-preview -- <preview-url>
 * Protected previews: set VERCEL_AUTOMATION_BYPASS_SECRET, or pass a share link
 * (its _vercel_share query is kept and the cookie it sets is reused).
 *
 * (a) Real-click Close test at scrollY 0, 1440 / 1024 / 601, /dialogue and /ucla-sublease.
 * (c) Open-lightbox sweep, dark close clicks, no-trigger assert at 600 and 390.
 * (b) Whole-page WCAG AA text sweep of /dialogue, light and dark, 1440 and 390.
 */
import { chromium } from "playwright";

const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!arg) {
  console.error("usage: check-dialogue-preview.mjs <preview-url>");
  process.exit(2);
}
const base = new URL(arg);
const origin = base.origin;
const share = base.searchParams.get("_vercel_share");
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

function withAuth(path) {
  const u = new URL(path, origin);
  if (share) u.searchParams.set("_vercel_share", share);
  if (secret) {
    u.searchParams.set("x-vercel-protection-bypass", secret);
    u.searchParams.set("x-vercel-set-bypass-cookie", "true");
  }
  return u.toString();
}

const failures = [];
const log = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) failures.push(msg);
};

async function open(browser, path, width, height, theme) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const res = await page.goto(withAuth(path), { waitUntil: "networkidle" });
  const title = await page.title();
  if (!res || res.status() >= 400 || /login|authentication/i.test(title)) {
    throw new Error(`cannot load ${path}: status ${res && res.status()} title "${title}"`);
  }
  if (theme) {
    await page.evaluate((t) => {
      try { localStorage.setItem("theme", t); } catch {}
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
  }
  await page.waitForTimeout(600);
  return { ctx, page };
}

async function closeTests(browser) {
  for (const theme of ["light", "dark"]) for (const path of ["/dialogue", "/ucla-sublease"]) {
    for (const width of [1440, 1024, 601]) {
      const label = `close click ${path} @${width} ${theme}`;
      try {
        const { ctx, page } = await open(browser, path, width, 900, theme);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        const trigger = page
          .locator(path === "/dialogue" ? ".dp-zoom__trigger" : ".cs-figure-zoom-trigger")
          .first();
        const box = await trigger.boundingBox();
        if (!box) { log(false, `${label}: no trigger`); await ctx.close(); continue; }
        // Click a point of the trigger that is inside the viewport at scrollY 0.
        const y = Math.min(box.y + box.height / 2, 880);
        if (box.y > 880) {
          await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), box.y - 200);
        }
        await trigger.click({ position: { x: box.width / 2, y: Math.max(1, y - box.y) } });
        await page.waitForSelector(".cs-lightbox-backdrop", { timeout: 3000 });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(400);
        const urlBefore = page.url();
        const close = page.locator(".cs-lightbox-close");
        const cb = await close.boundingBox();
        await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
        await page.waitForTimeout(600);
        const open2 = await page.locator(".cs-lightbox-backdrop").count();
        const sameUrl = page.url() === urlBefore;
        log(sameUrl && open2 === 0, `${label} (url unchanged: ${sameUrl}, dialog open: ${open2 > 0})`);
        await ctx.close();
      } catch (e) {
        log(false, `${label}: ${e.message}`);
      }
    }
  }
}

function sweepInPage(rootSel) {
  const parse = (c) => {
    const m = c.match(/[\d.]+/g).map(Number);
    return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
  };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (top, under) => {
    const a = top.a + under.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const f = (x, y) => (x * top.a + y * under.a * (1 - top.a)) / a;
    return { r: f(top.r, under.r), g: f(top.g, under.g), b: f(top.b, under.b), a };
  };
  const page = parse(getComputedStyle(document.body).backgroundColor);
  const pageBg = page.a ? page : { r: 255, g: 255, b: 255, a: 1 };
  const bgOf = (el) => {
    const chain = [];
    for (let e = el; e; e = e.parentElement) chain.push(e);
    let bg = { r: 0, g: 0, b: 0, a: 0 };
    let hasImage = false;
    for (const e of chain) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage !== "none" && !/^linear-gradient\(.*rgba\(0, 0, 0, 0\)/.test(cs.backgroundImage)) hasImage = true;
      bg = over(bg, parse(cs.backgroundColor));
      if (bg.a >= 0.999) break;
    }
    bg = over(bg, { ...pageBg, a: 1 });
    return { bg, hasImage };
  };
  const out = [];
  out.inspected = 0;
  const root = (rootSel && document.querySelector(rootSel)) || document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  let n;
  while ((n = walker.nextNode())) {
    const text = n.nodeValue.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || seen.has(el) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    let hidden = false;
    let opacity = 1;
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden") hidden = true;
      opacity *= parseFloat(s.opacity);
    }
    const r = el.getBoundingClientRect();
    if (hidden || r.width < 1 || r.height < 1 || opacity < 0.05) continue;
    const { bg, hasImage } = bgOf(el);
    if (hasImage) continue;
    let fg = parse(cs.color);
    fg = over({ ...fg, a: fg.a * opacity }, { ...bg, a: 1 });
    out.inspected++;
    const L1 = lum(fg) + 0.05, L2 = lum(bg) + 0.05;
    const ratio = Math.max(L1, L2) / Math.min(L1, L2);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      out.push({
        text: text.slice(0, 40),
        cls: (el.className && el.className.toString().slice(0, 50)) || el.tagName,
        ratio: +ratio.toFixed(2),
        need,
      });
    }
  }
  return out;
}

async function sweeps(browser) {
  for (const theme of ["light", "dark"]) {
    for (const width of [1440, 390]) {
      const label = `contrast sweep /dialogue ${theme} @${width}`;
      try {
        const { ctx, page } = await open(browser, process.env.SELFTEST === "page" ? "/dialogue?__selftest=1" : "/dialogue", width, 900, theme);
        const H = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < H; y += 400) {
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await page.waitForTimeout(60);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        await page.evaluate(() => {
          if (new URLSearchParams(location.search).has("__selftest")) {
            const d = document.createElement("p");
            d.textContent = "selftest";
            d.style.cssText = "color:#eee;background:#fff;position:absolute;top:0;left:0";
            document.body.appendChild(d);
          }
        });
        const res = await page.evaluate(`(${sweepInPage.toString()})()`);
        const bad = res;
        const inspected = await page.evaluate(`(${sweepInPage.toString()})().inspected`);
        log(bad.length === 0, `${label} (${inspected} text nodes inspected, ${bad.length} below AA)`);
        for (const b of bad.slice(0, 25)) console.log(`     ${b.ratio}:1 < ${b.need}  "${b.text}"  .${b.cls}`);
        await ctx.close();
      } catch (e) {
        log(false, `${label}: ${e.message}`);
      }
    }
  }
}


const TRIGGER = (path) => (path === "/dialogue" ? ".dp-zoom__trigger" : ".cs-figure-zoom-trigger");

async function lightboxSweeps(browser) {
  for (const theme of ["light", "dark"]) for (const path of ["/dialogue", "/ucla-sublease"]) {
    for (const width of [1440, 601]) {
      const label = `open-lightbox sweep ${path} @${width} ${theme}`;
      try {
        const { ctx, page } = await open(browser, path, width, 900, theme);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.locator(TRIGGER(path)).first().click({ force: true });
        await page.waitForSelector(".cs-lightbox-backdrop", { timeout: 3000 });
        await page.waitForTimeout(500);
        if (process.env.SELFTEST === "lightbox") {
          await page.evaluate(() => {
            const b = document.createElement("button");
            b.textContent = "selftest";
            b.style.cssText = "color:#2e2e2e;background:transparent;position:absolute;top:60px;left:8px";
            document.querySelector(".cs-lightbox-dialog").appendChild(b);
          });
        }
        const bad = await page.evaluate(`(${sweepInPage.toString()})(".cs-lightbox-backdrop")`);
        const n = await page.evaluate(`(${sweepInPage.toString()})(".cs-lightbox-backdrop").inspected`);
        const closeSeen = await page.evaluate(
          () => {
          const x = document.querySelector('.cs-lightbox-backdrop > .cs-lightbox-close');
          return !!x && (x.getAttribute("aria-label") || x.textContent || "").trim().length > 0;
        },
        );
        log(bad.length === 0 && closeSeen, `${label} (${closeSeen ? "Close present" : "no Close"}, ${n} text nodes inspected, ${bad.length} below AA)`);
        for (const b of bad.slice(0, 10)) console.log(`     ${b.ratio}:1 < ${b.need}  "${b.text}"  .${b.cls}`);
        await ctx.close();
      } catch (e) {
        log(false, `${label}: ${e.message}`);
      }
    }
  }
}

async function noTriggerChecks(browser) {
  for (const path of ["/dialogue", "/ucla-sublease"]) {
    for (const width of [600, 390]) {
      const label = `no zoom trigger ${path} @${width}`;
      try {
        const { ctx, page } = await open(browser, path, width, 900);
        const H = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < H; y += 500) {
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await page.waitForTimeout(40);
        }
        const total = await page.locator(".dp-zoom__trigger, .cs-figure-zoom-trigger").count();
        log(total === 0, `${label} (${total} triggers)`);
        await ctx.close();
      } catch (e) {
        log(false, `${label}: ${e.message}`);
      }
    }
  }
}


async function ownerChecks(browser) {
  const label = "DLG-48 timestamp owners /dialogue";
  try {
    const { ctx, page } = await open(browser, "/dialogue", 1440, 900);
    if (process.env.SELFTEST === "owners") {
      await page.evaluate(() => {
        const s = document.createElement("span");
        s.className = "dp-source-pill";
        s.textContent = "Jordan M., 21:08";
        document.querySelector(".dialogue-case-study, main, body").appendChild(s);
      });
    }
    const pairs = await page.evaluate(() => {
      const out = [];
      const re = /([A-Z][a-z]+ [A-Z]\.),?\s*(\d\d:\d\d)(?!\d|\u2013|:)/g;
      for (const el of document.querySelectorAll(".dp-source-pill, .dp-sources span, [class*=source]")) {
        const t = el.textContent || "";
        let m;
        while ((m = re.exec(t))) out.push([m[1], m[2]]);
      }
      return out;
    });
    const byTime = new Map();
    const byName = new Map();
    for (const [n, t] of pairs) {
      byTime.set(t, new Set([...(byTime.get(t) || []), n]));
      byName.set(n, new Set([...(byName.get(n) || []), t]));
    }
    const bad = [
      ...[...byTime].filter(([, v]) => v.size > 1).map(([t, v]) => `${t} owned by ${[...v].join(" and ")}`),
      ...[...byName].filter(([, v]) => v.size > 1).map(([n, v]) => `${n} has ${[...v].join(" and ")}`),
    ];
    log(pairs.length >= 4 && bad.length === 0, `${label} (${pairs.length} pills, ${byTime.size} distinct times, ${bad.length} conflicts)`);
    for (const b of bad) console.log(`     ${b}`);
    await ctx.close();
  } catch (e) {
    log(false, `${label}: ${e.message}`);
  }
}

async function heroOverlapChecks(browser) {
  for (const width of [390, 360]) {
    const label = `DLG-52 hero card overlap /dialogue @${width}`;
    try {
      const { ctx, page } = await open(browser, "/dialogue", width, 900);
      const r = await page.evaluate(() => {
        const m = document.querySelector(".dp-hero-v2__mobile");
        const card = m.querySelector(".dp-hero-v2__card").getBoundingClientRect();
        let hits = 0, nodes = 0;
        const w = document.createTreeWalker(m, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) {
          if (!n.textContent.trim() || n.parentElement.closest(".dp-hero-v2__card")) continue;
          const rg = document.createRange();
          rg.selectNodeContents(n);
          const q = rg.getBoundingClientRect();
          if (q.width === 0 || q.height === 0) continue;
          nodes++;
          if (q.bottom > card.top && q.top < card.bottom && q.right > card.left && q.left < card.right) hits++;
        }
        return { hits, nodes };
      });
      log(r.hits === 0 && r.nodes > 0, `${label} (${r.nodes} text nodes, ${r.hits} covered)`);
      await ctx.close();
    } catch (e) {
      log(false, `${label}: ${e.message}`);
    }
  }
}

const browser = await chromium.launch();
console.log(`check-dialogue-preview ${origin}`);
await closeTests(browser);
await sweeps(browser);
await lightboxSweeps(browser);
await noTriggerChecks(browser);
await ownerChecks(browser);
await heroOverlapChecks(browser);
await browser.close();
console.log(failures.length ? `\n${failures.length} FAILED` : "\nALL PASSED");
process.exit(failures.length ? 1 : 0);
