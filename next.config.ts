import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages uses edge runtime — do NOT use "standalone"
  // The @opennextjs/cloudflare adapter handles the build output

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Cloudflare Workers have a 100 MB response body limit
  // and individual assets up to 25 MB by default
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Optimize for edge deployment
  experimental: {
    // Enable server actions (supported on Cloudflare via OpenNext)
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
