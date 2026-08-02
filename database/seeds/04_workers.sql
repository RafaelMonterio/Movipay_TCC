-- ============================================================
-- 04_workers.sql
-- 4 trabalhadores com perfil completo, localização e disponibilidade
-- Todos com senha "123456" (hash bcrypt)
-- ============================================================

-- Insere os trabalhadores
INSERT INTO users (name, email, password_hash, mode, points, phone, bio, lat, lng, city, neighborhood, is_verified, is_available, avg_rating, total_orders)
VALUES
  (
    'Carlos Eletricista',
    'carlos@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'worker', 480, '(11) 98765-4321',
    'Eletricista com 12 anos de experiência. Especialista em instalações residenciais e comerciais, quadros elétricos, tomadas e iluminação. Atendo com agilidade e preço justo.',
    -23.5505, -46.6333, 'São Paulo', 'Pinheiros',
    TRUE, TRUE, 4.8, 47
  ),
  (
    'Maria Limpeza',
    'maria@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'worker', 320, '(11) 97654-3210',
    'Profissional de limpeza há 8 anos. Atendo residências, apartamentos e escritórios. Trabalho com produtos de qualidade, pontualidade e atenção a cada detalhe. Limpeza pós-obra também.',
    -23.5614, -46.6483, 'São Paulo', 'Vila Madalena',
    TRUE, TRUE, 4.9, 63
  ),
  (
    'João Pintor',
    'joao@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'worker', 210, '(11) 96543-2109',
    'Pintor profissional com 15 anos de mercado. Faço pintura interna e externa, textura, grafiato e pintura epóxi para garagens. Orçamento sem compromisso e prazo garantido.',
    -23.5489, -46.6388, 'São Paulo', 'Consolação',
    TRUE, FALSE, 4.6, 31
  ),
  (
    'Ana TI',
    'anati@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'worker', 150, '(11) 95432-1098',
    'Técnica em informática com especialização em redes e suporte. Formatação, vírus, configuração de roteadores, câmeras de segurança e suporte remoto. Atendo também empresas.',
    -23.5678, -46.6512, 'São Paulo', 'Perdizes',
    FALSE, TRUE, 4.5, 22
  )
ON CONFLICT (email) DO NOTHING;

-- Slots de disponibilidade — Carlos (seg-sex 8h-18h, sáb 8h-12h)
INSERT INTO availability_slots (worker_id, weekday, hour_start, hour_end)
SELECT u.id, s.weekday, s.h_start, s.h_end
FROM users u,
  (VALUES (1,8,18),(1,9,18),(1,10,18),(1,11,18),(1,12,18),(6,8,12)) AS s(weekday, h_start, h_end)
WHERE u.email = 'carlos@teste.com'
ON CONFLICT DO NOTHING;

-- Maria (seg-sab 7h-17h)
INSERT INTO availability_slots (worker_id, weekday, hour_start, hour_end)
SELECT u.id, s.weekday, 7, 17
FROM users u,
  (VALUES (1),(2),(3),(4),(5),(6)) AS s(weekday)
WHERE u.email = 'maria@teste.com'
ON CONFLICT DO NOTHING;

-- João (ter-sab 8h-17h)
INSERT INTO availability_slots (worker_id, weekday, hour_start, hour_end)
SELECT u.id, s.weekday, 8, 17
FROM users u,
  (VALUES (2),(3),(4),(5),(6)) AS s(weekday)
WHERE u.email = 'joao@teste.com'
ON CONFLICT DO NOTHING;

-- Ana TI (seg-sex 9h-18h)
INSERT INTO availability_slots (worker_id, weekday, hour_start, hour_end)
SELECT u.id, s.weekday, 9, 18
FROM users u,
  (VALUES (1),(2),(3),(4),(5)) AS s(weekday)
WHERE u.email = 'anati@teste.com'
ON CONFLICT DO NOTHING;
