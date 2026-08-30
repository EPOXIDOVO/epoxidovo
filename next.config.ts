import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Dev a produkčný build si NESMÚ liezť do toho istého priečinka.
   * `npm run pages:build` (a každý `next build`) prepíše `.next` produkčnými
   * artefaktmi a bežiaci `next dev` potom padá na „Cannot find module
   * './vendor-chunks/…'" alebo chýbajúci routes-manifest.json — celý web
   * hádže 500, kým sa `.next` nezmaže a server nereštartuje.
   * Preto dev beží nad `.next-dev` (nastavuje si to `npm run dev`) a build
   * si ďalej píše do `.next`, ako čaká Cloudflare next-on-pages.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
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
  async redirects() {
    return [
      // Staré mestské URL (epoxidove-podlahy-bratislava) — priečinok s [mesto]
      // uprostred názvu Next nebral ako dynamickú trasu a vracal 404.
      // Google ich má v indexe, preto trvalé 301 na nový tvar.
      {
        source: "/epoxidove-podlahy-:mesto",
        destination: "/epoxidove-podlahy/:mesto",
        permanent: true,
      },
    ];
  },
  // TS errors ENABLED v build pipeline — kód je čistý.
  // cron-worker má vlastný tsconfig a je excluded v hlavnom tsconfig.json.
  // Striktný typecheck zachytí type bugs PRED deployom.
};

export default nextConfig;
