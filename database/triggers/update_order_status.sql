-- ============================================================
-- update_order_status.sql
-- Trigger: valida que mudanças de status seguem o fluxo correto
-- e atualiza timestamps automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validate_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Impede transições inválidas de status
  -- pending → accepted | cancelled
  -- accepted → in_progress | cancelled
  -- in_progress → completed | cancelled
  -- completed → (imutável)
  -- cancelled → (imutável)

  IF OLD.status = 'completed' OR OLD.status = 'cancelled' THEN
    RAISE EXCEPTION
      'Pedido #% já está % e não pode ser alterado.',
      OLD.id, OLD.status;
  END IF;

  -- Valida a transição específica
  IF NOT (
    (OLD.status = 'pending'     AND NEW.status IN ('accepted', 'cancelled'))    OR
    (OLD.status = 'accepted'    AND NEW.status IN ('in_progress', 'cancelled')) OR
    (OLD.status = 'in_progress' AND NEW.status IN ('completed', 'cancelled'))   OR
    (OLD.status = NEW.status)   -- permite "atualizar" sem mudar status
  ) THEN
    RAISE EXCEPTION
      'Transição de status inválida: % → % para pedido #%.',
      OLD.status, NEW.status, OLD.id;
  END IF;

  -- Timestamps automáticos
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_order_status ON orders;
CREATE TRIGGER trg_validate_order_status
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_order_status();

COMMENT ON FUNCTION fn_validate_order_status IS
  'Garante que pedidos só mudem de status em sequência válida. '
  'Pedidos completed ou cancelled são imutáveis.';
