import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ModeProvider }          from './src/context/ModeContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import LoginScreen from './src/screens/LoginScreen';

// Client screens
import ClientHome    from './src/screens/client/HomeScreen';
import ClientSearch  from './src/screens/client/SearchScreen';
import ClientOrders  from './src/screens/client/OrdersScreen';
import ClientProfile from './src/screens/client/ProfileScreen';

// Worker screens
import WorkerHome          from './src/screens/worker/HomeScreen';
import WorkerOrders        from './src/screens/worker/OrdersScreen';
import WorkerOpportunities from './src/screens/worker/OpportunitiesScreen';
import WorkerProfile       from './src/screens/worker/ProfileScreen';

// Calendar screen from original project
import CalendarScreen from './src/screens/worker/CalendarScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function ClientTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.clientPrimary,
        tabBarInactiveTintColor: theme.textDisabled,
        tabBarStyle: { borderTopColor: theme.border },
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
      <Tab.Screen name="ClientHome"    component={ClientHome} />
      <Tab.Screen name="ClientSearch"  component={ClientSearch} />
      <Tab.Screen name="ClientOrders"  component={ClientOrders} />
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
        tabBarActiveTintColor: theme.workerPrimary,
        tabBarInactiveTintColor: theme.textDisabled,
        tabBarStyle: { borderTopColor: theme.border },
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
      <Tab.Screen name="WorkerHome"     component={WorkerHome} />
      <Tab.Screen name="WorkerCalendar" component={CalendarScreen} />
      <Tab.Screen name="WorkerOrders"   component={WorkerOrders} />
      <Tab.Screen name="WorkerProfile"  component={WorkerProfile} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { isWorker } = useTheme() || {};

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.mode === 'worker' ? (
          <>
            <Stack.Screen name="WorkerTabs"          component={WorkerTabs} />
            <Stack.Screen name="WorkerOpportunities" component={WorkerOpportunities} options={{ headerShown: true, title: 'Oportunidades' }} />
          </>
        ) : (
          <Stack.Screen name="ClientTabs" component={ClientTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </ModeProvider>
    </AuthProvider>
  );
}
