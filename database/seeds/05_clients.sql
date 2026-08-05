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
    -23.7065, -46.3692, 'Ribeirão Pires', 'Centro',
    TRUE
  ),
  (
    'Lucia Ferreira',
    'lucia@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 200, '(11) 93210-9876',
    'Proprietária de uma pequena empresa de cosméticos.',
    -23.7048, -46.3679, 'Ribeirão Pires', 'Parque São Vicente',
    TRUE
  ),
  (
    'Rafael Costa',
    'rafael@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 50, '(11) 92109-8765',
    'Recém mudou para São Paulo e está reformando o apartamento.',
    -23.7082, -46.3681, 'Ribeirão Pires', 'Jardim Ruyce',
    FALSE
  ),
  (
    'Fernanda Lima',
    'fernanda@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client', 130, '(11) 91098-7654',
    'Gerente de escritório que precisa de manutenção frequente.',
    -23.7071, -46.3657, 'Ribeirão Pires', 'Vila Bela',
    TRUE
  )
ON CONFLICT (email) DO NOTHING;
