import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Povolené quality hodnoty pre next/image (Next.js 16 vyžaduje explicit allowlist).
    // 92 je high-quality pre hero fotky, 75 default.
    qualities: [75, 85, 92],
    // Moderné formáty — Next pošle AVIF / WebP keď ich browser podporuje.
    formats: ["image/avif", "image/webp"],
  },
  // ESLint warnings skip počas buildu — niekoľko legacy warningov (unescaped
  // quotes v static texte, react-hooks v modále). Lint manuálne cez `next lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TS errors ENABLED v build pipeline — kód je čistý.
  // cron-worker má vlastný tsconfig a je excluded v hlavnom tsconfig.json.
  // Striktný typecheck zachytí type bugs PRED deployom.
};

export default nextConfig;
