import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

/** Shown on tabs/screens that require login when the user is a guest. */
export function AuthRequired({ message }: { message: string }) {
  const router = useRouter();
  return (
    <Screen centered style={styles.screen}>
      <Ionicons name="lock-closed-outline" size={48} color="#9aa0a6" />
      <ThemedText type="title" style={styles.title}>
        Sign in required
      </ThemedText>
      <ThemedText type="small" style={styles.message}>
        {message}
      </ThemedText>
      <Button title="Go to sign in" onPress={() => router.push('/account')} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.two },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', opacity: 0.7, marginBottom: Spacing.two },
  button: { alignSelf: 'stretch' },
});
