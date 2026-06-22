import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { fetchConfig, fetchProducts } from '@/lib/catalog-api';
import { productThumbnail } from '@/lib/images';
import type { Product } from '@/lib/types';

export default function HomeScreen() {
  const config = useQuery({ queryKey: ['config'], queryFn: fetchConfig });
  const featured = useQuery({
    queryKey: ['products', { featured: true }],
    queryFn: () => fetchProducts({ limit: 10 }),
  });

  const currency = config.data?.currency.current?.code ?? 'BHD';

  if (featured.isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" />
      </Screen>
    );
  }

  if (featured.isError) {
    return (
      <Screen centered style={styles.errorBox}>
        <ThemedText>Couldn’t load products.</ThemedText>
        <Button title="Retry" onPress={() => featured.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <FlatList
        data={featured.data?.products ?? []}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">{config.data?.store.nameEn ?? 'Morslon'}</ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              Featured products
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} currency={currency} />}
      />
    </Screen>
  );
}

function ProductCard({ product, currency }: { product: Product; currency: string }) {
  const uri = productThumbnail(product.images);
  return (
    <View style={styles.card}>
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
    </View>
  );
}

const GAP = Spacing.three;

const styles = StyleSheet.create({
  errorBox: { gap: Spacing.three },
  list: { padding: GAP, gap: GAP },
  row: { gap: GAP },
  header: { paddingVertical: Spacing.three, gap: Spacing.one },
  subtitle: { opacity: 0.7 },
  card: { flex: 1, gap: Spacing.one },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f3',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: '#e0e1e6' },
  name: { minHeight: 34 },
  price: { fontWeight: '700', color: '#208AEF' },
});
