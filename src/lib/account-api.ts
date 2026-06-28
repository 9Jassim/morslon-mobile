import { api } from "./api";
import { fetchProductsByIds } from "./catalog-api";
import type { Loyalty, Order, Product, Wallet } from "./types";

/** GET /api/orders — current customer's orders (auth required). */
export function fetchOrders(): Promise<Order[]> {
  return api<Order[]>("/api/orders");
}

/** GET /api/store/wallet — balance + transactions (auth required). */
export function fetchWallet(): Promise<Wallet> {
  return api<Wallet>("/api/store/wallet");
}

/** GET /api/store/loyalty — points balance + rewards (auth required). */
export function fetchLoyalty(): Promise<Loyalty> {
  return api<Loyalty>("/api/store/loyalty");
}

/** GET /api/store/wishlist — returns product ids, then hydrates them to products. */
export async function fetchWishlist(): Promise<Product[]> {
  const ids = await fetchWishlistIds();
  return fetchProductsByIds(ids);
}

/** GET /api/store/wishlist — just the wishlisted product ids. */
export async function fetchWishlistIds(): Promise<string[]> {
  const res = await api<{ ids: string[] }>("/api/store/wishlist");
  return res.ids ?? [];
}

/** POST /api/store/wishlist — toggle a product; returns the new membership. */
export async function toggleWishlist(productId: string): Promise<boolean> {
  const res = await api<{ ok: boolean; action?: 'added' | 'removed' }>("/api/store/wishlist", {
    method: "POST",
    body: { productId },
  });
  return res.ok && res.action === 'added';
}
