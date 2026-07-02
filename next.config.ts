import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri (self-contained server.js) — dibutuhkan untuk deploy ke
  // Hostinger Node.js App (Passenger), bukan platform serverless seperti
  // Vercel. Lihat docs/DEPLOYMENT.md.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
    ],
  },
};

export default nextConfig;
