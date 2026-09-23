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

Quero que quando eu criar a conta, apareça algo sobre os termos de usuario. Gere os termos de usuarios que são necessários para o projeto, quero que sejá a ultima etapa do login para cada tipo de conta 


Estão anexadas a versão atual do codigo do site, e o app que foi feito separadamente, quero que você integre o app ao projeot (dentro do projeto já existe um protopo mobile que vai ser substituido. Porém antes quero que voce aprimore mais algumas coisas do site:
1. O mapa da tela incial do cliente está bugada. acho que é problema da API, o mapa está embassado e e fica aparecendo as mensagens: "API KEY REQUIRED carto.com/iznasep/sipikey".
2. Quero que subistitua TODOS os emojis por respectivos que você vai criar icon svg. 
3. Dentro da pasta public/img, tem dois arquivos que são para usar de icon para a MOEDA folha, não para as folhes que caem visaualente
4. Sobre as folhas que caem visualmente, quero que diminua em 40% a quantidade, e que elas estejam na ultima camada do site, em relacção a todos os cards e talz.
5. Quero que apague o seguinte texto "Localize profissionais próximos..", aqueles cards falsos que eram para ser os ultimos servisos resquisitados. Quero que nessa area fique realmente os ultimos serviços concluidos que foram contratados. se a conta não tiver contratado nad ainda deixe um botão que leve para a tela de busca.
6. Sobre a parte localização de trabalhador deixe ela realemte mostrando a localização que foi cadstrada pelo usuario, se já estiver tudo bem.
7. Retire a maioria dos dados mocks que existem pelo site, só deixando os essencias. 
8. Analize tudo relacionado a localização e mapas e concerte.
9. Analise todo o site e corrija e melhore oque pode ser lapidado e feito 

backend cadasatro trabalhador

Tela buscar servoçiços


Tela do trablahdor: Serviços disponiveis funcionais


Prompt:



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
