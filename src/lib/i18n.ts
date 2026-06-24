import { reloadAppAsync } from 'expo';
import { I18nManager } from 'react-native';
import { create } from 'zustand';

import { getPref, PREF_LOCALE, setPref } from './prefs';

export type Locale = 'en' | 'ar';

/**
 * App translations. General UI strings mirror the website's messages/*.json;
 * content (product/category names) comes from the API's *Ar fields via pick().
 */
const MESSAGES = {
  en: {
    'common.loading': 'Loading…',
    'common.error': 'Something went wrong',
    'common.retry': 'Try again',
    'common.viewAll': 'View all',
    'common.language': 'العربية',

    'tabs.home': 'Home',
    'tabs.categories': 'Categories',
    'tabs.cart': 'Cart',
    'tabs.wishlist': 'Wishlist',
    'tabs.account': 'Account',

    'home.featured': 'Featured',
    'home.discover': 'DISCOVER',
    'home.highlighted': 'Highlighted Products',
    'home.discoverMore': 'Discover More',
    'home.empty': 'Nothing here yet',
    'home.failed': 'Couldn’t load the home page.',

    'search.title': 'Search',
    'search.placeholder': 'Search products…',
    'search.hint': 'Type at least 2 characters to search.',
    'search.none': 'No products found.',

    'product.addToCart': 'Add to cart',
    'product.added': 'Added to cart ✓',
    'product.outOfStock': 'Out of stock',
    'product.inStock': 'In stock',
    'product.available': 'available',
    'product.notFound': 'Product not found.',

    'categories.title': 'Categories',
    'categories.failed': 'Couldn’t load categories.',
    'categories.empty': 'No products in this category yet.',

    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyHint': 'Browse products and add them here.',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Checkout',

    'wishlist.signin': 'Sign in to see your saved products.',
    'wishlist.empty': 'Your wishlist is empty.',

    'account.orders': 'My Orders',
    'account.wallet': 'Wallet',
    'account.loyalty': 'Loyalty & Rewards',
    'account.profile': 'Profile',
    'account.theme': 'Theme',
    'account.language': 'Language',
    'account.logout': 'Log out',

    'auth.signInTitle': 'Sign in to your account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signIn': 'Sign in',
    'auth.required': 'Sign in required',
    'auth.goSignIn': 'Go to sign in',
    'auth.failed': 'Something went wrong. Try again.',

    'orders.title': 'My Orders',
    'orders.none': 'You have no orders yet.',
    'orders.signin': 'Sign in to view your orders.',
    'orders.items': 'Items',
    'orders.subtotal': 'Subtotal',
    'orders.discount': 'Discount',
    'orders.shipping': 'Shipping',
    'orders.total': 'Total',
    'orders.payment': 'Payment',

    'wallet.title': 'Wallet',
    'wallet.balance': 'Balance',
    'wallet.none': 'No transactions yet.',
    'wallet.signin': 'Sign in to view your wallet.',

    'loyalty.title': 'Loyalty',
    'loyalty.points': 'Points balance',
    'loyalty.earned': 'earned all-time',
    'loyalty.none': 'No rewards available.',
    'loyalty.redeemable': 'Redeemable',
    'loyalty.locked': 'Locked',
    'loyalty.signin': 'Sign in to see your points and rewards.',
    'loyalty.cost': 'points',

    'profile.title': 'Profile',
    'profile.first': 'First name',
    'profile.last': 'Last name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.soon': 'Editing your profile is coming soon.',
    'profile.signin': 'Sign in to view your profile.',

    'notifications.title': 'Notifications',
    'notifications.none': 'No notifications yet',
    'notifications.hint': 'Order updates and offers will appear here.',

    'story.viewMore': 'View more',
    'story.addToCart': 'Add to cart',
    'story.added': 'Added',
    'story.soldOut': 'Sold out',
  },
  ar: {
    'common.loading': 'جاري التحميل…',
    'common.error': 'حدث خطأ ما',
    'common.retry': 'حاول مجدداً',
    'common.viewAll': 'عرض الكل',
    'common.language': 'English',

    'tabs.home': 'الرئيسية',
    'tabs.categories': 'الفئات',
    'tabs.cart': 'السلة',
    'tabs.wishlist': 'المفضلة',
    'tabs.account': 'حسابي',

    'home.featured': 'منتجات مميزة',
    'home.discover': 'اكتشف',
    'home.highlighted': 'منتجات بارزة',
    'home.discoverMore': 'اكتشف المزيد',
    'home.empty': 'لا يوجد شيء بعد',
    'home.failed': 'تعذّر تحميل الصفحة الرئيسية.',

    'search.title': 'بحث',
    'search.placeholder': 'ابحث عن منتج…',
    'search.hint': 'اكتب حرفين على الأقل للبحث.',
    'search.none': 'لا توجد منتجات.',

    'product.addToCart': 'أضف إلى السلة',
    'product.added': 'تمت الإضافة ✓',
    'product.outOfStock': 'غير متوفر',
    'product.inStock': 'متوفر',
    'product.available': 'متاح',
    'product.notFound': 'المنتج غير موجود.',

    'categories.title': 'الفئات',
    'categories.failed': 'تعذّر تحميل الفئات.',
    'categories.empty': 'لا توجد منتجات في هذه الفئة بعد.',

    'cart.title': 'السلة',
    'cart.empty': 'سلتك فارغة',
    'cart.emptyHint': 'تصفح المنتجات وأضفها هنا.',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.checkout': 'إتمام الشراء',

    'wishlist.signin': 'سجّل الدخول لرؤية منتجاتك المحفوظة.',
    'wishlist.empty': 'قائمة المفضلة فارغة.',

    'account.orders': 'طلباتي',
    'account.wallet': 'المحفظة',
    'account.loyalty': 'الولاء والمكافآت',
    'account.profile': 'الملف الشخصي',
    'account.theme': 'المظهر',
    'account.language': 'اللغة',
    'account.logout': 'تسجيل الخروج',

    'auth.signInTitle': 'سجّل الدخول إلى حسابك',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.signIn': 'تسجيل الدخول',
    'auth.required': 'تسجيل الدخول مطلوب',
    'auth.goSignIn': 'الذهاب لتسجيل الدخول',
    'auth.failed': 'حدث خطأ ما. حاول مجدداً.',

    'orders.title': 'طلباتي',
    'orders.none': 'ليس لديك طلبات بعد.',
    'orders.signin': 'سجّل الدخول لعرض طلباتك.',
    'orders.items': 'العناصر',
    'orders.subtotal': 'المجموع الفرعي',
    'orders.discount': 'الخصم',
    'orders.shipping': 'الشحن',
    'orders.total': 'الإجمالي',
    'orders.payment': 'الدفع',

    'wallet.title': 'المحفظة',
    'wallet.balance': 'الرصيد',
    'wallet.none': 'لا توجد معاملات بعد.',
    'wallet.signin': 'سجّل الدخول لعرض محفظتك.',

    'loyalty.title': 'الولاء',
    'loyalty.points': 'رصيد النقاط',
    'loyalty.earned': 'مكتسبة إجمالاً',
    'loyalty.none': 'لا توجد مكافآت متاحة.',
    'loyalty.redeemable': 'قابلة للاستبدال',
    'loyalty.locked': 'مقفلة',
    'loyalty.signin': 'سجّل الدخول لرؤية نقاطك ومكافآتك.',
    'loyalty.cost': 'نقطة',

    'profile.title': 'الملف الشخصي',
    'profile.first': 'الاسم الأول',
    'profile.last': 'اسم العائلة',
    'profile.email': 'البريد الإلكتروني',
    'profile.phone': 'رقم الهاتف',
    'profile.soon': 'تعديل الملف الشخصي قريباً.',
    'profile.signin': 'سجّل الدخول لعرض ملفك الشخصي.',

    'notifications.title': 'الإشعارات',
    'notifications.none': 'لا توجد إشعارات بعد',
    'notifications.hint': 'ستظهر هنا تحديثات الطلبات والعروض.',

    'story.viewMore': 'عرض المزيد',
    'story.addToCart': 'أضف إلى السلة',
    'story.added': 'تمت الإضافة',
    'story.soldOut': 'نفد',
  },
} as const;

type Key = keyof typeof MESSAGES.en;

type LocaleState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
};

/**
 * Apply native layout direction for the locale. forceRTL only takes effect after
 * a reload, so we reload when it changes (Instagram-style "restart to apply").
 */
function applyDirection(locale: Locale) {
  const wantRTL = locale === 'ar';
  if (I18nManager.isRTL !== wantRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(wantRTL);
    reloadAppAsync().catch(() => {});
  }
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'en',
  setLocale: (locale) => {
    set({ locale });
    setPref(PREF_LOCALE, locale);
    applyDirection(locale);
  },
  toggle: () => get().setLocale(get().locale === 'en' ? 'ar' : 'en'),
}));

/** Load the persisted locale at boot and align native RTL (may reload once). */
export async function loadPersistedLocale(): Promise<void> {
  const saved = await getPref(PREF_LOCALE);
  if (saved === 'ar' || saved === 'en') {
    useLocaleStore.setState({ locale: saved });
    applyDirection(saved);
  }
}

/** Translation + locale helpers. */
export function useI18n() {
  const locale = useLocaleStore((s) => s.locale);
  const isRTL = locale === 'ar';
  const t = (key: Key) => MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
  /** Pick the localized variant of a content field. */
  const pick = (en: string, ar?: string | null) => (isRTL && ar ? ar : en);
  return { locale, isRTL, t, pick };
}
