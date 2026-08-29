import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundles a minimal server + traced node_modules into .next/standalone —
  // what the Docker build copies into the runtime image instead of the
  // full node_modules tree.
  // output: "standalone",
};

export default nextConfig;
