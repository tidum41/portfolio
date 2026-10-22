import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The grid player loads this file by URL so the browser can fetch it with
// the HTML, instead of waiting for a hashed bundle after hydration.
const hlsLightSrc = path.join(__dirname, "node_modules/hls.js/dist/hls.light.min.js");
const hlsLightDest = path.join(__dirname, "public/vendor/hls-light.min.js");
if (fs.existsSync(hlsLightSrc)) {
  fs.mkdirSync(path.dirname(hlsLightDest), { recursive: true });
  fs.copyFileSync(hlsLightSrc, hlsLightDest);
}

// `next build` runs with NODE_ENV=production. `next dev` does not, so local
// tuning still loads the real DialKit package.
const dialkitAlias =
  process.env.NODE_ENV === "production"
    ? { dialkit: "./lib/dialkit-prod.tsx" }
    : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Resolved at build time so the annotation toolbar guard never depends on
  // the "expose system env vars" project setting. Only a Vercel production
  // deployment reports "production"; local builds report "development".
  env: {
    NEXT_PUBLIC_VERCEL_ENV:
      process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  },
  // Pin the Turbopack/project root to this package so a parent-directory
  // package-lock.json (e.g. ~/package-lock.json) can't make Next resolve
  // modules relative to the wrong folder — that was surfacing as
  // "Can't resolve '@/components/PhoneEmbed'" against a stale page.tsx.
  turbopack: {
    root: __dirname,
    ...(dialkitAlias ? { resolveAlias: dialkitAlias } : {}),
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Exact match only, so `dialkit/store` still resolves to the real
        // package. The production stub imports the store's value resolver.
        "dialkit$": path.join(__dirname, "lib/dialkit-prod.tsx"),
      };
    }
    return config;
  },
  // Required for Sanity Studio (mounted at /studio, a real production route)
  // — @sanity/ui and the sanity package both use styled-components
  // internally at runtime, this isn't for our own app code. This transform
  // also fixes styled-components class-name hydration mismatches under SSR.
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90, 92],
  },
  serverExternalPackages: ["sanity", "next-sanity", "@sanity/client", "@sanity/ui"],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@mux/mux-player-react",
      "@phosphor-icons/react",
    ],
  },
  async redirects() {
    return [
      {
        source: "/playground",
        destination: "/archive",
        permanent: true,
      },
      {
        source: "/playground/:path*",
        destination: "/archive/:path*",
        permanent: true,
      },
      {
        source: "/resume",
        destination: "/resume.pdf",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/resume.pdf",
        headers: [
          {
            key: "Content-Type",
            value: "application/pdf",
          },
          {
            key: "Content-Disposition",
            value: 'inline; filename="Mudit-Mahajan-Resume.pdf"',
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
