/**
 * Bake ABC Areal glyph outlines into fixed-topology droplet paths.
 *
 * Run from the repo root (deps are not added to the app):
 *   mkdir -p .tmp-nav-morph && cd .tmp-nav-morph
 *   npm init -y && npm install fontkit polygon-clipping
 *   cd .. && NODE_PATH=".tmp-nav-morph/node_modules" node app/dev/nav-morph/bake-outlines.cjs
 *
 * Each droplet is one closed cubic path. The start path is that dot's
 * piece of the filled letter (grid cell clipped to the real outline).
 * The end path is a circle at the halftone sample, same command count,
 * so framer-motion can interpolate `d`.
 */
const fs = require("fs");
const path = require("path");
const fontkit = require("fontkit");
const polygonClipping = require("polygon-clipping");

const FONT = path.join(__dirname, "../../../fonts/ABCArealVariable.woff2");
const OUT = path.join(__dirname, "../../../components/outlineMorphData.ts");

const WORDS = ["Work", "Archive", "About", "work", "archive", "about"];
const FONT_SIZE = 16;
const LINE_HEIGHT = 24;
const PITCH = 2.25;
const DOT_SIZE = 0.8;
const SIZE_CONTRAST = 0.95;
const MIN_VISIBILITY = 0.07;
const SAMPLES = 32;
const FLATTEN_TOL = 1.5; // font units (~0.024px)
const ANGLE0 = -Math.PI / 2;

const font = fontkit.openSync(FONT);
const scale = FONT_SIZE / font.unitsPerEm;
const ascent = font.ascent * scale;
const descent = Math.abs(font.descent) * scale;
const halfLeading = Math.max(0, (LINE_HEIGHT - (ascent + descent)) / 2);
const baseline = halfLeading + ascent;

function fmt(n) {
  const v = Math.round(n * 100) / 100;
  return (Object.is(v, -0) ? 0 : v).toFixed(2);
}

function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const j = (i + 1) % ring.length;
    a += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
  }
  return a / 2;
}

function dedupe(ring) {
  const out = [];
  for (const p of ring) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > 0.01) out.push(p);
  }
  if (out.length > 2 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 0.01) {
    out.pop();
  }
  return out;
}

function orient(ring, sign) {
  const r = ring.slice();
  if (signedArea(r) * sign < 0) r.reverse();
  return r;
}

function closeRing(ring) {
  const r = ring.slice();
  const a = r[0];
  const b = r[r.length - 1];
  if (!b || a[0] !== b[0] || a[1] !== b[1]) r.push([a[0], a[1]]);
  return r;
}

function pointInRing(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function centroidOf(ring) {
  let x = 0;
  let y = 0;
  for (const p of ring) {
    x += p[0];
    y += p[1];
  }
  return [x / ring.length, y / ring.length];
}

function midpoint(a, b) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function flattenCubic(p0, p1, p2, p3, out) {
  function rec(a, b, c, d, depth) {
    const dx = d[0] - a[0];
    const dy = d[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const d1 = Math.abs((b[0] - a[0]) * dy - (b[1] - a[1]) * dx) / len;
    const d2 = Math.abs((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / len;
    if ((d1 < FLATTEN_TOL && d2 < FLATTEN_TOL) || depth > 10) {
      out.push(d);
      return;
    }
    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const cd = midpoint(c, d);
    const abc = midpoint(ab, bc);
    const bcd = midpoint(bc, cd);
    const abcd = midpoint(abc, bcd);
    rec(a, ab, abc, abcd, depth + 1);
    rec(abcd, bcd, cd, d, depth + 1);
  }
  rec(p0, p1, p2, p3, 0);
}

function quadToCubic(p0, p1, p2) {
  return [
    p0,
    [p0[0] + (2 / 3) * (p1[0] - p0[0]), p0[1] + (2 / 3) * (p1[1] - p0[1])],
    [p2[0] + (2 / 3) * (p1[0] - p2[0]), p2[1] + (2 / 3) * (p1[1] - p2[1])],
    p2,
  ];
}

function glyphRings(glyph, originX) {
  const cmds = glyph.path.commands;
  const rings = [];
  let current = [];
  let cx = 0;
  let cy = 0;
  const toSvg = (x, y) => [originX + x * scale, baseline - y * scale];

  const line = (x, y) => {
    cx = x;
    cy = y;
    current.push(toSvg(x, y));
  };

  for (const cmd of cmds) {
    if (cmd.command === "moveTo") {
      if (current.length) rings.push(current);
      current = [];
      line(cmd.args[0], cmd.args[1]);
    } else if (cmd.command === "lineTo") {
      line(cmd.args[0], cmd.args[1]);
    } else if (cmd.command === "quadraticCurveTo" || cmd.command === "bezierCurveTo") {
      const start = [cx, cy];
      let cubic;
      if (cmd.command === "quadraticCurveTo") {
        const [x1, y1, x, y] = cmd.args;
        cubic = quadToCubic(start, [x1, y1], [x, y]);
        cx = x;
        cy = y;
      } else {
        const [x1, y1, x2, y2, x, y] = cmd.args;
        cubic = [start, [x1, y1], [x2, y2], [x, y]];
        cx = x;
        cy = y;
      }
      const flat = [];
      flattenCubic(cubic[0], cubic[1], cubic[2], cubic[3], flat);
      for (const p of flat) current.push(toSvg(p[0], p[1]));
    } else if (cmd.command === "closePath") {
      if (current.length) rings.push(current);
      current = [];
    }
  }
  if (current.length) rings.push(current);
  return rings.map(dedupe).filter((r) => r.length >= 3 && Math.abs(signedArea(r)) > 0.02);
}

function multiPolygonFromRings(rings) {
  const items = rings
    .map((ring) => ({ ring, abs: Math.abs(signedArea(ring)) }))
    .sort((a, b) => b.abs - a.abs);
  const depth = items.map((it) => {
    const c = centroidOf(it.ring);
    let d = 0;
    for (const other of items) {
      if (other.abs <= it.abs + 1e-6) continue;
      if (other === it) continue;
      if (pointInRing(other.ring, c[0], c[1])) d++;
    }
    return d;
  });
  const polys = [];
  items.forEach((it, i) => {
    if (depth[i] % 2 !== 0) return;
    const poly = [closeRing(orient(it.ring, 1))];
    const cands = [];
    items.forEach((hole, j) => {
      if (depth[j] !== depth[i] + 1) return;
      const c = centroidOf(hole.ring);
      if (pointInRing(it.ring, c[0], c[1])) cands.push(hole);
    });
    for (const hole of cands) poly.push(closeRing(orient(hole.ring, -1)));
    polys.push(poly);
  });
  return polys;
}

function turnAt(pts, i) {
  const m = pts.length;
  const prev = pts[(i - 1 + m) % m];
  const cur = pts[i];
  const next = pts[(i + 1) % m];
  const ax = cur[0] - prev[0];
  const ay = cur[1] - prev[1];
  const bx = next[0] - cur[0];
  const by = next[1] - cur[1];
  return Math.abs(Math.atan2(ax * by - ay * bx, ax * bx + ay * by));
}

/** Exactly `n` boundary samples. Sharp corners are kept so adjacent cells
 *  meet on shared edges instead of chamfering open a gap. */
function resampleRing(ring, n) {
  const pts = ring;
  const m = pts.length;
  const segLen = [];
  const cum = [0];
  for (let i = 0; i < m; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % m];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segLen.push(len);
    cum.push(cum[i] + len);
  }
  const perim = cum[m];
  if (perim < 0.05) return null;

  const corners = [];
  for (let i = 0; i < m; i++) {
    if (turnAt(pts, i) > 0.45) corners.push(i);
  }
  const cornerDists = corners.map((i) => cum[i]);

  const dists = Array.from({ length: n }, (_, k) => (k * perim) / n);
  const used = new Set();
  for (const cd of cornerDists) {
    let best = -1;
    let bestDelta = Infinity;
    for (let k = 0; k < n; k++) {
      if (used.has(k)) continue;
      const raw = Math.abs(dists[k] - cd);
      const delta = Math.min(raw, perim - raw);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = k;
      }
    }
    if (best >= 0) {
      dists[best] = cd;
      used.add(best);
    }
  }
  dists.sort((a, b) => a - b);

  const at = (dist) => {
    const d = ((dist % perim) + perim) % perim;
    let i = 0;
    while (i < m - 1 && cum[i + 1] < d) i++;
    const edge = segLen[i] || 1;
    const t = Math.max(0, Math.min(1, (d - cum[i]) / edge));
    const a = pts[i];
    const b = pts[(i + 1) % m];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  return dists.map(at);
}

function straightCubics(points) {
  const n = points.length;
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % n];
    const c1x = p0[0] + (p1[0] - p0[0]) / 3;
    const c1y = p0[1] + (p1[1] - p0[1]) / 3;
    const c2x = p0[0] + (2 * (p1[0] - p0[0])) / 3;
    const c2y = p0[1] + (2 * (p1[1] - p0[1])) / 3;
    d += `C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p1[0])} ${fmt(p1[1])}`;
  }
  return d + "Z";
}

function circleCubics(cx, cy, r, a0, dir) {
  const n = SAMPLES;
  const theta = dir * ((2 * Math.PI) / n);
  const k = (4 / 3) * Math.tan(Math.abs(theta) / 4);
  const tangent = theta >= 0 ? 1 : -1;
  const at = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const start = at(a0);
  let d = `M${fmt(start[0])} ${fmt(start[1])}`;
  for (let i = 0; i < n; i++) {
    const ang0 = a0 + i * theta;
    const ang1 = ang0 + theta;
    const p0 = at(ang0);
    const p1 = at(ang1);
    const c1x = p0[0] + k * r * tangent * -Math.sin(ang0);
    const c1y = p0[1] + k * r * tangent * Math.cos(ang0);
    const c2x = p1[0] - k * r * tangent * -Math.sin(ang1);
    const c2y = p1[1] - k * r * tangent * Math.cos(ang1);
    d += `C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p1[0])} ${fmt(p1[1])}`;
  }
  return d + "Z";
}

function countNumbers(path) {
  return path.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/g)?.length ?? 0;
}

function bakeWord(text) {
  const run = font.layout(text);
  let pen = 0;
  const placed = [];
  for (let i = 0; i < run.glyphs.length; i++) {
    const pos = run.positions[i];
    const origin = pen + pos.xOffset * scale;
    placed.push({ glyph: run.glyphs[i], origin });
    pen += pos.xAdvance * scale;
  }
  const width = pen;
  const rings = placed.flatMap(({ glyph, origin }) => glyphRings(glyph, origin));
  const multi = multiPolygonFromRings(rings);
  if (multi.length === 0) throw new Error(`no outlines for ${text}`);

  const droplets = [];
  let skipped = 0;
  for (let x = 0; x <= width + PITCH; x += PITCH) {
    for (let y = 0; y <= LINE_HEIGHT + PITCH; y += PITCH) {
      const x0 = x - PITCH / 2;
      const y0 = y - PITCH / 2;
      const x1 = x + PITCH / 2;
      const y1 = y + PITCH / 2;
      const cell = [[closeRing(orient([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 1))]];
      let pieces;
      try {
        pieces = polygonClipping.intersection(multi, cell);
      } catch {
        skipped++;
        continue;
      }
      if (!pieces || pieces.length === 0) continue;

      const ringsOut = [];
      for (const poly of pieces) {
        const outer = dedupe(poly[0]);
        if (outer.length >= 3) ringsOut.push(outer);
      }
      if (ringsOut.length === 0) continue;
      const area = ringsOut.reduce((sum, ring) => sum + Math.abs(signedArea(ring)), 0);
      const coverage = area / (PITCH * PITCH);
      if (coverage < MIN_VISIBILITY) continue;
      const radius = DOT_SIZE * Math.sqrt(Math.pow(coverage, SIZE_CONTRAST));
      if (radius < 0.04) continue;

      // One path per connected piece of this cell, all settling on the same dot
      // so a split stroke still reads as one droplet.
      const largest = Math.max(...ringsOut.map((ring) => Math.abs(signedArea(ring))));
      for (const ring of ringsOut) {
        if (Math.abs(signedArea(ring)) < largest * 0.2) continue;
        const sampled = resampleRing(ring, SAMPLES);
        if (!sampled) {
          skipped++;
          continue;
        }
        let best = 0;
        let bestDelta = Infinity;
        for (let s = 0; s < sampled.length; s++) {
          const ang = Math.atan2(sampled[s][1] - y, sampled[s][0] - x);
          const delta = Math.abs(Math.atan2(Math.sin(ang - ANGLE0), Math.cos(ang - ANGLE0)));
          if (delta < bestDelta) {
            bestDelta = delta;
            best = s;
          }
        }
        const pts = sampled.slice(best).concat(sampled.slice(0, best));
        const a0 = Math.atan2(pts[0][1] - y, pts[0][0] - x);
        const dir = signedArea(pts) >= 0 ? 1 : -1;
        // Overlap neighbors by a fraction of a pixel so shared edges don't
        // rasterize as hairline cracks. The resting union should read as type.
        const origin = centroidOf(pts);
        const overlap = 0.14;
        const grown = pts.map((p) => {
          const dx = p[0] - origin[0];
          const dy = p[1] - origin[1];
          const len = Math.hypot(dx, dy) || 1;
          return [p[0] + (dx / len) * overlap, p[1] + (dy / len) * overlap];
        });
        const start = straightCubics(grown);
        const end = circleCubics(x, y, radius, a0, dir);
        if (countNumbers(start) !== countNumbers(end)) {
          throw new Error(`path topology mismatch in ${text}`);
        }
        droplets.push({ start, end });
      }
    }
  }

  return { label: text, width: Math.round(width * 100) / 100, height: LINE_HEIGHT, droplets, skipped };
}

const words = WORDS.map(bakeWord);
for (const word of words) {
  console.log(
    word.label,
    "width",
    word.width,
    "droplets",
    word.droplets.length,
    "skipped",
    word.skipped,
  );
}

const { interpolate } = require("framer-motion");
const sample = words[0].droplets[0];
const mixed = interpolate([0, 1], [sample.start, sample.end])(0.5);
if (mixed === sample.end || mixed === sample.start) {
  throw new Error("framer-motion did not interpolate a sample droplet");
}
console.log("sample midpoint ok", mixed.slice(0, 80));

const body = words
  .map((word) => {
    const droplets = word.droplets
      .map((d) => `    { start: "${d.start}", end: "${d.end}" },`)
      .join("\n");
    return `  {
    label: "${word.label}",
    width: ${word.width},
    height: ${word.height},
    droplets: [
${droplets}
    ],
  }`;
  })
  .join(",\n");

const file = `/* Generated by bake-outlines.cjs from fonts/ABCArealVariable.woff2.
   Instance: wght 400, slnt 0, DRKM 0 (the file's default).
   Size: ${FONT_SIZE}px on a ${LINE_HEIGHT}px line, pitch ${PITCH}, radius ${DOT_SIZE}, min coverage ${MIN_VISIBILITY}.
   Do not edit by hand. */

export type OutlineDroplet = { readonly start: string; readonly end: string };

export type OutlineWord = {
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly droplets: readonly OutlineDroplet[];
};

export const OUTLINE_WORDS: readonly OutlineWord[] = [
${body}
];
`;

fs.writeFileSync(OUT, file);
console.log("wrote", OUT, "bytes", file.length);
