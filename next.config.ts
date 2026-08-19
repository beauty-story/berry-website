import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nfjctlwvgqgosbarugwo.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/product-images/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit:"5mb",
      allowedOrigins: [
        "*.trycloudflare.com",
      ],
    },
  },
};

export default nextConfig;