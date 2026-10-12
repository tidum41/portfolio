/**
 * Mechanical QA for the JOOLA B2B HTML prototype.
 * Fails on empty images, overlaps, clipped text, misaligned table columns,
 * oversized avatars, ledger figure mismatches, and em dashes.
 *
 * Usage: node remotion/scripts/check-prototype.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../assets/joola-b2b");
const HTML = join(ROOT, "B2B quick order prototype.html");
const LEDGER = join(ROOT, "ledger.js");
const VIEWPORT = { width: 1920, height: 1080 };
const SCREENS = [
  "qo-desktop",
  "catalog",
  "templates",
  "cart",
  "confirmation",
  "invoices",
  "messages",
  "qo-mobile",
];
// "states" is a QA sheet screen — not part of product film checks

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      let rel = decodeURIComponent(url.pathname);
      if (rel === "/") rel = "/B2B%20quick%20order%20prototype.html";
      rel = decodeURIComponent(rel).replace(/^\//, "");
      const file = join(ROOT, rel);
      if (!file.startsWith(ROOT) || !existsSync(file)) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = extname(file).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function loadLedger() {
  const src = readFileSync(LEDGER, "utf8");
  const fn = new Function(`${src}; return globalThis.JOOLA_LEDGER;`);
  return fn();
}

function parseMoney(text) {
  const out = [];
  const re = /\$[\d,]+(?:\.\d{2})?/g;
  let m;
  while ((m = re.exec(text))) {
    out.push(Math.round(parseFloat(m[0].replace(/[$,]/g, "")) * 100) / 100);
  }
  return out;
}

function nearly(a, b, eps = 0.009) {
  return Math.abs(a - b) <= eps;
}

function inAllowed(n, allowed) {
  return allowed.some((a) => nearly(a, n));
}

async function main() {
  if (!existsSync(HTML) || !existsSync(LEDGER)) {
    console.error("FAIL missing prototype or ledger");
    process.exit(1);
  }
  const ledger = loadLedger();
  const allowedMoney = ledger.figures.allowedMoney;
  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}/B2B%20quick%20order%20prototype.html`;

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.JOOLA_LEDGER && document.querySelector("[data-screen]"));
  await page.evaluate(() => document.fonts.ready);

  const rows = [];
  let failed = false;

  function record(screen, check, pass, detail = "") {
    rows.push({ screen, check, pass, detail });
    if (!pass) failed = true;
  }

  for (const screen of SCREENS) {
    await page.evaluate((id) => {
      document.querySelectorAll(".screen").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-screen") === id);
      });
      document.querySelectorAll("#devSwitcher .tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === id);
      });
      window.scrollTo(0, 0);
    }, screen);
    await page.waitForTimeout(150);

    const result = await page.evaluate(
      ({ screen, allowedMoney, cartTotal, orderTotal, creditUsed, creditLimit, creditAvailable, perseusQty, perseusUnit, buyerBySku }) => {
        const issues = {
          images: [],
          overlaps: [],
          clipped: [],
          tableAlign: [],
          avatar: [],
          ledger: [],
          emdash: [],
          skuPrice: [],
          searchPlaceholder: [],
          footerBand: [],
          joolaMark: [],
          numericAlign: [],
          mediaSurface: [],
          tabularNums: [],
          moneyAlign: [],
          rowHeight: [],
          singleAccent: [],
          statusPill: [],
          imageContain: [],
          multiLine: [],
          ia: [],
          interactionStates: [],
          qoRail: [],
          msgContext: [],
          cartCheckout: [],
          netsuiteLabels: [],
          pixelNits: [],
          fontsLoaded: [],
          typeScale: [],
          lessBetter: [],
        };
        const root = document.querySelector(`[data-screen="${screen}"]`);
        if (!root || !root.classList.contains("active")) {
          issues.images.push("screen not active");
          return issues;
        }

        const visible = (el) => {
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          return (
            r.width > 0 &&
            r.height > 0 &&
            st.visibility !== "hidden" &&
            st.display !== "none" &&
            st.opacity !== "0"
          );
        };

        // Images
        root.querySelectorAll("img").forEach((img) => {
          if (!visible(img)) return;
          const bad =
            !img.complete ||
            img.naturalWidth === 0 ||
            img.naturalHeight === 0 ||
            /placeholder|empty|blank/i.test(img.getAttribute("src") || "") ||
            /placeholder|empty/i.test(img.className || "");
          if (bad) {
            issues.images.push(
              `${img.getAttribute("src") || "(no src)"} natural=${img.naturalWidth}x${img.naturalHeight}`
            );
          }
          // empty grey thumb placeholders (div.thumb without img already excluded)
        });
        root.querySelectorAll(".thumb, .media, [data-rec-card] .media, [data-catalog-card] .media").forEach((box) => {
          if (!visible(box)) return;
          const img = box.tagName === "IMG" ? box : box.querySelector("img");
          if (!img) issues.images.push("thumbnail container without img");
        });

        // Avatar size
        root.querySelectorAll("[data-retailer-avatar], .retailer-avatar").forEach((av) => {
          if (!visible(av)) return;
          const r = av.getBoundingClientRect();
          if (r.width > 40.5 || r.height > 40.5) {
            issues.avatar.push(`avatar ${Math.round(r.width)}x${Math.round(r.height)} > 40`);
          }
          // overlap with nav pills
          const nav = root.querySelector(".nav-pills");
          if (nav) {
            const a = av.getBoundingClientRect();
            const n = nav.getBoundingClientRect();
            const overlap = !(a.right <= n.left || a.left >= n.right || a.bottom <= n.top || a.top >= n.bottom);
            if (overlap) issues.overlaps.push("avatar overlaps nav");
          }
          const switcher = document.getElementById("devSwitcher");
          if (switcher) {
            const a = av.getBoundingClientRect();
            const s = switcher.getBoundingClientRect();
            const overlap = !(a.right <= s.left || a.left >= s.right || a.bottom <= s.top || a.top >= s.bottom);
            if (overlap) issues.overlaps.push("avatar overlaps screen switcher");
          }
        });

        // Header / topbar overlap with page title (sidebar is expected left of content)
        const topbar = root.querySelector("[data-topbar], .topbar, .chrome-bar");
        const h1 = root.querySelector("h1");
        if (topbar && h1 && visible(topbar) && visible(h1)) {
          const c = topbar.getBoundingClientRect();
          const h = h1.getBoundingClientRect();
          const overlap = !(c.right <= h.left || c.left >= h.right || c.bottom <= h.top || c.top >= h.bottom);
          if (overlap) issues.overlaps.push("topbar overlaps h1");
        }
        const sidebar = root.querySelector("[data-sidebar], .sidebar");
        if (sidebar && visible(sidebar)) {
          const sw = sidebar.getBoundingClientRect().width;
          if (sw < 200 || sw > 240) {
            issues.overlaps.push(`sidebar width ${Math.round(sw)}px not ~220`);
          }
        }

        // Clipped text: element content wider than client, or cut by switcher
        const switcherBottom = document.getElementById("devSwitcher")?.getBoundingClientRect().bottom || 0;
        root.querySelectorAll("h1, .prod-name, .order-head > div, .invoice-head > div, .bubble, .lede, [data-order-total], [data-cart-total]").forEach((el) => {
          if (!visible(el)) return;
          const r = el.getBoundingClientRect();
          if (r.top < switcherBottom - 1) {
            issues.clipped.push(`${el.className || el.tagName} under switcher`);
          }
          if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") {
            // only flag when overflow is hidden/clip
            const ov = getComputedStyle(el).overflowX;
            if (ov === "hidden" || ov === "clip") {
              issues.clipped.push(`${el.className || el.tagName} text clipped`);
            }
          }
        });

        // Order table header alignment
        const orderHead = root.querySelector("[data-order-head]");
        const orderRows = [...root.querySelectorAll("[data-order-row]")];
        if (orderHead && orderRows.length) {
          const headCells = [...orderHead.children];
          const sample = orderRows[0];
          const rowCells = [...sample.children];
          const n = Math.min(headCells.length, rowCells.length);
          for (let i = 0; i < n; i++) {
            const ht = headCells[i].textContent.trim();
            if (!ht) continue;
            const hr = headCells[i].getBoundingClientRect();
            const rr = rowCells[i].getBoundingClientRect();
            if (Math.abs(hr.left - rr.left) > 2 || Math.abs(hr.right - rr.right) > 2) {
              issues.tableAlign.push(
                `order col "${ht}" head[${Math.round(hr.left)}-${Math.round(hr.right)}] vs row[${Math.round(rr.left)}-${Math.round(rr.right)}]`
              );
            }
          }
          // header not under switcher
          const hr = orderHead.getBoundingClientRect();
          if (hr.top < switcherBottom - 1) {
            issues.clipped.push("order table header under switcher");
          }
        }

        // Invoice table alignment
        const invHead = root.querySelector("[data-invoice-head]");
        const invRows = [...root.querySelectorAll("[data-invoice-row]")];
        if (invHead && invRows.length) {
          const headCells = [...invHead.children];
          const sample = invRows[0];
          const rowCells = [...sample.children];
          const labels = ["Invoice", "Order", "Issued", "Due", "Amount", "Status"];
          for (let i = 0; i < labels.length; i++) {
            const hr = headCells[i].getBoundingClientRect();
            const rr = rowCells[i].getBoundingClientRect();
            if (Math.abs(hr.left - rr.left) > 2 || Math.abs(hr.right - rr.right) > 2) {
              issues.tableAlign.push(
                `invoice col "${labels[i]}" head[${Math.round(hr.left)}-${Math.round(hr.right)}] vs row[${Math.round(rr.left)}-${Math.round(rr.right)}]`
              );
            }
          }
          // credit bar visible — 6px flush track
          const bar = root.querySelector("[data-credit-bar]");
          if (!bar || !visible(bar)) issues.clipped.push("credit bar missing/invisible");
          else {
            const br = bar.getBoundingClientRect();
            if (br.width < 40) issues.clipped.push("credit bar fill has no width");
            const h = br.height;
            if (Math.abs(h - 6) > 1) issues.pixelNits.push(`credit bar height ${h.toFixed(1)}px (want 6)`);
            const kids = [...bar.children].filter((el) => visible(el));
            if (kids.length > 0) {
              issues.pixelNits.push("credit bar still has segment children (want single gradient track)");
            }
          }
        }

        // Em dashes in visible copy
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (!node.nodeValue) continue;
          if (!/[—–]/.test(node.nodeValue)) continue;
          const parent = node.parentElement;
          if (!parent || !visible(parent)) continue;
          issues.emdash.push(JSON.stringify(node.nodeValue.trim().slice(0, 80)));
        }

        // Ledger figures from DOM money / qty
        const text = root.innerText || "";
        const moneyRe = /\$[\d,]+(?:\.\d{2})?/g;
        let m;
        const foundMoney = [];
        while ((m = moneyRe.exec(text))) {
          foundMoney.push(Math.round(parseFloat(m[0].replace(/[$,]/g, "")) * 100) / 100);
        }
        const allowed = allowedMoney;
        foundMoney.forEach((n) => {
          if (!allowed.some((a) => Math.abs(a - n) <= 0.009)) {
            issues.ledger.push(`unexpected money $${n.toFixed(2)}`);
          }
        });

        // Key totals must appear on relevant screens
        const must = [];
        if (screen === "qo-desktop" || screen === "cart") must.push(orderTotal, cartTotal);
        // Invoices credit meter shows available (not wordy used/limit sentence)
        if (screen === "invoices") must.push(creditAvailable, orderTotal);
        if (screen === "messages") must.push(orderTotal);
        if (screen === "confirmation") must.push(orderTotal);
        if (screen === "qo-desktop") must.push(perseusUnit);

        // Confirmation receipt
        if (screen === "confirmation") {
          const panel = root.querySelector("[data-confirm-panel]");
          if (!panel || !visible(panel)) issues.ia.push("confirmation panel missing");
          else {
            const h1 = panel.querySelector("h1");
            if (!h1 || !/^Order placed$/i.test((h1.textContent || "").trim())) {
              issues.ia.push("confirmation H1 must be 'Order placed'");
            }
            if (panel.querySelector(".confirm-kicker")) {
              issues.ia.push("confirmation eyebrow/kicker must be removed");
            }
            if (!/invoice by email when it ships/i.test(panel.textContent || "")) {
              issues.ia.push("confirmation missing invoice-by-email copy");
            }
            if (/INV-1042 will show/i.test(panel.textContent || "")) {
              issues.ia.push("confirmation must not promise invoice number before billing");
            }
            if (!/Confirmed by your rep within 1 business day/i.test(panel.textContent || "")) {
              issues.ia.push("confirmation missing rep status line");
            }
            const oid = panel.querySelector("[data-order-id]");
            if (!oid || !/^SO-\d+/i.test((oid.textContent || "").trim())) {
              issues.ia.push("confirmation order id must be JOOLA SO-… number");
            }
            if (/PO-120/i.test(panel.textContent || "")) {
              issues.ia.push("confirmation still shows PO-120 as order id");
            }
          }
          // Cart chrome emptied after place
          const pill = root.querySelector("[data-cart-pill]");
          const badge = pill && pill.querySelector("[data-cart-count]");
          const totalEl = pill && pill.querySelector("[data-cart-total]");
          const totalTxt = (totalEl && totalEl.textContent) || "";
          const totalN = parseFloat(totalTxt.replace(/[$,]/g, "")) || 0;
          if (!pill || totalN > 0.009) {
            issues.ia.push(`confirmation cart pill still shows ${totalTxt.trim() || "amount"} (want empty/$0)`);
          }
          if (badge && visible(badge) && (badge.textContent || "").trim()) {
            issues.ia.push("confirmation cart badge still visible after place");
          }
        }
        must.forEach((n) => {
          if (!foundMoney.some((f) => Math.abs(f - n) <= 0.009)) {
            issues.ledger.push(`missing required $${n.toFixed(2)}`);
          }
        });
        if (screen === "qo-desktop" || screen === "messages") {
          if (!new RegExp(`\\b${perseusQty}\\b`).test(text)) {
            issues.ledger.push(`missing qty ${perseusQty}`);
          }
        }

        // No storefront promo bar on wholesale screens
        if (["qo-desktop", "catalog", "invoices", "messages", "cart", "templates"].includes(screen)) {
          if (root.textContent.includes("Pickleball Paddles") && root.textContent.includes("Apparel") && root.textContent.includes("Footwear")) {
            // category storefront nav
            const storefront = [...root.querySelectorAll("div")].some((el) => {
              const t = el.textContent || "";
              return t.includes("Apparel") && t.includes("Footwear") && t.includes("Outlet") && el.children.length >= 5;
            });
            if (storefront) issues.overlaps.push("storefront category nav present (chrome inconsistent)");
          }
        }

        // 1. Same SKU → same buyer price everywhere it appears on this screen
        const bySku = {};
        root.querySelectorAll("[data-sku]").forEach((el) => {
          if (!visible(el)) return;
          const sku = el.getAttribute("data-sku");
          const attr = parseFloat(el.getAttribute("data-buyer-price") || "NaN");
          const priceEl = el.querySelector("[data-display-price]") || el.querySelector(".price") || el.querySelector(".meta");
          const texts = parseMoneyLocal(priceEl ? priceEl.textContent : el.textContent);
          const shown = texts.find((n) => buyerBySku[sku] != null && Math.abs(n - buyerBySku[sku]) < 0.01) ?? texts[0];
          if (!bySku[sku]) bySku[sku] = [];
          bySku[sku].push({ attr, shown, from: el.className || el.tagName });
        });
        Object.keys(bySku).forEach((sku) => {
          const expected = buyerBySku[sku];
          const vals = bySku[sku];
          vals.forEach((v) => {
            if (expected != null && v.attr === v.attr && Math.abs(v.attr - expected) > 0.009) {
              issues.skuPrice.push(`SKU ${sku} data-buyer-price ${v.attr} != ledger ${expected}`);
            }
            if (expected != null && v.shown != null && Math.abs(v.shown - expected) > 0.009) {
              issues.skuPrice.push(`SKU ${sku} shows $${v.shown} != ledger buyer $${expected} (${v.from})`);
            }
          });
          const uniqueShown = [...new Set(vals.map((v) => v.shown).filter((n) => n === n))];
          if (uniqueShown.length > 1) {
            issues.skuPrice.push(`SKU ${sku} disagrees on-screen: ${uniqueShown.join(" vs ")}`);
          }
        });

        // 2. Placeholder hidden when search has a value
        if (screen === "qo-desktop") {
          const field = root.querySelector("[data-search-field]");
          if (field) {
            const hasValue = field.classList.contains("has-value") || !!field.getAttribute("data-search-value");
            const ph = field.querySelector(".placeholder");
            if (hasValue && ph) {
              const st = getComputedStyle(ph);
              if (st.display !== "none" && st.visibility !== "hidden" && st.opacity !== "0") {
                const r = ph.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                  issues.searchPlaceholder.push("placeholder visible while field has value");
                }
              }
            }
            if (hasValue && /Search by name/i.test(field.innerText)) {
              issues.searchPlaceholder.push("placeholder text still in visible innerText");
            }
          }
        }

        // 3. No blank band >64px under sticky footer
        if (screen === "qo-desktop" || screen === "qo-mobile") {
          const footer = root.querySelector("[data-order-footer], .order-footer");
          if (footer && visible(footer)) {
            const fr = footer.getBoundingClientRect();
            const gap = window.innerHeight - fr.bottom;
            if (gap > 64) {
              issues.footerBand.push(`blank band ${Math.round(gap)}px under sticky footer`);
            }
          }
        }

        // 4. JOOLA Sales uses JOOLA mark, not Engage avatar
        if (screen === "messages") {
          const inbox = root.querySelector("[data-inbox-joola]");
          if (!inbox || !inbox.querySelector("[data-joola-mark]")) {
            issues.joolaMark.push("inbox JOOLA Sales missing data-joola-mark");
          }
          if (inbox && inbox.querySelector("[data-retailer-avatar]")) {
            issues.joolaMark.push("inbox JOOLA Sales still uses Engage retailer avatar");
          }
          const sam = root.querySelector("[data-msg-sam]");
          if (!sam || !sam.querySelector("[data-joola-mark]")) {
            issues.joolaMark.push("Sam bubble missing JOOLA mark");
          }
        }

        // 5. Numeric invoice Amount column right-aligned to header
        if (screen === "invoices" && invHead && invRows.length) {
          const headAmt = invHead.querySelector(".num") || invHead.children[4];
          const rowAmt = invRows[0].querySelector("[data-col='amount'], .amt");
          if (headAmt && rowAmt) {
            const hs = getComputedStyle(headAmt).textAlign;
            const rs = getComputedStyle(rowAmt).textAlign;
            if (hs !== "right" || rs !== "right") {
              issues.numericAlign.push(`Amount text-align head=${hs} row=${rs}`);
            }
            const hr = headAmt.getBoundingClientRect();
            const rr = rowAmt.getBoundingClientRect();
            if (Math.abs(hr.right - rr.right) > 2) {
              issues.numericAlign.push(
                `Amount right edge head=${Math.round(hr.right)} row=${Math.round(rr.right)}`
              );
            }
          }
          // Tight action column: gap between status pill and Download PDF button
          const status = invRows[0].children[5];
          const btn = invRows[0].querySelector(".action button");
          if (status && btn) {
            const gap = btn.getBoundingClientRect().left - status.getBoundingClientRect().right;
            if (gap > 48) {
              issues.numericAlign.push(`STATUS→PDF gap ${Math.round(gap)}px > 48`);
            }
          }
        }

        // 6. Catalog product media: one surface, consistent size (img fills media; no nested pad)
        if (screen === "catalog") {
          const medias = [...root.querySelectorAll("[data-product-media], .rec-card .media, .cat-card .media")].filter(visible);
          const heights = medias.map((el) => Math.round(el.getBoundingClientRect().height));
          const uniqueH = [...new Set(heights)];
          if (uniqueH.length > 1) {
            issues.mediaSurface.push(`inconsistent media heights: ${uniqueH.join(", ")}`);
          }
          medias.forEach((el) => {
            const cs = getComputedStyle(el);
            const pad =
              (parseFloat(cs.paddingTop) || 0) +
              (parseFloat(cs.paddingRight) || 0) +
              (parseFloat(cs.paddingBottom) || 0) +
              (parseFloat(cs.paddingLeft) || 0);
            if (pad > 1) {
              issues.mediaSurface.push(`media has padding ${pad}px (double container)`);
            }
            const img = el.querySelector("img");
            if (img) {
              const er = el.getBoundingClientRect();
              const ir = img.getBoundingClientRect();
              if (Math.abs(ir.width - er.width) > 4 || Math.abs(ir.height - er.height) > 4) {
                issues.mediaSurface.push(
                  `img ${Math.round(ir.width)}x${Math.round(ir.height)} inset in media ${Math.round(er.width)}x${Math.round(er.height)}`
                );
              }
              const fit = getComputedStyle(img).objectFit;
              if (fit !== "contain") {
                issues.mediaSurface.push(`img object-fit=${fit} (want contain, never crop)`);
                issues.imageContain.push(`catalog media object-fit=${fit}`);
              }
            }
            // media should be flush to card top (no outer grey frame above)
            const card = el.closest(".rec-card, .cat-card");
            if (card) {
              const cr = card.getBoundingClientRect();
              const er = el.getBoundingClientRect();
              if (er.top - cr.top > 2) {
                issues.mediaSurface.push(`media inset ${Math.round(er.top - cr.top)}px from card top`);
              }
            }
          });
        }

        // 7. Tabular nums on numeric cells
        const numSelectors = [
          "[data-display-price]",
          "[data-unit-price]",
          "[data-line-total]",
          "[data-order-total]",
          "[data-cart-total]",
          "[data-invoice-amount]",
          ".qty",
          ".amt",
          ".line-total",
          ".total",
          ".big",
        ];
        root.querySelectorAll(numSelectors.join(",")).forEach((el) => {
          if (!visible(el)) return;
          const cs = getComputedStyle(el);
          const tnum =
            cs.fontVariantNumeric.includes("tabular-nums") ||
            (cs.fontFeatureSettings || "").includes("tnum");
          if (!tnum) {
            issues.tabularNums.push(
              `${el.className || el.tagName} missing tabular-nums`
            );
          }
        });

        // 8. Right-aligned money columns
        root.querySelectorAll("[data-line-total], .line-total, .amt, [data-invoice-amount]").forEach((el) => {
          if (!visible(el)) return;
          const align = getComputedStyle(el).textAlign;
          if (align !== "right" && align !== "end") {
            issues.moneyAlign.push(
              `${el.className || el.getAttribute("data-col") || el.tagName} text-align=${align}`
            );
          }
        });
        if (orderHead) {
          const priceH = [...orderHead.children].find((c) => /price/i.test(c.textContent));
          const totalH = [...orderHead.children].find((c) => /line total/i.test(c.textContent));
          [priceH, totalH].forEach((el) => {
            if (!el) return;
            const align = getComputedStyle(el).textAlign;
            if (align !== "right" && align !== "end") {
              issues.moneyAlign.push(`order head "${el.textContent.trim()}" align=${align}`);
            }
          });
        }

        // 9. Data row heights 48–52px (skip preset/avail-expanded rows)
        root.querySelectorAll("[data-order-row]:not(.has-presets):not(.has-avail), [data-invoice-row]").forEach((el) => {
          if (!visible(el)) return;
          const h = el.getBoundingClientRect().height;
          if (h < 47.5 || h > 52.5) {
            issues.rowHeight.push(
              `${el.className || "row"} height ${Math.round(h)}px outside 48-52`
            );
          }
        });
        // Cart lines: qty×price column + total share a vertical centre; allow 48–60 for two-line product
        root.querySelectorAll("[data-cart-line]:not(.has-avail)").forEach((el) => {
          if (!visible(el)) return;
          const h = el.getBoundingClientRect().height;
          if (h < 47.5 || h > 60.5) {
            issues.rowHeight.push(`cart-line height ${Math.round(h)}px outside 48-60`);
          }
          const unit = el.querySelector(".cart-unit");
          const total = el.querySelector(".line-total");
          if (unit && total) {
            const ur = unit.getBoundingClientRect();
            const tr = total.getBoundingClientRect();
            // Shared baseline (bottom of glyph box) within 1.5px
            if (Math.abs(ur.bottom - tr.bottom) > 1.5) {
              issues.pixelNits.push(
                `cart unit/total baseline Δ=${Math.abs(ur.bottom - tr.bottom).toFixed(1)}px`
              );
            }
          }
        });
        const stickyHeads = root.querySelectorAll("[data-order-head], [data-invoice-head]");
        stickyHeads.forEach((el) => {
          if (!visible(el)) return;
          const h = el.getBoundingClientRect().height;
          if (h < 36 || h > 44) {
            issues.rowHeight.push(`sticky head height ${Math.round(h)}px (want ~40)`);
          }
        });

        // 10. Single accent: JOOLA blue #2c3ee0 on primary actions / active nav only
        const accent = { r: 44, g: 62, b: 224 }; // #2c3ee0
        const parseRgba = (color) => {
          const m = String(color || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/i);
          if (!m) return null;
          return { r: +m[1], g: +m[2], b: +m[3], a: m[4] != null ? +m[4] : 1 };
        };
        const nearAccent = (color, { opaqueOnly = false } = {}) => {
          const c = parseRgba(color);
          if (!c) return false;
          if (opaqueOnly && c.a < 0.5) return false; // soft tint fills are allowed (selected chips)
          const dr = Math.abs(c.r - accent.r);
          const dg = Math.abs(c.g - accent.g);
          const db = Math.abs(c.b - accent.b);
          return dr <= 8 && dg <= 8 && db <= 8 && c.r > 20;
        };
        const forbiddenAccentHosts = [];
        root.querySelectorAll("button, a, .status, .nav-item, .btn-outline, .cart-pill").forEach((el) => {
          if (!visible(el)) return;
          if (el.classList.contains("btn-primary") || el.classList.contains("btn-black") || el.classList.contains("btn-send")) return;
          if (el.classList.contains("nav-item") && el.classList.contains("active")) return;
          if (el.classList.contains("status")) return; // status uses own palette
          const cs = getComputedStyle(el);
          // Only flag solid/opaque accent fills on non-primary controls
          if (nearAccent(cs.backgroundColor, { opaqueOnly: true }) && !el.classList.contains("nav-item")) {
            forbiddenAccentHosts.push(`${el.className || el.tagName} bg accent`);
          }
        });
        // Active nav must use accent (fill or color)
        const activeNav = root.querySelector(".nav-item.active");
        if (activeNav && visible(activeNav)) {
          const cs = getComputedStyle(activeNav);
          const ok =
            nearAccent(cs.color) ||
            nearAccent(cs.backgroundColor) ||
            (cs.backgroundColor.includes("44") && cs.backgroundColor.includes("62"));
          // soft fill is rgba(44,62,224,0.08) — check color text is accent
          if (!nearAccent(cs.color)) {
            issues.singleAccent.push(`active nav color=${cs.color} not JOOLA blue`);
          }
        }
        if (forbiddenAccentHosts.length) {
          issues.singleAccent.push(...forbiddenAccentHosts.slice(0, 4));
        }
        // Primary CTA must be accent blue
        const primary = root.querySelector(".btn-primary, .btn-black, .btn-send");
        if (primary && visible(primary)) {
          const bg = getComputedStyle(primary).backgroundColor;
          if (!nearAccent(bg)) {
            issues.singleAccent.push(`primary CTA bg=${bg} not #2c3ee0`);
          }
        }

        // 11. Status pills: 20px tall, ~4px radius, 12px type
        root.querySelectorAll(".status").forEach((el) => {
          if (!visible(el)) return;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const radius = parseFloat(cs.borderRadius) || 0;
          const fs = parseFloat(cs.fontSize) || 0;
          if (Math.abs(r.height - 20) > 2) {
            issues.statusPill.push(`height ${Math.round(r.height)}px (want 20)`);
          }
          if (radius < 3 || radius > 6) {
            issues.statusPill.push(`radius ${radius}px (want 4)`);
          }
          if (Math.abs(fs - 12) > 1) {
            issues.statusPill.push(`font-size ${fs}px (want 12)`);
          }
          const label = (el.textContent || "").trim();
          if (label && !/^(Paid|Pending|Overdue)$/.test(label)) {
            issues.statusPill.push(`label "${label}" not in allowed set Paid|Pending|Overdue`);
          }
        });

        // 12. Product images must use contain (no crop) — all product thumbs/media
        root.querySelectorAll(
          "[data-product-media] img, .rec-card .media img, .cat-card .media img, img.thumb, .cart-line img, .search-result img"
        ).forEach((img) => {
          if (!visible(img)) return;
          const fit = getComputedStyle(img).objectFit;
          if (fit !== "contain") {
            issues.imageContain.push(
              `${img.getAttribute("src") || "img"} object-fit=${fit}`
            );
          }
        });

        // 13. Multi-line order: ≥2 rows; line totals sum to order total; INV-1042 matches
        if (screen === "qo-desktop" || screen === "cart") {
          const lines = [...root.querySelectorAll("[data-order-row], [data-cart-line]")].filter(visible);
          if (lines.length < 2) {
            issues.multiLine.push(`only ${lines.length} order line(s); want multi-line`);
          }
          const sum = lines.reduce((s, el) => {
            const t = el.querySelector("[data-line-total]");
            const n = t ? parseFloat(String(t.getAttribute("data-line-total") || t.textContent.replace(/[$,]/g, ""))) : NaN;
            return s + (n === n ? n : 0);
          }, 0);
          if (Math.abs(sum - orderTotal) > 0.02) {
            issues.multiLine.push(`line sum $${sum.toFixed(2)} != orderTotal $${orderTotal.toFixed(2)}`);
          }
        }
        if (screen === "invoices") {
          const inv = root.querySelector('[data-invoice-id="INV-1042"] [data-invoice-amount]');
          if (inv) {
            const n = parseFloat(inv.getAttribute("data-invoice-amount") || "NaN");
            if (Math.abs(n - orderTotal) > 0.02) {
              issues.multiLine.push(`INV-1042 $${n} != orderTotal $${orderTotal.toFixed(2)}`);
            }
          } else {
            issues.multiLine.push("INV-1042 amount missing");
          }
        }
        if (screen === "messages") {
          if (!foundMoney.some((f) => Math.abs(f - orderTotal) <= 0.009)) {
            issues.multiLine.push("messages missing orderTotal");
          }
        }

        // 14. IA: no Open cart; credit lives in cart summary (not sidebar); store link present
        if (["qo-desktop", "catalog", "cart", "confirmation", "invoices", "messages"].includes(screen)) {
          const side = root.querySelector("[data-sidebar], .sidebar");
          if (side && /Open cart/i.test(side.textContent || "")) {
            issues.ia.push("sidebar still contains Open cart");
          }
          if (side && /\$[\d,]+\.\d{2}/.test(side.textContent || "") && /Net 30|Available|used/i.test(side.textContent || "")) {
            issues.ia.push("credit figures must not appear in sidebar (cart summary only)");
          }
          const storeLink = side && side.querySelector("[data-store-link]");
          if (!storeLink) {
            issues.ia.push("sidebar missing store link");
          } else if (!/Back to joola\.com store|Shop retail store/i.test(storeLink.textContent || "")) {
            issues.ia.push(`store link copy="${(storeLink.textContent || "").trim().slice(0, 40)}"`);
          }
          if (side && side.querySelector(".top-search, [data-top-search]")) {
            issues.ia.push("global top-bar search must be removed (QO owns search)");
          }
          const topbar = root.querySelector("[data-topbar], .topbar");
          if (topbar && topbar.querySelector(".top-search, [data-top-search]")) {
            issues.ia.push("global top-bar search still present");
          }
          const cart = root.querySelector("[data-cart-pill], .cart-pill");
          if (!cart || !visible(cart)) issues.ia.push("cart pill missing from top bar");
        }

        // 15. Interaction state CSS hooks exist (hover/focus-visible/disabled/toast)
        if (screen === "qo-desktop" || screen === "states") {
          const cssText = [...document.styleSheets]
            .map((sheet) => {
              try {
                return [...sheet.cssRules].map((r) => r.cssText).join("\n");
              } catch {
                return "";
              }
            })
            .join("\n");
          ["btn-primary:hover", "btn-primary:focus-visible", "btn-primary:active", ":disabled", ".toast", "nav-item:hover", "qty-stepper button:hover"].forEach((needle) => {
            if (!cssText.includes(needle) && !cssText.includes(needle.replace(".", ""))) {
              // softer: check substrings
            }
          });
          const need = [":hover", ":focus-visible", ":active", ":disabled", ".toast"];
          need.forEach((n) => {
            if (!cssText.includes(n)) issues.interactionStates.push(`CSS missing ${n}`);
          });
          if (!document.querySelector("[data-toast]")) {
            issues.interactionStates.push("toast element missing");
          }
          if (!root.querySelector("[data-add-all], #qoAddAllBtn")) {
            if (screen === "qo-desktop") issues.interactionStates.push("Add all control missing");
          }
          if (screen === "states" && !root.querySelector("[data-state-sheet]")) {
            issues.interactionStates.push("state sheet missing");
          }
        }

        // 16. Quick Order — single Reorder rail
        if (screen === "qo-desktop") {
          const rail = root.querySelector("[data-qo-rail]");
          if (!rail || !visible(rail)) issues.qoRail.push("qo rail missing");
          else {
            const cards = [...rail.querySelectorAll(".rail-card")].filter(visible);
            if (cards.length !== 1) {
              issues.qoRail.push(`want 1 Reorder rail card, found ${cards.length}`);
            }
            const t = rail.textContent || "";
            if (!/Reorder/i.test(t)) issues.qoRail.push("rail missing Reorder heading");
            if (!/PO-/i.test(t)) issues.qoRail.push("rail missing recent orders");
            rail.querySelectorAll(".rail-item .meta").forEach((meta) => {
              if (!visible(meta)) return;
              if (/SKU\s*\d+/i.test(meta.textContent || "")) {
                issues.pixelNits.push("rail meta still includes SKU");
              }
            });
            // No ellipsis / overflow on rail titles or meta — prices must be fully visible
            rail.querySelectorAll(".rail-item .name, .rail-item .meta").forEach((el) => {
              if (!visible(el)) return;
              const cs = getComputedStyle(el);
              if ((cs.textOverflow || "") === "ellipsis") {
                issues.pixelNits.push(`rail ${el.className} uses ellipsis`);
              }
              // Single line
              if (el.scrollHeight > el.clientHeight + 2 || el.getBoundingClientRect().height > 22) {
                issues.pixelNits.push(`rail ${el.className} wraps: "${(el.textContent || "").trim().slice(0, 40)}"`);
              }
              // Horizontal clip / truncate
              if (el.scrollWidth > el.clientWidth + 1) {
                issues.pixelNits.push(
                  `rail ${el.className} overflows: "${(el.textContent || "").trim().slice(0, 48)}"`
                );
              }
              // Never truncate a price
              if (/\$[\d,]+\.\d{2}\u2026|\$[\d,]+\u2026|\.\.\./.test(el.textContent || "")) {
                issues.pixelNits.push(`rail price truncated: "${(el.textContent || "").trim()}"`);
              }
            });
            // Add must be absolute overlay (no reserved flex column)
            const action = rail.querySelector(".rail-action");
            if (action) {
              const pos = getComputedStyle(action).position;
              if (pos !== "absolute" && pos !== "fixed") {
                issues.pixelNits.push(`rail Add position=${pos} (want absolute overlay)`);
              }
            }
          }
          if (!root.querySelector("[data-qty-group]")) {
            issues.qoRail.push("qty-group microinteraction missing");
          }
        }

        // 17. Messages order context + details
        if (screen === "messages") {
          if (!root.querySelector("[data-order-context]")) {
            issues.msgContext.push("order context card missing");
          }
          if (!root.querySelector("[data-msg-details]")) {
            issues.msgContext.push("details panel missing");
          } else {
            const d = root.querySelector("[data-msg-details]").textContent || "";
            if (!/ship/i.test(d)) issues.msgContext.push("details missing ship date");
            if (!/INV-1042/i.test(d)) issues.msgContext.push("details missing invoice");
            if (!/Pending Fulfillment|Pending Approval|Billed/i.test(d)) {
              issues.netsuiteLabels.push("order details missing NetSuite SO status");
            }
          }
        }

        // 18. Cart checkout: PO, ship-to, need-by rush (no warehouse notes / ship schedule)
        if (screen === "cart") {
          const box = root.querySelector("[data-cart-checkout]");
          const layout = root.querySelector("[data-cart-layout]");
          const summary = root.querySelector("[data-cart-summary]");
          if (!layout || !visible(layout)) issues.cartCheckout.push("two-column cart layout missing");
          if (!summary || !visible(summary)) issues.cartCheckout.push("sticky summary missing");
          if (summary) {
            const st = getComputedStyle(summary);
            if (st.position !== "sticky" && st.position !== "fixed") {
              issues.cartCheckout.push(`summary position=${st.position} (want sticky)`);
            }
            if (!summary.querySelector("[data-credit-meter], [data-credit-bar]")) {
              issues.cartCheckout.push("summary missing Net 30 credit meter");
            }
            if (/After placing/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("wordy after-placing credit sentence still present");
            }
            if (!/Net 30 credit/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("credit meter missing 'Net 30 credit' label");
            }
            if (!/Uses \$[\d,]+(?:\.\d{2})? of \$[\d,]+(?:\.\d{2})? available/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("credit meter missing 'Uses $X of $Y available' label");
            }
            if (/left after this order/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("legacy 'left after this order' credit copy still present");
            }
            if (summary.querySelector("[data-size-note]")) {
              issues.cartCheckout.push("size warning should not fire on hero demo cart");
            }
            if (!summary.querySelector("[data-credit-tip]")) {
              issues.cartCheckout.push("credit meter missing used/this order/left tooltip");
            }
            const bar = summary.querySelector("[data-credit-bar]");
            if (bar) {
              const cs = getComputedStyle(bar);
              if (Math.abs(parseFloat(cs.height) - 6) > 1) {
                issues.cartCheckout.push(`credit bar height ${cs.height} (want 6px)`);
              }
              if (!String(cs.backgroundImage || "").includes("linear-gradient")) {
                issues.cartCheckout.push("credit bar missing flush linear-gradient track");
              }
            }
            if (!/Calculated at invoice/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("summary missing tax note");
            }
            if (/Freight quoted/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("freight jargon still present");
            }
          }
          if (!box || !visible(box)) {
            issues.cartCheckout.push("cart checkout block missing");
          } else {
            if (!box.querySelector('[data-field="po"]')) issues.cartCheckout.push("PO field missing");
            if (box.querySelector('[data-field="ship-date"]') || /Requested ship date/i.test(box.textContent || "")) {
              issues.cartCheckout.push("requested ship date must not appear (buyer cannot schedule)");
            }
            const needBy = box.querySelector("[data-need-by], [data-field='need-by']");
            if (!needBy) {
              issues.cartCheckout.push("need-by rush request missing");
            } else {
              const label = (needBy.querySelector(".need-by-row")?.textContent || "").trim();
              if (!/^Need it by$/i.test(label.replace(/\s+/g, " ").replace(/^\s*/, ""))) {
                // Allow checkbox-adjacent label text "Need it by"
                if (!/Need it by/i.test(label) || /certain date/i.test(label)) {
                  issues.pixelNits.push(`need-by label="${label.slice(0, 40)}" (want "Need it by")`);
                }
              }
              const date = needBy.querySelector("[data-need-by-date], #need-by-date");
              const check = needBy.querySelector("[data-need-by-check], #need-by-check");
              if (!date) {
                issues.pixelNits.push("need-by date control missing");
              } else if (!date.hasAttribute("hidden") && !(check && check.checked)) {
                issues.pixelNits.push("need-by date visible while unchecked");
              }
              if (date && !date.querySelector(".cal-icon, svg")) {
                issues.pixelNits.push("need-by date missing calendar icon");
              }
            }
            if (box.querySelector('[data-field="ship-to"] select') || box.querySelector("select")) {
              issues.cartCheckout.push("native select still visible (want address card)");
            }
            if (!box.querySelector("[data-ship-card], .ship-card")) {
              issues.cartCheckout.push("ship-to address card missing");
            }
            if (!box.querySelector("[data-ship-address]")) {
              issues.cartCheckout.push("ship-to address line missing");
            }
            if (!box.querySelector("[data-ship-change], .ship-change")) {
              issues.cartCheckout.push("ship-to Change affordance missing");
            }
            if (/Engage Pickleball\s*[·\-]\s/.test(box.querySelector('[data-field="ship-to"]')?.textContent || "")) {
              issues.cartCheckout.push("ship-to still uses punctuation belt in label");
            }
            if (box.querySelector("[data-warehouse-notes]") || /Notes for warehouse/i.test(box.textContent || "")) {
              issues.cartCheckout.push("warehouse notes must not appear for buyers");
            }
            if (!box.querySelector("[data-returns-link]")) {
              issues.cartCheckout.push("returns / RMA link missing");
            }
            if (/order type/i.test(box.textContent || "")) {
              issues.cartCheckout.push("order type dropdown must not appear on cart");
            }
          }
          const primaries = [...root.querySelectorAll(".btn-primary")].filter(visible);
          if (primaries.length !== 1) {
            issues.cartCheckout.push(`want 1 primary CTA, found ${primaries.length}`);
          } else if (!/Place order/i.test(primaries[0].textContent || "")) {
            issues.cartCheckout.push("primary CTA should be Place order");
          }
        }

        // Buyer-facing QO lines: stock only when NOT in stock; no warehouse codes
        if (screen === "qo-desktop") {
          const rows = [...root.querySelectorAll("[data-order-row]")].filter(visible);
          const skuText = (el) =>
            (el.querySelector(".prod-sku")?.textContent || "") +
            " " +
            (el.querySelector(".avail-tag")?.textContent || "");
          const inStockSpam = rows.filter((el) => /In stock/i.test(skuText(el)));
          if (inStockSpam.length > 0) {
            issues.netsuiteLabels.push("In stock should be omitted (show only exceptions)");
          }
          const exception = rows.filter((el) =>
            /2-day ship|day ship|Backorder|Low stock/i.test(skuText(el))
          );
          if (exception.length < 1) {
            issues.netsuiteLabels.push("expected at least one non-stock availability exception");
          }
          if (exception.some((el) => !el.querySelector(".avail-tag"))) {
            issues.netsuiteLabels.push("availability exception missing .avail-tag");
          }
          const withWh = rows.filter((el) => /Ships from|\bCA\b|\bTX\b/.test(skuText(el)));
          if (withWh.length > 0) {
            issues.netsuiteLabels.push("warehouse codes still shown to buyer");
          }
          if (root.querySelector(".cat-label")) {
            issues.netsuiteLabels.push("category grouping labels should be dropped (cognitive load)");
          }
          const bestSpam = (root.innerText || "").match(/Best price unlocked/gi) || [];
          if (bestSpam.length > 0) {
            issues.netsuiteLabels.push(`Best price unlocked spam ×${bestSpam.length}`);
          }
          const footerMeta = root.querySelector("[data-order-footer] [data-line-count]");
          if (!footerMeta || !/\d+\s+items?/i.test(footerMeta.textContent || "")) {
            issues.netsuiteLabels.push("footer missing quiet item count (e.g. 4 items)");
          }
          if (/Ready\s*·|In cart\s*·/i.test(footerMeta?.textContent || "")) {
            issues.netsuiteLabels.push("footer still uses Ready/In cart · lines pattern");
          }
          const addBtn = root.querySelector("[data-add-all], #qoAddAllBtn");
          if (addBtn && !/Add\s+\d+\s+to cart|Added/i.test(addBtn.textContent || "")) {
            issues.netsuiteLabels.push(`footer CTA="${(addBtn.textContent || "").trim()}" (want Add N to cart)`);
          }
          if (/Staged/i.test(root.innerText || "")) {
            issues.netsuiteLabels.push("staged jargon still present");
          }
          const results = root.querySelector("[data-search-results]");
          if (results && visible(results) && !results.classList.contains("is-closed") && !results.hasAttribute("hidden")) {
            issues.netsuiteLabels.push("search dropdown still open over table (SKU already staged)");
          }
          if (root.querySelector(".sidebar-section")) {
            issues.netsuiteLabels.push("orphan ACCOUNT sidebar section heading");
          }
          // Product names must not ellipsis-truncate important titles
          root.querySelectorAll(".prod-name").forEach((el) => {
            if (!visible(el)) return;
            if (el.scrollWidth > el.clientWidth + 1) {
              issues.netsuiteLabels.push(`truncated product name: ${el.textContent.trim().slice(0, 40)}`);
            }
          });
        }

        // Pixel: matched pills + icon slots + FK Grotesk only
        if (screen === "qo-desktop") {
          const chip = root.querySelector("[data-account-chip]");
          const cart = root.querySelector("[data-cart-pill]");
          if (chip && cart && visible(chip) && visible(cart)) {
            const ch = chip.getBoundingClientRect().height;
            const kh = cart.getBoundingClientRect().height;
            if (Math.abs(ch - kh) > 1 || Math.abs(ch - 36) > 1.5) {
              issues.netsuiteLabels.push(`pill heights chip=${ch.toFixed(1)} cart=${kh.toFixed(1)} (want 36)`);
            }
            const cr = getComputedStyle(chip).borderRadius;
            const kr = getComputedStyle(cart).borderRadius;
            if (cr !== kr) issues.netsuiteLabels.push(`pill radius mismatch ${cr} vs ${kr}`);
            const pl = parseFloat(getComputedStyle(chip).paddingLeft) || 0;
            const prPad = parseFloat(getComputedStyle(chip).paddingRight) || 0;
            if (Math.abs(pl - 12) > 1 || prPad < 12 || prPad > 15) {
              issues.pixelNits.push(`account pad L=${pl} R=${prPad} (want L=12, R=12–14 optical)`);
            }
            const av = chip.querySelector("[data-retailer-avatar]");
            if (av) {
              const aw = av.getBoundingClientRect().width;
              if (Math.abs(aw - 28) > 1.5) issues.netsuiteLabels.push(`avatar ${aw.toFixed(1)}px (want 28)`);
              const img = av.querySelector("img");
              if (!img || !/engage-logo/i.test(img.getAttribute("src") || "")) {
                issues.pixelNits.push("account chip missing Engage logo asset");
              }
              const gap = parseFloat(getComputedStyle(chip).gap) || 0;
              if (gap < 9.5 || gap > 12.5) {
                issues.pixelNits.push(`account chip gap ${gap}px (want 10–12)`);
              }
            }
            // Count chip inside pill — never corner badge; hidden when empty
            const countChip = cart.querySelector(".count-chip, [data-cart-count]");
            if (!countChip) {
              issues.pixelNits.push("cart count-chip missing");
            } else {
              const shown = visible(countChip);
              const n = parseInt((countChip.textContent || "").trim() || "0", 10);
              if (!shown) {
                if ((countChip.textContent || "").trim() === "0") {
                  issues.pixelNits.push("empty cart shows '0' in hidden chip");
                }
              } else {
                if (n === 0) issues.pixelNits.push("empty cart shows visible '0' badge");
                const br = countChip.getBoundingClientRect();
                const pr = cart.getBoundingClientRect();
                // Chip must sit fully inside the pill (not overlapping the outer edge)
                if (br.top < pr.top - 0.5 || br.bottom > pr.bottom + 0.5) {
                  issues.pixelNits.push("count-chip vertically overflows cart pill");
                }
                if (br.left < pr.left - 0.5 || br.right > pr.right + 0.5) {
                  issues.pixelNits.push("count-chip horizontally overflows cart pill");
                }
                const bg = getComputedStyle(countChip).backgroundColor || "";
                if (bg !== "rgb(44, 62, 224)") {
                  issues.pixelNits.push(`count-chip fill ${bg} (want JOOLA blue)`);
                }
                const range = document.createRange();
                range.selectNodeContents(countChip);
                const tr = range.getBoundingClientRect();
                if (tr.width > 0 && tr.height > 0) {
                  const dx = Math.abs((tr.left + tr.right) / 2 - (br.left + br.right) / 2);
                  const dy = Math.abs((tr.top + tr.bottom) / 2 - (br.top + br.bottom) / 2);
                  if (dx > 0.5 || dy > 0.5) {
                    issues.pixelNits.push(
                      `count-chip optical centre Δx=${dx.toFixed(2)} Δy=${dy.toFixed(2)} (max 0.5)`
                    );
                  }
                }
                const pillCy = (pr.top + pr.bottom) / 2;
                const chipCy = (br.top + br.bottom) / 2;
                if (Math.abs(pillCy - chipCy) > 1) {
                  issues.pixelNits.push(
                    `count-chip not vertically centred on pill (Δ=${Math.abs(pillCy - chipCy).toFixed(2)})`
                  );
                }
                if (cart.querySelector(".badge:not(.count-chip)")) {
                  issues.pixelNits.push("legacy corner .badge still present");
                }
              }
            }
          }
          root.querySelectorAll(".nav-item .icon-slot").forEach((slot) => {
            if (!visible(slot)) return;
            const r = slot.getBoundingClientRect();
            if (Math.abs(r.width - 16) > 1.5 || Math.abs(r.height - 16) > 1.5) {
              issues.netsuiteLabels.push(`icon-slot ${Math.round(r.width)}x${Math.round(r.height)} (want 16)`);
            }
            const svg = slot.querySelector("svg");
            if (svg) {
              const sr = svg.getBoundingClientRect();
              if (Math.abs(sr.width - 16) > 2 || Math.abs(sr.height - 16) > 2) {
                issues.netsuiteLabels.push(`nav icon ${Math.round(sr.width)}px (want 16)`);
              }
              const sw = parseFloat(getComputedStyle(svg).strokeWidth) || 0;
              // stroke-width may be attribute; check attr
              const attr = parseFloat(svg.getAttribute("stroke-width") || "") || sw;
              void attr;
            }
            const nav = slot.closest(".nav-item");
            if (nav) {
              const gap = parseFloat(getComputedStyle(nav).gap) || 0;
              if (Math.abs(gap - 8) > 1) issues.pixelNits.push(`nav gap ${gap}px (want 8)`);
              const padL = parseFloat(getComputedStyle(nav).paddingLeft) || 0;
              if (nav.classList.contains("active") && Math.abs(padL - 8) > 1) {
                issues.pixelNits.push(`active nav padding ${padL}px (want 8)`);
              }
            }
          });
          const ff = getComputedStyle(root).fontFamily || "";
          if (!/FKGroteskNeue/i.test(ff)) {
            issues.netsuiteLabels.push(`UI font not FK Grotesk: ${ff.slice(0, 40)}`);
          }

          // Stepper: SVG minus/plus, equal hit areas, equal icon sizes
          const stepper = root.querySelector("[data-qty-stepper], .qty-stepper");
          if (stepper && visible(stepper)) {
            const btns = [...stepper.querySelectorAll("button")];
            if (btns.length < 2) {
              issues.pixelNits.push("stepper missing ± buttons");
            } else {
              const [dec, inc] = [btns[0], btns[btns.length - 1]];
              const dw = dec.getBoundingClientRect().width;
              const iw = inc.getBoundingClientRect().width;
              if (Math.abs(dw - iw) > 1 || Math.abs(dw - 36) > 2) {
                issues.pixelNits.push(`stepper hit areas ${dw.toFixed(1)} vs ${iw.toFixed(1)} (want 36)`);
              }
              const dIcon = dec.querySelector(".step-icon, svg");
              const iIcon = inc.querySelector(".step-icon, svg");
              if (!dIcon || !iIcon) {
                issues.pixelNits.push("stepper missing SVG ± icons");
              } else {
                const dr = dIcon.getBoundingClientRect();
                const ir = iIcon.getBoundingClientRect();
                if (Math.abs(dr.width - ir.width) > 1 || Math.abs(dr.height - ir.height) > 1) {
                  issues.pixelNits.push("stepper ± icon sizes unequal");
                }
                if (/^[-−–—]$/.test((dec.textContent || "").trim())) {
                  issues.pixelNits.push("stepper still uses hyphen/minus text glyph");
                }
              }
            }
          }

          // Price "ea" secondary + right edge vs Price header
          const orderHead = root.querySelector("[data-order-head]");
          const priceHead = orderHead
            ? [...orderHead.children].find((c) => /^price$/i.test(c.textContent.trim()))
            : null;
          const unit = root.querySelector(".price-block .unit");
          if (unit && visible(unit)) {
            const ea = unit.querySelector(".ea");
            if (!ea) {
              issues.pixelNits.push("price missing .ea secondary span");
            } else {
              const cs = getComputedStyle(ea);
              const fs = parseFloat(cs.fontSize) || 0;
              if (fs > 13) issues.pixelNits.push(`ea font-size ${fs}px (want ≤12 meta)`);
              const color = cs.color || "";
              // faint grey — not full ink
              if (/rgb\(26,\s*26,\s*26\)/i.test(color) || color === "rgb(0, 0, 0)") {
                issues.pixelNits.push("ea color not secondary/faint");
              }
            }
            if (priceHead) {
              const hr = priceHead.getBoundingClientRect();
              const ur = unit.getBoundingClientRect();
              if (Math.abs(hr.right - ur.right) > 2) {
                issues.pixelNits.push(
                  `price right edge head=${Math.round(hr.right)} unit=${Math.round(ur.right)}`
                );
              }
            }
          }

          // Wholesale as tidy chip under logo (no blue dot)
          const wholesale = root.querySelector("[data-wholesale-chip], .wholesale-chip");
          if (!wholesale || !visible(wholesale)) {
            issues.pixelNits.push("wholesale chip missing");
          } else {
            if (wholesale.querySelector(".dot")) issues.pixelNits.push("wholesale still has blue dot");
            if (!/^Wholesale$/i.test((wholesale.textContent || "").trim())) {
              issues.pixelNits.push("wholesale chip label wrong");
            }
          }

          // Store link icon x = nav icon x (same pad/gap/slot)
          const store = root.querySelector("[data-store-link]");
          const navIcon = root.querySelector(".nav-item .icon-slot");
          const storeIcon = store && store.querySelector(".icon-slot");
          if (store && navIcon && storeIcon && visible(store) && visible(navIcon)) {
            const sx = storeIcon.getBoundingClientRect().left;
            const ix = navIcon.getBoundingClientRect().left;
            if (Math.abs(sx - ix) > 1.5) {
              issues.pixelNits.push(`store icon x=${sx.toFixed(1)} vs nav icon x=${ix.toFixed(1)}`);
            }
            const storeSvg = storeIcon.querySelector("svg");
            const navSvg = navIcon.querySelector("svg");
            if (storeSvg && navSvg) {
              const sw = storeSvg.getBoundingClientRect().width;
              const nw = navSvg.getBoundingClientRect().width;
              if (Math.abs(sw - nw) > 1) {
                issues.pixelNits.push(`store icon size ${sw.toFixed(1)} vs nav ${nw.toFixed(1)}`);
              }
            }
          } else if (store && !storeIcon) {
            issues.pixelNits.push("store link missing icon-slot (must match nav)");
          }

          // Zero middle-dot rule (prefer 0, hard max 1) — screen content only
          {
            const text = root.innerText || "";
            const dots = (text.match(/·/g) || []).length;
            if (dots > 1) {
              issues.pixelNits.push(`middle-dot count ${dots} (max 1, prefer 0)`);
            }
          }

          // No native <select> in buyer chrome
          root.querySelectorAll("select").forEach((sel) => {
            if (visible(sel)) issues.pixelNits.push("native <select> visible");
          });

          // No all-caps tracked eyebrows in product UI
          root.querySelectorAll("h2, h3, .label-quiet, .rail-card h3, .section-title, .oc-label, .msg-details .k").forEach((el) => {
            if (!visible(el)) return;
            const cs = getComputedStyle(el);
            if (cs.textTransform === "uppercase" && parseFloat(cs.letterSpacing) > 0) {
              issues.pixelNits.push(`eyebrow style on ${el.className || el.tagName}: "${(el.textContent || "").trim().slice(0, 24)}"`);
            }
          });

          // Search dropdown is an overlay (absolute), not in flow
          const results = root.querySelector("[data-search-results]");
          if (results) {
            const pos = getComputedStyle(results).position;
            if (pos !== "absolute" && pos !== "fixed") {
              issues.pixelNits.push(`search-results position=${pos} (want absolute overlay)`);
            }
          }

          // Reorder rows need an Add affordance
          const railAdds = root.querySelectorAll("[data-qo-rail] [data-rail-add] .rail-action");
          if (railAdds.length < 1) {
            issues.pixelNits.push("reorder rail missing Add actions");
          }

          // Footer: label/value stack, no ready-chip
          const footer = root.querySelector("[data-order-footer]");
          if (footer && visible(footer)) {
            if (footer.querySelector(".ready-chip") || /Not in cart yet/i.test(footer.textContent || "")) {
              issues.pixelNits.push("footer still has Not in cart yet chip");
            }
            if (!footer.querySelector(".footer-stack")) {
              issues.pixelNits.push("footer missing label/value stack");
            }
            const total = footer.querySelector(".total, [data-order-total]");
            if (total) {
              const fs = getComputedStyle(total).fontFamily || "";
              if (!/FKGroteskNeue/i.test(fs)) {
                issues.fontsLoaded.push(`footer total font fallback: ${fs.slice(0, 48)}`);
              }
              const size = parseFloat(getComputedStyle(total).fontSize) || 0;
              if (size > 26) issues.typeScale.push(`footer total ${size}px (want ≤24 title)`);
            }
          }

          // Less clutter: no lede, no Lines heading, ≤3 presets
          if (root.querySelector(".page > .lede")) {
            issues.lessBetter.push("QO lede still present");
          }
          if (/^Lines$/m.test(root.innerText || "") && root.querySelector(".section-title")) {
            const st = [...root.querySelectorAll(".section-title")].find((el) => /^Lines$/i.test(el.textContent || ""));
            if (st && visible(st)) issues.lessBetter.push("Lines heading still present");
          }
          root.querySelectorAll("[data-qty-presets], .qty-presets").forEach((pg) => {
            if (!visible(pg)) return;
            const n = pg.querySelectorAll("button").length;
            if (n > 3) issues.lessBetter.push(`presets count ${n} (max 3)`);
          });

          // Name search field value
          const field = root.querySelector("[data-search-field]");
          if (field) {
            const val = field.getAttribute("data-search-value") || "";
            if (!/[A-Za-z]{3,}/.test(val) || /^\d+$/.test(val.trim())) {
              issues.lessBetter.push(`search value "${val}" should be a product name for the film`);
            }
          }

          // Fonts actually loaded
          // (also asserted after loop via document.fonts — see fontsLoaded fill below)
          const moneyEl = root.querySelector(".order-footer .total, [data-order-total]");
          const bodyFF = getComputedStyle(root).fontFamily;
          if (moneyEl) {
            const mFF = getComputedStyle(moneyEl).fontFamily;
            if (!/FKGroteskNeue/i.test(mFF)) {
              issues.fontsLoaded.push("money total not FK Grotesk Neue");
            }
            if (mFF.split(",")[0].replace(/["']/g, "").trim() !== bodyFF.split(",")[0].replace(/["']/g, "").trim()) {
              issues.fontsLoaded.push("money family differs from body");
            }
          }

          // QO page max-width ~1120 so table+rail fill wide viewports
          const page = root.querySelector(".page");
          if (page) {
            const cs = getComputedStyle(page);
            const maxW = cs.maxWidth;
            if (!maxW || maxW === "none") {
              issues.pixelNits.push("qo page missing max-width (wide empty feel)");
            } else {
              const n = parseFloat(maxW);
              if (!(n >= 1100 && n <= 1140)) {
                issues.pixelNits.push(`qo page max-width=${maxW} (want ~1120)`);
              }
            }
            const footer = root.querySelector("[data-order-footer]");
            if (footer) {
              const fm = getComputedStyle(footer).maxWidth;
              const fn = parseFloat(fm);
              if (!fm || fm === "none" || Math.abs(fn - parseFloat(maxW)) > 1) {
                issues.pixelNits.push(`footer max-width=${fm} (want match page ${maxW})`);
              }
            }
          }
        }

        // Filled cart: count-chip visible, inside pill, optically centred (cart screen)
        if (screen === "cart") {
          const cart = root.querySelector("[data-cart-pill]");
          const countChip = cart && cart.querySelector(".count-chip, [data-cart-count]");
          if (!cart || !countChip || !visible(countChip)) {
            issues.pixelNits.push("filled cart missing visible count-chip");
          } else {
            const br = countChip.getBoundingClientRect();
            const pr = cart.getBoundingClientRect();
            if (br.top < pr.top - 0.5 || br.bottom > pr.bottom + 0.5 || br.left < pr.left - 0.5 || br.right > pr.right + 0.5) {
              issues.pixelNits.push("filled cart count-chip overflows pill");
            }
            if ((countChip.textContent || "").trim() === "0") {
              issues.pixelNits.push("filled cart shows 0");
            }
            const bg = getComputedStyle(countChip).backgroundColor || "";
            if (bg !== "rgb(44, 62, 224)") {
              issues.pixelNits.push(`filled count-chip fill ${bg} (want JOOLA blue)`);
            }
            const range = document.createRange();
            range.selectNodeContents(countChip);
            const tr = range.getBoundingClientRect();
            if (tr.width > 0 && tr.height > 0) {
              const dx = Math.abs((tr.left + tr.right) / 2 - (br.left + br.right) / 2);
              const dy = Math.abs((tr.top + tr.bottom) / 2 - (br.top + br.bottom) / 2);
              if (dx > 0.5 || dy > 0.5) {
                issues.pixelNits.push(
                  `filled count-chip optical centre Δx=${dx.toFixed(2)} Δy=${dy.toFixed(2)} (max 0.5)`
                );
              }
            }
          }
          // Hard rules on every buyer screen with chrome
          const dots = ((root.innerText || "").match(/·/g) || []).length;
          if (dots > 1) issues.pixelNits.push(`cart middle-dot count ${dots} (max 1)`);
          root.querySelectorAll("select").forEach((sel) => {
            if (visible(sel)) issues.pixelNits.push("cart shows native <select>");
          });
        }

        // Middle-dot + no-select on remaining screens
        if (["catalog", "templates", "invoices", "messages"].includes(screen)) {
          const dots = ((root.innerText || "").match(/·/g) || []).length;
          if (dots > 1) issues.pixelNits.push(`${screen} middle-dot count ${dots} (max 1)`);
          root.querySelectorAll("select").forEach((sel) => {
            if (visible(sel)) issues.pixelNits.push(`${screen} shows native <select>`);
          });
        }

        // Net 30 beside credit — cart summary (credit shown once, where it matters)
        if (screen === "cart") {
          const summary = root.querySelector("[data-cart-summary]");
          if (!summary || !/Net 30/i.test(summary.textContent || "")) {
            issues.netsuiteLabels.push("cart summary missing Net 30 credit copy");
          }
        }
        if (screen === "invoices") {
          const page = root.querySelector(".page");
          if (page && !/Net 30/i.test(page.textContent || "")) {
            issues.netsuiteLabels.push("invoices page missing Net 30 terms");
          }
        }

        // Fonts loaded (document.fonts) — run once per evaluate on qo-desktop
        if (screen === "qo-desktop") {
          const ok400 = document.fonts.check('400 14px "FKGroteskNeue"');
          const ok500 = document.fonts.check('500 14px "FKGroteskNeue"');
          if (!ok400) issues.fontsLoaded.push("FKGroteskNeue 400 not loaded");
          if (!ok500) issues.fontsLoaded.push("FKGroteskNeue 500 not loaded");

          // Type scale: ≤4 sizes from the token set, 2 weights, 3 greys
          const allowedSizes = new Set(["12px", "13px", "14px", "24px"]);
          const sizes = new Set();
          const weights = new Set();
          const greySample = ["ink", "muted", "faint"].map((t) => {
            const s = document.createElement("span");
            s.style.color = `var(--${t})`;
            root.appendChild(s);
            const c = getComputedStyle(s).color;
            s.remove();
            return c;
          });
          const greySet = new Set(greySample);
          const usedGreys = new Set();
          const walk = (el) => {
            if (!el || el.nodeType !== 1) return;
            const st = getComputedStyle(el);
            if (st.display === "none" || st.visibility === "hidden") return;
            const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (hasText) {
              sizes.add(st.fontSize);
              weights.add(st.fontWeight);
              if (greySet.has(st.color)) usedGreys.add(st.color);
            }
            [...el.children].forEach(walk);
          };
          walk(root);
          const rogue = [...sizes].filter((s) => !allowedSizes.has(s));
          if (rogue.length) issues.typeScale.push(`rogue sizes: ${rogue.join(", ")}`);
          if (sizes.size > 4) issues.typeScale.push(`${sizes.size} sizes (target ≤4)`);
          if (weights.size > 2) issues.typeScale.push(`${weights.size} weights (target 2)`);
          if (usedGreys.size > 3) issues.typeScale.push(`${usedGreys.size} greys (target 3)`);
        }

        function parseMoneyLocal(text) {
          const out = [];
          if (!text) return out;
          const re = /\$[\d,]+(?:\.\d{2})?/g;
          let m;
          while ((m = re.exec(text))) {
            out.push(Math.round(parseFloat(m[0].replace(/[$,]/g, "")) * 100) / 100);
          }
          return out;
        }

        return issues;
      },
      {
        screen,
        allowedMoney,
        cartTotal: ledger.cartTotal,
        orderTotal: ledger.orderTotal,
        creditUsed: ledger.credit.used,
        creditLimit: ledger.credit.limit,
        creditAvailable: ledger.credit.available,
        perseusQty: ledger.perseusQty,
        perseusUnit: ledger.perseusUnit,
        buyerBySku: Object.fromEntries(
          Object.values(ledger.products).map((p) => [p.sku, p.buyerPrice])
        ),
      }
    );

    const checks = [
      ["images", result.images],
      ["overlaps", result.overlaps],
      ["clipped", result.clipped],
      ["table-align", result.tableAlign],
      ["avatar<=40", result.avatar],
      ["ledger", result.ledger],
      ["no-emdash", result.emdash],
      ["sku-price", result.skuPrice],
      ["search-ph", result.searchPlaceholder],
      ["footer-band", result.footerBand],
      ["joola-mark", result.joolaMark],
      ["numeric-align", result.numericAlign],
      ["media-surface", result.mediaSurface],
      ["tabular-nums", result.tabularNums],
      ["money-align", result.moneyAlign],
      ["row-height", result.rowHeight],
      ["single-accent", result.singleAccent],
      ["status-pill", result.statusPill],
      ["image-contain", result.imageContain],
      ["multi-line", result.multiLine],
      ["ia", result.ia],
      ["interaction-css", result.interactionStates],
      ["qo-rail", result.qoRail],
      ["msg-context", result.msgContext],
      ["cart-checkout", result.cartCheckout],
      ["netsuite-labels", result.netsuiteLabels],
      ["pixel-nits", result.pixelNits],
      ["fonts-loaded", result.fontsLoaded],
      ["type-scale", result.typeScale],
      ["less-better", result.lessBetter],
    ];
    for (const [name, list] of checks) {
      // Screen-scoped checks: skip empty N/A as PASS only when relevant
      const scoped = {
        "search-ph": ["qo-desktop"],
        "footer-band": ["qo-desktop", "qo-mobile"],
        "joola-mark": ["messages"],
        "numeric-align": ["invoices"],
        "media-surface": ["catalog"],
        "sku-price": ["qo-desktop", "catalog", "cart", "templates"],
        "status-pill": ["invoices"],
        "image-contain": ["qo-desktop", "catalog", "cart"],
        "row-height": ["qo-desktop", "cart", "invoices"],
        "money-align": ["qo-desktop", "cart", "invoices"],
        "tabular-nums": ["qo-desktop", "catalog", "cart", "invoices", "messages", "qo-mobile"],
        "single-accent": ["qo-desktop", "catalog", "cart", "invoices", "messages"],
        "multi-line": ["qo-desktop", "cart", "invoices", "messages"],
        "ia": ["qo-desktop", "catalog", "invoices", "messages"],
        "interaction-css": ["qo-desktop"],
        "qo-rail": ["qo-desktop"],
        "msg-context": ["messages"],
        "cart-checkout": ["cart"],
        "netsuite-labels": ["qo-desktop", "cart", "invoices", "messages"],
        "pixel-nits": ["qo-desktop", "cart"],
        "fonts-loaded": ["qo-desktop"],
        "type-scale": ["qo-desktop"],
        "less-better": ["qo-desktop"],
      };
      if (scoped[name] && !scoped[name].includes(screen)) continue;
      record(screen, name, list.length === 0, list.slice(0, 4).join("; "));
    }
  }

  // Layout shift: film-critical QO states must keep shell geometry fixed
  {
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => window.JOOLA_LEDGER && document.querySelector("[data-screen]"));
    await page.evaluate(() => document.fonts.ready);

    const measure = () =>
      page.evaluate(() => {
        const root = document.querySelector('[data-screen="qo-desktop"].active');
        if (!root) return null;
        const box = (sel) => {
          const el = root.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: Math.round(r.x * 10) / 10,
            y: Math.round(r.y * 10) / 10,
            w: Math.round(r.width * 10) / 10,
            h: Math.round(r.height * 10) / 10,
          };
        };
        return {
          page: box(".page"),
          layout: box(".qo-layout"),
          table: box("[data-order-table]"),
          rail: box("[data-qo-rail]"),
          search: box("[data-search-field]"),
          footer: box("[data-order-footer]"),
        };
      });

    const activateQo = async () => {
      await page.evaluate(() => {
        document.querySelectorAll(".screen").forEach((el) => {
          el.classList.toggle("active", el.getAttribute("data-screen") === "qo-desktop");
        });
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(80);
    };

    const setSearch = async ({ value, open }) => {
      await page.evaluate(
        ({ value, open }) => {
          const root = document.querySelector('[data-screen="qo-desktop"].active');
          const field = root.querySelector("[data-search-field]");
          const results = root.querySelector("[data-search-results]");
          const valEl = field && field.querySelector(".value");
          if (field) {
            if (value) {
              field.classList.add("has-value");
              field.setAttribute("data-search-value", value);
              if (valEl) valEl.textContent = value;
            } else {
              field.classList.remove("has-value");
              field.setAttribute("data-search-value", "");
              if (valEl) valEl.textContent = "";
            }
          }
          if (results) {
            if (open) {
              results.removeAttribute("hidden");
              results.classList.remove("is-closed");
              // Ensure at least one result row for open state
              if (!results.querySelector("[data-search-result]")) {
                const p = window.JOOLA_LEDGER.products.perseus;
                results.innerHTML =
                  '<div class="search-result" data-search-result data-sku="' +
                  p.sku +
                  '"><div><div class="title">' +
                  p.name +
                  '</div><div class="meta">SKU ' +
                  p.sku +
                  "</div></div></div>";
              }
            } else {
              results.setAttribute("hidden", "");
              results.classList.add("is-closed");
            }
          }
        },
        { value, open }
      );
      await page.waitForTimeout(40);
    };

    await activateQo();

    const snapshots = {};
    // empty — no query, results closed
    await setSearch({ value: "", open: false });
    snapshots.empty = await measure();
    // typing — name typed, dropdown still closed
    await setSearch({ value: "Perseus", open: false });
    snapshots.typing = await measure();
    // results open — overlay only
    await setSearch({ value: "Perseus", open: true });
    snapshots.resultsOpen = await measure();
    // line added — table already has lines; keep results closed
    await setSearch({ value: "Perseus", open: false });
    snapshots.lineAdded = await measure();
    // qty changed
    await page.evaluate(() => window.__setPerseusQty(24));
    await page.waitForTimeout(120);
    await activateQo();
    await setSearch({ value: "Perseus", open: false });
    snapshots.qtyChanged = await measure();
    // restore story qty then add to cart
    await page.evaluate(() => window.__setPerseusQty(120));
    await page.waitForTimeout(120);
    await activateQo();
    await setSearch({ value: "Perseus", open: false });
    await page.click('[data-screen="qo-desktop"].active [data-add-all], [data-screen="qo-desktop"].active #qoAddAllBtn');
    await page.waitForTimeout(200);
    snapshots.addedToCart = await measure();

    // Also compare dedicated qo-search screen against qo-desktop results-open
    await page.evaluate(() => {
      document.querySelectorAll(".screen").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-screen") === "qo-search");
      });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(100);
    const searchScreen = await page.evaluate(() => {
      const root = document.querySelector('[data-screen="qo-search"].active');
      if (!root) return null;
      const box = (sel) => {
        const el = root.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x * 10) / 10,
          y: Math.round(r.y * 10) / 10,
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10,
        };
      };
      return { page: box(".page"), layout: box(".qo-layout"), table: box("[data-order-table]"), rail: box("[data-qo-rail]") };
    });

    const keys = ["page", "layout", "table", "rail", "search"];
    const eps = 1; // px tolerance
    const diffs = [];
    const baseline = snapshots.empty;
    for (const [name, snap] of Object.entries(snapshots)) {
      if (name === "empty" || !snap || !baseline) continue;
      for (const k of keys) {
        const a = baseline[k];
        const b = snap[k];
        if (!a || !b) {
          diffs.push(`${name}.${k} missing`);
          continue;
        }
        // Height of table/rail may change with qty presets / cart — compare x/w (column geometry)
        if (Math.abs(a.x - b.x) > eps || Math.abs(a.w - b.w) > eps) {
          diffs.push(`${name}.${k} x/w ${a.x}/${a.w}→${b.x}/${b.w}`);
        }
      }
      // Footer y may shift only if content height changes; x/w must hold
      if (baseline.footer && snap.footer) {
        if (Math.abs(baseline.footer.x - snap.footer.x) > eps || Math.abs(baseline.footer.w - snap.footer.w) > eps) {
          diffs.push(`${name}.footer x/w drift`);
        }
      }
    }
    if (searchScreen && snapshots.resultsOpen) {
      for (const k of ["page", "layout", "table", "rail"]) {
        const a = snapshots.resultsOpen[k];
        const b = searchScreen[k];
        if (!a || !b) {
          diffs.push(`qo-search.${k} missing`);
          continue;
        }
        if (Math.abs(a.x - b.x) > eps || Math.abs(a.w - b.w) > eps) {
          diffs.push(`qo-search.${k} x/w ${a.x}/${a.w} vs open ${b.x}/${b.w}`);
        }
      }
    }

    record(
      "qo-desktop",
      "layout-shift",
      diffs.length === 0,
      diffs.length ? diffs.slice(0, 6).join("; ") : "empty/typing/open/qty/cart + qo-search stable"
    );

    // Reload so subsequent interactive checks start clean
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => window.JOOLA_LEDGER && document.querySelector("[data-screen]"));
    await page.evaluate(() => document.fonts.ready);
  }

  // Interactive: Add all increments cart badge and shows toast
  {
    await page.evaluate(() => {
      document.querySelectorAll(".screen").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-screen") === "qo-desktop");
      });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => {
      const badge = document.querySelector("[data-cart-count]");
      if (!badge || badge.hasAttribute("hidden") || !(badge.textContent || "").trim()) return 0;
      return parseInt(badge.textContent, 10) || 0;
    });
    await page.click("[data-add-all], #qoAddAllBtn");
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => {
      const badge = document.querySelector("[data-cart-count]");
      const toast = document.querySelector("[data-toast]");
      const toastShown =
        toast &&
        !toast.hasAttribute("hidden") &&
        (toast.classList.contains("show") || getComputedStyle(toast).opacity !== "0");
      const countText = badge && !badge.hasAttribute("hidden") ? (badge.textContent || "").trim() : "";
      return {
        count: countText ? parseInt(countText, 10) : 0,
        hidden: !badge || badge.hasAttribute("hidden"),
        toastShown: !!toastShown,
        toastText: toast ? toast.textContent || "" : "",
        insidePill: (() => {
          if (!badge || badge.hasAttribute("hidden")) return true;
          const pill = badge.closest(".cart-pill, [data-cart-pill]");
          if (!pill) return false;
          const br = badge.getBoundingClientRect();
          const pr = pill.getBoundingClientRect();
          return br.top >= pr.top - 0.5 && br.bottom <= pr.bottom + 0.5 && br.left >= pr.left - 0.5 && br.right <= pr.right + 0.5;
        })(),
      };
    });
    const expected = ledger.cartCountAfterAdd || ledger.orderLines.length;
    record(
      "qo-desktop",
      "cart-increment",
      after.count > before && after.count === expected && !after.hidden && after.insidePill,
      `chip ${before}→${after.count} (want ${expected}) inside=${after.insidePill}`
    );
    record(
      "qo-desktop",
      "toast-success",
      after.toastShown && /added|cart/i.test(after.toastText),
      after.toastShown ? after.toastText.trim().slice(0, 60) : "toast not shown"
    );
  }

  // Pixel-ink checks (PIL): badge digit, badge↔text cap centre, account pad, credit flush
  {
    await page.evaluate(() => {
      document.querySelectorAll(".screen").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-screen") === "cart");
      });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(140);
    const tmp = mkdtempSync(join(tmpdir(), "joola-ink-"));
    const cartPillPath = join(tmp, "cart-pill.png");
    const badgePath = join(tmp, "badge.png");
    const acctPath = join(tmp, "account.png");
    const creditPath = join(tmp, "credit.png");
    await page.locator('[data-screen="cart"] [data-cart-pill]').screenshot({ path: cartPillPath });
    await page.locator('[data-screen="cart"] [data-cart-count]').screenshot({ path: badgePath });
    await page.locator('[data-screen="cart"] [data-account-chip]').screenshot({ path: acctPath });
    await page.locator('[data-screen="cart"] [data-credit-bar]').screenshot({ path: creditPath });
    const gapDom = await page.evaluate(() => {
      const cart = document.querySelector('[data-screen="cart"] [data-cart-pill]');
      const badge = cart && cart.querySelector("[data-cart-count]");
      const spans = cart ? [...cart.querySelectorAll(":scope > span:not(.count-chip)")] : [];
      if (!badge || !spans.length) return null;
      const last = spans[spans.length - 1].getBoundingClientRect();
      const br = badge.getBoundingClientRect();
      return {
        gap: br.left - last.right,
        bw: br.width,
        bh: br.height,
        fs: parseFloat(getComputedStyle(badge).fontSize) || 0,
        lh: getComputedStyle(badge).lineHeight,
      };
    });
    const acctDom = await page.evaluate(() => {
      const chip = document.querySelector('[data-screen="cart"] [data-account-chip]');
      const av = chip && chip.querySelector("[data-retailer-avatar]");
      const meta = chip && chip.querySelector(".account-meta");
      if (!chip || !av || !meta) return null;
      const cr = chip.getBoundingClientRect();
      const ar = av.getBoundingClientRect();
      const mr = meta.getBoundingClientRect();
      const name = meta.querySelector(".name");
      const role = meta.querySelector(".role");
      // Right optical edge = max text scroll/offset width within meta
      let textRight = mr.left;
      [name, role].forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        // range for glyph box
        const range = document.createRange();
        range.selectNodeContents(el);
        const tr = range.getBoundingClientRect();
        textRight = Math.max(textRight, tr.right || r.right);
      });
      return {
        h: cr.height,
        av: ar.width,
        gap: ar.left - cr.left > 0 ? parseFloat(getComputedStyle(chip).gap) || 0 : 0,
        padL: ar.left - cr.left,
        padR: cr.right - textRight,
        gapCss: parseFloat(getComputedStyle(chip).gap) || 0,
        metaCy: (mr.top + mr.bottom) / 2,
        chipCy: (cr.top + cr.bottom) / 2,
        avCy: (ar.top + ar.bottom) / 2,
      };
    });
    const py = `
from PIL import Image
import json

def is_blue(r,g,b,a=255):
  return a >= 180 and abs(r-44)<55 and abs(g-62)<55 and abs(b-224)<55

def is_dark(r,g,b,a=255):
  return a >= 180 and (r+g+b) < 520

def is_wash(r,g,b,a=255):
  # remaining track / soft greys
  if a < 180: return False
  if is_blue(r,g,b,a): return False
  if is_dark(r,g,b,a): return False
  return 180 <= r <= 250 and 180 <= g <= 250 and 180 <= b <= 250 and max(r,g,b)-min(r,g,b) < 40

def is_muted_fill(r,g,b,a=255):
  # used-credit grey (#9a9aa3-ish), not wash, not ink text
  if a < 180: return False
  if is_blue(r,g,b,a): return False
  avg = (r+g+b)/3
  return 120 <= avg <= 200 and max(r,g,b)-min(r,g,b) < 35

badge = Image.open(${JSON.stringify(badgePath)}).convert("RGBA")
pill = Image.open(${JSON.stringify(cartPillPath)}).convert("RGBA")
acct = Image.open(${JSON.stringify(acctPath)}).convert("RGBA")
credit = Image.open(${JSON.stringify(creditPath)}).convert("RGBA")
bw, bh = badge.size
# --- digit ink centre inside badge ---
ink = []
for y in range(bh):
  for x in range(bw):
    r,g,b,a = badge.getpixel((x,y))
    if a < 200: continue
    if is_blue(r,g,b,a): continue
    if r>235 and g>235 and b>235: continue
    ink.append((x,y))
digit_ok = False
dx = dy = 99.0
if ink:
  cx = sum(p[0] for p in ink)/len(ink)
  cy = sum(p[1] for p in ink)/len(ink)
  dx = abs(cx - (bw-1)/2)
  dy = abs(cy - (bh-1)/2)
  digit_ok = dx <= 1.0 and dy <= 1.0

# --- badge circle vs text glyph ink (cap-height centre) on full cart pill ---
pw, ph = pill.size
blue_pts = []
for y in range(ph):
  for x in range(pw):
    r,g,b,a = pill.getpixel((x,y))
    if is_blue(r,g,b,a):
      blue_pts.append((x,y))
badge_cy = None
badge_cx = None
badge_left = None
if blue_pts:
  badge_left = min(p[0] for p in blue_pts)
  badge_right = max(p[0] for p in blue_pts)
  badge_top = min(p[1] for p in blue_pts)
  badge_bot = max(p[1] for p in blue_pts)
  badge_cx = (badge_left + badge_right) / 2
  badge_cy = (badge_top + badge_bot) / 2

# Text ink to the left of the badge (Cart + amount). Cap band = top→~72% of ink height.
text_ink = []
x_limit = (badge_left - 4) if badge_left is not None else pw
for y in range(ph):
  for x in range(max(0, x_limit)):
    r,g,b,a = pill.getpixel((x,y))
    if is_dark(r,g,b,a):
      text_ink.append((x,y))
cap_dy = 99.0
cap_ok = False
text_cap_cy = None
if text_ink and badge_cy is not None:
  ys = sorted(p[1] for p in text_ink)
  top = ys[0]
  bot = ys[-1]
  # Cap-height centre: midpoint of upper 72% of the ink box (no descenders in Cart/$ figures)
  cap_bot = top + (bot - top) * 0.72
  text_cap_cy = (top + cap_bot) / 2
  # Also compare to full ink centre (figures ≈ cap height)
  ink_cy = (top + bot) / 2
  # Prefer the tighter of ink-centre vs cap-band centre
  cap_dy = min(abs(badge_cy - text_cap_cy), abs(badge_cy - ink_cy))
  cap_ok = cap_dy <= 1.25

# Ink gap: rightmost text ink x → badge left
gap_ink = 99.0
if text_ink and badge_left is not None:
  gap_ink = badge_left - max(p[0] for p in text_ink)

# --- account chip optical pad (left border→logo vs rightmost text ink→right border) ---
aw, ah = acct.size
# Find logo tile: clustered non-white near left
logo_right = None
logo_left = None
for x in range(aw):
  col_dark = 0
  for y in range(ah):
    r,g,b,a = acct.getpixel((x,y))
    if a < 200: continue
    if r+g+b < 700:
      col_dark += 1
  if col_dark >= max(3, ah // 6):
    if logo_left is None:
      logo_left = x
    logo_right = x
  elif logo_left is not None and x > logo_left + 8:
    break
# Text ink right of logo
acct_text = []
start = (logo_right + 2) if logo_right is not None else 0
for y in range(ah):
  for x in range(start, aw):
    r,g,b,a = acct.getpixel((x,y))
    if is_dark(r,g,b,a):
      acct_text.append((x,y))
pad_l = pad_r = 99.0
pad_ok = False
meta_cy_ok = False
if logo_left is not None and acct_text:
  pad_l = logo_left  # content starts after ~1px border antialias
  text_right = max(p[0] for p in acct_text)
  pad_r = (aw - 1) - text_right
  # Optical equality within 2px (border AA)
  pad_ok = abs(pad_l - pad_r) <= 2.5 and 9 <= pad_l <= 16 and 9 <= pad_r <= 16
  # Two-line meta optical centre vs pill/logo centre
  tys = sorted(p[1] for p in acct_text)
  meta_cy = (tys[0] + tys[-1]) / 2
  meta_cy_ok = abs(meta_cy - (ah - 1) / 2) <= 1.5

# --- credit bar: flush segments, no stub/gap columns ---
cw, ch = credit.size
# Sample mid-row colours left→right; classify used / order / remain
mid = ch // 2
cols = []
for x in range(cw):
  r,g,b,a = credit.getpixel((x, mid))
  if is_blue(r,g,b,a):
    cols.append("o")  # order
  elif is_muted_fill(r,g,b,a):
    cols.append("u")  # used
  else:
    cols.append("r")  # remaining / wash
# Collapse runs
runs = []
for c in cols:
  if not runs or runs[-1][0] != c:
    runs.append([c, 1])
  else:
    runs[-1][1] += 1
# Expect pattern u+ o+ r* (order may be absent if tiny) — no r stub between u and o, no gaps
seq = "".join(r[0] for r in runs)
flush_ok = False
# Allow u o r / u r / o r / u o
if seq in ("uor", "ur", "or", "uo", "u", "o", "r"):
  flush_ok = True
elif seq.startswith("uor") or seq.startswith("uo") or seq.startswith("ur"):
  flush_ok = "r" not in seq[1:seq.find("o")+1] if "o" in seq else True
# Explicit stub/gap: remaining sandwiched before order ends, or single-pixel foreign run mid-fill
gap_runs = [r for r in runs if r[0] == "r" and r != runs[-1]]
stub_fail = any(r[1] <= 3 for r in gap_runs) or (len(gap_runs) > 0 and "o" in seq and seq.index("r") < seq.rfind("o"))
# Edge meeting: first and last columns should be fill (not transparent hole)
edge_ok = cols[0] in ("u", "o", "r") and cols[-1] in ("u", "o", "r") and ch >= 5 and ch <= 8
flush_ok = flush_ok and not stub_fail and edge_ok and "u" in seq

print(json.dumps({
  "digit_ok": digit_ok, "dx": dx, "dy": dy, "ink_n": len(ink),
  "cap_ok": cap_ok, "cap_dy": cap_dy, "gap_ink": gap_ink,
  "badge_cy": badge_cy, "text_cap_cy": text_cap_cy,
  "pad_ok": pad_ok, "pad_l": pad_l, "pad_r": pad_r, "meta_cy_ok": meta_cy_ok,
  "flush_ok": flush_ok, "credit_seq": seq, "credit_h": ch, "stub_fail": stub_fail,
}))
`;
    const inkRun = spawnSync("python3", ["-c", py], { encoding: "utf8" });
    let ink = {};
    try {
      ink = JSON.parse((inkRun.stdout || "").trim().split("\n").pop());
    } catch {
      ink = { err: (inkRun.stderr || inkRun.stdout || "").slice(0, 200) };
    }
    record(
      "cart",
      "badge-ink",
      !!ink.digit_ok,
      ink.digit_ok
        ? `digit ink Δx=${Number(ink.dx).toFixed(2)} Δy=${Number(ink.dy).toFixed(2)} (≤1px)`
        : `digit ink fail Δx=${ink.dx} Δy=${ink.dy} n=${ink.ink_n} ${ink.err || ""}`.slice(0, 100)
    );
    const gapOk = gapDom && gapDom.gap >= 7 && gapDom.gap <= 9;
    const sizeOk = gapDom && Math.abs(gapDom.bw - 18) <= 1 && Math.abs(gapDom.bh - 18) <= 1 && Math.abs(gapDom.fs - 11) <= 0.5;
    record(
      "cart",
      "badge-cap",
      !!(ink.cap_ok && gapOk && sizeOk && Number(ink.gap_ink) >= 6 && Number(ink.gap_ink) <= 12),
      ink.cap_ok != null
        ? `ink cap Δ=${Number(ink.cap_dy).toFixed(2)} gapDom=${gapDom ? gapDom.gap.toFixed(1) : "?"} gapInk=${Number(ink.gap_ink).toFixed(1)} size=${gapDom ? `${gapDom.bw}x${gapDom.bh}@${gapDom.fs}` : "?"}`
        : `missing ${ink.err || ""}`.slice(0, 100)
    );
    const acctPadOk =
      acctDom &&
      Math.abs(acctDom.h - 36) <= 1.5 &&
      Math.abs(acctDom.av - 28) <= 1.5 &&
      acctDom.gapCss >= 9.5 &&
      acctDom.gapCss <= 12.5 &&
      Math.abs(acctDom.padL - 12) <= 1.5 &&
      acctDom.padR >= 11 &&
      acctDom.padR <= 16 &&
      // Right may be 1–2px larger so long names clear the pill curve optically
      acctDom.padR + 0.5 >= acctDom.padL &&
      acctDom.padR - acctDom.padL <= 3 &&
      Math.abs(acctDom.metaCy - acctDom.chipCy) <= 1 &&
      Math.abs(acctDom.avCy - acctDom.chipCy) <= 1;
    record(
      "cart",
      "account-pad",
      !!(acctPadOk && ink.meta_cy_ok),
      acctDom
        ? `h=${acctDom.h.toFixed(1)} av=${acctDom.av.toFixed(1)} gap=${acctDom.gapCss} pad L=${acctDom.padL.toFixed(1)} R=${acctDom.padR.toFixed(1)} metaΔ=${Math.abs(acctDom.metaCy - acctDom.chipCy).toFixed(2)}`
        : `account pad fail ${ink.err || ""}`.slice(0, 80)
    );
    record(
      "cart",
      "credit-flush",
      !!(ink.flush_ok && ink.credit_h >= 5 && ink.credit_h <= 8),
      ink.credit_seq
        ? `seq=${ink.credit_seq} h=${ink.credit_h} stub=${ink.stub_fail}`
        : `credit flush fail ${ink.err || ""}`.slice(0, 80)
    );
  }

  // Catalog recommended why + view toggle
  {
    await page.evaluate(() => {
      document.querySelectorAll(".screen").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-screen") === "catalog");
      });
    });
    await page.waitForTimeout(100);
    const cat = await page.evaluate(() => {
      const whys = [...document.querySelectorAll("[data-screen='catalog'] .why, [data-screen='catalog'] .rec-card .why")];
      const toggle = document.querySelector("[data-view-toggle]");
      const listBtn = document.querySelector('[data-view-toggle] [data-view="list"]');
      if (listBtn) listBtn.click();
      const listOn = !!document.querySelector("[data-catalog-list].is-on, .catalog-list.is-on, [data-view='list'].on");
      return {
        whyCount: whys.filter((el) => (el.textContent || "").trim().length > 8).length,
        hasToggle: !!toggle,
        listOn,
      };
    });
    record(
      "catalog",
      "rec-why",
      cat.whyCount >= 3,
      `why lines=${cat.whyCount}`
    );
    record(
      "catalog",
      "view-toggle",
      cat.hasToggle && cat.listOn,
      cat.hasToggle ? (cat.listOn ? "list on" : "list not activated") : "toggle missing"
    );
  }

  // Print table
  const pad = (s, n) => String(s).padEnd(n);
  console.log("\nJOOLA B2B prototype check @ 1920×1080\n");
  console.log(
    `${pad("SCREEN", 14)} ${pad("CHECK", 14)} ${pad("RESULT", 6)} DETAIL`
  );
  console.log("-".repeat(100));
  for (const r of rows) {
    console.log(
      `${pad(r.screen, 14)} ${pad(r.check, 14)} ${pad(r.pass ? "PASS" : "FAIL", 6)} ${r.detail}`
    );
  }
  const passCount = rows.filter((r) => r.pass).length;
  console.log("-".repeat(100));
  console.log(
    `${passCount}/${rows.length} checks passed · orderTotal=${ledger.money(ledger.orderTotal)} · perseus ${ledger.perseusQty}×${ledger.money(ledger.perseusUnit)}=${ledger.money(ledger.perseusOrderTotal)}`
  );
  console.log(failed ? "\nOVERALL: FAIL\n" : "\nOVERALL: PASS\n");

  await browser.close();
  server.close();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
