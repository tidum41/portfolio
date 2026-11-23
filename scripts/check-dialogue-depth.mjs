// Dialogue depth explorations gate. Run: npm run check:dialogue-depth [-- --self-test] [-- <repoRoot>]
// Also run by check:dialogue-system. Enforces the depth rules in code (Emil Kowalski: enforce the system, do not ask):
//   raw-color       a hex/rgb/hsl/oklch literal in components/dialogue/depth/** (tokens only)
//   shadow          a box-shadow other than none or a role token (--dlg-elev-*, --shadow-*), or any text-shadow / drop-shadow
//   blur            filter or backdrop-filter blur (TASTE: no blur)
//   motion-guard    a CSS file with transition/animation but no prefers-reduced-motion block that turns it off,
//                   or a TSX file that smooth-scrolls, animates or runs rAF without checking prefers-reduced-motion
//   sideways        a sideways switch (selector with __people, sideways or [data-side]) whose duration is over 100ms,
//                   or --dlg-motion-sideways-ms over 100ms in styles/dialogue-tokens.css
//   duration        a literal transition/animation duration over 150ms (deeper moves must use --dlg-motion-* tokens)
//   lucide          an import from lucide-react
//   teal            the word teal or a Carbon teal hex in code (no teal in shipped UI)
//   readme          a component folder under components/dialogue/depth without README.md
//   escape-hatch    a depth component prop typed any, or a className/style prop (no free-form styling)
//   dev-gate        app/dev/dialogue-depth/page.tsx without the production 404 gate
// The gate runs its self-test first: each known-bad snippet must fire its rule, and a known-good one must not.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const args = process.argv.slice(2);
const SELF_TEST_ONLY = args.includes("--self-test");
const ROOT = args.find((a) => !a.startsWith("--")) || ".";
const DEPTH = "components/dialogue/depth";
const DEV = "app/dev/dialogue-depth";
const TOKENS = "styles/dialogue-tokens.css";

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/i;
const TEAL_HEX = /#(?:005d5d|004144|007d79|009d9a|08bdba|3ddbd9|9ef0f0|d9fbfb)\b/i;
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
const stripTs = (src) => strip(src).replace(/(^|[^:])\/\/.*$/gm, "$1");
const ms = (v) => {
  const out = [];
  for (const m of v.matchAll(/(?<![\w-])(\d*\.?\d+)(ms|s)\b/g)) out.push(m[2] === "s" ? Number(m[1]) * 1000 : Number(m[1]));
  return out;
};

/** Yields { sel, prop, value, line } for each declaration, with the enclosing selector (at-rules included). */
function* decls(src) {
  const clean = strip(src);
  const stack = [];
  let buf = "";
  let line = 1;
  for (const ch of clean) {
    if (ch === "\n") line++;
    if (ch === "{") { stack.push(buf.trim()); buf = ""; }
    else if (ch === "}" || ch === ";") {
      const m = buf.match(/^\s*([-\w]+)\s*:\s*([\s\S]+?)\s*$/);
      if (m) yield { sel: stack.join(" ") , prop: m[1], value: m[2].replace(/\s+/g, " "), line };
      buf = "";
      if (ch === "}") stack.pop();
    } else buf += ch;
  }
}

function checkCss(file, src, report) {
  let moves = false;
  let guarded = false;
  for (const d of decls(src)) {
    const v = d.value;
    if (d.prop.startsWith("--")) continue; // token definitions live in dialogue-tokens.css, not here
    if (HEX.test(v) || COLOR_FN.test(v)) report(file, d.line, "raw-color", `${d.prop}: ${v}`);
    if (/teal/i.test(v) || TEAL_HEX.test(v)) report(file, d.line, "teal", `${d.prop}: ${v}`);
    if (d.prop === "box-shadow" && !/^(none|var\(--(dlg-elev-[\w-]+|shadow-[\w-]+)\))$/.test(v)) report(file, d.line, "shadow", `box-shadow: ${v}`);
    if (d.prop === "text-shadow" || /drop-shadow\(/.test(v)) report(file, d.line, "shadow", `${d.prop}: ${v}`);
    if (/^(backdrop-)?filter$/.test(d.prop) && /blur\(/.test(v)) report(file, d.line, "blur", `${d.prop}: ${v}`);
    const isMotion = /^(transition|transition-duration|animation|animation-duration)$/.test(d.prop);
    const reduce = /prefers-reduced-motion:\s*reduce/.test(d.sel);
    if (isMotion && !reduce && !/^none\b/.test(v)) {
      moves = true;
      if (ms(v).some((n) => n > 150)) report(file, d.line, "duration", `${d.prop}: ${v} (use --dlg-motion-* tokens)`);
      if (/__people|sideways|\[data-side/.test(d.sel)) {
        const ok = ms(v).every((n) => n <= 100) && (/var\(--dlg-motion-sideways-ms\)/.test(v) || ms(v).length > 0) && !/var\(--dlg-motion-(deeper|shallower)-ms\)/.test(v);
        if (!ok) report(file, d.line, "sideways", `${d.sel} { ${d.prop}: ${v} }`);
      }
    }
    if (isMotion && reduce && /^none\b/.test(v)) guarded = true;
  }
  if (moves && !guarded) report(file, 0, "motion-guard", "transitions or animations with no prefers-reduced-motion: reduce block that sets them to none");
}

function checkTsx(file, src, report) {
  const code = stripTs(src);
  code.split("\n").forEach((l, i) => {
    if (/from\s+["']lucide-react/.test(l)) report(file, i + 1, "lucide", l.trim());
    if (/\bteal\b/i.test(l) || TEAL_HEX.test(l)) report(file, i + 1, "teal", l.trim());
    if (file.startsWith(DEPTH) && (HEX.test(l.replace(/&#\d+;/g, "")) || COLOR_FN.test(l))) report(file, i + 1, "raw-color", l.trim());
  });
  if (/behavior:\s*["']smooth|requestAnimationFrame|\.animate\(/.test(code) && !/prefers-reduced-motion/.test(code))
    report(file, 0, "motion-guard", "smooth scroll, rAF or WAAPI with no prefers-reduced-motion check");
  if (file.startsWith(DEPTH)) {
    const props = code.match(/type Props = \{[\s\S]*?\n\};/g) || [];
    for (const p of props) {
      if (/:\s*any\b/.test(p)) report(file, 0, "escape-hatch", "a prop typed any");
      if (/^\s*(className|style)\??:/m.test(p)) report(file, 0, "escape-hatch", "a className or style prop");
    }
  }
}

function checkDevGate(file, src, report) {
  const ok = /notFound\(\)/.test(src) && /VERCEL_ENV\s*===\s*["']production["']/.test(src) && /dynamic\s*=\s*["']force-dynamic["']/.test(src);
  if (!ok) report(file, 0, "dev-gate", "needs notFound() under VERCEL_ENV === \"production\" and dynamic = \"force-dynamic\"");
}

function checkSidewaysToken(file, src, report) {
  const m = src.match(/--dlg-motion-sideways-ms:\s*([^;]+);/);
  if (!m) return report(file, 0, "sideways", "--dlg-motion-sideways-ms is missing");
  if (ms(m[1]).some((n) => n > 100)) report(file, 0, "sideways", `--dlg-motion-sideways-ms: ${m[1]} is over 100ms`);
}

// ---- self-test ----
function selfTest() {
  const cases = [
    ["css", "raw-color", ".a { color: #b43f7f; }"],
    ["css", "raw-color", ".a { background: rgb(1, 2, 3); }"],
    ["css", "shadow", ".a { box-shadow: 0 1px 2px black; }"],
    ["css", "shadow", ".a { filter: drop-shadow(0 1px 1px var(--x)); }"],
    ["css", "blur", ".a { backdrop-filter: blur(4px); }"],
    ["css", "motion-guard", ".a { transition: opacity 100ms; }"],
    ["css", "sideways", ".a__people { transition: opacity var(--dlg-motion-deeper-ms); } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }"],
    ["css", "sideways", ".a[data-side] { transition: opacity 200ms; } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }"],
    ["css", "duration", ".a { transition: transform 400ms ease; } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }"],
    ["css", "teal", ".a { color: var(--teal-70); }"],
    ["tsx", "lucide", 'import { X } from "lucide-react";'],
    ["tsx", "teal", "const c = \"#005d5d\";"],
    ["tsx", "raw-color", "const c = \"#ff0000\";"],
    ["tsx", "motion-guard", "el.scrollTo({ top: 0, behavior: \"smooth\" });"],
    ["tsx", "escape-hatch", "type Props = {\n  className?: string;\n};"],
    ["tsx", "escape-hatch", "type Props = {\n  data: any;\n};"],
    ["gate", "dev-gate", "export default function P() { return null; }"],
    ["token", "sideways", ":root { --dlg-motion-sideways-ms: 200ms; }"],
  ];
  const good = [
    ["css", ".a { box-shadow: var(--dlg-elev-evidence-shadow); transition: opacity var(--dlg-motion-deeper-ms) var(--dlg-motion-ease); } .a__people { transition: opacity var(--dlg-motion-sideways-ms) linear; } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }"],
    ["tsx", "const r = matchMedia(\"(prefers-reduced-motion: reduce)\"); el.scrollTo({ behavior: \"smooth\" });"],
  ];
  const run = (kind, src) => {
    const got = [];
    const rep = (_f, _l, rule) => got.push(rule);
    const f = `${DEPTH}/X/x.${kind === "css" ? "css" : "tsx"}`;
    if (kind === "css") checkCss(f, src, rep);
    else if (kind === "tsx") checkTsx(f, src, rep);
    else if (kind === "gate") checkDevGate(f, src, rep);
    else checkSidewaysToken(f, src, rep);
    return got;
  };
  let failed = 0;
  for (const [kind, rule, src] of cases) if (!run(kind, src).includes(rule)) { console.error(`self-test: ${rule} did not fire on ${src}`); failed++; }
  for (const [kind, src] of good) { const g = run(kind, src); if (g.length) { console.error(`self-test: good snippet fired ${g.join(",")}: ${src}`); failed++; } }
  if (failed) { console.error(`check:dialogue-depth self-test FAILED (${failed})`); process.exit(1); }
  console.log(`check:dialogue-depth self-test OK, ${cases.length} bad and ${good.length} good snippets`);
}

selfTest();
if (SELF_TEST_ONLY) process.exit(0);

const problems = [];
const report = (file, line, rule, text) => problems.push({ file, line, rule, text });
const walk = (dir) => {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((n) => {
    const p = join(abs, n);
    return statSync(p).isDirectory() ? walk(relative(ROOT, p)) : [relative(ROOT, p)];
  });
};
const read = (f) => readFileSync(join(ROOT, f), "utf8");
const files = [...walk(DEPTH), ...walk(DEV)];
for (const f of files) {
  if (extname(f) === ".css") { if (f.startsWith(DEPTH)) checkCss(f, read(f), report); else checkCss(f, read(f), (ff, l, r, t) => r === "motion-guard" || r === "teal" || r === "blur" ? report(ff, l, r, t) : null); }
  else if (/\.(tsx?|mjs)$/.test(f)) checkTsx(f, read(f), report);
}
if (existsSync(join(ROOT, DEPTH)))
  for (const n of readdirSync(join(ROOT, DEPTH))) {
    const d = join(ROOT, DEPTH, n);
    if (statSync(d).isDirectory() && readdirSync(d).some((x) => x.endsWith(".tsx")) && !existsSync(join(d, "README.md")))
      report(`${DEPTH}/${n}`, 0, "readme", "component folder has no README.md");
  }
const gate = `${DEV}/page.tsx`;
if (existsSync(join(ROOT, gate))) checkDevGate(gate, read(gate), report);
else if (existsSync(join(ROOT, DEV))) report(gate, 0, "dev-gate", "dev route has no gated page.tsx");
if (existsSync(join(ROOT, TOKENS))) checkSidewaysToken(TOKENS, read(TOKENS), report);
/* Lucide anywhere in the case study or the dev page is a hard fail too. */
for (const f of [...walk("components/dialogue"), ...walk("app/dialogue")].filter((x) => /\.tsx?$/.test(x) && !x.startsWith(DEPTH)))
  if (/from\s+["']lucide-react/.test(read(f))) report(f, 0, "lucide", "lucide-react import");

for (const p of problems) console.log(`${p.file}:${p.line}  ${p.rule}  ${p.text}`);
if (problems.length) {
  const by = {};
  for (const p of problems) by[p.rule] = (by[p.rule] || 0) + 1;
  console.error(`\ncheck:dialogue-depth FAILED, ${problems.length} problems (${Object.entries(by).map(([k, v]) => `${k}=${v}`).join(" ")})`);
  process.exit(1);
}
console.log(`check:dialogue-depth OK, ${files.length} files`);
