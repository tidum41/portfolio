/**
 * Side-by-side: cart pill from JOOLA homepage card Mux demo vs live round5 embed.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("artifacts/joola-sanity/cart-compare.png");
const TMP = path.resolve("artifacts/joola-sanity/_cart-compare-tmp");
const MUX_ID = "gX4z7zlxZK85I7oNjrxK00ty3zVZtXmrxohRte00hCYs00";
const SITE = process.env.JOOLA_CAPTURE_BASE ?? "http://localhost:3000";
const EMBED = `${SITE}/joola-proto/round5/index.html#/quick-order?embed=1&clean=1&view=portal&screen=quick-order&state=default&latency=0&account=dicks`;

async function main() {
  mkdirSync(TMP, { recursive: true });
  mkdirSync(path.dirname(OUT), { recursive: true });

  const frame = path.join(TMP, "mux-frame.png");
  const muxCrop = path.join(TMP, "mux-cart-crop.png");
  const embedCrop = path.join(TMP, "embed-cart-crop.png");

  const thumbRes = await fetch(
    `https://image.mux.com/${MUX_ID}/thumbnail.png?time=2.5`,
  );
  if (!thumbRes.ok) {
    throw new Error(`Mux thumbnail failed: ${thumbRes.status}`);
  }
  const thumbBuf = Buffer.from(await thumbRes.arrayBuffer());
  await sharp(thumbBuf).png().toFile(frame);

  const meta = await sharp(frame).metadata();
  const w = meta.width ?? 1280;
  const h = meta.height ?? 960;
  const crop = {
    left: Math.round(w * 0.52),
    top: Math.round(h * 0.06),
    width: Math.round(w * 0.42),
    height: Math.round(h * 0.12),
  };
  await sharp(frame).extract(crop).png().toFile(muxCrop);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(EMBED, { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector(".cart-pill", { timeout: 60000 });
  await page.locator(".cart-pill").first().screenshot({ path: embedCrop });
  await browser.close();

  const muxBuf = await sharp(muxCrop).resize({ height: 80 }).png().toBuffer();
  const embedBuf = await sharp(embedCrop).resize({ height: 80 }).png().toBuffer();
  const muxW = (await sharp(muxBuf).metadata()).width ?? 200;
  const embedW = (await sharp(embedBuf).metadata()).width ?? 200;
  const pad = 24;
  const labelH = 28;
  const canvasW = pad * 3 + muxW + embedW;
  const canvasH = labelH + 80 + pad * 2;

  const leftSvg = Buffer.from(
    `<svg width="${muxW + pad * 2}" height="${labelH}"><text x="${pad}" y="20" font-family="sans-serif" font-size="14" fill="#333">Homepage card video (Mux t=2.5s)</text></svg>`,
  );
  const rightSvg = Buffer.from(
    `<svg width="${embedW + pad * 2}" height="${labelH}"><text x="${pad}" y="20" font-family="sans-serif" font-size="14" fill="#333">round5 embed cart pill</text></svg>`,
  );

  await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 250, g: 250, b: 252 },
    },
  })
    .composite([
      { input: leftSvg, top: pad, left: 0 },
      { input: rightSvg, top: pad, left: pad * 2 + muxW },
      { input: muxBuf, top: pad + labelH, left: pad },
      { input: embedBuf, top: pad + labelH, left: pad * 2 + muxW },
    ])
    .png()
    .toFile(OUT);

  writeFileSync(
    path.join(TMP, "README.txt"),
    `Mux playback ${MUX_ID}\nFrame crop: ${JSON.stringify(crop)}\nEmbed: ${EMBED}\n`,
  );
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
