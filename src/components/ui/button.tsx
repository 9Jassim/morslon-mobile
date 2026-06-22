import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

type Variant = "primary" | "secondary";

type Props = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  variant?: Variant;
};

/** App-wide button. Handles loading + disabled states and two variants. */
export function Button({
  title,
  loading = false,
  variant = "primary",
  disabled,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#208AEF"} />
      ) : (
        <ThemedText
          style={[styles.label, variant === "primary" ? styles.labelPrimary : styles.labelSecondary]}
        >
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#208AEF" },
  secondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#208AEF" },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: "600" },
  labelPrimary: { color: "#fff" },
  labelSecondary: { color: "#208AEF" },
});
