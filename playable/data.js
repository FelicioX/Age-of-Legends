/*
 * Age of Legends — playable prototype: content & configuration.
 *
 * Classic script (no modules) so the game runs from a local file with no build
 * step. All shared state and helpers hang off the global `AOL` namespace.
 * All content here is original to Age of Legends.
 */
window.AOL = window.AOL || {};
(function (AOL) {
  'use strict';

  // --- Deterministic RNG (mulberry32) --------------------------------------
  AOL.Rng = function (seed) {
    this.state = seed >>> 0 || 0x1a2b3c4d;
  };
  AOL.Rng.prototype.u32 = function () {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    var t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
  AOL.Rng.prototype.float = function () {
    return this.u32() / 0x100000000;
  };
  AOL.Rng.prototype.range = function (a, b) {
    return a + Math.floor(this.float() * (b - a + 1));
  };
  AOL.Rng.prototype.pick = function (arr) {
    return arr[this.range(0, arr.length - 1)];
  };

  AOL.hashSeed = function (str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i) & 0xff;
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  };

  // --- Resources -----------------------------------------------------------
  AOL.RES = ['gold', 'food', 'wood', 'stone', 'iron'];
  AOL.RES_ICON = { gold: '🪙', food: '🌾', wood: '🪵', stone: '🪨', iron: '⛏️', gems: '💎' };
  AOL.RES_NAME = {
    gold: 'Gold',
    food: 'Food',
    wood: 'Wood',
    stone: 'Stone',
    iron: 'Iron',
    gems: 'Gems',
  };

  // --- Buildings -----------------------------------------------------------
  // `produce` is per-second per level. `roof`/`wall` drive the drawn art.
  AOL.BUILDINGS = {
    castle: {
      name: 'Castle',
      emoji: '🏰',
      gate: true,
      produce: { res: 'gold', rate: 0.2 },
      wall: '#8a94b4',
      roof: '#c14b4b',
      accent: '#f0c419',
      desc: 'Seat of your kingdom. Its level caps every other building.',
    },
    farm: {
      name: 'Farm',
      emoji: '🌾',
      produce: { res: 'food', rate: 1.0 },
      wall: '#caa85e',
      roof: '#8a6a2f',
      accent: '#ffe08a',
      desc: 'Grows food to feed your people and train troops.',
    },
    sawmill: {
      name: 'Lumber Mill',
      emoji: '🪓',
      produce: { res: 'wood', rate: 0.85 },
      wall: '#9c6b43',
      roof: '#5f3f28',
      accent: '#d7a86b',
      desc: 'Fells timber for construction.',
    },
    quarry: {
      name: 'Quarry',
      emoji: '⛰️',
      produce: { res: 'stone', rate: 0.65 },
      wall: '#8b93a1',
      roof: '#5b6270',
      accent: '#c3cad6',
      desc: 'Cuts stone for fortifications.',
    },
    mine: {
      name: 'Iron Mine',
      emoji: '⛏️',
      produce: { res: 'iron', rate: 0.5 },
      wall: '#6f7787',
      roof: '#3f4653',
      accent: '#b7c0d0',
      desc: 'Digs iron for weapons and gear.',
    },
    market: {
      name: 'Market',
      emoji: '🏪',
      produce: { res: 'gold', rate: 0.6 },
      wall: '#b06a86',
      roof: '#7a3f56',
      accent: '#ffd0e0',
      desc: 'Trades goods for a steady flow of gold.',
    },
    barracks: {
      name: 'Barracks',
      emoji: '⚔️',
      produce: null,
      armyPower: 4,
      wall: '#7d8596',
      roof: '#4a5566',
      accent: '#e0b45a',
      desc: 'Trains your army. Adds power to your battle party.',
    },
    altar: {
      name: 'Hero Altar',
      emoji: '🔮',
      produce: null,
      wall: '#7b5bb0',
      roof: '#4a2f75',
      accent: '#d0a8ff',
      desc: 'A place of power that empowers your heroes.',
    },
    academy: {
      name: 'Academy',
      emoji: '📚',
      produce: { res: 'gold', rate: 0.25 },
      wall: '#5f80a8',
      roof: '#37507a',
      accent: '#a8ccff',
      desc: 'Researches bonuses for the whole kingdom.',
    },
  };

  // Fixed, intentional kingdom layout on the isometric grid (GRID x GRID).
  AOL.GRID = 7;
  AOL.LAYOUT = [
    { type: 'castle', col: 3, row: 3 },
    { type: 'farm', col: 1, row: 2 },
    { type: 'sawmill', col: 2, row: 1 },
    { type: 'quarry', col: 4, row: 1 },
    { type: 'mine', col: 5, row: 2 },
    { type: 'market', col: 1, row: 4 },
    { type: 'barracks', col: 5, row: 4 },
    { type: 'altar', col: 2, row: 5 },
    { type: 'academy', col: 4, row: 5 },
  ];
  // Decorations for empty tiles (purely visual).
  AOL.DECOR = [
    { emoji: '🌲', col: 0, row: 0 },
    { emoji: '🌲', col: 6, row: 0 },
    { emoji: '🌲', col: 0, row: 3 },
    { emoji: '🌳', col: 6, row: 6 },
    { emoji: '🪨', col: 3, row: 0 },
    { emoji: '🌲', col: 0, row: 6 },
    { emoji: '🌳', col: 6, row: 3 },
    { emoji: '🏕️', col: 3, row: 6 },
  ];

  // --- Heroes --------------------------------------------------------------
  AOL.RARITY = {
    common: { key: 'common', mult: 1.0, stars: 1, label: 'Common' },
    rare: { key: 'rare', mult: 1.3, stars: 2, label: 'Rare' },
    epic: { key: 'epic', mult: 1.7, stars: 3, label: 'Epic' },
    legendary: { key: 'legendary', mult: 2.2, stars: 4, label: 'Legendary' },
  };
  AOL.CLASSES = {
    vanguard: { name: 'Vanguard', emoji: '🛡️', role: 'tank', hp: 320, atk: 26, spd: 8 },
    ranger: { name: 'Ranger', emoji: '🏹', role: 'dps', hp: 180, atk: 44, spd: 12 },
    mystic: { name: 'Mystic', emoji: '🔥', role: 'mage', hp: 170, atk: 40, spd: 10 },
    warden: { name: 'Warden', emoji: '✨', role: 'healer', hp: 200, atk: 24, spd: 9 },
    artificer: { name: 'Artificer', emoji: '⚙️', role: 'support', hp: 210, atk: 30, spd: 11 },
  };

  // Original hero roster. `owned` marks the starting heroes.
  AOL.HERO_POOL = [
    { id: 'h_bram', name: 'Bram Ironhide', cls: 'vanguard', rarity: 'rare', owned: true },
    { id: 'h_sylva', name: 'Sylva Thornwood', cls: 'ranger', rarity: 'rare', owned: true },
    { id: 'h_kael', name: 'Kaelen Frost', cls: 'mystic', rarity: 'epic', owned: true },
    { id: 'h_lumen', name: 'Lumen Daybringer', cls: 'warden', rarity: 'epic', owned: true },
    { id: 'h_cog', name: 'Cog Brasswright', cls: 'artificer', rarity: 'common', owned: true },
    { id: 'h_doran', name: 'Doran Blackshield', cls: 'vanguard', rarity: 'common', owned: false },
    { id: 'h_aria', name: 'Aria Windsong', cls: 'ranger', rarity: 'legendary', owned: false },
    { id: 'h_morde', name: 'Mordecai Emberveil', cls: 'mystic', rarity: 'rare', owned: false },
    { id: 'h_nyx', name: 'Nyx Duskbane', cls: 'ranger', rarity: 'epic', owned: false },
    { id: 'h_thane', name: 'Thane Stonefist', cls: 'vanguard', rarity: 'legendary', owned: false },
    { id: 'h_wren', name: 'Wren Mossheart', cls: 'warden', rarity: 'common', owned: false },
    { id: 'h_vex', name: 'Vex Sparkcoil', cls: 'artificer', rarity: 'rare', owned: false },
  ];

  // Derived hero stats at a given level.
  AOL.heroStats = function (hero) {
    var cls = AOL.CLASSES[hero.cls];
    var r = AOL.RARITY[hero.rarity];
    var lvlScale = 1 + 0.14 * (hero.level - 1);
    var hp = Math.round(cls.hp * r.mult * lvlScale);
    var atk = Math.round(cls.atk * r.mult * lvlScale);
    var spd = cls.spd;
    var power = Math.round(hp * 0.25 + atk * 3.2 + spd * 2);
    return { hp: hp, atk: atk, spd: spd, power: power, role: cls.role, emoji: cls.emoji };
  };

  AOL.heroLevelCost = function (hero) {
    var base = 40 + hero.level * 55;
    return { gold: Math.round(base), food: Math.round(base * 0.7) };
  };

  // --- Building costs & timers --------------------------------------------
  AOL.buildingMaxTier = function (state, type) {
    return type === 'castle' ? 30 : state.buildings.castle ? state.buildings.castle.level : 1;
  };
  AOL.upgradeCost = function (type, nextLevel) {
    var s = Math.pow(nextLevel, 1.55);
    if (type === 'castle') {
      return {
        wood: Math.round(120 * s),
        stone: Math.round(100 * s),
        iron: Math.round(55 * s),
        gold: Math.round(80 * s),
      };
    }
    return {
      wood: Math.round(45 * s),
      stone: Math.round(32 * s),
      iron: Math.round(16 * s),
      gold: Math.round(20 * s),
    };
  };
  AOL.upgradeSeconds = function (nextLevel) {
    return Math.round(4 + nextLevel * 3); // short for a demo
  };

  // --- Campaign enemies ----------------------------------------------------
  AOL.ENEMY_KINDS = [
    { name: 'Marauder', emoji: '🗡️', role: 'dps', hp: 150, atk: 34, spd: 11 },
    { name: 'Brute', emoji: '🪓', role: 'tank', hp: 340, atk: 22, spd: 7 },
    { name: 'Hexer', emoji: '☠️', role: 'mage', hp: 160, atk: 38, spd: 10 },
    { name: 'Stalker', emoji: '🐺', role: 'dps', hp: 140, atk: 40, spd: 13 },
  ];
  AOL.makeEnemyTeam = function (stage, rng) {
    var count = Math.min(5, 3 + Math.floor(stage / 4));
    var scale = 1 + 0.22 * (stage - 1);
    var team = [];
    for (var i = 0; i < count; i++) {
      var k = rng.pick(AOL.ENEMY_KINDS);
      team.push({
        name: k.name,
        emoji: k.emoji,
        role: k.role,
        maxHp: Math.round(k.hp * scale),
        hp: Math.round(k.hp * scale),
        atk: Math.round(k.atk * scale),
        spd: k.spd,
        enemy: true,
        alive: true,
      });
    }
    return team;
  };
  AOL.stageReward = function (stage) {
    return { gold: 120 + stage * 60, gems: stage % 3 === 0 ? 15 : 5, heroXp: 40 + stage * 20 };
  };

  AOL.fmt = function (n) {
    n = Math.floor(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  };
  AOL.stars = function (rarity) {
    var n = AOL.RARITY[rarity].stars;
    return '★★★★★'.slice(0, n);
  };
})(window.AOL);
