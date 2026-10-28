// Post-deploy warm-up for above-the-fold (priority) images.
//
// The first request for each /_next/image variant (width x format) after a
// deploy is an optimizer miss: the server decodes and re-encodes the source
// before the first byte, which showed up as LCP ~3.2 s instead of ~2.4 s on
// /joola. This script requests those variants once so a real visitor gets a
// cache hit.
//
// Safe by design: GET-only, same-origin /_next/image URLs taken from the
// pages' own HTML (only <img fetchpriority="high"> and image preloads), a
// short width list (the widths phones and desktops actually pick for the
// heroes, not the whole srcset, so it doesn't create unused transformations),
// concurrency 3, and a per-request timeout. It never writes anything.
//
// Usage (after a deployment is live; not run by the build):
//   node scripts/warm-hero-images.mjs https://www.muditm.com
//   WARM_ROUTES=/joola,/sviz WARM_WIDTHS=640,750,1080 node scripts/warm-hero-images.mjs <url>
// Routes default to every URL in <base>/sitemap.xml.
const base = (process.argv[2] || "").replace(/\/$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: node scripts/warm-hero-images.mjs <base-url>");
  process.exit(1);
}
const WIDTHS = new Set((process.env.WARM_WIDTHS || "640,750,828,1080,1200,1920").split(",").map(Number));
const FORMATS = ["image/avif", "image/webp"];
const origin = new URL(base).origin;

async function get(url, accept, ms = 30000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { accept, "user-agent": "warm-hero-images" }, signal: ctl.signal });
    const body = await res.arrayBuffer();
    return { status: res.status, bytes: body.byteLength, cache: res.headers.get("x-vercel-cache") || res.headers.get("x-nextjs-cache") || "" };
  } finally {
    clearTimeout(t);
  }
}

async function routes() {
  if (process.env.WARM_ROUTES) return process.env.WARM_ROUTES.split(",");
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

const decode = (s) => s.replace(/&amp;/g, "&");
function heroUrls(html) {
  const out = new Set();
  const tags = [
    ...html.matchAll(/<img\b[^>]*fetchpriority="high"[^>]*>/g),
    ...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*>/g),
  ].map((m) => m[0]);
  for (const tag of tags) {
    const set = (tag.match(/(?:srcset|imageSrcSet|imagesrcset)="([^"]+)"/) || [])[1];
    if (!set) continue;
    for (const part of decode(set).split(",")) {
      const [u, w] = part.trim().split(/\s+/);
      if (!u || !WIDTHS.has(parseInt(w, 10))) continue;
      const abs = new URL(u, origin);
      if (abs.origin === origin && abs.pathname === "/_next/image") out.add(abs.href);
    }
  }
  return [...out];
}

const jobs = [];
for (const r of await routes()) {
  const res = await fetch(`${origin}${r}`).catch(() => null);
  if (!res || !res.ok) continue;
  for (const u of heroUrls(await res.text())) for (const f of FORMATS) jobs.push([u, f]);
}
const unique = [...new Map(jobs.map((j) => [j.join(" "), j])).values()];
console.log(`warming ${unique.length} variants`);
let i = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (i < unique.length) {
    const [u, f] = unique[i++];
    const r = await get(u, f).catch((e) => ({ status: "ERR " + e.name }));
    console.log(r.status, r.cache || "-", r.bytes ?? "", f.split("/")[1], u.replace(origin, ""));
  }
}));
