/**
 * Mechanical QA for the JOOLA B2B HTML prototype.
 * Fails on empty images, overlaps, clipped text, misaligned table columns,
 * oversized avatars, ledger figure mismatches, and em dashes.
 *
 * Usage: node remotion/scripts/check-prototype.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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
      ({ screen, allowedMoney, cartTotal, orderTotal, creditUsed, creditLimit, perseusQty, perseusUnit, buyerBySku }) => {
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
          // credit bar visible
          const bar = root.querySelector("[data-credit-bar]");
          const fill = root.querySelector("[data-credit-fill]");
          if (!bar || !visible(bar)) issues.clipped.push("credit bar missing/invisible");
          if (fill) {
            const fr = fill.getBoundingClientRect();
            if (fr.width < 2) issues.clipped.push("credit bar fill has no width");
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
        if (screen === "invoices") must.push(creditUsed, creditLimit, orderTotal);
        if (screen === "messages") must.push(orderTotal);
        if (screen === "qo-desktop") must.push(perseusUnit);
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

        // 9. Data row heights 48–52px (skip preset-expanded rows)
        root.querySelectorAll("[data-order-row]:not(.has-presets), [data-invoice-row], [data-cart-line]").forEach((el) => {
          if (!visible(el)) return;
          const h = el.getBoundingClientRect().height;
          if (h < 47.5 || h > 52.5) {
            issues.rowHeight.push(
              `${el.className || "row"} height ${Math.round(h)}px outside 48-52`
            );
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

        // 14. IA: no Open cart under Account; account panel holds credit
        if (["qo-desktop", "catalog", "invoices", "messages"].includes(screen)) {
          const side = root.querySelector("[data-sidebar], .sidebar");
          if (side && /Open cart/i.test(side.textContent || "")) {
            issues.ia.push("sidebar still contains Open cart");
          }
          const panel = root.querySelector("[data-account-panel]");
          if (!panel || !visible(panel)) {
            issues.ia.push("account panel missing");
          } else if (!/\$/.test(panel.textContent || "")) {
            issues.ia.push("account panel missing credit figures");
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

        // 16. Quick Order rail
        if (screen === "qo-desktop") {
          const rail = root.querySelector("[data-qo-rail]");
          if (!rail || !visible(rail)) issues.qoRail.push("qo rail missing");
          else {
            const t = rail.textContent || "";
            if (!/template/i.test(t)) issues.qoRail.push("rail missing templates");
            if (!/recent|PO-/i.test(t)) issues.qoRail.push("rail missing recent orders");
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

        // 18. Cart checkout: PO, ship date, ship-to, collapsed warehouse notes, returns path
        if (screen === "cart") {
          const box = root.querySelector("[data-cart-checkout]");
          if (!box || !visible(box)) {
            issues.cartCheckout.push("cart checkout block missing");
          } else {
            if (!box.querySelector('[data-field="po"]')) issues.cartCheckout.push("PO field missing");
            if (!box.querySelector('[data-field="ship-date"]')) issues.cartCheckout.push("ship date missing");
            if (!box.querySelector('[data-field="ship-to"] select')) issues.cartCheckout.push("ship-to select missing");
            const notes = box.querySelector("[data-warehouse-notes]");
            if (!notes) issues.cartCheckout.push("warehouse notes missing");
            else if (notes.open) issues.cartCheckout.push("warehouse notes should start collapsed");
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

        // Quiet ships-from on Quick Order lines
        if (screen === "qo-desktop") {
          const rows = [...root.querySelectorAll("[data-order-row]")].filter(visible);
          const withShip = rows.filter((el) => /Ships from/i.test(el.textContent || ""));
          if (withShip.length < 2) {
            issues.netsuiteLabels.push("order lines missing ships-from availability");
          }
        }

        // Net 30 beside credit in account panel
        if (["qo-desktop", "invoices"].includes(screen)) {
          const panel = root.querySelector("[data-account-panel]");
          if (panel && visible(panel) && !/Net 30/i.test(panel.textContent || "")) {
            issues.netsuiteLabels.push("account panel missing Net 30 terms next to credit");
          }
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
        "netsuite-labels": ["qo-desktop", "invoices", "messages"],
      };
      if (scoped[name] && !scoped[name].includes(screen)) continue;
      record(screen, name, list.length === 0, list.slice(0, 4).join("; "));
    }
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
      return badge ? parseInt(badge.textContent || "0", 10) : -1;
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
      return {
        count: badge ? parseInt(badge.textContent || "0", 10) : -1,
        toastShown: !!toastShown,
        toastText: toast ? toast.textContent || "" : "",
      };
    });
    const expected = ledger.cartCountAfterAdd || ledger.orderLines.length;
    record(
      "qo-desktop",
      "cart-increment",
      after.count > before && after.count === expected,
      `badge ${before}→${after.count} (want ${expected})`
    );
    record(
      "qo-desktop",
      "toast-success",
      after.toastShown && /added|cart/i.test(after.toastText),
      after.toastShown ? after.toastText.trim().slice(0, 60) : "toast not shown"
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
