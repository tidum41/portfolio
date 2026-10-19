/**
 * Cold-load card-focus suite (no ready-flag waits).
 *
 * Every run uses a brand-new browser context with the HTTP cache disabled. A
 * pointer enters a card at a fixed time after DOMContentLoaded and keeps
 * nudging inside it (a real hand never holds perfectly still) until the dim
 * appears. All video state comes from a 20ms in-page sampler installed before
 * any page script runs, so late-mounting videos and late autoplay are seen.
 *
 * Scenarios per run:
 *   t0-300 / t1000 / t3000  hover a card at that offset (keeps nudging), others must
 *                           pause and stay frozen, then hover off and all resume
 *   s0-300 / s1000 / s3000  same, but the pointer lands once and rests (no nudging)
 *   sweep                   rapid card-to-card hops at 3.5s, then hover off
 *   rules                   gap, hero/nav, scroll-hold, scroll-away, leave-grid
 *
 * Run: node scripts/verify-card-focus-cold.mjs --base https://www.muditm.com \
 *        --runs 20 --out /tmp/cold-prod.json [--only t0-300,t1000,t3000,s0-300,s1000,s3000,sweep,rules]
 *        [--share <vercel share url>] [--cpu 4] [--net 4g|3g|fast] [--bypass-intro 1] [--keep-snaps 1]
 */
import { chromium } from "playwright";
import fs from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1]]);
    return acc;
  }, []),
);
const BASE = (args.base || "http://localhost:3000").replace(/\/$/, "");
const RUNS = Number(args.runs || 20);
const OUT = args.out || "/tmp/card-focus-cold.json";
const ONLY = (args.only || "t0-300,t1000,t3000,s0-300,s1000,s3000,sweep,rules").split(",");
const EXTRA_HEADERS = args.header ? Object.fromEntries([args.header.split(/:(.+)/).slice(0, 2)]) : undefined;
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const PAUSE_ALLOW_MS = 250; // dim -> every other video paused
const FREEZE_MS = 500; // paused AND frozen for this long after the allowance
const RESUME_DEADLINE_MS = 2500; // hover-off -> every in-view video playing
const FOCUS_DEADLINE_MS = 8000;

/** Pointer lands once and rests (no nudging) while true. Set per scenario. */
let stationary = false;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dbg = (...a) => process.env.DEBUG_COLD && console.error("[dbg]", ...a);

const INIT = () => {
  const w = window;
  w.__snaps = [];
  w.__dimAt = null;
  w.__undimAt = null;
  const ids = new WeakMap();
  let next = 1;
  const vid = (v) => {
    if (!ids.has(v)) ids.set(v, next++);
    return ids.get(v);
  };
  const snap = () => {
    const de = document.documentElement;
    const active = document.querySelector("[data-card-focus-active]");
    const vids = [];
    for (const v of document.querySelectorAll(".portfolio-grid-card video")) {
      const r = v.getBoundingClientRect();
      const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      vids.push({
        i: vid(v),
        c: v.closest(".portfolio-grid-card")?.getAttribute("data-grid-card") ?? null,
        p: v.paused,
        t: v.currentTime,
        rs: v.readyState,
        v: inView,
      });
    }
    if (w.__snaps.length < 6000) {
      w.__snaps.push({
        t: performance.now(),
        f: de.hasAttribute("data-card-focus"),
        a: active ? active.getAttribute("data-grid-card") : null,
        vids,
      });
    }
  };
  setInterval(snap, 20);
  const watch = () => {
    new MutationObserver(() => {
      const on = document.documentElement.hasAttribute("data-card-focus");
      if (on && w.__dimAt == null) w.__dimAt = performance.now();
      if (!on && w.__dimAt != null && w.__undimAt == null) w.__undimAt = performance.now();
    }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-card-focus"] });
  };
  watch();
  document.addEventListener("DOMContentLoaded", () => {
    w.__dcl = performance.now();
  });
  w.__resetMarks = () => {
    w.__dimAt = null;
    w.__undimAt = null;
  };
};

async function newRun(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: EXTRA_HEADERS,
    serviceWorkers: "block",
  });
  // Protected previews: a Vercel share link sets the auth cookie on the context
  // without ever loading the site in the page, so the page load stays cold.
  if (args.share) await context.request.get(args.share);
  const page = await context.newPage();
  await page.addInitScript(INIT);
  if (args["bypass-intro"]) {
    // The first-load intro keeps the grid pointer-events:none for ~1.9s after
    // hydration. This makes cards hit-testable from the first paint so a hover
    // can land before hydration.
    await page.addInitScript(() => {
      const css =
        'html[data-intro] body .intro-hide, html[data-intro] body .intro-hide--snap{pointer-events:auto!important}';
      const add = () => {
        const st = document.createElement("style");
        st.textContent = css;
        (document.head || document.documentElement).appendChild(st);
      };
      if (document.head) add();
      else new MutationObserver((_, o) => { if (document.head) { o.disconnect(); add(); } }).observe(document, { childList: true, subtree: true });
    });
  }
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (args.cpu) await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(args.cpu) });
  if (args.net) {
    const profiles = {
      fast: { downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8, latency: 40 },
      "4g": { downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8, latency: 100 },
      "3g": { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 300 },
    };
    await cdp.send("Network.emulateNetworkConditions", { offline: false, ...profiles[args.net] });
  }
  return { context, page, cdp };
}

const now = (page) => page.evaluate(() => performance.now());

async function waitSinceDcl(page, ms) {
  for (;;) {
    const elapsed = await page.evaluate(() => (window.__dcl == null ? 0 : performance.now() - window.__dcl));
    const remaining = ms - elapsed;
    if (remaining <= 0) return elapsed;
    if (remaining > 40) await sleep(remaining - 25);
  }
}

async function cardRects(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".portfolio-grid-card[data-grid-card]")].map((c) => {
      const r = c.getBoundingClientRect();
      return { id: c.getAttribute("data-grid-card"), x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );
}

function pickPoint(rect, jitter = 0) {
  const x = rect.x + rect.w / 2 + (Math.random() - 0.5) * jitter * 2;
  const top = Math.min(rect.h * 0.3, 150);
  const y = Math.max(rect.y + top, 70) + (Math.random() - 0.5) * jitter * 2;
  return { x, y };
}

/** Cards whose pointer point is on screen (rows below the fold are skipped). */
async function visibleCards(page) {
  const rects = await cardRects(page);
  return rects.filter((r) => {
    const p = pickPoint(r);
    return r.w > 100 && r.h > 100 && p.y > 60 && p.y < 880 && p.y < r.y + r.h;
  });
}

/** Enter a card and keep nudging inside it until the dim appears. */
async function hoverAndWaitDim(page, preferIndex) {
  const startedAt = await now(page);
  let chosenId = null;
  const t0 = Date.now();
  while (Date.now() - t0 < FOCUS_DEADLINE_MS) {
    const vis = await visibleCards(page);
    if (vis.length && !(stationary && chosenId)) {
      const card = chosenId ? vis.find((c) => c.id === chosenId) || vis[0] : vis[preferIndex % vis.length];
      chosenId = card.id;
      const p = pickPoint(card, 4);
      await page.mouse.move(p.x, p.y, { steps: 2 });
    }
    const on = await page.evaluate(() => document.documentElement.hasAttribute("data-card-focus"));
    if (on) {
      const dimAt = await page.evaluate(() => window.__dimAt);
      return { startedAt, dimAt, chosenId };
    }
    await sleep(60);
  }
  return { startedAt, dimAt: null, chosenId };
}

async function keepNudging(page, chosenId, untilPerfMs) {
  for (;;) {
    const t = await now(page);
    if (t >= untilPerfMs) return;
    const rects = await cardRects(page);
    const card = rects.find((r) => r.id === chosenId);
    if (card && !stationary) {
      const p = pickPoint(card, 4);
      await page.mouse.move(p.x, p.y);
    }
    await sleep(Math.min(70, Math.max(0, untilPerfMs - t)));
  }
}

const compactSnaps = (snaps, dimAt, offAt) =>
  snaps
    .filter((s) => s.t >= dimAt - 400)
    .map((s) => ({
      dt: Math.round(s.t - dimAt),
      off: Math.round(s.t - offAt),
      f: s.f,
      a: s.a,
      v: s.vids.map((v) => `${v.i}${v.p ? "P" : "p"}${v.t.toFixed(2)}${v.v ? "" : "~"}`).join(" "),
    }));

/** A starved main thread (CPU throttle) can leave the sampler short of the window. */
async function waitCoverage(page, untilPerfMs) {
  for (let i = 0; i < 40; i++) {
    const last = await page.evaluate(() => window.__snaps.at(-1)?.t ?? 0);
    if (last >= untilPerfMs) return;
    await sleep(100);
  }
}

const snapsBetween = (snaps, a, b) => snaps.filter((s) => s.t >= a && s.t <= b);

/** Analyse one hover window: others paused + frozen while focus is on. */
function analysePause(snaps, dimAt, endAt) {
  const result = { ok: true, reasons: [], othersSeen: 0, pauseLatencyMs: null, playingAtDimSnap: 0 };
  const after = snapsBetween(snaps, dimAt - 1, endAt);
  if (!after.length) return { ...result, ok: false, reasons: ["no-snapshots"] };

  const bad = (s) => s.vids.filter((v) => s.a !== v.c && !v.p);
  const othersAt = (s) => s.vids.filter((v) => s.a !== v.c);
  result.othersSeen = Math.max(0, ...after.map((s) => othersAt(s).length));
  result.playingAtDimSnap = bad(after[0]).length;

  let lastBad = null;
  for (const s of after) if (bad(s).length) lastBad = s;
  result.pauseLatencyMs = lastBad ? Math.round(lastBad.t - dimAt) : 0;

  const judged = after.filter((s) => s.t >= dimAt + PAUSE_ALLOW_MS);
  const violated = judged.filter((s) => bad(s).length);
  if (violated.length) {
    result.ok = false;
    result.reasons.push(
      `playing-while-dimmed (${violated.length}/${judged.length} samples, latest +${Math.round(violated.at(-1).t - dimAt)}ms)`,
    );
  }

  // currentTime frozen: playback shows up as many small steps; hls.js seeking a
  // paused video to the poster frame is one large jump and is reported apart.
  const drift = new Map();
  const seeks = new Map();
  for (let k = 1; k < judged.length; k++) {
    const prev = new Map(othersAt(judged[k - 1]).map((v) => [v.i, v.t]));
    for (const v of othersAt(judged[k])) {
      if (!prev.has(v.i)) continue;
      const d = v.t - prev.get(v.i);
      if (d > 0.3 || d < -0.01) seeks.set(v.i, (seeks.get(v.i) || 0) + 1);
      else if (d > 0) drift.set(v.i, (drift.get(v.i) || 0) + d);
    }
  }
  for (const [i, d] of drift) {
    if (d > 0.03) {
      result.ok = false;
      result.reasons.push(`currentTime-advanced video#${i} (+${d.toFixed(2)}s)`);
    }
  }
  result.seekedWhilePaused = seeks.size;
  const span = judged.length ? judged.at(-1).t - judged[0].t : 0;
  if (span < FREEZE_MS - 60) {
    result.ok = false;
    result.reasons.push(`window-too-short (${Math.round(span)}ms)`);
  }
  return result;
}

/** Hover off, then every in-view video must be playing and advancing. */
function analyseResume(snaps, offAt, doneAt) {
  const result = { ok: true, reasons: [], inViewVideos: 0, resumeLatencyMs: null };
  const after = snapsBetween(snaps, offAt, doneAt);
  if (!after.length) return { ...result, ok: false, reasons: ["no-snapshots"] };
  const tail = after.filter((s) => s.t >= doneAt - 600);
  const last = tail.at(-1);
  const inView = last.vids.filter((v) => v.v);
  result.inViewVideos = inView.length;
  if (!inView.length) {
    result.ok = false;
    result.reasons.push("no-in-view-videos");
    return result;
  }
  if (last.f) {
    result.ok = false;
    result.reasons.push("focus-attr-still-set");
  }
  for (const v of inView) {
    const series = tail.map((s) => s.vids.find((x) => x.i === v.i)).filter(Boolean);
    const stillPaused = series.filter((x) => x.p).length;
    const adv = series.length ? series.at(-1).t - series[0].t : 0;
    if (stillPaused) {
      result.ok = false;
      result.reasons.push(`video#${v.i} paused after hover-off (card ${v.c})`);
    } else if (adv < 0.05 && v.rs >= 3) {
      result.ok = false;
      result.reasons.push(`video#${v.i} not advancing after hover-off (card ${v.c}, +${adv.toFixed(2)}s)`);
    }
  }
  // Latency: first time after which every in-view video stays unpaused.
  let lastPausedT = offAt;
  for (const s of after) {
    if (s.vids.some((v) => v.v && v.p)) lastPausedT = s.t;
  }
  result.resumeLatencyMs = Math.round(lastPausedT - offAt);
  if (result.resumeLatencyMs > RESUME_DEADLINE_MS) {
    result.ok = false;
    result.reasons.push(`resume-too-slow (${result.resumeLatencyMs}ms)`);
  }
  return result;
}

async function hoverOff(page) {
  const offAt = await now(page);
  await page.mouse.move(8, 8, { steps: 3 });
  return offAt;
}

async function loadCold(page, jitterLoad = true) {
  void jitterLoad;
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
}

async function runTiming(browser, label, offsetMs, runIdx, still = false) {
  stationary = still;
  const { context, page } = await newRun(browser);
  const out = { scenario: label, run: runIdx, ok: false, reasons: [] };
  try {
    dbg("goto");
    await loadCold(page);
    dbg("loaded");
    const target = offsetMs === "random" ? Math.round(Math.random() * 300) : offsetMs;
    out.hoverTargetMs = target;
    out.hoverActualMs = Math.round(await waitSinceDcl(page, target));
    dbg("hover");
    const { startedAt, dimAt, chosenId } = await hoverAndWaitDim(page, runIdx);
    dbg("dim", dimAt);
    if (dimAt == null) {
      out.reasons.push("never-dimmed");
      return out;
    }
    out.dimDelayMs = Math.round(dimAt - startedAt);
    out.dimSinceDclMs = Math.round(await page.evaluate((d) => d - window.__dcl, dimAt));
    const endAt = dimAt + PAUSE_ALLOW_MS + FREEZE_MS + 150;
    await keepNudging(page, chosenId, endAt);
    await waitCoverage(page, endAt);
    const snaps = await page.evaluate(() => window.__snaps);
    const pause = analysePause(snaps, dimAt, endAt);
    out.pause = pause;

    const offAt = await hoverOff(page);
    await sleep(RESUME_DEADLINE_MS + 700);
    const snaps2 = await page.evaluate(() => window.__snaps);
    const doneAt = offAt + RESUME_DEADLINE_MS + 700;
    const resume = analyseResume(snaps2, offAt, doneAt);
    out.resume = resume;
    if (args["keep-snaps"] || !(pause.ok && resume.ok)) out.snaps = compactSnaps(snaps2, dimAt, offAt);
    out.ok = pause.ok && resume.ok;
    out.reasons.push(...pause.reasons.map((r) => `pause: ${r}`), ...resume.reasons.map((r) => `resume: ${r}`));
  } catch (e) {
    out.reasons.push(`exception: ${String(e).split("\n")[0]}`);
  } finally {
    await context.close();
  }
  return out;
}

async function runSweep(browser, runIdx) {
  const { context, page } = await newRun(browser);
  const out = { scenario: "sweep", run: runIdx, ok: false, reasons: [] };
  try {
    await loadCold(page);
    await waitSinceDcl(page, 3500);
    const first = await hoverAndWaitDim(page, 0);
    if (first.dimAt == null) {
      out.reasons.push("never-dimmed");
      return out;
    }
    await sleep(300);
    const vis = await visibleCards(page);
    if (vis.length < 2) {
      out.reasons.push(`need >=2 visible cards, saw ${vis.length}`);
      return out;
    }
    const hops = [];
    const order = [];
    for (let i = 0; i < 16; i++) order.push(vis[(i * 3 + (i % 2)) % vis.length].id);
    for (const id of order) {
      const rects = await cardRects(page);
      const card = rects.find((r) => r.id === id);
      const p = pickPoint(card, 6);
      const arrive = await now(page);
      await page.mouse.move(p.x, p.y, { steps: 5 });
      await sleep(160);
      hops.push({ id, arrive, end: await now(page) });
    }
    await sleep(100);
    const snaps = await page.evaluate(() => window.__snaps);
    let badHops = 0;
    for (const h of hops) {
      const s = snaps.filter((x) => x.t <= h.end).at(-1);
      if (!s) continue;
      const wrongActive = s.a !== h.id;
      const playing = s.vids.filter((v) => v.c !== h.id && !v.p);
      if (wrongActive || playing.length) {
        badHops++;
        out.reasons.push(
          `hop->${h.id}: active=${s.a}${playing.length ? `, ${playing.length} other video(s) playing` : ""}`,
        );
      }
    }
    out.hops = hops.length;
    out.badHops = badHops;

    // Settle on the last card, then check frozen + resume.
    const lastId = hops.at(-1).id;
    const settleAt = (await now(page)) + 750;
    await keepNudging(page, lastId, settleAt);
    const snapsB = await page.evaluate(() => window.__snaps);
    const lastHop = hops.at(-1);
    const pause = analysePause(snapsB, lastHop.arrive, settleAt);
    if (!pause.ok) out.reasons.push(...pause.reasons.map((r) => `settle: ${r}`));

    const offAt = await hoverOff(page);
    await sleep(RESUME_DEADLINE_MS + 700);
    const snapsC = await page.evaluate(() => window.__snaps);
    const resume = analyseResume(snapsC, offAt, offAt + RESUME_DEADLINE_MS + 700);
    out.resume = resume;
    out.ok = badHops === 0 && pause.ok && resume.ok;
    out.reasons.push(...resume.reasons.map((r) => `resume: ${r}`));
  } catch (e) {
    out.reasons.push(`exception: ${String(e).split("\n")[0]}`);
  } finally {
    await context.close();
  }
  return out;
}

async function runRules(browser, runIdx) {
  const { context, page } = await newRun(browser);
  const out = { scenario: "rules", run: runIdx, ok: false, reasons: [] };
  const fail = (m) => out.reasons.push(m);
  const focusState = () =>
    page.evaluate(() => ({
      f: document.documentElement.hasAttribute("data-card-focus"),
      a: document.querySelector("[data-card-focus-active]")?.getAttribute("data-grid-card") ?? null,
    }));
  try {
    await loadCold(page);
    await waitSinceDcl(page, 3500);
    const first = await hoverAndWaitDim(page, runIdx);
    if (first.dimAt == null) {
      fail("never-dimmed");
      return out;
    }
    await sleep(350);

    // Hero + nav never dim.
    const dimmed = await page.evaluate(() => {
      const chainOpacity = (el) => {
        let o = 1;
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          o *= Number(getComputedStyle(n).opacity);
        }
        return o;
      };
      const probes = { h1: document.querySelector("h1"), nav: document.querySelector("nav, header") };
      const res = {};
      for (const [k, el] of Object.entries(probes)) res[k] = el ? chainOpacity(el) : null;
      return res;
    });
    for (const [k, o] of Object.entries(dimmed)) {
      if (o != null && o < 0.95) fail(`${k} dimmed while card focused (opacity ${o.toFixed(2)})`);
    }

    // Gap: move into the gutter between the two columns at the same y.
    const vis = await visibleCards(page);
    const cols = [...new Set(vis.map((c) => Math.round(c.x)))].sort((a, b) => a - b);
    if (cols.length >= 2) {
      const left = vis.find((c) => Math.round(c.x) === cols[0]);
      const right = vis.find((c) => Math.round(c.x) === cols[1]);
      const gx = (left.x + left.w + right.x) / 2;
      const gy = left.y + Math.min(left.h * 0.3, 150);
      await page.mouse.move(gx, gy, { steps: 4 });
      await sleep(350);
      const s = await focusState();
      if (s.f) fail("gap kept/gave focus");
      await sleep(RESUME_DEADLINE_MS);
    } else fail("could not find a gutter");

    // Scroll hold: same card under the cursor keeps focus.
    const second = await hoverAndWaitDim(page, runIdx);
    if (second.dimAt == null) fail("never re-dimmed after gap");
    else {
      await sleep(350);
      const before = await focusState();
      await page.mouse.wheel(0, 40);
      await sleep(500);
      const after = await focusState();
      if (!after.f || after.a !== before.a) fail(`scroll with same card under cursor lost focus (${before.a} -> ${after.a})`);

      // Scroll away: card leaves the cursor, focus resets, no auto-focus.
      await page.mouse.wheel(0, 1400);
      await sleep(900);
      const away = await focusState();
      if (away.f) fail(`focus did not reset when card scrolled away (active ${away.a})`);
      await page.mouse.wheel(0, -4000);
      await sleep(900);
    }

    // Leave the grid.
    const third = await hoverAndWaitDim(page, runIdx);
    if (third.dimAt == null) fail("never re-dimmed before leave");
    else {
      await sleep(300);
      await page.mouse.move(8, 8, { steps: 3 });
      await sleep(350);
      const s = await focusState();
      if (s.f) fail("focus persisted after leaving grid");
    }
    out.ok = out.reasons.length === 0;
  } catch (e) {
    fail(`exception: ${String(e).split("\n")[0]}`);
  } finally {
    await context.close();
  }
  return out;
}

function pct(n, d) {
  return d ? `${((100 * n) / d).toFixed(0)}%` : "n/a";
}

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--no-sandbox"],
  });
  const results = [];
  const scenarios = [];
  if (ONLY.includes("t0-300")) scenarios.push(["t0-300", (b, i) => runTiming(b, "t0-300", "random", i)]);
  if (ONLY.includes("t1000")) scenarios.push(["t1000", (b, i) => runTiming(b, "t1000", 1000, i)]);
  if (ONLY.includes("t3000")) scenarios.push(["t3000", (b, i) => runTiming(b, "t3000", 3000, i)]);
  if (ONLY.includes("s0-300")) scenarios.push(["s0-300", (b, i) => runTiming(b, "s0-300", "random", i, true)]);
  if (ONLY.includes("s1000")) scenarios.push(["s1000", (b, i) => runTiming(b, "s1000", 1000, i, true)]);
  if (ONLY.includes("s3000")) scenarios.push(["s3000", (b, i) => runTiming(b, "s3000", 3000, i, true)]);
  if (ONLY.includes("sweep")) scenarios.push(["sweep", (b, i) => runSweep(b, i)]);
  if (ONLY.includes("rules")) scenarios.push(["rules", (b, i) => runRules(b, i)]);

  for (let i = 0; i < RUNS; i++) {
    for (const [name, fn] of scenarios) {
      const r = await fn(browser, i);
      results.push(r);
      console.log(
        `${name.padEnd(7)} #${String(i).padStart(2)} ${r.ok ? "PASS" : "FAIL"}` +
          (r.dimDelayMs != null ? ` dim+${r.dimDelayMs}ms` : "") +
          (r.pause?.pauseLatencyMs != null ? ` pauseLat=${r.pause.pauseLatencyMs}ms` : "") +
          (r.resume?.resumeLatencyMs != null ? ` resumeLat=${r.resume.resumeLatencyMs}ms` : "") +
          (r.ok ? "" : ` :: ${r.reasons.slice(0, 3).join(" | ")}`),
      );
      fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    }
  }
  await browser.close();

  console.log(`\n== ${BASE} (${RUNS} cold loads per scenario) ==`);
  for (const [name] of scenarios) {
    const rs = results.filter((r) => r.scenario === name);
    const ok = rs.filter((r) => r.ok).length;
    const pauseFail = rs.filter((r) => r.pause && !r.pause.ok).length;
    const resumeFail = rs.filter((r) => r.resume && !r.resume.ok).length;
    console.log(
      `${name.padEnd(7)} pass ${ok}/${rs.length} (${pct(ok, rs.length)})  fail ${rs.length - ok}` +
        (/^[ts]\d/.test(name) || name === "sweep" ? `  [pause-fail ${pauseFail}, resume-fail ${resumeFail}]` : ""),
    );
  }
  const anyFail = results.some((r) => !r.ok);
  process.exit(anyFail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
