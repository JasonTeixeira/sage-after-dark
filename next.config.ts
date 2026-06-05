import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      { source: "/membership", destination: "/account", permanent: true },
      { source: "/members", destination: "/account", permanent: true },
    ];
  },
};

export default nextConfig;
