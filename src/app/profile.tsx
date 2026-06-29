import { Stack } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AuthRequired } from '@/components/auth-required';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api';
import { changePassword, updateProfile } from '@/lib/account-api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

type Msg = { text: string; ok: boolean } | null;

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { customer, updateCustomer } = useAuth();

  if (!customer) return <AuthRequired message={t('profile.signin')} />;

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen noPadding>
        <Stack.Screen options={{ headerShown: true, title: t('profile.title') }} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PersonalInfo
            theme={theme}
            t={t}
            customer={customer}
            onSaved={(p) => updateCustomer(p)}
          />
          <PasswordCard theme={theme} t={t} />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function Notice({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <ThemedText type="small" style={[styles.notice, { color: msg.ok ? '#1a7f37' : '#d93025' }]}>
      {msg.text}
    </ThemedText>
  );
}

type T = ReturnType<typeof useI18n>['t'];
type Theme = ReturnType<typeof useTheme>;

function PersonalInfo({
  theme,
  t,
  customer,
  onSaved,
}: {
  theme: Theme;
  t: T;
  customer: { firstName: string; lastName: string; email: string; phone: string | null };
  onSaved: (p: { firstName: string; lastName: string; phone: string | null }) => void;
}) {
  const [firstName, setFirstName] = useState(customer.firstName);
  const [lastName, setLastName] = useState(customer.lastName);
  const [phone, setPhone] = useState(customer.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function save() {
    setMsg(null);
    if (!firstName.trim() || !lastName.trim()) {
      setMsg({ text: t('profile.nameRequired'), ok: false });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      onSaved({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() || null });
      setMsg({ text: t('profile.saved'), ok: true });
    } catch (e) {
      setMsg({ text: e instanceof ApiError ? e.message : t('common.error'), ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ThemedText style={styles.cardTitle}>{t('profile.personal')}</ThemedText>
      <Field label={t('profile.first')}>
        <Input value={firstName} onChangeText={setFirstName} editable={!saving} />
      </Field>
      <Field label={t('profile.last')}>
        <Input value={lastName} onChangeText={setLastName} editable={!saving} />
      </Field>
      <Field label={t('profile.phone')}>
        <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!saving} />
      </Field>
      <Field label={t('profile.email')}>
        <Input value={customer.email} editable={false} style={{ opacity: 0.6 }} />
      </Field>
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        {t('profile.emailNote')}
      </ThemedText>
      <Notice msg={msg} />
      <Button title={t('profile.save')} loading={saving} onPress={save} style={styles.btn} />
    </View>
  );
}

function PasswordCard({ theme, t }: { theme: Theme; t: T }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function submit() {
    setMsg(null);
    if (next.length < 8) {
      setMsg({ text: t('profile.pwdShort'), ok: false });
      return;
    }
    if (next !== confirm) {
      setMsg({ text: t('profile.pwdMismatch'), ok: false });
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setMsg({ text: t('profile.pwdUpdated'), ok: true });
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (e) {
      setMsg({ text: e instanceof ApiError ? e.message : t('common.error'), ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ThemedText style={styles.cardTitle}>{t('profile.password')}</ThemedText>
      <Field label={t('profile.current')}>
        <Input
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          editable={!saving}
          autoComplete="new-password"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
        />
      </Field>
      <Field label={t('profile.new')}>
        <Input
          value={next}
          onChangeText={setNext}
          secureTextEntry
          editable={!saving}
          autoComplete="off"
          autoCorrect={false}
          textContentType="newPassword"
          importantForAutofill="no"
        />
      </Field>
      <Field label={t('profile.confirm')}>
        <Input
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          editable={!saving}
          autoComplete="off"
          autoCorrect={false}
          textContentType="newPassword"
          importantForAutofill="no"
        />
      </Field>
      <Notice msg={msg} />
      <Button
        title={t('profile.update')}
        variant="secondary"
        loading={saving}
        disabled={!current || !next || !confirm}
        onPress={submit}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four, paddingBottom: Spacing.six },
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: { fontFamily: AppFonts.bodyBold, fontSize: 16 },
  field: { gap: Spacing.one },
  hint: { marginTop: -Spacing.two },
  notice: { textAlign: 'center' },
  btn: { marginTop: Spacing.one },
});
