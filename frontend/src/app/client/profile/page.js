'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AvatarUpload from '@/components/ui/AvatarUpload';
import Input from '@/components/ui/Input';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useForm, rules } from '@/hooks/useForm';
import api from '@/services/api';

export default function ClientProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const form = useForm(
    { name: '', bio: '', phone: '' },
    {
      name: [rules.required(), rules.minLength(2, 'Nome muito curto')],
      phone: [],
    }
  );

  useEffect(() => {
    Promise.all([
      api.get('/auth/me').then(r => {
        setProfile(r.data);
        form.handleChange('name', r.data.name);
        form.handleChange('bio', r.data.bio || '');
        form.handleChange('phone', r.data.phone || '');
      }),
      api.get('/orders').then(r => setOrders(r.data.orders)),
    ])
    .catch(() => toast('Erro ao carregar perfil', 'error'))
    .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    await form.handleSubmit(async values => {
      try {
        const { data } = await api.patch(`/users/${user.id}`, values);
        setProfile(prev => ({ ...prev, ...data }));
        setEditing(false);
        toast('Perfil atualizado!', 'success');
      } catch {
        toast('Erro ao salvar perfil', 'error');
      }
    });
  }

  const completed  = orders.filter(o => o.status === 'completed').length;
  const pending    = orders.filter(o => ['pending','accepted','in_progress'].includes(o.status)).length;

  const LEVEL_NAMES = ['Iniciante','Bronze','Prata','Ouro','Platina','Diamante'];
  const LEVEL_ICONS = ['🌱','🥉','🥈','🥇','💎','👑'];
  const THRESHOLDS  = [0,100,300,600,1000,2000];
  const pts   = profile?.points || 0;
  const level = THRESHOLDS.reduce((acc, t, i) => pts >= t ? i : acc, 0);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Meu Perfil</h1>
          <p className="text-slate-500 mt-1 text-sm">Suas informações pessoais</p>
        </motion.div>

        {loading ? <ProfileSkeleton /> : (
          <>
            {/* Avatar + info */}
            <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5"
            >
              <AvatarUpload user={profile} onUpdate={data => setProfile(prev => ({ ...prev, ...data }))} />
              <div className="flex-1 min-w-0">
                <p className="text-xl font-black text-slate-800 truncate">{profile?.name}</p>
                <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
                {profile?.phone && <p className="text-sm text-slate-400 mt-0.5">📞 {profile.phone}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-client/10 text-client">📱 Cliente</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600">
                    {LEVEL_ICONS[level]} {LEVEL_NAMES[level]}
                  </span>
                </div>
              </div>
              <button onClick={() => setEditing(!editing)}
                className="text-sm font-semibold text-client hover:underline flex-shrink-0">
                {editing ? 'Cancelar' : '✏️ Editar'}
              </button>
            </motion.div>

            {/* Bio */}
            {profile?.bio && !editing && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Sobre mim</p>
                <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                className="bg-white rounded-2xl border border-client/20 p-6 space-y-4"
              >
                <Input label="Nome" value={form.values.name} required
                  onChange={v => form.handleChange('name', v)}
                  onBlur={() => form.handleBlur('name')}
                  error={form.touched.name ? form.errors.name : ''}
                  icon="👤"
                />
                <Input label="Telefone" value={form.values.phone}
                  onChange={v => form.handleChange('phone', v)}
                  icon="📞" placeholder="(11) 99999-9999"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Bio</label>
                  <textarea value={form.values.bio}
                    onChange={e => form.handleChange('bio', e.target.value)}
                    placeholder="Fale um pouco sobre você..." rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
                  />
                </div>
                <button onClick={handleSave} disabled={form.submitting}
                  className="w-full bg-client text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-60">
                  {form.submitting ? '⏳ Salvando...' : 'Salvar alterações'}
                </button>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:'⭐', label:'Pontos', value: pts, color:'text-amber-500' },
                { icon:'✅', label:'Concluídos', value: completed, color:'text-green-500' },
                { icon:'🔄', label:'Em andamento', value: pending, color:'text-blue-500' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1+i*0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 text-center"
                >
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <button onClick={logout}
              className="w-full border border-red-200 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 transition-all">
              Sair da conta
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
