import { ERAS, CLICK_UPGRADES } from "./data.js";
import {
  createInitialState,
  loadState,
  saveState,
  clickPower,
  generatorCost,
  totalCps,
  potentialFame,
  currentEraIndex
} from "./state.js";

// Camada única que muta o estado do jogo. UI e dados nunca escrevem em
// `state` diretamente — sempre por aqui, o que mantém as regras num só lugar.

export function createGame(onChange) {
  var state = loadState() || createInitialState();
  var listeners = onChange ? [onChange] : [];

  function emit(eventName, payload) {
    listeners.forEach(function (fn) {
      fn(eventName, payload, state);
    });
  }

  function on(fn) {
    listeners.push(fn);
  }

  function click(clientX, clientY) {
    var amount = clickPower(state);
    state.curtidas += amount;
    state.totalEarned += amount;
    emit("click", { amount: amount, x: clientX, y: clientY });
  }

  function buyGenerator(generatorId) {
    var cost = generatorCost(state, generatorId);
    if (state.curtidas < cost) return false;
    state.curtidas -= cost;
    state.owned[generatorId] += 1;
    emit("buy-generator", { id: generatorId, cost: cost });
    persist();
    return true;
  }

  function buyUpgrade(upgradeId) {
    var upgrade = CLICK_UPGRADES.find(function (u) { return u.id === upgradeId; });
    if (!upgrade || state.upgrades[upgradeId] || state.curtidas < upgrade.cost) return false;
    state.curtidas -= upgrade.cost;
    state.upgrades[upgradeId] = true;
    emit("buy-upgrade", { id: upgradeId });
    persist();
    return true;
  }

  function prestige() {
    var fame = potentialFame(state);
    if (fame <= 0) return false;
    state.fame += fame;
    state.curtidas = 0;
    state.totalEarned = 0;
    state.runsCompleted += 1;
    Object.keys(state.owned).forEach(function (id) { state.owned[id] = 0; });
    Object.keys(state.upgrades).forEach(function (id) { state.upgrades[id] = false; });
    emit("prestige", { fameGained: fame });
    persist();
    return true;
  }

  function hardReset() {
    state = createInitialState();
    emit("reset", {});
    persist();
  }

  function persist() {
    saveState(state);
  }

  // tick de produção passiva; chamado pelo loop em main.js
  function tick(dtSeconds) {
    var gain = totalCps(state) * dtSeconds;
    if (gain > 0) {
      state.curtidas += gain;
      state.totalEarned += gain;
    }
    emit("tick", { dt: dtSeconds });
  }

  return {
    getState: function () { return state; },
    click: click,
    buyGenerator: buyGenerator,
    buyUpgrade: buyUpgrade,
    prestige: prestige,
    hardReset: hardReset,
    tick: tick,
    persist: persist,
    on: on,
    eras: ERAS,
    clickUpgrades: CLICK_UPGRADES,
    currentEraIndex: function () { return currentEraIndex(state); }
  };
}
