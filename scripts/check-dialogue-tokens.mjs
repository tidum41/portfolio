// Fails on hard-coded colors, font sizes, radii, odd weights and 1.5 strokes in
// Dialogue CSS and TSX. styles/dialogue-tokens.css is the only file allowed to
// hold raw values. Components use role tokens (--dp-*, --text-*) and never the
// raw DS layer (--ds-*).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "components/dialogue";
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".css", ".ts", ".tsx"].includes(extname(p))) files.push(p);
  }
})(ROOT);

const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const NAMED = /(?<![-\w])(?:white|black)(?![-\w])/i;
const LENGTH = /(?<![-\w.])\d*\.?\d+(?:px|rem|em)\b/;

const problems = [];
const report = (file, line, rule, text) =>
  problems.push(`${file}:${line}  ${rule}  ${text.trim().slice(0, 100)}`);

function stripCssComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function checkCss(file, src) {
  stripCssComments(src).split("\n").forEach((raw, i) => {
    const line = raw.replace(/url\([^)]*\)/g, "url()");
    const decl = line.match(/^\s*([-\w]+)\s*:\s*(.+?);?\s*$/);
    if (!decl) return;
    const [, prop, value] = decl;
    const n = i + 1;
    if (HEX.test(value)) report(file, n, "hard-coded color", line);
    else if (COLOR_FN.test(value)) report(file, n, "hard-coded color", line);
    else if (NAMED.test(value) && !/^(font|--)/.test(prop) && !/mask|content/.test(prop))
      report(file, n, "hard-coded color", line);
    if (/var\(--ds-/.test(value)) report(file, n, "raw DS token in component", line);
    const bare = value.replace(/var\([^)]*\)/g, "var()");
    if (prop === "font-size" && LENGTH.test(bare)) report(file, n, "hard-coded font size", line);
    if (/^border(-[a-z]+)*-radius$/.test(prop) && (LENGTH.test(bare) || /\d%/.test(bare)))
      report(file, n, "hard-coded radius", line);
    if (prop === "font-weight" && !/^(400|500|var\(.*\)|inherit|normal)$/.test(value.trim()))
      report(file, n, "font weight outside 400/500", line);
    if (prop === "stroke-width" && /^1\.5/.test(value.trim())) report(file, n, "1.5 stroke", line);
    if (/^--dp-chart-line-stroke$/.test(prop) && /1\.5/.test(value)) report(file, n, "1.5 stroke", line);
  });
}

function checkTs(file, src) {
  src.split("\n").forEach((raw, i) => {
    const line = raw.replace(/^\s*(\/\/|\*|\/\*).*$/, "");
    const n = i + 1;
    if (HEX.test(line.replace(/&#\d+;/g, ""))) report(file, n, "hard-coded color", raw);
    else if (COLOR_FN.test(line)) report(file, n, "hard-coded color", raw);
    if (/\bfontSize\s*[:=]\s*(?:\{?\s*)?(?:["'`]?\d|\d)/.test(line)) report(file, n, "hard-coded font size", raw);
    if (/\bborderRadius\s*[:=]\s*(?:\{?\s*)?(?:["'`]\d|\d)/.test(line)) report(file, n, "hard-coded radius", raw);
    if (/\bfontWeight\s*[:=]\s*["'`]?(?:600|700|bold)/.test(line)) report(file, n, "font weight outside 400/500", raw);
    if (/strokeWidth\s*[:=]\s*\{?\s*["']?1\.5\b/.test(line) || /stroke-width\s*=\s*["']1\.5/.test(line))
      report(file, n, "1.5 stroke", raw);
    if (/strokeWidth:\s*1\.5\b/.test(line)) report(file, n, "1.5 stroke", raw);
    if (/var\(--ds-/.test(line)) report(file, n, "raw DS token in component", raw);
  });
}

for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (f.endsWith(".css")) checkCss(f, src);
  else checkTs(f, src);
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\ncheck:dialogue-tokens FAILED, ${problems.length} problem(s) in ${files.length} files`);
  process.exit(1);
}
console.log(`check:dialogue-tokens OK, ${files.length} files, 0 problems`);
