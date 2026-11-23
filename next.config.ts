import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build autonome pour Docker (.next/standalone + server.js)
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Upload d'images admin jusqu'à 5 Mo (limite par défaut : 1 Mo)
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
