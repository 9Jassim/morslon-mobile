import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ProductGrid } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { fetchWishlist } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

export default function WishlistScreen() {
  const { t } = useI18n();
  const { loading, customer } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    enabled: !!customer,
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
  if (isLoading) {
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
