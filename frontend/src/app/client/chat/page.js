'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import api from '@/services/api';

export default function ChatPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [search, setSearch]     = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    api.get('/orders')
      .then(r => {
        const active = (r.data.orders || []).filter(o =>
          ['pending','accepted','in_progress'].includes(o.status)
        );
        setOrders(active);
        if (active.length > 0) setSelected(active[0]);
      })
      .catch(() => toast('Erro ao carregar conversas', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    if (!selected) return;
    try {
      const { data } = await api.get(`/chat/${selected.id}`);
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!text.trim() || !selected) return;
    const content = text.trim();
    setText('');
    try {
      setSending(true);
      await api.post(`/chat/${selected.id}`, { content });
      loadMessages();
    } catch {
      // Fallback local
      setMessages(prev => [...prev, {
        id: Date.now(), sender_id: user?.id,
        content, created_at: new Date().toISOString(), _local: true,
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const contactName = (o) => user?.mode === 'worker' ? o.client_name : o.worker_name;
  const filteredOrders = orders.filter(o =>
    contactName(o)?.toLowerCase().includes(search.toLowerCase()) ||
    (o.service_title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Full-height chat layout */}
      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-white">

        {/* ── Lista de conversas ─── */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
          {/* Header da lista */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-slate-800 text-lg">{user?.name?.split(' ')[0]}</h2>
              <button className="text-slate-400 hover:text-slate-600 text-sm">✏️</button>
            </div>
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar conversas..."
                className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-client/20 transition-all"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[0,1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-slate-500 text-sm font-medium">Nenhuma conversa</p>
                <p className="text-slate-400 text-xs mt-1">Conversas aparecem em pedidos aceitos</p>
              </div>
            ) : (
              filteredOrders.map(o => {
                const isActive = selected?.id === o.id;
                return (
                  <button key={o.id} onClick={() => setSelected(o)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left ${
                      isActive ? 'bg-slate-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-client to-violet-400 flex items-center justify-center text-white font-black text-lg">
                        {contactName(o)?.charAt(0)}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800 text-sm">{contactName(o)}</p>
                        <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
                          {new Date(o.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {o.service_title || `Pedido #${o.id}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Área de mensagens ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-4xl mb-4">
                💬
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Suas mensagens</h3>
              <p className="text-slate-400 text-sm max-w-xs">
                Envie mensagens privadas para os profissionais dos seus pedidos
              </p>
            </div>
          ) : (
            <>
              {/* Header da conversa */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-white">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-client to-violet-400 flex items-center justify-center text-white font-black">
                  {contactName(selected)?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{contactName(selected)}</p>
                  <p className="text-xs text-slate-400">{selected.service_title || `Pedido #${selected.id}`}</p>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 bg-white">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-client to-violet-400 flex items-center justify-center text-white text-2xl font-black mb-3">
                      {contactName(selected)?.charAt(0)}
                    </div>
                    <p className="font-bold text-slate-800">{contactName(selected)}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {selected.service_title}
                    </p>
                    <p className="text-slate-300 text-xs mt-4">Inicie a conversa 👇</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map(m => {
                    const isMine = m.sender_id === user?.id;
                    return (
                      <motion.div key={m.id}
                        initial={{ opacity:0, y:8, scale:0.97 }}
                        animate={{ opacity:1, y:0, scale:1 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-client to-violet-400 flex items-center justify-center text-white text-xs font-black mr-2 flex-shrink-0 self-end mb-1">
                            {contactName(selected)?.charAt(0)}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-client text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                          } ${m._local ? 'opacity-60' : ''}`}>
                            {m.content}
                          </div>
                          <p className="text-[10px] text-slate-400 px-1">
                            {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
                            {m._local && ' · enviando...'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input de mensagem */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white">
                <form onSubmit={sendMessage} className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2.5 gap-2">
                    <input
                      ref={inputRef}
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Mensagem..."
                      className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400"
                    />
                    {text && (
                      <button type="button" onClick={() => setText('')}
                        className="text-slate-400 hover:text-slate-600 text-xs flex-shrink-0">✕</button>
                    )}
                  </div>
                  {text.trim() ? (
                    <motion.button whileTap={{ scale:0.9 }} type="submit" disabled={sending}
                      className="w-10 h-10 bg-client rounded-full flex items-center justify-center text-white disabled:opacity-60 flex-shrink-0">
                      <span className="text-sm font-bold">↑</span>
                    </motion.button>
                  ) : (
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <span className="text-xl">👍</span>
                    </button>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
