import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/lib/theme-colors';
import { fetchOrders } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const { customer } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!customer,
  });

  const order = data?.find((o) => o.id === id);

  if (isLoading) {
    return (
      <Screen centered>
        <Stack.Screen options={{ headerShown: true, title: 'Order' }} />
        <ActivityIndicator size="large" />
      </Screen>
    );
  }
  if (!order) {
    return (
      <Screen centered>
        <Stack.Screen options={{ headerShown: true, title: 'Order' }} />
        <ThemedText>Order not found.</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: `#${order.orderNumber}` }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <StatusBadge status={order.status} />
          <ThemedText type="small" style={styles.date}>
            {new Date(order.createdAt).toLocaleString()}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('orders.items')}</ThemedText>
          {order.items.map((item, idx) => (
            <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
              <ThemedText numberOfLines={2} style={styles.itemName}>
                {item.productName} × {item.quantity}
              </ThemedText>
              <ThemedText>{(item.price * item.quantity).toFixed(3)}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SummaryRow label={t('orders.subtotal')} value={order.subtotal} />
          {order.discount > 0 ? <SummaryRow label={t('orders.discount')} value={-order.discount} /> : null}
          <SummaryRow label={t('orders.shipping')} value={order.shippingCost} />
          <SummaryRow label={t('orders.total')} value={order.total} bold />
        </View>

        <ThemedText type="small" style={styles.payment}>
          {t('orders.payment')}: {order.paymentMethod} · {order.paymentStatus}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText style={bold ? styles.bold : undefined}>{label}</ThemedText>
      <ThemedText style={bold ? styles.bold : undefined}>{value.toFixed(3)} BHD</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.four, gap: Spacing.four },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { opacity: 0.6 },
  section: { gap: Spacing.two },
  sectionTitle: { fontWeight: '700', fontSize: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  itemName: { flex: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontWeight: '800', color: BRAND.primary },
  payment: { opacity: 0.6, textTransform: 'capitalize' },
});
