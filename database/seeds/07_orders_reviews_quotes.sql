-- ============================================================
-- 07_orders_reviews_quotes.sql
-- Pedidos de exemplo, avaliações e orçamentos abertos
-- ============================================================

-- ─── Pedidos entre os usuários de teste ───────────────────────────────────

INSERT INTO orders (client_id, worker_id, service_id, status, price, completed_at, created_at)
SELECT
  cl.id, wk.id, sv.id, od.status, sv.price,
  CASE WHEN od.status = 'completed' THEN NOW() - (od.days_ago || ' days')::INTERVAL ELSE NULL END,
  NOW() - (od.days_ago || ' days')::INTERVAL
FROM (VALUES
  ('pedro@teste.com',   'carlos@teste.com', 'Instalação de Tomadas e Interruptores', 'completed', 3),
  ('lucia@teste.com',   'maria@teste.com',  'Limpeza Residencial Completa',           'completed', 7),
  ('rafael@teste.com',  'joao@teste.com',   'Pintura de Quarto Completo',             'completed', 14),
  ('fernanda@teste.com','carlos@teste.com', 'Instalação de Ar Condicionado',          'completed', 5),
  ('pedro@teste.com',   'anati@teste.com',  'Formatação e Instalação de Programas',   'completed', 10),
  ('lucia@teste.com',   'carlos@teste.com', 'Quadro Elétrico — Revisão e Manutenção', 'completed', 20),
  ('fernanda@teste.com','maria@teste.com',  'Limpeza de Escritório',                  'accepted',  1),
  ('rafael@teste.com',  'carlos@teste.com', 'Iluminação LED — Projeto e Instalação',  'pending',   0)
) AS od(client_email, worker_email, service_title, status, days_ago)
JOIN users cl ON cl.email = od.client_email
JOIN users wk ON wk.email = od.worker_email
JOIN services sv ON sv.title = od.service_title AND sv.worker_id = wk.id
ON CONFLICT DO NOTHING;

-- ─── Pontos pelo histórico ────────────────────────────────────────────────

INSERT INTO points_history (user_id, order_id, type, amount, description, created_at)
SELECT wk.id, o.id, 'order_complete', 50, 'Pedido #' || o.id || ' concluído', o.completed_at
FROM orders o
JOIN users wk ON wk.id = o.worker_id
WHERE o.status = 'completed'
ON CONFLICT DO NOTHING;

INSERT INTO points_history (user_id, order_id, type, amount, description, created_at)
SELECT cl.id, o.id, 'order_complete', 10, 'Contratação #' || o.id || ' concluída', o.completed_at
FROM orders o
JOIN users cl ON cl.id = o.client_id
WHERE o.status = 'completed'
ON CONFLICT DO NOTHING;

-- ─── Avaliações ──────────────────────────────────────────────────────────

INSERT INTO reviews (order_id, reviewer_id, reviewed_id, rating, comment, created_at)
SELECT o.id, o.client_id, o.worker_id, rv.rating, rv.comment,
       o.completed_at + INTERVAL '2 hours'
FROM orders o
JOIN users cl ON cl.id = o.client_id
JOIN users wk ON wk.id = o.worker_id
JOIN (VALUES
  ('pedro@teste.com',   'carlos@teste.com', 5, 'Serviço impecável! Carlos é pontual, rápido e muito profissional. Recomendo demais.'),
  ('lucia@teste.com',   'maria@teste.com',  5, 'Maria é incrível! A casa ficou brilhando. Já agendei para o próximo mês.'),
  ('rafael@teste.com',  'joao@teste.com',   4, 'Ótimo trabalho! O quarto ficou lindo. Demorou um pouco mais que o esperado.'),
  ('fernanda@teste.com','carlos@teste.com', 5, 'Perfeito! O ar condicionado instalado com total segurança. Super recomendo.'),
  ('pedro@teste.com',   'anati@teste.com',  4, 'Computador formatado e rodando perfeitamente. Atendimento rápido e eficiente.'),
  ('lucia@teste.com',   'carlos@teste.com', 5, 'Carlos é excelente! Resolveu todos os problemas do quadro elétrico com competência.')
) AS rv(client_email, worker_email, rating, comment)
ON cl.email = rv.client_email AND wk.email = rv.worker_email
WHERE o.status = 'completed'
ON CONFLICT DO NOTHING;

-- Atualiza stats dos trabalhadores
SELECT update_user_stats(id) FROM users WHERE mode = 'worker';

-- ─── Pagamentos (escrow simulado) ────────────────────────────────────────

INSERT INTO payments (order_id, payer_id, payee_id, amount, status, held_at, released_at)
SELECT o.id, o.client_id, o.worker_id, o.price,
  CASE WHEN o.status = 'completed' THEN 'released' ELSE 'held' END,
  o.created_at,
  CASE WHEN o.status = 'completed' THEN o.completed_at ELSE NULL END
FROM orders o
WHERE o.status IN ('completed', 'accepted')
ON CONFLICT DO NOTHING;

-- ─── Orçamentos abertos pelos clientes ───────────────────────────────────

INSERT INTO quotes (client_id, category_id, title, description, budget_max, city, status)
SELECT cl.id, c.id, q.title, q.description, q.budget, 'São Paulo', 'open'
FROM (VALUES
  ('pedro@teste.com',   'eletrica',
   'Preciso instalar 5 pontos de tomada e 2 interruptores',
   'Apartamento de 70m² no 4º andar. Preciso instalar 5 tomadas novas na sala e quartos, e 2 interruptores. Já tenho os eletrodutos passados. Quero que alguém avalie e me dê um orçamento completo.',
   400.00),
  ('lucia@teste.com',   'limpeza',
   'Limpeza pós-obra em escritório de 120m²',
   'Acabamos de reformar nosso escritório. Preciso de limpeza completa pós-obra: remoção de pó de reboco, limpeza de vidros, pisos e banheiros. Ambiente comercial, 3 salas.',
   600.00),
  ('fernanda@teste.com','informatica',
   'Instalação de rede Wi-Fi corporativa e câmeras de segurança',
   'Tenho um escritório com 15 funcionários. Preciso melhorar a rede Wi-Fi (cobertura total) e instalar 4 câmeras externas e 2 internas com acesso remoto pelo celular.',
   800.00),
  ('rafael@teste.com',  'pintura',
   'Pintura completa de apartamento 2 quartos',
   'Apartamento de 60m² recém comprado, precisa de pintura completa. 2 quartos, sala, cozinha e banheiro. Quero cor clara nas paredes e branco no teto. Quero orçamento com e sem material.',
   1200.00)
) AS q(email, cat, title, description, budget)
JOIN users cl ON cl.email = q.email
JOIN categories c ON c.slug = q.cat
ON CONFLICT DO NOTHING;

-- ─── Propostas dos trabalhadores ─────────────────────────────────────────

INSERT INTO quote_proposals (quote_id, worker_id, price, message, status)
SELECT qt.id, wk.id, p.price, p.message, p.status
FROM (VALUES
  ('pedro@teste.com',    'carlos@teste.com', 320.00,
   'Olá! Tenho disponibilidade para esta semana. Pelo que descreveu, consigo instalar as 5 tomadas e 2 interruptores em um dia. O valor inclui material (tomadas e interruptores de qualidade) e mão de obra. Tenho 12 anos de experiência e sou certificado.',
   'pending'),
  ('lucia@teste.com',    'maria@teste.com',  480.00,
   'Especialista em limpeza pós-obra! Para 120m² comercial, nossa equipe de 2 pessoas conclui em 1 dia. Inclui produtos de limpeza profissional, remoção completa de pó, vidros e pisos. Posso iniciar ainda esta semana.',
   'pending'),
  ('fernanda@teste.com', 'anati@teste.com',  720.00,
   'Trabalho com redes corporativas há 5 anos. Posso instalar roteadores mesh para cobertura total do escritório e configurar as 6 câmeras com app no celular. Inclui cabeamento cat6 e configuração de VLAN. Prazo: 2 dias.',
   'accepted')
) AS p(client_email, worker_email, price, message, status)
JOIN users cl ON cl.email = p.client_email
JOIN users wk ON wk.email = p.worker_email
JOIN quotes qt ON qt.client_id = cl.id
WHERE qt.status = 'open' OR qt.status = 'in_review'
ON CONFLICT DO NOTHING;
