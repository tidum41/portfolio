/**
 * Compare static prototype URL vs same URL inside portfolio iframe (1:1 target <0.5%).
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = process.env.JOOLA_SITE_BASE ?? "http://localhost:3000";
const OUT = path.resolve("artifacts/joola-sanity/pixel-diff");

const CASES = [
  {
    id: "quick-order-portal",
    figure: "quick-order-portal",
    path: "/joola-proto/round5/index.html",
    hash: "/quick-order",
    params: "embed=1&clean=1&view=portal&screen=quick-order&state=default&latency=0&account=dicks",
    selector: ".buyer-shell",
    width: 1280,
  },
  {
    id: "qo-compact",
    figure: "quick-order-row-search",
    path: "/joola-proto/qo/index.html",
    hash: "/prototypes/quick-order-row",
    params: "embed=1&clean=1&v=1&line=typed&w=1024&latency=0",
    selector: "[data-qo-ready]",
    width: 1024,
  },
  {
    id: "qo-cases",
    figure: "quick-order-row-compare",
    path: "/joola-proto/qo/index.html",
    hash: "/prototypes/quick-order-row",
    params: "embed=1&clean=1&v=2&line=typed&w=1024&latency=0",
    selector: "[data-qo-ready]",
    width: 1024,
    tab: "Cases",
  },
  {
    id: "qo-reorder",
    figure: "quick-order-row-compare",
    path: "/joola-proto/qo/index.html",
    hash: "/prototypes/quick-order-row",
    params: "embed=1&clean=1&v=3&line=typed&w=1024&latency=0",
    selector: "[data-qo-ready]",
    width: 1024,
    tab: "Reorder",
  },
  {
    id: "qo-stock",
    figure: "quick-order-row-compare",
    path: "/joola-proto/qo/index.html",
    hash: "/prototypes/quick-order-row",
    params: "embed=1&clean=1&v=4&line=typed&w=1024&latency=0",
    selector: "[data-qo-ready]",
    width: 1024,
    tab: "Stock status",
  },
  {
    id: "review-checkout",
    figure: "review-checkout",
    path: "/joola-proto/round5/index.html",
    hash: "/review",
    params: "embed=1&clean=1&view=portal&screen=review&state=default&latency=0&account=dicks",
    selector: ".buyer-shell",
    width: 1280,
  },
  {
    id: "approval-split",
    figure: "approval-queue",
    path: "/joola-proto/round5/index.html",
    hash: "/prototypes/approval-queue",
    params: "embed=1&clean=1&v=3&protoState=default&latency=0",
    selector: ".aq",
    width: 1280,
    tab: "Split inbox",
  },
  {
    id: "approval-ledger",
    figure: "approval-queue",
    path: "/joola-proto/round5/index.html",
    hash: "/prototypes/approval-queue",
    params: "embed=1&clean=1&v=1&protoState=default&latency=0",
    selector: ".aq",
    width: 1280,
    tab: "Ledger",
  },
];

function protoUrl(c) {
  return `${SITE}${c.path}#${c.hash}?${c.params}`;
}

async function loadPng(file) {
  return PNG.sync.read(await readFile(file));
}

async function waitFrameReady(frame, c) {
  await frame.waitForSelector(c.selector, { timeout: 60000 });
  if (c.hash.includes("quick-order-row")) {
    await frame.waitForSelector("[data-qo-ready]", { timeout: 20000 });
  } else if (c.hash === "/quick-order") {
    await frame.waitForSelector(".page--qo", { timeout: 20000 });
    await frame
      .waitForFunction(
        () => !document.querySelector(".page-skel, .skel--table"),
        null,
        { timeout: 20000 },
      )
      .catch(() => {});
  } else if (c.hash === "/review") {
    await frame.waitForSelector(".page--review", { timeout: 20000 });
    await frame
      .waitForFunction(
        () => !document.querySelector(".page-skel"),
        null,
        { timeout: 20000 },
      )
      .catch(() => {});
  }
  await frame.waitForFunction(() => document.fonts?.ready, null, {
    timeout: 15000,
  }).catch(() => {});
  await frame.waitForTimeout(1200);
}

/** Reference capture: same URL as portfolio iframe, in a neutral iframe (matches compositor). */
async function shotProto(page, c, outPath) {
  const url = protoUrl(c);
  await page.setViewportSize({ width: c.width, height: 2400, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><body style="margin:0"><iframe id="p" src="${url}" width="${c.width}" height="2400" style="border:0;display:block"></iframe></body></html>`,
    { waitUntil: "domcontentloaded" },
  );
  const frame = await page.locator("#p").elementHandle();
  const inner = await frame?.contentFrame();
  if (!inner) throw new Error("proto iframe missing");
  await waitFrameReady(inner, c);
  await inner.locator(c.selector).first().screenshot({ path: outPath, animations: "disabled" });
}

function parityQuery(c) {
  const q = new URLSearchParams({ figure: c.figure });
  if (c.tab === "Cases") q.set("variant", "2");
  if (c.tab === "Reorder") q.set("variant", "3");
  if (c.tab === "Stock status") q.set("variant", "4");
  if (c.tab === "Ledger") q.set("tab", "ledger");
  if (c.tab === "Split inbox") q.set("tab", "split");
  return q.toString();
}

async function shotIframe(page, c, outPath) {
  await page.setViewportSize({ width: c.width, height: 2400, deviceScaleFactor: 1 });
  await page.goto(`${SITE}/joola/parity?${parityQuery(c)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const fig = page.locator(`[data-joola-figure="${c.figure}"]`);
  await fig.waitFor({ state: "visible", timeout: 60000 });
  const handle = await page
    .locator(`[data-joola-figure="${c.figure}"] iframe`)
    .elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error("iframe contentFrame missing");
  await waitFrameReady(frame, c);
  await frame.locator(c.selector).first().screenshot({ path: outPath, animations: "disabled" });
}

function diffPct(imgA, imgB) {
  const w = Math.min(imgA.width, imgB.width);
  const h = Math.min(imgA.height, imgB.height);
  const a = new PNG({ width: w, height: h });
  const b = new PNG({ width: w, height: h });
  PNG.bitblt(imgA, a, 0, 0, w, h, 0, 0);
  PNG.bitblt(imgB, b, 0, 0, w, h, 0, 0);
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
  return { pct: (n / (w * h)) * 100, w, h, diff };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(path.resolve("artifacts/joola-sanity/figures"), { recursive: true });
  const browser = await chromium.launch();
  const protoPage = await browser.newPage();
  const sitePage = await browser.newPage();

  const rows = [];
  let failed = false;

  for (const c of CASES) {
    const protoPath = path.join(OUT, `${c.id}-proto.png`);
    const portPath = path.join(OUT, `${c.id}-portfolio.png`);
    const diffPath = path.join(OUT, `${c.id}-diff.png`);
    try {
      await shotProto(protoPage, c, protoPath);
      await shotIframe(sitePage, c, portPath);
      const a = await loadPng(protoPath);
      const b = await loadPng(portPath);
      const { pct, w, h, diff } = diffPct(a, b);
      await writeFile(diffPath, PNG.sync.write(diff));
      rows.push({
        id: c.id,
        diffPct: pct,
        url: protoUrl(c),
        compareSize: { w, h },
        proto: protoPath,
        portfolio: portPath,
        diff: diffPath,
      });
      if (pct >= 0.5) failed = true;
      console.log(`${c.id}: ${pct.toFixed(3)}%`);
    } catch (err) {
      failed = true;
      rows.push({ id: c.id, error: String(err), url: protoUrl(c) });
      console.error(c.id, err);
    }
  }

  await browser.close();
  const json = JSON.stringify(rows, null, 2);
  await writeFile(path.join(OUT, "diff-table.json"), json);
  await writeFile(path.resolve("artifacts/joola-sanity/figures/diff-table.json"), json);
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
