import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: {
    default: "Kúpiť materiál",
    template: "%s | EPOXIDOVO",
  },
};

/**
 * Sekcia „Kúpiť materiál" — kalkulátor skladby + košík.
 * CartProvider je namontovaný len tu (globálny layout nedotknutý).
 */
export default function KupitMaterialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
