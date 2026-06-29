import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { StatusBadge } from '@/components/status-badge';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BRAND } from '@/lib/theme-colors';
import { fetchOrders } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import type { Order } from '@/lib/types';

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { customer } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!customer,
  });

  if (!customer) return <AuthRequired message={t('orders.signin')} />;

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: t('orders.title') }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" />
        </Screen>
      ) : (data?.length ?? 0) === 0 ? (
        <Screen centered>
          <ThemedText>{t('orders.none')}</ThemedText>
        </Screen>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OrderRow
              order={item}
              onPress={() => router.push({ pathname: '/orders/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}
    </Screen>
  );
}

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
      activeOpacity={0.7}
      onPress={onPress}>
      <View style={styles.rowTop}>
        <ThemedText style={styles.orderNo}>#{order.orderNumber}</ThemedText>
        <ThemedText style={styles.total}>{order.total.toFixed(3)} BHD</ThemedText>
      </View>
      <View style={styles.rowBottom}>
        <StatusBadge status={order.status} />
        <ThemedText type="small" themeColor="textSecondary">
          {new Date(order.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.three, paddingBottom: TAB_BAR_CLEARANCE, gap: Spacing.two },
  row: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNo: { fontFamily: AppFonts.bodyBold },
  total: { fontFamily: AppFonts.displayBold, color: BRAND.accent },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
