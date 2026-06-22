import { StyleSheet, TextInput, type TextInputProps } from "react-native";

/** App-wide text input with consistent styling. */
export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor="#9aa0a6" style={[styles.input, props.style]} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#d0d4d9",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#fff",
  },
});
