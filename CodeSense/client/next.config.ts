import type { NextConfig } from "next";

const backendOrigin = process.env.BACKEND_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    // Keep local development working without a proxy configuration. In a
    // deployed environment, requests stay on the frontend origin and Vercel
    // proxies only the Spring routes that need to be same-origin.
    if (!backendOrigin) {
      return [];
    }

    return [
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*` },
      { source: "/oauth2/:path*", destination: `${backendOrigin}/oauth2/:path*` },
      {
        source: "/login/oauth2/:path*",
        destination: `${backendOrigin}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
