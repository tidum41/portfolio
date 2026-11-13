import { chromium } from "playwright";

const SITE = process.env.JOOLA_SITE_BASE ?? "http://localhost:3000";

const CASES = [
  {
    id: "quick-order-portal",
    url: `${SITE}/joola-proto/round5/index.html#/quick-order?embed=1&clean=1&view=portal&screen=quick-order&state=default&latency=0&account=dicks`,
    selector: ".buyer-shell",
    width: 1280,
  },
  {
    id: "qo-compact",
    url: `${SITE}/joola-proto/qo/index.html#/prototypes/quick-order-row?embed=1&clean=1&v=1&line=typed&w=1024&latency=0`,
    selector: "[data-qo-ready]",
    width: 1024,
  },
  {
    id: "qo-reorder",
    url: `${SITE}/joola-proto/qo/index.html#/prototypes/quick-order-row?embed=1&clean=1&v=3&line=typed&w=1024&latency=0`,
    selector: "[data-qo-ready]",
    width: 1024,
  },
  {
    id: "review-checkout",
    url: `${SITE}/joola-proto/round5/index.html#/review?embed=1&clean=1&view=portal&screen=review&state=default&latency=0&account=dicks`,
    selector: ".buyer-shell",
    width: 1280,
  },
  {
    id: "approval-split",
    url: `${SITE}/joola-proto/round5/index.html#/prototypes/approval-queue?embed=1&clean=1&v=3&protoState=default&latency=0`,
    selector: ".admin-shell",
    width: 1280,
  },
  {
    id: "approval-ledger",
    url: `${SITE}/joola-proto/round5/index.html#/prototypes/approval-queue?embed=1&clean=1&v=1&protoState=default&latency=0`,
    selector: ".admin-shell",
    width: 1280,
  },
];

const browser = await chromium.launch();
for (const c of CASES) {
  const page = await browser.newPage();
  const ih = c.iframeHeight ?? 1100;
  await page.setViewportSize({ width: c.width + 16, height: ih + 80, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><body style="margin:0"><iframe id=f src="${c.url}" width="${c.width}" height="${ih}" style="border:0"></iframe></body></html>`,
    { waitUntil: "domcontentloaded" },
  );
  const frame = page.frameLocator("#f");
  await frame.locator(c.selector).waitFor({ timeout: 60000 });
  await page.waitForTimeout(1500);
  const h = await frame.locator(c.selector).evaluate((el) =>
    Math.ceil(el.getBoundingClientRect().height),
  );
  console.log(c.id, h);
  await page.close();
}
await browser.close();
