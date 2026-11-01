// P16 round 4: cache-busting for the demo takes. Filenames stay stable (the page and recorder use them), so each file
// gets a content hash that DialogueDemoVideo appends as ?v=. A re-recorded take gets a new URL and no browser can serve
// a stale copy from its media cache. Run after every recording: node scripts/version-dialogue-motion.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const dir = new URL("../public/dialogue/motion/", import.meta.url);
const out = {};
for (const f of readdirSync(dir).sort()) if (/\.(mp4|jpg)$/.test(f)) out[f] = createHash("sha1").update(readFileSync(new URL(f, dir))).digest("hex").slice(0, 8);
writeFileSync(new URL("../lib/dialogue/motionVersions.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`versioned ${Object.keys(out).length} files`);
