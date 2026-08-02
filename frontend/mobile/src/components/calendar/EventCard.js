import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

export default function EventCard({ event }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.dot, { backgroundColor: theme.primary }]} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
        <Text style={[styles.sub, { color: theme.textSecondary }]}>
          {event.time_start} – {event.time_end} · {event.client_name}
        </Text>
        {event.address && (
          <Text style={[styles.addr, { color: theme.textDisabled }]}>📍 {event.address}</Text>
        )}
        {event.price && (
          <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(event.price)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14, borderWidth: 1.5, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  dot:   { width: 10, height: 10, borderRadius: 99, marginTop: 5 },
  info:  { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '700' },
  sub:   { fontSize: 12 },
  addr:  { fontSize: 12 },
  price: { fontSize: 14, fontWeight: '600', marginTop: 2 },
});
