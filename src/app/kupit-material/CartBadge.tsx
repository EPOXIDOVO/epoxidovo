"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

/** Plávajúci košík — viditeľný v celej sekcii /kupit-material. */
export function CartBadge() {
  const { count, subtotal } = useCart();
  if (count === 0) return null;
  return (
    <Link
      href="/kupit-material/kosik"
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#ea580c] text-white font-bold shadow-[0_14px_40px_rgba(249,115,22,0.55)] hover:bg-[#c2410c] hover:-translate-y-0.5 transition-all"
    >
      <ShoppingCart className="w-5 h-5" aria-hidden />
      Košík ({count}) · {subtotal.toFixed(2).replace(".", ",")} €
    </Link>
  );
}
