#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontsDir = path.join(root, "fonts");
const sources = [
  ["/cursor/stores/bot/fonts/ABCAreal/ABCAreal-Regular.woff2", "ABCAreal-Regular.woff2"],
  ["/cursor/stores/bot/fonts/ABCAreal/ABCAreal-Medium.woff2", "ABCAreal-Medium.woff2"],
];

const publicFonts = path.join(root, "public/fonts");
fs.mkdirSync(fontsDir, { recursive: true });
fs.mkdirSync(publicFonts, { recursive: true });
for (const [src, name] of sources) {
  const dest = path.join(fontsDir, name);
  const pub = path.join(publicFonts, name);
  if (!fs.existsSync(src)) {
    console.warn(`Missing Areal source ${src}`);
    continue;
  }
  fs.copyFileSync(src, dest);
  fs.copyFileSync(src, pub);
  console.log(`Copied ${name} → fonts/ and public/fonts/`);
}
