import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function WorkerProfileScreen() {
  const { user, logout, switchMode } = useAuth();
  const theme = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={[styles.avatar, { backgroundColor: theme.workerPrimary }]}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
      <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Row label="Modo atual" value="Trabalhador 🔧" theme={theme} />
        <Row label="Pontos" value={`${user?.points || 0} pts ⭐`} theme={theme} />
      </View>

      <Pressable style={[styles.btn, { borderColor: theme.clientPrimary }]} onPress={() => switchMode('client')}>
        <Text style={[styles.btnText, { color: theme.clientPrimary }]}>📱 Virar Cliente</Text>
      </Pressable>

      <Pressable style={[styles.btn, { borderColor: theme.error }]} onPress={logout}>
        <Text style={[styles.btnText, { color: theme.error }]}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value, theme }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, gap: 16 },
  avatar:    { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ color: '#fff', fontSize: 32, fontWeight: '700' },
  name:      { fontSize: 22, fontWeight: '700' },
  email:     { fontSize: 14 },
  card:      { width: '100%', borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 12 },
  row:       { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel:  { fontSize: 14 },
  rowValue:  { fontSize: 14, fontWeight: '600' },
  btn:       { width: '100%', borderWidth: 1.5, borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText:   { fontSize: 14, fontWeight: '600' },
});
