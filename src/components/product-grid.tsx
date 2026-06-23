import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { productThumbnail } from '@/lib/images';
import { BRAND } from '@/lib/theme-colors';
import type { Product } from '@/lib/types';

const GAP = Spacing.three;

export function ProductCard({
  product,
  currency = 'BHD',
  index = 0,
}: {
  product: Product;
  currency?: string;
  index?: number;
}) {
  const router = useRouter();
  const theme = useTheme();
  const uri = productThumbnail(product.images);
  const onSale = product.comparePrice != null && product.comparePrice > product.price;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 55).springify().damping(18)} style={styles.cell}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
        <View style={[styles.imageWrap, { backgroundColor: theme.backgroundElement }]}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} contentFit="cover" transition={200} />
          ) : null}
          {onSale ? (
            <View style={styles.saleTag}>
              <ThemedText style={styles.saleTagText}>SALE</ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.meta}>
          <ThemedText type="small" numberOfLines={2} themeColor="textSecondary" style={styles.name}>
            {product.nameEn}
          </ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>
              {product.price.toFixed(3)} <ThemedText style={styles.cur}>{currency}</ThemedText>
            </ThemedText>
            {onSale ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.compare}>
                {product.comparePrice!.toFixed(3)}
              </ThemedText>
            ) : null}
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
  products: Product[];
  currency?: string;
  header?: React.ReactElement;
  onEndReached?: () => void;
}) {
  const renderItem: ListRenderItem<Product> = ({ item, index }) => (
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
  list: { paddingHorizontal: GAP, paddingBottom: TAB_BAR_CLEARANCE, gap: GAP },
  row: { gap: GAP },
  cell: { flex: 1, maxWidth: '50%' },
  card: { gap: Spacing.two },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  imageWrap: {
    aspectRatio: 0.85,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  saleTag: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    backgroundColor: BRAND.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  saleTagText: { fontFamily: AppFonts.bodyBold, fontSize: 10, letterSpacing: 1, color: '#fff' },
  meta: { gap: 2, paddingHorizontal: 2 },
  name: { minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  price: { fontFamily: AppFonts.displayBold, fontSize: 16, color: BRAND.accent },
  cur: { fontFamily: AppFonts.body, fontSize: 11, color: BRAND.accent },
  compare: { textDecorationLine: 'line-through' },
});
