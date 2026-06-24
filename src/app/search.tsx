import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProductGrid } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { fetchProducts } from '@/lib/catalog-api';
import { useI18n } from '@/lib/i18n';

export default function SearchScreen() {
  const { t } = useI18n();
  const [term, setTerm] = useState('');
  const query = term.trim();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { search: query }],
    queryFn: () => fetchProducts({ search: query, limit: 50 }),
    enabled: query.length >= 2,
  });

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: t('search.title') }} />
      <View style={styles.searchBar}>
        <Input
          placeholder={t('search.placeholder')}
          autoFocus
          autoCapitalize="none"
          returnKeyType="search"
          value={term}
          onChangeText={setTerm}
        />
      </View>

      {query.length < 2 ? (
        <View style={styles.center}>
          <ThemedText type="small" style={styles.dim}>
            {t('search.hint')}
          </ThemedText>
        </View>
      ) : isLoading || isFetching ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (data?.products.length ?? 0) === 0 ? (
        <View style={styles.center}>
          <ThemedText>{t('search.none')}</ThemedText>
        </View>
      ) : (
        <ProductGrid products={data?.products ?? []} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: { padding: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  dim: { opacity: 0.6 },
});
