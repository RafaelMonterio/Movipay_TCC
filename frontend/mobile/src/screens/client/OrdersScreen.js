import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import orderService from '../../services/orderService';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';

export default function ClientOrdersScreen() {
  const theme = useTheme();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data.orders);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        onRefresh={load}
        refreshing={loading}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>Nenhum pedido ainda.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.row}>
              <Text style={[styles.id, { color: theme.textSecondary }]}>#{item.id}</Text>
              <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(item.price)}</Text>
            </View>
            <Text style={[styles.status, { color: theme.text }]}>{formatStatus(item.status)}</Text>
            <Text style={[styles.date, { color: theme.textDisabled }]}>{formatDate(item.created_at)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 6 },
  row:  { flexDirection: 'row', justifyContent: 'space-between' },
  id:   { fontSize: 12 },
  price:{ fontSize: 16, fontWeight: '700' },
  status:{ fontSize: 14, fontWeight: '600' },
  date: { fontSize: 12 },
  empty:{ textAlign: 'center', marginTop: 40 },
});
