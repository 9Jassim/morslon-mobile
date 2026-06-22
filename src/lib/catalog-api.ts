import { api } from "./api";
import type { AppConfig, ProductsResponse } from "./types";

/** GET /api/mobile/config — public app bootstrap payload. */
export function fetchConfig(): Promise<AppConfig> {
  return api<AppConfig>("/api/mobile/config", { auth: false });
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
