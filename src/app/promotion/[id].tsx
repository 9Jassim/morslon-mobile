import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProductGrid } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchPromotion } from '@/lib/catalog-api';
import { useI18n } from '@/lib/i18n';
import { resolveProductImage } from '@/lib/images';
import { BRAND } from '@/lib/theme-colors';

export default function PromotionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { pick } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => fetchPromotion(id),
    enabled: !!id,
  });

  const title = data ? pick(data.nameEn, data.nameAr) : '';
  const hero = resolveProductImage(data?.image);
  const desc = data ? pick(data.descEn ?? '', data.descAr ?? '') : '';

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" color={BRAND.accent} />
        </Screen>
      ) : isError || !data ? (
        <Screen centered>
          <ThemedText>—</ThemedText>
        </Screen>
      ) : (
        <ProductGrid
          products={data.products}
          header={
            <View style={styles.header}>
              {hero ? (
                <View style={[styles.heroWrap, { backgroundColor: theme.backgroundElement }]}>
                  <Image source={{ uri: hero }} style={styles.fill} contentFit="cover" transition={150} />
                </View>
              ) : null}
              <ThemedText type="title">{title}</ThemedText>
              {desc ? (
                <ThemedText themeColor="textSecondary" style={styles.desc}>
                  {desc}
                </ThemedText>
              ) : null}
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  header: { gap: Spacing.two, paddingHorizontal: Spacing.half, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  heroWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: Radius.md, overflow: 'hidden' },
  desc: { lineHeight: 22 },
});
