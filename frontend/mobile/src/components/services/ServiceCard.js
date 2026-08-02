import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

export default function ServiceCard({ service, onPress, actionLabel }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>{service.title}</Text>
        <Text style={[styles.cat, { color: theme.textSecondary }]}>{service.category}</Text>
        <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(service.price)}</Text>
      </View>
      {onPress && (
        <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={onPress}>
          <Text style={styles.btnText}>{actionLabel || 'Ver'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1.5, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  info:    { flex: 1, gap: 4 },
  title:   { fontSize: 15, fontWeight: '700' },
  cat:     { fontSize: 12 },
  price:   { fontSize: 16, fontWeight: '700', marginTop: 4 },
  btn:     { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
