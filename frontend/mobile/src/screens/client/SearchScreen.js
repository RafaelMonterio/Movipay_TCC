import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import ServiceCard from '../../components/services/ServiceCard';
import orderService from '../../services/orderService';

export default function SearchScreen() {
  const theme = useTheme();
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/services')
      .then(({ data }) => { setServices(data.services); setFiltered(data.services); })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os serviços.'))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(text) {
    setQuery(text);
    const q = text.toLowerCase();
    setFiltered(services.filter(s =>
      s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    ));
  }

  async function handleContract(service) {
    try {
      await orderService.create(service.id);
      Alert.alert('✅ Pedido criado!', `Pedido para "${service.title}" criado com sucesso.`);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o pedido.');
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        style={[styles.search, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
        placeholder="Buscar serviço ou categoria..."
        placeholderTextColor={theme.textDisabled}
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>Nenhum serviço encontrado.</Text>}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            actionLabel="Contratar"
            onPress={() => handleContract(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    margin: 16, borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
  },
});
