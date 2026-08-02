-- ============================================================
-- update_user_stats.sql
-- Recalcula estatísticas de um usuário (nota média, total pedidos)
-- Uso: SELECT update_user_stats(worker_id);
-- ============================================================

-- Adiciona colunas de stats na tabela users (se não existirem)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avg_rating    NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_orders  INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER      DEFAULT 0;

-- Função que recalcula e atualiza as stats
CREATE OR REPLACE FUNCTION update_user_stats(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET
    avg_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
      FROM reviews
      WHERE reviewed_id = p_user_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_id = p_user_id
    ),
    total_orders = (
      SELECT COUNT(*)
      FROM orders
      WHERE (client_id = p_user_id OR worker_id = p_user_id)
        AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_user_stats IS
  'Recalcula nota média, total de pedidos e reviews do usuário. '
  'Chamada automaticamente pelo trigger após cada review ou pedido concluído.';
