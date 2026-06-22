import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { fetchLoyalty } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';

export default function LoyaltyScreen() {
  const { customer } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: fetchLoyalty,
    enabled: !!customer,
  });

  if (!customer) return <AuthRequired message="Sign in to see your points and rewards." />;

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: 'Loyalty' }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" />
        </Screen>
      ) : (
        <FlatList
          data={data?.rewards ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.balanceCard}>
              <ThemedText type="small" style={styles.balanceLabel}>
                Points balance
              </ThemedText>
              <ThemedText style={styles.balance}>{data?.balance ?? 0}</ThemedText>
              <ThemedText type="small" style={styles.balanceLabel}>
                {data?.totalEarned ?? 0} earned all-time
              </ThemedText>
            </View>
          }
          ListEmptyComponent={<ThemedText style={styles.empty}>No rewards available.</ThemedText>}
          renderItem={({ item }) => (
            <View style={styles.reward}>
              <View style={styles.rewardLeft}>
                <ThemedText style={styles.rewardName}>{item.nameEn}</ThemedText>
                <ThemedText type="small" style={styles.rewardCost}>
                  {item.pointsCost} points
                </ThemedText>
              </View>
              <View style={[styles.pill, item.canAfford ? styles.pillOn : styles.pillOff]}>
                <ThemedText type="small" style={item.canAfford ? styles.pillOnText : styles.pillOffText}>
                  {item.canAfford ? 'Redeemable' : 'Locked'}
                </ThemedText>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.three, gap: Spacing.two },
  balanceCard: {
    backgroundColor: '#1a7f37',
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    gap: 2,
  },
  balanceLabel: { color: '#d7f0dd' },
  balance: { color: '#fff', fontSize: 34, fontWeight: '800' },
  empty: { textAlign: 'center', opacity: 0.6, marginTop: Spacing.four },
  reward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e1e6',
  },
  rewardLeft: { gap: 2 },
  rewardName: { fontWeight: '600' },
  rewardCost: { opacity: 0.7 },
  pill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  pillOn: { backgroundColor: '#e6f4ea' },
  pillOff: { backgroundColor: '#f0f0f3' },
  pillOnText: { color: '#1a7f37' },
  pillOffText: { color: '#9aa0a6' },
});
