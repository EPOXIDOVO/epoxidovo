import * as React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";

/**
 * Modrá info karta na /kontakt — telefón / email / adresa.
 * 1:1 podľa pôvodného webu.
 */
export function ContactInfo() {
  return (
    <div>
      {/* Modrá karta s kontaktmi */}
      <div className="rounded-2xl bg-[#3db6e8] text-white p-7 md:p-8 space-y-6 shadow-[0_10px_30px_rgba(61,182,232,0.25)]">
        <div className="flex items-start gap-4">
          <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15">
            <Phone className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/70 mb-1">
              Telefón
            </div>
            <a
              href={`tel:${SITE.contact.phoneRaw}`}
              className="text-base md:text-lg font-semibold hover:underline"
            >
              {SITE.contact.phone}
            </a>
          </div>
        </div>

        <div className="h-px bg-white/15" />

        <div className="flex items-start gap-4">
          <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15">
            <Mail className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/70 mb-1">
              E-mail
            </div>
            <a
              href={`mailto:${SITE.contact.email}`}
              className="text-base md:text-lg font-semibold hover:underline break-all"
            >
              {SITE.contact.email}
            </a>
          </div>
        </div>

        <div className="h-px bg-white/15" />

        <div className="flex items-start gap-4">
          <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15">
            <MapPin className="w-4 h-4" aria-hidden />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/70 mb-1">
              Adresa
            </div>
            <div className="text-base font-semibold leading-relaxed">
              {SITE.legalName}
              <br />
              {SITE.address.street}
              <br />
              {SITE.address.postalCode} {SITE.address.city}
              <br />
              <span className="text-sm font-medium text-white/85">
                IČO: {SITE.business.icoRaw}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
