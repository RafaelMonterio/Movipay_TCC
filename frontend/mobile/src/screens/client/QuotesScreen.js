import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import quoteService from '../../services/quoteService';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';

export default function ClientQuotesScreen() {
  const theme = useTheme();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await quoteService.getAll();
      setQuotes(data.quotes || data || []);
    } catch {
      // Backend not reachable / no quotes yet — show the empty state
      // instead of leaving the screen stuck loading.
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={quotes}
        keyExtractor={i => String(i.id)}
        onRefresh={load}
        refreshing={loading}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.empty, { color: theme.textSecondary }]}>Nenhum orçamento por aqui ainda.</Text>
            <Text style={[styles.emptySub, { color: theme.textDisabled }]}>
              Peça um orçamento a um profissional para acompanhar por aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.row}>
              <Text style={[styles.worker, { color: theme.text }]}>{item.worker_name || item.service_name || 'Profissional'}</Text>
              {item.price != null && (
                <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(item.price)}</Text>
              )}
            </View>
            <Text style={[styles.status, { color: theme.textSecondary }]}>{formatStatus(item.status)}</Text>
            {item.created_at && (
              <Text style={[styles.date, { color: theme.textDisabled }]}>{formatDate(item.created_at)}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  worker: { fontSize: 15, fontWeight: '700' },
  price: { fontSize: 15, fontWeight: '700' },
  status: { fontSize: 13, fontWeight: '600' },
  date: { fontSize: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 6, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 38, marginBottom: 6 },
  empty: { textAlign: 'center', fontWeight: '700', fontSize: 15 },
  emptySub: { textAlign: 'center', fontSize: 13 },
});
