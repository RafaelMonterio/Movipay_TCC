import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import workersService from '../../services/workersService';
import { useTheme } from '../../context/ThemeContext';

export default function WorkersScreen({ navigation }) {
  const theme = useTheme();
  const [workers, setWorkers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await workersService.getAll();
      setWorkers(data);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = workers.filter(w =>
    !query || (w.name || '').toLowerCase().includes(query.toLowerCase()) || (w.service || w.role || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ fontSize: 15 }}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar profissionais ou serviços"
          placeholderTextColor={theme.textDisabled}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i, idx) => String(i.id ?? idx)}
          onRefresh={load}
          refreshing={loading}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: theme.textSecondary }}>
              Nenhum profissional encontrado.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>{(item.name || '?')[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.role, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.role || item.service || 'Profissional'}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={{ color: theme.mono, fontSize: 12 }}>⭐ {item.avg_rating ?? '—'}</Text>
                  {item.distance_km != null && (
                    <Text style={{ color: theme.textDisabled, fontSize: 12 }}>· {item.distance_km} km</Text>
                  )}
                </View>
              </View>
              {item.is_available && (
                <View style={[styles.availableDot, { backgroundColor: theme.accent }]} />
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginBottom: 0, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1.5, padding: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  name: { fontSize: 15, fontWeight: '700' },
  role: { fontSize: 12, marginTop: 1 },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  availableDot: { width: 10, height: 10, borderRadius: 5 },
});
