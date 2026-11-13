/**
 * Scan buyer/admin screens for banned copy patterns in the live DOM.
 */
import { chromium } from "playwright";

const base = process.argv[2] || "http://127.0.0.1:4173";
const patterns = [
  { id: "case", re: /Case of|case pack|case count|\bcases\b/i },
  { id: "tier", re: /\btier/i },
  { id: "middot", re: /·/ },
  { id: "templates-heading", re: /\bTemplates\b/ },
  { id: "joola-store", re: /joola\.com store/i },
  { id: "demo-names", re: /Demo names/i },
  { id: "template", re: /template/i },
];

const routes = [
  { path: "/quick-order?clean=1&view=portal&screen=quick-order&state=default&account=dicks", label: "quick-order" },
  { path: "/cart?clean=1&view=portal&screen=cart&state=default&account=dicks", label: "cart" },
  { path: "/saved-orders?clean=1&view=portal&screen=saved-orders&state=default&account=dicks", label: "saved-orders" },
  { path: "/orders?clean=1&view=portal&screen=order-history&state=default&account=dicks", label: "order-history" },
  { path: "/admin/orders?clean=1&view=admin&screen=admin-orders&state=default&account=dicks", label: "admin-orders" },
  { path: "/admin/approvals?clean=1&view=admin&screen=approvals&state=default&account=dicks", label: "admin-approvals" },
  { path: "/prototypes/quick-order-row?clean=1&view=portal&screen=quick-order&state=default&account=dicks&v=1", label: "qo-row-compact" },
  { path: "/prototypes/approval-queue?clean=1&view=admin&screen=approvals&state=default&account=dicks&v=1", label: "aq-prototype" },
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME || "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const results = [];

for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}${route.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(600);
  const text = await page.evaluate(() => document.body.innerText);
  for (const p of patterns) {
    if (p.re.test(text)) {
      const sample = text.match(new RegExp(`.{0,40}${p.re.source}.{0,40}`, "i"))?.[0] ?? "(match)";
      results.push({ route: route.label, pattern: p.id, sample: sample.replace(/\s+/g, " ").trim() });
    }
  }
  await page.close();
}

await browser.close();

console.log(JSON.stringify({ hits: results.length, results }, null, 2));
process.exit(results.length > 0 ? 1 : 0);
