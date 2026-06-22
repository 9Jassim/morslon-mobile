import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function ProfileScreen() {
  const { customer } = useAuth();
  if (!customer) return <AuthRequired message="Sign in to view your profile." />;

  return (
    <Screen style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
      <Field label="First name" value={customer.firstName} />
      <Field label="Last name" value={customer.lastName} />
      <Field label="Email" value={customer.email} />
      <Field label="Phone" value={customer.phone || '—'} />
      <ThemedText type="small" style={styles.note}>
        Editing your profile is coming soon.
      </ThemedText>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.three, paddingTop: Spacing.four },
  field: {
    gap: 2,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e1e6',
  },
  label: { opacity: 0.6 },
  value: { fontSize: 16 },
  note: { opacity: 0.6, marginTop: Spacing.two },
});
