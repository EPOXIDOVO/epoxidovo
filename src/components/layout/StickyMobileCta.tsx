"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

/**
 * Sticky mobile CTA — floating tlačidlá dole na mobile.
 * Zobrazia sa keď user scrolluje pod hero (>500px).
 * Skryté na /admin a /kontakt (kde je už form).
 *
 * 3 tlačidlá:
 *  - Volaj  → tel:
 *  - WhatsApp → wa.me/421...
 *  - Cenová ponuka → /kontakt#cenova-ponuka
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

  // Skryť na admin / kontakt / login
  const hidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname === "/kontakt";

  if (hidden) return null;

  const showBar = visible && !footerInView;

  const waNumber = SITE.contact.phoneRaw.replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    "Dobrý deň, mám záujem o cenovú ponuku na epoxidovú podlahu.",
  );

  return (
    <div
      className={`md:hidden fixed bottom-3 left-3 right-[80px] z-40 transition-all duration-500 ease-out ${
        showBar
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      aria-hidden={!showBar}
    >
      <div className="flex gap-2">
        <a
          href={`tel:${SITE.contact.phoneRaw}`}
          aria-label="Zavolať"
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-white text-[var(--color-fg)] shadow-[0_8px_24px_rgba(0,0,0,0.18)] active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5" aria-hidden />
        </a>
        <a
          href={`https://wa.me/${waNumber}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-[#25d366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" aria-hidden />
        </a>
        <Link
          href="/kontakt#cenova-ponuka"
          className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#3db6e8] text-white font-semibold text-sm shadow-[0_10px_30px_rgba(61,182,232,0.45)] active:scale-95 transition-transform"
        >
          Cenová ponuka
        </Link>
      </div>
    </div>
  );
}
