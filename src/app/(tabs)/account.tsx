import { ActivityIndicator, StyleSheet } from 'react-native';

import { LoginScreen } from '@/components/login-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function AccountScreen() {
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
    <Screen centered style={styles.screen}>
      <ThemedText type="title">Hi {customer.firstName} 👋</ThemedText>
      <ThemedText type="small" style={styles.email}>
        {customer.email}
      </ThemedText>
      <Button title="Log out" variant="secondary" onPress={logout} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.two },
  email: { opacity: 0.7, marginBottom: Spacing.four },
  button: { alignSelf: 'stretch' },
});
