/**
 * Replace vendor/joola-b2b-live from tidum41/joola-b2b-casestudy live/ at a given SHA,
 * then re-apply portfolio embed overlay files saved under scripts/joola-vendor-overlay/.
 *
 * Usage:
 *   PRODUCT_ROOT=/path/to/joola-b2b-casestudy/live npm run joola:revendor -- 8530ba5
 *   # or (requires GitHub read access to the private product repo):
 *   npm run joola:revendor -- 8530ba5 --clone
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const vendor = path.join(root, "vendor/joola-b2b-live");
const overlay = path.join(dir, "joola-vendor-overlay");

const sha = process.argv[2];
const doClone = process.argv.includes("--clone");
const PRODUCT_REPO = process.env.JOOLA_PRODUCT_REPO ?? "https://github.com/tidum41/joola-b2b-casestudy.git";

if (!sha) {
  console.error("Usage: node scripts/joola-revendor.mjs <commit-sha> [--clone]");
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

let liveRoot = process.env.PRODUCT_ROOT;
if (!liveRoot) {
  if (!doClone) {
    console.error(
      "Set PRODUCT_ROOT to the product live/ directory, or pass --clone (needs repo access).",
    );
    process.exit(1);
  }
  const work = path.join(root, ".cache/joola-product");
  rmSync(work, { recursive: true, force: true });
  mkdirSync(path.dirname(work), { recursive: true });
  run("git", ["clone", "--filter=blob:none", PRODUCT_REPO, work]);
  run("git", ["-C", work, "fetch", "origin", sha, "--depth", "1"]);
  run("git", ["-C", work, "checkout", sha]);
  liveRoot = path.join(work, "live");
}

if (!existsSync(path.join(liveRoot, "package.json"))) {
  console.error(`No live app at ${liveRoot}`);
  process.exit(1);
}

rmSync(vendor, { recursive: true, force: true });
mkdirSync(path.dirname(vendor), { recursive: true });
cpSync(liveRoot, vendor, { recursive: true });

if (existsSync(overlay)) {
  cpSync(overlay, vendor, { recursive: true, force: true });
  console.log("Re-applied scripts/joola-vendor-overlay/");
}

writeFileSync(path.join(vendor, "VENDOR_SHA"), `${sha}\n`, "utf8");
console.log(`Vendored live/ @ ${sha} → vendor/joola-b2b-live/`);
console.log("Next: npm run joola:build-proto && npm run joola:pixel-diff");
