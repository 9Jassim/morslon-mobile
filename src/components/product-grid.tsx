import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-store';
import { useI18n } from '@/lib/i18n';
import { productThumbnail } from '@/lib/images';
import { BRAND } from '@/lib/theme-colors';
import { useWishlist } from '@/lib/wishlist-store';
import type { Product } from '@/lib/types';

const SALE_RED = '#E8543B';

const GAP = Spacing.three;

/** Minimal product shape a card needs (full Product is assignable). */
export type CardProduct = Pick<Product, 'id' | 'nameEn' | 'nameAr' | 'price' | 'comparePrice' | 'images'> & {
  stock?: number;
  reviewCount?: number;
};

export function ProductCard({
  product,
  currency = 'BHD',
  index = 0,
  width,
}: {
  product: CardProduct;
  currency?: string;
  index?: number;
  /** Fixed width for horizontal rails; omit for flex grid cells. */
  width?: number;
}) {
  const router = useRouter();
  const theme = useTheme();
  const { pick, t } = useI18n();
  const { customer } = useAuth();
  const addToCart = useCart((s) => s.add);
  const inWishlist = useWishlist((s) => s.ids.has(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const [added, setAdded] = useState(false);

  const uri = productThumbnail(product.images);
  const onSale = product.comparePrice != null && product.comparePrice > product.price;
  const discount = onSale
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;
  const outOfStock = product.stock === 0;
  const reviews = product.reviewCount ?? 0;

  function onHeart() {
    if (!customer) {
      router.push('/account');
      return;
    }
    toggleWish(product.id);
  }

  function onAdd() {
    if (outOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 55).springify().damping(18)}
      style={width != null ? { width } : styles.cell}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.cardPressed,
        ]}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
        <View style={[styles.imageWrap, { backgroundColor: theme.backgroundElement }]}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} contentFit="cover" transition={200} />
          ) : null}

          {discount > 0 ? (
            <View style={styles.discountTag}>
              <ThemedText style={styles.discountText}>-{discount}%</ThemedText>
            </View>
          ) : null}

          <Pressable style={[styles.heart, { backgroundColor: theme.surface }]} hitSlop={6} onPress={onHeart}>
            <Ionicons
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={16}
              color={inWishlist ? SALE_RED : theme.textSecondary}
            />
          </Pressable>

          {outOfStock ? (
            <View style={styles.oosOverlay}>
              <View style={styles.oosPill}>
                <ThemedText style={styles.oosText}>{t('product.outOfStock')}</ThemedText>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.meta}>
          <ThemedText type="small" numberOfLines={2} style={styles.name}>
            {pick(product.nameEn, product.nameAr)}
          </ThemedText>

          {reviews > 0 ? (
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={10} color={s <= 4 ? '#F5A623' : theme.border} />
              ))}
              <ThemedText type="small" themeColor="textSecondary" style={styles.reviewCount}>
                ({reviews})
              </ThemedText>
            </View>
          ) : null}

          <View style={[styles.priceRow, { borderTopColor: theme.border }]}>
            <View style={styles.priceCol}>
              <ThemedText style={[styles.price, onSale && styles.priceSale]}>
                {product.price.toFixed(3)} <ThemedText style={[styles.cur, onSale && styles.curSale]}>{currency}</ThemedText>
              </ThemedText>
              {onSale ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.compare}>
                  {product.comparePrice!.toFixed(3)}
                </ThemedText>
              ) : null}
            </View>
            <Pressable
              style={[styles.addBtn, added && styles.addBtnAdded, outOfStock && styles.addBtnDisabled]}
              hitSlop={6}
              disabled={outOfStock}
              onPress={onAdd}>
              <Ionicons name={added ? 'checkmark' : 'bag-add'} size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Two-column premium product grid. Pass a header to render above the list. */
export function ProductGrid({
  products,
  currency,
  header,
  onEndReached,
}: {
  products: CardProduct[];
  currency?: string;
  header?: React.ReactElement;
  onEndReached?: () => void;
}) {
  const renderItem: ListRenderItem<CardProduct> = ({ item, index }) => (
    <ProductCard product={item} currency={currency} index={index} />
  );
  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      renderItem={renderItem}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: GAP, paddingTop: GAP, paddingBottom: TAB_BAR_CLEARANCE, gap: GAP },
  row: { gap: GAP },
  cell: { flex: 1, maxWidth: '50%' },
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    // soft depth
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  imageWrap: { aspectRatio: 1, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  discountTag: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    backgroundColor: SALE_RED,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountText: { fontFamily: AppFonts.bodyBold, fontSize: 11, color: '#fff' },
  heart: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  oosOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  oosPill: { backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  oosText: { fontFamily: AppFonts.bodyBold, fontSize: 11, color: '#fff' },
  meta: { padding: Spacing.two, gap: Spacing.one },
  name: { minHeight: 34, lineHeight: 17 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  reviewCount: { marginLeft: 3, fontSize: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  priceCol: { flex: 1 },
  price: { fontFamily: AppFonts.displayBold, fontSize: 16, color: BRAND.accent },
  priceSale: { color: SALE_RED },
  cur: { fontFamily: AppFonts.body, fontSize: 11, color: BRAND.accent },
  curSale: { color: SALE_RED },
  compare: { textDecorationLine: 'line-through', fontSize: 11 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: BRAND.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnAdded: { backgroundColor: '#1a7f37' },
  addBtnDisabled: { opacity: 0.35 },
});
