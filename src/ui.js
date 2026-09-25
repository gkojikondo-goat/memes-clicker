import {
  formatNumber,
  fameMult,
  currentEraIndex,
  isEraUnlocked,
  nextEraProgress,
  generatorCost,
  generatorCps,
  totalCps,
  clickPower,
  potentialFame
} from "./state.js";
import { resolveIconHTML, installIconFallback } from "./assets.js";

// Constrói o DOM uma única vez e expõe `render()` pra sincronizar com o
// estado sempre que algo muda. Nenhuma regra de jogo mora aqui.

export function createUI(game) {
  var els = {
    brandLogo: document.getElementById("brandLogo"),
    eraTagline: document.getElementById("eraTagline"),
    fameLabel: document.getElementById("fameLabel"),
    eraTrack: document.getElementById("eraTrack"),
    eraProgressWrap: document.getElementById("eraProgressWrap"),
    eraProgressFill: document.getElementById("eraProgressFill"),
    eraProgressLabel: document.getElementById("eraProgressLabel"),
    statCurtidas: document.getElementById("statCurtidas"),
    statCps: document.getElementById("statCps"),
    statClick: document.getElementById("statClick"),
    clickEraName: document.getElementById("clickEraName"),
    clickBtn: document.getElementById("clickBtn"),
    clickEmoji: document.getElementById("clickEmoji"),
    clickPowerLabel: document.getElementById("clickPowerLabel"),
    upgradeList: document.getElementById("upgradeList"),
    prestigeBtn: document.getElementById("prestigeBtn"),
    prestigeDesc: document.getElementById("prestigeDesc"),
    eraSections: document.getElementById("eraSections"),
    resetBtn: document.getElementById("resetBtn"),
    toast: document.getElementById("toast")
  };

  var openSections = {}; // eraId -> bool, controla accordion da loja
  var genRefs = {};      // generatorId -> refs de DOM
  var upgradeRefs = {};  // upgradeId -> elemento

  installIconFallback(document.body, render);

  buildStaticParts();
  wireEvents();
  render();

  // ---------- construção (uma vez) ----------

  function buildStaticParts() {
    game.eras.forEach(function (era, index) {
      // chip da trilha de eras
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "era-chip";
      chip.dataset.eraId = era.id;
      chip.innerHTML = '<span class="icon">' + era.emoji + '</span><span>' + era.name + '</span>';
      chip.addEventListener("click", function () {
        if (isEraUnlocked(game.getState(), index)) {
          toggleSection(era.id, true);
          document.getElementById("era-section-" + era.id).scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
      els.eraTrack.appendChild(chip);

      // seção da loja pra essa era
      var section = document.createElement("div");
      section.className = "era-section";
      section.id = "era-section-" + era.id;
      section.hidden = true; // some enquanto a era estiver bloqueada

      var head = document.createElement("button");
      head.type = "button";
      head.className = "era-section-head";
      head.innerHTML =
        '<span class="icon-slot" data-icon-slot></span>' +
        '<span class="title"><span class="name">' + era.name + '</span><span class="sub">' + era.tagline + '</span></span>' +
        '<span class="era-section-tag" data-tag>ATUAL</span>' +
        '<span class="cps mono" data-era-cps>0/s</span>' +
        '<span class="chev">▾</span>';
      head.addEventListener("click", function () {
        toggleSection(era.id);
      });
      section.appendChild(head);

      var list = document.createElement("div");
      list.className = "gen-list";
      era.generators.forEach(function (g) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gen";
        btn.innerHTML =
          '<span class="icon-slot" data-icon-slot></span>' +
          '<span class="mid">' +
            '<span class="name">' + g.name + ' <span class="count" data-count>0</span></span>' +
            '<span class="cps" data-cps></span>' +
          '</span>' +
          '<span class="price"><span class="mono" data-price></span><span class="sub">curtidas</span></span>';
        btn.addEventListener("click", function () { game.buyGenerator(g.id); });
        list.appendChild(btn);
        genRefs[g.id] = {
          btn: btn,
          iconSlot: btn.querySelector("[data-icon-slot]"),
          count: btn.querySelector("[data-count]"),
          cps: btn.querySelector("[data-cps]"),
          price: btn.querySelector("[data-price]"),
          def: g
        };
      });
      section.appendChild(list);
      els.eraSections.appendChild(section);

      genRefs["__section_" + era.id] = {
        section: section,
        head: head,
        list: list,
        iconSlot: head.querySelector("[data-icon-slot]"),
        tag: head.querySelector("[data-tag]"),
        cps: head.querySelector("[data-era-cps]"),
        def: era
      };
    });

    game.clickUpgrades.forEach(function (u) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-btn";
      btn.innerHTML =
        '<span class="icon-slot" data-icon-slot></span>' +
        '<span class="info"><span class="name">' + u.name + '</span><span class="desc">' + u.desc + '</span></span>' +
        '<span class="cost mono" data-cost></span>';
      btn.addEventListener("click", function () { game.buyUpgrade(u.id); });
      els.upgradeList.appendChild(btn);
      upgradeRefs[u.id] = {
        btn: btn,
        iconSlot: btn.querySelector("[data-icon-slot]"),
        cost: btn.querySelector("[data-cost]"),
        def: u
      };
    });
  }

  function toggleSection(eraId, forceOpen) {
    var ref = genRefs["__section_" + eraId];
    if (!ref) return;
    var isOpen = !ref.list.hidden;
    var next = forceOpen === true ? true : !isOpen;
    ref.list.hidden = !next;
    ref.section.classList.toggle("open", next);
    openSections[eraId] = next;
  }

  // ---------- eventos ----------

  function wireEvents() {
    els.clickBtn.addEventListener("click", function (e) {
      game.click(e.clientX, e.clientY);
    });
    els.prestigeBtn.addEventListener("click", function () {
      game.prestige();
    });
    els.resetBtn.addEventListener("click", function () {
      if (confirmReset()) game.hardReset();
    });
    game.on(function (eventName, payload) {
      if (eventName === "click") floatText(payload.x, payload.y, "+" + formatNumber(payload.amount));
      if (eventName === "buy-upgrade") showToast(payload.id + " comprado!");
      if (eventName === "prestige") showToast("Viralizou! +" + formatNumber(payload.fameGained) + " Fama");
      if (eventName === "reset") showToast("Progresso reiniciado");
      render();
    });
  }

  function confirmReset() {
    // sem window.confirm (indisponível em contexto de artifact / algumas
    // sandboxes); usa dupla confirmação por clique com aviso via toast.
    if (els.resetBtn.dataset.armed === "1") {
      els.resetBtn.dataset.armed = "0";
      els.resetBtn.textContent = "reiniciar tudo";
      return true;
    }
    els.resetBtn.dataset.armed = "1";
    els.resetBtn.textContent = "clique de novo pra confirmar";
    setTimeout(function () {
      els.resetBtn.dataset.armed = "0";
      els.resetBtn.textContent = "reiniciar tudo";
    }, 3000);
    return false;
  }

  // ---------- render ----------

  function render() {
    var state = game.getState();
    var idx = currentEraIndex(state);
    var era = game.eras[idx];
    var mult = fameMult(state);

    els.brandLogo.innerHTML = resolveIconHTML(era, { size: 22 });
    els.eraTagline.textContent = era.tagline;
    els.fameLabel.textContent = formatNumber(state.fame) + " Fama · x" + mult.toFixed(2);

    els.statCurtidas.textContent = formatNumber(state.curtidas);
    els.statCps.textContent = formatNumber(totalCps(state));
    var cp = clickPower(state);
    els.statClick.textContent = formatNumber(cp);

    els.clickEraName.textContent = era.name;
    els.clickEmoji.textContent = era.emoji;
    els.clickPowerLabel.textContent = formatNumber(cp);

    // trilha de eras
    game.eras.forEach(function (e, i) {
      var chip = els.eraTrack.querySelector('[data-era-id="' + e.id + '"]');
      var unlocked = isEraUnlocked(state, i);
      chip.classList.toggle("locked", !unlocked);
      chip.classList.toggle("current", unlocked && i === idx);
      chip.classList.toggle("legado", unlocked && i < idx);
      chip.querySelector(".icon").textContent = unlocked ? e.emoji : "🔒";
    });

    // barra de progresso pra próxima era
    var progress = nextEraProgress(state);
    if (progress) {
      els.eraProgressWrap.hidden = false;
      els.eraProgressFill.style.width = (progress.ratio * 100).toFixed(1) + "%";
      els.eraProgressLabel.textContent =
        "faltam " + formatNumber(progress.remaining) + " curtidas pra \"" + progress.era.name + "\"";
    } else {
      els.eraProgressWrap.hidden = true;
    }

    // seções da loja
    game.eras.forEach(function (e, i) {
      var ref = genRefs["__section_" + e.id];
      var unlocked = isEraUnlocked(state, i);
      ref.section.hidden = !unlocked;
      if (!unlocked) return;

      ref.iconSlot.innerHTML = resolveIconHTML(e, { size: 22 });
      var eraCps = e.generators.reduce(function (sum, g) { return sum + generatorCps(state, g.id); }, 0);
      ref.cps.textContent = "+" + formatNumber(eraCps) + "/s";
      ref.section.classList.toggle("legado", i < idx);
      ref.tag.textContent = i === idx ? "ATUAL" : "LEGADO";
      ref.tag.hidden = false;

      // abre a era atual por padrão na primeira vez que ela é vista
      if (openSections[e.id] === undefined) {
        openSections[e.id] = i === idx;
        ref.list.hidden = !openSections[e.id];
        ref.section.classList.toggle("open", openSections[e.id]);
      }

      e.generators.forEach(function (g) {
        var gref = genRefs[g.id];
        var cost = generatorCost(state, g.id);
        var owned = state.owned[g.id];
        gref.iconSlot.innerHTML = resolveIconHTML(g, { size: 20 });
        gref.count.textContent = owned;
        gref.cps.textContent = "+" + formatNumber(g.baseCps * mult) + "/s cada · " + g.flavor;
        gref.price.textContent = formatNumber(cost);
        gref.btn.disabled = state.curtidas < cost;
      });
    });

    // upgrades de clique
    game.clickUpgrades.forEach(function (u) {
      var ref = upgradeRefs[u.id];
      ref.iconSlot.innerHTML = resolveIconHTML(u, { size: 20 });
      if (state.upgrades[u.id]) {
        ref.btn.classList.add("owned");
        ref.btn.disabled = true;
        ref.cost.textContent = "✓";
      } else {
        ref.btn.classList.remove("owned");
        ref.btn.disabled = state.curtidas < u.cost;
        ref.cost.textContent = formatNumber(u.cost);
      }
    });

    // prestígio
    var pf = potentialFame(state);
    if (pf > 0) {
      els.prestigeBtn.disabled = false;
      els.prestigeDesc.textContent =
        "Viralize agora e ganhe +" + formatNumber(pf) + " Fama permanente (produção total fica x" +
        (1 + (state.fame + pf) * 0.02).toFixed(2) + ").";
    } else {
      els.prestigeBtn.disabled = true;
      els.prestigeDesc.textContent = "Acumule pelo menos 1.000.000 de curtidas nesta run pra desbloquear a primeira viralizada.";
    }
  }

  // ---------- efeitos visuais ----------

  var toastTimer = null;
  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, 1600);
  }

  function floatText(x, y, text) {
    var f = document.createElement("div");
    f.className = "float";
    f.textContent = text;
    f.style.left = ((x || window.innerWidth / 2) - 14) + "px";
    f.style.top = ((y || window.innerHeight / 2) - 10) + "px";
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 820);
  }

  return { render: render };
}
