/** @type {import('next').NextConfig} */
const nextConfig = {
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
