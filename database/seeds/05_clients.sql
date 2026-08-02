-- ============================================================
-- 05_clients.sql
-- 4 clientes com perfil e localização
-- Senha: "123456"
-- ============================================================

INSERT INTO users (name, email, password_hash, mode, points, phone, bio, lat, lng, city, neighborhood, is_verified)
VALUES
  (
    'Pedro Alves',
    'pedro@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 90, '(11) 94321-0987',
    'Mora em apartamento e sempre precisa de pequenos reparos.',
    -23.5540, -46.6402, 'São Paulo', 'Jardins',
    TRUE
  ),
  (
    'Lucia Ferreira',
    'lucia@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 200, '(11) 93210-9876',
    'Proprietária de uma pequena empresa de cosméticos.',
    -23.5601, -46.6456, 'São Paulo', 'Higienópolis',
    TRUE
  ),
  (
    'Rafael Costa',
    'rafael@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 50, '(11) 92109-8765',
    'Recém mudou para São Paulo e está reformando o apartamento.',
    -23.5523, -46.6368, 'São Paulo', 'Bela Vista',
    FALSE
  ),
  (
    'Fernanda Lima',
    'fernanda@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 130, '(11) 91098-7654',
    'Gerente de escritório que precisa de manutenção frequente.',
    -23.5658, -46.6520, 'São Paulo', 'Santa Cecília',
    TRUE
  )
ON CONFLICT (email) DO NOTHING;
