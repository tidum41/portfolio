#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const destDir = path.join(root, "fonts");
const sources = [
  "/cursor/stores/bot/fonts/ABCAreal/ABCAreal-Regular.woff2",
  "/cursor/stores/bot/fonts/ABCAreal/ABCAreal-Medium.woff2",
];

fs.mkdirSync(destDir, { recursive: true });
for (const src of sources) {
  const name = path.basename(src);
  const dest = path.join(destDir, name);
  if (!fs.existsSync(src)) {
    console.error(`Missing Areal source: ${src}`);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${name} → fonts/`);
}
