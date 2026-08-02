import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import orderService from '../../services/orderService';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';

export default function WorkerOrdersScreen() {
  const theme = useTheme();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setLoading(true); const d = await orderService.getAll(); setOrders(d.orders); }
    catch { Alert.alert('Erro', 'Não foi possível carregar.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function act(id, status) {
    try { await orderService.updateStatus(id, status); load(); }
    catch { Alert.alert('Erro', 'Não foi possível atualizar.'); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        onRefresh={load}
        refreshing={loading}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>Nenhum pedido.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.row}>
              <Text style={[styles.id, { color: theme.textSecondary }]}>#{item.id}</Text>
              <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(item.price)}</Text>
            </View>
            <Text style={[styles.status, { color: theme.text }]}>{formatStatus(item.status)}</Text>
            <Text style={[styles.date, { color: theme.textDisabled }]}>{formatDate(item.created_at)}</Text>
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <Pressable style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={() => act(item.id, 'accepted')}>
                  <Text style={styles.actionText}>Aceitar</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, { backgroundColor: theme.error }]} onPress={() => act(item.id, 'cancelled')}>
                  <Text style={styles.actionText}>Recusar</Text>
                </Pressable>
              </View>
            )}
            {item.status === 'accepted' && (
              <Pressable style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={() => act(item.id, 'completed')}>
                <Text style={styles.actionText}>Concluir</Text>
              </Pressable>
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
  row:  { flexDirection: 'row', justifyContent: 'space-between' },
  id:   { fontSize: 12 }, price: { fontSize: 16, fontWeight: '700' },
  status: { fontSize: 14, fontWeight: '600' }, date: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
