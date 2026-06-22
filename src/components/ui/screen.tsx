import type { ReactNode } from "react";
import { StyleSheet, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

type Props = {
  children: ReactNode;
  /** Center content vertically + horizontally (e.g. for auth/empty states). */
  centered?: boolean;
  /** Remove the default horizontal padding (e.g. for full-bleed lists). */
  noPadding?: boolean;
  style?: ViewStyle;
};

/** Standard screen wrapper: themed background + safe-area insets + padding. */
export function Screen({ children, centered, noPadding, style }: Props) {
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView
        style={[
          styles.fill,
          !noPadding && styles.padded,
          centered && styles.centered,
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: Spacing.four },
  centered: { justifyContent: "center", alignItems: "center" },
});
