// Dialogue homepage card gate. Run: npm run check:thumbnail-card [-- --self-test] [-- <repoRoot>]
// Also run by check:dialogue-system. Enforces the shipped states cut
// (components/dialogue/product/thumbnail/README.md) in code:
//   seg-transform   a segment rule sets transform other than none (bars never move)
//   seg-outline     a segment rule sets an outline other than none/0
//   seg-radius      a state rule (data-side/press/hover, :hover/:active/:focus) sets a segment's radius
//   seg-shadow      a segment box-shadow other than none or the role tokens
//   fill            a segment or swatch background other than the ramp tokens or the documented hover/press mixes
//   tone-token      a [data-tone] fill that does not match THUMBNAIL_BAR_TONE_TOKEN in thumbnailBarRamp.ts
//   raw-color       a hex/rgb/hsl literal in the card CSS/TSX outside custom-property token definitions
//   travel-dev-only the homepage passes selMotion or the lift-explore variant
// Exempt: selectors containing lift-explore or data-sel-variant (dev explorations),
// and the case-study product CSS (dialogue-product.css is not scanned).
// The gate runs its self-test first: known-bad snippets must each fire their rule.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const SELF_TEST_ONLY = args.includes("--self-test");
const ROOT = args.find((a) => !a.startsWith("--")) || ".";
const DIR = "components/dialogue/product/thumbnail";
const CSS_FILE = `${DIR}/dialogue-thumbnail.css`;
const RAMP_FILE = `${DIR}/thumbnailBarRamp.ts`;
const CODE_FILES = [`${DIR}/DialogueThumbnailDemo.tsx`, `${DIR}/variants.ts`, "components/DialogueThumbnailCard.tsx"];
const HOME_FILES = ["components/PersistentWorkShell.tsx"];

const SHADOW_TOKENS = new Set(["none", "var(--dlg-thumb-selected-frame)", "var(--dlg-thumb-hover-frame)"]);
const FALLBACK_RAMP = {
  focal: "--dp-chart-focal",
  mid: "--dp-chart-mid",
  soft: "--dp-chart-soft",
  neutral: "--dp-border-strong",
};
/** The documented pointer mixes: a ramp token deepened toward ink by a tunable percent. */
const MIX =
  /^color-mix\(in srgb, var\((--dp-chart-focal|--dp-border-strong)\) var\(--dlg-thumb-(hover|press)-(focal|neutral), \d+%\), var\(--dp-ink\)\)$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/i;

const stripCss = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

/** Yields { selectors: string[], decls: {prop, value, line}[], line } for each style rule. */
function* rules(src) {
  const clean = stripCss(src);
  const stack = [];
  let buf = "";
  let line = 1;
  let ruleLine = 1;
  let decls = [];
  const flushDecl = () => {
    const m = buf.match(/^\s*([-\w]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) decls.push({ prop: m[1], value: m[2].replace(/\s+/g, " ").trim(), line: line - (buf.match(/\n\s*$/) ? 1 : 0) });
    buf = "";
  };
  for (const ch of clean) {
    if (ch === "{") {
      stack.push({ sel: buf.trim(), decls, line: ruleLine });
      decls = [];
      buf = "";
    } else if (ch === "}") {
      flushDecl();
      const top = stack.pop();
      if (top && !top.sel.startsWith("@") && !/^(from|to|\d+%)$/.test(top.sel)) {
        yield { selectors: splitSelectors(top.sel), decls, line: top.line };
      }
      decls = top ? top.decls : [];
    } else if (ch === ";") flushDecl();
    else {
      if (!buf.trim() && ch.trim()) ruleLine = line;
      buf += ch;
    }
    if (ch === "\n") line++;
  }
}

function splitSelectors(sel) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of sel) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const exempt = (sel) => /lift-explore|data-sel-variant/.test(sel);
/** The selector's subject (last compound) is a bar segment or a legend swatch. */
const lastCompound = (sel) => sel.split(/\s+|>|\+|~/).filter(Boolean).pop() || "";
const isSeg = (sel) => /\.dp-chart-stack__seg\b/.test(lastCompound(sel)) && !/::(after|before)/.test(lastCompound(sel));
const isSwatch = (sel) => /\.dp-chart-stack__swatch\b/.test(lastCompound(sel));
const isState = (sel) => /data-side|data-press|data-hover|:hover|:active|:focus/.test(sel);

function rampFrom(rampSrc) {
  if (!rampSrc) return FALLBACK_RAMP;
  const block = rampSrc.match(/THUMBNAIL_BAR_TONE_TOKEN\s*=\s*\{([\s\S]*?)\}/);
  if (!block) return null;
  const map = {};
  for (const [, tone, token] of block[1].matchAll(/(\w+)\s*:\s*"(--[\w-]+)"/g)) map[tone] = token;
  return map;
}

function checkCss(file, src, ramp, report) {
  const rampTokens = new Set(Object.values(ramp).map((t) => `var(${t})`));
  for (const rule of rules(src)) {
    const live = rule.selectors.filter((s) => !exempt(s));
    for (const d of rule.decls) {
      const { prop, value, line } = d;
      // Raw colours: only custom-property token definitions may hold them.
      if (!prop.startsWith("--")) {
        const noVar = value.replace(/var\([^()]*\)/g, "");
        if (HEX.test(noVar) || COLOR_FN.test(noVar)) report(file, line, "raw-color", `${prop}: ${value}`);
      }
      for (const sel of live) {
        const seg = isSeg(sel);
        const swatch = isSwatch(sel);
        if (seg && prop === "transform" && value !== "none") report(file, line, "seg-transform", `${sel} { transform: ${value} }`);
        if (seg && /^outline(-style|-width)?$/.test(prop) && !/^(none|0|0px)$/.test(value))
          report(file, line, "seg-outline", `${sel} { ${prop}: ${value} }`);
        if (seg && isState(sel) && /^border(-[a-z]+)*-radius$/.test(prop))
          report(file, line, "seg-radius", `${sel} { ${prop}: ${value} }`);
        if (seg && prop === "box-shadow" && !SHADOW_TOKENS.has(value))
          report(file, line, "seg-shadow", `${sel} { box-shadow: ${value} }`);
        if ((seg || swatch) && (prop === "background" || prop === "background-color")) {
          if (!rampTokens.has(value) && !MIX.test(value)) report(file, line, "fill", `${sel} { ${prop}: ${value} }`);
          const tone = sel.match(/\[data-tone="(\w+)"\]/);
          if (tone && ramp[tone[1]] && value !== `var(${ramp[tone[1]]})`)
            report(file, line, "tone-token", `${sel} paints ${value}, ramp says var(${ramp[tone[1]]})`);
        }
      }
    }
  }
}

function checkCode(file, src, report) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  clean.split("\n").forEach((raw, i) => {
    const line = raw.replace(/\/\/.*$/, "");
    if (HEX.test(line.replace(/&#\d+;/g, "")) || COLOR_FN.test(line)) report(file, i + 1, "raw-color", raw);
  });
}

function checkHome(file, src, report) {
  src.split("\n").forEach((raw, i) => {
    if (/<DialogueThumbnail(Card|Demo)\b/.test(raw) || /selMotion|lift-explore/.test(raw)) {
      if (/selMotion\s*=|lift-explore/.test(raw)) report(file, i + 1, "travel-dev-only", raw);
    }
  });
}

function run(files) {
  const problems = [];
  const report = (file, line, rule, text) => problems.push({ file, line, rule, text: String(text).trim().slice(0, 140) });
  const ramp = rampFrom(files.ramp);
  if (!ramp || Object.keys(ramp).length === 0) report(RAMP_FILE, 1, "tone-token", "THUMBNAIL_BAR_TONE_TOKEN not found");
  if (files.css != null) checkCss(files.cssName || CSS_FILE, files.css, ramp || FALLBACK_RAMP, report);
  for (const [name, src] of files.code || []) checkCode(name, src, report);
  for (const [name, src] of files.home || []) checkHome(name, src, report);
  return problems;
}

// ---- Self-test: every rule must fire on its known-bad snippet, and the good snippet must pass.
const GOOD = `
.dlg-thumb__panel.dialogue-product-root { --dlg-thumb-selected-frame: 0 0 0 2px var(--dp-surface), 0 0 0 4px var(--dp-ink); --x: #fff; }
.dlg-thumb .dlg-live__bar .dp-chart-stack__seg { transform: none; outline: none; box-shadow: none; }
.dlg-thumb .dlg-live__bar .dp-chart-stack__seg:first-child { border-radius: var(--dp-radius-bar) 0 0 var(--dp-radius-bar); }
.dlg-thumb .dlg-live__bar[data-side] .dp-chart-stack__seg[data-index][data-tone="focal"] { background: var(--dp-chart-focal); }
.dlg-thumb .dlg-live__bar[data-side] .dp-chart-stack__swatch[data-index][data-tone="neutral"] { background: var(--dp-border-strong); }
.dlg-thumb .dlg-live__bar[data-hover="friday"] .dp-chart-stack__seg[data-focal] { background: color-mix(in srgb, var(--dp-chart-focal) var(--dlg-thumb-hover-focal, 85%), var(--dp-ink)); }
.dlg-thumb .dlg-live__bar[data-side="friday"] .dp-chart-stack__seg[data-focal] { box-shadow: var(--dlg-thumb-selected-frame); z-index: 1; }
.dlg-thumb[data-bar-style="lift-explore"] .dlg-live__bar[data-hover="friday"] .dp-chart-stack__seg { transform: translateY(-1px); }
.dlg-thumb[data-sel-variant="sel-6"] .dlg-live__bar[data-side="friday"] .dp-chart-stack__seg { box-shadow: 0 0 0 3px var(--dp-surface); }
`;
const BAD = [
  ["seg-transform", `.dlg-thumb .dlg-live__bar[data-side="friday"] .dp-chart-stack__seg[data-focal] { transform: translateY(-1px); }`],
  ["seg-outline", `.dlg-thumb .dlg-live__bar[data-press] .dp-chart-stack__seg { outline: 2px solid var(--dp-ink); }`],
  ["seg-radius", `.dlg-thumb .dlg-live__bar[data-side="unsure"] .dp-chart-stack__seg:not([data-focal]) { border-radius: var(--dp-radius-bar); }`],
  ["seg-radius", `.dlg-thumb .dlg-live__bar .dp-chart-stack__seg:hover { border-top-left-radius: var(--dp-radius-bar); }`],
  ["seg-shadow", `.dlg-thumb .dlg-live__bar[data-side="friday"] .dp-chart-stack__seg[data-focal] { box-shadow: 0 0 0 2px var(--dp-surface), 0 0 0 4px var(--dp-ink); }`],
  ["seg-shadow", `.dlg-thumb .dlg-live__bar[data-press] .dp-chart-stack__seg { box-shadow: inset 0 0 0 2px var(--dp-ink); }`],
  ["fill", `.dlg-thumb .dlg-live__bar[data-side="friday"] .dp-chart-stack__swatch[data-index] { background: color-mix(in srgb, var(--dp-border-strong) 55%, var(--dp-surface)); }`],
  ["fill", `.dlg-thumb .dlg-live__bar .dp-chart-stack__seg[data-focal] { background-color: var(--dp-brand); }`],
  ["tone-token", `.dlg-thumb .dlg-live__bar[data-side] .dp-chart-stack__seg[data-index][data-tone="focal"] { background: var(--dp-chart-mid); }`],
  ["raw-color", `.dlg-thumb .dp-clip-quote__icon { color: #b43f7f; }`],
  ["raw-color", `.dlg-thumb .dlg-thumb__preview { border-color: rgb(0 0 0 / 10%); }`],
];
const BAD_CODE = [["raw-color", `const fill = "#B43F7F";`], ["raw-color", `style={{ color: "rgba(0,0,0,.5)" }}`]];
const BAD_HOME = [
  ["travel-dev-only", `<DialogueThumbnailCard title="x" selMotion="travel" />`],
  ["travel-dev-only", `<DialogueThumbnailCard title="x" variant="lift-explore" />`],
];

function selfTest() {
  const failures = [];
  const good = run({ css: GOOD, code: [["good.tsx", `const a = "var(--dp-ink)"; // #fff in a comment`]], home: [["home.tsx", `<DialogueThumbnailCard title="x" />`]] });
  if (good.length) failures.push(`known-good snippet fired: ${good.map((p) => `${p.rule} ${p.text}`).join("; ")}`);
  for (const [rule, css] of BAD) {
    const got = run({ css }).map((p) => p.rule);
    if (!got.includes(rule)) failures.push(`${rule} did not fire on: ${css}`);
  }
  for (const [rule, code] of BAD_CODE) {
    if (!run({ code: [["bad.tsx", code]] }).some((p) => p.rule === rule)) failures.push(`${rule} did not fire on: ${code}`);
  }
  for (const [rule, code] of BAD_HOME) {
    if (!run({ home: [["home.tsx", code]] }).some((p) => p.rule === rule)) failures.push(`${rule} did not fire on: ${code}`);
  }
  const ramp = rampFrom(`export const THUMBNAIL_BAR_TONE_TOKEN = { focal: "--dp-chart-focal", mid: "--dp-chart-mid" } as const`);
  if (ramp.focal !== "--dp-chart-focal" || ramp.mid !== "--dp-chart-mid") failures.push("ramp map parse failed");
  const total = BAD.length + BAD_CODE.length + BAD_HOME.length + 2;
  if (failures.length) {
    console.error(failures.join("\n"));
    console.error(`\ncheck:thumbnail-card self-test FAILED, ${failures.length} of ${total} cases`);
    return false;
  }
  console.log(`check:thumbnail-card self-test OK, ${total} cases`);
  return true;
}

const okSelf = selfTest();
if (SELF_TEST_ONLY) process.exit(okSelf ? 0 : 1);

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : null);
const problems = run({
  css: read(CSS_FILE),
  ramp: read(RAMP_FILE),
  code: CODE_FILES.map((f) => [f, read(f)]).filter(([, s]) => s != null),
  home: HOME_FILES.map((f) => [f, read(f)]).filter(([, s]) => s != null),
});
for (const p of problems) console.log(`${p.file}:${p.line}  ${p.rule}  ${p.text}`);
if (!okSelf || problems.length) {
  console.error(`\ncheck:thumbnail-card FAILED, ${problems.length} problem(s)${okSelf ? "" : ", self-test failed"}`);
  process.exit(1);
}
console.log(`check:thumbnail-card OK, ${CODE_FILES.length + 2} files`);
