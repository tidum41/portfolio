// Camera velocity per frame vs content-animation windows, plus zoom-delta-per-0.8s check.
// Usage: node scripts/timeline-report.mjs out.json
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("/tmp/tl", { recursive: true });
execSync("npx tsc src/joola/timeline.ts --outDir /tmp/tl --module es2020 --target es2020 --skipLibCheck", { stdio: "inherit" });
writeFileSync("/tmp/tl/package.json", '{"type":"module"}');
const T = await import("/tmp/tl/timeline.js");
const N = T.DURATION;
const cams = Array.from({ length: N }, (_, f) => T.camAt(f));
// screen-space speed of the frame centre's content + zoom rate (px/frame on the 1920 output)
const CUTS = new Set(T.CUTS || []);
const vel = cams.map((c, f) => {
  if (f === 0 || CUTS.has(f)) return 0; // intentional hard cuts are not camera motion
  const p = cams[f - 1];
  const pan = Math.hypot((c.cx - p.cx) * c.s, (c.cy - p.cy) * c.s);
  const zoom = Math.abs(c.s - p.s) * 960; // edge displacement from zoom
  return pan + zoom;
});
const MOVING = 0.05;
const overlaps = [];
for (const [name, a, b] of T.CONTENT_ANIMS) {
  const fr = [];
  for (let f = Math.max(1, a); f <= Math.min(b, N - 1); f++) if (vel[f] > MOVING) fr.push(f);
  overlaps.push({ anim: name, from: a, to: b, camera_moving_frames: fr });
}
let worstZoom = { delta: 0, at: 0 };
for (let f = 0; f + 24 < N; f++) {
  let cut = false; for (let k = f + 1; k <= f + 24; k++) if (CUTS.has(k)) cut = true;
  if (cut) continue;
  const d = Math.abs(cams[f + 24].s - cams[f].s);
  if (d > worstZoom.delta) worstZoom = { delta: +d.toFixed(3), at: f };
}
const peak = vel.reduce((m, v, f) => (v > m.v ? { v, f } : m), { v: 0, f: 0 });
const out = {
  duration_frames: N, seconds: +(N / 30).toFixed(2),
  moves: T.MOVES.map((m) => ({ ...m, seconds: +((m.b - m.a) / 30).toFixed(2) })),
  peak_camera_speed_px_per_frame: +peak.v.toFixed(1), peak_frame: peak.f,
  worst_zoom_change_in_24_frames: worstZoom,
  content_anims_vs_camera: overlaps,
  hard_cuts: [...CUTS],
  any_overlap: overlaps.some((o) => o.camera_moving_frames.length),
};
writeFileSync(process.argv[2] || "/tmp/timing.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify({ seconds: out.seconds, peak: out.peak_camera_speed_px_per_frame, peak_frame: peak.f, worstZoom, overlaps: overlaps.filter((o) => o.camera_moving_frames.length) }, null, 1));
