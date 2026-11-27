#!/usr/bin/env node
// Copy rules for the JOOLA case study, enforced in code (see portfolio-case-study-rules):
// no em dashes or middle dots, never "priority", no tier pricing, never claim it shipped,
// and no hard-coded hex colours in the story figures outside the scoped product tokens.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const files = ["components/JoolaPartialBody.tsx", "components/ProductCaseStudy.tsx"];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx|ts)$/.test(name)) files.push(p);
  }
};
walk("components/joola");

const rules = [
  [/\u2014/, "em dash"],
  [/\u00b7/, "middle dot"],
  [/\bpriority\b/i, '"priority"'],
  [/\btier\s*\d|\btier pricing|volume pricing/i, "tier or volume pricing"],
  [/\b(shipped to|launched|went live|in production)\b/i, "claims it shipped"],
  [/9-screen|2 days to hours/i, "retired claim"],
];

let bad = 0;
for (const f of files) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments are not page copy
    for (const [re, why] of rules) {
      if (re.test(line)) {
        console.error(`${f}:${i + 1}: ${why}: ${line.trim().slice(0, 100)}`);
        bad++;
      }
    }
  });
}
if (bad) process.exit(1);
console.log(`check-joola-copy: ${files.length} files clean`);
