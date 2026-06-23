import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { AppFonts, Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** App-wide text input with consistent, theme-aware styling. */
export function Input(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
        props.style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: AppFonts.body,
    fontSize: 16,
  },
});
