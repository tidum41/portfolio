/**
 * Download JOOLA.com product hero images for prototype thumbnails (~96px @2x for 48px UI).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_VENDOR = path.resolve("vendor/joola-b2b-live/public/products");
const OUT_PORTFOLIO = path.resolve("public/images/joola/products");
const MANIFEST = path.resolve("vendor/joola-b2b-live/public/products/manifest.json");

const TARGETS = [
  {
    id: "perseus",
    matchesTitle: (t) => /^JOOLA Perseus Pro V Pickleball Paddle$/.test(t),
    file: "perseus.webp",
  },
  {
    id: "hyperion",
    matchesTitle: (t) =>
      t === "JOOLA Hyperion Pro IV 14mm Pickleball Paddle - Tropical Blue/Green",
    file: "hyperion.webp",
  },
  {
    id: "scorpeus",
    matchesTitle: (t) => /^JOOLA Scorpeus Pro V Pickleball Paddle$/.test(t),
    file: "scorpeus.webp",
  },
  {
    id: "magnus",
    matchesTitle: (t) => /^JOOLA Magnus Pro IV 14mm Pickleball Paddle$/.test(t),
    file: "magnus.webp",
  },
  {
    id: "hc40",
    matchesTitle: (t) => /^JOOLA HC-40 Ball$/.test(t),
    file: "hc40.webp",
  },
  {
    id: "overgrip",
    matchesTitle: (t) => /^JOOLA Premium Pickleball Paddle Overgrip \(4 Count\)$/.test(t),
    file: "overgrip.webp",
  },
  {
    id: "netset",
    matchesTitle: (t) => /^JOOLA Compact Pickleball Practice Net$/.test(t),
    file: "netset.webp",
  },
  {
    id: "tourbag",
    matchesTitle: (t) => /^JOOLA Tour Elite Pickleball Bag$/.test(t),
    file: "tourbag.webp",
  },
  {
    id: "edgetape",
    matchesTitle: (t) => /^JOOLA Pro V Pickleball Protective Edge Guard Tape$/.test(t),
    file: "edgetape.webp",
  },
];

async function main() {
  const res = await fetch("https://joola.com/products.json?limit=250");
  if (!res.ok) throw new Error(`products.json ${res.status}`);
  const { products } = await res.json();
  await mkdir(OUT_VENDOR, { recursive: true });
  await mkdir(OUT_PORTFOLIO, { recursive: true });

  const manifest = { fetchedAt: new Date().toISOString(), assets: [] };

  for (const target of TARGETS) {
    const product = products.find(
      (p) =>
        target.matchesTitle(p.title) &&
        !/table tennis|ping pong/i.test(`${p.title} ${p.product_type}`),
    );
    if (!product?.images?.[0]?.src) {
      throw new Error(`No Shopify product for ${target.id}`);
    }
    const src = product.images[0].src;
    const imgRes = await fetch(src);
    if (!imgRes.ok) throw new Error(`Download failed ${target.id}: ${src}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const webp = await sharp(buf)
      .resize(96, 96, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 82 })
      .toBuffer();

    const vendorPath = path.join(OUT_VENDOR, target.file);
    const portfolioPath = path.join(OUT_PORTFOLIO, target.file);
    await writeFile(vendorPath, webp);
    await writeFile(portfolioPath, webp);

    manifest.assets.push({
      id: target.id,
      file: target.file,
      shopifyTitle: product.title,
      sourceUrl: src,
      productUrl: `https://joola.com/products/${product.handle}`,
    });
    console.log("wrote", target.file, "←", product.title);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log("manifest", MANIFEST);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
