/**
 * Shared API types — mirror the Morslon backend response shapes.
 * Keep in sync with the backend; these are the contracts the screens rely on.
 */

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

/** GET /api/mobile/config — app bootstrap payload. */
export type AppConfig = {
  app: {
    minVersion: string;
    latestVersion: string;
    maintenance: boolean;
    iosUrl: string;
    androidUrl: string;
  };
  store: {
    nameEn: string;
    nameAr: string;
    email: string;
    phone: string;
    whatsapp: string;
    logoUrl: string;
  };
  currency: {
    current: { code: string; rate: number } | null;
    all: { code: string; rate: number }[];
  };
};

/** A product as returned by GET /api/store/products. */
export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  detailImages: string[];
  category: string;
  featured: boolean;
  createdAt: string;
  hasVariants: boolean;
  reviewCount: number;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  hasMore: boolean;
};
