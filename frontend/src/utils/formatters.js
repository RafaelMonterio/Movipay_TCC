export const formatCurrency = v =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const formatDate = iso =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatStatus = s => ({
  pending: '🕐 Aguardando', accepted: '✅ Aceito',
  in_progress: '🔧 Em andamento', completed: '🏁 Concluído', cancelled: '❌ Cancelado',
})[s] || s;
