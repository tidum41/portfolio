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
