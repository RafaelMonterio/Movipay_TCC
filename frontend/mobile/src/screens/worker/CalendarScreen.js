import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import EventCard from '../../components/calendar/EventCard';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function CalendarScreen() {
  const theme = useTheme();
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    api.get('/calendar/events', { params: { month: monthStr } })
      .then(r => setEvents(r.data.events))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os eventos.'))
      .finally(() => setLoading(false));
  }, [monthStr]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Month nav */}
      <View style={[styles.nav, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Pressable onPress={prevMonth} style={[styles.navBtn, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.navArrow, { color: theme.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text }]}>{MONTHS[month]} {year}</Text>
        <Pressable onPress={nextMonth} style={[styles.navBtn, { backgroundColor: theme.backgroundAlt }]}>
          <Text style={[styles.navArrow, { color: theme.text }]}>›</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Nenhum evento em {MONTHS[month]}/{year}
              </Text>
            </View>
          }
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  nav:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  navBtn:      { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navArrow:    { fontSize: 22, fontWeight: '700' },
  navTitle:    { fontSize: 17, fontWeight: '700' },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 14 },
});
