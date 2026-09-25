# Fábrica de Meme

Clicker incremental de memes brasileiros. Clique pra gerar Curtidas, monte
sua linha de produção e avance de era em era — cada era é um formato de
meme diferente, do grupo de zap da família até o algoritmo supremo.

🎮 **Jogar:** https://gkojikondo-goat.github.io/memes-clicker/

## Rodando localmente

Não tem build nem dependências. Basta servir a pasta como estático:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

(Precisa de um servidor HTTP porque o jogo usa ES modules, que o navegador
não carrega direto de `file://`.)

## Estrutura

Veja [`DESIGN.md`](./DESIGN.md) pra arquitetura completa: eras, economia,
sistema de prestígio e como evoluir os ícones de emoji pra imagem.

```
index.html          shell da página
styles.css           visual (tema claro/escuro automático)
src/data.js          conteúdo do jogo (eras, geradores, upgrades)
src/assets.js        resolver de ícone (emoji -> imagem)
src/state.js         estado, save/load, matemática pura
src/game.js          ações do jogo
src/ui.js            renderização
src/main.js          boot + loop
```

## Deploy

Publicado automaticamente no GitHub Pages a cada push na `main`, via
`.github/workflows/pages.yml`.
