import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// `next build` runs with NODE_ENV=production. `next dev` does not, so local
// tuning still loads the real DialKit package.
const dialkitAlias =
  process.env.NODE_ENV === "production"
    ? { dialkit: "./lib/dialkit-prod.tsx" }
    : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        dialkit: path.join(__dirname, "lib/dialkit-prod.tsx"),
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
