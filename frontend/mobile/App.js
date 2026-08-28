import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ModeProvider } from './src/context/ModeContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import LoginScreen from './src/screens/LoginScreen';
import Sidebar from './src/components/layout/Sidebar';

// Client screens
import ClientHome from './src/screens/client/HomeScreen';
import ClientSearch from './src/screens/client/SearchScreen';
import ClientOrders from './src/screens/client/OrdersScreen';
import ClientProfile from './src/screens/client/ProfileScreen';
import ClientQuotes from './src/screens/client/QuotesScreen';
import ClientPoints from './src/screens/client/PointsScreen';
import WorkersScreen from './src/screens/client/WorkersScreen';

// Worker screens
import WorkerHome from './src/screens/worker/HomeScreen';
import WorkerOrders from './src/screens/worker/OrdersScreen';
import WorkerOpportunities from './src/screens/worker/OpportunitiesScreen';
import WorkerProfile from './src/screens/worker/ProfileScreen';
import WorkerEarnings from './src/screens/worker/EarningsScreen';

// Calendar screen from original project
import CalendarScreen from './src/screens/worker/CalendarScreen';

// Shared
import ChatScreen from './src/screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

/* ── Bottom tabs (same 4 primary destinations as before) ───────────── */
function ClientTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textDisabled,
        tabBarStyle: { borderTopColor: theme.border, backgroundColor: theme.background },
        tabBarLabel: ({ color }) => {
          const labels = { ClientHome: 'Início', ClientSearch: 'Buscar', ClientOrders: 'Pedidos', ClientProfile: 'Perfil' };
          return <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{labels[route.name]}</Text>;
        },
        tabBarIcon: ({ color }) => {
          const icons = { ClientHome: '🏠', ClientSearch: '🔍', ClientOrders: '📋', ClientProfile: '👤' };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="ClientHome" component={ClientHome} />
      <Tab.Screen name="ClientSearch" component={ClientSearch} />
      <Tab.Screen name="ClientOrders" component={ClientOrders} />
      <Tab.Screen name="ClientProfile" component={ClientProfile} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textDisabled,
        tabBarStyle: { borderTopColor: theme.border, backgroundColor: theme.background },
        tabBarLabel: ({ color }) => {
          const labels = { WorkerHome: 'Início', WorkerCalendar: 'Agenda', WorkerOrders: 'Pedidos', WorkerProfile: 'Perfil' };
          return <Text style={{ color, fontSize: 11, fontWeight: '600' }}>{labels[route.name]}</Text>;
        },
        tabBarIcon: ({ color }) => {
          const icons = { WorkerHome: '🏠', WorkerCalendar: '📅', WorkerOrders: '📋', WorkerProfile: '👤' };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="WorkerHome" component={WorkerHome} />
      <Tab.Screen name="WorkerCalendar" component={CalendarScreen} />
      <Tab.Screen name="WorkerOrders" component={WorkerOrders} />
      <Tab.Screen name="WorkerProfile" component={WorkerProfile} />
    </Tab.Navigator>
  );
}

/* ── Drawer (mobile equivalent of the web Sidebar) ──────────────────
   Wraps the tab navigator plus every other link the web sidebar has
   (Orçamentos, Chat, Pontos, Trabalhadores, Ganhos, Oportunidades) so
   every screen reachable on the web is reachable on mobile too. */
function ClientDrawer() {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.35)',
        drawerStyle: { width: 260, backgroundColor: theme.background },
      }}
      drawerContent={(props) => <Sidebar {...props} />}
    >
      <Drawer.Screen name="ClientTabs" component={ClientTabs} />
      <Drawer.Screen name="ClientQuotes" component={ClientQuotes} options={{ headerShown: true, title: 'Orçamentos' }} />
      <Drawer.Screen name="ClientChat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
      <Drawer.Screen name="ClientPoints" component={ClientPoints} options={{ headerShown: true, title: 'Meus Pontos' }} />
      <Drawer.Screen name="Workers" component={WorkersScreen} options={{ headerShown: true, title: 'Trabalhadores' }} />
    </Drawer.Navigator>
  );
}

function WorkerDrawer() {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.35)',
        drawerStyle: { width: 260, backgroundColor: theme.background },
      }}
      drawerContent={(props) => <Sidebar {...props} />}
    >
      <Drawer.Screen name="WorkerTabs" component={WorkerTabs} />
      <Drawer.Screen name="WorkerOpportunities" component={WorkerOpportunities} options={{ headerShown: true, title: 'Oportunidades' }} />
      <Drawer.Screen name="WorkerEarnings" component={WorkerEarnings} options={{ headerShown: true, title: 'Ganhos' }} />
      <Drawer.Screen name="WorkerChat" component={ChatScreen} options={{ headerShown: true, title: 'Chat' }} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.mode === 'worker' ? (
          <Stack.Screen name="WorkerDrawer" component={WorkerDrawer} />
        ) : (
          <Stack.Screen name="ClientDrawer" component={ClientDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ModeProvider>
          <ThemeProvider>
            <AppNavigator />
          </ThemeProvider>
        </ModeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
