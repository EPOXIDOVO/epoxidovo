import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE, getAddressLine } from "@/lib/site";

/**
 * Footer — 1:1 podľa pôvodného epoxidovo.sk:
 * - Oranžovo-hnedé pozadie (#5C2C18 ish)
 * - 3-stĺpcový horný blok: kontakty vľavo, veľké kruhové logo Macka v strede,
 *   sociálne siete vpravo
 * - Spodný riadok: navigácia + copyright + IČO/DIČ
 * - Sociálne siete: Instagram, TikTok, Facebook (z SITE.social)
 */

const FOOTER_NAV = [
  { href: "/", label: "Úvod" },
  { href: "/sluzby", label: "Služby" },
  { href: "/kontakt", label: "Kontakty" },
  { href: "/ochrana-sukromia", label: "Zásady ochrany osobných údajov" },
  { href: "/cookies", label: "Cookies" },
];

const SOCIAL_LINKS = [
  { name: "Instagram", href: SITE.social.instagram, icon: InstagramIcon },
  { name: "TikTok", href: SITE.social.tiktok, icon: TikTokIcon },
  { name: "Facebook", href: SITE.social.facebook, icon: FacebookIcon },
].filter((s) => s.href);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0e1320] text-white mt-0">
      {/* Horný blok — 3 stĺpce */}
      <Container size="xl" className="pt-10 md:pt-12 pb-6 md:pb-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 items-center">
          {/* Vľavo — kontakty */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-bold text-white mb-3">Kontaktujte nás</h3>
            <div className="space-y-2">
              <a
                href={`tel:${SITE.contact.phoneRaw}`}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity justify-center md:justify-start"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10">
                  <Phone className="w-3.5 h-3.5" aria-hidden />
                </span>
                <span className="text-sm">{SITE.contact.phone}</span>
              </a>
              <a
                href={`mailto:${SITE.contact.email}`}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity justify-center md:justify-start"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10">
                  <Mail className="w-3.5 h-3.5" aria-hidden />
                </span>
                <span className="text-sm">{SITE.contact.email}</span>
              </a>
            </div>
          </div>

          {/* Stred — kruhové logo Macka */}
          <div className="flex justify-center">
            <Link href="/" aria-label="EPOXIDOVO — domov" className="block">
              <Image
                src="/images/site/logo_v2.png"
                alt="EPOXIDOVO logo"
                width={220}
                height={220}
                className="w-24 h-24 md:w-28 md:h-28 object-contain"
              />
            </Link>
          </div>

          {/* Vpravo — sociálne siete */}
          <div className="text-center md:text-right">
            <h3 className="text-base font-bold text-white mb-3">
              Naše sociálne siete
            </h3>
            <div className="flex items-center gap-2 justify-center md:justify-end">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </Container>

      {/* Spodný blok — navigácia + copyright + IČO/DIČ */}
      <div className="border-t border-white/10">
        <Container size="xl" className="py-4 md:py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <nav
              aria-label="Footer navigácia"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-white/80"
            >
              {FOOTER_NAV.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <p className="text-xs text-white/70 text-center md:text-right leading-relaxed">
              © {year} {SITE.legalName}. Všetky práva vyhradené.
              <br />
              IČO: {SITE.business.ico} · DIČ: {SITE.business.dic} · {getAddressLine()}
            </p>
          </div>

        </Container>
      </div>
    </footer>
  );
}

/* ===================== Social ikony (inline SVG) ===================== */

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.97a8.16 8.16 0 0 0 4.77 1.52V7.1a4.85 4.85 0 0 1-1.84-.41z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
