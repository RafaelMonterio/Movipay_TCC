'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useForm, rules } from '@/hooks/useForm';

const STEPS = ['Dados', 'Perfil', 'Detalhes'];

function StepData({ form, inputRefs, restoreFocus }) {
  const Field = ({ name, label, type = 'text', placeholder, required }) => (
    <div>
      <label className="text-sm font-semibold text-slate-700 block mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        ref={el => {
          inputRefs.current[name] = el;
        }}
        name={name}
        type={type}
        autoComplete={name === 'email' ? 'email' : name === 'password' || name === 'confirmPassword' ? 'new-password' : name === 'phone' ? 'tel' : 'name'}
        value={form.values[name]}
        onChange={e => {
          form.handleChange(name, e.target.value);
          restoreFocus(name);
        }}
        onBlur={() => form.handleBlur(name)}
        placeholder={placeholder}
        spellCheck={false}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
          form.errors[name] && form.touched[name]
            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:ring-2 focus:ring-client/20 focus:border-client'
        }`}
      />
      {form.errors[name] && form.touched[name] && (
        <p className="text-xs text-red-500 mt-1">⚠ {form.errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Field name="name"            label="Nome completo"    placeholder="Seu nome completo"    required />
      <Field name="email"           label="E-mail"    type="email"    placeholder="seu@email.com"         required />
      <Field name="phone"           label="Telefone"  type="tel"      placeholder="(11) 99999-9999"       required />
      <Field name="password"        label="Senha"     type="password" placeholder="Mínimo 6 caracteres"   required />
      <Field name="confirmPassword" label="Confirmar senha" type="password" placeholder="Repita a senha" required />
    </div>
  );
}

function StepMode({ mode, setMode }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 text-center mb-2">
        Como você quer começar? Você pode mudar depois!
      </p>
      {[
        { value: 'client', icon: '📱', title: 'Sou cliente',      body: 'Quero contratar profissionais para meus serviços', color: 'border-client bg-client/5', check: 'bg-client' },
        { value: 'worker', icon: '🔧', title: 'Sou trabalhador', body: 'Quero oferecer meus serviços e ganhar dinheiro',   color: 'border-worker bg-worker/5', check: 'bg-worker' },
      ].map(opt => (
        <button key={opt.value} onClick={() => setMode(opt.value)}
          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
            mode === opt.value ? opt.color : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
              mode === opt.value ? 'bg-white/60' : 'bg-slate-100'
            }`}>
              {opt.icon}
            </div>
            <div className="flex-1">
              <p className="font-black text-slate-800 text-base">{opt.title}</p>
              <p className="text-slate-500 text-sm mt-0.5">{opt.body}</p>
            </div>
            {mode === opt.value && (
              <div className={`w-6 h-6 rounded-full ${opt.check} flex items-center justify-center text-white text-xs flex-shrink-0`}>✓</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function StepDetails({ mode, form }) {
  const isWorker = mode === 'worker';
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {isWorker ? '🔧 Conte sobre suas habilidades' : '📍 Onde você está?'}
      </p>

      {isWorker ? (
        <>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Foto de perfil <span className="text-slate-400 font-normal">(opcional)</span></label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-600">
                    {form.values.avatar_url ? <img src={form.values.avatar_url} className="w-full h-full object-cover" /> : form.values.name?.charAt(0) || '?' }
                  </div>
                  <div>
                    <input type="file" accept="image/*" id="reg-avatar" className="hidden" onChange={e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const r = new FileReader(); r.onload = ev => form.handleChange('avatar_url', ev.target.result); r.readAsDataURL(f);
                    }} />
                    <label htmlFor="reg-avatar" className="inline-block bg-white border rounded-xl px-3 py-2 text-sm cursor-pointer">Selecionar foto</label>
                    <p className="text-xs text-slate-400 mt-2">JPG/PNG/WebP — máximo 2MB. Será exibida no mapa e no perfil.</p>
                  </div>
                </div>
              </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Especialidade principal</label>
            <select value={form.values.category}
              onChange={e => form.handleChange('category', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-worker/20 focus:border-worker"
            >
              {[
                ['limpeza','🧹 Limpeza'], ['eletrica','⚡ Elétrica'], ['pintura','🎨 Pintura'],
                ['encanamento','🔧 Encanamento'], ['jardinagem','🌿 Jardinagem'],
                ['informatica','💻 Informática'], ['mudanca','📦 Mudança'],
                ['reforma','🏗️ Reforma'], ['cuidado-pessoal','💆 Cuidado Pessoal'], ['aulas','📚 Aulas'],
              ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              Bio profissional <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea value={form.values.bio}
              onChange={e => form.handleChange('bio', e.target.value)}
              placeholder="Ex: Eletricista com 10 anos de experiência. Atendo residências e comércios com qualidade e pontualidade..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-worker/20 focus:border-worker"
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">💡 Dica</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              Quanto mais detalhada sua bio, mais clientes você atrai. Mencione experiência, certificações e diferenciais.
            </p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Localização (bairro)</label>
            <select value={form.values.neighborhood}
              onChange={e => {
                const v = e.target.value;
                form.handleChange('neighborhood', v);
                // Mapear bairros para coordenadas conhecidas
                const MAP = {
                  'Centro': [-23.7060, -46.3685],
                  'Vila Nova': [-23.7032, -46.3642],
                  'Jardim das Flores': [-23.7073, -46.3709],
                };
                if (MAP[v]) { form.handleChange('lat', MAP[v][0]); form.handleChange('lng', MAP[v][1]); }
              }}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-worker/20 focus:border-worker"
            >
              <option value="">Selecione o bairro...</option>
              <option value="Centro">Centro</option>
              <option value="Vila Nova">Vila Nova</option>
              <option value="Jardim das Flores">Jardim das Flores</option>
            </select>
            <p className="text-xs text-slate-400 mt-2">A localização será usada para posicionar seu marcador no mapa (não digite).</p>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              Cidade / Bairro <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input value={form.values.city}
              onChange={e => form.handleChange('city', e.target.value)}
              placeholder="Ex: São Paulo, Moema"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              Como nos encontrou? <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <select value={form.values.referral}
              onChange={e => form.handleChange('referral', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
            >
              <option value="">Selecione...</option>
              <option value="indicacao">Indicação de amigo</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="escola">Escola / Faculdade</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [step, setStep]     = useState(0);
  const [mode, setMode]     = useState('client');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef({});

  const form = useForm(
    { name:'', email:'', phone:'', password:'', confirmPassword:'', bio:'', city:'', category:'limpeza', referral:'', avatar_url: '', lat: null, lng: null, neighborhood: '' },
    {
      name:            [rules.required(), rules.minLength(2, 'Nome muito curto')],
      email:           [rules.required(), rules.email()],
      phone:           [rules.required('Telefone obrigatório')],
      password:        [rules.required(), rules.minLength(6)],
      confirmPassword: [
        rules.required('Confirme a senha'),
        (v, all) => v !== all.password ? 'As senhas não coincidem' : '',
      ],
    }
  );

  function restoreFocus(name) {
    requestAnimationFrame(() => {
      const input = inputRefs.current[name];
      if (!input) return;
      if (document.activeElement !== input) {
        input.focus();
        const len = input.value?.length || 0;
        input.setSelectionRange?.(len, len);
      }
    });
  }

  function validateStep0() {
    const fields = ['name','email','phone','password','confirmPassword'];
    fields.forEach(f => form.handleBlur(f));
    const v = form.values;
    if (!v.name?.trim() || v.name.length < 2)           return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))   return false;
    if (!v.phone?.trim())                                return false;
    if (!v.password || v.password.length < 6)            return false;
    if (v.confirmPassword !== v.password)                return false;
    return true;
  }

  function handleNext() {
    if (step === 0 && !validateStep0()) {
      toast('Preencha todos os campos corretamente', 'warning');
      return;
    }
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      await register({
        name: form.values.name,
        email: form.values.email,
        password: form.values.password,
        mode,
        phone: form.values.phone,
        bio: form.values.bio,
        city: form.values.city,
        avatar_url: form.values.avatar_url,
        lat: form.values.lat,
        lng: form.values.lng,
        neighborhood: form.values.neighborhood,
        category: form.values.category,
      });
      toast('Conta criada! Bem-vindo ao MoviPay 🎉', 'success');
    } catch (err) {
      toast(err?.response?.data?.error || 'Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  }

  const isWorker  = mode === 'worker';
  const primary   = isWorker ? 'bg-worker hover:bg-amber-500' : 'bg-client hover:bg-indigo-600';
  const ring      = isWorker ? 'ring-worker/20' : 'ring-client/20';
  const stepColor = isWorker ? 'bg-worker' : 'bg-client';
  const barColor  = isWorker ? 'bg-worker' : 'bg-client';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 h-14 flex items-center px-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🐜</span>
          <span className="font-black text-slate-800">MoviPay</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-md">

          {/* Step indicators */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  i < step  ? `${stepColor} text-white` :
                  i === step ? `${stepColor} text-white ring-4 ${ring}` :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`ml-2 text-xs font-semibold ${i === step ? 'text-slate-800' : 'text-slate-400'}`}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded transition-all ${i < step ? barColor : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Progress bar */}
            <div className={`h-1 ${barColor} transition-all duration-500`}
              style={{ width: `${((step + 1) / 3) * 100}%` }} />

            <div className="p-7">
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">
                  {step === 0 ? 'Criar sua conta' : step === 1 ? 'Qual é o seu perfil?' : 'Últimos detalhes'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {step === 0 ? 'Passo 1 de 3 — Dados básicos' : step === 1 ? 'Passo 2 de 3 — Você pode mudar depois' : 'Passo 3 de 3 — Quase lá!'}
                </p>

                {step === 0 && <StepData form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} />}
                {step === 1 && <StepMode mode={mode} setMode={setMode} />}
                {step === 2 && <StepDetails mode={mode} form={form} />}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)}
                    className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm">
                    ← Voltar
                  </button>
                )}
                {step < 2 ? (
                  <button onClick={handleNext}
                    className={`flex-1 ${primary} text-white font-bold py-3 rounded-xl transition-all text-sm`}>
                    Próximo →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading}
                    className={`flex-1 ${primary} text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm`}>
                    {loading ? <><span className="animate-spin">⏳</span> Criando...</> : '🚀 Criar minha conta'}
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                Já tem conta?{' '}
                <Link href="/login" className="text-client font-semibold hover:underline">Entrar</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
