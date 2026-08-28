import React from 'react';
import { View, Text, Pressable, Image, ScrollView, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/* Same link sets, order, icons and labels as src/components/layout/Sidebar.jsx
   on the web app, so the drawer menu matches the site's sidebar exactly.
   `drawer` is the top-level Drawer screen; `tab`, when present, is the
   nested Tab screen to focus inside it (needed because the Drawer doesn't
   know which tab to open on its own). */
const clientLinks = [
  { drawer: 'ClientTabs', tab: 'ClientHome', activeName: 'ClientHome', icon: '🏠', label: 'Home' },
  { drawer: 'ClientTabs', tab: 'ClientSearch', activeName: 'ClientSearch', icon: '🔍', label: 'Serviços' },
  { drawer: 'ClientQuotes', activeName: 'ClientQuotes', icon: '📋', label: 'Orçamentos' },
  { drawer: 'ClientTabs', tab: 'ClientOrders', activeName: 'ClientOrders', icon: '🛒', label: 'Pedidos' },
  { drawer: 'ClientChat', activeName: 'ClientChat', icon: '💬', label: 'Chat' },
  { drawer: 'ClientTabs', tab: 'ClientProfile', activeName: 'ClientProfile', icon: '👤', label: 'Perfil' },
];

const workerLinks = [
  { drawer: 'WorkerTabs', tab: 'WorkerHome', activeName: 'WorkerHome', icon: '🏠', label: 'Início' },
  { drawer: 'WorkerTabs', tab: 'WorkerOrders', activeName: 'WorkerOrders', icon: '📋', label: 'Pedidos' },
  { drawer: 'WorkerOpportunities', activeName: 'WorkerOpportunities', icon: '🎯', label: 'Oportunidades' },
  { drawer: 'WorkerEarnings', activeName: 'WorkerEarnings', icon: '💰', label: 'Ganhos' },
  { drawer: 'WorkerTabs', tab: 'WorkerCalendar', activeName: 'WorkerCalendar', icon: '📅', label: 'Calendário' },
  { drawer: 'WorkerChat', activeName: 'WorkerChat', icon: '💬', label: 'Chat' },
  { drawer: 'WorkerTabs', tab: 'WorkerProfile', activeName: 'WorkerProfile', icon: '👤', label: 'Perfil' },
];

export default function Sidebar({ state, navigation }) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isWorker = user?.mode === 'worker';
  const links = isWorker ? workerLinks : clientLinks;

  // The active route lives inside the nested Tab/Stack navigator embedded
  // in this Drawer screen — find its currently-focused route name so the
  // matching sidebar entry is highlighted the same way the web app does.
  const activeRouteName = getActiveRouteName(state);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={[styles.logoRow, { borderBottomColor: theme.border }]}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="cover" onError={() => {}} />
          <Text style={styles.logoText}>
            <Text style={{ color: '#FF7A00' }}>Movi</Text>
            <Text style={{ color: '#22D31B' }}>Pay</Text>
          </Text>
        </View>

        {/* Nav links */}
        <View style={styles.nav}>
          {links.map(l => {
            const active = activeRouteName === l.activeName;
            return (
              <Pressable
                key={l.activeName}
                onPress={() => {
                  navigation.closeDrawer?.();
                  if (l.tab) navigation.navigate(l.drawer, { screen: l.tab });
                  else navigation.navigate(l.drawer);
                }}
                style={[
                  styles.link,
                  {
                    backgroundColor: active ? theme.primaryBg : 'transparent',
                    borderColor: active ? theme.primary : 'transparent',
                  },
                ]}
              >
                <Text style={styles.linkIcon}>{l.icon}</Text>
                <Text style={[styles.linkLabel, { color: active ? theme.primary : theme.textSecondary, fontWeight: active ? '700' : '500' }]}>
                  {l.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Dark mode toggle — same behaviour as the accessibility menu on
            the web app, kept reachable right from the sidebar. */}
        <View style={[styles.darkModeRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>
            {theme.darkMode ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </Text>
          <Switch
            value={theme.darkMode}
            onValueChange={theme.toggleDarkMode}
            trackColor={{ false: '#ccc', true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>

      {/* Logout */}
      <Pressable
        onPress={logout}
        style={[styles.logoutBtn, { marginBottom: insets.bottom + 12 }]}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

function getActiveRouteName(state) {
  if (!state || !state.routes || state.routes.length === 0) return null;
  const route = state.routes[state.index ?? 0];
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 14 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 18, borderBottomWidth: 1, marginBottom: 10 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  logoText: { fontSize: 22, fontWeight: '900' },
  nav: { gap: 4, marginTop: 6 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  linkIcon: { fontSize: 18 },
  linkLabel: { fontSize: 14 },
  darkModeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, borderWidth: 1, marginTop: 18 },
  logoutBtn: { backgroundColor: '#FF7A00', borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
