/**
 * One-off: split Paper exports into app/dev/dialogue components.
 * Run: node scripts/build-dialogue-frames.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = "/home/ubuntu/.cursor/projects/workspace/uploads/dialogue-paper-frames_34b9.txt";
const OUT = path.join(process.cwd(), "app/dev/dialogue/_components/generated");

const text = fs.readFileSync(SRC, "utf8");
const lines = text.split("\n");

const frameStarts = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "* from Paper") {
    const url = lines[i + 1]?.trim().replace(/^\* /, "") ?? "";
    frameStarts.push({ line: i + 1, url });
  }
}

const ranges = [
  { id: 1, start: 6, end: 1484, name: "Frame1DashboardWithChat" },
  { id: 2, start: 1491, end: 1943, name: "Frame2ChatTranscript" },
  { id: 3, start: 1949, end: 2930, name: "Frame3DashboardFab" },
  { id: 4, start: 2936, end: 3049, name: "Frame4ChatPanel" },
];

function transformBody(body) {
  let s = body;
  s = s.replace(
    /https:\/\/app\.paper\.design\/file-assets\/01M58MSRB3KSVHQR7762JKXVX7\/([^'")]+)/g,
    "/dialogue/$1",
  );
  s = s.replace(
    /font-\['DMSans-9ptRegular_Medium','DM_Sans',system-ui,sans-serif\]\s*/g,
    "",
  );
  s = s.replace(
    /font-\['DMSans-9ptRegular_Regular','DM_Sans',system-ui,sans-serif\]\s*/g,
    "",
  );
  s = s.replace(
    /font-\['DMSans-9ptRegular_SemiBold','DM_Sans',system-ui,sans-serif\]\s*/g,
    "",
  );
  s = s.replace(/font-\['DM_Mono',system-ui,sans-serif\]/g, "font-mono");
  s = s.replace(/export default function \(\) \{/g, "");
  s = s.replace(/^\s*return \(\s*/m, "");
  s = s.replace(/\);\s*\}\s*$/m, "");
  // Paper width tokens → explicit px (4px grid)
  s = s.replace(/\bw-378\b/g, "w-[1512px]");
  s = s.replace(/\bh-177\.25\b/g, "h-[709px]");
  s = s.replace(/\bmin-h-177\.25\b/g, "min-h-[709px]");
  s = s.replace(/\bw-145\.5\b/g, "w-[582px]");
  s = s.replace(/\bh-325\.75\b/g, "h-[1303px]");
  s = s.replace(/\bw-350\b/g, "w-[1400px]");
  s = s.replace(/\bmax-w-366\b/g, "max-w-[1464px]");
  s = s.replace(/fontFamily: '"DMSans-9ptRegular_Regular", "DM Sans", system-ui, sans-serif'/g, "fontFamily: 'var(--font-dialogue-sans)'");
  s = s.replace(/fontFamily: '"DMSans-9ptRegular_Medium", "DM Sans", system-ui, sans-serif'/g, "fontFamily: 'var(--font-dialogue-sans)'");
  s = s.replace(/fontFamily: '"DM Mono", system-ui, sans-serif'/g, "fontFamily: 'var(--font-dialogue-mono)'");
  return s.trim();
}

fs.mkdirSync(OUT, { recursive: true });

for (const r of ranges) {
  const chunk = lines.slice(r.start - 1, r.end).join("\n");
  const body = transformBody(chunk);
  const out = `/* Paper frame ${r.id} — do not hand-edit; regenerate via scripts/build-dialogue-frames.mjs */\n\nexport default function ${r.name}() {\n  return (\n    ${body}\n  );\n}\n`;
  fs.writeFileSync(path.join(OUT, `${r.name}.tsx`), out);
  console.log("wrote", r.name, body.length);
}
