import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginScreen } from '@/components/login-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function HomeScreen() {
  const { loading, customer, logout } = useAuth();

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!customer) {
    return <LoginScreen />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ThemedText type="title" style={styles.title}>
          Hi {customer.firstName} 👋
        </ThemedText>
        <ThemedText type="small" style={styles.email}>
          {customer.email}
        </ThemedText>

        <TouchableOpacity style={styles.button} onPress={logout}>
          <ThemedText style={styles.buttonText}>Log out</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  safe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  title: { textAlign: 'center' },
  email: { opacity: 0.7, marginBottom: Spacing.four },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: Spacing.five,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
