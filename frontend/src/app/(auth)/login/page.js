'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useForm, rules } from '@/hooks/useForm';

export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();

  const form = useForm(
    { email: '', password: '' },
    {
      email:    [rules.required(), rules.email()],
      password: [rules.required(), rules.minLength(6)],
    }
  );

  async function handleSubmit(e) {
    e.preventDefault();
    form.handleBlur('email');
    form.handleBlur('password');
    if (!form.values.email || !form.values.password) return;

    await form.handleSubmit(async values => {
      try {
        await login(values.email, values.password);
      } catch (err) {
        toast(err?.response?.data?.error || 'Credenciais inválidas', 'error');
      }
    });
  }

  function fillTest(email) {
    form.handleChange('email', email);
    form.handleChange('password', '123456');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 h-14 flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🐜</span>
          <span className="font-black text-slate-800">MoviPay</span>
        </Link>
        <Link href="/register" className="text-sm font-semibold text-client hover:underline">
          Criar conta
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-client/10 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">🐜</div>
            <h1 className="text-2xl font-black text-slate-800">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm mt-1">Entre na sua conta MoviPay</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={form.values.email}
                  onChange={e => form.handleChange('email', e.target.value)}
                  onBlur={() => form.handleBlur('email')}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    form.errors.email && form.touched.email
                      ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:ring-2 focus:ring-client/20 focus:border-client'
                  }`}
                />
                {form.errors.email && form.touched.email && (
                  <p className="text-xs text-red-500 mt-1">⚠ {form.errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Senha</label>
                  <button type="button" className="text-xs text-client hover:underline font-medium">
                    Esqueci a senha
                  </button>
                </div>
                <input
                  type="password"
                  value={form.values.password}
                  onChange={e => form.handleChange('password', e.target.value)}
                  onBlur={() => form.handleBlur('password')}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    form.errors.password && form.touched.password
                      ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:ring-2 focus:ring-client/20 focus:border-client'
                  }`}
                />
                {form.errors.password && form.touched.password && (
                  <p className="text-xs text-red-500 mt-1">⚠ {form.errors.password}</p>
                )}
              </div>

              <motion.button whileTap={{ scale:0.98 }} type="submit" disabled={form.submitting}
                className="w-full bg-client hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {form.submitting ? <span className="animate-spin text-sm">⏳</span> : null}
                {form.submitting ? 'Entrando...' : 'Entrar'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">ou use uma conta de teste</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Test accounts */}
            <div className="space-y-2">
              <button onClick={() => fillTest('ana@teste.com')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-client/30 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-client/10 text-client flex items-center justify-center font-black text-sm flex-shrink-0">A</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Ana Cliente</p>
                  <p className="text-xs text-slate-400">ana@teste.com</p>
                </div>
                <span className="ml-auto text-xs text-slate-300">→</span>
              </button>
              <button onClick={() => fillTest('bruno@teste.com')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-worker/30 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-worker/10 text-worker flex items-center justify-center font-black text-sm flex-shrink-0">B</div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Bruno Trabalhador</p>
                  <p className="text-xs text-slate-400">bruno@teste.com</p>
                </div>
                <span className="ml-auto text-xs text-slate-300">→</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Não tem conta?{' '}
            <Link href="/register" className="text-client font-semibold hover:underline">Criar gratuitamente</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
