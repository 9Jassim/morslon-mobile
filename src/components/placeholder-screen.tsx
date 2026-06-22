import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';

/** Temporary placeholder for tabs/screens not yet built out. */
export function PlaceholderScreen({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Screen centered style={styles.screen}>
      <Ionicons name={icon} size={48} color="#9aa0a6" />
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText type="small" style={styles.note}>
        Coming soon
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.two },
  note: { opacity: 0.6 },
});
