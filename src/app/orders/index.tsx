import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { fetchOrders } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import type { Order } from '@/lib/types';

export default function OrdersScreen() {
  const router = useRouter();
  const { customer } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!customer,
  });

  if (!customer) return <AuthRequired message="Sign in to view your orders." />;

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: 'My Orders' }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" />
        </Screen>
      ) : (data?.length ?? 0) === 0 ? (
        <Screen centered>
          <ThemedText>You have no orders yet.</ThemedText>
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
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.rowTop}>
        <ThemedText style={styles.orderNo}>#{order.orderNumber}</ThemedText>
        <ThemedText style={styles.total}>{order.total.toFixed(3)} BHD</ThemedText>
      </View>
      <View style={styles.rowBottom}>
        <StatusBadge status={order.status} />
        <ThemedText type="small" style={styles.date}>
          {new Date(order.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.three, gap: Spacing.two },
  row: {
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: '#f7f8fa',
    gap: Spacing.two,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNo: { fontWeight: '700' },
  total: { fontWeight: '700', color: '#208AEF' },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { opacity: 0.6 },
});
