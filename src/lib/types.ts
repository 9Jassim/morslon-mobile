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

/** A product as returned by GET /api/store/products (and /api/products?ids=). */
export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  detailImages?: string[];
  category: string;
  featured: boolean;
  createdAt: string;
  hasVariants?: boolean;
  reviewCount?: number;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  page: number;
  hasMore: boolean;
};

/** GET /api/categories — nested category tree. */
export type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  level: number;
  active: boolean;
  children?: Category[];
};

/** GET /api/orders — one order in the customer's list. */
export type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

/** GET /api/store/wallet */
export type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
};

export type Wallet = {
  balance: number;
  active: boolean;
  transactions: WalletTransaction[];
};

/** GET /api/store/loyalty */
export type LoyaltyReward = {
  id: string;
  nameEn: string;
  pointsCost: number;
  rewardType: string;
  rewardValue: number;
  canAfford?: boolean;
};

export type Loyalty = {
  balance: number;
  totalEarned: number;
  totalRedeemed?: number;
  programActive?: boolean;
  rewards: LoyaltyReward[];
};
