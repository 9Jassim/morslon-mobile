import { useState } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/ui/screen";
import { Spacing } from "@/constants/theme";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

/** Email/password login against the Morslon backend's mobile auth endpoint. */
export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen centered style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        Morslon
      </ThemedText>
      <ThemedText type="small" style={styles.subtitle}>
        Sign in to your account
      </ThemedText>

      <Input
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        editable={!submitting}
      />
      <Input
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        editable={!submitting}
      />

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <Button
        title="Sign in"
        loading={submitting}
        disabled={!email || !password}
        onPress={onSubmit}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: Spacing.three, alignItems: "stretch" },
  title: { textAlign: "center" },
  subtitle: { textAlign: "center", marginBottom: Spacing.three, opacity: 0.7 },
  error: { color: "#d93025", textAlign: "center" },
  button: { marginTop: Spacing.two },
});
