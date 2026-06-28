import { api } from "./api";
import { setBrandFromConfig } from "./theme-colors";
import type { AppConfig, Category, HomeData, Product, ProductsResponse, PromotionDetail, StorePagesData } from "./types";

/** GET /api/mobile/config — public app bootstrap payload. */
export async function fetchConfig(): Promise<AppConfig> {
  const config = await api<AppConfig>("/api/mobile/config", { auth: false });
  setBrandFromConfig(config.theme);
  return config;
}

/** GET /api/mobile/home — banners + home sections (public). */
export function fetchHome(): Promise<HomeData> {
  return api<HomeData>("/api/mobile/home", { auth: false });
}

/** GET /api/categories — nested category tree (public). */
export function fetchCategories(): Promise<Category[]> {
  return api<Category[]>("/api/categories", { auth: false });
}

/** GET /api/mobile/pages — store info pages + contact details (public). */
export function fetchStorePages(): Promise<StorePagesData> {
  return api<StorePagesData>("/api/mobile/pages", { auth: false });
}

/** GET /api/promotions/:id — promotion detail + products (public). */
export function fetchPromotion(id: string): Promise<PromotionDetail> {
  return api<PromotionDetail>(`/api/promotions/${encodeURIComponent(id)}`, { auth: false });
}

/** GET /api/products?ids= — fetch one product by id (public). */
export async function fetchProduct(id: string): Promise<Product | null> {
  const list = await api<Product[]>(`/api/products?ids=${encodeURIComponent(id)}`, { auth: false });
  return list[0] ?? null;
}

/** GET /api/products?ids= — fetch several products by id (used by wishlist). */
export function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return api<Product[]>(`/api/products?ids=${ids.map(encodeURIComponent).join(",")}`, { auth: false });
}

/** GET /api/store/products — paginated catalog (public). */
export function fetchProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
} = {}): Promise<ProductsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.category) qs.set("category", params.category);
  if (params.search) qs.set("search", params.search);
  const suffix = qs.toString() ? `?${qs}` : "";
  return api<ProductsResponse>(`/api/store/products${suffix}`, { auth: false });
}
