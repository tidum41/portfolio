// Fails if a brief lacks "Asks covered:" with IDs; lists open IDs per component.
import { readFileSync, readdirSync } from "node:fs";
const dir = "design/briefs";
const bad = readdirSync(dir).filter((f) => f.endsWith(".md"))
  .filter((f) => !/^Asks covered:.*\b[A-Z]{3}-\d{2}\b/m.test(readFileSync(`${dir}/${f}`, "utf8")));
const open = {};
for (const m of readFileSync("design/OPEN-ASKS.md", "utf8").matchAll(/^\| ([A-Z]{3})-(\d{2}) \|.*\| (open|in progress) \|/gm))
  (open[m[1]] ??= []).push(`${m[1]}-${m[2]}${m[3] === "open" ? "" : "*"}`);
for (const [k, v] of Object.entries(open)) console.log(`${k}: ${v.join(" ")}`);
if (bad.length) { console.error(`Missing "Asks covered:" in: ${bad.join(", ")}`); process.exit(1); }
