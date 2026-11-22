import { copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const live = path.resolve(dir, "../vendor/joola-b2b-live");

function run(mode) {
  const r = spawnSync(
    "npx",
    ["vite", "build", "--config", "vite.embed.config.ts", "--mode", mode],
    { cwd: live, stdio: "inherit", env: { ...process.env } },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function aliasIndex(subdir) {
  const root = path.resolve(dir, `../public/joola-proto/${subdir}`);
  copyFileSync(path.join(root, "index-embed.html"), path.join(root, "index.html"));
}

run("round5");
run("qo");
aliasIndex("round5");
aliasIndex("qo");
console.log("Built static embeds → public/joola-proto/{round5,qo}");
