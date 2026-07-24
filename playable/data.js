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

  // --- Factions ------------------------------------------------------------
  // Original factions. Fielding several heroes of one faction grants a
  // scaling synergy bonus to a single stat (see AOL.factionSynergy).
  AOL.FACTIONS = {
    dawnward: {
      key: 'dawnward',
      name: 'Dawnward Pact',
      emoji: '🌅',
      color: '#ffce54',
      stat: 'atk',
      statLabel: 'ATK',
      desc: 'Knights sworn to the rising sun — they strike harder side by side.',
    },
    wildkin: {
      key: 'wildkin',
      name: 'Wildkin Circle',
      emoji: '🍃',
      color: '#5fd06a',
      stat: 'hp',
      statLabel: 'HP',
      desc: 'Wardens of the deep wood — the Circle endures where others fall.',
    },
    duskbound: {
      key: 'duskbound',
      name: 'Duskbound Covenant',
      emoji: '🌙',
      color: '#c07bff',
      stat: 'spd',
      statLabel: 'Speed',
      desc: 'Shadow-walkers who strike from the dark — the Covenant moves first.',
    },
  };
  // Synergy tiers: number of same-faction heroes -> stat bonus.
  AOL.SYN_TIERS = [
    { min: 4, mult: 0.2 },
    { min: 3, mult: 0.14 },
    { min: 2, mult: 0.08 },
  ];

  // Original hero roster. Each hero has a faction and a skill trio
  // (basic, passive, ultimate). `owned` marks the starting heroes. The
  // passive `mod` is a fractional stat bonus folded into AOL.heroStats.
  AOL.HERO_POOL = [
    {
      id: 'h_bram',
      name: 'Bram Ironhide',
      cls: 'vanguard',
      rarity: 'rare',
      faction: 'dawnward',
      owned: true,
      skills: {
        basic: { name: 'Shield Bash', desc: 'Slams the front foe with the shield edge.' },
        passive: { name: 'Ironhide', desc: '+15% max HP.', mod: { hp: 0.15 } },
        ult: { name: 'Bulwark Slam', desc: 'A crushing blow that leaves Bram guarded for a time.' },
      },
    },
    {
      id: 'h_sylva',
      name: 'Sylva Thornwood',
      cls: 'ranger',
      rarity: 'rare',
      faction: 'dawnward',
      owned: true,
      skills: {
        basic: { name: 'Quick Shot', desc: 'A fast arrow at the weakest enemy.' },
        passive: { name: 'Keen Eye', desc: '+12% ATK.', mod: { atk: 0.12 } },
        ult: { name: 'Arrow Volley', desc: 'Looses a storm of arrows across the enemy line.' },
      },
    },
    {
      id: 'h_kael',
      name: 'Kaelen Frost',
      cls: 'mystic',
      rarity: 'epic',
      faction: 'duskbound',
      owned: true,
      skills: {
        basic: { name: 'Frost Spark', desc: 'A splinter of ice that chips nearby foes.' },
        passive: { name: 'Frostbite', desc: '+12% ATK.', mod: { atk: 0.12 } },
        ult: { name: 'Glacial Meteor', desc: 'Calls down a frozen star on the whole enemy team.' },
      },
    },
    {
      id: 'h_lumen',
      name: 'Lumen Daybringer',
      cls: 'warden',
      rarity: 'epic',
      faction: 'dawnward',
      owned: true,
      skills: {
        basic: { name: 'Mending Light', desc: 'Heals the most wounded ally.' },
        passive: { name: 'Dawnlight', desc: '+10% ATK (stronger heals).', mod: { atk: 0.1 } },
        ult: { name: 'Radiant Blessing', desc: 'Bathes the whole party in restoring light.' },
      },
    },
    {
      id: 'h_cog',
      name: 'Cog Brasswright',
      cls: 'artificer',
      rarity: 'common',
      faction: 'duskbound',
      owned: true,
      skills: {
        basic: { name: 'Bolt Thrower', desc: 'Fires a charged bolt at a foe.' },
        passive: { name: 'Overclock', desc: '+12% Speed.', mod: { spd: 0.12 } },
        ult: { name: 'Rally Engine', desc: 'Buffs allies’ attack and peppers the enemy line.' },
      },
    },
    {
      id: 'h_doran',
      name: 'Doran Blackshield',
      cls: 'vanguard',
      rarity: 'common',
      faction: 'wildkin',
      owned: false,
      skills: {
        basic: { name: 'Guard Strike', desc: 'A measured blow that holds the line.' },
        passive: { name: 'Stalwart', desc: '+12% max HP.', mod: { hp: 0.12 } },
        ult: { name: 'Shield Wall', desc: 'A heavy slam that shields Doran afterward.' },
      },
    },
    {
      id: 'h_aria',
      name: 'Aria Windsong',
      cls: 'ranger',
      rarity: 'legendary',
      faction: 'duskbound',
      owned: false,
      skills: {
        basic: { name: 'Gale Arrow', desc: 'A wind-borne arrow that never misses its mark.' },
        passive: { name: 'Windsong', desc: '+16% ATK.', mod: { atk: 0.16 } },
        ult: { name: 'Tempest Volley', desc: 'A cyclone of arrows sweeps the enemy team.' },
      },
    },
    {
      id: 'h_morde',
      name: 'Mordecai Emberveil',
      cls: 'mystic',
      rarity: 'rare',
      faction: 'wildkin',
      owned: false,
      skills: {
        basic: { name: 'Ember Spark', desc: 'A gout of flame that licks nearby foes.' },
        passive: { name: 'Emberveil', desc: '+14% ATK.', mod: { atk: 0.14 } },
        ult: { name: 'Cinder Meteor', desc: 'A burning star crashes over the enemy team.' },
      },
    },
    {
      id: 'h_nyx',
      name: 'Nyx Duskbane',
      cls: 'ranger',
      rarity: 'epic',
      faction: 'wildkin',
      owned: false,
      skills: {
        basic: { name: 'Twin Fang', desc: 'Two quick shots at the weakest foe.' },
        passive: { name: 'Predator', desc: '+14% ATK.', mod: { atk: 0.14 } },
        ult: { name: 'Hunter’s Volley', desc: 'A relentless barrage across the line.' },
      },
    },
    {
      id: 'h_thane',
      name: 'Thane Stonefist',
      cls: 'vanguard',
      rarity: 'legendary',
      faction: 'dawnward',
      owned: false,
      skills: {
        basic: { name: 'Stone Fist', desc: 'A boulder-heavy punch at the front foe.' },
        passive: { name: 'Mountain Heart', desc: '+20% max HP.', mod: { hp: 0.2 } },
        ult: {
          name: 'Seismic Slam',
          desc: 'A ground-splitting blow; Thane braces behind his guard.',
        },
      },
    },
    {
      id: 'h_wren',
      name: 'Wren Mossheart',
      cls: 'warden',
      rarity: 'common',
      faction: 'wildkin',
      owned: false,
      skills: {
        basic: { name: 'Herbal Salve', desc: 'Mends the most wounded ally.' },
        passive: { name: 'Verdant Renewal', desc: '+10% max HP.', mod: { hp: 0.1 } },
        ult: { name: 'Grove’s Embrace', desc: 'Living roots heal the whole party.' },
      },
    },
    {
      id: 'h_vex',
      name: 'Vex Sparkcoil',
      cls: 'artificer',
      rarity: 'rare',
      faction: 'duskbound',
      owned: false,
      skills: {
        basic: { name: 'Arc Bolt', desc: 'A crackling bolt at a foe.' },
        passive: { name: 'Sparkcoil', desc: '+10% Speed.', mod: { spd: 0.1 } },
        ult: { name: 'Overcharge', desc: 'Empowers allies’ attacks and zaps the enemy line.' },
      },
    },
  ];

  // Fast lookup of the static hero definition (faction/skills) by id.
  AOL.HERO_BY_ID = {};
  AOL.HERO_POOL.forEach(function (h) {
    AOL.HERO_BY_ID[h.id] = h;
  });
  AOL.heroDef = function (hero) {
    return AOL.HERO_BY_ID[hero && hero.id ? hero.id : hero];
  };
  AOL.heroFaction = function (hero) {
    var d = AOL.heroDef(hero);
    return d ? d.faction : null;
  };
  AOL.heroSkills = function (hero) {
    var d = AOL.heroDef(hero);
    return d ? d.skills : null;
  };
  AOL.heroPassive = function (hero) {
    var d = AOL.heroDef(hero);
    return d && d.skills ? d.skills.passive : null;
  };

  AOL.powerFrom = function (hp, atk, spd) {
    return Math.round(hp * 0.25 + atk * 3.2 + spd * 2);
  };

  // Derived hero stats at a given level (passive stat bonus already folded in).
  AOL.heroStats = function (hero) {
    var cls = AOL.CLASSES[hero.cls];
    var r = AOL.RARITY[hero.rarity];
    var lvlScale = 1 + 0.14 * (hero.level - 1);
    var hp = cls.hp * r.mult * lvlScale;
    var atk = cls.atk * r.mult * lvlScale;
    var spd = cls.spd;
    var pas = AOL.heroPassive(hero);
    if (pas && pas.mod) {
      hp *= 1 + (pas.mod.hp || 0);
      atk *= 1 + (pas.mod.atk || 0);
      spd *= 1 + (pas.mod.spd || 0);
    }
    hp = Math.round(hp);
    atk = Math.round(atk);
    spd = Math.round(spd);
    return {
      hp: hp,
      atk: atk,
      spd: spd,
      power: AOL.powerFrom(hp, atk, spd),
      role: cls.role,
      emoji: cls.emoji,
    };
  };

  // Active faction synergies for a party (array of hero objects/ids).
  AOL.factionSynergy = function (heroObjs) {
    var counts = {};
    (heroObjs || []).forEach(function (h) {
      if (!h) return;
      var f = AOL.heroFaction(h);
      if (f) counts[f] = (counts[f] || 0) + 1;
    });
    var out = {};
    Object.keys(counts).forEach(function (f) {
      var c = counts[f];
      var tier = null;
      for (var i = 0; i < AOL.SYN_TIERS.length; i++) {
        if (c >= AOL.SYN_TIERS[i].min) {
          tier = AOL.SYN_TIERS[i];
          break;
        }
      }
      if (tier) {
        var fac = AOL.FACTIONS[f];
        out[f] = {
          count: c,
          mult: tier.mult,
          stat: fac.stat,
          statLabel: fac.statLabel,
          name: fac.name,
          emoji: fac.emoji,
          color: fac.color,
        };
      }
    });
    return out;
  };

  // Apply a hero's active faction synergy on top of its base stats.
  AOL.applySynergy = function (hero, syn, stats) {
    var s = syn && syn[AOL.heroFaction(hero)];
    if (!s) return stats;
    var hp = stats.hp,
      atk = stats.atk,
      spd = stats.spd;
    if (s.stat === 'atk') atk = Math.round(atk * (1 + s.mult));
    else if (s.stat === 'hp') hp = Math.round(hp * (1 + s.mult));
    else if (s.stat === 'spd') spd = spd * (1 + s.mult);
    return {
      hp: hp,
      atk: atk,
      spd: spd,
      power: AOL.powerFrom(hp, atk, spd),
      role: stats.role,
      emoji: stats.emoji,
    };
  };

  AOL.heroLevelCost = function (hero) {
    var base = 40 + hero.level * 55;
    return { gold: Math.round(base), food: Math.round(base * 0.7) };
  };

  // --- Formation -----------------------------------------------------------
  // Two lines: the front holds the line (extra HP), the back is protected and
  // hits harder (extra ATK). A hero's default line comes from its role.
  AOL.FORMATION = {
    front: { key: 'front', name: 'Front line', mod: { hp: 0.12 }, label: '+12% HP' },
    back: { key: 'back', name: 'Back line', mod: { atk: 0.12 }, label: '+12% ATK' },
  };
  AOL.defaultLine = function (hero) {
    var role = AOL.CLASSES[hero.cls] ? AOL.CLASSES[hero.cls].role : 'dps';
    return role === 'tank' || role === 'dps' ? 'front' : 'back';
  };
  // Apply the chosen line's bonus on top of a stats object.
  AOL.applyFormation = function (line, stats) {
    var f = AOL.FORMATION[line];
    if (!f) return stats;
    var hp = stats.hp,
      atk = stats.atk,
      spd = stats.spd;
    hp = Math.round(hp * (1 + (f.mod.hp || 0)));
    atk = Math.round(atk * (1 + (f.mod.atk || 0)));
    return {
      hp: hp,
      atk: atk,
      spd: spd,
      power: AOL.powerFrom(hp, atk, spd),
      role: stats.role,
      emoji: stats.emoji,
    };
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
  // Concurrent build slots (builders). Grows as the Castle rises.
  AOL.builderCount = function (castleLevel) {
    var n = 2;
    if (castleLevel >= 6) n++;
    if (castleLevel >= 12) n++;
    return n; // 2..4
  };
  AOL.BUILD_QUEUE_MAX = 6;

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

  // --- Campaign chapters ---------------------------------------------------
  // Chapter 1: a hand-named run of stages. A boss caps the chapter. Enemy
  // composition still comes from AOL.makeEnemyTeam(globalStage). Stages beyond
  // the last defined one keep scaling procedurally ("endless").
  AOL.CHAPTERS = [
    {
      id: 1,
      name: 'The Ironvale Marches',
      stages: [
        { name: 'Broken Road' },
        { name: 'Thornwatch Ford' },
        { name: 'Ashen Hollow' },
        { name: 'Warden’s Gate', boss: true },
        { name: 'Cinder Fields' },
        { name: 'Gravemist Fen' },
        { name: 'The Sunken Span' },
        { name: 'Ruined Bastion', boss: true },
        { name: 'Wolfsteeth Pass' },
        { name: 'Hollowlight Wood' },
        { name: 'Duskbane Vigil' },
        { name: 'Ironvale Keep', boss: true },
      ],
    },
  ];
  AOL.chapterOf = function (stage) {
    // Single chapter for v1; returns the chapter and 1-based local index.
    var ch = AOL.CHAPTERS[0];
    return { chapter: ch, local: stage, len: ch.stages.length };
  };
  AOL.stageMeta = function (stage) {
    var ch = AOL.CHAPTERS[0];
    var s = ch.stages[stage - 1];
    if (s) return { name: s.name, boss: !!s.boss, chapterName: ch.name, endless: false };
    return {
      name: 'Endless ' + (stage - ch.stages.length),
      boss: stage % 5 === 0,
      chapterName: ch.name,
      endless: true,
    };
  };
  AOL.chapterLength = function () {
    return AOL.CHAPTERS[0].stages.length;
  };

  // --- Idle campaign income ------------------------------------------------
  // The highest cleared stage drips passive rewards, collectable on return.
  AOL.IDLE_CAP_SECONDS = 8 * 3600; // 8h ceiling
  AOL.idleRate = function (clearedStage) {
    if (clearedStage < 1) return { gold: 0, heroXp: 0 };
    return { gold: 6 + clearedStage * 3, heroXp: 2 + clearedStage };
  };
  AOL.idlePending = function (clearedStage, elapsedSec) {
    var t = Math.min(AOL.IDLE_CAP_SECONDS, Math.max(0, elapsedSec));
    var r = AOL.idleRate(clearedStage);
    return { gold: Math.floor(r.gold * t), heroXp: Math.floor(r.heroXp * t), seconds: t };
  };

  // --- Summon / gacha ------------------------------------------------------
  // Transparent odds with pity. Rarities listed high→low for cumulative roll.
  AOL.SUMMON_ODDS = [
    { r: 'legendary', p: 0.03 },
    { r: 'epic', p: 0.12 },
    { r: 'rare', p: 0.3 },
    { r: 'common', p: 0.55 },
  ];
  AOL.SUMMON_COST = { single: 100, ten: 900 }; // gems
  AOL.PITY_EPIC = 10; // guaranteed epic+ at least every 10 pulls
  AOL.PITY_LEG = 60; // hard pity: guaranteed legendary
  // Shards granted when a summon produces a hero you already own.
  AOL.DUPE_SHARDS = { common: 10, rare: 15, epic: 25, legendary: 40 };

  AOL.rarityRank = { common: 0, rare: 1, epic: 2, legendary: 3 };
  // Pure rarity roll. `f` in [0,1); pity counters are pulls since last epic+/leg.
  AOL.rollRarity = function (f, sinceEpic, sinceLeg) {
    if (sinceLeg + 1 >= AOL.PITY_LEG) return 'legendary';
    var acc = 0,
      r = 'common';
    for (var i = 0; i < AOL.SUMMON_ODDS.length; i++) {
      acc += AOL.SUMMON_ODDS[i].p;
      if (f < acc) {
        r = AOL.SUMMON_ODDS[i].r;
        break;
      }
    }
    if (sinceEpic + 1 >= AOL.PITY_EPIC && AOL.rarityRank[r] < AOL.rarityRank.epic) r = 'epic';
    return r;
  };
  // Heroes grouped by rarity, for picking a summon result.
  AOL.HEROES_BY_RARITY = {};
  AOL.HERO_POOL.forEach(function (h) {
    (AOL.HEROES_BY_RARITY[h.rarity] = AOL.HEROES_BY_RARITY[h.rarity] || []).push(h.id);
  });

  // --- First-time user experience (scripted onboarding) -------------------
  // A short, skippable intro. One step grants a free rare hero; the flow ends
  // by pointing the player at their first battle.
  AOL.FTUE_FREE_HERO = 'h_morde'; // Mordecai Emberveil — a Rare mystic
  AOL.FTUE_STEPS = [
    {
      title: 'Age of Legends',
      body: 'The old realm lies in ruin. From the ashes of Ironvale, a new banner rises — yours. Rebuild the keep, gather legends, and drive back the dark.',
      action: 'Begin',
    },
    {
      title: 'Your Kingdom',
      body: 'This is Ironvale Keep. Every building works while you are away, gathering gold, food and materials. Tap a building to raise it — stronger buildings unlock everything else.',
      action: 'I understand',
    },
    {
      title: 'A Legend Answers',
      body: 'Word of your banner spreads. A Rare hero, Mordecai Emberveil, pledges his flame to your cause — free of charge. Welcome him to your party.',
      action: 'Recruit Mordecai',
      grant: true,
    },
    {
      title: 'To Battle',
      body: 'Your first foes gather on the Broken Road. Open the Campaign, check your formation, and lead your party to its first victory. Fortune favors the bold!',
      action: "Let's go",
      goto: 'campaign',
    },
  ];

  // --- Dailies: login calendar & missions ---------------------------------
  AOL.dayKey = function (ts) {
    var d = new Date(ts == null ? Date.now() : ts);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  };
  // 7-day login calendar (cycles). Rewards escalate through the week.
  AOL.LOGIN_REWARDS = [
    { label: 'Day 1', gold: 400, icon: '🪙' },
    { label: 'Day 2', gems: 30, icon: '💎' },
    { label: 'Day 3', heroXp: 300, icon: '✨' },
    { label: 'Day 4', gold: 800, icon: '🪙' },
    { label: 'Day 5', gems: 50, icon: '💎' },
    { label: 'Day 6', food: 600, wood: 600, icon: '📦' },
    { label: 'Day 7', gems: 120, heroXp: 500, icon: '🎁' },
  ];
  // Daily missions. `type` is bumped by gameplay events; goal completes it.
  AOL.MISSIONS = [
    { id: 'm_win', type: 'win', goal: 3, desc: 'Win 3 battles', ap: 20, reward: { gems: 30 } },
    {
      id: 'm_upg',
      type: 'upgrade',
      goal: 1,
      desc: 'Upgrade a building',
      ap: 20,
      reward: { gold: 600 },
    },
    {
      id: 'm_lvl',
      type: 'levelup',
      goal: 2,
      desc: 'Level up heroes 2×',
      ap: 20,
      reward: { heroXp: 300 },
    },
    {
      id: 'm_sweep',
      type: 'sweep',
      goal: 2,
      desc: 'Sweep 2 stages',
      ap: 20,
      reward: { gems: 15 },
    },
    {
      id: 'm_idle',
      type: 'idle',
      goal: 1,
      desc: 'Collect idle rewards',
      ap: 20,
      reward: { gold: 300 },
    },
  ];
  // Activity-point milestone chests (like a daily-quest meter).
  AOL.ACTIVITY_CHESTS = [
    { ap: 40, reward: { gems: 20 }, icon: '📦' },
    { ap: 80, reward: { gems: 40 }, icon: '🎁' },
    { ap: 100, reward: { gems: 60, heroXp: 200 }, icon: '👑' },
  ];
  AOL.ACTIVITY_MAX = 100;

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
