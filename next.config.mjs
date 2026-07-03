/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@mux/mux-player-react"],
  },
};

export default nextConfig;
