/*
 * Age of Legends — headless smoke test for the playable prototype.
 *
 * Boots the real game modules under Node with lightweight DOM/canvas stubs
 * (no browser, no build step) and asserts the core systems load and behave.
 * Run from the repo root:  node playable/smoke-test.cjs
 * Exits non-zero on the first failed assertion.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

// --- minimal DOM / canvas stubs ------------------------------------------
function el() {
  return {
    _children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    style: {},
    dataset: {},
    _html: '',
    get innerHTML() {
      return this._html;
    },
    set innerHTML(v) {
      this._html = String(v);
    },
    textContent: '',
    value: '',
    onclick: null,
    setAttribute() {},
    getAttribute() {
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(c) {
      this._children.push(c);
      return c;
    },
    removeChild() {},
    remove() {},
    querySelector: () => el(),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ width: 1024, height: 640, left: 0, top: 0 }),
    getContext: () => ctx2d(),
    focus() {},
    select() {},
  };
}
function ctx2d() {
  return new Proxy(
    {},
    {
      get(_t, p) {
        if (p === 'canvas') return { width: 1024, height: 640 };
        if (p === 'measureText') return () => ({ width: 10 });
        if (p === 'createLinearGradient' || p === 'createRadialGradient')
          return () => ({ addColorStop() {} });
        return () => {};
      },
      set: () => true,
    },
  );
}
const registry = {};
const getEl = (id) => (registry[id] = registry[id] || el());

global.window = { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1 };
global.document = {
  readyState: 'complete',
  getElementById: getEl,
  createElement: () => el(),
  querySelector: () => el(),
  querySelectorAll: () => [],
  addEventListener() {},
  body: el(),
};
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => (store[k] = String(v)),
  removeItem: (k) => delete store[k],
};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.setInterval = () => 0;
global.setTimeout = () => 0;
global.confirm = () => false;
global.alert = () => {};

['data.js', 'art.js', 'audio.js', 'render.js', 'battle.js', 'game.js'].forEach((m) =>
  new Function(fs.readFileSync(path.join(ROOT, m), 'utf8')).call(global.window),
);
const AOL = global.window.AOL;

// --- tiny assertion harness ----------------------------------------------
let passed = 0;
function ok(name, cond) {
  if (!cond) {
    console.error('✗ ' + name);
    process.exit(1);
  }
  passed++;
  console.log('✓ ' + name);
}

// --- assertions -----------------------------------------------------------
ok('all modules boot', !!AOL && !!AOL.Battle && !!AOL.Kingdom && !!AOL.Audio);

ok('roster: 12 heroes, 4 per faction', Object.keys(AOL.HERO_BY_ID).length === 12);

ok(
  'formation bonuses',
  (function () {
    const h = { cls: 'vanguard', rarity: 'rare', level: 1, stars: 2 };
    const base = AOL.heroStats(h);
    const f = AOL.applyFormation('front', base);
    const b = AOL.applyFormation('back', base);
    return f.hp > base.hp && f.atk === base.atk && b.atk > base.atk && b.hp === base.hp;
  })(),
);

ok(
  'build queue: builders scale with castle',
  AOL.builderCount(1) === 2 && AOL.builderCount(12) === 4,
);

ok('campaign: 12-stage chapter with bosses', AOL.chapterLength() === 12 && AOL.stageMeta(4).boss);

ok('idle rewards cap at 8h', AOL.idlePending(5, 1e9).seconds === AOL.IDLE_CAP_SECONDS);

ok('FTUE grants a rare hero', AOL.HERO_BY_ID[AOL.FTUE_FREE_HERO].rarity === 'rare');

ok(
  'dailies: 7 login days, 5 missions total 100 AP',
  AOL.LOGIN_REWARDS.length === 7 && AOL.MISSIONS.reduce((s, m) => s + m.ap, 0) === AOL.ACTIVITY_MAX,
);

ok(
  'gacha pity: epic within 10, legendary within 60',
  (function () {
    const rng = new AOL.Rng(12345);
    let se = 0,
      sl = 0,
      maxE = 0,
      maxL = 0,
      ce = 0,
      cl = 0;
    for (let i = 0; i < 50000; i++) {
      const r = AOL.rollRarity(rng.float(), se, sl);
      if (AOL.rarityRank[r] >= AOL.rarityRank.epic) {
        se = 0;
        ce = 0;
      } else {
        se++;
        ce++;
        maxE = Math.max(maxE, ce);
      }
      if (r === 'legendary') {
        sl = 0;
        cl = 0;
      } else {
        sl++;
        cl++;
        maxL = Math.max(maxL, cl);
      }
    }
    return maxE < AOL.PITY_EPIC && maxL < AOL.PITY_LEG;
  })(),
);

ok('progression: 4★ rare = +16% stats', Math.abs(AOL.starBonus(4, 'rare') - 1.16) < 1e-6);

ok(
  'equipment: 4 slots, gear rolls valid',
  (function () {
    const it = AOL.makeGear(new AOL.Rng(7), 10);
    return (
      AOL.GEAR_SLOTS.length === 4 && AOL.GEAR_SLOT_BY_KEY[it.slot] && AOL.gearStatValue(it) > 0
    );
  })(),
);

ok(
  'arena: 5 leagues, ladder bracketed',
  (function () {
    const ladder = AOL.makeArenaLadder(999, 1000);
    return (
      AOL.ARENA_LEAGUES.length === 5 &&
      ladder.length === 5 &&
      ladder.every((o) => o.team.length === 5)
    );
  })(),
);

ok('guild: 3 techs with real stats', AOL.GUILD_TECHS.length === 3);

ok('achievements: 8 goals', AOL.ACHIEVEMENTS.length === 8);

ok('season: 10 tiers, tier math', AOL.SEASON_TIERS.length === 10 && AOL.seasonTier(250) === 2);

ok(
  'events rotate over time',
  AOL.activeEvent(new Date(2026, 0, 1).getTime()).id !==
    AOL.activeEvent(new Date(2026, 0, 3).getTime()).id,
);

ok(
  'art: procedural portrait module present',
  !!AOL.Art && typeof AOL.Art.heroPortraitURL === 'function' && !!AOL.Art.rimColor('epic'),
);

console.log('\nAll ' + passed + ' smoke assertions passed.');
