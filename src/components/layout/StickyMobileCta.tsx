"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sticky mobile CTA — jedno hlavné CTA "Cenová ponuka" dole na mobile.
 * Zobrazí sa keď user scrolluje pod hero (>500px).
 * Skryté na /admin a /kontakt (kde je už form).
 * Telefón + WhatsApp sú v hamburger menu, nie tu.
 */
export function StickyMobileCta() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const [footerInView, setFooterInView] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname === "/kontakt";

  if (hidden) return null;

  const showBar = visible && !footerInView;

  return (
    <div
      className={`md:hidden fixed bottom-2 left-3 right-[72px] z-40 transition-all duration-500 ease-out ${
        showBar
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      aria-hidden={!showBar}
    >
      <Link
        href="/kontakt#cenova-ponuka"
        className="flex w-full items-center justify-center px-5 py-2.5 rounded-full bg-[#3db6e8] text-white font-semibold text-sm shadow-[0_10px_30px_rgba(61,182,232,0.45)] active:scale-95 transition-transform"
      >
        Cenová ponuka
      </Link>
    </div>
  );
}
