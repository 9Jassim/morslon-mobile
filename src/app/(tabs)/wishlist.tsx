import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ProductGrid } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { fetchProductsByIds } from '@/lib/catalog-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useWishlist } from '@/lib/wishlist-store';

export default function WishlistScreen() {
  const { t } = useI18n();
  const { loading, customer } = useAuth();
  const ids = useWishlist((s) => s.ids);
  const load = useWishlist((s) => s.load);

  // Refresh the id set whenever this tab is shown.
  useEffect(() => {
    if (customer) load();
  }, [customer, load]);

  // Stable, sorted id list keys the query so it refetches when membership changes.
  const idList = useMemo(() => [...ids].sort(), [ids]);

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist-products', idList],
    queryFn: () => fetchProductsByIds(idList),
    enabled: !!customer && idList.length > 0,
  });

  if (loading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" />
      </Screen>
    );
  }
  if (!customer) {
    return <AuthRequired message={t('wishlist.signin')} />;
  }
  if (idList.length > 0 && isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" />
      </Screen>
    );
  }
  if ((data?.length ?? 0) === 0) {
    return (
      <Screen centered>
        <ThemedText>{t('wishlist.empty')}</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <ProductGrid products={data ?? []} />
    </Screen>
  );
}
