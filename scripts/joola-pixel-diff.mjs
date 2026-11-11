/**
 * Pixel-compare portfolio JOOLA embeds vs Vite prototype (same selector, DPR 1).
 * Requires: vite preview on JOOLA_PROTO_BASE, portfolio dev on JOOLA_SITE_BASE with SANITY_PREVIEW_DRAFTS=1.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const PROTO = process.env.JOOLA_PROTO_BASE ?? "http://127.0.0.1:4173";
const SITE = process.env.JOOLA_SITE_BASE ?? "http://localhost:3000";
const OUT = path.resolve("artifacts/joola-sanity/pixel-diff");

/** @type {Array<{id: string, protoUrl: string, selector: string, figure: string, width: number, portfolioVariant?: string}>} */
const CASES = [
  {
    id: "quick-order-portal",
    protoUrl: `${PROTO}/quick-order?clean=1&view=portal&screen=quick-order&state=default&latency=0&account=dicks`,
    selector: ".buyer-shell",
    figure: "quick-order-portal",
    width: 1280,
  },
  {
    id: "qo-compact",
    protoUrl: `${PROTO}/prototypes/quick-order-row?clean=1&v=1&line=typed&w=1024&latency=0`,
    selector: "[data-qo-ready]",
    figure: "quick-order-row-search",
    width: 1024,
  },
  {
    id: "qo-cases",
    protoUrl: `${PROTO}/prototypes/quick-order-row?clean=1&v=2&line=typed&w=1024&latency=0`,
    selector: "[data-qo-ready]",
    figure: "quick-order-row-compare",
    width: 1024,
    portfolioVariant: "cases",
  },
  {
    id: "qo-reorder",
    protoUrl: `${PROTO}/prototypes/quick-order-row?clean=1&v=3&line=typed&w=1024&latency=0`,
    selector: "[data-qo-ready]",
    figure: "quick-order-row-compare",
    width: 1024,
    portfolioVariant: "reorder",
  },
  {
    id: "qo-stock",
    protoUrl: `${PROTO}/prototypes/quick-order-row?clean=1&v=4&line=typed&w=1024&latency=0`,
    selector: "[data-qo-ready]",
    figure: "quick-order-row-compare",
    width: 1024,
    portfolioVariant: "stock",
  },
  {
    id: "review-checkout",
    protoUrl: `${PROTO}/review?clean=1&view=portal&screen=review&state=default&latency=0&account=dicks`,
    selector: ".buyer-shell",
    figure: "review-checkout",
    width: 1280,
  },
  {
    id: "approval-split",
    protoUrl: `${PROTO}/prototypes/approval-queue?clean=1&v=3&protoState=default`,
    selector: ".aq",
    figure: "approval-queue",
    width: 1280,
    portfolioVariant: "split",
  },
  {
    id: "approval-ledger",
    protoUrl: `${PROTO}/prototypes/approval-queue?clean=1&v=1&protoState=default`,
    selector: ".aq",
    figure: "approval-queue",
    width: 1280,
    portfolioVariant: "ledger",
  },
];

const VARIANT_TAB = {
  cases: "Cases",
  reorder: "Reorder",
  stock: "Stock status",
  split: "Split inbox",
  ledger: "Ledger",
};

async function loadPng(file) {
  return PNG.sync.read(await readFile(file));
}

async function waitFonts(page) {
  await page.evaluate(() => document.fonts?.ready);
}

async function shotProto(page, url, selector, width, outPath) {
  await page.setViewportSize({ width, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitFonts(page);
  if (url.includes("quick-order-row")) {
    await page.waitForSelector("[data-qo-ready]", { timeout: 20000 });
  } else if (url.includes("/quick-order")) {
    await page
      .waitForSelector(".buyer-shell .page-skel", { state: "detached", timeout: 20000 })
      .catch(() => {});
    await page.waitForSelector(".page--qo", { timeout: 20000 });
  } else if (url.includes("/review")) {
    await page.waitForSelector(".page--review", { timeout: 20000 });
  } else if (url.includes("approval-queue")) {
    await page.waitForSelector(".aq", { timeout: 20000 });
  }
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(300);
  await loc.screenshot({ path: outPath });
}

async function shotPortfolio(page, figure, selector, variant, width, outPath) {
  await page.setViewportSize({ width, height: 900, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    document.documentElement.dataset.joolaParity = "1";
  });
  await page.goto(`${SITE}/joola`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.addStyleTag({
    content: `
      html[data-joola-parity="1"] .cs-layout { grid-template-columns: 1fr !important; }
      html[data-joola-parity="1"] .cs-aside { display: none !important; }
      html[data-joola-parity="1"] .cs-content {
        max-width: ${width}px !important;
        width: ${width}px !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      html[data-joola-parity="1"] [data-joola-figure] .joola-proto-figure__chrome {
        max-width: none !important;
        width: ${width}px !important;
        overflow: visible !important;
      }
      html[data-joola-parity="1"] [data-dialkit],
      html[data-joola-parity="1"] .dialkit-floating-anchor,
      html[data-joola-parity="1"] .dialkit-panel {
        display: none !important;
      }
    `,
  });
  await waitFonts(page);
  const figureLoc = page.locator(`[data-joola-figure="${figure}"]`);
  await figureLoc.waitFor({ state: "visible", timeout: 60000 });
  await figureLoc.scrollIntoViewIfNeeded();
  if (variant) {
    const label = VARIANT_TAB[variant];
    await page.getByRole("tab", { name: label }).click();
    await page.waitForTimeout(400);
  }
  await page.evaluate(
    ({ figure: figId, w }) => {
      const fig = document.querySelector(`[data-joola-figure="${figId}"]`);
      if (!fig) return;
      const host = fig.querySelector(".joola-uniform-scale");
      const inner = host?.querySelector(":scope > div");
      if (host) {
        host.style.width = `${w}px`;
        host.style.height = "auto";
        host.style.overflow = "visible";
      }
      if (inner) {
        inner.style.transform = "none";
        inner.style.width = `${w}px`;
      }
    },
    { figure, w: width },
  );
  await page.waitForTimeout(300);
  const root = figureLoc.locator(selector).first();
  await root.waitFor({ state: "visible", timeout: 20000 });
  await root.screenshot({ path: outPath });
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
  return { pct: (n / (w * h)) * 100, w, h, n, diff };
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
      await shotProto(protoPage, c.protoUrl, c.selector, c.width, protoPath);
      await shotPortfolio(
        sitePage,
        c.figure,
        c.selector,
        c.portfolioVariant,
        c.width,
        portPath,
      );
      const a = await loadPng(protoPath);
      const b = await loadPng(portPath);
      const { pct, w, h, diff } = diffPct(a, b);
      await writeFile(diffPath, PNG.sync.write(diff));
      rows.push({
        id: c.id,
        diffPct: pct,
        compareSize: { w, h },
        protoSize: { w: a.width, h: a.height },
        portfolioSize: { w: b.width, h: b.height },
        proto: protoPath,
        portfolio: portPath,
        diff: diffPath,
      });
      if (pct >= 0.5) failed = true;
      console.log(`${c.id}: ${pct.toFixed(3)}% (${w}×${h})`);
    } catch (err) {
      failed = true;
      rows.push({ id: c.id, error: String(err) });
      console.error(c.id, err);
    }
  }

  await browser.close();
  const tablePath = path.join(OUT, "diff-table.json");
  await writeFile(tablePath, JSON.stringify(rows, null, 2));
  await writeFile(
    path.resolve("artifacts/joola-sanity/figures/diff-table.json"),
    JSON.stringify(rows, null, 2),
  );
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
