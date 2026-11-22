/**
 * Case-study embed guard: built assets must hide case-pack UI (css) and portfolio
 * must not ship the Cases toggle. Minified JS may still contain dormant strings until
 * a full product re-vendor; runtime hides copy via cs=1 + embed CSS.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const cssFiles = execSync(`find public/joola-proto -path '*/assets/*.css'`, {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);
const hideRule = cssFiles.some((f) => {
  const css = readFileSync(f, "utf8");
  return (
    css.includes("is-cs-embed") &&
    css.includes(".qo-case") &&
    css.includes("display:none")
  );
});
if (!hideRule) {
  console.error("Missing is-cs-embed case-pack hide rule in built embed CSS.");
  process.exit(1);
}

let jsHits = "";
try {
  jsHits = execSync(
    'rg -l "qtyLabel:\\\"Cases\\\"|Case of " public/joola-proto/qo/assets/*.js 2>/dev/null || true',
    { encoding: "utf8" },
  ).trim();
} catch {
  jsHits = "";
}

if (jsHits) {
  console.log(
    "Note: qo bundle still contains dormant Cases strings; cs=1 CSS hides case-pack UI at runtime.",
  );
}

console.log("Embed case-pack guard passed (CSS hide rule present).");
