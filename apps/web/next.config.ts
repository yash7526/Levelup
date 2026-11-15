import { networkInterfaces } from "node:os";

import type { NextConfig } from "next";

const PRIVATE_IPV4 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

/**
 * This machine's private network addresses (e.g. 192.168.1.17). Next.js blocks dev
 * resources such as live reload for any host other than localhost; allowing these lets
 * phones on the same Wi-Fi use the dev server. Has no effect on production builds.
 */
function lanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .flatMap((net) =>
      net && net.family === "IPv4" && !net.internal && PRIVATE_IPV4.test(net.address)
        ? [net.address]
        : [],
    );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Links are type-checked against real routes (`next typegen`).
  typedRoutes: true,
  poweredByHeader: false,
  allowedDevOrigins: lanAddresses(),
  // Workspace packages ship TypeScript source ("just-in-time" internal packages).
  transpilePackages: ["@levelup/supabase", "@levelup/tokens", "@levelup/types", "@levelup/utils"],
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
};

export default nextConfig;
