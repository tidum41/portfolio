import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

/**
 * Live-component manifest for the Dialogue canvas, computed per request.
 *
 * Walks the import graph from DialogueCaseStudyContent through
 * components/dialogue/**, so a component added to or removed from the case
 * study shows up (or drops off) the canvas with no registry edit. Allowlist
 * status comes from design/SYSTEM-COMPONENTS.md, tokens from the CSS rules
 * that style each component's dp- classes.
 */
export type LiveComponent = {
  file: string;
  name: string;
  depth: number;
  via: string | null;
  allowlisted: boolean;
  tokens: string[];
};
export type LiveManifest = {
  entry: string;
  components: LiveComponent[];
  scenarios: string[];
};

const ENTRY = "components/dialogue/DialogueCaseStudyContent.tsx";
const CSS_FILES = [
  "components/dialogue/product/dialogue-product.css",
  "components/dialogue/product/chart/chart.css",
  "app/globals.css",
];

function resolveImport(root: string, from: string, spec: string): string | null {
  const base = spec.startsWith("@/") ? spec.slice(2) : spec.startsWith(".") ? join(dirname(from), spec) : null;
  if (!base) return null;
  for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const p = base + ext;
    if (/\.tsx?$/.test(p) && existsSync(join(root, p))) return p;
  }
  return null;
}

function cssRules(src: string): { sel: string; body: string }[] {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: { sel: string; body: string }[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) out.push({ sel: m[1].trim(), body: m[2] });
  return out;
}

export function buildLiveManifest(root = process.cwd()): LiveManifest {
  const read = (p: string) => readFileSync(join(root, p), "utf8");
  const seen = new Map<string, { depth: number; via: string | null }>();
  const queue: [string, number, string | null][] = [[ENTRY, 0, null]];
  while (queue.length) {
    const [file, depth, via] = queue.shift()!;
    if (seen.has(file)) continue;
    seen.set(file, { depth, via });
    for (const m of read(file).matchAll(/(?:import|from)\s*\(?\s*["']([^"']+)["']/g)) {
      const r = resolveImport(root, file, m[1]);
      if (r && r.startsWith("components/dialogue/")) queue.push([r, depth + 1, file]);
    }
  }

  const allowSrc = existsSync(join(root, "design/SYSTEM-COMPONENTS.md"))
    ? read("design/SYSTEM-COMPONENTS.md").split("## Not allowed")[0]
    : "";
  const allow = new Set([...allowSrc.matchAll(/^- `(\w+)`/gm)].map((m) => m[1]));

  const rules = CSS_FILES.filter((f) => existsSync(join(root, f))).flatMap((f) => cssRules(read(f)));

  const entrySrc = read(ENTRY);
  const scenarios = [
    ...new Set(
      [...entrySrc.matchAll(/(?:scenario="|productScenario:\s*")([\w-]+)"/g)].map((m) => m[1]),
    ),
  ];

  const components: LiveComponent[] = [];
  for (const [file, info] of seen) {
    if (file === ENTRY || !file.endsWith(".tsx")) continue;
    const src = read(file);
    const classes = new Set([...src.matchAll(/\b(dp-[\w-]+|dialogue-[\w-]+)/g)].map((m) => m[1]));
    const tokens = new Set<string>();
    for (const r of rules) {
      if (![...classes].some((c) => new RegExp(`\\.${c}(?![\\w-])`).test(r.sel))) continue;
      for (const t of r.body.matchAll(/var\((--(?:dp|ds|text|shadow)-[\w-]+)/g)) tokens.add(t[1]);
    }
    for (const t of src.matchAll(/var\((--(?:dp|ds|text)-[\w-]+)/g)) tokens.add(t[1]);
    const name = basename(file).replace(/\.tsx$/, "");
    components.push({
      file,
      name,
      depth: info.depth,
      via: info.via ? basename(info.via).replace(/\.tsx?$/, "") : null,
      allowlisted: allow.has(name),
      tokens: [...tokens].sort(),
    });
  }
  components.sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
  return { entry: ENTRY, components, scenarios };
}
