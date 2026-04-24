import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Prisma : sortie custom hors node_modules — forcer l’inclusion du moteur .node dans les lambdas Vercel
  outputFileTracingIncludes: {
    "/api/**/*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;
