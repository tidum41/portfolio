#!/usr/bin/env node
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.DIALOGUE_ARCHIVE_BASE_URL || "http://127.0.0.1:3001";
const out = path.join(root, "public/dialogue/archive/fit-all-1440.png");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE_URL}/dev/dialogue-archive`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate(() => localStorage.removeItem("dialogue-archive-camera-v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Fit all" }).click();
  await page.waitForTimeout(900);
  const zoom = await page.locator("span").filter({ hasText: /%$/ }).first().textContent();
  console.log("zoom", zoom);
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log("wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
