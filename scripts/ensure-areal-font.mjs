#!/usr/bin/env node
/**
 * Optional build helper when NEXT_PUBLIC_AREAL_URL is unset.
 * Reads AREAL_WOFF2_BASE64 (or fetches AREAL_WOFF2_URL) and writes the
 * variable woff2 into the gitignored fonts/ directory for local/next use.
 *
 * Preferred path: host the file on Vercel Blob and set NEXT_PUBLIC_AREAL_URL
 * (plus optional NEXT_PUBLIC_AREAL_URL_REGULAR / _MEDIUM).
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve(process.cwd(), "fonts");
const outFile = resolve(outDir, "ABCArealVariable.woff2");

if (process.env.NEXT_PUBLIC_AREAL_URL?.trim()) {
  console.log("ensure-areal-font: NEXT_PUBLIC_AREAL_URL set; skipping local write.");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

const b64 = process.env.AREAL_WOFF2_BASE64?.trim();
const remote = process.env.AREAL_WOFF2_URL?.trim();

if (b64) {
  writeFileSync(outFile, Buffer.from(b64, "base64"));
  console.log(`ensure-areal-font: wrote ${outFile} from AREAL_WOFF2_BASE64`);
  process.exit(0);
}

if (remote) {
  const res = await fetch(remote);
  if (!res.ok) {
    console.error(`ensure-areal-font: fetch failed ${res.status} ${remote}`);
    process.exit(1);
  }
  writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
  console.log(`ensure-areal-font: wrote ${outFile} from AREAL_WOFF2_URL`);
  process.exit(0);
}

if (existsSync(outFile)) {
  console.log(`ensure-areal-font: ${outFile} already present.`);
  process.exit(0);
}

console.warn(
  "ensure-areal-font: no NEXT_PUBLIC_AREAL_URL / AREAL_WOFF2_BASE64 / AREAL_WOFF2_URL; Areal will not load.",
);
process.exit(0);
