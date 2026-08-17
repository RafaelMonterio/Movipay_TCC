import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateLoginForm, validateRegisterForm } from '../utils/validators';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const theme = useTheme();
  const [isLogin, setIsLogin]   = useState(true);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  async function handleSubmit() {
    const errs = isLogin
      ? validateLoginForm(email, password)
      : validateRegisterForm(name, email, password);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      setLoading(true);
      if (isLogin) await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.error || 'Algo deu errado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.logo}>🐜</Text>
      <Text style={[styles.title, { color: theme.text }]}>MoviPay</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>Conectando serviços locais</Text>

      <View style={styles.form}>
        {!isLogin && (
          <Input label="Nome" placeholder="Seu nome" value={name} onChangeText={setName} error={errors.name} />
        )}
        <Input label="E-mail" placeholder="seu@email.com" value={email} onChangeText={setEmail}
          error={errors.email} autoCapitalize="none" keyboardType="email-address" />
        <Input label="Senha" placeholder="••••••" value={password} onChangeText={setPassword}
          error={errors.password} secureTextEntry />

        <Button label={isLogin ? 'Entrar' : 'Cadastrar'} onPress={handleSubmit} loading={loading} />

        <Pressable onPress={() => { setIsLogin(!isLogin); setErrors({}); }} style={styles.toggle}>
          <Text style={[styles.toggleText, { color: theme.primary }]}>
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </Text>
        </Pressable>

        <View style={[styles.hint, { borderColor: theme.border }]}>
          <Text style={[styles.hintTitle, { color: theme.textSecondary }]}>📋 Contas de teste (sem backend):</Text>
          <Text style={[styles.hintText, { color: theme.textDisabled }]}>teste@movipay.com / teste123</Text>
          <Text style={[styles.hintText, { color: theme.textDisabled }]}>empresa@movipay.com / teste123</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  logo:      { fontSize: 56, textAlign: 'center' },
  title:     { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  sub:       { fontSize: 15, textAlign: 'center', marginBottom: 40 },
  form:      { gap: 14 },
  toggle:    { alignItems: 'center', paddingVertical: 8 },
  toggleText:{ fontSize: 14, fontWeight: '500' },
  hint: { borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', padding: 12, gap: 4, marginTop: 8 },
  hintTitle: { fontSize: 12, fontWeight: '600' },
  hintText:  { fontSize: 12 },
});
