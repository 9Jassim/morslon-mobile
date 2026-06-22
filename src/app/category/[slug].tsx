import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { ProductGrid } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { fetchProducts } from '@/lib/catalog-api';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const title = slug ? slug.replace(/-/g, ' ') : 'Category';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', { category: slug }],
    queryFn: () => fetchProducts({ category: slug, limit: 50 }),
    enabled: !!slug,
  });

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" />
        </Screen>
      ) : isError ? (
        <Screen centered>
          <ThemedText>Couldn’t load products.</ThemedText>
          <Button title="Retry" onPress={() => refetch()} />
        </Screen>
      ) : (data?.products.length ?? 0) === 0 ? (
        <Screen centered>
          <ThemedText>No products in this category yet.</ThemedText>
        </Screen>
      ) : (
        <ProductGrid products={data?.products ?? []} />
      )}
    </Screen>
  );
}
