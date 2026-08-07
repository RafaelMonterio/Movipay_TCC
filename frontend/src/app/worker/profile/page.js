'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AvatarUpload from '@/components/ui/AvatarUpload';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useForm, rules } from '@/hooks/useForm';
import { formatCurrency } from '@/utils/formatters';
import api from '@/services/api';

const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const HOURS    = Array.from({ length: 14 }, (_, i) => i + 6); // 6h–19h

export default function WorkerProfilePage() {
  const { user, logout, switchMode } = useAuth();
  const toast = useToast();
  const photoRef = useRef(null);

  const [profile,    setProfile]    = useState(null);
  const [services,   setServices]   = useState([]);
  const [photos,     setPhotos]     = useState([]);
  const [slots,      setSlots]      = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);
  const [available,  setAvailable]  = useState(true);
  const [svcModal,   setSvcModal]   = useState(false);
  const [savingSvc,  setSavingSvc]  = useState(false);
  const [svcForm,    setSvcForm]    = useState({ title:'', category:'limpeza', price:'', description:'' });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const form = useForm(
    { name:'', bio:'', phone:'' },
    { name: [rules.required(), rules.minLength(2, 'Nome muito curto')] }
  );

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/auth/me').then(r => {
        setProfile(r.data);
        setAvailable(r.data.is_available ?? true);
        form.handleChange('name',  r.data.name  || '');
        form.handleChange('bio',   r.data.bio   || '');
        form.handleChange('phone', r.data.phone || '');
      }),
      api.get(`/workers/${user.id}`).then(r => {
        setServices(r.data.services || []);
        setPhotos(r.data.photos    || []);
        setSlots(r.data.availability || []);
        setReviews(r.data.reviews  || []);
      }),
    ])
    .catch(() => toast('Erro ao carregar perfil', 'error'))
    .finally(() => setLoading(false));
  }, [user]);

  /* ── Salvar perfil ── */
  async function handleSave() {
    await form.handleSubmit(async values => {
      try {
        const { data } = await api.patch(`/users/${user.id}`, values);
        setProfile(prev => ({ ...prev, ...data }));
        setEditing(false);
        toast('Perfil atualizado!', 'success');
      } catch { toast('Erro ao salvar', 'error'); }
    });
  }

  /* ── Toggle disponibilidade ── */
  async function toggleAvailability() {
    try {
      const next = !available;
      await api.patch(`/workers/${user.id}/availability`, { is_available: next });
      setAvailable(next);
      toast(next ? '🟢 Você está disponível!' : '⚫ Modo indisponível ativado', 'info');
    } catch { toast('Erro ao atualizar disponibilidade', 'error'); }
  }

  /* ── Upload de foto de portfólio ── */
  async function handlePortfolioPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Selecione uma imagem', 'error'); return; }
    if (file.size > 3 * 1024 * 1024) { toast('Máximo 3MB', 'error'); return; }

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        setUploadingPhoto(true);
        const { data } = await api.post(`/workers/${user.id}/portfolio`, {
          url: ev.target.result,
          caption: file.name.replace(/\.[^/.]+$/, ''),
        });
        setPhotos(prev => [data, ...prev]);
        toast('Foto adicionada ao portfólio!', 'success');
      } catch { toast('Erro ao adicionar foto', 'error'); }
      finally { setUploadingPhoto(false); }
    };
    reader.readAsDataURL(file);
  }

  async function deletePhoto(photoId) {
    try {
      await api.delete(`/workers/${user.id}/portfolio/${photoId}`);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast('Foto removida', 'info');
    } catch { toast('Erro ao remover foto', 'error'); }
  }

  /* ── Adicionar serviço ── */
  async function handleAddService() {
    if (!svcForm.title || !svcForm.price) { toast('Preencha título e preço', 'warning'); return; }
    try {
      setSavingSvc(true);
      const { data } = await api.post('/services', svcForm);
      setServices(prev => [data, ...prev]);
      setSvcModal(false);
      setSvcForm({ title:'', category:'limpeza', price:'', description:'' });
      toast('Serviço adicionado!', 'success');
    } catch { toast('Erro ao adicionar serviço', 'error'); }
    finally { setSavingSvc(false); }
  }

  const level = Math.min(
    [0,100,300,600,1000,2000].reduce((acc, t, i) => (profile?.points || 0) >= t ? i : acc, 0),
    5
  );
  const LEVEL_ICONS = ['🌱','🥉','🥈','🥇','💎','👑'];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-2xl space-y-6">
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Meu Perfil</h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie suas informações e portfólio</p>
        </motion.div>

        {loading ? <ProfileSkeleton /> : (
          <>
            {/* ── Card principal ── */}
            <motion.div initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
              className="bg-white rounded-2xl border border-slate-100 p-6"
            >
              <div className="flex items-start gap-4">
                <AvatarUpload user={profile} onUpdate={d => setProfile(p => ({ ...p, ...d }))} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xl font-black text-slate-800 truncate">{profile?.name}</p>
                    {profile?.is_verified && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-client/10 text-client">
                        ✓ Verificado
                      </span>
                    )}
                    <span className="text-lg">{LEVEL_ICONS[level]}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{profile?.email}</p>
                  {profile?.neighborhood && (
                    <p className="text-xs text-slate-400 mt-0.5">📍 {profile.neighborhood}, {profile.city}</p>
                  )}
                  {profile?.avg_rating > 0 && (
                    <p className="text-sm text-amber-500 mt-1">
                      {'★'.repeat(Math.round(profile.avg_rating))}{'☆'.repeat(5 - Math.round(profile.avg_rating))}
                      {' '}{parseFloat(profile.avg_rating).toFixed(1)}
                      <span className="text-slate-400 text-xs ml-1">({profile.total_reviews} avaliações)</span>
                    </p>
                  )}

                  {/* Toggle disponibilidade */}
                  <button onClick={toggleAvailability}
                    className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-500' : 'bg-slate-400'}`} />
                    {available ? 'Disponível para novos pedidos' : 'Indisponível no momento'}
                    <span className="ml-1 text-xs opacity-60">(clique para alterar)</span>
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => switchMode('client')}
                    className="text-xs font-semibold text-client bg-client/10 px-3 py-1.5 rounded-full hover:bg-client/15 transition-all">
                    Trocar para cliente
                  </button>
                  <button onClick={() => setEditing(!editing)} className="text-sm font-semibold text-client hover:underline flex-shrink-0">
                    {editing ? 'Cancelar' : '✏️ Editar'}
                  </button>
                </div>
              </div>

              {profile?.bio && !editing && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Bio</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </motion.div>

            {/* ── Formulário de edição ── */}
            <AnimatePresence>
              {editing && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  className="bg-white rounded-2xl border border-client/20 p-6 space-y-4"
                >
                  <Input label="Nome" value={form.values.name} required icon="👤"
                    onChange={v => form.handleChange('name', v)}
                    onBlur={() => form.handleBlur('name')}
                    error={form.touched.name ? form.errors.name : ''}
                  />
                  <Input label="Telefone" value={form.values.phone} icon="📞" placeholder="(11) 99999-9999"
                    onChange={v => form.handleChange('phone', v)}
                  />
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Bio profissional</label>
                    <textarea value={form.values.bio}
                      onChange={e => form.handleChange('bio', e.target.value)}
                      rows={4} placeholder="Descreva sua experiência, especialidades e diferenciais..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-client/20 focus:border-client"
                    />
                  </div>
                  <button onClick={handleSave} disabled={form.submitting}
                    className="w-full bg-client text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-60">
                    {form.submitting ? '⏳ Salvando...' : 'Salvar alterações'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:'⭐', label:'Pontos',     value: profile?.points || 0,    color:'text-amber-500' },
                { icon:'✅', label:'Concluídos', value: profile?.total_orders || 0, color:'text-green-500' },
                { icon:'💬', label:'Avaliações', value: profile?.total_reviews || 0, color:'text-client' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.05 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 text-center"
                >
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* ── Portfólio ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800">Portfólio de fotos</h2>
                <button onClick={() => photoRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="text-sm font-semibold text-white bg-worker px-3 py-1.5 rounded-xl hover:bg-amber-500 transition-all disabled:opacity-60">
                  {uploadingPhoto ? '⏳' : '+ Adicionar'}
                </button>
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePortfolioPhoto} className="hidden" />
              </div>

              {photos.length === 0 ? (
                <button onClick={() => photoRef.current?.click()}
                  className="w-full bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center hover:border-worker/40 transition-all"
                >
                  <p className="text-3xl mb-2">📸</p>
                  <p className="text-slate-500 text-sm font-medium">Adicione fotos dos seus trabalhos</p>
                  <p className="text-slate-400 text-xs mt-1">Fotos aumentam suas chances de contratação em 3x</p>
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((ph, i) => (
                    <motion.div key={ph.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.05 }}
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100"
                    >
                      <img src={ph.url} alt={ph.caption || 'Portfólio'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <button onClick={() => deletePhoto(ph.id)}
                          className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600">
                          Remover
                        </button>
                      </div>
                      {ph.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                          <p className="text-white text-xs truncate">{ph.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <button onClick={() => photoRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 hover:border-worker/40 transition-all bg-white"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs text-slate-400">Adicionar</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Disponibilidade semanal ── */}
            <div>
              <h2 className="font-bold text-slate-800 mb-3">Grade de disponibilidade</h2>
              {slots.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                  <p className="text-slate-400 text-sm">Nenhum horário configurado</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 overflow-x-auto">
                  <div className="flex gap-3 min-w-max">
                    {WEEKDAYS.map((day, wi) => {
                      const daySlots = slots.filter(s => s.weekday === wi);
                      return (
                        <div key={day} className="flex flex-col gap-1 min-w-[60px]">
                          <p className="text-xs font-semibold text-slate-400 text-center mb-1">{day}</p>
                          {daySlots.length === 0 ? (
                            <div className="h-8 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                              <span className="text-xs text-slate-300">—</span>
                            </div>
                          ) : daySlots.map(s => (
                            <div key={s.id} className="bg-client/10 text-client text-xs font-medium px-2 py-1 rounded-lg text-center">
                              {s.hour_start}h–{s.hour_end}h
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Serviços ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-800">Meus Serviços</h2>
                <button onClick={() => setSvcModal(true)}
                  className="text-sm font-semibold text-white bg-worker px-3 py-1.5 rounded-xl hover:bg-amber-500 transition-all">
                  + Adicionar
                </button>
              </div>
              {services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <p className="text-3xl mb-2">🛠️</p>
                  <p className="text-slate-400 text-sm">Adicione seus serviços para aparecer nas buscas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                      className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{s.category_icon || '🛠️'}</span>
                          <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{s.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-worker">{formatCurrency(s.price)}</p>
                        <p className="text-xs text-slate-400">{s.price_type === 'hourly' ? '/ hora' : s.price_type === 'negotiable' ? 'a combinar' : 'fixo'}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Avaliações ── */}
            {reviews.length > 0 && (
              <div>
                <h2 className="font-bold text-slate-800 mb-3">Avaliações recebidas</h2>
                <div className="space-y-3">
                  {reviews.slice(0, 4).map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className="bg-white rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-client to-violet-400 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {r.reviewer_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{r.reviewer_name}</p>
                          <p className="text-amber-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-slate-600 leading-relaxed">"{r.comment}"</p>}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={logout}
              className="w-full border border-red-200 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 transition-all">
              Sair da conta
            </button>
          </>
        )}
      </div>

      {/* Modal novo serviço */}
      <Modal open={svcModal} onClose={() => setSvcModal(false)} title="Adicionar serviço" size="sm">
        <div className="space-y-4">
          <Input label="Título *" value={svcForm.title}
            onChange={v => setSvcForm(p => ({ ...p, title: v }))}
            placeholder="Ex: Instalação de tomadas"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Categoria</label>
              <select value={svcForm.category}
                onChange={e => setSvcForm(p => ({ ...p, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-worker"
              >
                {[['limpeza','🧹 Limpeza'],['eletrica','⚡ Elétrica'],['pintura','🎨 Pintura'],
                  ['encanamento','🔧 Encanamento'],['jardinagem','🌿 Jardinagem'],
                  ['informatica','💻 Informática'],['mudanca','📦 Mudança'],
                  ['reforma','🏗️ Reforma'],['aulas','📚 Aulas']
                ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <Input label="Preço (R$) *" type="number" value={svcForm.price}
              onChange={v => setSvcForm(p => ({ ...p, price: v }))}
              placeholder="150"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Descrição</label>
            <textarea value={svcForm.description}
              onChange={e => setSvcForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Descreva o que está incluso no serviço..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-worker/20 focus:border-worker"
            />
          </div>
          <button onClick={handleAddService} disabled={savingSvc}
            className="w-full bg-worker text-white font-bold py-3 rounded-xl hover:bg-amber-500 transition-all disabled:opacity-60">
            {savingSvc ? '⏳ Salvando...' : '💾 Adicionar serviço'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
