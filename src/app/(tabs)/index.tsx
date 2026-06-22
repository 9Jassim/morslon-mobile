import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';

import { ProductGrid } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { fetchConfig, fetchProducts } from '@/lib/catalog-api';

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
      <ProductGrid
        products={featured.data?.products ?? []}
        currency={currency}
        header={
          <View style={styles.header}>
            <ThemedText type="title">Featured</ThemedText>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorBox: { gap: Spacing.three },
  header: { paddingVertical: Spacing.three, gap: Spacing.one },
});
