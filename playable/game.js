/*
 * Age of Legends — self-contained playable prototype.
 *
 * A single-file browser build that demonstrates the core loop without any build
 * step or server: gather and produce resources, upgrade the kingdom, explore a
 * procedurally generated world, harvest nodes and resolve PvE camp battles.
 *
 * The simulation runs on a fixed timestep with a seeded, deterministic random
 * number generator, mirroring the engineering approach of the full project.
 */
(() => {
  'use strict';

  // --- Deterministic RNG (mulberry32) --------------------------------------
  class Rng {
    constructor(seed) {
      this.state = (seed >>> 0) || 0x1a2b3c4d;
    }
    nextUint32() {
      this.state = (this.state + 0x6d2b79f5) >>> 0;
      let t = this.state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (t ^ (t >>> 14)) >>> 0;
    }
    float() {
      return this.nextUint32() / 0x100000000;
    }
    range(min, max) {
      return min + Math.floor(this.float() * (max - min + 1));
    }
  }

  function hashSeed(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i) & 0xff;
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  // --- World constants ------------------------------------------------------
  const WORLD_W = 64;
  const WORLD_H = 48;
  const TILE = 32;
  const VIEW_W = 640;
  const VIEW_H = 480;
  const STEP = 1 / 20; // 20 Hz fixed simulation step
  const DAY_LENGTH = 120; // seconds per full day/night cycle
  const REVEAL_RADIUS = 5;
  const TARGET_NODES = 14;
  const TARGET_CAMPS = 8;

  // --- Building definitions -------------------------------------------------
  const BUILDINGS = [
    { key: 'townhall', name: 'Town Hall', ico: '🏰', res: 'gold', base: 0.15,
      desc: 'Gates every other building tier.' },
    { key: 'sawmill', name: 'Sawmill', ico: '🪚', res: 'wood', base: 0.7, desc: 'Produces wood.' },
    { key: 'quarry', name: 'Quarry', ico: '🧱', res: 'stone', base: 0.55, desc: 'Produces stone.' },
    { key: 'mine', name: 'Mine', ico: '⛏️', res: 'iron', base: 0.4, desc: 'Produces iron.' },
    { key: 'farm', name: 'Farm', ico: '🌾', res: 'food', base: 0.8, desc: 'Produces food.' },
    { key: 'market', name: 'Market', ico: '🏪', res: 'gold', base: 0.35, desc: 'Produces gold.' },
  ];

  const RESOURCE_KINDS = ['wood', 'stone', 'iron', 'food', 'gold'];
  const NODE_KINDS = ['wood', 'stone', 'iron', 'food'];
  const NODE_ICON = { wood: '🌲', stone: '⛰️', iron: '🪨', food: '🍎' };

  // --- Procedural world -----------------------------------------------------
  function rand2(seed, x, y) {
    let h = (seed ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 0x100000000;
  }
  function valueNoise(seed, x, y, scale) {
    const gx = x / scale;
    const gy = y / scale;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = gx - x0;
    const ty = gy - y0;
    const v00 = rand2(seed, x0, y0);
    const v10 = rand2(seed, x0 + 1, y0);
    const v01 = rand2(seed, x0, y0 + 1);
    const v11 = rand2(seed, x0 + 1, y0 + 1);
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const a = v00 + (v10 - v00) * sx;
    const b = v01 + (v11 - v01) * sx;
    return a + (b - a) * sy;
  }
  function elevation(seed, x, y) {
    return 0.6 * valueNoise(seed, x, y, 9) + 0.4 * valueNoise(seed + 101, x, y, 3.5);
  }
  function biome(e) {
    if (e < 0.30) return { type: 'water', color: '#16324f', walk: false };
    if (e < 0.35) return { type: 'sand', color: '#5c5231', walk: true };
    if (e < 0.60) return { type: 'grass', color: '#25412a', walk: true };
    if (e < 0.76) return { type: 'forest', color: '#1c3220', walk: true };
    if (e < 0.90) return { type: 'rock', color: '#3a3f47', walk: true };
    return { type: 'snow', color: '#8894a3', walk: true };
  }
  function isWalkable(seed, col, row) {
    if (col < 0 || row < 0 || col >= WORLD_W || row >= WORLD_H) return false;
    return biome(elevation(seed, col, row)).walk;
  }

  // --- State ----------------------------------------------------------------
  const SAVE_KEY = 'aol-proto-save-v1';
  let state;
  let rng;

  function defaultState(seedStr) {
    const seed = hashSeed(seedStr);
    const genRng = new Rng(seed);
    // Find a walkable spawn near the centre.
    let sx = WORLD_W >> 1;
    let sy = WORLD_H >> 1;
    for (let i = 0; i < 500 && !isWalkable(seed, sx, sy); i++) {
      sx = genRng.range(4, WORLD_W - 5);
      sy = genRng.range(4, WORLD_H - 5);
    }
    const s = {
      seedStr,
      seed,
      rngState: genRng.state,
      resources: { wood: 60, stone: 40, iron: 20, food: 80, gold: 30 },
      buildings: { townhall: 1, sawmill: 1, quarry: 1, mine: 1, farm: 1, market: 1 },
      party: {
        x: sx + 0.5, y: sy + 0.5, tx: sx + 0.5, ty: sy + 0.5,
        speed: 3.2, level: 1, xp: 0, xpNext: 20, power: 12,
      },
      home: { x: sx + 0.5, y: sy + 0.5 },
      nodes: [],
      camps: [],
      revealed: {},
      clock: 0,
      day: 1,
      log: [],
    };
    for (let i = 0; i < TARGET_NODES; i++) spawnNode(s, genRng);
    for (let i = 0; i < TARGET_CAMPS; i++) spawnCamp(s, genRng);
    s.rngState = genRng.state;
    revealAround(s, sx, sy);
    pushLog(s, 'Your banner rises over a new frontier.', 'big');
    return s;
  }

  function spawnNode(s, r) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const col = r.range(2, WORLD_W - 3);
      const row = r.range(2, WORLD_H - 3);
      if (!isWalkable(s.seed, col, row)) continue;
      const kind = NODE_KINDS[r.range(0, NODE_KINDS.length - 1)];
      s.nodes.push({ col, row, kind, amount: r.range(25, 70) });
      return;
    }
  }
  function spawnCamp(s, r) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const col = r.range(2, WORLD_W - 3);
      const row = r.range(2, WORLD_H - 3);
      if (!isWalkable(s.seed, col, row)) continue;
      const distHome = Math.hypot(col - s.home.x, row - s.home.y);
      const power = Math.round(8 + distHome * 1.4 + r.range(0, 6));
      s.camps.push({ col, row, power });
      return;
    }
  }

  // --- Persistence ----------------------------------------------------------
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      pushLog(state, 'Progress saved.', '');
    } catch (e) {
      pushLog(state, 'Save failed (storage unavailable).', 'bad');
    }
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // --- Helpers --------------------------------------------------------------
  function pushLog(s, text, cls) {
    s.log.unshift({ text, cls: cls || '' });
    if (s.log.length > 40) s.log.pop();
  }
  function revealAround(s, col, row) {
    for (let dy = -REVEAL_RADIUS; dy <= REVEAL_RADIUS; dy++) {
      for (let dx = -REVEAL_RADIUS; dx <= REVEAL_RADIUS; dx++) {
        if (dx * dx + dy * dy > REVEAL_RADIUS * REVEAL_RADIUS) continue;
        s.revealed[`${col + dx},${row + dy}`] = 1;
      }
    }
  }
  function maxTierFor(key) {
    return key === 'townhall' ? 30 : state.buildings.townhall;
  }
  function upgradeCost(key, level) {
    const scale = Math.pow(level, 1.65);
    if (key === 'townhall') {
      return {
        wood: Math.round(80 * scale), stone: Math.round(70 * scale),
        iron: Math.round(35 * scale), gold: Math.round(40 * scale),
      };
    }
    return {
      wood: Math.round(30 * scale), stone: Math.round(22 * scale),
      iron: Math.round(12 * scale), gold: Math.round(8 * scale),
    };
  }
  function canAfford(cost) {
    return Object.keys(cost).every((k) => state.resources[k] >= cost[k]);
  }
  function fmt(n) {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : Math.floor(n).toString();
  }

  // --- Simulation step ------------------------------------------------------
  function step(dt) {
    // Resource production from buildings.
    for (const def of BUILDINGS) {
      const level = state.buildings[def.key];
      state.resources[def.res] += def.base * level * dt;
    }

    // Party movement (semi-implicit Euler toward the target).
    const p = state.party;
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.02) {
      const move = Math.min(dist, p.speed * dt);
      p.x += (dx / dist) * move;
      p.y += (dy / dist) * move;
      revealAround(state, Math.round(p.x), Math.round(p.y));
    }

    // Node harvesting.
    for (let i = state.nodes.length - 1; i >= 0; i--) {
      const n = state.nodes[i];
      if (Math.hypot(n.col + 0.5 - p.x, n.row + 0.5 - p.y) < 0.6) {
        state.resources[n.kind] += n.amount;
        pushLog(state, `Gathered ${n.amount} ${n.kind} from a ${NODE_ICON[n.kind]} node.`, 'good');
        state.nodes.splice(i, 1);
        spawnNode(state, rng);
      }
    }

    // Camp battles.
    for (let i = state.camps.length - 1; i >= 0; i--) {
      const c = state.camps[i];
      if (Math.hypot(c.col + 0.5 - p.x, c.row + 0.5 - p.y) < 0.6) {
        resolveBattle(c, i);
      }
    }

    // Day / night clock.
    state.clock += dt;
    if (state.clock >= DAY_LENGTH) {
      state.clock -= DAY_LENGTH;
      state.day += 1;
      pushLog(state, `A new day dawns. Day ${state.day}.`, '');
    }
  }

  function resolveBattle(camp, index) {
    const p = state.party;
    const partyRoll = p.power * (0.75 + rng.float() * 0.5);
    const enemyRoll = camp.power * (0.75 + rng.float() * 0.5);
    if (partyRoll >= enemyRoll) {
      const gold = camp.power * 3 + rng.range(5, 20);
      const iron = camp.power + rng.range(2, 10);
      const xp = camp.power * 2;
      state.resources.gold += gold;
      state.resources.iron += iron;
      gainXp(xp);
      pushLog(state, `Cleared a camp (power ${camp.power}). Loot: ${gold} gold, ${iron} iron.`, 'big');
      state.camps.splice(index, 1);
      spawnCamp(state, rng);
    } else {
      const lost = Math.min(state.resources.food, camp.power * 2);
      state.resources.food -= lost;
      p.tx = state.home.x;
      p.ty = state.home.y;
      p.x = state.home.x;
      p.y = state.home.y;
      pushLog(state, `The party was repelled (power ${camp.power}) and retreated home. Lost ${Math.floor(lost)} food.`, 'bad');
    }
  }

  function gainXp(amount) {
    const p = state.party;
    p.xp += amount;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      p.xpNext = Math.round(p.xpNext * 1.5);
      p.power += 6;
      pushLog(state, `Your heroes reach level ${p.level}! Power is now ${p.power}.`, 'big');
    }
  }

  // --- Rendering ------------------------------------------------------------
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');

  function render() {
    const p = state.party;
    // Camera centred on the party, clamped to the world.
    const halfW = VIEW_W / 2 / TILE;
    const halfH = VIEW_H / 2 / TILE;
    let camX = Math.max(halfW, Math.min(WORLD_W - halfW, p.x));
    let camY = Math.max(halfH, Math.min(WORLD_H - halfH, p.y));
    const originX = camX * TILE - VIEW_W / 2;
    const originY = camY * TILE - VIEW_H / 2;

    ctx.clearRect(0, 0, VIEW_W, VIEW_H);

    const startCol = Math.floor(originX / TILE);
    const startRow = Math.floor(originY / TILE);
    const endCol = startCol + Math.ceil(VIEW_W / TILE) + 1;
    const endRow = startRow + Math.ceil(VIEW_H / TILE) + 1;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const sx = col * TILE - originX;
        const sy = row * TILE - originY;
        if (col < 0 || row < 0 || col >= WORLD_W || row >= WORLD_H) {
          ctx.fillStyle = '#05080c';
          ctx.fillRect(sx, sy, TILE, TILE);
          continue;
        }
        const b = biome(elevation(state.seed, col, row));
        ctx.fillStyle = b.color;
        ctx.fillRect(sx, sy, TILE, TILE);
        // Fog of war for unexplored tiles.
        if (!state.revealed[`${col},${row}`]) {
          ctx.fillStyle = 'rgba(3,6,10,0.86)';
          ctx.fillRect(sx, sy, TILE, TILE);
        }
      }
    }

    // Nodes.
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const n of state.nodes) {
      if (!state.revealed[`${n.col},${n.row}`]) continue;
      const sx = (n.col + 0.5) * TILE - originX;
      const sy = (n.row + 0.5) * TILE - originY;
      ctx.fillText(NODE_ICON[n.kind], sx, sy);
    }
    // Camps.
    for (const c of state.camps) {
      if (!state.revealed[`${c.col},${c.row}`]) continue;
      const sx = (c.col + 0.5) * TILE - originX;
      const sy = (c.row + 0.5) * TILE - originY;
      ctx.fillText('⚔️', sx, sy);
      ctx.fillStyle = '#f85149';
      ctx.font = '10px sans-serif';
      ctx.fillText(String(c.power), sx, sy + 14);
      ctx.font = '20px serif';
    }

    // Home banner.
    const hx = state.home.x * TILE - originX;
    const hy = state.home.y * TILE - originY;
    ctx.fillText('🏰', hx, hy);

    // Party token.
    const px = p.x * TILE - originX;
    const py = p.y * TILE - originY;
    // Movement target marker.
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 0.05) {
      const mx = p.tx * TILE - originX;
      const my = p.ty * TILE - originY;
      ctx.strokeStyle = 'rgba(110,168,254,0.8)';
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#6ea8fe';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d1117';
    ctx.font = '12px serif';
    ctx.fillText('🛡️', px, py + 1);
    ctx.font = '20px serif';

    // Night overlay.
    const nightFactor = Math.max(0, Math.sin((state.clock / DAY_LENGTH) * Math.PI * 2) * -1);
    if (nightFactor > 0) {
      ctx.fillStyle = `rgba(6,10,30,${nightFactor * 0.4})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }

  // --- HUD ------------------------------------------------------------------
  const el = {
    buildings: document.getElementById('buildings'),
    hero: document.getElementById('hero'),
    log: document.getElementById('log'),
    phase: document.getElementById('phase'),
    day: document.getElementById('day'),
  };

  function renderHud() {
    for (const k of RESOURCE_KINDS) {
      const node = document.querySelector(`[data-res="${k}"]`);
      if (node) node.textContent = fmt(state.resources[k]);
    }
    el.phase.textContent = isNight() ? '🌙' : '☀️';
    el.day.textContent = `Day ${state.day}`;

    // Buildings.
    let html = '';
    for (const def of BUILDINGS) {
      const level = state.buildings[def.key];
      const atCap = level >= maxTierFor(def.key);
      const cost = upgradeCost(def.key, level + 1);
      const costStr = Object.keys(cost).map((k) => `${NODE_ICON[k] || '🪙'}${fmt(cost[k])}`).join(' ');
      const rate = (def.base * level).toFixed(1);
      const affordable = canAfford(cost) && !atCap;
      const label = atCap
        ? (def.key === 'townhall' ? 'Max' : 'Town Hall req.')
        : `Lv ${level + 1}`;
      html += `
        <div class="building">
          <span class="b-ico">${def.ico}</span>
          <span>
            <div class="b-name">${def.name} <span class="b-sub">Lv ${level}</span></div>
            <div class="b-sub">+${rate}/s ${def.res} · ${def.desc}</div>
            <div class="b-sub">${atCap ? '' : 'Cost: ' + costStr}</div>
          </span>
          <button data-build="${def.key}" ${affordable ? '' : 'disabled'}>${label}</button>
        </div>`;
    }
    el.buildings.innerHTML = html;

    // Party.
    const p = state.party;
    el.hero.innerHTML = `
      <div class="stat"><span>Level</span><b>${p.level}</b></div>
      <div class="stat"><span>Power</span><b>${p.power}</b></div>
      <div class="stat"><span>XP</span><b>${Math.floor(p.xp)} / ${p.xpNext}</b></div>
      <div class="stat"><span>Explored</span><b>${Object.keys(state.revealed).length} tiles</b></div>
      <div class="stat"><span>Camps left</span><b>${state.camps.length}</b></div>`;

    // Log.
    el.log.innerHTML = state.log.map((e) => `<li class="${e.cls}">${e.text}</li>`).join('');
  }

  function isNight() {
    return Math.sin((state.clock / DAY_LENGTH) * Math.PI * 2) < 0;
  }

  // --- Input ----------------------------------------------------------------
  canvas.addEventListener('pointerdown', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const cx = ((ev.clientX - rect.left) / rect.width) * VIEW_W;
    const cy = ((ev.clientY - rect.top) / rect.height) * VIEW_H;
    const p = state.party;
    const halfW = VIEW_W / 2 / TILE;
    const halfH = VIEW_H / 2 / TILE;
    const camX = Math.max(halfW, Math.min(WORLD_W - halfW, p.x));
    const camY = Math.max(halfH, Math.min(WORLD_H - halfH, p.y));
    const originX = camX * TILE - VIEW_W / 2;
    const originY = camY * TILE - VIEW_H / 2;
    const worldCol = (cx + originX) / TILE;
    const worldRow = (cy + originY) / TILE;
    if (isWalkable(state.seed, Math.floor(worldCol), Math.floor(worldRow))) {
      p.tx = worldCol;
      p.ty = worldRow;
    } else {
      pushLog(state, 'That terrain is impassable.', 'bad');
    }
  });

  document.getElementById('buildings').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-build]');
    if (!btn) return;
    const key = btn.getAttribute('data-build');
    const level = state.buildings[key];
    if (level >= maxTierFor(key)) return;
    const cost = upgradeCost(key, level + 1);
    if (!canAfford(cost)) return;
    for (const k of Object.keys(cost)) state.resources[k] -= cost[k];
    state.buildings[key] += 1;
    if (key === 'townhall') pushLog(state, `Town Hall upgraded to level ${state.buildings[key]}. New tiers unlocked.`, 'big');
    else pushLog(state, `${BUILDINGS.find((b) => b.key === key).name} upgraded to level ${state.buildings[key]}.`, 'good');
    renderHud();
  });

  document.getElementById('save').addEventListener('click', save);
  document.getElementById('newgame').addEventListener('click', () => {
    if (!confirm('Start a new game? Current progress will be replaced.')) return;
    startGame(`age-of-legends-${Date.now()}`);
  });

  // --- Boot & loop ----------------------------------------------------------
  function startGame(seedStr) {
    state = defaultState(seedStr);
    rng = new Rng(state.rngState);
    renderHud();
  }

  function boot() {
    const saved = load();
    if (saved && saved.party && saved.buildings) {
      state = saved;
      rng = new Rng(state.rngState || state.seed);
      if (!state.log) state.log = [];
      pushLog(state, 'Realm restored from your last session.', '');
    } else {
      startGame('age-of-legends-0001');
    }
    renderHud();
    requestAnimationFrame(loop);
    setInterval(() => {
      state.rngState = rng.state;
      save();
    }, 15000);
  }

  let last = performance.now();
  let acc = 0;
  let hudTimer = 0;
  function loop(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;
    acc += elapsed;
    let steps = 0;
    while (acc >= STEP && steps < 5) {
      step(STEP);
      acc -= STEP;
      steps++;
    }
    if (steps >= 5) acc = 0;

    render();
    hudTimer += elapsed;
    if (hudTimer >= 0.25) {
      hudTimer = 0;
      renderHud();
    }
    requestAnimationFrame(loop);
  }

  boot();
})();
