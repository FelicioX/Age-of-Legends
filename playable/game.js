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
      formation: {},
      jobs: [],
      campaignStage: 1,
      idle: { lastCollect: Date.now() },
      ftue: { step: 0, done: false, firstWinDone: false },
      login: { claimedDay: null, index: 0 },
      missions: { day: null, progress: {}, claimed: {}, ap: 0, chests: {} },
      gacha: { sinceEpic: 0, sinceLeg: 0, total: 0 },
      shards: {},
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
  function heroLine(id) {
    if (state.formation && state.formation[id]) return state.formation[id];
    return AOL.defaultLine(hero(id));
  }
  function setLine(id, line) {
    if (!state.formation) state.formation = {};
    state.formation[id] = line;
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

  // Grant a mixed reward object: { gold, food, wood, stone, iron, gems, heroXp }.
  function grantReward(r) {
    if (!r) return;
    AOL.RES.forEach(function (k) {
      if (r[k]) state.resources[k] += r[k];
    });
    if (r.gems) state.gems += r.gems;
    if (r.heroXp) grantHeroXp(r.heroXp);
  }
  function rewardText(r) {
    var parts = [];
    AOL.RES.forEach(function (k) {
      if (r[k]) parts.push(AOL.RES_ICON[k] + AOL.fmt(r[k]));
    });
    if (r.gems) parts.push('💎' + r.gems);
    if (r.heroXp) parts.push('✨' + r.heroXp);
    return parts.join(' ');
  }

  // ------------------------------------------------------------ build queue ---
  // A limited number of builders process upgrade jobs. Extra requests wait in
  // the queue. The active job of each building keeps its upgradeEndsAt so the
  // kingdom renderer can still draw the progress ring.
  function builders() {
    return AOL.builderCount(state.buildings.castle.level);
  }
  function jobsFor(type) {
    return state.jobs.filter(function (j) {
      return j.type === type;
    });
  }
  function activeJobFor(type) {
    return state.jobs.find(function (j) {
      return j.type === type && j.active;
    });
  }
  function nextLevelFor(type) {
    return state.buildings[type].level + jobsFor(type).length + 1;
  }
  function reconcileJobs() {
    var now = Date.now();
    var active = state.jobs.filter(function (j) {
      return j.active;
    }).length;
    for (var i = 0; i < state.jobs.length && active < builders(); i++) {
      var j = state.jobs[i];
      if (j.active) continue;
      // Only one active job per building at a time (levels are sequential).
      if (activeJobFor(j.type)) continue;
      j.active = true;
      j.endsAt = now + j.totalMs;
      var b = state.buildings[j.type];
      b.upgradeEndsAt = j.endsAt;
      b.upgradeTotalMs = j.totalMs;
      active++;
    }
  }
  function enqueueUpgrade(type) {
    if (state.jobs.length >= AOL.BUILD_QUEUE_MAX) {
      toast('Build queue is full.', 'bad');
      return false;
    }
    var nextLevel = nextLevelFor(type);
    if (nextLevel > AOL.buildingMaxTier(state, type)) {
      toast('Raise the Castle to unlock the next tier.', 'bad');
      return false;
    }
    var cost = AOL.upgradeCost(type, nextLevel);
    if (!affordable(cost)) {
      toast('Not enough resources.', 'bad');
      return false;
    }
    spend(cost);
    state.jobs.push({
      type: type,
      toLevel: nextLevel,
      totalMs: AOL.upgradeSeconds(nextLevel) * 1000,
      active: false,
      endsAt: 0,
    });
    reconcileJobs();
    var waiting = !activeJobFor(type) || activeJobFor(type).toLevel !== nextLevel;
    toast(waiting ? 'Queued (waiting for a builder).' : 'Construction started.', '');
    return true;
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
    var done = state.jobs.filter(function (j) {
      return j.active && now >= j.endsAt;
    });
    if (done.length) {
      done.forEach(function (j) {
        var b = state.buildings[j.type];
        b.level = j.toLevel;
        b.upgradeEndsAt = 0;
        b.upgradeTotalMs = 0;
        state.jobs.splice(state.jobs.indexOf(j), 1);
        bumpMission('upgrade', 1);
        toast(AOL.BUILDINGS[j.type].name + ' upgraded to Lv ' + b.level + '!', 'gold');
        if (j.type === 'castle') toast('New building tiers unlocked!', 'good');
      });
      reconcileJobs();
      if (openBuilding) renderModal(openBuilding);
      renderQueue();
      refreshHud();
    }
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
      'dailyBody',
      'buildQueue',
      'ftue',
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

  // Build-queue strip over the kingdom view.
  function renderQueue() {
    if (!el.buildQueue) return;
    if (!state.jobs || !state.jobs.length) {
      el.buildQueue.classList.add('hidden');
      el.buildQueue.innerHTML = '';
      return;
    }
    el.buildQueue.classList.remove('hidden');
    var now = Date.now();
    var chips = state.jobs
      .map(function (j) {
        var def = AOL.BUILDINGS[j.type];
        if (j.active) {
          var remain = Math.max(0, Math.ceil((j.endsAt - now) / 1000));
          var prog = Math.max(0, Math.min(1, 1 - (j.endsAt - now) / j.totalMs));
          return (
            '<div class="q-chip active" data-q="' +
            j.type +
            '"><span class="q-emoji">' +
            def.emoji +
            '</span><span class="q-lv">Lv ' +
            j.toLevel +
            '</span>' +
            '<span class="q-bar"><span style="width:' +
            Math.round(prog * 100) +
            '%"></span></span>' +
            '<span class="q-time">' +
            remain +
            's</span></div>'
          );
        }
        return (
          '<div class="q-chip wait" data-q="' +
          j.type +
          '"><span class="q-emoji">' +
          def.emoji +
          '</span><span class="q-lv">Lv ' +
          j.toLevel +
          '</span><span class="q-wait">⏳</span></div>'
        );
      })
      .join('');
    el.buildQueue.innerHTML =
      '<div class="q-label">🔨 ' + activeCount() + '/' + builders() + '</div>' + chips;
    el.buildQueue.querySelectorAll('[data-q]').forEach(function (node) {
      node.onclick = function () {
        openModal(node.getAttribute('data-q'));
      };
    });
  }

  // -------------------------------------------------------- building modal ---
  var openBuilding = null;
  var openHero = null;
  function openModal(type) {
    openBuilding = type;
    renderModal(type);
    el.modal.classList.remove('hidden');
  }
  function closeModal() {
    openBuilding = null;
    openHero = null;
    el.modal.classList.add('hidden');
  }

  function renderModal(type) {
    var b = state.buildings[type];
    var def = AOL.BUILDINGS[type];
    var now = Date.now();
    var active = activeJobFor(type);
    var pending = jobsFor(type).filter(function (j) {
      return !j.active;
    });
    var nextLevel = nextLevelFor(type);
    var atCap = nextLevel > AOL.buildingMaxTier(state, type);
    var queueFull = state.jobs.length >= AOL.BUILD_QUEUE_MAX;
    var cost = AOL.upgradeCost(type, nextLevel);
    var secs = AOL.upgradeSeconds(nextLevel);

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

    // Active build for this building.
    if (active) {
      var remain = Math.ceil((active.endsAt - now) / 1000);
      html +=
        '<div class="stat-row"><span>Upgrading to Lv ' +
        active.toLevel +
        '…</span><b>' +
        remain +
        's left</b></div>';
    }
    // Pending (queued, waiting for a builder) upgrades for this building.
    pending.forEach(function (j) {
      html +=
        '<div class="stat-row queued"><span>⏳ Queued → Lv ' +
        j.toLevel +
        '</span><b>waiting</b></div>';
    });
    html +=
      '<div class="stat-row"><span>Builders</span><b>' +
      state.jobs.filter(function (j) {
        return j.active;
      }).length +
      ' / ' +
      builders() +
      ' busy</b></div>';

    var actions = '';
    if (active) {
      actions +=
        '<button class="btn gold" id="rushBtn">⚡ Speed up (' +
        rushCost(Math.ceil((active.endsAt - now) / 1000)) +
        ' 💎)</button>';
    }
    if (atCap) {
      var why =
        type === 'castle' ? 'Max level reached.' : 'Raise the Castle to unlock the next tier.';
      html += '<div class="stat-row"><span>' + why + '</span><b>Lv ' + b.level + '</b></div>';
    } else if (queueFull) {
      html += '<div class="stat-row"><span>Build queue is full.</span><b></b></div>';
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
      var willQueue = jobsFor(type).length > 0 || activeCount() >= builders();
      actions +=
        '<button class="btn green" id="upgradeBtn" ' +
        (can ? '' : 'disabled') +
        '>' +
        (willQueue ? '➕ Queue Lv ' : 'Upgrade to Lv ') +
        nextLevel +
        '</button>';
    }
    actions += '<button class="btn ghost" id="closeModal">Close</button>';
    html += '<div class="modal-actions">' + actions + '</div>';
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
  function activeCount() {
    return state.jobs.filter(function (j) {
      return j.active;
    }).length;
  }

  function statRow(label, val) {
    return '<div class="stat-row"><span>' + label + '</span><b>' + val + '</b></div>';
  }
  function rushCost(remainSec) {
    return Math.max(1, Math.ceil(remainSec / 4));
  }

  function doUpgrade(type) {
    if (enqueueUpgrade(type)) {
      AOL.Audio.sfx('click');
      refreshHud();
      renderQueue();
      renderModal(type);
    }
  }
  function doRush(type) {
    var b = state.buildings[type];
    var job = activeJobFor(type);
    if (!job) return;
    var remain = Math.ceil((job.endsAt - Date.now()) / 1000);
    var cost = rushCost(remain);
    if (state.gems < cost) {
      toast('Not enough gems.', 'bad');
      return;
    }
    state.gems -= cost;
    job.endsAt = Date.now();
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
    var html =
      '<button class="summon-banner" id="summonBanner" style="grid-column:1/-1">' +
      '<span class="sb-ico">🔮</span>' +
      '<span class="sb-text"><b>Hero Summon</b><span>Call new legends · 💎' +
      AOL.SUMMON_COST.single +
      ' / ×10 💎' +
      AOL.SUMMON_COST.ten +
      '</span></span>' +
      '<span class="sb-cta">Summon →</span>' +
      '</button>';
    html +=
      '<div class="syn-bar" style="grid-column:1/-1">' + synergyPills(currentSynergy()) + '</div>';
    html += owned.map(heroCard).join('');
    if (locked.length) {
      html +=
        '<div style="grid-column:1/-1;color:var(--muted);font-size:0.8rem;margin-top:0.5rem">Not yet recruited</div>';
      html += locked.map(heroCard).join('');
    }
    el.heroGrid.innerHTML = html;
    var sb = document.getElementById('summonBanner');
    if (sb) sb.onclick = openSummonModal;
    el.heroGrid.querySelectorAll('[data-detail]').forEach(function (node) {
      node.onclick = function () {
        openHeroModal(node.getAttribute('data-detail'));
      };
    });
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
    var fac = AOL.FACTIONS[AOL.heroFaction(h)];
    var html = '<div class="hero-card ' + (inParty ? 'in-party' : '') + '">';
    html += '<div class="hero-top" data-detail="' + h.id + '">';
    html += '<div class="hero-portrait bg-' + r.key + '">';
    html += '<span class="cls-badge">' + cls.emoji + '</span>';
    if (fac)
      html +=
        '<span class="fac-badge" title="' +
        fac.name +
        '" style="color:' +
        fac.color +
        '">' +
        fac.emoji +
        '</span>';
    html += '<span class="emblem">' + heroEmblem(h) + '</span>';
    html += '<span class="lvl-badge">Lv ' + h.level + '</span></div>';
    html += '<div class="hero-name">' + h.name + '</div>';
    html += '<div class="hero-stars rarity-' + r.key + '">' + AOL.stars(h.rarity) + '</div>';
    html += '<div class="hero-power">⚔️ Power <b>' + AOL.fmt(st.power) + '</b></div>';
    html += '</div>';
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
    bumpMission('levelup', 1);
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

  // -------------------------------------------------------------- summon ---
  function summonRng() {
    return new AOL.Rng(
      (state.seed ^ Math.imul(state.gacha.total + 1, 2654435761) ^ Date.now()) >>> 0,
    );
  }
  function summonOnce(rng) {
    var rarity = AOL.rollRarity(rng.float(), state.gacha.sinceEpic, state.gacha.sinceLeg);
    state.gacha.total++;
    if (AOL.rarityRank[rarity] >= AOL.rarityRank.epic) state.gacha.sinceEpic = 0;
    else state.gacha.sinceEpic++;
    if (rarity === 'legendary') state.gacha.sinceLeg = 0;
    else state.gacha.sinceLeg++;
    var pool = AOL.HEROES_BY_RARITY[rarity] || AOL.HEROES_BY_RARITY.common;
    var id = pool[rng.range(0, pool.length - 1)];
    var h = hero(id);
    var isNew = !h.owned;
    if (isNew) {
      h.owned = true;
    } else {
      var sh = AOL.DUPE_SHARDS[rarity];
      state.shards[id] = (state.shards[id] || 0) + sh;
    }
    return { id: id, rarity: rarity, isNew: isNew, shards: isNew ? 0 : AOL.DUPE_SHARDS[rarity] };
  }
  function doSummon(count) {
    var cost = count === 10 ? AOL.SUMMON_COST.ten : AOL.SUMMON_COST.single;
    if (state.gems < cost) {
      toast('Not enough gems.', 'bad');
      return;
    }
    state.gems -= cost;
    var rng = summonRng();
    var results = [];
    for (var i = 0; i < count; i++) results.push(summonOnce(rng));
    var best = results.reduce(function (m, r) {
      return Math.max(m, AOL.rarityRank[r.rarity]);
    }, 0);
    AOL.Audio.sfx(best >= AOL.rarityRank.epic ? 'ultimate' : 'click');
    refreshHud();
    renderHeroes();
    renderSummonResults(results);
    save();
  }
  function openSummonModal() {
    openBuilding = null;
    openHero = null;
    renderSummonPanel();
    el.modal.classList.remove('hidden');
  }
  function summonOddsRows() {
    return AOL.SUMMON_ODDS.map(function (o) {
      var r = AOL.RARITY[o.r];
      return (
        '<div class="odds-row"><span class="rarity-' +
        o.r +
        '">' +
        AOL.stars(o.r) +
        ' ' +
        r.label +
        '</span><b>' +
        (o.p * 100).toFixed(0) +
        '%</b></div>'
      );
    }).join('');
  }
  function renderSummonPanel() {
    var g = state.gacha;
    var html =
      '<div class="modal-head"><div class="b-emoji">🔮</div><div><h3>Hero Summon</h3>' +
      '<div class="lvl">Total summons: ' +
      g.total +
      '</div></div></div>';
    html +=
      '<p class="muted" style="font-size:0.82rem;margin:0.2rem 0 0.6rem">Call new legends to your banner. Duplicate heroes become shards for ascension.</p>';
    html += '<div class="odds-box">' + summonOddsRows() + '</div>';
    html +=
      '<div class="pity-box">' +
      '<div class="pity-line"><span>Guaranteed Epic+ within</span><b>' +
      (AOL.PITY_EPIC - g.sinceEpic) +
      ' pull' +
      (AOL.PITY_EPIC - g.sinceEpic === 1 ? '' : 's') +
      '</b></div>' +
      '<div class="pity-line"><span>Guaranteed Legendary within</span><b>' +
      (AOL.PITY_LEG - g.sinceLeg) +
      ' pulls</b></div>' +
      '</div>';
    var canSingle = state.gems >= AOL.SUMMON_COST.single;
    var canTen = state.gems >= AOL.SUMMON_COST.ten;
    html +=
      '<div class="modal-actions">' +
      '<button class="btn ' +
      (canSingle ? 'gold' : '') +
      '" id="summon1" ' +
      (canSingle ? '' : 'disabled') +
      '>Summon ×1 · 💎' +
      AOL.SUMMON_COST.single +
      '</button>' +
      '<button class="btn ' +
      (canTen ? 'green' : '') +
      '" id="summon10" ' +
      (canTen ? '' : 'disabled') +
      '>Summon ×10 · 💎' +
      AOL.SUMMON_COST.ten +
      '</button>' +
      '</div>';
    html +=
      '<div class="modal-actions"><button class="btn ghost" id="closeModal">Close</button></div>';
    el.modalCard.innerHTML = html;
    var b1 = document.getElementById('summon1');
    if (b1)
      b1.onclick = function () {
        doSummon(1);
      };
    var b10 = document.getElementById('summon10');
    if (b10)
      b10.onclick = function () {
        doSummon(10);
      };
    document.getElementById('closeModal').onclick = closeModal;
  }
  function renderSummonResults(results) {
    var cards = results
      .map(function (r) {
        var h = hero(r.id);
        var rr = AOL.RARITY[r.rarity];
        return (
          '<div class="summon-card bg-' +
          rr.key +
          ' rarity-glow-' +
          rr.key +
          '">' +
          '<span class="emblem">' +
          heroEmblem(h) +
          '</span>' +
          '<div class="sc-name">' +
          h.name +
          '</div>' +
          '<div class="hero-stars rarity-' +
          rr.key +
          '">' +
          AOL.stars(r.rarity) +
          '</div>' +
          '<div class="sc-tag">' +
          (r.isNew ? '<span class="sc-new">NEW</span>' : '+' + r.shards + ' 🧩') +
          '</div></div>'
        );
      })
      .join('');
    var html =
      '<div class="modal-head"><div class="b-emoji">✨</div><div><h3>Summon Results</h3>' +
      '<div class="lvl">' +
      results.length +
      ' hero' +
      (results.length === 1 ? '' : 'es') +
      '</div></div></div>';
    html += '<div class="summon-grid">' + cards + '</div>';
    html +=
      '<div class="modal-actions">' +
      '<button class="btn gold" id="summonAgain">Summon again</button>' +
      '<button class="btn ghost" id="closeModal">Close</button></div>';
    el.modalCard.innerHTML = html;
    document.getElementById('summonAgain').onclick = renderSummonPanel;
    document.getElementById('closeModal').onclick = closeModal;
  }

  // ----------------------------------------------------------- hero detail ---
  function openHeroModal(id) {
    openBuilding = null;
    openHero = id;
    renderHeroModal(id);
    el.modal.classList.remove('hidden');
  }
  function renderHeroModal(id) {
    var h = hero(id);
    if (!h) return;
    var st = AOL.heroStats(h);
    var r = AOL.RARITY[h.rarity];
    var cls = AOL.CLASSES[h.cls];
    var fac = AOL.FACTIONS[AOL.heroFaction(h)];
    var skills = AOL.heroSkills(h) || {};
    var inParty = state.party.indexOf(h.id) >= 0;

    var html =
      '<div class="modal-head">' +
      '<div class="hero-portrait bg-' +
      r.key +
      '" style="width:64px;height:64px;flex:0 0 64px">' +
      '<span class="emblem" style="font-size:1.9rem">' +
      heroEmblem(h) +
      '</span></div>' +
      '<div><h3>' +
      h.name +
      '</h3>' +
      '<div class="hero-stars rarity-' +
      r.key +
      '">' +
      AOL.stars(h.rarity) +
      ' <span class="muted">' +
      r.label +
      ' · ' +
      cls.name +
      '</span></div>' +
      (fac
        ? '<div class="fac-line" style="color:' +
          fac.color +
          '">' +
          fac.emoji +
          ' ' +
          fac.name +
          ' <span class="muted">· team +' +
          Math.round(AOL.SYN_TIERS[AOL.SYN_TIERS.length - 1].mult * 100) +
          '%→ ' +
          fac.statLabel +
          '</span></div>'
        : '') +
      '</div></div>';

    html += '<div class="hero-stat-grid">';
    html += heroStatCell('❤️ HP', AOL.fmt(st.hp));
    html += heroStatCell('⚔️ ATK', AOL.fmt(st.atk));
    html += heroStatCell('👟 Speed', st.spd);
    html += heroStatCell('⭐ Power', AOL.fmt(st.power));
    html += '</div>';

    html += '<div class="skill-list">';
    html += skillRow('🗡️', 'Basic', skills.basic);
    html += skillRow('✨', 'Passive', skills.passive);
    html += skillRow('💥', 'Ultimate', skills.ult);
    html += '</div>';

    if (h.owned) {
      var cost = AOL.heroLevelCost(h);
      var can = affordable(cost);
      html +=
        '<div class="modal-actions">' +
        '<button class="btn ' +
        (can ? 'gold' : '') +
        '" id="hmLvlup" ' +
        (can ? '' : 'disabled') +
        '>Level Up 🪙' +
        AOL.fmt(cost.gold) +
        ' 🌾' +
        AOL.fmt(cost.food) +
        '</button>' +
        '<button class="btn ' +
        (inParty ? 'green' : 'ghost') +
        '" id="hmParty">' +
        (inParty ? '✓ In party' : '+ Add to party') +
        '</button>' +
        '</div>';
      html +=
        '<div class="modal-actions"><button class="btn ghost" id="closeModal">Close</button></div>';
    } else {
      var canRec = state.gems >= 150;
      html +=
        '<div class="modal-actions">' +
        '<button class="btn ' +
        (canRec ? 'gold' : '') +
        '" id="hmRecruit" ' +
        (canRec ? '' : 'disabled') +
        '>Recruit 💎150</button>' +
        '<button class="btn ghost" id="closeModal">Close</button></div>';
    }
    el.modalCard.innerHTML = html;

    var lv = document.getElementById('hmLvlup');
    if (lv)
      lv.onclick = function () {
        levelUp(id);
        renderHeroModal(id);
      };
    var pty = document.getElementById('hmParty');
    if (pty)
      pty.onclick = function () {
        toggleParty(id);
        renderHeroModal(id);
      };
    var rec = document.getElementById('hmRecruit');
    if (rec)
      rec.onclick = function () {
        recruit(id);
        renderHeroModal(id);
      };
    document.getElementById('closeModal').onclick = closeModal;
  }
  function heroStatCell(label, val) {
    return '<div class="hero-stat"><span>' + label + '</span><b>' + val + '</b></div>';
  }
  function skillRow(icon, kind, skill) {
    if (!skill) return '';
    var mod = '';
    if (skill.mod) {
      var parts = [];
      if (skill.mod.hp) parts.push('+' + Math.round(skill.mod.hp * 100) + '% HP');
      if (skill.mod.atk) parts.push('+' + Math.round(skill.mod.atk * 100) + '% ATK');
      if (skill.mod.spd) parts.push('+' + Math.round(skill.mod.spd * 100) + '% Speed');
      if (parts.length) mod = '<span class="skill-mod">' + parts.join(' · ') + '</span>';
    }
    return (
      '<div class="skill-row">' +
      '<div class="skill-ico">' +
      icon +
      '</div>' +
      '<div class="skill-body"><div class="skill-name">' +
      skill.name +
      ' <span class="skill-kind">' +
      kind +
      '</span>' +
      mod +
      '</div>' +
      '<div class="skill-desc">' +
      skill.desc +
      '</div></div></div>'
    );
  }

  // --------------------------------------------------------- campaign view ---
  function currentSynergy() {
    return AOL.factionSynergy(
      state.party.map(function (id) {
        return hero(id);
      }),
    );
  }
  function partyPower() {
    var syn = currentSynergy();
    var p = state.party.reduce(function (sum, id) {
      var h = hero(id);
      var st = AOL.applyFormation(heroLine(id), AOL.heroStats(h));
      return sum + AOL.applySynergy(h, syn, st).power;
    }, 0);
    p += (state.buildings.barracks.level - 1) * AOL.BUILDINGS.barracks.armyPower * 5;
    return p;
  }
  function synergyPills(syn) {
    var keys = Object.keys(syn);
    if (!keys.length) {
      return '<span class="syn-none">Group heroes of the same faction to unlock synergy bonuses.</span>';
    }
    return keys
      .map(function (f) {
        var s = syn[f];
        return (
          '<span class="syn-pill" style="border-color:' +
          s.color +
          ';color:' +
          s.color +
          '">' +
          s.emoji +
          ' ' +
          s.name +
          ' ×' +
          s.count +
          ' · +' +
          Math.round(s.mult * 100) +
          '% ' +
          s.statLabel +
          '</span>'
        );
      })
      .join('');
  }

  function formationSlot(id) {
    var h = hero(id);
    var line = heroLine(id);
    var fac = AOL.FACTIONS[AOL.heroFaction(h)];
    return (
      '<div class="form-slot line-' +
      line +
      '" data-line="' +
      id +
      '" title="' +
      h.name +
      ' · ' +
      AOL.FORMATION[line].name +
      '">' +
      '<span class="emblem">' +
      heroEmblem(h) +
      '</span>' +
      (fac
        ? '<span class="form-fac" style="color:' + fac.color + '">' + fac.emoji + '</span>'
        : '') +
      '<span class="lvl-badge">Lv ' +
      h.level +
      '</span></div>'
    );
  }
  function formationEditor() {
    var front = state.party.filter(function (id) {
      return heroLine(id) === 'front';
    });
    var back = state.party.filter(function (id) {
      return heroLine(id) === 'back';
    });
    var rows = '';
    rows +=
      '<div class="form-row"><span class="form-tag front">FRONT</span><div class="form-cells">' +
      (front.length
        ? front.map(formationSlot).join('')
        : '<span class="form-empty">— hold the line —</span>') +
      '</div></div>';
    rows +=
      '<div class="form-row"><span class="form-tag back">BACK</span><div class="form-cells">' +
      (back.length
        ? back.map(formationSlot).join('')
        : '<span class="form-empty">— ranged & support —</span>') +
      '</div></div>';
    return '<div class="formation">' + rows + '</div>';
  }

  function renderCampaign() {
    var stage = state.campaignStage;
    var reward = AOL.stageReward(stage);
    var meta = AOL.stageMeta(stage);
    var chLen = AOL.chapterLength();
    var enemyPreview = AOL.makeEnemyTeam(stage, new AOL.Rng(state.seed + stage));
    var enemyPower = enemyPreview.reduce(function (s, e) {
      return s + Math.round(e.maxHp * 0.25 + e.atk * 3.2 + e.spd * 2);
    }, 0);

    var html =
      '<div class="chapter-line">' +
      '<span class="ch-name">' +
      meta.chapterName +
      '</span>' +
      '<span class="ch-prog">' +
      (meta.endless ? 'Cleared · Endless' : 'Stage ' + Math.min(stage, chLen) + ' / ' + chLen) +
      '</span></div>';

    html +=
      '<div class="stage-banner' +
      (meta.boss ? ' boss' : '') +
      '">' +
      '<div class="stage-no">' +
      (meta.boss ? '☠️' : stage) +
      '</div>' +
      '<div class="stage-info"><h3>' +
      (meta.boss ? 'BOSS · ' : '') +
      meta.name +
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

    html += idlePanel();

    html +=
      '<div class="form-head"><span class="muted" style="font-size:0.8rem">Formation</span>' +
      '<span class="muted" style="font-size:0.72rem">Tap a hero to swap line · Front +12% HP · Back +12% ATK</span></div>';
    html += formationEditor();
    html += '<div class="syn-bar">' + synergyPills(currentSynergy()) + '</div>';

    var canFight = state.party.length > 0 && state.stamina >= 6;
    html +=
      '<button class="btn gold" id="fightBtn" style="width:100%;padding:0.8rem;font-size:1rem" ' +
      (canFight ? '' : 'disabled') +
      '>' +
      (state.party.length === 0 ? 'Add heroes to your party first' : '⚔️ Battle  (–6 ⚡)') +
      '</button>';

    var canSweep = stage > 1 && state.stamina >= 6;
    html +=
      '<button class="btn ghost" id="sweepBtn" style="width:100%;margin-top:0.4rem" ' +
      (canSweep ? '' : 'disabled') +
      '>' +
      (stage > 1
        ? '⏩ Sweep Stage ' + (stage - 1) + '  (–6 ⚡, instant reward)'
        : 'Clear a stage to unlock Sweep') +
      '</button>';
    html +=
      '<div class="muted" style="font-size:0.75rem;text-align:center;margin-top:0.5rem">Tip: raise the Barracks and level your heroes to grow your power.</div>';

    el.campaignBody.innerHTML = html;
    var fb = document.getElementById('fightBtn');
    if (fb) fb.onclick = startBattle;
    var sw = document.getElementById('sweepBtn');
    if (sw) sw.onclick = sweepStage;
    var col = document.getElementById('idleCollect');
    if (col) col.onclick = collectIdle;
    el.campaignBody.querySelectorAll('[data-line]').forEach(function (node) {
      node.onclick = function () {
        var id = node.getAttribute('data-line');
        setLine(id, heroLine(id) === 'front' ? 'back' : 'front');
        AOL.Audio.sfx('click');
        renderCampaign();
      };
    });
  }

  // ------------------------------------------------------- idle & sweep ---
  function highestCleared() {
    return state.campaignStage - 1;
  }
  function idlePendingNow() {
    var elapsed = (Date.now() - (state.idle.lastCollect || Date.now())) / 1000;
    return AOL.idlePending(highestCleared(), elapsed);
  }
  function idlePanel() {
    var cleared = highestCleared();
    var rate = AOL.idleRate(cleared);
    var p = idlePendingNow();
    var capH = Math.round(AOL.IDLE_CAP_SECONDS / 3600);
    var body =
      cleared < 1
        ? '<span class="muted" style="font-size:0.78rem">Clear Stage 1 to start earning idle rewards.</span>'
        : '<div class="idle-amounts">🪙 ' +
          AOL.fmt(p.gold) +
          ' &nbsp; ✨ ' +
          AOL.fmt(p.heroXp) +
          ' XP</div>' +
          '<div class="muted" style="font-size:0.72rem">+' +
          rate.gold +
          '🪙/s · +' +
          rate.heroXp +
          '✨/s · caps at ' +
          capH +
          'h</div>';
    var canCollect = cleared >= 1 && (p.gold > 0 || p.heroXp > 0);
    return (
      '<div class="idle-panel">' +
      '<div class="idle-head">💤 Idle rewards</div>' +
      '<div class="idle-body">' +
      body +
      '</div>' +
      '<button class="btn ' +
      (canCollect ? 'green' : '') +
      '" id="idleCollect" ' +
      (canCollect ? '' : 'disabled') +
      '>Collect</button>' +
      '</div>'
    );
  }
  function collectIdle() {
    var p = idlePendingNow();
    if (p.gold <= 0 && p.heroXp <= 0) return;
    state.resources.gold += p.gold;
    grantHeroXp(p.heroXp);
    state.idle.lastCollect = Date.now();
    bumpMission('idle', 1);
    AOL.Audio.sfx('victory');
    toast('Idle rewards: 🪙' + AOL.fmt(p.gold) + ' ✨' + AOL.fmt(p.heroXp), 'gold');
    refreshHud();
    renderCampaign();
    save();
  }
  function sweepStage() {
    var s = state.campaignStage - 1;
    if (s < 1) {
      toast('No cleared stage to sweep.', 'bad');
      return;
    }
    if (state.stamina < 6) {
      toast('Not enough stamina.', 'bad');
      return;
    }
    state.stamina -= 6;
    var reward = AOL.stageReward(s);
    state.resources.gold += reward.gold;
    state.gems += reward.gems;
    grantHeroXp(reward.heroXp);
    bumpMission('sweep', 1);
    AOL.Audio.sfx('click');
    toast('Swept Stage ' + s + ': 🪙' + reward.gold + ' 💎' + reward.gems, 'good');
    refreshHud();
    renderCampaign();
    save();
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
    var syn = currentSynergy();
    var allies = state.party.map(function (id) {
      var h = hero(id);
      var line = heroLine(id);
      var st = AOL.applySynergy(h, syn, AOL.applyFormation(line, AOL.heroStats(h)));
      var bonus = 1 + (state.buildings.barracks.level - 1) * 0.05;
      return {
        name: h.name,
        emoji: st.emoji,
        role: st.role,
        line: line,
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
          bumpMission('win', 1);
          toast('Victory! Stage ' + (state.campaignStage - 1) + ' cleared.', 'good');
          if (state.ftue && !state.ftue.firstWinDone) {
            state.ftue.firstWinDone = true;
            state.gems += 50;
            toast('First victory! Bonus 💎50 — the realm believes in you.', 'gold');
          }
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

  // ----------------------------------------------------------- dailies ---
  // Reset missions when the calendar day rolls over. Login availability is
  // derived from login.claimedDay vs today.
  function ensureDaily() {
    var today = AOL.dayKey();
    if (state.missions.day !== today) {
      state.missions.day = today;
      state.missions.progress = {};
      state.missions.claimed = {};
      state.missions.ap = 0;
      state.missions.chests = {};
    }
  }
  function bumpMission(type, n) {
    ensureDaily();
    var changed = false;
    AOL.MISSIONS.forEach(function (m) {
      if (m.type !== type) return;
      var cur = state.missions.progress[m.id] || 0;
      if (cur < m.goal) {
        state.missions.progress[m.id] = Math.min(m.goal, cur + (n || 1));
        changed = true;
      }
    });
    if (changed && currentView === 'daily') renderDaily();
  }
  function loginCanClaim() {
    return state.login.claimedDay !== AOL.dayKey();
  }
  function claimLogin() {
    if (!loginCanClaim()) return;
    var r = AOL.LOGIN_REWARDS[state.login.index % AOL.LOGIN_REWARDS.length];
    grantReward(r);
    state.login.claimedDay = AOL.dayKey();
    state.login.index = (state.login.index + 1) % AOL.LOGIN_REWARDS.length;
    AOL.Audio.sfx('victory');
    toast('Login reward: ' + rewardText(r), 'gold');
    refreshHud();
    renderDaily();
    save();
  }
  function missionDone(m) {
    return (state.missions.progress[m.id] || 0) >= m.goal;
  }
  function claimMission(id) {
    ensureDaily();
    var m = AOL.MISSIONS.find(function (x) {
      return x.id === id;
    });
    if (!m || !missionDone(m) || state.missions.claimed[id]) return;
    state.missions.claimed[id] = true;
    state.missions.ap = Math.min(AOL.ACTIVITY_MAX, state.missions.ap + m.ap);
    grantReward(m.reward);
    AOL.Audio.sfx('click');
    toast('Mission complete: ' + rewardText(m.reward), 'gold');
    refreshHud();
    renderDaily();
    save();
  }
  function claimChest(i) {
    ensureDaily();
    var c = AOL.ACTIVITY_CHESTS[i];
    if (!c || state.missions.ap < c.ap || state.missions.chests[i]) return;
    state.missions.chests[i] = true;
    grantReward(c.reward);
    AOL.Audio.sfx('victory');
    toast('Activity chest: ' + rewardText(c.reward), 'gold');
    refreshHud();
    renderDaily();
    save();
  }

  function renderDaily() {
    ensureDaily();
    if (!el.dailyBody) return;
    var html = '';

    // Login calendar.
    html += '<div class="view-sub">Daily login</div>';
    html += '<div class="login-grid">';
    for (var i = 0; i < AOL.LOGIN_REWARDS.length; i++) {
      var r = AOL.LOGIN_REWARDS[i];
      var isNext = i === state.login.index;
      var claimedCell = loginPassed(i);
      html +=
        '<div class="login-cell' +
        (isNext && loginCanClaim() ? ' next' : '') +
        (claimedCell ? ' claimed' : '') +
        '">' +
        '<div class="login-day">' +
        r.label +
        '</div>' +
        '<div class="login-ico">' +
        r.icon +
        '</div>' +
        '<div class="login-amt">' +
        rewardText(r) +
        '</div>' +
        (claimedCell ? '<div class="login-check">✓</div>' : '') +
        '</div>';
    }
    html += '</div>';
    html +=
      '<button class="btn ' +
      (loginCanClaim() ? 'gold' : '') +
      '" id="loginClaim" ' +
      (loginCanClaim() ? '' : 'disabled') +
      ' style="width:100%;margin:0.5rem 0 1rem">' +
      (loginCanClaim() ? 'Claim today’s reward' : 'Come back tomorrow') +
      '</button>';

    // Activity meter + chests.
    var ap = state.missions.ap;
    html += '<div class="view-sub">Daily activity</div>';
    html += '<div class="activity">';
    html +=
      '<div class="ap-bar"><span style="width:' +
      Math.round((ap / AOL.ACTIVITY_MAX) * 100) +
      '%"></span>';
    AOL.ACTIVITY_CHESTS.forEach(function (c, i) {
      var ready = ap >= c.ap && !state.missions.chests[i];
      html +=
        '<button class="ap-chest' +
        (state.missions.chests[i] ? ' opened' : '') +
        (ready ? ' ready' : '') +
        '" data-chest="' +
        i +
        '" style="left:' +
        Math.round((c.ap / AOL.ACTIVITY_MAX) * 100) +
        '%" title="' +
        c.ap +
        ' AP · ' +
        rewardText(c.reward) +
        '">' +
        (state.missions.chests[i] ? '✓' : c.icon) +
        '</button>';
    });
    html += '</div><div class="ap-count">' + ap + ' / ' + AOL.ACTIVITY_MAX + ' AP</div></div>';

    // Missions.
    html += '<div class="view-sub">Missions</div>';
    html += '<div class="mission-list">';
    AOL.MISSIONS.forEach(function (m) {
      var prog = Math.min(m.goal, state.missions.progress[m.id] || 0);
      var done = prog >= m.goal;
      var claimed = state.missions.claimed[m.id];
      html +=
        '<div class="mission-row' +
        (claimed ? ' claimed' : '') +
        '">' +
        '<div class="mission-info"><div class="mission-desc">' +
        m.desc +
        '</div>' +
        '<div class="mission-bar"><span style="width:' +
        Math.round((prog / m.goal) * 100) +
        '%"></span></div>' +
        '<div class="mission-meta">' +
        prog +
        '/' +
        m.goal +
        ' · +' +
        m.ap +
        ' AP · ' +
        rewardText(m.reward) +
        '</div></div>' +
        '<button class="btn ' +
        (done && !claimed ? 'green' : '') +
        '" data-mission="' +
        m.id +
        '" ' +
        (done && !claimed ? '' : 'disabled') +
        '>' +
        (claimed ? '✓' : 'Claim') +
        '</button></div>';
    });
    html += '</div>';

    el.dailyBody.innerHTML = html;
    var lc = document.getElementById('loginClaim');
    if (lc) lc.onclick = claimLogin;
    el.dailyBody.querySelectorAll('[data-mission]').forEach(function (btn) {
      btn.onclick = function () {
        claimMission(btn.getAttribute('data-mission'));
      };
    });
    el.dailyBody.querySelectorAll('[data-chest]').forEach(function (btn) {
      btn.onclick = function () {
        claimChest(parseInt(btn.getAttribute('data-chest'), 10));
      };
    });
  }
  // Whether login cell i has already been granted in the current cycle.
  function loginPassed(i) {
    // Cells before the current index in this cycle are considered claimed.
    return i < state.login.index;
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
    if (v === 'daily') renderDaily();
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

  // -------------------------------------------------------------- FTUE ---
  function startFtue() {
    state.ftue.step = 0;
    state.ftue.done = false;
    renderFtue();
  }
  function renderFtue() {
    if (!el.ftue) return;
    if (state.ftue.done) {
      el.ftue.classList.add('hidden');
      el.ftue.innerHTML = '';
      return;
    }
    var idx = Math.min(state.ftue.step, AOL.FTUE_STEPS.length - 1);
    var s = AOL.FTUE_STEPS[idx];
    var dots = AOL.FTUE_STEPS.map(function (_s, i) {
      return '<span class="ftue-dot ' + (i === idx ? 'on' : '') + '"></span>';
    }).join('');
    el.ftue.classList.remove('hidden');
    el.ftue.innerHTML =
      '<div class="ftue-card">' +
      '<div class="ftue-crest">⚔️</div>' +
      '<h2>' +
      s.title +
      '</h2>' +
      '<p>' +
      s.body +
      '</p>' +
      '<div class="ftue-dots">' +
      dots +
      '</div>' +
      '<div class="ftue-actions">' +
      '<button class="btn gold" id="ftueNext">' +
      s.action +
      ' →</button>' +
      '<button class="btn ghost" id="ftueSkip">Skip intro</button>' +
      '</div></div>';
    document.getElementById('ftueNext').onclick = function () {
      ftueAdvance(s);
    };
    document.getElementById('ftueSkip').onclick = finishFtue;
  }
  function ftueAdvance(s) {
    AOL.Audio.sfx('click');
    if (s.grant) grantFreeHero();
    if (s.goto) switchView(s.goto);
    state.ftue.step++;
    if (state.ftue.step >= AOL.FTUE_STEPS.length) {
      finishFtue();
    } else {
      renderFtue();
    }
  }
  function grantFreeHero() {
    var h = hero(AOL.FTUE_FREE_HERO);
    if (h && !h.owned) {
      h.owned = true;
      if (state.party.length < 5) state.party.push(h.id);
      toast('Recruited ' + h.name + '!', 'gold');
      AOL.Audio.sfx('ultimate');
      refreshHud();
    }
  }
  function finishFtue() {
    state.ftue.done = true;
    renderFtue();
    save();
  }

  // Bring an older save up to the current schema (adds fields introduced later).
  function migrate() {
    if (!state.formation) state.formation = {};
    if (!state.idle) state.idle = { lastCollect: Date.now() };
    if (!state.ftue) state.ftue = { step: 0, done: true, firstWinDone: true };
    if (!state.login) state.login = { claimedDay: null, index: 0 };
    if (!state.missions)
      state.missions = { day: null, progress: {}, claimed: {}, ap: 0, chests: {} };
    if (!state.gacha) state.gacha = { sinceEpic: 0, sinceLeg: 0, total: 0 };
    if (!state.shards) state.shards = {};
    if (!state.jobs) {
      state.jobs = [];
      // Convert any in-flight legacy upgrade into an active job.
      AOL.LAYOUT.forEach(function (item) {
        var b = state.buildings[item.type];
        if (b && b.upgradeEndsAt && b.upgradeEndsAt > Date.now()) {
          state.jobs.push({
            type: item.type,
            toLevel: b.level + 1,
            totalMs: b.upgradeTotalMs || AOL.upgradeSeconds(b.level + 1) * 1000,
            active: true,
            endsAt: b.upgradeEndsAt,
          });
        }
      });
    }
  }

  // ------------------------------------------------------------------ boot ---
  function boot() {
    cacheEl();
    var saved = load();
    if (saved) {
      state = saved;
      migrate();
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
        renderQueue();
        switchView('kingdom');
        startFtue();
      }
    };
    el.modal.addEventListener('click', function (e) {
      if (e.target === el.modal) closeModal();
    });

    ensureDaily();
    refreshHud();
    renderQueue();
    if (!state.ftue.done) startFtue();

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
      if (currentView === 'kingdom') {
        AOL.Kingdom.render(dt * 1000);
        if (state.jobs.length) renderQueue();
      }
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
