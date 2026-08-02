export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatPoints(n) {
  return n.toLocaleString('pt-BR') + ' pts';
}

export function formatStatus(status) {
  const map = {
    pending:     '🕐 Aguardando',
    accepted:    '✅ Aceito',
    in_progress: '🔧 Em andamento',
    completed:   '🏁 Concluído',
    cancelled:   '❌ Cancelado',
  };
  return map[status] || status;
}
