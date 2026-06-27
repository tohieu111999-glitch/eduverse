import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Documents (PDF/Word/Excel/PowerPoint/ZIP) and cover images need more
      // than the 1MB default.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
