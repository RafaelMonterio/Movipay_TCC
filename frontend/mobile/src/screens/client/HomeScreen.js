import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import pointsService from '../../services/pointsService';
import workersService from '../../services/workersService';
import { formatPoints } from '../../utils/formatters';
import { LEVEL_NAMES, LEVEL_ICONS, getLevelProgress } from '../../utils/levels';

/* Mirrors the quick-action set from the web sidebar (src/components/layout/Sidebar.jsx)
   plus the extra shortcuts the web client dashboard (src/app/client/page.js) surfaces,
   so the mobile home screen offers the same destinations as the web one. */
const ACTIONS = [
  { icon: '🔍', label: 'Buscar Serviços', drawer: 'ClientTabs', tab: 'ClientSearch' },
  { icon: '📋', label: 'Orçamentos', drawer: 'ClientQuotes' },
  { icon: '🛒', label: 'Meus Pedidos', drawer: 'ClientTabs', tab: 'ClientOrders' },
  { icon: '💬', label: 'Chat', drawer: 'ClientChat' },
  { icon: '⭐', label: 'Meus Pontos', drawer: 'ClientPoints' },
  { icon: '👷', label: 'Trabalhadores', drawer: 'Workers' },
];

export default function ClientHomeScreen({ navigation }) {
  const { user, switchMode } = useAuth();
  const theme = useTheme();
  const [balance, setBalance] = useState(0);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bal, workers] = await Promise.all([
        pointsService.getBalance().catch(() => 0),
        workersService.getAll().catch(() => []),
      ]);
      setBalance(bal || 0);
      setNearby((workers || []).slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { level } = getLevelProgress(balance);

  function goTo(action) {
    if (action.tab) navigation.navigate(action.drawer, { screen: action.tab });
    else navigation.navigate(action.drawer);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={theme.primary} />}
    >
      {/* Header — hamburger opens the drawer (mobile equivalent of the
          always-visible web sidebar), greeting, and points/level badge. */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.getParent()?.openDrawer()} hitSlop={10} style={[styles.menuBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ fontSize: 18, color: theme.text }}>☰</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Olá, 👋</Text>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{user?.name}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('ClientPoints')} style={[styles.levelBadge, { backgroundColor: theme.primaryBg, borderColor: theme.primary }]}>
          <Text style={{ fontSize: 15 }}>{LEVEL_ICONS[level]}</Text>
          <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{formatPoints(balance)}</Text>
        </Pressable>
      </View>

      {/* Banner CTA — same copy/intent as the web hero card */}
      <View style={[styles.banner, { backgroundColor: theme.primary }]}>
        <Text style={styles.bannerTitle}>Precisa de um serviço?</Text>
        <Text style={styles.bannerSub}>Encontre profissionais perto de você</Text>
        <Pressable
          style={styles.bannerBtn}
          onPress={() => navigation.navigate('ClientTabs', { screen: 'ClientSearch' })}
        >
          <Text style={styles.bannerBtnText}>Buscar agora</Text>
        </Pressable>
      </View>

      {/* Quick actions — mirrors the web sidebar's link set */}
      <Text style={[styles.section, { color: theme.textSecondary }]}>Menu rápido</Text>
      <View style={styles.grid}>
        {ACTIONS.map(a => (
          <Pressable
            key={a.label}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => goTo(a)}
          >
            <Text style={styles.cardIcon}>{a.icon}</Text>
            <Text style={[styles.cardLabel, { color: theme.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Nearby professionals preview — mirrors the "profissionais perto
          de você" panel on the web dashboard (as a list, since there is
          no native map integration in the mobile app yet). */}
      <View style={styles.sectionRow}>
        <Text style={[styles.section, { color: theme.textSecondary }]}>Perto de você</Text>
        <Pressable onPress={() => navigation.navigate('Workers')}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>Ver todos</Text>
        </Pressable>
      </View>
      <View style={{ gap: 10 }}>
        {nearby.length === 0 ? (
          <Text style={{ color: theme.textDisabled, fontSize: 13 }}>Nenhum profissional disponível agora.</Text>
        ) : nearby.map((w, idx) => (
          <View key={w.id ?? idx} style={[styles.workerRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.workerAvatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.workerAvatarText}>{(w.name || '?')[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{w.name}</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={1}>{w.role || w.service}</Text>
            </View>
            <Text style={{ color: theme.mono, fontSize: 12 }}>⭐ {w.avg_rating ?? '—'}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.switchBtn, { borderColor: theme.primary }]}
        onPress={() => switchMode('worker')}
      >
        <Text style={[styles.switchText, { color: theme.primary }]}>
          🔧 Virar Trabalhador
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 14 },
  name: { fontSize: 20, fontWeight: '700' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1.5 },
  banner: { borderRadius: 20, padding: 24, gap: 8 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  bannerBtn: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, padding: 12, marginTop: 8, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#fff', fontWeight: '700' },
  section: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '31%', borderRadius: 16, borderWidth: 1.5, padding: 14, alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 26 },
  cardLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  workerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1.5, padding: 12 },
  workerAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  workerAvatarText: { color: '#fff', fontWeight: '800' },
  switchBtn: { borderWidth: 1.5, borderRadius: 12, padding: 16, alignItems: 'center' },
  switchText: { fontSize: 14, fontWeight: '600' },
});
