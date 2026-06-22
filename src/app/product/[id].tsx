import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { fetchProduct } from '@/lib/catalog-api';
import { resolveProductImage } from '@/lib/images';
import { useCart } from '@/lib/cart-store';
import { BRAND } from '@/lib/theme-colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Screen centered>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <ActivityIndicator size="large" />
      </Screen>
    );
  }
  if (isError || !product) {
    return (
      <Screen centered>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <ThemedText>Product not found.</ThemedText>
      </Screen>
    );
  }

  const hero = resolveProductImage(product.images?.[0]);
  const onSale = product.comparePrice != null && product.comparePrice > product.price;
  const outOfStock = product.stock <= 0;

  function onAdd() {
    if (!product) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <View style={styles.fill}>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          {hero ? <Image source={{ uri: hero }} style={styles.hero} contentFit="cover" /> : null}
        </View>

        <View style={styles.body}>
          <ThemedText type="title">{product.nameEn}</ThemedText>

          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>{product.price.toFixed(3)} BHD</ThemedText>
            {onSale ? (
              <ThemedText style={styles.compare}>{product.comparePrice!.toFixed(3)}</ThemedText>
            ) : null}
          </View>

          <ThemedText type="small" style={outOfStock ? styles.outOfStock : styles.inStock}>
            {outOfStock ? 'Out of stock' : `In stock (${product.stock})`}
          </ThemedText>

          {product.descriptionEn ? (
            <ThemedText style={styles.description}>{product.descriptionEn}</ThemedText>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={added ? 'Added ✓' : outOfStock ? 'Out of stock' : 'Add to cart'}
          onPress={onAdd}
          disabled={outOfStock}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: Spacing.six },
  heroWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f0f0f3' },
  hero: { width: '100%', height: '100%' },
  body: { padding: Spacing.four, gap: Spacing.two },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  price: { fontSize: 22, fontWeight: '800', color: BRAND.primary },
  compare: { fontSize: 16, color: '#9aa0a6', textDecorationLine: 'line-through' },
  inStock: { color: '#1a7f37' },
  outOfStock: { color: '#d93025' },
  description: { marginTop: Spacing.two, lineHeight: 22, opacity: 0.85 },
  footer: {
    padding: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e1e6',
    backgroundColor: '#fff',
  },
});
