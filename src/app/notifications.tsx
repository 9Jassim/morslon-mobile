import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/lib/i18n';

/**
 * App-only notifications feed. Placeholder until the backend exposes a
 * customer notifications endpoint + push delivery.
 */
export default function NotificationsScreen() {
  const { t } = useI18n();
  return (
    <Screen centered style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: t('notifications.title') }} />
      <Ionicons name="notifications-outline" size={48} color="#9aa0a6" />
      <ThemedText type="title">{t('notifications.none')}</ThemedText>
      <ThemedText type="small" style={styles.dim}>
        {t('notifications.hint')}
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.two },
  dim: { opacity: 0.6, textAlign: 'center' },
});
