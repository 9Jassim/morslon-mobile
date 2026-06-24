import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchProduct } from '@/lib/catalog-api';
import { useI18n } from '@/lib/i18n';
import { resolveProductImage } from '@/lib/images';
import { useCart } from '@/lib/cart-store';
import { BRAND } from '@/lib/theme-colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t, pick } = useI18n();
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
        <ActivityIndicator size="large" color={BRAND.accent} />
      </Screen>
    );
  }
  if (isError || !product) {
    return (
      <Screen centered>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <ThemedText>{t('product.notFound')}</ThemedText>
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
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroWrap, { backgroundColor: theme.backgroundElement }]}>
          {hero ? <Image source={{ uri: hero }} style={styles.hero} contentFit="cover" transition={200} /> : null}
          {onSale ? (
            <View style={styles.saleTag}>
              <ThemedText style={styles.saleTagText}>SALE</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {product.category ? (
            <ThemedText style={styles.eyebrow}>{product.category.toUpperCase()}</ThemedText>
          ) : null}
          <ThemedText type="title">{pick(product.nameEn, product.nameAr)}</ThemedText>

          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>
              {product.price.toFixed(3)} <ThemedText style={styles.cur}>BHD</ThemedText>
            </ThemedText>
            {onSale ? (
              <ThemedText themeColor="textSecondary" style={styles.compare}>
                {product.comparePrice!.toFixed(3)}
              </ThemedText>
            ) : null}
          </View>

          <View style={[styles.stockPill, { backgroundColor: outOfStock ? '#d930251a' : BRAND.tint }]}>
            <View style={[styles.dot, { backgroundColor: outOfStock ? '#d93025' : BRAND.accent }]} />
            <ThemedText style={[styles.stockText, { color: outOfStock ? '#d93025' : BRAND.accent }]}>
              {outOfStock ? t('product.outOfStock') : `${t('product.inStock')} · ${product.stock} ${t('product.available')}`}
            </ThemedText>
          </View>

          {pick(product.descriptionEn, product.descriptionAr) ? (
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {pick(product.descriptionEn, product.descriptionAr)}
            </ThemedText>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Button
          title={added ? t('product.added') : outOfStock ? t('product.outOfStock') : t('product.addToCart')}
          onPress={onAdd}
          disabled={outOfStock}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: Spacing.six },
  heroWrap: { width: '100%', aspectRatio: 1 },
  hero: { width: '100%', height: '100%' },
  saleTag: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    backgroundColor: BRAND.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  saleTagText: { fontFamily: AppFonts.bodyBold, fontSize: 11, letterSpacing: 1.5, color: '#fff' },
  body: { padding: Spacing.four, gap: Spacing.two },
  eyebrow: { fontFamily: AppFonts.bodyBold, fontSize: 11, letterSpacing: 2, color: BRAND.accent },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.three, marginTop: Spacing.one },
  price: { fontFamily: AppFonts.displayBold, fontSize: 26, color: BRAND.accent },
  cur: { fontFamily: AppFonts.body, fontSize: 14, color: BRAND.accent },
  compare: { fontSize: 16, textDecorationLine: 'line-through' },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: Spacing.one,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontFamily: AppFonts.bodySemibold, fontSize: 12 },
  description: { marginTop: Spacing.three, lineHeight: 23 },
  footer: {
    padding: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
