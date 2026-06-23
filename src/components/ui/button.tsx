import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AppFonts, Radius, Spacing } from "@/constants/theme";
import { BRAND } from "@/lib/theme-colors";

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
        <ActivityIndicator color={variant === "primary" ? BRAND.onPrimary : BRAND.accent} />
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
    borderRadius: Radius.pill,
    paddingVertical: 16,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: BRAND.accent },
  secondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: BRAND.accent },
  disabled: { opacity: 0.45 },
  label: { fontFamily: AppFonts.bodyBold, fontSize: 15, letterSpacing: 0.2 },
  labelPrimary: { color: BRAND.onPrimary },
  labelSecondary: { color: BRAND.accent },
});
