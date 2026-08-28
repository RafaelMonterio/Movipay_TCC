import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import orderService from '../../services/orderService';

const ACTIONS = [
  { icon: '📅', label: 'Calendário',     route: 'WorkerCalendar' },
  { icon: '📋', label: 'Pedidos',        route: 'WorkerOrders' },
  { icon: '🔎', label: 'Oportunidades',  route: 'WorkerOpportunities' },
  { icon: '👤', label: 'Perfil',         route: 'WorkerProfile' },
];

export default function WorkerHomeScreen({ navigation }) {
  const { user, switchMode } = useAuth();
  const theme = useTheme();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    orderService.getAll()
      .then(data => setPendingCount(data.orders.filter(o => o.status === 'pending').length))
      .catch(() => {});
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.getParent()?.openDrawer()} hitSlop={10} style={[styles.menuBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ fontSize: 18, color: theme.text }}>☰</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Olá, 👷</Text>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{user?.name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.workerPrimary }]}>
          <Text style={styles.badgeText}>Trabalhador</Text>
        </View>
      </View>

      {pendingCount > 0 && (
        <Pressable
          style={[styles.alert, { backgroundColor: theme.primaryBg, borderColor: theme.primary }]}
          onPress={() => navigation.navigate('WorkerOrders')}
        >
          <Text style={[styles.alertText, { color: theme.primary }]}>
            🔔 Você tem {pendingCount} pedido{pendingCount > 1 ? 's' : ''} aguardando resposta
          </Text>
        </Pressable>
      )}

      <View style={[styles.banner, { backgroundColor: theme.workerPrimary }]}>
        <Text style={styles.bannerTitle}>Pronto para trabalhar?</Text>
        <Text style={styles.bannerSub}>Veja as oportunidades disponíveis</Text>
        <Pressable style={styles.bannerBtn} onPress={() => navigation.navigate('WorkerOpportunities')}>
          <Text style={styles.bannerBtnText}>Ver oportunidades</Text>
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

      <Pressable style={[styles.switchBtn, { borderColor: theme.clientPrimary }]} onPress={() => switchMode('client')}>
        <Text style={[styles.switchText, { color: theme.clientPrimary }]}>📱 Virar Cliente</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 24, gap: 20 },
  header:       { flexDirection: 'row', alignItems: 'center' },
  menuBtn:      { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  greeting:     { fontSize: 14 },
  name:         { fontSize: 22, fontWeight: '700' },
  badge:        { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText:    { color: '#fff', fontWeight: '600', fontSize: 13 },
  alert:        { borderWidth: 1.5, borderRadius: 12, padding: 14 },
  alertText:    { fontSize: 14, fontWeight: '600' },
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
