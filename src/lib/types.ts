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
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
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

/** GET /api/mobile/home — home screen content. */
export type HomeBanner = {
  id: string;
  image: string;
  link: string | null;
  titleEn: string;
  subtitleEn: string | null;
  slides?: { image: string; link?: string }[] | null;
};

export type HomeCategory = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  image: string | null;
};

export type HighlightProduct = {
  id: string;
  nameEn: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
};

export type HomeHighlight = {
  id: string;
  titleEn: string;
  titleAr: string;
  thumbnail: string;
  mediaType: 'video' | 'embed' | string;
  mediaUrl: string;
  ctaLink: string | null;
  productId: string | null;
  product: HighlightProduct | null;
};

export type HomePopup = {
  id: string;
  type: string;
  titleEn: string;
  messageEn: string;
  ctaTextEn: string | null;
  ctaLink: string | null;
  dismissable: boolean;
};

/** Minimal product shape used in home rails. */
export type HomeProduct = Pick<
  Product,
  'id' | 'nameEn' | 'nameAr' | 'slug' | 'price' | 'comparePrice' | 'stock' | 'images' | 'category'
>;

export type HomeSectionItem = { image?: string; link?: string; titleEn?: string; titleAr?: string };

export type HomeSection = {
  id: string;
  type: 'PRODUCTS' | 'BANNER_CAROUSEL' | 'POSTER_GRID';
  showTitle: boolean;
  nameEn: string;
  nameAr: string;
  products?: HomeProduct[];
  items?: HomeSectionItem[];
};

export type HomeCategorySection = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  products: HomeProduct[];
};

export type HomeData = {
  hero: HomeBanner[];
  promo: HomeBanner[];
  mid: HomeBanner[];
  discover: HomeBanner[];
  promoCollection: HomeBanner[];
  categories: HomeCategory[];
  categorySections: HomeCategorySection[];
  highlights: HomeHighlight[];
  popups: HomePopup[];
  sections: HomeSection[];
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
