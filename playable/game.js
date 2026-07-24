/*
 * Age of Legends — playable prototype: game logic and UI.
 *
 * Ties together the kingdom renderer, hero roster and campaign auto-battler
 * into a single-page experience with a fixed-step simulation, offline
 * production and local-storage saves. Classic script; shares the AOL namespace.
 */
(function (AOL) {
  'use strict';

  var SAVE_KEY = 'aol-game-save-v2';
  var STEP = 1 / 20;
  var state, rng;

  // ---------------------------------------------------------------- state ---
  function defaultState(seedStr) {
    var seed = AOL.hashSeed(seedStr);
    var s = {
      version: 2,
      seedStr: seedStr,
      seed: seed,
      resources: { gold: 250, food: 200, wood: 300, stone: 220, iron: 120 },
      gems: 120,
      stamina: 30,
      staminaMax: 30,
      staminaTimer: 0,
      buildings: {},
      heroes: AOL.HERO_POOL.map(function (h) {
        return {
          id: h.id,
          name: h.name,
          cls: h.cls,
          rarity: h.rarity,
          owned: h.owned,
          level: 1,
          xp: 0,
        };
      }),
      party: [],
      campaignStage: 1,
      clock: 0,
      day: 1,
      lastTs: Date.now(),
      log: [],
    };
    AOL.LAYOUT.forEach(function (item) {
      s.buildings[item.type] = {
        type: item.type,
        col: item.col,
        row: item.row,
        level: 1,
        upgradeEndsAt: 0,
        upgradeTotalMs: 0,
      };
    });
    s.party = s.heroes
      .filter(function (h) {
        return h.owned;
      })
      .slice(0, 5)
      .map(function (h) {
        return h.id;
      });
    return s;
  }

  function save() {
    state.lastTs = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      toast('Progress saved.', '');
    } catch (e) {
      toast('Save failed.', 'bad');
    }
  }
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      return s && s.version === 2 ? s : null;
    } catch (e) {
      return null;
    }
  }

  function hero(id) {
    return state.heroes.find(function (h) {
      return h.id === id;
    });
  }
  function affordable(cost) {
    return Object.keys(cost).every(function (k) {
      return state.resources[k] >= cost[k];
    });
  }
  function spend(cost) {
    Object.keys(cost).forEach(function (k) {
      state.resources[k] -= cost[k];
    });
  }

  // ----------------------------------------------------------- simulation ---
  function step(dt) {
    // Production.
    AOL.LAYOUT.forEach(function (item) {
      var b = state.buildings[item.type];
      var def = AOL.BUILDINGS[item.type];
      if (def.produce) state.resources[def.produce.res] += def.produce.rate * b.level * dt;
    });
    // Stamina regen.
    state.staminaTimer += dt;
    if (state.staminaTimer >= 8 && state.stamina < state.staminaMax) {
      state.staminaTimer = 0;
      state.stamina++;
    }
    // Building completion.
    var now = Date.now();
    AOL.LAYOUT.forEach(function (item) {
      var b = state.buildings[item.type];
      if (b.upgradeEndsAt && now >= b.upgradeEndsAt) {
        b.level++;
        b.upgradeEndsAt = 0;
        b.upgradeTotalMs = 0;
        toast(AOL.BUILDINGS[item.type].name + ' upgraded to Lv ' + b.level + '!', 'gold');
        if (item.type === 'castle') toast('New building tiers unlocked!', 'good');
        if (openBuilding === item.type) renderModal(item.type);
        refreshHud();
      }
    });
    // Day / night clock.
    state.clock += dt;
    if (state.clock >= 120) {
      state.clock -= 120;
      state.day++;
    }
  }

  function applyOffline() {
    var elapsed = Math.min(8 * 3600, (Date.now() - (state.lastTs || Date.now())) / 1000);
    if (elapsed < 5) return;
    var gained = {};
    AOL.LAYOUT.forEach(function (item) {
      var b = state.buildings[item.type];
      var def = AOL.BUILDINGS[item.type];
      if (def.produce) {
        var amt = def.produce.rate * b.level * elapsed;
        state.resources[def.produce.res] += amt;
        gained[def.produce.res] = (gained[def.produce.res] || 0) + amt;
      }
    });
    var parts = Object.keys(gained).map(function (k) {
      return AOL.RES_ICON[k] + AOL.fmt(gained[k]);
    });
    if (parts.length) toast('Welcome back! Collected ' + parts.join(' '), 'good');
  }

  // ------------------------------------------------------------------ HUD ---
  var el = {};
  function cacheEl() {
    [
      'resBar',
      'gemsText',
      'staminaText',
      'kingdomLevel',
      'heroGrid',
      'campaignBody',
      'toasts',
      'modal',
      'modalCard',
      'battle',
      'menu',
    ].forEach(function (id) {
      el[id] = document.getElementById(id);
    });
  }

  function refreshHud() {
    var html = '';
    AOL.RES.forEach(function (k) {
      var rate = 0;
      AOL.LAYOUT.forEach(function (item) {
        var def = AOL.BUILDINGS[item.type];
        if (def.produce && def.produce.res === k)
          rate += def.produce.rate * state.buildings[item.type].level;
      });
      html +=
        '<div class="chip gold" title="' +
        AOL.RES_NAME[k] +
        ' (+' +
        rate.toFixed(1) +
        '/s)"><span class="ico">' +
        AOL.RES_ICON[k] +
        '</span><b>' +
        AOL.fmt(state.resources[k]) +
        '</b></div>';
    });
    el.resBar.innerHTML = html;
    el.gemsText.textContent = AOL.fmt(state.gems);
    el.staminaText.textContent = Math.floor(state.stamina) + '/' + state.staminaMax;
    el.kingdomLevel.textContent = state.buildings.castle.level;
  }

  // -------------------------------------------------------- building modal ---
  var openBuilding = null;
  function openModal(type) {
    openBuilding = type;
    renderModal(type);
    el.modal.classList.remove('hidden');
  }
  function closeModal() {
    openBuilding = null;
    el.modal.classList.add('hidden');
  }

  function renderModal(type) {
    var b = state.buildings[type];
    var def = AOL.BUILDINGS[type];
    var now = Date.now();
    var building = b.upgradeEndsAt && b.upgradeEndsAt > now;
    var atCap = b.level >= AOL.buildingMaxTier(state, type);
    var cost = AOL.upgradeCost(type, b.level + 1);
    var secs = AOL.upgradeSeconds(b.level + 1);

    var html =
      '<div class="modal-head"><div class="b-emoji">' +
      def.emoji +
      '</div>' +
      '<div><h3>' +
      def.name +
      '</h3><div class="lvl">Level ' +
      b.level +
      '</div></div></div>';
    html +=
      '<p class="muted" style="font-size:0.82rem;margin:0.2rem 0 0.6rem">' + def.desc + '</p>';

    if (def.produce) {
      html += statRow(
        'Production',
        '+' + (def.produce.rate * b.level).toFixed(1) + '/s ' + AOL.RES_NAME[def.produce.res],
      );
      if (!atCap)
        html += statRow('Next level', '+' + (def.produce.rate * (b.level + 1)).toFixed(1) + '/s');
    }
    if (def.armyPower) html += statRow('Army power', '+' + def.armyPower * b.level);

    if (building) {
      var remain = Math.ceil((b.upgradeEndsAt - now) / 1000);
      html += '<div class="stat-row"><span>Upgrading…</span><b>' + remain + 's left</b></div>';
      html +=
        '<div class="modal-actions">' +
        '<button class="btn gold" id="rushBtn">⚡ Speed up (' +
        rushCost(remain) +
        ' 💎)</button>' +
        '<button class="btn ghost" id="closeModal">Close</button></div>';
    } else if (atCap) {
      var why =
        type === 'castle' ? 'Maximum level reached.' : 'Raise the Castle to unlock the next tier.';
      html += '<div class="stat-row"><span>' + why + '</span><b>Lv ' + b.level + '</b></div>';
      html +=
        '<div class="modal-actions"><button class="btn ghost" id="closeModal">Close</button></div>';
    } else {
      html +=
        '<div class="cost-line">' +
        Object.keys(cost)
          .map(function (k) {
            var lack = state.resources[k] < cost[k];
            return (
              '<span class="cost-item ' +
              (lack ? 'lack' : '') +
              '">' +
              AOL.RES_ICON[k] +
              ' ' +
              AOL.fmt(cost[k]) +
              '</span>'
            );
          })
          .join('') +
        '</div>';
      html += '<div class="stat-row"><span>Build time</span><b>' + secs + 's</b></div>';
      var can = affordable(cost);
      html +=
        '<div class="modal-actions">' +
        '<button class="btn green" id="upgradeBtn" ' +
        (can ? '' : 'disabled') +
        '>Upgrade to Lv ' +
        (b.level + 1) +
        '</button>' +
        '<button class="btn ghost" id="closeModal">Close</button></div>';
    }
    el.modalCard.innerHTML = html;

    var up = document.getElementById('upgradeBtn');
    if (up)
      up.onclick = function () {
        doUpgrade(type);
      };
    var rush = document.getElementById('rushBtn');
    if (rush)
      rush.onclick = function () {
        doRush(type);
      };
    document.getElementById('closeModal').onclick = closeModal;
  }

  function statRow(label, val) {
    return '<div class="stat-row"><span>' + label + '</span><b>' + val + '</b></div>';
  }
  function rushCost(remainSec) {
    return Math.max(1, Math.ceil(remainSec / 4));
  }

  function doUpgrade(type) {
    var b = state.buildings[type];
    if (b.level >= AOL.buildingMaxTier(state, type)) return;
    var cost = AOL.upgradeCost(type, b.level + 1);
    if (!affordable(cost)) {
      toast('Not enough resources.', 'bad');
      return;
    }
    spend(cost);
    var ms = AOL.upgradeSeconds(b.level + 1) * 1000;
    b.upgradeEndsAt = Date.now() + ms;
    b.upgradeTotalMs = ms;
    toast('Construction started.', '');
    refreshHud();
    renderModal(type);
  }
  function doRush(type) {
    var b = state.buildings[type];
    var remain = Math.ceil((b.upgradeEndsAt - Date.now()) / 1000);
    var cost = rushCost(remain);
    if (state.gems < cost) {
      toast('Not enough gems.', 'bad');
      return;
    }
    state.gems -= cost;
    b.upgradeEndsAt = Date.now();
    toast('Construction rushed!', 'gold');
    refreshHud();
  }

  // ----------------------------------------------------------- heroes view ---
  function renderHeroes() {
    var owned = state.heroes.filter(function (h) {
      return h.owned;
    });
    var locked = state.heroes.filter(function (h) {
      return !h.owned;
    });
    var html = owned.map(heroCard).join('');
    if (locked.length) {
      html +=
        '<div style="grid-column:1/-1;color:var(--muted);font-size:0.8rem;margin-top:0.5rem">Not yet recruited</div>';
      html += locked.map(heroCard).join('');
    }
    el.heroGrid.innerHTML = html;
    el.heroGrid.querySelectorAll('[data-lvlup]').forEach(function (btn) {
      btn.onclick = function () {
        levelUp(btn.getAttribute('data-lvlup'));
      };
    });
    el.heroGrid.querySelectorAll('[data-party]').forEach(function (btn) {
      btn.onclick = function () {
        toggleParty(btn.getAttribute('data-party'));
      };
    });
    el.heroGrid.querySelectorAll('[data-recruit]').forEach(function (btn) {
      btn.onclick = function () {
        recruit(btn.getAttribute('data-recruit'));
      };
    });
  }

  function heroCard(h) {
    var st = AOL.heroStats(h);
    var r = AOL.RARITY[h.rarity];
    var inParty = state.party.indexOf(h.id) >= 0;
    var cls = AOL.CLASSES[h.cls];
    var html = '<div class="hero-card ' + (inParty ? 'in-party' : '') + '">';
    html += '<div class="hero-portrait bg-' + r.key + '">';
    html += '<span class="cls-badge">' + cls.emoji + '</span>';
    html += '<span class="emblem">' + heroEmblem(h) + '</span>';
    html += '<span class="lvl-badge">Lv ' + h.level + '</span></div>';
    html += '<div class="hero-name">' + h.name + '</div>';
    html += '<div class="hero-stars rarity-' + r.key + '">' + AOL.stars(h.rarity) + '</div>';
    html += '<div class="hero-power">⚔️ Power <b>' + AOL.fmt(st.power) + '</b></div>';
    if (h.owned) {
      var cost = AOL.heroLevelCost(h);
      var can = affordable(cost);
      html += '<div class="hero-actions">';
      html +=
        '<button class="btn ' +
        (can ? 'gold' : '') +
        '" data-lvlup="' +
        h.id +
        '" ' +
        (can ? '' : 'disabled') +
        '>Lv Up 🪙' +
        AOL.fmt(cost.gold) +
        '</button>';
      html +=
        '<button class="btn ' +
        (inParty ? 'green' : 'ghost') +
        '" data-party="' +
        h.id +
        '">' +
        (inParty ? '✓' : '+') +
        '</button>';
      html += '</div>';
    } else {
      html +=
        '<div class="hero-actions"><button class="btn" data-recruit="' +
        h.id +
        '">Recruit 💎150</button></div>';
    }
    html += '</div>';
    return html;
  }

  function heroEmblem(h) {
    // A stable, original emblem per hero from its class.
    return AOL.CLASSES[h.cls].emoji;
  }

  function levelUp(id) {
    var h = hero(id);
    var cost = AOL.heroLevelCost(h);
    if (!affordable(cost)) {
      toast('Not enough resources.', 'bad');
      return;
    }
    spend(cost);
    h.level++;
    toast(h.name + ' is now Lv ' + h.level + '!', 'gold');
    refreshHud();
    renderHeroes();
  }
  function toggleParty(id) {
    var i = state.party.indexOf(id);
    if (i >= 0) {
      state.party.splice(i, 1);
    } else {
      if (state.party.length >= 5) {
        toast('Party is full (5).', 'bad');
        return;
      }
      state.party.push(id);
    }
    renderHeroes();
    if (currentView === 'campaign') renderCampaign();
  }
  function recruit(id) {
    var h = hero(id);
    if (state.gems < 150) {
      toast('Not enough gems.', 'bad');
      return;
    }
    state.gems -= 150;
    h.owned = true;
    toast('Recruited ' + h.name + '!', 'gold');
    refreshHud();
    renderHeroes();
  }

  // --------------------------------------------------------- campaign view ---
  function partyPower() {
    var p = state.party.reduce(function (sum, id) {
      return sum + AOL.heroStats(hero(id)).power;
    }, 0);
    p += (state.buildings.barracks.level - 1) * AOL.BUILDINGS.barracks.armyPower * 5;
    return p;
  }

  function renderCampaign() {
    var stage = state.campaignStage;
    var reward = AOL.stageReward(stage);
    var enemyPreview = AOL.makeEnemyTeam(stage, new AOL.Rng(state.seed + stage));
    var enemyPower = enemyPreview.reduce(function (s, e) {
      return s + Math.round(e.maxHp * 0.25 + e.atk * 3.2 + e.spd * 2);
    }, 0);

    var html =
      '<div class="stage-banner">' +
      '<div class="stage-no">' +
      stage +
      '</div>' +
      '<div class="stage-info"><h3>Stage ' +
      stage +
      '</h3>' +
      '<div class="muted" style="font-size:0.8rem">Enemy power ~ ' +
      AOL.fmt(enemyPower) +
      ' · Reward 🪙' +
      reward.gold +
      ' 💎' +
      reward.gems +
      '</div></div>' +
      '<div style="text-align:right"><div class="muted" style="font-size:0.72rem">Your power</div><div style="font-size:1.3rem;font-weight:800;color:var(--orange)">' +
      AOL.fmt(partyPower()) +
      '</div></div>' +
      '</div>';

    html += '<div class="muted" style="font-size:0.8rem;margin-bottom:0.3rem">Battle party</div>';
    html += '<div class="party-strip">';
    for (var i = 0; i < 5; i++) {
      var id = state.party[i];
      if (id) {
        var h = hero(id);
        html +=
          '<div class="party-slot"><span class="emblem">' +
          heroEmblem(h) +
          '</span><span class="lvl-badge">Lv ' +
          h.level +
          '</span></div>';
      } else {
        html += '<div class="party-slot"><span class="empty-slot">+</span></div>';
      }
    }
    html += '</div>';

    var canFight = state.party.length > 0 && state.stamina >= 6;
    html +=
      '<button class="btn gold" id="fightBtn" style="width:100%;padding:0.8rem;font-size:1rem" ' +
      (canFight ? '' : 'disabled') +
      '>' +
      (state.party.length === 0 ? 'Add heroes to your party first' : '⚔️ Battle  (–6 ⚡)') +
      '</button>';
    html +=
      '<div class="muted" style="font-size:0.75rem;text-align:center;margin-top:0.5rem">Tip: raise the Barracks and level your heroes to grow your power.</div>';

    el.campaignBody.innerHTML = html;
    var fb = document.getElementById('fightBtn');
    if (fb) fb.onclick = startBattle;
  }

  // ----------------------------------------------------------- auto-battle ---
  function startBattle() {
    if (state.party.length === 0) return;
    if (state.stamina < 6) {
      toast('Not enough stamina.', 'bad');
      return;
    }
    state.stamina -= 6;
    refreshHud();

    var brng = new AOL.Rng(state.seed + state.campaignStage * 131 + Date.now());
    var allies = state.party.map(function (id) {
      var h = hero(id);
      var st = AOL.heroStats(h);
      var bonus = 1 + (state.buildings.barracks.level - 1) * 0.05;
      return {
        name: h.name,
        emoji: st.emoji,
        role: st.role,
        maxHp: Math.round(st.hp * bonus),
        hp: Math.round(st.hp * bonus),
        atk: Math.round(st.atk * bonus),
        spd: st.spd,
        side: 'ally',
        alive: true,
        charge: brng.range(0, 60),
      };
    });
    var enemies = AOL.makeEnemyTeam(state.campaignStage, brng).map(function (e) {
      e.side = 'enemy';
      e.charge = brng.range(0, 60);
      return e;
    });

    var reward = AOL.stageReward(state.campaignStage);
    var rewardText =
      AOL.RES_ICON.gold +
      ' ' +
      reward.gold +
      '   💎 ' +
      reward.gems +
      '   ✨ ' +
      reward.heroXp +
      ' XP';

    AOL.Battle.start({
      overlay: el.battle,
      stage: state.campaignStage,
      allies: allies,
      enemies: enemies,
      rewardText: rewardText,
      onEnd: function (result) {
        if (result.win) {
          state.resources.gold += reward.gold;
          state.gems += reward.gems;
          grantHeroXp(reward.heroXp);
          state.campaignStage++;
          toast('Victory! Stage ' + (state.campaignStage - 1) + ' cleared.', 'good');
        }
        refreshHud();
        renderCampaign();
        save();
      },
    });
  }

  function grantHeroXp(xp) {
    state.party.forEach(function (id) {
      var h = hero(id);
      h.xp += xp;
      var need = 50 + h.level * 40;
      while (h.xp >= need) {
        h.xp -= need;
        h.level++;
        need = 50 + h.level * 40;
      }
    });
  }

  // ----------------------------------------------------------------- views ---
  var currentView = 'kingdom';
  function switchView(v) {
    currentView = v;
    document.querySelectorAll('.view').forEach(function (n) {
      n.classList.remove('active');
    });
    document.getElementById('view-' + v).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-view') === v);
    });
    if (v === 'heroes') renderHeroes();
    if (v === 'campaign') renderCampaign();
    if (v === 'kingdom') AOL.Kingdom.resize();
  }

  // ---------------------------------------------------------------- toasts ---
  function toast(text, kind) {
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = text;
    el.toasts.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateY(-8px)';
      t.style.transition = 'all 0.3s';
    }, 1800);
    setTimeout(function () {
      t.remove();
    }, 2200);
  }

  // ------------------------------------------------------------------ boot ---
  function boot() {
    cacheEl();
    var saved = load();
    if (saved) {
      state = saved;
      applyOffline();
      toast('Realm restored.', '');
    } else {
      state = defaultState('age-of-legends');
    }
    rng = new AOL.Rng(state.seed);

    AOL.Kingdom.init(document.getElementById('kingdom'), {
      getState: function () {
        return state;
      },
      onPick: function (type) {
        openModal(type);
      },
    });

    // Nav
    document.querySelectorAll('.nav-btn[data-view]').forEach(function (b) {
      b.onclick = function () {
        switchView(b.getAttribute('data-view'));
      };
    });
    document.getElementById('menuBtn').onclick = function () {
      el.menu.classList.remove('hidden');
    };
    document.getElementById('closeMenu').onclick = function () {
      el.menu.classList.add('hidden');
    };
    document.getElementById('saveBtn').onclick = function () {
      save();
      el.menu.classList.add('hidden');
    };
    document.getElementById('newGameBtn').onclick = function () {
      if (confirm('Start a new game? Current progress will be replaced.')) {
        state = defaultState('age-of-legends-' + Date.now());
        rng = new AOL.Rng(state.seed);
        el.menu.classList.add('hidden');
        refreshHud();
        switchView('kingdom');
      }
    };
    el.modal.addEventListener('click', function (e) {
      if (e.target === el.modal) closeModal();
    });

    refreshHud();

    // Autosave.
    setInterval(save, 20000);

    // Main loop.
    var last = performance.now(),
      acc = 0,
      hud = 0;
    function loop(now) {
      var dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      acc += dt;
      var steps = 0;
      while (acc >= STEP && steps < 5) {
        step(STEP);
        acc -= STEP;
        steps++;
      }
      if (currentView === 'kingdom') AOL.Kingdom.render(dt * 1000);
      hud += dt;
      if (hud >= 0.5) {
        hud = 0;
        refreshHud();
        if (openBuilding) renderModal(openBuilding);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.AOL);
