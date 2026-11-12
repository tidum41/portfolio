/**
 * Compare static prototype URL vs same URL inside portfolio iframe (1:1 target <0.5%).
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = process.env.JOOLA_SITE_BASE ?? "http://localhost:3000";
/** `harness` (default): static `joola-embed-harness.html` mirrors JoolaProtoIframe; `next`: `/joola/parity` (Playwright ~2% vs standalone). */
const PIXEL_HOST = process.env.JOOLA_PIXEL_HOST ?? "harness";
const OUT = path.resolve("artifacts/joola-sanity/pixel-diff");

/** Must match `lib/joola/protoEmbed.ts` JOOLA_EMBED_HEIGHT (iframe slot = viewport). */
const EMBED_H = {
  heroCompact: 680,
  portal: 1000,
  qoSearch: 900,
  qoCompare: 1035,
  review: 560,
  approvalSplit: 824,
  approvalLedger: 896,
};

const CASES = [
  {
    id: "qo-hero-compact",
    figure: "quick-order-hero",
    path: "/joola-proto/qo/index.html",
    hash: "/prototypes/quick-order-row",
    params: "embed=1&clean=1&v=1&line=typed&w=1280&rows=5&latency=0",
    selector: "[data-qo-ready]",
    width: 1280,
    iframeHeight: EMBED_H.heroCompact,
  },
  {
    id: "quick-order-portal",
    figure: "quick-order-portal",
    path: "/joola-proto/round5/index.html",
    hash: "/quick-order",
    params: "embed=1&clean=1&view=portal&screen=quick-order&state=default&latency=0&account=dicks",
    selector: ".buyer-shell",
    width: 1280,
    iframeHeight: EMBED_H.portal,
  },
  {
    id: "qo-compact",
    figure: "quick-order-row-search",
    path: "/joola-proto/qo/index.html",
    hash: "/prototypes/quick-order-row",
    params: "embed=1&clean=1&v=1&line=typed&w=1024&latency=0",
    selector: "[data-qo-ready]",
    width: 1024,
    iframeHeight: EMBED_H.qoSearch,
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
    iframeHeight: EMBED_H.qoCompare,
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
    iframeHeight: EMBED_H.qoCompare,
  },
  {
    id: "review-checkout",
    figure: "review-checkout",
    path: "/joola-proto/round5/index.html",
    hash: "/review",
    params: "embed=1&clean=1&view=portal&screen=review&state=default&latency=0&account=dicks",
    selector: ".buyer-shell",
    width: 1280,
    iframeHeight: EMBED_H.review,
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
    iframeHeight: EMBED_H.approvalSplit,
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
    iframeHeight: EMBED_H.approvalLedger,
  },
];

function protoUrl(c) {
  return `${SITE}${c.path}#${c.hash}?${c.params}`;
}

async function loadPng(file) {
  return PNG.sync.read(await readFile(file));
}

async function waitFrameReady(frame, c) {
  const root = frame.locator(c.selector).first();
  await root.waitFor({ state: "visible", timeout: 60000 });
  if (c.hash.includes("quick-order-row")) {
    await frame.locator("[data-qo-ready]").first().waitFor({ timeout: 20000 });
  } else if (c.hash === "/quick-order") {
    await frame.locator(".page--qo").first().waitFor({ timeout: 20000 });
    await frame
      .locator(".page-skel, .skel--table")
      .first()
      .waitFor({ state: "detached", timeout: 20000 })
      .catch(() => {});
  } else if (c.hash === "/review") {
    await frame.locator(".page--review").first().waitFor({ timeout: 20000 });
    await frame
      .locator(".page-skel")
      .first()
      .waitFor({ state: "detached", timeout: 20000 })
      .catch(() => {});
  }
  await frame
    .locator("body")
    .evaluate(() => document.fonts?.ready)
    .catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));
}

/** Reference: static app in a fixed-height iframe (matches portfolio embed harness). */
async function shotProto(page, c, outPath) {
  const url = protoUrl(c);
  const ih = c.iframeHeight;
  await page.setViewportSize({
    width: c.width + 16,
    height: ih + 80,
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><body style="margin:0"><iframe id=f src="${url}" width="${c.width}" height="${ih}" style="border:0"></iframe></body></html>`,
    { waitUntil: "domcontentloaded" },
  );
  const frame = page.frameLocator("#f");
  await waitFrameReady(frame, c);
  await frame.locator(c.selector).first().screenshot({
    path: outPath,
    animations: "disabled",
  });
}

function parityQuery(c) {
  const q = new URLSearchParams({ figure: c.figure });
  if (c.tab === "Compact") q.set("variant", "1");
  if (c.tab === "Reorder") q.set("variant", "3");
  if (c.tab === "Stock status") q.set("variant", "4");
  if (c.tab === "Ledger") q.set("tab", "ledger");
  if (c.tab === "Split inbox") q.set("tab", "split");
  return q.toString();
}

async function shotIframe(page, c, outPath) {
  const ih = c.iframeHeight;
  // Wider than design width so parity bench scale stays 1:1 (no scrollbar narrowing host).
  await page.setViewportSize({ width: c.width + 64, height: ih + 120, deviceScaleFactor: 1 });
  const portfolioUrl =
    PIXEL_HOST === "next"
      ? `${SITE}/joola/parity?${parityQuery(c)}`
      : `${SITE}/joola-embed-harness.html?${parityQuery(c)}`;
  await page.goto(portfolioUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  const fig = page.locator(`[data-joola-figure="${c.figure}"]`);
  await page.evaluate(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  });
  await fig.waitFor({ state: "visible", timeout: 60000 });
  const frame = page.frameLocator(`[data-joola-figure="${c.figure}"] iframe`);
  await waitFrameReady(frame, c);
  await frame.locator(c.selector).first().screenshot({
    path: outPath,
    animations: "disabled",
  });
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
