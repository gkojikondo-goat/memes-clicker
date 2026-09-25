import { createGame } from "./game.js";
import { createUI } from "./ui.js";

var game = createGame();
var ui = createUI(game);

// loop de produção passiva
var TICK_MS = 250;
var last = Date.now();
setInterval(function () {
  var now = Date.now();
  var dt = (now - last) / 1000;
  last = now;
  game.tick(dt);
  ui.render();
}, TICK_MS);

// salva periodicamente além dos pontos de compra/prestígio (cobre o
// progresso passivo entre uma compra e outra)
setInterval(function () { game.persist(); }, 5000);

// salva ao sair da página, cobrindo o intervalo desde o último save
window.addEventListener("pagehide", function () { game.persist(); });
window.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") game.persist();
});
