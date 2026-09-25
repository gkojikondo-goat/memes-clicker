# Fábrica de Meme — Design Doc

Clicker incremental brasileiro dividido em **eras**: cada era representa um
formato de meme diferente. O jogador avança sequencialmente de era em era;
eras já ultrapassadas não desaparecem — viram produção passiva ("legado")
enquanto a era atual concentra a atenção do jogador.

## Moedas

| Moeda    | Papel                                                            |
|----------|-------------------------------------------------------------------|
| Curtidas | Moeda principal. Ganha clicando e com geradores. Gasta em tudo.   |
| Fama     | Moeda de prestígio. Ganha "viralizando" (reset). Multiplica tudo permanentemente. |

## Progressão por eras (sequencial)

O jogo tem 6 eras. Cada uma desbloqueia quando o total de Curtidas **já
ganhas na partida atual** (`totalEarned`) atinge um marco:

| # | Era                              | Desbloqueia em      |
|---|-----------------------------------|----------------------|
| 1 | Grupo de Zap da Família            | início                |
| 2 | Fórum de Fofoca da Escola          | 1.000 curtidas        |
| 3 | Dancinha Viral de 15 Segundos      | 20.000 curtidas       |
| 4 | Podcast de Boteco (3h sem corte)   | 400.000 curtidas      |
| 5 | Canal de Corte e Reação            | 8.000.000 curtidas    |
| 6 | Algoritmo Supremo                  | 150.000.000 curtidas  |

Regras:
- O botão de clique sempre representa a **era mais avançada desbloqueada**
  (é o que o jogador está "postando agora").
- Geradores de eras anteriores **continuam produzindo para sempre** — viram
  "legado", mostrados recolhidos numa seção separada da loja.
- Cada era tem 3 geradores próprios, com custo crescente (`base * 1.13^dono`).
- Uma barra de progresso mostra o quanto falta para a próxima era.

Isso dá a sensação de "avançar de pouco em pouco" pedida: o jogador não fica
preso numa tela só, mas também não perde o que já construiu.

## Prestígio ("Viralizar")

- Disponível a qualquer momento em que `totalEarned` permita Fama > 0.
- Fórmula: `fama_ganha = floor(sqrt(totalEarned / 1_000_000))`.
- Multiplicador global: `1 + fama_total * 0.02` (aplicado a CPS e clique).
- Ao viralizar: zera Curtidas, `totalEarned`, todos os geradores e volta pra
  Era 1. Upgrades de clique também são zerados (o multiplicador de Fama é o
  que compensa numa run mais rápida).

## Assets: emoji hoje, imagem amanhã

Cada era/gerador define um `emoji` (sempre presente, funciona sem nenhum
arquivo extra) e, opcionalmente, um `image` (caminho em `/assets/images/`).
`src/assets.js` resolve qual usar:

```js
resolveIcon({ emoji: "💃", image: "eras/dancinha.png" })
// usa a imagem se o arquivo existir/carregar, senão cai pro emoji
```

Pra evoluir pra imagens no futuro: só adicionar o campo `image` na era ou
gerador em `src/data.js` e colocar o arquivo em `assets/images/`. Nenhuma
mudança de engine é necessária.

## Estrutura do código

```
index.html          shell da página, carrega os módulos JS
styles.css           todo o visual (tema claro/escuro via prefers-color-scheme)
src/data.js          conteúdo do jogo: eras, geradores, upgrades (dados puros)
src/assets.js        resolver de ícone (emoji -> imagem)
src/state.js         estado do jogo, save/load em localStorage, matemática pura
src/game.js          ações do jogo (clicar, comprar, avançar era, prestígio)
src/ui.js            renderização (constrói DOM uma vez, atualiza via render())
src/main.js          boot: liga state + game + ui, inicia o loop
```

Separação deliberada: `data.js` não sabe nada de DOM, `ui.js` não sabe nada
de regra de negócio, `game.js` é a única camada que muta o estado. Isso deixa
fácil adicionar uma 7ª era ou balancear números sem mexer em renderização.

## Escopo do MVP

6 eras, 18 geradores, 8 upgrades de clique, 1 sistema de prestígio. Dá pra
jogar do início a um "fim" de conteúdo em uma sessão longa, e depois repetir
via prestígio. Eras extras entram só adicionando entradas em `src/data.js`.
