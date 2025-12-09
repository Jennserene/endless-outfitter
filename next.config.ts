import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude vendor directory from production builds
  webpack: (config, { isServer, dev }) => {
    if (!dev && isServer) {
      // In production server builds, ensure vendor directory is not bundled
      config.externals = config.externals || [];
      config.externals.push({
        fs: "commonjs fs",
        path: "commonjs path",
      });
    }
    return config;
  },
};

export default nextConfig;
