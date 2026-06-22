import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LoginScreen } from '@/components/login-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

type MenuItem = { label: string; icon: keyof typeof Ionicons.glyphMap; href: string };

const MENU: MenuItem[] = [
  { label: 'My Orders', icon: 'receipt-outline', href: '/orders' },
  { label: 'Wallet', icon: 'wallet-outline', href: '/wallet' },
  { label: 'Loyalty & Rewards', icon: 'star-outline', href: '/loyalty' },
  { label: 'Profile', icon: 'person-outline', href: '/profile' },
];

export default function AccountScreen() {
  const router = useRouter();
  const { loading, customer, logout } = useAuth();

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
          <ThemedText type="title">
            {customer.firstName} {customer.lastName}
          </ThemedText>
          <ThemedText type="small" style={styles.email}>
            {customer.email}
          </ThemedText>
        </View>

        <View style={styles.menu}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.href}
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => router.push(item.href as never)}>
              <Ionicons name={item.icon} size={22} color="#208AEF" />
              <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#9aa0a6" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Log out" variant="secondary" onPress={logout} style={styles.logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.four, gap: Spacing.four },
  header: { gap: Spacing.one },
  email: { opacity: 0.7 },
  menu: { gap: Spacing.one },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e1e6',
  },
  rowLabel: { fontSize: 16 },
  chevron: { marginLeft: 'auto' },
  logout: { marginTop: Spacing.two },
});
