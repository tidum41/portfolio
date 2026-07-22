import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the Turbopack/project root to this package so a parent-directory
  // package-lock.json (e.g. ~/package-lock.json) can't make Next resolve
  // modules relative to the wrong folder — that was surfacing as
  // "Can't resolve '@/components/PhoneEmbed'" against a stale page.tsx.
  turbopack: {
    root: __dirname,
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
  },
  serverExternalPackages: ["sanity", "next-sanity", "@sanity/client", "@sanity/ui"],
  experimental: {
    optimizePackageImports: ["framer-motion", "@mux/mux-player-react"],
  },
};

export default nextConfig;
