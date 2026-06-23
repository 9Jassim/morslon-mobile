import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { fetchCategories } from '@/lib/catalog-api';
import { resolveProductImage } from '@/lib/images';
import type { Category } from '@/lib/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" />
      </Screen>
    );
  }
  if (isError) {
    return (
      <Screen centered style={styles.errorBox}>
        <ThemedText>Couldn’t load categories.</ThemedText>
        <Button title="Retry" onPress={() => refetch()} />
      </Screen>
    );
  }

  const topLevel = (data ?? []).filter((c) => c.level === 0 && c.active);

  return (
    <Screen noPadding>
      <FlatList
        data={topLevel}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.heading}>
            Categories
          </ThemedText>
        }
        renderItem={({ item }) => (
          <CategoryRow
            category={item}
            onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: item.slug } })}
          />
        )}
      />
    </Screen>
  );
}

function CategoryRow({ category, onPress }: { category: Category; onPress: () => void }) {
  const uri = resolveProductImage(category.image);
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.thumb}>
        {uri ? <Image source={{ uri }} style={styles.thumbImg} contentFit="cover" /> : null}
      </View>
      <ThemedText style={styles.rowText}>{category.nameEn}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  errorBox: { gap: Spacing.three },
  list: { padding: Spacing.three, paddingBottom: TAB_BAR_CLEARANCE, gap: Spacing.two },
  heading: { marginBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f3' },
  thumbImg: { width: '100%', height: '100%' },
  rowText: { fontSize: 16, fontWeight: '500' },
});
