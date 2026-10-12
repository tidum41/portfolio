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

        // 14. IA: no Open cart; credit lives in cart summary (not sidebar); store link present
        if (["qo-desktop", "catalog", "invoices", "messages"].includes(screen)) {
          const side = root.querySelector("[data-sidebar], .sidebar");
          if (side && /Open cart/i.test(side.textContent || "")) {
            issues.ia.push("sidebar still contains Open cart");
          }
          if (side && /\$[\d,]+\.\d{2}/.test(side.textContent || "") && /Net 30|Available|used/i.test(side.textContent || "")) {
            issues.ia.push("credit figures must not appear in sidebar (cart summary only)");
          }
          if (!side || !side.querySelector("[data-store-link]")) {
            issues.ia.push("sidebar missing Shop joola.com store link");
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
            if (!/After placing|After this order/i.test(summary.textContent || "")) {
              issues.cartCheckout.push("summary missing after-placing credit copy");
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
            if (!box.querySelector('[data-field="ship-to"] select')) issues.cartCheckout.push("ship-to select missing");
            if (!box.querySelector("[data-ship-address]")) {
              issues.cartCheckout.push("ship-to address line missing");
            }
            const shipSelect = box.querySelector('[data-field="ship-to"] select');
            if (shipSelect && /Engage Pickleball\s*-\s/.test(shipSelect.textContent || "")) {
              issues.cartCheckout.push("ship-to uses hyphen; want · or en dash");
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
          const inStockSpam = rows.filter((el) => /In stock/i.test(el.querySelector(".prod-sku")?.textContent || ""));
          if (inStockSpam.length > 0) {
            issues.netsuiteLabels.push("In stock should be omitted (show only exceptions)");
          }
          const exception = rows.filter((el) => /2-day ship|day ship|Backorder|Low stock/i.test(el.querySelector(".prod-sku")?.textContent || ""));
          if (exception.length < 1) {
            issues.netsuiteLabels.push("expected at least one non-stock availability exception");
          }
          const withWh = rows.filter((el) => /Ships from|\bCA\b|\bTX\b/.test(el.querySelector(".prod-sku")?.textContent || ""));
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
          if (!footerMeta || !/Ready|In cart/i.test(footerMeta.textContent || "")) {
            issues.netsuiteLabels.push("footer missing ready vs cart distinction");
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
            if (Math.abs(ch - kh) > 1 || Math.abs(ch - 32) > 1.5) {
              issues.netsuiteLabels.push(`pill heights chip=${ch.toFixed(1)} cart=${kh.toFixed(1)} (want 32)`);
            }
            const cr = getComputedStyle(chip).borderRadius;
            const kr = getComputedStyle(cart).borderRadius;
            if (cr !== kr) issues.netsuiteLabels.push(`pill radius mismatch ${cr} vs ${kr}`);
            const av = chip.querySelector("[data-retailer-avatar]");
            if (av) {
              const aw = av.getBoundingClientRect().width;
              if (Math.abs(aw - 24) > 1.5) issues.netsuiteLabels.push(`avatar ${aw.toFixed(1)}px (want 24)`);
              const img = av.querySelector("img");
              if (!img || !/engage-logo/i.test(img.getAttribute("src") || "")) {
                issues.pixelNits.push("account chip missing Engage logo asset");
              }
              const gap = parseFloat(getComputedStyle(chip).gap) || 0;
              if (Math.abs(gap - 8) > 1) {
                issues.pixelNits.push(`account chip gap ${gap}px (want 8)`);
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

          // Shop joola.com text x = nav icon x
          const store = root.querySelector("[data-store-link]");
          const navIcon = root.querySelector(".nav-item .icon-slot");
          if (store && navIcon && visible(store) && visible(navIcon)) {
            const padL = parseFloat(getComputedStyle(store).paddingLeft) || 0;
            const sx = store.getBoundingClientRect().left + padL;
            const ix = navIcon.getBoundingClientRect().left;
            if (Math.abs(sx - ix) > 1.5) {
              issues.pixelNits.push(`store text x=${Math.round(sx)} vs nav icon x=${Math.round(ix)}`);
            }
          }

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

          // QO page max-width intentional at 1440
          const page = root.querySelector(".page");
          if (page) {
            const cs = getComputedStyle(page);
            const maxW = cs.maxWidth;
            if (!maxW || maxW === "none") {
              issues.pixelNits.push("qo page missing max-width (wide empty feel)");
            } else {
              const n = parseFloat(maxW);
              if (!(n > 900 && n <= 1200)) {
                issues.pixelNits.push(`qo page max-width=${maxW} (want ~1080)`);
              }
            }
          }
        }

        // Filled cart: count-chip visible and inside pill (cart screen)
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
          }
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
