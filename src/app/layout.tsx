import type { Metadata, Viewport } from "next";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { InitialPreloader } from "@/components/layout/InitialPreloader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/analytics/Analytics";
import { GlobalClickTracker } from "@/components/analytics/GlobalClickTracker";

// AiChatWidget je heavy (421 lines, lucide ikony, formulár) — lazy-load
// kvôli Core Web Vitals (TBT, INP). Bundle sa rozsplitne do vlastného chunku.
const AiChatWidget = dynamic(
  () => import("@/components/chat/AiChatWidget").then((m) => m.AiChatWidget),
);

const sansFont = Manrope({
  variable: "--font-sans-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Epoxidové a polyuretánové podlahy`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "epoxidové a polyuretánové podlahy",
    "epoxidové podlahy",
    "polyuretánové podlahy",
    "metalické podlahy",
    "mramorové podlahy",
    "chipsové podlahy",
    "liate podlahy",
    "podlahy do garáže",
    "priemyselné podlahy",
    "epoxid Ružomberok",
    "epoxid Slovensko",
  ],
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.og.title,
    description: SITE.og.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.og.title,
    description: SITE.og.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sk"
      className={`${sansFont.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Cookiebot — GDPR consent banner + script auto-blocking.
            Musí byť v <head> a načítaný PRED ostatným analytics/marketing
            JS, aby blockingmode=auto vedel zablokovať trackery do udelenia
            súhlasu. */}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="4f9c479d-c24b-4e27-82b7-2062743b7ce2"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
        {/* Disable pinch-zoom + double-tap zoom on mobile.
            iOS Safari ignoruje viewport user-scalable=no od iOS 10, tak
            chytáme gesture events priamo + double-tap timing detector. */}
        <Script id="disable-zoom" strategy="beforeInteractive">
          {`
            document.addEventListener('gesturestart', function(e){e.preventDefault();});
            document.addEventListener('gesturechange', function(e){e.preventDefault();});
            document.addEventListener('gestureend', function(e){e.preventDefault();});
            var lastTouchEnd = 0;
            document.addEventListener('touchend', function(e){
              var now = Date.now();
              if (now - lastTouchEnd <= 300) { e.preventDefault(); }
              lastTouchEnd = now;
            }, { passive: false });
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        {/* Skip-to-content link pre A11y */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#3db6e8] focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Preskočiť na obsah
        </a>
        <InitialPreloader />
        <SiteChrome>{children}</SiteChrome>
        <AiChatWidget />
        <JsonLd />
        <Analytics />
        <GlobalClickTracker />
      </body>
    </html>
  );
}
