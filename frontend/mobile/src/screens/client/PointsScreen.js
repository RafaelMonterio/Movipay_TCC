import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import pointsService from '../../services/pointsService';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatPoints } from '../../utils/formatters';
import { LEVEL_THRESHOLDS, LEVEL_NAMES, LEVEL_ICONS, getLevelProgress } from '../../utils/levels';

export default function ClientPointsScreen() {
  const theme = useTheme();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bal, hist] = await Promise.all([
        pointsService.getBalance().catch(() => 0),
        pointsService.getHistory().catch(() => []),
      ]);
      setBalance(bal || 0);
      setHistory(hist || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={theme.primary} />;

  const { level, nextLevel, progress } = getLevelProgress(balance);

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20, gap: 18 }}
      data={history}
      keyExtractor={(i, idx) => String(i.id ?? idx)}
      onRefresh={load}
      refreshing={loading}
      ListHeaderComponent={
        <View style={{ gap: 18, marginBottom: 8 }}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Meus Pontos ⭐</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Acumule pontos e suba de nível</Text>
          </View>

          {/* Level card */}
          <View style={[styles.levelCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.levelHeader}>
              <Text style={{ fontSize: 30 }}>{LEVEL_ICONS[level]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelName, { color: theme.text }]}>{LEVEL_NAMES[level]}</Text>
                {nextLevel && (
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {nextLevel - balance} pts para {LEVEL_NAMES[level + 1]}
                  </Text>
                )}
              </View>
              <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 18 }}>{formatPoints(balance)}</Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
            </View>
          </View>

          {/* Level ladder */}
          <View style={styles.ladderRow}>
            {LEVEL_NAMES.map((name, i) => (
              <View
                key={name}
                style={[
                  styles.ladderItem,
                  {
                    borderColor: level >= i ? theme.primary : theme.border,
                    backgroundColor: level >= i ? theme.primaryBg : theme.card,
                    opacity: level >= i ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{LEVEL_ICONS[i]}</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text, marginTop: 2 }}>{name}</Text>
                <Text style={{ fontSize: 9, color: theme.textDisabled }}>{LEVEL_THRESHOLDS[i]}+</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Histórico</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 20 }}>
          Nenhuma movimentação de pontos ainda.
        </Text>
      }
      renderItem={({ item }) => (
        <View style={[styles.historyRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>{item.description || 'Movimentação'}</Text>
            {item.created_at && <Text style={{ color: theme.textDisabled, fontSize: 11 }}>{formatDate(item.created_at)}</Text>}
          </View>
          <Text style={{ color: item.amount >= 0 ? theme.accent : theme.error, fontWeight: '800' }}>
            {item.amount >= 0 ? '+' : ''}{item.amount} pts
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
  levelCard: { borderRadius: 18, borderWidth: 1.5, padding: 18, gap: 12 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelName: { fontSize: 17, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  ladderRow: { flexDirection: 'row', gap: 8 },
  ladderItem: { flex: 1, alignItems: 'center', borderRadius: 12, borderWidth: 1.5, paddingVertical: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  historyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 12, marginBottom: 8 },
});
