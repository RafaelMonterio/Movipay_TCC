import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import { validateLoginForm, validateRegisterForm } from '../utils/validators';

const ORANGE = '#ff7a00';
const ORANGE_DARK = '#ef6c00';
const GREEN = '#22d31b';
const GREEN_DARK = '#1ab516';
const CARD_BG = '#ffffff';
const BG = '#f5f7f3';
const TEXT = '#12261b';
const MUTED = '#5c7568';
const BORDER = '#dfe9e3';
const SOFT = '#f0f7f2';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit() {
    const errs = isLogin
      ? validateLoginForm(email, password)
      : validateRegisterForm(name, email, password);

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      if (isLogin) await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      Alert.alert('Erro', err?.message || err?.response?.data?.error || 'Algo deu errado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topGlow} />
      <View style={styles.brandWrap}>
        <View style={styles.brandBadge}><Text style={styles.brandIcon}>M</Text></View>
        <Text style={styles.brandName}>MoviPay</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? 'Entrar' : 'Criar conta'}</Text>
        <Text style={styles.subTitle}>Conectando serviços locais</Text>

        {!isLogin && (
          <Input
            label="Nome completo"
            placeholder="Seu nome completo"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
          />
        )}

        <Input
          label="E-mail"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || loading) && styles.primaryButtonPressed,
          ]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>}
        </Pressable>

        <Pressable onPress={() => { setIsLogin(!isLogin); setErrors({}); }} style={styles.toggleWrap}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Contas de teste</Text>
          <Text style={styles.demoText}>ana@teste.com / 123456</Text>
          <Text style={styles.demoText}>bruno@teste.com / 123456</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(34, 211, 27, 0.08)',
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  brandBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e7f5ea',
  },
  brandIcon: {
    fontSize: 26,
    fontWeight: '900',
    color: ORANGE,
  },
  brandName: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryButtonPressed: {
    backgroundColor: ORANGE_DARK,
    opacity: 0.95,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  toggleWrap: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  toggleText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 18,
  },
  demoCard: {
    backgroundColor: SOFT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3f0e5',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  demoTitle: {
    color: MUTED,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  demoText: {
    color: '#6b7a70',
    fontSize: 12,
    marginTop: 2,
  },
});
