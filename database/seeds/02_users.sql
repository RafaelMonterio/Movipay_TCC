-- ============================================================
-- 02_users.sql
-- Usuários de teste — senha "123456" já em hash bcrypt
-- Hash gerado com: bcrypt.hashSync('123456', 10)
-- ============================================================

INSERT INTO users (name, email, password_hash, mode, points) VALUES
  (
    'Ana Cliente',
    'ana@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'client',
    320
  ),
  (
    'Bruno Trabalhador',
    'bruno@teste.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'worker',
    150
  ),
  (
    'Admin MoviPay',
    'admin@movipay.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'worker',
    0
  )
ON CONFLICT (email) DO NOTHING;

-- Bônus de boas-vindas para Ana
INSERT INTO points_history (user_id, type, amount, description)
SELECT id, 'bonus', 320, 'Bônus de boas-vindas'
FROM users WHERE email = 'ana@teste.com'
ON CONFLICT DO NOTHING;
