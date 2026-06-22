import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View, type ListRenderItem } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { productThumbnail } from '@/lib/images';
import type { Product } from '@/lib/types';

const GAP = Spacing.three;

export function ProductCard({
  product,
  currency = 'BHD',
}: {
  product: Product;
  currency?: string;
}) {
  const router = useRouter();
  const uri = productThumbnail(product.images);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
      <View style={styles.imageWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
      </View>
      <ThemedText type="small" numberOfLines={2} style={styles.name}>
        {product.nameEn}
      </ThemedText>
      <ThemedText style={styles.price}>
        {product.price.toFixed(3)} {currency}
      </ThemedText>
    </TouchableOpacity>
  );
}

/** Two-column product grid. Pass a header to render above the list. */
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
  const renderItem: ListRenderItem<Product> = ({ item }) => (
    <ProductCard product={item} currency={currency} />
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
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: GAP, gap: GAP },
  row: { gap: GAP },
  card: { flex: 1, gap: Spacing.one, maxWidth: '50%' },
  imageWrap: { aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f3' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: '#e0e1e6' },
  name: { minHeight: 34 },
  price: { fontWeight: '700', color: '#208AEF' },
});
