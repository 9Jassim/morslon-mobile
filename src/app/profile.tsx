import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

export default function ProfileScreen() {
  const theme = useTheme();
  const { customer } = useAuth();
  if (!customer) return <AuthRequired message="Sign in to view your profile." />;

  return (
    <Screen style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Field label="First name" value={customer.firstName} border={theme.border} />
        <Field label="Last name" value={customer.lastName} border={theme.border} />
        <Field label="Email" value={customer.email} border={theme.border} />
        <Field label="Phone" value={customer.phone || '—'} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Editing your profile is coming soon.
      </ThemedText>
    </Screen>
  );
}

function Field({ label, value, border }: { label: string; value: string; border?: string }) {
  return (
    <View style={[styles.field, border ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: border } : null]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.three, paddingTop: Spacing.four },
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  field: { gap: 2, paddingVertical: Spacing.three },
  value: { fontFamily: AppFonts.bodySemibold, fontSize: 16 },
  note: { marginTop: Spacing.two },
});
