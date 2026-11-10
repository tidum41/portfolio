// Dialogue design-system gate. Run: npm run check:dialogue-system [-- <repoRoot>]
// Scans components/dialogue/**, app/dialogue/**, the Dialogue rules in
// app/globals.css (selectors with "dialogue" or "dp-") and
// components/dialogue/product/dialogue-product.css. Raw values may live only in
// styles/dialogue-tokens.css and app/globals.css :root/theme token blocks.
// Rules:
//   raw-color      hex/rgb/hsl literal in a declaration (custom-property token defs exempt)
//   raw-px         px font-size, radius, or off-scale px spacing/size
//   token-fallback var(--x, <literal>) hides a raw value
//   font           font-family outside Helvetica Neue/Arial/Georgia/var(); DM Sans/Zilla only in product-UI scope
//   figure-width   width/max-width over 640px in Dialogue scope
//   inline-px      style={{ ... }} with a px or bare-number length in TSX
//   dup-selector   same selector defined in globals.css and dialogue-product.css
//   figure-class   a figure wrapper in DialogueCaseStudyContent without cs-figure
//   allowlist      DialogueCaseStudyContent imports a component missing from design/SYSTEM-COMPONENTS.md
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";

const ROOT = process.argv[2] || ".";
const rel = (p) => p.slice(ROOT.length).replace(/^\/+/, "") || p;
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const problems = [];
const report = (file, line, rule, text) =>
  problems.push({ file, line, rule, text: String(text).trim().slice(0, 110) });

const SCALE = new Set([0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 120, 128, 160, 200, 240, 272, 320, 384, 448, 480, 560, 600, 640]);
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|lab|lch)\(/i;
const PX = /(-?\d*\.?\d+)px\b/g;
const ALLOWED_FONT = /^(?:var\([^)]*\)|inherit|"?Helvetica Neue"?|Helvetica|Arial|Georgia|"Times New Roman"|serif|sans-serif|system-ui|-apple-system)$/i;
const PRODUCT_FONT = /DM Sans|Zilla/i;

function walk(dir, out = []) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return out;
  for (const n of readdirSync(abs)) {
    const p = join(dir, n);
    if (statSync(join(ROOT, p)).isDirectory()) walk(p, out);
    else if ([".css", ".ts", ".tsx"].includes(extname(p))) out.push(p);
  }
  return out;
}

// Minimal CSS walker: yields {selector, prop, value, line} with the nearest rule selector.
function* cssDecls(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const stack = [];
  let buf = "", line = 1, bufLine = 1;
  for (const ch of clean) {
    if (ch === "{") { stack.push(buf.trim()); buf = ""; }
    else if (ch === "}") { yield* flush(); stack.pop(); buf = ""; }
    else if (ch === ";") { yield* flush(); buf = ""; }
    else { if (!buf.trim()) bufLine = line; buf += ch; }
    if (ch === "\n") line++;
  }
  function* flush() {
    const m = buf.match(/^\s*([-\w]+)\s*:\s*([\s\S]+)$/);
    const sel = [...stack].reverse().find((s) => !s.startsWith("@")) || "";
    if (m) yield { selector: sel, prop: m[1], value: m[2].trim(), line: bufLine + (buf.match(/^\s*\n*/)[0].split("\n").length - 1) };
  }
}
function* cssRules(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const re = /([^{}@;][^{};]*)\{/g; let m;
  while ((m = re.exec(clean))) {
    const sel = m[1].trim();
    if (/^(from|to|\d+%)/.test(sel)) continue;
    yield { sel, line: clean.slice(0, m.index).split("\n").length + (m[1].match(/^\s*/)[0].split("\n").length - 1) };
  }
}

const isTokenScope = (sel) => /^(:root|html(\[data-theme[^\]]*\])?|html:not\([^)]*\))$/.test(sel.trim());
const productScope = (file, sel) =>
  /components\/dialogue\/product\//.test(file) || /dialogue-product-root|\.dp-/.test(sel);

function checkCss(file, src, dialogueOnly) {
  for (const d of cssDecls(src)) {
    if (dialogueOnly && !/dialogue|\bdp-/.test(d.selector)) continue;
    // Product recreation internals mirror Dialogue's real UI measurements, so the
    // spacing scale and 640 lock apply to the case-study layer only.
    const product = /components\/dialogue\/product\//.test(file);
    if (/app\/dialogue\/ds-parity\//.test(file)) continue;
    const { prop, value, line, selector } = d;
    const isTokenDef = prop.startsWith("--");
    if (isTokenDef && (isTokenScope(selector) || !dialogueOnly)) continue; // token definitions are the system
    if (!isTokenDef || dialogueOnly) {
      const noVar = value.replace(/var\([^()]*\)/g, "");
      if (HEX.test(noVar) || COLOR_FN.test(noVar)) report(file, line, "raw-color", `${selector} { ${prop}: ${value} }`);
    }
    const fb = value.match(/var\(--[\w-]+\s*,\s*([^)]*)\)/);
    if (fb && prop !== "font-family" && (/#[0-9a-f]{3,8}/i.test(fb[1]) || (!product && /(^|\s)-?(?!0px)\d*\.?\d+(px|rem)/.test(fb[1])))) report(file, line, "token-fallback", `${prop}: ${value}`);
    const bare = value.replace(/var\([^()]*\)/g, "");
    if (prop === "font-size" && PX.test(bare)) report(file, line, "raw-px", `font-size: ${value}`);
    PX.lastIndex = 0;
    if (/border(-[a-z]+)*-radius$/.test(prop) && /\d+px/.test(bare)) report(file, line, "raw-px", `${prop}: ${value}`);
    if (!product && /^(margin|padding|gap|row-gap|column-gap|width|height|min-|max-|top|left|right|bottom)/.test(prop) && !/^calc|clamp/.test(bare)) {
      for (const [, n] of bare.matchAll(PX)) {
        const v = Math.abs(parseFloat(n));
        if (!SCALE.has(v)) { report(file, line, "raw-px", `${prop}: ${value} (off-scale ${n}px)`); break; }
      }
    }
    if (!product && /^(max-)?width$/.test(prop)) {
      for (const [, n] of bare.matchAll(PX)) if (parseFloat(n) > 640) report(file, line, "figure-width", `${selector} { ${prop}: ${value} }`);
    }
    if (prop === "font-family") {
      for (const f of value.replace(/var\(--[\w-]+\s*,?/g, "").replace(/\)\s*$/, "").split(",").filter((x) => x.trim()).map((x) => x.trim().replace(/^'|'$/g, ""))) {
        if (PRODUCT_FONT.test(f)) { if (!productScope(file, selector)) report(file, line, "font", `${selector}: ${value}`); }
        else if (!ALLOWED_FONT.test(f)) report(file, line, "font", `${selector}: ${value}`);
      }
    }
  }
}

function checkTsx(file, src) {
  src.split("\n").forEach((raw, i) => {
    const line = raw.replace(/^\s*(\/\/|\*|\/\*).*$/, "");
    const n = i + 1;
    const style = line.match(/style=\{\{([^}]*)\}\}/);
    if (style && /(\b[1-9]\d*(\.\d+)?px|:\s*-?[1-9]\d*(\.\d+)?\s*[,}])/.test(style[1] + "}") && !/opacity|zIndex|flex:|order|lineHeight:\s*1(\.\d+)?\b/.test(style[1]))
      report(file, n, "inline-px", raw);
    if (/className=\{?[`"][^`"]*\b(dialogueDmSans|font-dm)/.test(line) || (/dialogueDmSans\.className/.test(line) && !/product/.test(file)))
      report(file, n, "font", raw);
    if (/(fontFamily)\s*:\s*["'`](?!var\()/.test(line) && !/Georgia|Helvetica|Arial/.test(line)) report(file, n, "font", raw);
    if (HEX.test(line.replace(/&#\d+;/g, "")) && !/tokens\.ts$/.test(file)) report(file, n, "raw-color", raw);
  });
}

// 1. Files
const tsx = [...walk("components/dialogue"), ...walk("app/dialogue")];
for (const f of tsx) {
  if (/app\/dialogue\/ds-parity\//.test(f)) continue; // dev parity harness, not the case study
  const src = read(f);
  if (extname(f) === ".css") checkCss(f, src, false);
  else checkTsx(f, src);
}
if (existsSync(join(ROOT, "app/globals.css"))) checkCss("app/globals.css", read("app/globals.css"), true);

// 2. Duplicate selectors across globals.css and dialogue-product.css
const PRODUCT_CSS = "components/dialogue/product/dialogue-product.css";
if (existsSync(join(ROOT, PRODUCT_CSS)) && existsSync(join(ROOT, "app/globals.css"))) {
  const prod = new Map();
  for (const r of cssRules(read(PRODUCT_CSS))) prod.set(r.sel, r.line);
  for (const r of cssRules(read("app/globals.css")))
    if (prod.has(r.sel) && /dp-|dialogue/.test(r.sel))
      report("app/globals.css", r.line, "dup-selector", `${r.sel}  (also ${PRODUCT_CSS}:${prod.get(r.sel)})`);
}

// 3. Allowlist + figure class on the page
const PAGE = "components/dialogue/DialogueCaseStudyContent.tsx";
if (existsSync(join(ROOT, PAGE))) {
  const page = read(PAGE);
  const allowPath = existsSync(join(ROOT, "design/SYSTEM-COMPONENTS.md"))
    ? join(ROOT, "design/SYSTEM-COMPONENTS.md")
    : new URL("../design/SYSTEM-COMPONENTS.md", import.meta.url).pathname;
  const allowSrc = readFileSync(allowPath, "utf8").split("## Not allowed")[0];
  const allow = new Set([...allowSrc.matchAll(/^- `([\w]+)`/gm)].map((m) => m[1]));
  page.split("\n").forEach((l, i) => {
    const m = l.match(/import\s+(?:type\s+)?([A-Z]\w*)[^"]*from\s+"@\/components\/([^"]+)"/);
    if (m && !/^import type/.test(l) && !allow.has(m[1]) && !allow.has(basename(m[2])))
      report(PAGE, i + 1, "allowlist", `${m[1]} from ${m[2]}`);
  });
  const open = page.match(/<CaseStudyOpen[\s\S]*?<\/CaseStudyOpen>/);
  if (open && /<(DialogueRachelFrame|figure|\w+Figure)\b/.test(open[0]) && !/cs-hero-media-frame|cs-figure/.test(open[0]))
    report(PAGE, page.slice(0, open.index).split("\n").length, "figure-class", "hero figure has no .cs-hero-media-frame/.cs-figure wrapper (escapes the 640 lock)");
  page.split("\n").forEach((l, i) => {
    if (/<figure\b/.test(l) && !/cs-figure/.test(l)) report(PAGE, i + 1, "figure-class", l);
  });
}

const byRule = {};
for (const p of problems) byRule[p.rule] = (byRule[p.rule] || 0) + 1;
for (const p of problems) console.log(`${p.file}:${p.line}  ${p.rule}  ${p.text}`);
const summary = Object.entries(byRule).map(([k, v]) => `${k}=${v}`).join(" ") || "clean";
if (problems.length) {
  console.error(`\ncheck:dialogue-system FAILED, ${problems.length} problems (${summary})`);
  process.exit(1);
}
console.log(`check:dialogue-system OK, ${tsx.length + 1} files`);
