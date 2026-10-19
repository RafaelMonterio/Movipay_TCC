<div align="center">
  <img src="frontend/src/img/logo.png" alt="Mascote do MoviPay" width="150" />
  <h1>🟠 MoviPay</h1>
  <p><strong>Serviços locais, conexões simples e oportunidades para todos.</strong></p>
  <p>Plataforma para aproximar clientes e prestadores de serviços da região.</p>

  <img src="https://img.shields.io/badge/Projeto-TCC-F97316?style=for-the-badge" alt="Projeto TCC" />
  <img src="https://img.shields.io/badge/Web-Next.js%2014-F97316?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/Mobile-Expo-FF8C42?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/API-Node.js-2D6A4F?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

---

## 🟠 Sobre o projeto

O **MoviPay** é uma plataforma desenvolvida como **Trabalho de Conclusão de Curso (TCC)** com a proposta de facilitar a contratação de serviços locais. A aplicação aproxima pessoas que precisam de um serviço — como limpeza, elétrica, pintura, jardinagem ou mudanças — de profissionais que oferecem essas atividades.

O projeto reúne uma interface web, um aplicativo mobile e uma API conectada a um banco de dados relacional. A ideia é centralizar etapas da contratação em um único ambiente: encontrar profissionais, solicitar serviços e orçamentos, acompanhar pedidos, conversar pelo chat e avaliar o atendimento.

A identidade visual usa tons de **laranja** combinados com verde e elementos inspirados em formigas que carregam folhas. Esse conceito também aparece no sistema de gamificação: as **Folhas**, pontos que fazem parte da experiência da plataforma.

## 🎯 Propósito

- **Facilitar a busca por serviços:** ajudar clientes a localizar serviços e profissionais.
- **Dar visibilidade aos prestadores:** oferecer perfis, informações profissionais, disponibilidade e portfólio.
- **Organizar a contratação:** reunir pedidos, orçamentos, agenda e comunicação em um só lugar.
- **Promover confiança:** disponibilizar avaliações e histórico das interações.
- **Incentivar o uso da plataforma:** explorar pontos e recompensas por meio do sistema de Folhas.

## ✨ Principais funcionalidades

| Área | Recursos presentes no projeto |
|---|---|
| 👥 **Perfis e acesso** | Cadastro, login e experiência diferenciada para clientes e prestadores. |
| 🔎 **Serviços e profissionais** | Listagem de serviços, busca de prestadores, mapa e informações de perfil. |
| 📋 **Pedidos** | Criação e acompanhamento de pedidos, com atualização de status. |
| 🧾 **Orçamentos** | Solicitação de orçamentos e envio/gestão de propostas. |
| 💬 **Chat** | Conversas relacionadas aos pedidos. |
| ⭐ **Avaliações** | Registro e consulta de avaliações de profissionais. |
| 📅 **Agenda** | Disponibilidade e horários para atendimento. |
| 🍃 **Folhas** | Pontos, histórico e elementos de gamificação. |
| 💰 **Carteira e pagamentos** | Estrutura para consultar saldo e representar a retenção/liberação de valores no fluxo da API. |
| 🧰 **Área do prestador** | Perfil profissional, serviços, portfólio, oportunidades e ganhos. |

> **Observação sobre pagamentos:** o código inclui lógica interna de carteira e retenção/liberação de valores, mas não identifica uma integração com um gateway financeiro externo. Portanto, não considere o fluxo pronto para movimentar dinheiro real sem uma integração, validação de segurança e testes adicionais.

## 🧱 Tecnologias utilizadas

### Interface web

- **Next.js 14** — estrutura da aplicação web e roteamento.
- **React 18** — construção das interfaces por componentes.
- **Tailwind CSS** e estilos com tokens de tema — estilização e consistência visual.
- **Framer Motion** — animações e microinterações.
- **Axios** — comunicação HTTP com a API.
- **Leaflet** e **React Leaflet** — mapa e visualização de profissionais.
- **Lucide React** — conjunto de ícones.

### Aplicativo mobile

- **React Native** — desenvolvimento de interface para dispositivos móveis.
- **Expo SDK 54** — ferramentas e ambiente de desenvolvimento mobile.
- **React Navigation** — navegação por telas, abas e menu lateral.
- **Axios** — chamadas à API.
- **AsyncStorage** — armazenamento local no dispositivo.
- **React Native Reanimated** e **Gesture Handler** — animações e gestos.
- **React Native Calendars** — interface de calendário.

### Backend / API

- **Node.js** — ambiente de execução JavaScript.
- **Express** — criação dos endpoints REST.
- **PostgreSQL** — persistência dos dados.
- **`pg`** — conexão e consultas ao PostgreSQL.
- **JWT (`jsonwebtoken`)** — emissão e validação de tokens de autenticação.
- **bcryptjs** — hash de senhas.
- **dotenv** — carregamento de configurações de ambiente.
- **CORS** — configuração de acesso entre origens.

### Banco de dados e ambiente

- **SQL** — tabelas, funções, gatilhos, migrações e dados iniciais.
- **Docker** e **Docker Compose** — execução local da API e do PostgreSQL em contêineres.

## 🗺️ Como a aplicação está organizada

```text
Movipay_TCC-main/
├── backend/
│   └── api/                 # API REST em Node.js + Express
├── database/
│   ├── migrations/          # Estrutura e evolução do banco
│   ├── functions/           # Funções SQL
│   ├── triggers/            # Regras acionadas no banco
│   └── seeds/               # Dados iniciais/de demonstração
├── docker/
│   └── docker-compose.yml   # API + PostgreSQL
└── frontend/
    ├── src/                 # Aplicação web Next.js
    └── mobile/              # Aplicativo React Native + Expo
```

### Entidades principais do banco

O esquema SQL inclui estruturas para usuários, categorias, serviços, pedidos, avaliações, conversas e mensagens, orçamentos e propostas, pagamentos, pontos e histórico de pontos, disponibilidade e fotos de portfólio.

## 🚀 Como executar

### Requisitos

- **Node.js 20 ou superior** recomendado.
- **npm**.
- **Docker Desktop** com Docker Compose, para executar API e banco juntos.
- **Expo Go** ou um emulador Android/iOS, para testar o app mobile.

### 1. Subir API e banco de dados com Docker

Na raiz do repositório, execute:

```bash
docker compose -f docker/docker-compose.yml up --build
```

O Compose inicia o PostgreSQL e a API. Na inicialização, a API aguarda o banco e executa os arquivos SQL de migração, funções, gatilhos e seeds que estão no diretório `database/`.

- **API:** `http://localhost:3000`
- **Verificação de saúde:** `http://localhost:3000/health`
- **PostgreSQL:** `localhost:5432`

Para parar os contêineres, use `Ctrl+C` e, se necessário, execute:

```bash
docker compose -f docker/docker-compose.yml down
```

Os dados são mantidos no volume do Docker. **Atenção:** `docker compose -f docker/docker-compose.yml down -v` remove também o volume e os dados persistidos.

### 2. Executar a interface web

Em outro terminal:

```bash
cd frontend
npm install
```

O arquivo `frontend/.env.local.example` apresenta a variável de endereço da API. Crie seu arquivo local a partir do exemplo, se necessário:

```bash
cp .env.local.example .env.local
```

Para iniciar a interface em modo de desenvolvimento:

```bash
npm run dev
```

Abra `http://localhost:3000` no navegador.

> **Modo de desenvolvimento:** `frontend/src/services/api.js` possui um adaptador de dados simulados (*mock*) para facilitar a demonstração da interface. Na configuração local padrão, algumas chamadas são respondidas por esse adaptador em vez de chegarem à API. Para testar a integração real ponta a ponta, revise essa condição de mock e as portas utilizadas antes de executar web e API simultaneamente — ambas usam a porta `3000` por padrão.

Comandos disponíveis na interface web:

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run start    # servidor de produção (após o build)
```

### 3. Executar o aplicativo mobile

```bash
cd frontend/mobile
npm install
```

Configure `EXPO_PUBLIC_API_URL` com o endereço que o dispositivo consegue acessar. O modelo está em `frontend/mobile/.env.example`; copie-o para `.env` e ajuste a URL quando necessário.

```bash
npx expo start
```

Atalhos também estão disponíveis no `package.json` mobile:

```bash
npm run android
npm run ios
npm run web
```

**Importante para testes mobile:** `localhost` dentro de um dispositivo físico aponta para o próprio aparelho, não para o computador. Em um aparelho físico, use o IP local do computador na rede Wi-Fi; no emulador Android padrão, normalmente usa-se `10.0.2.2` para acessar o host.

## 🔌 Rotas principais da API

A API utiliza o prefixo `/api/v1`. Entre as áreas implementadas estão:

| Prefixo | Responsabilidade |
|---|---|
| `/api/v1/auth` | Cadastro, login, usuário autenticado e troca de modo. |
| `/api/v1/services` | Consulta e cadastro de serviços. |
| `/api/v1/workers` | Busca, perfis, disponibilidade e portfólio de prestadores. |
| `/api/v1/orders` | Criação, consulta e atualização de pedidos. |
| `/api/v1/quotes` | Orçamentos e propostas. |
| `/api/v1/chat` | Mensagens ligadas a pedidos. |
| `/api/v1/reviews` | Avaliações de profissionais. |
| `/api/v1/payments` | Carteira e fluxo interno de retenção/liberação. |
| `/api/v1/points` | Pontos e histórico de pontos. |
| `/api/v1/calendar` | Recursos relacionados à agenda. |
| `/api/v1/users` | Recursos de usuários. |

A rota `GET /health` retorna o estado da API e pode ser usada para uma verificação rápida. Para detalhes sobre payloads e regras de cada endpoint, consulte os arquivos em `backend/api/src/routes/v1/`.

## 🔐 Configuração e segurança

- Os arquivos `.env.example` servem como modelos de configuração. Crie arquivos locais para seus próprios valores e não publique credenciais.
- O segredo `JWT_SECRET` presente nos exemplos é apenas para desenvolvimento. **Troque-o por um valor forte e privado** antes de qualquer implantação.
- As credenciais definidas diretamente no Compose são de conveniência para ambiente local e não devem ser reutilizadas em produção.
- Antes de disponibilizar o sistema publicamente, revise autorização por recurso, validação de entradas, CORS, tratamento de erros, logs e fluxos financeiros.

## 📚 Contexto acadêmico

O MoviPay combina desenvolvimento web, mobile, APIs REST e modelagem relacional para demonstrar uma solução de intermediação de serviços. O repositório contém a implementação e os dados de demonstração usados para explorar os fluxos de clientes e prestadores. Recursos e integrações devem ser validados no ambiente de execução antes de qualquer uso em produção.

---

<div align="center">
  <p><strong>Feito para aproximar pessoas, serviços e oportunidades. 🟠</strong></p>
  <p><sub>MoviPay · Projeto acadêmico (TCC)</sub></p>
</div>

