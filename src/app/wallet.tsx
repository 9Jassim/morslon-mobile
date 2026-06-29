import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BRAND } from '@/lib/theme-colors';
import { fetchWallet } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

export default function WalletScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { customer } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
    enabled: !!customer,
  });

  if (!customer) return <AuthRequired message={t('wallet.signin')} />;

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title: t('wallet.title') }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" />
        </Screen>
      ) : (
        <FlatList
          data={data?.transactions ?? []}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.balanceCard}>
              <ThemedText type="small" style={styles.balanceLabel}>
                {t('wallet.balance')}
              </ThemedText>
              <ThemedText style={styles.balance}>{(data?.balance ?? 0).toFixed(3)} BHD</ThemedText>
            </View>
          }
          ListEmptyComponent={
            <ThemedText style={styles.empty}>{t('wallet.none')}</ThemedText>
          }
          renderItem={({ item }) => (
            <View style={[styles.txn, { borderBottomColor: theme.border }]}>
              <View style={styles.txnLeft}>
                <ThemedText style={styles.txnType}>{item.type}</ThemedText>
                {item.note ? (
                  <ThemedText type="small" style={styles.txnNote}>
                    {item.note}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" style={styles.txnDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
              <ThemedText style={[styles.amount, item.amount < 0 ? styles.debit : styles.credit]}>
                {item.amount > 0 ? '+' : ''}
                {item.amount.toFixed(3)}
              </ThemedText>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.three, paddingBottom: TAB_BAR_CLEARANCE, gap: Spacing.two },
  balanceCard: {
    backgroundColor: BRAND.accent,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.85)' },
  balance: { color: '#fff', fontFamily: AppFonts.displayBold, fontSize: 34 },
  empty: { textAlign: 'center', opacity: 0.6, marginTop: Spacing.four },
  txn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e1e6',
  },
  txnLeft: { flex: 1, gap: 2 },
  txnType: { fontWeight: '600', textTransform: 'capitalize' },
  txnNote: { opacity: 0.7 },
  txnDate: { opacity: 0.5 },
  amount: { fontWeight: '700' },
  credit: { color: '#1a7f37' },
  debit: { color: '#d93025' },
});
