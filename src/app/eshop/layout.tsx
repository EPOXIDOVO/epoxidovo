import { CursorAura } from "@/components/ui/CursorAura";

/**
 * Katalóg zdieľa interakčný podpis e-shopu (cursor aura).
 * Vypína sa sám na touch / reduced-motion — viď DESIGN_SYSTEM.md.
 */
export default function EshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorAura />
      {children}
    </>
  );
}
