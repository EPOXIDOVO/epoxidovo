import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";
import { CursorAura } from "@/components/ui/CursorAura";
import { Toaster } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    default: "Kúpiť materiál",
    template: "%s | EPOXIDOVO",
  },
};

/**
 * Sekcia „Kúpiť materiál" — kalkulátor skladby + košík.
 * CartProvider + interakčná vrstva (CursorAura, Toaster) sú namontované
 * len tu — globálny layout hlavného webu nedotknutý. CursorAura sa dá
 * rovnakým importom nasadiť aj na hlavný web (viď DESIGN_SYSTEM.md).
 */
export default function KupitMaterialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <CursorAura />
      <Toaster />
      {children}
    </CartProvider>
  );
}
