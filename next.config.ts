import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Documents (PDF/Word/Excel/PowerPoint/ZIP) and cover images need more
      // than the 1MB default. Course lesson videos push this much higher —
      // self-hosted (no transcoding/CDN), so cap to something a Windows dev
      // box can reasonably handle rather than true multi-GB HD masters.
      bodySizeLimit: "300mb",
    },
  },
};

export default nextConfig;
