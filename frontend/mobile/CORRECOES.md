# O que foi corrigido (app mobile / Expo)

> **2ª atualização:** a Play Store, nesse momento, está distribuindo o Expo
> Go na versão **54.0.8** (SDK 55/56 ainda presos em aprovação da loja). O
> projeto foi ajustado mais uma vez, agora para **SDK 54**, que é a versão
> exata instalada no aparelho de teste. Também foi adicionado
> `babel-preset-expo` explicitamente em `devDependencies` (no SDK 54 ele não
> vem mais como dependência transitiva do pacote `expo`, diferente do
> SDK 56/57 — sem ele o Metro não conseguia nem montar o bundle) e o
> `@expo/ngrok` foi movido pra dentro do projeto (`devDependencies`) pra
> evitar o erro de instalação global do tunnel.
>
> **Se a Play Store atualizar o Expo Go no futuro** e voltar a dar
> "Incompatible SDK version" (pedindo uma versão mais nova dessa vez), abra o
> app Expo Go → confira o número da versão em "Sobre o app" na Play Store →
> me avise esse número que eu ajusto o SDK do projeto de novo. Ou, se quiser
> fazer isso sozinho: `npx expo install expo@<versão>` seguido de
> `npx expo install --fix`, usando o número de SDK que bater com o Expo Go
> instalado.

## Causa principal do erro no Expo Go
O projeto estava travado no **Expo SDK 50** (de ~Jan/2024). O Expo Go instalado
hoje na loja (mid/2026) só roda o app se ele estiver na versão do SDK atual
(SDK 56/57). Como o app pedia SDK 50 e o Expo Go só entende as versões mais
recentes, o app ficava "carregando" ao escanear o QR code e depois dava erro
de incompatibilidade.

**Correção:** todas as dependências nativas foram atualizadas para as versões
compatíveis com Expo SDK 57 (a mais recente hoje), testado com
`npm install` + `npx expo export` rodando sem erros (867 módulos, bundle ok).

| Pacote | Antes | Agora |
|---|---|---|
| expo | ~50.0.0 | ~57.0.0 |
| react | 18.2.0 | 19.2.3 |
| react-native | 0.73.2 | 0.86.0 |
| react-native-reanimated | ~3.6.1 | 4.5.0 (+ `react-native-worklets` novo) |
| react-native-gesture-handler | ~2.14.0 | ~2.32.0 |
| react-native-safe-area-context | 4.8.2 | ~5.7.0 |
| react-native-screens | ~3.29.0 | ~4.26.0 |
| react-native-svg | 14.1.0 | 15.15.4 |
| @react-native-async-storage/async-storage | 1.21.0 | 2.2.0 |
| @react-navigation/* | ^6.x | ^7.x |

## Arquivos que faltavam e foram criados
- **`app.json`** — não existia nenhum. Sem ele o Expo não consegue montar o
  manifesto do app corretamente.
- **`babel.config.js`** — não existia. Sem ele o Metro não transpila
  corretamente JSX/Reanimated. (O plugin do Reanimated/Worklets já vem
  configurado automaticamente pelo `babel-preset-expo`, não precisa adicionar
  na mão.)

## Outro ajuste (para funcionar de ponta a ponta, não só abrir)
- **`src/services/api.js`** usava `http://localhost:3000`. No celular via
  Expo Go, "localhost" é o próprio celular, não o seu computador — então as
  chamadas de API sempre falhariam mesmo com o app abrindo normalmente.
  Agora o `BASE_URL` detecta automaticamente o IP da máquina rodando o Metro
  (o mesmo IP do QR code) em desenvolvimento. Troque a URL de produção no
  mesmo arquivo quando for publicar.

## Não mexi em
- As pastas vazias com chaves `{...}` no nome (resíduo de um `mkdir -p` que
  não expandiu certo) foram apenas removidas — eram lixo, não afetavam nada.
- Nenhuma tela/lógica (`src/screens`, `src/context`, etc.) foi alterada.

## Como rodar agora
