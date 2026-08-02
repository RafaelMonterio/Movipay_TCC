import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ACTIONS = [
  { icon: '🔍', label: 'Buscar Serviços', route: 'ClientSearch' },
  { icon: '📋', label: 'Meus Pedidos',    route: 'ClientOrders' },
  { icon: '⭐', label: 'Meus Pontos',     route: 'ClientPoints' },
  { icon: '👷', label: 'Trabalhadores',   route: 'Workers' },
];

export default function ClientHomeScreen({ navigation }) {
  const { user, switchMode } = useAuth();
  const theme = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Olá, 👋</Text>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.clientPrimary }]}>
          <Text style={styles.badgeText}>Cliente</Text>
        </View>
      </View>

      <View style={[styles.banner, { backgroundColor: theme.primary }]}>
        <Text style={styles.bannerTitle}>Precisa de um serviço?</Text>
        <Text style={styles.bannerSub}>Encontre profissionais perto de você</Text>
        <Pressable
          style={styles.bannerBtn}
          onPress={() => navigation.navigate('ClientSearch')}
        >
          <Text style={styles.bannerBtnText}>Buscar agora</Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>Menu rápido</Text>
      <View style={styles.grid}>
        {ACTIONS.map(a => (
          <Pressable
            key={a.route}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate(a.route)}
          >
            <Text style={styles.cardIcon}>{a.icon}</Text>
            <Text style={[styles.cardLabel, { color: theme.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.switchBtn, { borderColor: theme.workerPrimary }]}
        onPress={() => switchMode('worker')}
      >
        <Text style={[styles.switchText, { color: theme.workerPrimary }]}>
          🔧 Virar Trabalhador
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 24, gap: 20 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:     { fontSize: 14 },
  name:         { fontSize: 22, fontWeight: '700' },
  badge:        { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText:    { color: '#fff', fontWeight: '600', fontSize: 13 },
  banner:       { borderRadius: 20, padding: 24, gap: 8 },
  bannerTitle:  { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerSub:    { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  bannerBtn:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 12, marginTop: 8, alignSelf: 'flex-start' },
  bannerBtnText:{ color: '#fff', fontWeight: '700' },
  section:      { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:         { width: '47%', borderRadius: 16, borderWidth: 1.5, padding: 20, alignItems: 'center', gap: 10 },
  cardIcon:     { fontSize: 30 },
  cardLabel:    { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  switchBtn:    { borderWidth: 1.5, borderRadius: 12, padding: 16, alignItems: 'center' },
  switchText:   { fontSize: 14, fontWeight: '600' },
});
