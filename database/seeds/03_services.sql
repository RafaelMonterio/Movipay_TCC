-- ============================================================
-- 03_services.sql
-- Serviços iniciais vinculados ao Bruno (trabalhador de teste)
-- ============================================================

INSERT INTO services (worker_id, category_id, title, description, price, price_type)
SELECT
  u.id,
  c.id,
  s.title,
  s.description,
  s.price,
  s.price_type
FROM (VALUES
  ('Limpeza Residencial Completa', 'Limpeza completa de casa ou apartamento, incluindo cozinha, banheiros e quartos.', 80.00,  'fixed',      'limpeza'),
  ('Elétrica Básica',             'Troca de tomadas, interruptores, lâmpadas e pequenos reparos elétricos.',          120.00, 'fixed',      'eletrica'),
  ('Pintura de Quarto',           'Pintura completa de um quarto, inclui lixa, massa corrida e 2 demãos de tinta.',   200.00, 'negotiable', 'pintura'),
  ('Jardim e Grama',              'Corte de grama, poda de arbustos e limpeza do jardim.',                            90.00,  'fixed',      'jardinagem'),
  ('Suporte em Informática',      'Formatação, instalação de programas, remoção de vírus e configuração de rede.',    100.00, 'hourly',     'informatica')
) AS s(title, description, price, price_type, category_slug)
JOIN users       u ON u.email = 'bruno@teste.com'
JOIN categories  c ON c.slug  = s.category_slug
ON CONFLICT DO NOTHING;
