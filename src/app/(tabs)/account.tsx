import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LoginScreen } from '@/components/login-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { useI18n } from '@/lib/i18n';
import { useLocaleStore } from '@/lib/i18n';
import { BRAND } from '@/lib/theme-colors';
import { useThemeMode } from '@/lib/theme-mode';
import { useAuth } from '@/lib/auth-context';

const THEME_ICON = { system: 'phone-portrait-outline', light: 'sunny-outline', dark: 'moon-outline' } as const;
const THEME_LABEL = { system: 'System', light: 'Light', dark: 'Dark' } as const;

type MenuItem = { key: 'account.orders' | 'account.wallet' | 'account.loyalty' | 'account.profile'; icon: keyof typeof Ionicons.glyphMap; href: string };

const MENU: MenuItem[] = [
  { key: 'account.orders', icon: 'receipt-outline', href: '/orders' },
  { key: 'account.wallet', icon: 'wallet-outline', href: '/wallet' },
  { key: 'account.loyalty', icon: 'star-outline', href: '/loyalty' },
  { key: 'account.profile', icon: 'person-outline', href: '/profile' },
];

export default function AccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useI18n();
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggle);
  const { loading, customer, logout } = useAuth();
  const mode = useThemeMode((s) => s.mode);
  const cycleTheme = useThemeMode((s) => s.cycle);

  if (loading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" />
      </Screen>
    );
  }

  // Guests can browse the rest of the app; login is required only here.
  if (!customer) {
    return <LoginScreen />;
  }

  return (
    <Screen noPadding>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: BRAND.tint }]}>
            <ThemedText style={styles.avatarText}>
              {customer.firstName.charAt(0)}
              {customer.lastName.charAt(0)}
            </ThemedText>
          </View>
          <ThemedText type="title">
            {customer.firstName} {customer.lastName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {customer.email}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {MENU.map((item, i) => (
            <TouchableOpacity
              key={item.href}
              style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}
              activeOpacity={0.7}
              onPress={() => router.push(item.href as never)}>
              <Ionicons name={item.icon} size={20} color={BRAND.accent} />
              <ThemedText style={styles.rowLabel}>{t(item.key)}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={toggleLocale}>
            <Ionicons name="language-outline" size={20} color={BRAND.accent} />
            <ThemedText style={styles.rowLabel}>{t('account.language')}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.rowValue}>
              {locale === 'ar' ? 'العربية' : 'English'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}
            activeOpacity={0.7}
            onPress={cycleTheme}>
            <Ionicons name={THEME_ICON[mode]} size={20} color={BRAND.accent} />
            <ThemedText style={styles.rowLabel}>{t('account.theme')}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.rowValue}>
              {THEME_LABEL[mode]}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <Button title={t('account.logout')} variant="secondary" onPress={logout} style={styles.logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.four, paddingBottom: TAB_BAR_CLEARANCE, gap: Spacing.four },
  header: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.two },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  avatarText: { fontFamily: AppFonts.displayBold, fontSize: 24, color: BRAND.accent },
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowLabel: { fontFamily: AppFonts.body, fontSize: 15 },
  rowValue: { fontSize: 15, marginStart: 'auto' },
  chevron: { marginStart: 'auto' },
  logout: { marginTop: Spacing.two },
});
