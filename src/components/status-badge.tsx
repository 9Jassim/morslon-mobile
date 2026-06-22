import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BRAND } from '@/lib/theme-colors';

/** Small pill showing an order status. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <View style={styles.badge}>
      <ThemedText type="small" style={styles.badgeText}>
        {status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: BRAND.tint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: BRAND.accent, textTransform: 'capitalize' },
});
