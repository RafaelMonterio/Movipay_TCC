import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Input({ label, error, style, ...props }) {
  const theme = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor: error ? theme.error : theme.border, color: theme.text },
        ]}
        placeholderTextColor={theme.textDisabled}
        {...props}
      />
      {error && <Text style={[styles.error, { color: theme.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:  { gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
  },
  error: { fontSize: 12 },
});
