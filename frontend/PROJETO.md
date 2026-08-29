# MoviPay — Documentação do Projeto

> Nota: este projeto não continha um `README.md` original no pacote recebido — este documento foi criado do zero durante a reformulação das telas, reunindo a documentação técnica/funcional que normalmente viveria aqui. O `README.md` na raiz ficou apenas com a introdução rápida do projeto; este arquivo concentra os detalhes.

## Stack

- **Next.js 14** (App Router) + **React 18**
- **Framer Motion** para animações
- **Tailwind CSS** (utilitário, usado nas telas mais antigas) + **estilos inline com tokens de tema** (usado nas telas redesenhadas)
- **Axios** para chamadas HTTP (`src/services/api.js`)
- **Leaflet / react-leaflet** para o radar/mapa de profissionais
- Autenticação via JWT em `localStorage` + cookie (`src/context/AuthContext.jsx`)

## Estrutura de rotas

```
src/app/
├── (auth)/
│   ├── login/page.js
│   └── register/page.js        ← cadastro em 3 passos, com painel animado
├── client/                     ← área do cliente
│   ├── page.js                 ← home (favoritos, panorama, busca no navbar)
│   ├── orders/ , orders/[id]/
│   ├── quotes/ , quotes/[id]/
│   ├── workers/ , workers/[id]/
│   ├── services/
│   ├── chat/
│   ├── points/
│   ├── reviews/
│   └── profile/                ← inclui a carteira detalhada de Folhas
└── worker/                     ← área do prestador (espelha o cliente)
    ├── page.js                 ← dashboard
    ├── orders/
    ├── quotes/                 ← "oportunidades" (orçamentos abertos)
    ├── services/                ← catálogo de serviços do prestador
    ├── earnings/                ← carteira + gráfico de receita
    ├── calendar/
    ├── chat/
    └── profile/
```

## Sistema de design

| Token | Valor |
|---|---|
| Fonte de display | `Fraunces` (serif, itálico para destaque) |
| Fonte de corpo | `Inter` |
| Fonte mono | `IBM Plex Mono` |
| Acento cliente/primário | `#FF7A00` (laranja) |
| Acento positivo/prestador | `#22D31B` (verde) |
| Erro | `#FF3B5C` |
| Tema | claro/escuro via `ThemeContext` (`useTheme`, `getThemeColors`) |

Cada tela define seu próprio componente `<Icon />` local (SVGs inline, sem dependência externa de ícones) e usa `framer-motion` para entradas, hover e transições de estado. O fundo de todas as telas internas usa o efeito `<FallingLeaves />` (folhas caindo sutilmente), reforçando o tema do mascote.

## Papéis de usuário

Um mesmo usuário pode alternar entre os modos **cliente** e **prestador** (`switchMode` em `AuthContext`), sem precisar de duas contas. As áreas `/client/*` e `/worker/*` são espelhadas visualmente para que a transição entre papéis seja natural.

## Sistema de Folhas 🍃

**Folhas** é a moeda de fidelidade/desconto do MoviPay (visualmente uma extensão do sistema de pontos já existente na API, `/points/balance` e `/points/history`). Cada folha vale `R$ 0,04` em desconto acumulado.

- **Na home do cliente** (`/client`): um card resumido mostra o saldo atual e o desconto equivalente já garantido.
- **No perfil do cliente** (`/client/profile#folhas`): versão detalhada — progresso até o próximo cupom, grade de cupons resgatáveis por faixa de saldo, e histórico completo de movimentações.
- Novos usuários no modo cliente recebem um aviso de **bônus de boas-vindas de 150 Folhas** já na tela de cadastro.

## Home do cliente — mudanças de layout

A home (`/client`) deixou de ser puramente uma landing de marketing e passou a se comportar como um painel:

1. **Busca de serviço**: migrou do hero para a navbar, à esquerda do botão de modo escuro, como um campo compacto que expande ao receber foco.
2. **Coluna esquerda do hero**: agora é o painel de **Favoritos** — profissionais salvos pelo cliente, com opção de desfavoritar e atalho para a busca completa.
3. **Seção "Panorama"** (nova, abaixo do hero, sem remover nenhuma seção existente): resumo de últimos serviços contratados, total investido e saldo de Folhas — versão condensada da carteira detalhada do perfil.

## Cadastro (`/register`)

Fluxo em 3 passos (Dados → Perfil → Detalhes) com:

- Painel lateral ilustrado que muda de conteúdo e cor de destaque conforme o passo e o modo escolhido (cliente = verde, prestador = laranja);
- Transições de passo animadas (slide + fade) via `framer-motion`;
- Validação em tempo real reaproveitando `useForm`/`rules` já existentes no projeto;
- Tela de sucesso animada ao concluir o cadastro.

## Scripts

```bash
npm run dev     # ambiente de desenvolvimento
npm run build   # build de produção
npm run start   # servidor de produção
```
