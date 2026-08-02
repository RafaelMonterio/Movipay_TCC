-- ============================================================
-- update_points.sql
-- Trigger: quando pedido vira 'completed', adiciona pontos
-- automaticamente ao trabalhador e ao cliente
-- ============================================================

CREATE OR REPLACE FUNCTION fn_award_points_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  worker_points  INTEGER := 50;   -- pontos fixos para o trabalhador
  client_points  INTEGER := 10;   -- pontos fixos para o cliente
BEGIN
  -- Só age quando status muda PARA 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN

    -- 1. Adiciona pontos ao trabalhador
    UPDATE users
      SET points = points + worker_points, updated_at = NOW()
      WHERE id = NEW.worker_id;

    INSERT INTO points_history (user_id, order_id, type, amount, description)
    VALUES (
      NEW.worker_id, NEW.id, 'order_complete', worker_points,
      'Pedido #' || NEW.id || ' concluído'
    );

    -- 2. Adiciona pontos ao cliente
    UPDATE users
      SET points = points + client_points, updated_at = NOW()
      WHERE id = NEW.client_id;

    INSERT INTO points_history (user_id, order_id, type, amount, description)
    VALUES (
      NEW.client_id, NEW.id, 'order_complete', client_points,
      'Contratação #' || NEW.id || ' concluída'
    );

    -- 3. Atualiza stats do trabalhador
    PERFORM update_user_stats(NEW.worker_id);

    -- 4. Registra data de conclusão
    NEW.completed_at := NOW();
  END IF;

  -- Sempre atualiza updated_at ao mudar status
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger na tabela orders
DROP TRIGGER IF EXISTS trg_award_points ON orders;
CREATE TRIGGER trg_award_points
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION fn_award_points_on_completion();

COMMENT ON FUNCTION fn_award_points_on_completion IS
  'Trigger: ao concluir pedido, pontua trabalhador (+50) e cliente (+10) automaticamente.';
