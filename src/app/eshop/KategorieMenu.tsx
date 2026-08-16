import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Pás kategórií pod hlavičkou — hover na položku otvorí dropdown
 * s podkategóriami (štýl Epodex). Čisté CSS (group-hover), žiadny JS.
 */

const POLOZKY: {
  label: string;
  href?: string;
  deti?: { label: string; href: string }[];
  coskoro?: boolean;
}[] = [
  {
    label: "Epoxidové a polyuretánové živice 🧪",
    href: "/eshop?skupina=hlavne#katalog",
    deti: [
      { label: "Penetrácie", href: "/eshop?skupina=penetracie#katalog" },
      { label: "Hlavné vrstvy a nátery", href: "/eshop?skupina=hlavne#katalog" },
      { label: "Vrchné laky", href: "/eshop?skupina=laky#katalog" },
      { label: "Chipsy a posypy", href: "/eshop?kat=chipsy#katalog" },
    ],
  },
  {
    label: "Kamenný koberec 🪨",
    href: "/eshop?skupina=kamenny-koberec#katalog",
  },
  {
    label: "Príprava podkladu 🏗️",
    href: "/eshop?skupina=priprava#katalog",
    deti: [
      { label: "Nivelácie", href: "/eshop?kat=nivelacie#katalog" },
      { label: "Potery a opravy betónu", href: "/eshop?kat=potery#katalog" },
      { label: "Vsypy do betónu", href: "/eshop?kat=vsypy#katalog" },
      { label: "Prísady a plnivá", href: "/eshop?skupina=prisady#katalog" },
    ],
  },
  { label: "Náradie 🛠️", href: "/eshop?skupina=naradie#katalog" },
  { label: "Mikrocement 🧊", coskoro: true },
  { label: "Nátery na betón 🎨", coskoro: true },
  { label: "Dekoratívne steny 🖌️", coskoro: true },
];

export function KategorieMenu() {
  return (
    <nav aria-label="Kategórie e-shopu" className="bg-white border-b border-zinc-200 relative z-40">
      <Container size="xl" className="py-2.5">
        <div className="flex flex-nowrap items-center justify-start lg:justify-center gap-x-4 text-[13.5px] overflow-x-auto lg:overflow-x-visible no-scrollbar">
          {POLOZKY.map((p) =>
            p.coskoro ? (
              <span key={p.label} className="font-bold text-zinc-400 select-none cursor-default whitespace-nowrap">
                {p.label}
                <span className="inline-block align-super -ml-0.5 px-1 py-px rounded-full bg-[#f97316] text-white text-[8px] font-bold uppercase leading-none">
                  čoskoro
                </span>
              </span>
            ) : p.deti ? (
              <span key={p.label} className="relative group">
                <a
                  href={p.href}
                  className="inline-flex items-center gap-0.5 font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors whitespace-nowrap py-1.5"
                >
                  {p.label}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:rotate-180 transition-transform" aria-hidden />
                </a>
                {/* dropdown — CSS hover, most cez pt-2 nech pri prejazde nezmizne */}
                <span className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block z-50">
                  <span className="block min-w-56 rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)] py-2">
                    {p.deti.map((d) => (
                      <a
                        key={d.label}
                        href={d.href}
                        className="block px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-[#e3f3fb]/60 hover:text-[#1a8cc4] transition-colors whitespace-nowrap"
                      >
                        {d.label}
                      </a>
                    ))}
                  </span>
                </span>
              </span>
            ) : (
              <a
                key={p.label}
                href={p.href}
                className="font-bold text-zinc-900 hover:text-[#1a8cc4] transition-colors whitespace-nowrap py-1.5"
              >
                {p.label}
              </a>
            ),
          )}
        </div>
      </Container>
    </nav>
  );
}
