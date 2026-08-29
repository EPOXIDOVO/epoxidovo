"use client";

/**
 * FÁZA 3 — košík: React context + localStorage persistencia.
 *
 * Položka nesie len productId + qty + metadáta (skladba, odtieň) — CENY SA
 * V KOŠÍKU NIKDY neberú z localStorage pri objednávke; server ich pri
 * POST /api/order prepočíta z dát podľa productId (klientovi sa neverí).
 */

import * as React from "react";
import { getProduct, type Product } from "@/data/products";

export interface CartItem {
  productId: string;
  qty: number;
  /** Názov skladby, z ktorej položka prišla (štítok v košíku). */
  systemLabel?: string;
  systemId?: string;
  /** Zvolený odtieň (RAL). */
  color?: string;
}

export interface CartLine extends CartItem {
  product: Product;
  lineTotal: number | null; // null = na dopyt
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "add"; items: CartItem[] }
  | { type: "setQty"; productId: string; qty: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] };

const STORAGE_KEY = "epoxidovo-kosik-v1";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const items = [...state.items];
      for (const incoming of action.items) {
        const i = items.findIndex(
          (x) => x.productId === incoming.productId && x.color === incoming.color,
        );
        if (i >= 0) {
          items[i] = { ...items[i], qty: items[i].qty + incoming.qty };
        } else {
          items.push(incoming);
        }
      }
      return { items };
    }
    case "setQty":
      return {
        items: state.items
          .map((x) =>
            x.productId === action.productId
              ? { ...x, qty: Math.max(0, Math.floor(action.qty)) }
              : x,
          )
          .filter((x) => x.qty > 0),
      };
    case "remove":
      return { items: state.items.filter((x) => x.productId !== action.productId) };
    case "clear":
      return { items: [] };
  }
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  /** Súčet naceniteľných položiek. */
  subtotal: number;
  /** true = niektorá položka je „na dopyt". */
  hasOnRequest: boolean;
  add: (items: CartItem[]) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { items: [] });
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({
            type: "hydrate",
            items: parsed.filter(
              (x) => typeof x?.productId === "string" && getProduct(x.productId),
            ),
          });
        }
      }
    } catch {
      /* poškodený localStorage — začíname s prázdnym košíkom */
    }
    hydrated.current = true;
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      // Okamžitý signál pre EshopHeader (badge count) — bez 1,5 s lagu.
      window.dispatchEvent(new Event("epx-cart-changed"));
    } catch {
      /* quota / private mode */
    }
  }, [state.items]);

  const lines: CartLine[] = state.items
    .map((item) => {
      const product = getProduct(item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
        lineTotal:
          product.priceRetail != null
            ? Math.round(product.priceRetail * item.qty * 100) / 100
            : null,
      };
    })
    .filter((x): x is CartLine => x != null);

  const subtotal =
    Math.round(
      lines.reduce((sum, l) => sum + (l.lineTotal ?? 0), 0) * 100,
    ) / 100;

  const value: CartContextValue = {
    items: state.items,
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal,
    hasOnRequest: lines.some((l) => l.lineTotal == null),
    add: (items) => dispatch({ type: "add", items }),
    setQty: (productId, qty) => dispatch({ type: "setQty", productId, qty }),
    remove: (productId) => dispatch({ type: "remove", productId }),
    clear: () => dispatch({ type: "clear" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart musí byť vnútri <CartProvider>");
  return ctx;
}
