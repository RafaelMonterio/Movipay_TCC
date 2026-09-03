docker-compose up --build

mobile:
cd frontend/mobile
npm install

# Abre o menu interativo (escolhe Android/iOS/Web)
npm run start

# Ou direto em um dos plataformas:
npm run android    # para Android (precisa de emulador aberto ou celular USB)
npm run ios        # para iOS (só funciona em Mac)
npm run web        # para web (browser)

a fazer:

login com google

chat client trablahdor

telas do trabalhador

Frontedn de todas as telas

bug do mapa

backend cadasatro trabalhador

Tela buscar servoçiços


Tela do trablahdor: Serviços disponiveis funcionais

Promp claude: Com exceção do sidebar, em todas as telas parece que todo o conteudo da pagina está comprimido, meio que ele não preenche toda a tela. Quero que todo o conteudo da tela em si preencha o espaçõ que tem para ela preencher. Quero que ele preencha todo espaço. E sobre o sidebar,  



Prompt:



Mais pelo backend, quero que, como cliente, quando eu agende um serviço (pelo modal), quero que esse pedido não fique somente como algo ilusório, quero que seja um pedido real, que esse pedido fique salvo na tela de pedido do cliente, e que se eu deslogar do cliente, e logar na conta do trabalhador em questão, apareça na tela de pedidos recebidos. e quando eu acietar, que na conta do cliente esteja ativo. basicamente quero que fique funcionando mesmo. 

## Catalogo de ícones do projeto

Os emojis do frontend foram mapeados para ícones básicos em SVG e organizados em `frontend/public/icons/`.

Estrutura:

- `frontend/public/icons/README.md` – tabela e documentação
- `frontend/public/icons/catalog.json` – catálogo consumível pelo frontend
- `frontend/public/icons/nav/` – navegação
- `frontend/public/icons/status/` – estados e avisos
- `frontend/public/icons/category/` – categorias de serviços
- `frontend/public/icons/level/` – níveis/pontos
- `frontend/public/icons/action/` – ações e botões
- `frontend/public/icons/misc/` – extras

Padrão de nomenclatura:

- `nav-home.svg`
- `status-success.svg`
- `category-cleaning.svg`
- `level-gold.svg`
- `action-send.svg`

Exemplo de uso no frontend:

```
const iconPath = '/icons/nav/nav-home.svg';
```

Dimensões recomendadas:

- navegação: 24x24
- status/toasts: 24x24
- categorias: 32x32
- níveis: 32x32
- ação: 24x24 ou 32x32

Tabela resumida:

| Uso | Arquivo | Dimensão |
| --- | --- | --- |
| Home | `nav/nav-home.svg` | 24x24 |
| Buscar | `nav/nav-search.svg` | 24x24 |
| Pedidos | `nav/nav-orders.svg` | 24x24 |
| Perfil | `nav/nav-profile.svg` | 24x24 |
| Calendário | `nav/nav-calendar.svg` | 24x24 |
| Oportunidades | `nav/nav-opportunities.svg` | 24x24 |
| Sucesso | `status/status-success.svg` | 24x24 |
| Erro | `status/status-error.svg` | 24x24 |
| Aviso | `status/status-warning.svg` | 24x24 |
| Informação | `status/status-info.svg` | 24x24 |
| Limpeza | `category/category-cleaning.svg` | 32x32 |
| Elétrica | `category/category-electric.svg` | 32x32 |
| Jardim | `category/category-garden.svg` | 32x32 |
| Mudança | `category/category-move.svg` | 32x32 |
| Cabelo | `category/category-hair.svg` | 32x32 |
| Pedreiro | `category/category-brick.svg` | 32x32 |
| Pintura | `category/category-paint.svg` | 32x32 |
| Encanamento | `category/category-pipe.svg` | 32x32 |
| Informática | `category/category-monitor.svg` | 32x32 |
| Aulas | `category/category-book.svg` | 32x32 |
| Pontos / nível | `level/level-gold.svg` | 32x32 |
| Enviar | `action/action-send.svg` | 24x24 |
