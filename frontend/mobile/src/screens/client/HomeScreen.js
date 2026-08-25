import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Buscar', route: 'ClientSearch' },
  { icon: '📋', label: 'Pedidos', route: 'ClientOrders' },
  { icon: '👤', label: 'Perfil', route: 'ClientProfile' },
];

const CATEGORIES = [
  { icon: '🧹', label: 'Limpeza', desc: 'Casa e escritório' },
  { icon: '⚡', label: 'Elétrica', desc: 'Instalações e reparos' },
  { icon: '🌿', label: 'Jardim', desc: 'Manutenção' },
  { icon: '📦', label: 'Mudança', desc: 'Transporte e montagem' },
  { icon: '✂️', label: 'Cabelo', desc: 'Estética e corte' },
  { icon: '🧱', label: 'Pedreiro', desc: 'Reformas' },
];

const NEARBY_WORKERS = [
  { name: 'Marina Souza', role: 'Cabeleireira', distance: '0,3 km', rating: '4,9', status: 'Disponível', accent: '#ff7a00' },
  { name: 'Eduardo Ramos', role: 'Eletricista', distance: '0,7 km', rating: '4,8', status: 'Disponível', accent: '#22d31b' },
  { name: 'Thiago Alves', role: 'Pedreiro', distance: '1,1 km', rating: '4,7', status: 'Disponível', accent: '#ff7a00' },
];

const HOW_STEPS = [
  { number: '01', title: 'Descreva o que precisa', text: 'Busque pelo serviço e veja profissionais disponíveis perto de você.' },
  { number: '02', title: 'Escolha o melhor', text: 'Compare avaliações, preço, distância e disponibilidade em segundos.' },
  { number: '03', title: 'Avaliando e ganhando', text: 'Após o atendimento, avalie e acumule pontos para novas contratações.' },
];

export default function ClientHomeScreen({ navigation }) {
  const { user, switchMode } = useAuth();
  const [query, setQuery] = useState('');

  const handleSearch = () => navigation.navigate('ClientSearch', { initialQuery: query.trim() });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, 👋</Text>
          <Text style={styles.name}>{user?.name || 'Cliente'}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Cliente</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>MoviPay</Text>
        <Text style={styles.heroTitle}>Precisa de um serviço rápido e confiável?</Text>
        <Text style={styles.heroSubtitle}>Profissionais verificados, perto de você e com resposta em poucos minutos.</Text>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar limpeza, elétrica, pintura..."
            placeholderTextColor="#7a8f83"
            value={query}
            onChangeText={setQuery}
          />
          <Pressable style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { value: '2,5k', label: 'serviços' },
          { value: '96%', label: 'satisfação' },
          { value: '15 min', label: 'resposta' },
        ].map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Menu rápido</Text>
      </View>

      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.route}
            style={styles.quickCard}
            onPress={() => navigation.navigate(action.route)}
          >
            <Text style={styles.quickIcon}>{action.icon}</Text>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Serviços populares</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {CATEGORIES.map((category) => (
          <Pressable key={category.label} style={styles.categoryCard} onPress={() => navigation.navigate('ClientSearch')}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <Text style={styles.categoryDesc}>{category.desc}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Perto de você</Text>
      </View>

      <View style={styles.workerList}>
        {NEARBY_WORKERS.map((worker) => (
          <Pressable key={worker.name} style={styles.workerCard} onPress={() => navigation.navigate('ClientSearch')}>
            <View style={[styles.workerDot, { backgroundColor: worker.accent }]} />
            <View style={styles.workerAvatar}>
              <Text style={styles.workerAvatarText}>{worker.name.split(' ').map((x) => x[0]).slice(0,2).join('')}</Text>
            </View>
            <View style={styles.workerMeta}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerRole}>{worker.role}</Text>
              <View style={styles.workerRow}>
                <Text style={styles.workerMetric}>⭐ {worker.rating}</Text>
                <Text style={styles.workerMetric}>📍 {worker.distance}</Text>
              </View>
            </View>
            <View style={styles.workerBadge}>
              <Text style={styles.workerBadgeText}>{worker.status}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Como funciona</Text>
      </View>

      <View style={styles.stepsCard}>
        {HOW_STEPS.map((step) => (
          <View key={step.number} style={styles.stepItem}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{step.number}</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.switchBtn} onPress={() => switchMode('worker')}>
        <Text style={styles.switchBtnText}>🔧 Virar trabalhador</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7f3',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#5c7568',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    color: '#12261b',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 3,
  },
  badge: {
    backgroundColor: '#ff7a00',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5efe7',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroEyebrow: {
    color: '#ff7a00',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#12261b',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 10,
  },
  heroSubtitle: {
    color: '#5c7568',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  searchWrap: {
    marginTop: 16,
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#f7faf7',
    borderColor: '#dfe9e3',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#12261b',
  },
  searchBtn: {
    backgroundColor: '#ff7a00',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    shadowColor: '#ff7a00',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5efe7',
  },
  statValue: {
    color: '#12261b',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#5c7568',
    fontSize: 11,
    marginTop: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    color: '#12261b',
    fontSize: 18,
    fontWeight: '800',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dfe9e3',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  quickIcon: {
    fontSize: 26,
  },
  quickLabel: {
    color: '#12261b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  categoriesRow: {
    gap: 12,
    paddingRight: 10,
  },
  categoryCard: {
    width: 138,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dfe9e3',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryLabel: {
    color: '#12261b',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  categoryDesc: {
    color: '#5c7568',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  workerList: {
    gap: 12,
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe9e3',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  workerDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f0f7f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workerAvatarText: {
    fontWeight: '800',
    color: '#12261b',
    fontSize: 14,
  },
  workerMeta: {
    flex: 1,
  },
  workerName: {
    color: '#12261b',
    fontSize: 15,
    fontWeight: '800',
  },
  workerRole: {
    color: '#5c7568',
    fontSize: 12,
    marginTop: 2,
  },
  workerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  workerMetric: {
    color: '#12261b',
    fontSize: 11,
    fontWeight: '700',
  },
  workerBadge: {
    backgroundColor: '#eef9ee',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  workerBadgeText: {
    color: '#1f8f2c',
    fontWeight: '700',
    fontSize: 10,
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dfe9e3',
    padding: 16,
    gap: 14,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff5ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ff7a00',
    fontWeight: '900',
    fontSize: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#12261b',
    fontWeight: '800',
    fontSize: 14,
  },
  stepText: {
    color: '#5c7568',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  switchBtn: {
    borderWidth: 1.5,
    borderColor: '#22d31b',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fff0',
  },
  switchBtnText: {
    color: '#1b9b28',
    fontWeight: '800',
    fontSize: 14,
  },
});
