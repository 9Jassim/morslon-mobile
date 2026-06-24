import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { customer } = useAuth();
  if (!customer) return <AuthRequired message={t('profile.signin')} />;

  return (
    <Screen style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: t('profile.title') }} />
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Field label={t('profile.first')} value={customer.firstName} border={theme.border} />
        <Field label={t('profile.last')} value={customer.lastName} border={theme.border} />
        <Field label={t('profile.email')} value={customer.email} border={theme.border} />
        <Field label={t('profile.phone')} value={customer.phone || '—'} />
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {t('profile.soon')}
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
