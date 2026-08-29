'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useForm, rules } from '@/hooks/useForm';
import { useTheme, getThemeColors } from '@/context/ThemeContext';
import FallingLeaves from '@/components/effects/FallingLeaves';

const STEPS = ['Dados', 'Perfil', 'Detalhes'];

/* ─── SVG ICONS ─────────────────────────────────────────────────── */
function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'check': return <svg {...p}><polyline points="20 6 9 17 4 12" /></svg>;
    case 'arrowRight': return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case 'arrowLeft': return <svg {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
    case 'user': return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case 'mail': return <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
    case 'phone': return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
    case 'lock': return <svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    case 'eye': return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'eyeOff': return <svg {...p}><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.7 19.7 0 0 1 4.22-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
    case 'client': return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>;
    case 'worker': return <svg {...p}><path d="M21 7l-3.5 3.5a3 3 0 0 1-4.2 0l-1-1a3 3 0 0 1 0-4.2L15.8 2 21 7z" /><path d="M14 10L3 21" /></svg>;
    case 'camera': return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
    case 'mapPin': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 2l1.5 5h5L14 10.5l1.5 5L12 13l-3.5 2.5L10 10.5 5.5 7h5z" /></svg>;
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4.5" /><line x1="12" y1="1.5" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22.5" /><line x1="4.2" y1="4.2" x2="6" y2="6" /><line x1="18" y1="18" x2="19.8" y2="19.8" /><line x1="1.5" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22.5" y2="12" /></svg>;
    case 'moon': return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
    case 'leaf': return <svg {...p}><path d="M5 21c0-9 6-15 15-15-1 9-7 15-15 15z" /><path d="M5 21c3-3 6-6 9-9" /></svg>;
    default: return null;
  }
}

/* ─── FIELD ─────────────────────────────────────────────────────── */
function Field({ name, label, type = 'text', placeholder, required, form, inputRefs, restoreFocus, icon, theme, togglePassword, showPassword }) {
  const hasError = form.errors[name] && form.touched[name];
  return (
    <div>
      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, display: 'block', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#FF3B5C' }}>*</span>}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 14, display: 'flex', color: hasError ? '#FF3B5C' : theme.textMuted, pointerEvents: 'none' }}>
            <Icon name={icon} size={16} />
          </span>
        )}
        <input
          ref={el => { inputRefs.current[name] = el; }}
          name={name}
          type={togglePassword ? (showPassword ? 'text' : 'password') : type}
          autoComplete={name === 'email' ? 'email' : name === 'password' || name === 'confirmPassword' ? 'new-password' : name === 'phone' ? 'tel' : 'name'}
          value={form.values[name]}
          onChange={e => { form.handleChange(name, e.target.value); restoreFocus(name); }}
          onBlur={() => form.handleBlur(name)}
          placeholder={placeholder}
          spellCheck={false}
          className="reg-input"
          style={{
            width: '100%', borderRadius: 12, padding: `12px 14px 12px ${icon ? 38 : 14}px`,
            paddingRight: togglePassword ? 42 : 14,
            fontSize: '0.88rem', fontFamily: 'var(--body)', outline: 'none',
            background: theme.inputBg, color: theme.text,
            border: `1.5px solid ${hasError ? '#FF3B5C' : theme.line}`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
        {togglePassword && (
          <button type="button" onClick={() => togglePassword(v => !v)} style={{ position: 'absolute', right: 12, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: theme.textMuted }} tabIndex={-1} aria-label="Mostrar senha">
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ fontSize: '0.72rem', color: '#FF3B5C', marginTop: 5, fontWeight: 600 }}>
            {form.errors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── STEP 1 · DADOS ────────────────────────────────────────────── */
function StepData({ form, inputRefs, restoreFocus, theme, showPw, setShowPw, showPw2, setShowPw2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field name="name" label="Nome completo" placeholder="Seu nome completo" required icon="user" form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} theme={theme} />
      <Field name="email" label="E-mail" type="email" placeholder="seu@email.com" required icon="mail" form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} theme={theme} />
      <Field name="phone" label="Telefone" type="tel" placeholder="(11) 99999-9999" required icon="phone" form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} theme={theme} />
      <Field name="password" label="Senha" placeholder="Mínimo 6 caracteres" required icon="lock" form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} theme={theme} togglePassword={setShowPw} showPassword={showPw} />
      <Field name="confirmPassword" label="Confirmar senha" placeholder="Repita a senha" required icon="lock" form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} theme={theme} togglePassword={setShowPw2} showPassword={showPw2} />
    </div>
  );
}

/* ─── STEP 2 · MODO ─────────────────────────────────────────────── */
function StepMode({ mode, setMode, theme }) {
  const options = [
    { value: 'client', icon: 'client', title: 'Sou cliente', body: 'Quero contratar profissionais para meus serviços', accent: '#22D31B' },
    { value: 'worker', icon: 'worker', title: 'Sou prestador', body: 'Quero oferecer meus serviços e ganhar dinheiro', accent: '#FF7A00' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: '0.85rem', color: theme.textMuted, textAlign: 'center', marginBottom: 4 }}>
        Como você quer começar? Você pode mudar depois nas configurações.
      </p>
      {options.map((opt, i) => {
        const active = mode === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => setMode(opt.value)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3, boxShadow: `0 14px 34px ${opt.accent}22` }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: 18, borderRadius: 18, textAlign: 'left', cursor: 'pointer',
              border: `2px solid ${active ? opt.accent : theme.line}`,
              background: active ? `${opt.accent}12` : theme.cardBg,
              transition: 'border-color 0.25s, background 0.25s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <motion.div
                animate={active ? { scale: [1, 1.12, 1], rotate: [0, -6, 0] } : {}}
                transition={{ duration: 0.5 }}
                style={{ width: 52, height: 52, borderRadius: 16, background: active ? `${opt.accent}22` : theme.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon name={opt.icon} size={24} color={active ? opt.accent : theme.textMuted} />
              </motion.div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1rem', color: theme.text }}>{opt.title}</p>
                <p style={{ fontSize: '0.8rem', color: theme.textMuted, marginTop: 2 }}>{opt.body}</p>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${active ? opt.accent : theme.line}`,
                background: active ? opt.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}>
                <AnimatePresence>
                  {active && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ color: '#fff', display: 'flex' }}>
                      <Icon name="check" size={13} color="#fff" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

const CATEGORY_OPTIONS = [
  ['limpeza', '🧹 Limpeza'], ['eletrica', '⚡ Elétrica'], ['pintura', '🎨 Pintura'],
  ['encanamento', '🔧 Encanamento'], ['jardinagem', '🌿 Jardinagem'],
  ['informatica', '💻 Informática'], ['mudanca', '📦 Mudança'],
  ['reforma', '🏗️ Reforma'], ['cuidado-pessoal', '💆 Cuidado Pessoal'], ['aulas', '📚 Aulas'],
];

const NEIGHBORHOOD_MAP = {
  'Centro': [-23.7060, -46.3685],
  'Vila Nova': [-23.7032, -46.3642],
  'Jardim das Flores': [-23.7073, -46.3709],
};

/* ─── SELECT (styled) ───────────────────────────────────────────── */
function Select({ label, value, onChange, children, theme, optional }) {
  return (
    <div>
      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, display: 'block', marginBottom: 6 }}>
        {label} {optional && <span style={{ color: theme.textMuted, fontWeight: 500 }}>(opcional)</span>}
      </label>
      <select value={value} onChange={onChange} style={{
        width: '100%', borderRadius: 12, padding: '12px 14px', fontSize: '0.88rem', fontFamily: 'var(--body)',
        outline: 'none', background: theme.inputBg, color: theme.text, border: `1.5px solid ${theme.line}`, cursor: 'pointer',
      }}>
        {children}
      </select>
    </div>
  );
}

/* ─── STEP 3 · DETALHES ─────────────────────────────────────────── */
function StepDetails({ mode, form, theme }) {
  const isWorker = mode === 'worker';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: '0.85rem', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={isWorker ? 'worker' : 'mapPin'} size={15} color="#FF7A00" />
        {isWorker ? 'Conte sobre suas habilidades' : 'Onde você está?'}
      </p>

      {isWorker ? (
        <>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, display: 'block', marginBottom: 8 }}>
              Foto de perfil <span style={{ color: theme.textMuted, fontWeight: 500 }}>(opcional)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <motion.div whileHover={{ scale: 1.05 }} style={{
                width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: theme.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.4rem', color: theme.textMuted, border: `2px solid ${theme.line}`,
              }}>
                {form.values.avatar_url ? <img src={form.values.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.values.name?.charAt(0) || '?')}
              </motion.div>
              <div>
                <input type="file" accept="image/*" id="reg-avatar" style={{ display: 'none' }} onChange={e => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const r = new FileReader(); r.onload = ev => form.handleChange('avatar_url', ev.target.result); r.readAsDataURL(f);
                }} />
                <label htmlFor="reg-avatar" style={{ display: 'inline-block', background: theme.cardBg, border: `1.5px solid ${theme.line}`, borderRadius: 10, padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, color: theme.text, cursor: 'pointer' }}>
                  <Icon name="camera" size={13} style={{ marginRight: 6, verticalAlign: -2 }} /> Selecionar foto
                </label>
                <p style={{ fontSize: '0.68rem', color: theme.textMuted, marginTop: 8 }}>JPG/PNG/WebP — máximo 2MB.</p>
              </div>
            </div>
          </div>

          <Select label="Especialidade principal" value={form.values.category} onChange={e => form.handleChange('category', e.target.value)} theme={theme}>
            {CATEGORY_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, display: 'block', marginBottom: 6 }}>
              Bio profissional <span style={{ color: theme.textMuted, fontWeight: 500 }}>(opcional)</span>
            </label>
            <textarea value={form.values.bio} onChange={e => form.handleChange('bio', e.target.value)}
              placeholder="Ex: Eletricista com 10 anos de experiência. Atendo residências e comércios com qualidade e pontualidade..."
              rows={4}
              style={{ width: '100%', borderRadius: 12, padding: 14, fontSize: '0.85rem', fontFamily: 'var(--body)', outline: 'none', resize: 'none', background: theme.inputBg, color: theme.text, border: `1.5px solid ${theme.line}` }}
            />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.25)', borderRadius: 12, padding: 14 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E86D00', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="sparkle" size={13} color="#E86D00" /> Dica
            </p>
            <p style={{ fontSize: '0.74rem', color: theme.textMuted, lineHeight: 1.6 }}>
              Quanto mais detalhada sua bio, mais clientes você atrai. Mencione experiência, certificações e diferenciais.
            </p>
          </motion.div>

          <Select label="Localização (bairro)" value={form.values.neighborhood} theme={theme} onChange={e => {
            const v = e.target.value;
            form.handleChange('neighborhood', v);
            if (NEIGHBORHOOD_MAP[v]) { form.handleChange('lat', NEIGHBORHOOD_MAP[v][0]); form.handleChange('lng', NEIGHBORHOOD_MAP[v][1]); }
          }}>
            <option value="">Selecione o bairro...</option>
            <option value="Centro">Centro</option>
            <option value="Vila Nova">Vila Nova</option>
            <option value="Jardim das Flores">Jardim das Flores</option>
          </Select>
          <p style={{ fontSize: '0.68rem', color: theme.textMuted, marginTop: -8 }}>Usada para posicionar seu marcador no mapa.</p>
        </>
      ) : (
        <>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text, display: 'block', marginBottom: 6 }}>
              Cidade / Bairro <span style={{ color: theme.textMuted, fontWeight: 500 }}>(opcional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 13, color: theme.textMuted }}><Icon name="mapPin" size={16} /></span>
              <input value={form.values.city} onChange={e => form.handleChange('city', e.target.value)} placeholder="Ex: São Paulo, Moema"
                style={{ width: '100%', borderRadius: 12, padding: '12px 14px 12px 38px', fontSize: '0.88rem', fontFamily: 'var(--body)', outline: 'none', background: theme.inputBg, color: theme.text, border: `1.5px solid ${theme.line}` }} />
            </div>
          </div>
          <Select label="Como nos encontrou?" optional value={form.values.referral} onChange={e => form.handleChange('referral', e.target.value)} theme={theme}>
            <option value="">Selecione...</option>
            <option value="indicacao">Indicação de amigo</option>
            <option value="instagram">Instagram</option>
            <option value="google">Google</option>
            <option value="escola">Escola / Faculdade</option>
            <option value="outro">Outro</option>
          </Select>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(34,211,27,0.08)', border: '1px solid rgba(34,211,27,0.25)', borderRadius: 12, padding: 14 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E9E1A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="leaf" size={13} color="#1E9E1A" /> Bônus de boas-vindas
            </p>
            <p style={{ fontSize: '0.74rem', color: theme.textMuted, lineHeight: 1.6 }}>
              Ao criar sua conta você já ganha <strong>150 Folhas</strong> — a moeda de desconto do MoviPay — para usar no seu primeiro pedido.
            </p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/* ─── STEP TRANSITION WRAPPER ───────────────────────────────────── */
const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

/* ─── PAGE ──────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const { darkMode, toggleDarkMode } = useTheme();
  const colors = getThemeColors(darkMode);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [mode, setMode] = useState('client');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef({});

  const theme = {
    bg: colors.bg,
    bgAlt: darkMode ? '#0D130B' : '#F1EAD9',
    text: colors.text,
    textMuted: colors.textMuted,
    cardBg: colors.cardBg,
    cardBorder: colors.cardBorder,
    line: colors.line,
    inputBg: darkMode ? '#1A2417' : '#FFFFFF',
  };

  const form = useForm(
    { name: '', email: '', phone: '', password: '', confirmPassword: '', bio: '', city: '', category: 'limpeza', referral: '', avatar_url: '', lat: null, lng: null, neighborhood: '' },
    {
      name: [rules.required(), rules.minLength(2, 'Nome muito curto')],
      email: [rules.required(), rules.email()],
      phone: [rules.required('Telefone obrigatório')],
      password: [rules.required(), rules.minLength(6)],
      confirmPassword: [rules.required('Confirme a senha'), (v, all) => v !== all.password ? 'As senhas não coincidem' : ''],
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
    const fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    fields.forEach(f => form.handleBlur(f));
    const v = form.values;
    if (!v.name?.trim() || v.name.length < 2) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return false;
    if (!v.phone?.trim()) return false;
    if (!v.password || v.password.length < 6) return false;
    if (v.confirmPassword !== v.password) return false;
    return true;
  }

  function goNext() {
    if (step === 0 && !validateStep0()) {
      toast('Preencha todos os campos corretamente', 'warning');
      return;
    }
    setDir(1);
    setStep(s => s + 1);
  }
  function goBack() { setDir(-1); setStep(s => s - 1); }

  async function handleSubmit() {
    try {
      setLoading(true);
      await register({
        name: form.values.name, email: form.values.email, password: form.values.password, mode,
        phone: form.values.phone, bio: form.values.bio, city: form.values.city,
        avatar_url: form.values.avatar_url, lat: form.values.lat, lng: form.values.lng,
        neighborhood: form.values.neighborhood, category: form.values.category,
      });
      setSuccess(true);
      toast('Conta criada! Bem-vindo ao MoviPay 🎉', 'success');
    } catch (err) {
      toast(err?.response?.data?.error || 'Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  }

  const isWorker = mode === 'worker';
  const accent = isWorker ? '#FF7A00' : '#22D31B';

  const sidePanels = [
    { title: 'Bem-vindo ao radar', body: 'Preencha seus dados e comece a pedir ou oferecer serviços em minutos.', emoji: '🐜' },
    { title: 'Cliente ou prestador?', body: 'Escolha como quer começar — dá para trocar de modo depois, sem perder nada.', emoji: '🔀' },
    { title: 'Quase lá!', body: isWorker ? 'Detalhes de perfil ajudam clientes a te encontrar mais rápido.' : 'Só mais um passo e seu perfil está pronto.', emoji: '✨' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: theme.bg, color: theme.text, transition: 'background 0.4s, color 0.4s' }}>
      <FallingLeaves />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;0,900;1,500;1,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        :root { --display: 'Fraunces', serif; --body: 'Inter', sans-serif; --mono: 'IBM Plex Mono', monospace; }
        * { box-sizing: border-box; }
        .reg-input:focus { border-color: ${accent} !important; box-shadow: 0 0 0 4px ${accent}18; }
        .reg-side { display: flex; }
        @media (max-width: 940px) { .reg-side { display: none !important; } }
      `}</style>

      {/* navbar */}
      <nav style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/img/logo.png" alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: '1.05rem' }}>
            <span style={{ color: '#FF7A00' }}>Movi</span><span style={{ color: '#22D31B' }}>Pay</span>
          </span>
        </Link>
        <button onClick={toggleDarkMode} style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Alternar tema">
          <Icon name={darkMode ? 'sun' : 'moon'} size={15} color={theme.textMuted} />
        </button>
      </nav>

      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 2 }}>

        {/* painel lateral ilustrativo — muda de acordo com o passo */}
        <div className="reg-side" style={{ flex: '0 0 42%', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 30% 20%, ${accent}22, transparent 55%), radial-gradient(circle at 80% 80%, #FF7A0018, transparent 50%)`,
            transition: 'background 0.5s',
          }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45 }}
              style={{ position: 'relative', maxWidth: 340, textAlign: 'center' }}
            >
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '4.5rem', marginBottom: 20 }}
              >
                {sidePanels[step].emoji}
              </motion.div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: 12 }}>
                {sidePanels[step].title}
              </h2>
              <p style={{ color: theme.textMuted, fontSize: '0.92rem', lineHeight: 1.7 }}>{sidePanels[step].body}</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 30 }}>
                {STEPS.map((_, i) => (
                  <motion.span key={i} animate={{ width: i === step ? 26 : 8, background: i === step ? accent : theme.line }} transition={{ duration: 0.3 }} style={{ height: 8, borderRadius: 99, display: 'block' }} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              style={{ position: 'absolute', fontSize: 18 + (i % 3) * 6, left: `${10 + i * 15}%`, top: `${15 + (i * 13) % 70}%`, opacity: 0.35, pointerEvents: 'none' }}
              animate={{ y: [0, -18, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            >
              🍃
            </motion.span>
          ))}
        </div>

        {/* formulário */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '36px 20px 60px' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '60px 20px' }}
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                  style={{ width: 84, height: 84, borderRadius: '50%', background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
                >
                  <Icon name="check" size={38} color={accent} strokeWidth={3} />
                </motion.div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.6rem', marginBottom: 8 }}>Conta criada!</h2>
                <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>Redirecionando para o seu painel…</p>
              </motion.div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
                  {STEPS.map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <motion.div animate={{ background: i <= step ? accent : theme.line, color: i <= step ? '#fff' : theme.textMuted }}
                        style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                        {i < step ? <Icon name="check" size={12} color="#fff" strokeWidth={3} /> : i + 1}
                      </motion.div>
                      <span style={{ marginLeft: 8, fontSize: '0.72rem', fontWeight: 700, color: i === step ? theme.text : theme.textMuted, whiteSpace: 'nowrap' }}>{s}</span>
                      {i < STEPS.length - 1 && (
                        <div style={{ flex: 1, height: 2, margin: '0 10px', borderRadius: 2, background: theme.line, overflow: 'hidden' }}>
                          <motion.div animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.4 }} style={{ height: '100%', background: accent }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.07)' }}>
                  <motion.div animate={{ width: `${((step + 1) / 3) * 100}%`, background: accent }} transition={{ duration: 0.4 }} style={{ height: 3 }} />

                  <div style={{ padding: '28px 26px' }}>
                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div key={step} custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
                        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.5rem', marginBottom: 4 }}>
                          {step === 0 ? 'Criar sua conta' : step === 1 ? 'Qual é o seu perfil?' : 'Últimos detalhes'}
                        </h2>
                        <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: 22 }}>
                          {step === 0 ? 'Passo 1 de 3 — Dados básicos' : step === 1 ? 'Passo 2 de 3 — você pode mudar depois' : 'Passo 3 de 3 — quase lá!'}
                        </p>

                        {step === 0 && <StepData form={form} inputRefs={inputRefs} restoreFocus={restoreFocus} theme={theme} showPw={showPw} setShowPw={setShowPw} showPw2={showPw2} setShowPw2={setShowPw2} />}
                        {step === 1 && <StepMode mode={mode} setMode={setMode} theme={theme} />}
                        {step === 2 && <StepDetails mode={mode} form={form} theme={theme} />}
                      </motion.div>
                    </AnimatePresence>

                    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                      {step > 0 && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goBack}
                          style={{ flex: 1, border: `1.5px solid ${theme.line}`, background: 'transparent', color: theme.text, fontWeight: 700, padding: '12px 0', borderRadius: 12, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Icon name="arrowLeft" size={14} /> Voltar
                        </motion.button>
                      )}
                      {step < 2 ? (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goNext}
                          style={{ flex: 1, border: 'none', background: accent, color: '#fff', fontWeight: 800, padding: '12px 0', borderRadius: 12, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 8px 24px ${accent}44` }}>
                          Próximo <Icon name="arrowRight" size={14} />
                        </motion.button>
                      ) : (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
                          style={{ flex: 1, border: 'none', background: accent, color: '#fff', fontWeight: 800, padding: '12px 0', borderRadius: 12, fontSize: '0.85rem', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px ${accent}44` }}>
                          {loading ? (
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex' }}>
                              <Icon name="leaf" size={15} color="#fff" />
                            </motion.span>
                          ) : <Icon name="sparkle" size={14} color="#fff" />}
                          {loading ? 'Criando conta…' : 'Criar minha conta'}
                        </motion.button>
                      )}
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: theme.textMuted, marginTop: 16 }}>
                      Já tem conta? <Link href="/login" style={{ color: '#FF7A00', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
