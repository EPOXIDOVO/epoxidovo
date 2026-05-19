import Link from "next/link";
import { ArrowLeft, Home, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="min-h-[80vh] flex items-center bg-[var(--color-bg-soft)]">
      <Container size="md" className="py-20 text-center">
        <div className="text-[120px] md:text-[180px] font-extrabold tracking-tight leading-none text-[#3db6e8]">
          404
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
          Táto stránka neexistuje
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--color-fg-muted)] max-w-lg mx-auto leading-relaxed">
          Buď je adresa zlá, alebo sme stránku presunuli. Skús sa vrátiť na úvod
          alebo nám zavolaj — radi pomôžeme.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#3db6e8] text-white font-semibold text-sm hover:bg-[#1a8cc4] shadow-[0_10px_30px_rgba(61,182,232,0.45)] transition-all"
          >
            <Home className="w-4 h-4" aria-hidden />
            Späť na úvod
          </Link>
          <a
            href={`tel:${SITE.contact.phoneRaw}`}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[var(--color-fg)] font-semibold text-sm border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            <Phone className="w-4 h-4" aria-hidden />
            {SITE.contact.phone}
          </a>
        </div>
        <Link
          href="javascript:history.back()"
          className="mt-8 inline-flex items-center gap-2 text-sm text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Vrátiť sa späť
        </Link>
      </Container>
    </section>
  );
}
