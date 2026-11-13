/**
 * Research artifact: cart pill crops from homepage Mux card video + hero-ruth-2.png.
 * No vendor/embed changes. Frames via ffmpeg on Mux HLS (thumbnail API is white early).
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("artifacts/joola-sanity");
const OUT = path.join(DIR, "cart-compare.png");
const MUX_CROP = path.join(DIR, "cart-compare-mux-crop.png");
const HERO_CROP = path.join(DIR, "cart-compare-hero-crop.png");
const TMP = path.join(DIR, "_cart-compare-tmp");
const MUX_ID = "gX4z7zlxZK85I7oNjrxK00ty3zVZtXmrxohRte00hCYs00";
const HERO = path.resolve("public/images/joola/hero-ruth-2.png");

const TIMES = [3, 4, 5, 5.5, 6, 6.5, 7, 8];

function resolveHlsUrl() {
  const master = `https://stream.mux.com/${MUX_ID}.m3u8`;
  const text = execSync(`curl -fsSL "${master}"`, { encoding: "utf8" });
  const lines = text.split("\n");
  let best = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXT-X-STREAM-INF")) continue;
    const m = line.match(/RESOLUTION=(\d+)x(\d+)/);
    const url = lines[i + 1]?.trim();
    if (!m || !url || url.startsWith("#")) continue;
    const abs = url.startsWith("http") ? url : new URL(url, master).href;
    const h = Number(m[2]);
    if (!best || h >= best.h) best = { url: abs, h: Number(m[1]), w: h };
  }
  if (!best?.url) throw new Error("No HLS rendition in Mux master playlist");
  return best.url;
}

function ffmpegFrame(hlsUrl, timeSec, outPath) {
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      String(timeSec),
      "-i",
      hlsUrl,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outPath,
    ],
    { stdio: "inherit" },
  );
}

async function findBadgeFrame(hlsUrl, framesDir) {
  mkdirSync(framesDir, { recursive: true });
  const results = [];
  for (const t of TIMES) {
    const out = path.join(framesDir, `t-${t}.png`);
    try {
      ffmpegFrame(hlsUrl, t, out);
    } catch {
      continue;
    }
    const { data, info } = await sharp(out).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const c = info.channels;
    const bw = 100;
    const bh = 44;
    let best = { score: 0, x: 0, y: 0 };
    const yMax = Math.min(320, h - bh);
    for (let y = 0; y < yMax; y += 4) {
      for (let x = Math.round(w * 0.4); x < w - bw; x += 8) {
        let blue = 0;
        for (let dy = 0; dy < bh; dy++) {
          for (let dx = 0; dx < bw; dx++) {
            const i = ((y + dy) * w + (x + dx)) * c;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (b > 165 && r < 115 && g < 145) blue += 1;
          }
        }
        if (blue > best.score) best = { score: blue, x, y };
      }
    }
    results.push({ t, path: out, w, h, ...best });
  }
  const pool = results.filter((r) => r.score >= 600 && r.t >= 5 && r.t <= 7);
  const picked =
    (pool.length ? pool : results.filter((r) => r.score >= 400)).sort(
      (a, b) => b.score - a.score || (a.t === 6 ? 1 : 0) - (b.t === 6 ? 1 : 0),
    )[0];
  if (!picked) throw new Error("No cart badge detected in Mux frames");
  return picked;
}

function pillCrop(badgeX, badgeY, frameW, frameH) {
  return {
    left: Math.max(0, badgeX - 310),
    top: Math.max(0, badgeY - 14),
    width: Math.min(500, frameW - Math.max(0, badgeX - 310)),
    height: Math.min(80, frameH - Math.max(0, badgeY - 14)),
  };
}

async function findHeroCart() {
  if (!existsSync(HERO)) return null;
  const { data, info } = await sharp(HERO).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const c = info.channels;
  const bw = 90;
  const bh = 40;
  let best = { score: 0, x: 0, y: 0 };
  for (let y = 60; y < 280; y += 4) {
    for (let x = 900; x < w - bw; x += 8) {
      let blue = 0;
      for (let dy = 0; dy < bh; dy++) {
        for (let dx = 0; dx < bw; dx++) {
          const i = ((y + dy) * w + (x + dx)) * c;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (b > 165 && r < 115 && g < 145) blue += 1;
        }
      }
      if (blue > best.score) best = { score: blue, x, y };
    }
  }
  if (best.score < 200) return null;
  const crop = pillCrop(best.x, best.y, w, h);
  crop.width = Math.min(460, crop.width);
  await sharp(HERO).extract(crop).png().toFile(HERO_CROP);
  return { crop, badge: best, frame: { w, h } };
}

async function composite(muxBuf, heroBuf, muxLabel, heroLabel) {
  const mH = 88;
  const muxR = await sharp(muxBuf).resize({ height: mH }).png().toBuffer();
  const heroR = heroBuf
    ? await sharp(heroBuf).resize({ height: mH }).png().toBuffer()
    : null;
  const muxW = (await sharp(muxR).metadata()).width ?? 200;
  const heroW = heroR ? (await sharp(heroR).metadata()).width ?? 200 : 0;
  const pad = 24;
  const labelH = 28;
  const cols = heroR ? 2 : 1;
  const canvasW = pad * (cols + 1) + muxW + heroW;
  const canvasH = labelH + mH + pad * 2;
  const muxSvg = Buffer.from(
    `<svg width="${muxW + pad}" height="${labelH}"><text x="0" y="20" font-family="sans-serif" font-size="13" fill="#333">${muxLabel}</text></svg>`,
  );
  const layers = [
    { input: muxSvg, top: pad, left: pad },
    { input: muxR, top: pad + labelH, left: pad },
  ];
  if (heroR) {
    const heroSvg = Buffer.from(
      `<svg width="${heroW + pad}" height="${labelH}"><text x="0" y="20" font-family="sans-serif" font-size="13" fill="#333">${heroLabel}</text></svg>`,
    );
    layers.push({ input: heroSvg, top: pad, left: pad * 2 + muxW });
    layers.push({ input: heroR, top: pad + labelH, left: pad * 2 + muxW });
  }
  await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 250, g: 250, b: 252 },
    },
  })
    .composite(layers)
    .png()
    .toFile(OUT);
}

async function main() {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(DIR, { recursive: true });
  const hlsUrl = resolveHlsUrl();
  const frame = await findBadgeFrame(hlsUrl, path.join(TMP, "frames"));
  const crop = pillCrop(frame.x, frame.y, frame.w, frame.h);
  await sharp(frame.path).extract(crop).png().toFile(MUX_CROP);
  const heroMeta = await findHeroCart();
  const muxBuf = await sharp(MUX_CROP).png().toBuffer();
  const heroBuf = existsSync(HERO_CROP) ? await sharp(HERO_CROP).png().toBuffer() : null;
  await composite(
    muxBuf,
    heroBuf,
    `Mux card video HLS t=${frame.t}s ($4,908.66 · badge 4)`,
    heroMeta
      ? `hero-ruth-2.png composite (cart on Quick order mockup)`
      : "hero-ruth-2.png (cart not auto-located)",
  );
  writeFileSync(
    path.join(TMP, "README.txt"),
    [
      `Mux ${MUX_ID}`,
      `HLS ${hlsUrl}`,
      `Frame t=${frame.t}s badge @ ${frame.x},${frame.y} score=${frame.score}`,
      `Crop ${JSON.stringify(crop)}`,
      heroMeta ? `Hero ${JSON.stringify(heroMeta)}` : "Hero crop skipped",
    ].join("\n"),
  );
  console.log("Wrote", OUT, MUX_CROP, heroMeta ? HERO_CROP : "(no hero crop)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
