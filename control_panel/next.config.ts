import type { NextConfig } from "next";

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error("API_URL is not set");
}

const nextConfig: NextConfig = {
  // Bundles a minimal server + traced node_modules into .next/standalone —
  // what the Docker build copies into the runtime image instead of the
  // full node_modules tree.
  output: "standalone",

  // Proxies API calls through this app's own origin so the backend's
  // auth cookies (accessToken/refreshToken/hasSession) end up scoped to
  // this domain instead of the backend's — they're cross-site otherwise
  // (separate *.run.app subdomains, not just separate ports like in dev)
  // and never reach us. Read at server startup, not build time, so this
  // is a plain runtime env var, not a NEXT_PUBLIC_* build arg.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
