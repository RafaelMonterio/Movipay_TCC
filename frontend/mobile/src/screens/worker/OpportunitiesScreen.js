import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';
import orderService from '../../services/orderService';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

export default function OpportunitiesScreen() {
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/services')
      .then(({ data }) => setServices(data.services))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={services}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>Sem oportunidades no momento.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.info}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.cat, { color: theme.textSecondary }]}>{item.category}</Text>
              <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(item.price)}</Text>
            </View>
            <Pressable
              style={[styles.btn, { backgroundColor: theme.primary }]}
              onPress={() => Alert.alert('Interesse registrado!', `Você demonstrou interesse em "${item.title}".`)}
            >
              <Text style={styles.btnText}>Tenho interesse</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1.5, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '700' },
  cat:   { fontSize: 12 },
  price: { fontSize: 15, fontWeight: '700' },
  btn:   { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
