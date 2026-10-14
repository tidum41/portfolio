import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, "..", "remotion", "public", "joola-b2b");
const dest = path.join(root, "..", "public", "joola-b2b");

if (!existsSync(src)) {
  console.warn("sync-joola-public: remotion/public/joola-b2b missing, skip");
  process.exit(0);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}
cpSync(src, dest, { recursive: true });
console.log("sync-joola-public: copied remotion/public/joola-b2b → public/joola-b2b");
