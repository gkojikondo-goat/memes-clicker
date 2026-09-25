import { ERAS, CLICK_UPGRADES, GROWTH, SAVE_KEY } from "./data.js";

// ---------- estado inicial ----------

export function createInitialState() {
  var owned = {};
  var upgrades = {};
  ERAS.forEach(function (era) {
    era.generators.forEach(function (g) {
      owned[g.id] = 0;
    });
  });
  CLICK_UPGRADES.forEach(function (u) {
    upgrades[u.id] = false;
  });
  return {
    curtidas: 0,
    totalEarned: 0, // reseta a cada prestígio; decide era atual e Fama ganha
    fame: 0, // permanente, nunca reseta
    owned: owned,
    upgrades: upgrades,
    clickBase: 1,
    runsCompleted: 0
  };
}

// ---------- derivações puras (sem efeito colateral) ----------

export function fameMult(state) {
  return 1 + state.fame * 0.02;
}

export function currentEraIndex(state) {
  var idx = 0;
  for (var i = 0; i < ERAS.length; i++) {
    if (state.totalEarned >= ERAS[i].unlockAt) idx = i;
    else break;
  }
  return idx;
}

export function isEraUnlocked(state, eraIndex) {
  return state.totalEarned >= ERAS[eraIndex].unlockAt;
}

export function nextEraProgress(state) {
  var idx = currentEraIndex(state);
  var next = ERAS[idx + 1];
  if (!next) return null; // última era, sem próxima
  var prevThreshold = ERAS[idx].unlockAt;
  var span = next.unlockAt - prevThreshold;
  var progressed = state.totalEarned - prevThreshold;
  return {
    era: next,
    ratio: Math.max(0, Math.min(1, progressed / span)),
    remaining: Math.max(0, next.unlockAt - state.totalEarned)
  };
}

export function generatorCost(state, generatorId) {
  var g = findGenerator(generatorId);
  return Math.ceil(g.baseCost * Math.pow(GROWTH, state.owned[generatorId]));
}

export function generatorCps(state, generatorId) {
  var g = findGenerator(generatorId);
  return g.baseCps * state.owned[generatorId] * fameMult(state);
}

export function totalCps(state) {
  var sum = 0;
  ERAS.forEach(function (era) {
    era.generators.forEach(function (g) {
      sum += g.baseCps * state.owned[g.id];
    });
  });
  return sum * fameMult(state);
}

export function clickPower(state) {
  var mult = 1;
  CLICK_UPGRADES.forEach(function (u) {
    if (state.upgrades[u.id]) mult *= u.mult;
  });
  return state.clickBase * mult * fameMult(state);
}

export function potentialFame(state) {
  return Math.floor(Math.sqrt(Math.max(0, state.totalEarned) / 1e6));
}

function findGenerator(generatorId) {
  for (var i = 0; i < ERAS.length; i++) {
    var g = ERAS[i].generators.find(function (g) {
      return g.id === generatorId;
    });
    if (g) return g;
  }
  throw new Error("Gerador desconhecido: " + generatorId);
}

export function eraOfGenerator(generatorId) {
  for (var i = 0; i < ERAS.length; i++) {
    if (ERAS[i].generators.some(function (g) { return g.id === generatorId; })) {
      return ERAS[i];
    }
  }
  return null;
}

// ---------- formatação ----------

var SUFFIXES = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function formatNumber(n) {
  if (!isFinite(n)) return "∞";
  var sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  if (n < 1000) return sign + (Math.floor(n * 10) / 10).toString().replace(/\.0$/, "");
  var u = -1;
  var v = n;
  while (v >= 1000 && u < SUFFIXES.length - 1) {
    v /= 1000;
    u++;
  }
  var decimals = v < 10 ? 2 : v < 100 ? 1 : 0;
  return sign + v.toFixed(decimals) + SUFFIXES[u];
}

// ---------- save / load ----------

export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false; // modo privado / storage bloqueado: segue sem salvar
  }
}

export function loadState() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    return mergeIntoFreshState(parsed);
  } catch (e) {
    return null; // save corrompido: começa do zero em vez de quebrar
  }
}

// Mescla um save salvo (possivelmente de uma versão anterior do jogo, com
// menos eras/upgrades) num estado novo, pra nunca quebrar com save antigo.
function mergeIntoFreshState(saved) {
  var fresh = createInitialState();
  if (!saved || typeof saved !== "object") return fresh;
  fresh.curtidas = numberOr(saved.curtidas, 0);
  fresh.totalEarned = numberOr(saved.totalEarned, 0);
  fresh.fame = numberOr(saved.fame, 0);
  fresh.clickBase = numberOr(saved.clickBase, 1);
  fresh.runsCompleted = numberOr(saved.runsCompleted, 0);
  if (saved.owned) {
    Object.keys(fresh.owned).forEach(function (id) {
      fresh.owned[id] = numberOr(saved.owned[id], 0);
    });
  }
  if (saved.upgrades) {
    Object.keys(fresh.upgrades).forEach(function (id) {
      fresh.upgrades[id] = !!saved.upgrades[id];
    });
  }
  return fresh;
}

function numberOr(v, fallback) {
  return typeof v === "number" && isFinite(v) ? v : fallback;
}
