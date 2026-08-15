import { CursorAura } from "@/components/ui/CursorAura";
import { MedvedB2B } from "@/components/eshop/MedvedB2B";

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
      <MedvedB2B />
      {children}
    </>
  );
}
