# MoviPay 0.4 🐜🐘

> Versão com PostgreSQL real — dados persistentes, migrations automáticas.

## O que mudou da 0.3 → 0.4

| Componente     | v0.3                        | v0.4                              |
|----------------|-----------------------------|-----------------------------------|
| Banco de dados | mockData.js (memória RAM)   | PostgreSQL 16 (disco, persistente)|
| Migrations     | —                           | 7 migrations SQL automáticas      |
| Seeds          | Hardcoded no JS             | SQL com dados reais               |
| Triggers       | —                           | Pontos automáticos ao concluir    |
| Functions      | —                           | Haversine, update_user_stats      |
| Docker         | 1 container (api)           | 2 containers (api + db)           |
| Frontend       | Next.js + React Native      | Igual — sem mudanças              |

## Estrutura

```
movipay0.4/
├── database/
│   ├── migrations/     001 a 007 — cria tabelas
│   ├── seeds/          01 a 03 — dados iniciais
│   ├── functions/      calculate_distance, update_user_stats
│   └── triggers/       update_points, update_order_status
├── backend/api/        Node.js + pg (sem ORM)
├── frontend/
│   ├── web/            Next.js (igual à 0.3)
│   └── mobile/         React Native (igual à 0.3)
└── docker/
    └── docker-compose.yml
```

## Como rodar

```bash
# 1. Copiar para o WSL
cp -r /mnt/c/Users/rafae/Downloads/movipay0.4/movipay0.4 ~/projetos/

# 2. Subir backend + banco
cd ~/projetos/movipay0.4/docker
docker-compose up --build

# Terminal 2 — web
cd ~/projetos/movipay0.4/frontend/web
npm install
npm run dev

# Terminal 3 — mobile (opcional)
cd ~/projetos/movipay0.4/frontend/mobile
npm install --legacy-peer-deps
npx expo start
```

## O que acontece no boot

1. 🐘 PostgreSQL sobe e fica saudável
2. ⚙️ API aguarda o banco (retry automático)
3. 🗄️ Migrations criam as 7 tabelas
4. 🌱 Seeds inserem categorias, usuários e serviços
5. ✅ API disponível em http://localhost:3000

## Contas de teste

| E-mail            | Senha  | Modo         |
|-------------------|--------|--------------|
| ana@teste.com     | 123456 | cliente      |
| bruno@teste.com   | 123456 | trabalhador  |

## Acessar o banco diretamente

```bash
docker exec -it movipay-db psql -U movipay -d movipay

# Comandos úteis dentro do psql:
\dt              -- lista tabelas
\d users         -- estrutura da tabela users
SELECT * FROM users;
SELECT * FROM services;
\q               -- sair
```

## ⚠️ Atenção com dados

```bash
docker-compose down       # para — dados MANTIDOS
docker-compose down -v    # para — dados APAGADOS (cuidado!)
```

---
*TCC — Técnico em Informática para Internet | ETEC Maria Cristina Medeiros*
