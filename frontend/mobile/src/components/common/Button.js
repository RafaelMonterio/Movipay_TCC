import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Button({ label, onPress, loading, variant = 'primary', disabled, style }) {
  const theme = useTheme();

  const bg = variant === 'outline' ? 'transparent' : theme.primary;
  const borderColor = theme.primary;
  const color = variant === 'outline' ? theme.primary : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'outline' ? 1.5 : 0 },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={color} />
        : <Text style={[styles.label, { color }]}>{label}</Text>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn:   { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700' },
});
