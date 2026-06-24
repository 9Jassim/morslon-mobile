import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchLoyalty } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

export default function LoyaltyScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { customer } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['loyalty'],
    queryFn: fetchLoyalty,
    enabled: !!customer,
  });

  if (!customer) return <AuthRequired message={t('loyalty.signin')} />;

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: t('loyalty.title') }} />
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
                {t('loyalty.points')}
              </ThemedText>
              <ThemedText style={styles.balance}>{data?.balance ?? 0}</ThemedText>
              <ThemedText type="small" style={styles.balanceLabel}>
                {data?.totalEarned ?? 0} {t('loyalty.earned')}
              </ThemedText>
            </View>
          }
          ListEmptyComponent={<ThemedText style={styles.empty}>{t('loyalty.none')}</ThemedText>}
          renderItem={({ item }) => (
            <View style={[styles.reward, { borderBottomColor: theme.border }]}>
              <View style={styles.rewardLeft}>
                <ThemedText style={styles.rewardName}>{item.nameEn}</ThemedText>
                <ThemedText type="small" style={styles.rewardCost}>
                  {item.pointsCost} {t('loyalty.cost')}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.pill,
                  item.canAfford ? styles.pillOn : { backgroundColor: theme.backgroundElement },
                ]}>
                <ThemedText
                  type="small"
                  style={item.canAfford ? styles.pillOnText : { color: theme.textSecondary }}>
                  {item.canAfford ? t('loyalty.redeemable') : t('loyalty.locked')}
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
    borderRadius: Radius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    gap: 2,
  },
  balanceLabel: { color: '#d7f0dd' },
  balance: { color: '#fff', fontFamily: AppFonts.displayBold, fontSize: 38 },
  empty: { textAlign: 'center', opacity: 0.6, marginTop: Spacing.four },
  reward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  rewardLeft: { gap: 2 },
  rewardName: { fontFamily: AppFonts.bodySemibold },
  rewardCost: { opacity: 0.7 },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillOn: { backgroundColor: '#e6f4ea' },
  pillOnText: { color: '#1a7f37' },
});
