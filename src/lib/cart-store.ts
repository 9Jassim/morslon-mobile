import { create } from "zustand";
import type { Product } from "./types";

export type CartItem = {
  productId: string;
  nameEn: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

/**
 * Local, in-memory cart (mirrors the website's Zustand cart). Guests get a
 * working cart immediately; server-side cart sync for logged-in users can be
 * layered on later via /api/store/cart.
 */
export const useCart = create<CartState>((set, get) => ({
  items: [],

  add: (product, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        const quantity = Math.min(existing.quantity + qty, product.stock);
        return {
          items: state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity } : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            nameEn: product.nameEn,
            price: product.price,
            image: product.images?.[0] ?? null,
            quantity: Math.min(qty, product.stock),
            stock: product.stock,
          },
        ],
      };
    }),

  remove: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  setQty: (productId, qty) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock)) } : i,
        )
        .filter((i) => i.quantity > 0),
    })),

  clear: () => set({ items: [] }),

  count: () => get().items.reduce((n, i) => n + i.quantity, 0),
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
