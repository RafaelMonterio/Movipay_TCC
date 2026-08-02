'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  { icon:'🔍', title:'Encontre profissionais', body:'Busque por categoria, leia avaliações e contrate com segurança em segundos.' },
  { icon:'⭐', title:'Sistema de pontos',       body:'Ganhe pontos a cada pedido concluído. Suba de nível e desbloqueie benefícios.' },
  { icon:'💬', title:'Chat integrado',           body:'Converse diretamente com o profissional pelo app, sem sair da plataforma.' },
  { icon:'🔧', title:'Trabalhe também',          body:'Alterne para o modo trabalhador e ofereça seus serviços quando quiser.' },
  { icon:'📅', title:'Agendamento simples',      body:'Organize sua agenda e acompanhe todos os compromissos num só lugar.' },
  { icon:'🛡️', title:'Pagamento seguro',         body:'Transações protegidas. Pague só quando o serviço for concluído.' },
];

const TESTIMONIALS = [
  { name:'Ana Paula', role:'Cliente', avatar:'A', text:'Encontrei um eletricista em 5 minutos. Serviço impecável e ainda ganhei pontos!', rating:5 },
  { name:'Bruno Silva', role:'Trabalhador', avatar:'B', text:'Minha agenda encheu em uma semana. A plataforma é simples e os pagamentos são rápidos.', rating:5 },
  { name:'Carla Souza', role:'Cliente', avatar:'C', text:'Já usei três vezes. Todo profissional foi pontual e competente. Recomendo demais!', rating:5 },
];

const CATEGORIES = [
  { icon:'🧹', name:'Limpeza' },
  { icon:'⚡', name:'Elétrica' },
  { icon:'🎨', name:'Pintura' },
  { icon:'🔧', name:'Encanamento' },
  { icon:'🌿', name:'Jardinagem' },
  { icon:'💻', name:'Informática' },
  { icon:'📦', name:'Mudança' },
  { icon:'📚', name:'Aulas' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(user.mode === 'worker' ? '/worker' : '/client');
    }
  }, [user, loading]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-4xl animate-bounce">🐜</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐜</span>
            <span className="font-black text-xl text-slate-800">MoviPay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">
              Entrar
            </Link>
            <Link href="/register"
              className="text-sm font-semibold text-white bg-client px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
          <div className="inline-flex items-center gap-2 bg-client/10 text-client text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🐜 Serviços locais, agora mais simples
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
            Conectando quem<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">
              precisa com quem sabe
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Encontre profissionais qualificados perto de você em segundos. Elétrica, limpeza, pintura e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all text-lg shadow-lg shadow-indigo-200">
              Começar agora — é grátis 🚀
            </Link>
            <Link href="/login"
              className="w-full sm:w-auto border-2 border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all text-lg">
              Já tenho conta
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16"
        >
          {[
            { value:'500+', label:'Profissionais' },
            { value:'2.000+', label:'Pedidos concluídos' },
            { value:'4.9⭐', label:'Avaliação média' },
            { value:'15min', label:'Tempo médio de resposta' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-slate-800">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Categorias ──────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-slate-800 text-center mb-10">O que você precisa?</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {CATEGORIES.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay: i*0.05 }} viewport={{ once:true }}
              >
                <Link href="/register"
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:shadow-md hover:border-client/30 border border-slate-100 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
                  <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{c.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">Tudo que você precisa</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Uma plataforma completa para contratar e oferecer serviços com segurança.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.08 }} viewport={{ once:true }}
                className="p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-client/10 rounded-2xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-500 to-violet-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Como funciona?</h2>
          <p className="text-indigo-100 text-lg mb-14">Em 3 passos simples</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step:'01', icon:'🔍', title:'Busque', body:'Procure o serviço que precisa e veja profissionais disponíveis na sua região.' },
              { step:'02', icon:'📋', title:'Contrate', body:'Escolha o profissional, veja o preço e confirme o pedido em segundos.' },
              { step:'03', icon:'⭐', title:'Avalie', body:'Após o serviço, avalie e ganhe pontos para usar na próxima vez.' },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.1 }} viewport={{ once:true }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4">{s.icon}</div>
                <div className="text-white/40 text-sm font-bold mb-1">{s.step}</div>
                <h3 className="text-white font-black text-lg mb-2">{s.title}</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ─────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 text-center mb-14">O que dizem nossos usuários</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.1 }} viewport={{ once:true }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {'★'.repeat(t.rating).split('').map((s,j) => (
                    <span key={j} className="text-amber-400 text-sm">{s}</span>
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-client to-violet-400 flex items-center justify-center text-white font-black">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-6xl mb-6 block">🐜</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              Pronto para começar?
            </h2>
            <p className="text-slate-500 text-lg mb-10">
              Junte-se a milhares de pessoas que já simplificaram sua vida com o MoviPay.
            </p>
            <Link href="/register"
              className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-10 py-5 rounded-2xl hover:opacity-90 transition-all text-lg shadow-xl shadow-indigo-200">
              Criar minha conta grátis 🚀
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐜</span>
            <span className="font-black text-slate-800">MoviPay</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 MoviPay — TCC ETEC Maria Cristina Medeiros</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700">Entrar</Link>
            <Link href="/register" className="text-sm text-slate-500 hover:text-slate-700">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
