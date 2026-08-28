import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import orderService from '../../services/orderService';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function WorkerEarningsScreen() {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, walletRes] = await Promise.all([
        orderService.getAll().catch(() => ({ orders: [] })),
        api.get('/payments/wallet').catch(() => ({ data: null })),
      ]);
      setOrders(ordersData.orders || []);
      setWallet(walletRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + parseFloat(o.price || 0), 0);

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20, gap: 12 }}
      data={completed}
      keyExtractor={(i, idx) => String(i.id ?? idx)}
      onRefresh={load}
      refreshing={loading}
      ListHeaderComponent={
        <View style={{ gap: 16, marginBottom: 8 }}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Meus Ganhos 💰</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>Acompanhe seu faturamento</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ fontSize: 20 }}>📊</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(totalRevenue)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total histórico</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ fontSize: 20 }}>💳</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(wallet?.balance || 0)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Saldo disponível</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pedidos pagos</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 20 }}>
          Nenhum pedido concluído ainda.
        </Text>
      }
      renderItem={({ item }) => (
        <View style={[styles.orderRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>#{item.id}</Text>
            {item.created_at && <Text style={{ color: theme.textDisabled, fontSize: 11 }}>{formatDate(item.created_at)}</Text>}
          </View>
          <Text style={{ color: theme.accent, fontWeight: '800' }}>{formatCurrency(item.price)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 4 },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 12, marginBottom: 8 },
});
