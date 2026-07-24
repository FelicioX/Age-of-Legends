/*
 * Age of Legends — living isometric world renderer.
 *
 * A hand-built, original world: an island kingdom with animated water, swaying
 * trees, drifting parallax clouds, ambient wildlife and villagers, a full
 * day/night cycle and building juice (chimney smoke, upgrade dust, coin pops).
 * No external art — everything is procedural canvas.
 *
 * Architecture (concept borrowed from an ECS/sim-render split, implemented
 * original): a lightweight world model + ambient "actors" are simulated in
 * `sim()`, then drawn in ordered passes in `paint()`. A smoothed camera owns
 * pan and zoom. The public surface (init/resize/render + onPick) is unchanged
 * so game.js keeps working.
 */
window.AOL = window.AOL || {};
(function (AOL) {
  'use strict';

  var K = {};
  AOL.Kingdom = K;

  // --- module state --------------------------------------------------------
  var canvas,
    ctx,
    dpr = 1;
  var cw = 0,
    ch = 0;
  var baseTileW = 88,
    baseTileH = 44;
  var originX = 0,
    originY = 0;
  var time = 0;
  var getState, onPick;
  var hoverType = null;

  // Smoothed camera: pan (screen px) + zoom.
  var cam = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1, vx: 0, vy: 0 };

  // World model (built on resize).
  var world = null;
  var CENTER = 3; // kingdom centres on tile (3,3)

  // --- palettes ------------------------------------------------------------
  // Day/night keyframes at t in [0,1): dawn .0 / noon .25 / dusk .5 / night .75.
  var SKY = [
    { t: 0.0, top: '#f2a15c', bot: '#3b4a74', amb: '#ffdcaa', ai: 0.16 }, // dawn
    { t: 0.25, top: '#4a86c8', bot: '#bfe0f0', amb: '#ffffff', ai: 0.0 }, // day
    { t: 0.5, top: '#e0794a', bot: '#5a4a86', amb: '#ffcda0', ai: 0.18 }, // dusk
    { t: 0.72, top: '#101836', bot: '#1a2547', amb: '#3550a0', ai: 0.5 }, // night
    { t: 1.0, top: '#f2a15c', bot: '#3b4a74', amb: '#ffdcaa', ai: 0.16 }, // dawn (loop)
  ];
  var GRASS = ['#3f7a41', '#377038', '#458546', '#356b37'];
  var GRASS_DARK = '#2c5a2e';
  var BEACH = '#cbb887';
  var BEACH_D = '#b5a273';
  var WATER = '#2f6f9e';
  var WATER_D = '#245a86';
  var PATH = '#8a7048';
  var PATH_D = '#755d3a';

  // --- helpers -------------------------------------------------------------
  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    var A = hexToRgb(a),
      B = hexToRgb(b);
    return (
      'rgb(' +
      Math.round(A[0] + (B[0] - A[0]) * t) +
      ',' +
      Math.round(A[1] + (B[1] - A[1]) * t) +
      ',' +
      Math.round(A[2] + (B[2] - A[2]) * t) +
      ')'
    );
  }
  function shade(hex, f) {
    var c = parseInt(hex.slice(1), 16);
    return (
      'rgb(' +
      Math.min(255, Math.round(((c >> 16) & 255) * f)) +
      ',' +
      Math.min(255, Math.round(((c >> 8) & 255) * f)) +
      ',' +
      Math.min(255, Math.round((c & 255) * f)) +
      ')'
    );
  }
  function keyframe(list, t) {
    for (var i = 0; i < list.length - 1; i++) {
      if (t >= list[i].t && t <= list[i + 1].t) {
        var k = (t - list[i].t) / (list[i + 1].t - list[i].t);
        return { a: list[i], b: list[i + 1], k: k };
      }
    }
    return { a: list[0], b: list[0], k: 0 };
  }
  function hash2(a, b) {
    var h = (Math.imul(a + 7, 374761393) ^ Math.imul(b + 3, 668265263)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return (h >>> 0) / 4294967296;
  }

  // Iso projection with camera zoom.
  function toScreen(col, row) {
    var z = cam.z;
    return {
      x: originX + cam.x + (col - row) * (baseTileW / 2) * z,
      y: originY + cam.y + (col + row) * (baseTileH / 2) * z,
    };
  }
  function toTile(px, py) {
    var z = cam.z;
    var dx = (px - (originX + cam.x)) / z;
    var dy = (py - (originY + cam.y)) / z;
    var col = (dx / (baseTileW / 2) + dy / (baseTileH / 2)) / 2;
    var row = (dy / (baseTileH / 2) - dx / (baseTileW / 2)) / 2;
    return { col: Math.round(col), row: Math.round(row) };
  }

  // --- world model ---------------------------------------------------------
  function terrainAt(col, row) {
    var dx = col - CENTER,
      dy = row - CENTER;
    var d = Math.sqrt(dx * dx + dy * dy);
    var n = (hash2(col, row) - 0.5) * 1.1;
    var edge = d + n;
    if (edge < 4.1) return 'grass';
    if (edge < 4.9) return 'beach';
    return 'water';
  }
  function isBuilding(col, row) {
    for (var i = 0; i < AOL.LAYOUT.length; i++)
      if (AOL.LAYOUT[i].col === col && AOL.LAYOUT[i].row === row) return true;
    return false;
  }
  function isPath(col, row) {
    var dx = Math.abs(col - CENTER),
      dy = Math.abs(row - CENTER);
    // Cross-roads through the castle + a ring one tile out.
    return dx < 0.55 || dy < 0.55 || dx + dy === 2;
  }

  function buildWorld() {
    var tiles = [];
    var props = [];
    var min = CENTER - 7,
      max = CENTER + 7;
    for (var col = min; col <= max; col++) {
      for (var row = min; row <= max; row++) {
        var t = terrainAt(col, row);
        tiles.push({ col: col, row: row, t: t, v: hash2(col * 3, row * 5) });
        if (t === 'grass' && !isBuilding(col, row) && !isPath(col, row)) {
          var r = hash2(col * 13, row * 17);
          var dx = col - CENTER,
            dy = row - CENTER;
          var d = Math.sqrt(dx * dx + dy * dy);
          var forest = d > 2.6; // trees cluster toward the shore
          if (forest && r < 0.5) props.push(makeProp('tree', col, row, r));
          else if (r < 0.06) props.push(makeProp('rock', col, row, r));
          else if (r < 0.14) props.push(makeProp('bush', col, row, r));
          else if (r < 0.24) props.push(makeProp('flower', col, row, r));
        }
      }
    }
    // Walkable path tiles for villagers.
    var pathTiles = tiles.filter(function (c) {
      return c.t === 'grass' && isPath(c.col, c.row);
    });
    var actors = spawnActors(pathTiles);
    var clouds = [];
    for (var i = 0; i < 5; i++)
      clouds.push({
        x: Math.random(),
        y: 0.08 + Math.random() * 0.28,
        s: 0.6 + Math.random() * 0.9,
        sp: 0.004 + Math.random() * 0.008,
      });
    var motes = [];
    for (var m = 0; m < 26; m++)
      motes.push({
        x: Math.random(),
        y: Math.random(),
        ph: Math.random() * 6.28,
        sp: 0.2 + Math.random() * 0.5,
      });
    world = {
      tiles: tiles,
      props: props,
      pathTiles: pathTiles,
      actors: actors,
      clouds: clouds,
      motes: motes,
      fx: [],
    };
  }

  function makeProp(kind, col, row, r) {
    return { kind: kind, col: col, row: row, ph: r * 6.28, scale: 0.85 + r * 0.4 };
  }
  function spawnActors(pathTiles) {
    var actors = [];
    if (!pathTiles.length) return actors;
    var palettes = ['#c65f4f', '#4f7bc6', '#5aa860', '#b58a3a', '#8a5ac6', '#c68a4f'];
    for (var i = 0; i < 6; i++) {
      var start = pathTiles[Math.floor(Math.random() * pathTiles.length)];
      actors.push({
        type: 'villager',
        col: start.col,
        row: start.row,
        tcol: start.col,
        trow: start.row,
        color: palettes[i % palettes.length],
        speed: 0.5 + Math.random() * 0.5,
        ph: Math.random() * 6.28,
        wait: 0,
      });
    }
    // A couple of birds circling overhead.
    for (var b = 0; b < 3; b++)
      actors.push({
        type: 'bird',
        x: Math.random(),
        y: 0.15 + Math.random() * 0.25,
        sp: 0.05 + Math.random() * 0.05,
        ph: Math.random() * 6.28,
      });
    return actors;
  }

  // --- public: lifecycle ---------------------------------------------------
  K.init = function (cnv, opts) {
    canvas = cnv;
    ctx = canvas.getContext('2d');
    getState = opts.getState;
    onPick = opts.onPick;
    attachInput();
    K.resize();
    window.addEventListener('resize', K.resize);
  };

  K.resize = function () {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    cw = rect.width;
    ch = rect.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    layoutMetrics();
    if (!world) buildWorld();
  };

  function layoutMetrics() {
    baseTileW = Math.max(52, Math.min(96, Math.floor(cw / (AOL.GRID + 2.5))));
    baseTileH = Math.round(baseTileW / 2);
    originX = cw / 2;
    originY = ch / 2 - baseTileH * 1.2;
  }

  // --- simulation ----------------------------------------------------------
  function sim(dt) {
    // Camera smoothing (critically-damped-ish).
    cam.z += (cam.tz - cam.z) * Math.min(1, dt * 8);
    cam.x += (cam.tx - cam.x) * Math.min(1, dt * 10);
    cam.y += (cam.ty - cam.y) * Math.min(1, dt * 10);

    if (!world) return;
    // Villagers wander between path tiles.
    world.actors.forEach(function (a) {
      if (a.type === 'villager') {
        if (a.wait > 0) {
          a.wait -= dt;
          return;
        }
        var dc = a.tcol - a.col,
          dr = a.trow - a.row;
        var dist = Math.hypot(dc, dr);
        if (dist < 0.05) {
          var next = world.pathTiles[Math.floor(Math.random() * world.pathTiles.length)];
          a.tcol = next.col;
          a.trow = next.row;
          a.wait = Math.random() * 1.5;
        } else {
          var step = (a.speed * dt) / dist;
          a.col += dc * Math.min(1, step);
          a.row += dr * Math.min(1, step);
          a.ph += dt * 8;
        }
      } else if (a.type === 'bird') {
        a.x += a.sp * dt;
        if (a.x > 1.15) {
          a.x = -0.15;
          a.y = 0.12 + Math.random() * 0.28;
        }
        a.ph += dt * 10;
      }
    });
    // Clouds drift.
    world.clouds.forEach(function (c) {
      c.x += c.sp * dt;
      if (c.x > 1.3) c.x = -0.3;
    });
    // Transient FX lifetimes.
    for (var i = world.fx.length - 1; i >= 0; i--) {
      var f = world.fx[i];
      f.age += dt;
      if (f.age >= f.life) world.fx.splice(i, 1);
    }
  }

  // --- render passes -------------------------------------------------------
  function diamond(g, x, y, hw, hh) {
    g.beginPath();
    g.moveTo(x, y - hh);
    g.lineTo(x + hw, y);
    g.lineTo(x, y + hh);
    g.lineTo(x - hw, y);
    g.closePath();
  }

  function paint(g, W, H, state, dayT, tint, ambInt) {
    var hw = (baseTileW / 2) * cam.z,
      hh = (baseTileH / 2) * cam.z;

    // 1) Sky.
    var kf = keyframe(SKY, dayT);
    var top = mix(kf.a.top, kf.b.top, kf.k);
    var bot = mix(kf.a.bot, kf.b.bot, kf.k);
    var sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, top);
    sky.addColorStop(1, bot);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // 1b) Stars at night.
    if (ambInt > 0.28) {
      g.save();
      g.globalAlpha = Math.min(1, (ambInt - 0.28) * 3);
      g.fillStyle = '#fff';
      for (var s = 0; s < 60; s++) {
        var sx = hash2(s, 1) * W,
          sy = hash2(s, 2) * H * 0.5;
        var tw = 0.5 + 0.5 * Math.sin(time / 400 + s);
        g.globalAlpha = Math.min(1, (ambInt - 0.28) * 3) * tw * 0.9;
        g.fillRect(sx, sy, 1.6, 1.6);
      }
      g.restore();
    }

    // 1c) Sun / moon.
    var sunAng = (dayT - 0.02) * Math.PI * 2;
    var sunX = W / 2 - Math.sin(sunAng) * W * 0.42;
    var sunY = H * 0.52 - Math.cos(sunAng) * H * 0.5;
    var isNight = dayT > 0.55 && dayT < 0.95;
    var disc = g.createRadialGradient(sunX, sunY, 0, sunX, sunY, baseTileW * (isNight ? 0.7 : 1.1));
    if (isNight) {
      disc.addColorStop(0, 'rgba(230,235,255,0.95)');
      disc.addColorStop(1, 'rgba(230,235,255,0)');
    } else {
      disc.addColorStop(0, 'rgba(255,247,214,0.95)');
      disc.addColorStop(0.5, 'rgba(255,214,140,0.5)');
      disc.addColorStop(1, 'rgba(255,214,140,0)');
    }
    g.fillStyle = disc;
    g.fillRect(0, 0, W, H);

    // 2) Open ocean covering the viewport — the island sits within it, so the
    //    sea reaches every screen edge (no hard diamond / dark corners).
    var horizon = H * 0.3 + cam.y * 0.06;
    // Distant land haze on the horizon for depth.
    g.save();
    g.globalAlpha = 0.5;
    g.fillStyle = mix(bot, '#2a3a4a', 0.6);
    g.beginPath();
    g.moveTo(0, horizon + 4);
    for (var hx = 0; hx <= W; hx += 46)
      g.lineTo(hx, horizon - 16 * (0.5 + 0.5 * Math.sin(hx * 0.012 + 1)));
    g.lineTo(W, horizon + 30);
    g.lineTo(0, horizon + 30);
    g.closePath();
    g.fill();
    g.restore();
    var seaG = g.createLinearGradient(0, horizon, 0, H);
    seaG.addColorStop(0, mix(bot, WATER_D, 0.75));
    seaG.addColorStop(0.4, WATER_D);
    seaG.addColorStop(1, mix(WATER_D, '#10202e', 0.7));
    g.fillStyle = seaG;
    g.fillRect(0, horizon, W, H - horizon);
    // Faint moving horizon shimmer.
    g.save();
    g.globalAlpha = 0.14;
    g.strokeStyle = '#bfe4ff';
    g.lineWidth = 1;
    for (var hl = 0; hl < 6; hl++) {
      var hy = horizon + 12 + hl * 16 + Math.sin(time / 800 + hl) * 2;
      g.beginPath();
      g.moveTo(0, hy);
      g.lineTo(W, hy);
      g.stroke();
    }
    g.restore();

    // 3) Cloud shadows on the ground (subtle).
    if (world)
      world.clouds.forEach(function (c) {
        var cxp = c.x * W,
          cyp = (c.y + 0.55) * H;
        g.save();
        g.globalAlpha = 0.06 * (1 - ambInt);
        g.fillStyle = '#000';
        g.beginPath();
        g.ellipse(cxp, cyp, 120 * c.s, 34 * c.s, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
      });

    if (!world) return;

    // 4) Terrain tiles (water animated).
    world.tiles.forEach(function (c) {
      var p = toScreen(c.col, c.row);
      if (p.x < -hw * 2 || p.x > W + hw * 2 || p.y < -hh * 2 || p.y > H + hh * 4) return;
      if (c.t === 'water') {
        drawWater(g, p.x, p.y, hw, hh, c);
      } else {
        var base;
        if (c.t === 'beach') base = c.v > 0.5 ? BEACH : BEACH_D;
        else if (isPath(c.col, c.row)) base = c.v > 0.5 ? PATH : PATH_D;
        else base = GRASS[Math.floor(c.v * GRASS.length) % GRASS.length];
        diamond(g, p.x, p.y, hw, hh);
        g.fillStyle = base;
        g.fill();
        // Soft top-light on each tile for volume.
        g.fillStyle = 'rgba(255,255,255,0.05)';
        g.beginPath();
        g.moveTo(p.x, p.y - hh);
        g.lineTo(p.x + hw, p.y);
        g.lineTo(p.x, p.y);
        g.lineTo(p.x - hw, p.y);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.10)';
        g.lineWidth = 1;
        diamond(g, p.x, p.y, hw, hh);
        g.stroke();
      }
    });

    // 5) Depth-sorted entities: props, buildings, actors.
    var ents = [];
    world.props.forEach(function (pr) {
      ents.push({ d: pr.col + pr.row + 0.2, kind: 'prop', o: pr });
    });
    AOL.LAYOUT.forEach(function (item) {
      var b = state.buildings[item.type];
      if (b) ents.push({ d: item.col + item.row + 0.5, kind: 'bld', o: b, type: item.type });
    });
    world.actors.forEach(function (a) {
      if (a.type === 'villager') ents.push({ d: a.col + a.row + 0.6, kind: 'act', o: a });
    });
    ents.sort(function (a, b) {
      return a.d - b.d;
    });
    ents.forEach(function (e) {
      if (e.kind === 'prop') drawProp(g, e.o, hw, hh);
      else if (e.kind === 'bld')
        drawBuilding(g, e.o, AOL.BUILDINGS[e.type], e.type, hoverType === e.type, isNight);
      else drawVillager(g, e.o, hw, hh);
    });

    // 6) Transient FX (dust, coins, sparkles).
    world.fx.forEach(function (f) {
      drawFx(g, f);
    });

    // 7) Birds (foreground, above world).
    world.actors.forEach(function (a) {
      if (a.type === 'bird') drawBird(g, a, W, H);
    });

    // 8) Clouds (foreground parallax).
    world.clouds.forEach(function (c) {
      drawCloud(g, c, W, H, ambInt);
    });

    // 9) Ambient motes / fireflies.
    g.save();
    world.motes.forEach(function (m) {
      var mx = ((m.x + time / 60000) % 1) * W;
      var my = m.y * H * 0.9 + Math.sin(time / 900 + m.ph) * 10;
      var a = isNight ? 0.8 : 0.35;
      g.fillStyle = isNight ? 'rgba(255,236,140,' + a + ')' : 'rgba(255,255,255,' + a + ')';
      var r = isNight ? 1.8 : 1.2;
      g.beginPath();
      g.arc(mx, my, r * (0.6 + 0.4 * Math.sin(time / 500 + m.ph)), 0, Math.PI * 2);
      g.fill();
    });
    g.restore();

    // 10) Day/night colour grade + vignette.
    if (ambInt > 0.001) {
      g.fillStyle =
        'rgba(' + tint[0] + ',' + tint[1] + ',' + tint[2] + ',' + ambInt.toFixed(3) + ')';
      g.fillRect(0, 0, W, H);
    }
    var vg = g.createRadialGradient(W / 2, H * 0.5, H * 0.3, W / 2, H * 0.5, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.34)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
  }

  function drawWater(g, x, y, hw, hh, c) {
    diamond(g, x, y, hw, hh);
    g.fillStyle = c.v > 0.5 ? WATER : WATER_D;
    g.fill();
    // Animated shimmer bands.
    g.save();
    diamond(g, x, y, hw, hh);
    g.clip();
    g.globalAlpha = 0.35;
    g.strokeStyle = 'rgba(180,225,255,0.5)';
    g.lineWidth = 1.5;
    var ph = time / 700 + c.col * 0.6 + c.row * 0.9;
    for (var i = -1; i <= 1; i++) {
      var oy = (Math.sin(ph + i) * 0.4 + i * 0.4) * hh;
      g.beginPath();
      g.moveTo(x - hw * 0.7, y + oy);
      g.lineTo(x, y + oy - hh * 0.18);
      g.lineTo(x + hw * 0.7, y + oy);
      g.stroke();
    }
    g.restore();
  }

  function drawProp(g, pr, hw, hh) {
    var p = toScreen(pr.col, pr.row);
    var z = cam.z;
    var sway = Math.sin(time / 900 + pr.ph) * 0.04;
    softShadow(g, p.x, p.y + hh * 0.2, hw * 0.5 * pr.scale, hh * 0.5 * pr.scale);
    if (pr.kind === 'tree') {
      var th = baseTileH * 1.5 * z * pr.scale;
      // trunk
      g.fillStyle = '#6b4a2c';
      g.fillRect(p.x - 2 * z, p.y - th * 0.42, 4 * z, th * 0.42);
      // three foliage tiers, swaying
      var tiers = [
        { r: hw * 0.72, o: 0.9 },
        { r: hw * 0.6, o: 1.15 },
        { r: hw * 0.42, o: 1.4 },
      ];
      for (var i = 0; i < tiers.length; i++) {
        var cy = p.y - th * tiers[i].o * 0.5;
        var cx = p.x + sway * th;
        g.fillStyle = i === 2 ? '#4f9a4a' : i === 1 ? '#438542' : '#3a7638';
        g.beginPath();
        g.ellipse(cx, cy, tiers[i].r * pr.scale, tiers[i].r * 0.8 * pr.scale, 0, 0, Math.PI * 2);
        g.fill();
      }
      // highlight
      g.fillStyle = 'rgba(255,255,255,0.14)';
      g.beginPath();
      g.ellipse(
        p.x - hw * 0.2 + sway * th,
        p.y - th * 0.75,
        hw * 0.22 * pr.scale,
        hw * 0.18 * pr.scale,
        0,
        0,
        Math.PI * 2,
      );
      g.fill();
    } else if (pr.kind === 'rock') {
      g.fillStyle = '#8b93a1';
      g.beginPath();
      g.ellipse(p.x, p.y - hh * 0.2, hw * 0.42 * pr.scale, hh * 0.55 * pr.scale, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.12)';
      g.beginPath();
      g.ellipse(
        p.x - hw * 0.12,
        p.y - hh * 0.32,
        hw * 0.16 * pr.scale,
        hh * 0.2 * pr.scale,
        0,
        0,
        Math.PI * 2,
      );
      g.fill();
    } else if (pr.kind === 'bush') {
      g.fillStyle = '#3d7a3c';
      for (var b = 0; b < 3; b++) {
        g.beginPath();
        g.ellipse(
          p.x + (b - 1) * hw * 0.24,
          p.y - hh * 0.18,
          hw * 0.24 * pr.scale,
          hh * 0.4 * pr.scale,
          0,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    } else {
      // flower
      var col = ['#ffd24a', '#ff7ab0', '#8ab0ff', '#ff9a5a'][Math.floor(pr.ph) % 4];
      g.fillStyle = col;
      for (var f = 0; f < 5; f++) {
        var an = (f / 5) * Math.PI * 2 + sway * 4;
        g.beginPath();
        g.ellipse(
          p.x + Math.cos(an) * 3 * z,
          p.y - hh * 0.15 + Math.sin(an) * 3 * z,
          2.2 * z,
          2.2 * z,
          0,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
      g.fillStyle = '#ffe98a';
      g.beginPath();
      g.arc(p.x, p.y - hh * 0.15, 1.6 * z, 0, Math.PI * 2);
      g.fill();
    }
  }

  function drawVillager(g, a, hw, hh) {
    var p = toScreen(a.col, a.row);
    var z = cam.z;
    var bob = Math.abs(Math.sin(a.ph)) * 2 * z;
    softShadow(g, p.x, p.y + 2, 6 * z, 3 * z);
    // body
    g.fillStyle = a.color;
    g.beginPath();
    g.ellipse(p.x, p.y - 6 * z - bob, 4 * z, 6 * z, 0, 0, Math.PI * 2);
    g.fill();
    // head
    g.fillStyle = '#f2c9a0';
    g.beginPath();
    g.arc(p.x, p.y - 13 * z - bob, 3 * z, 0, Math.PI * 2);
    g.fill();
  }

  function drawBird(g, a, W, H) {
    var x = a.x * W,
      y = a.y * H;
    var f = Math.sin(a.ph) * 4;
    g.strokeStyle = 'rgba(20,24,34,0.6)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x - 6, y);
    g.quadraticCurveTo(x, y - f, x + 0, y - 1);
    g.quadraticCurveTo(x, y - f, x + 6, y);
    g.stroke();
  }

  function drawCloud(g, c, W, H, ambInt) {
    var x = c.x * W,
      y = c.y * H;
    g.save();
    g.globalAlpha = 0.85;
    var col = mix('#ffffff', '#3a4a72', ambInt * 0.9);
    g.fillStyle = col;
    for (var i = 0; i < 4; i++) {
      var ox = (i - 1.5) * 40 * c.s;
      g.beginPath();
      g.ellipse(
        x + ox,
        y + Math.sin(i) * 8 * c.s,
        (34 + i * 4) * c.s,
        (20 + i * 2) * c.s,
        0,
        0,
        Math.PI * 2,
      );
      g.fill();
    }
    g.restore();
  }

  function softShadow(g, cx, cy, rx, ry) {
    g.save();
    g.globalAlpha = 0.26;
    g.fillStyle = '#000';
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function isoBox(g, cx, cy, hw, hh, height, topC, leftC, rightC) {
    g.fillStyle = leftC;
    g.beginPath();
    g.moveTo(cx - hw, cy);
    g.lineTo(cx, cy + hh);
    g.lineTo(cx, cy + hh - height);
    g.lineTo(cx - hw, cy - height);
    g.closePath();
    g.fill();
    g.fillStyle = rightC;
    g.beginPath();
    g.moveTo(cx, cy + hh);
    g.lineTo(cx + hw, cy);
    g.lineTo(cx + hw, cy - height);
    g.lineTo(cx, cy + hh - height);
    g.closePath();
    g.fill();
    g.fillStyle = topC;
    g.beginPath();
    g.moveTo(cx, cy - hh - height);
    g.lineTo(cx + hw, cy - height);
    g.lineTo(cx, cy + hh - height);
    g.lineTo(cx - hw, cy - height);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.22)';
    g.lineWidth = 1;
    g.stroke();
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function drawBuilding(g, b, def, type, selected, isNight) {
    var p = toScreen(b.col, b.row);
    var z = cam.z;
    var hw = baseTileW * 0.3 * z,
      hh = baseTileH * 0.3 * z;
    var bob = Math.sin(time / 700 + b.col * 1.3 + b.row) * 1.4 * z;
    var cy = p.y - bob;
    var plinth = Math.max(10, baseTileH * 0.4) * z;

    softShadow(g, p.x, p.y + baseTileH * 0.28 * z, baseTileW * 0.36 * z, baseTileH * 0.34 * z);

    if (selected) {
      g.save();
      g.strokeStyle = def.accent || '#f0c419';
      g.lineWidth = 3;
      g.shadowColor = def.accent || '#f0c419';
      g.shadowBlur = 14;
      diamond(g, p.x, p.y, baseTileW * 0.46 * z, baseTileH * 0.46 * z);
      g.stroke();
      g.restore();
    }

    // Stone plinth.
    isoBox(
      g,
      p.x,
      cy,
      hw,
      hh,
      plinth,
      shade(def.wall, 1.06),
      shade(def.wall, 0.7),
      shade(def.wall, 0.86),
    );

    // Building emblem (placeholder art) sitting on the plinth.
    var size = baseTileW * 0.66 * z;
    g.font = size + 'px serif';
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillText(def.emoji, p.x, cy - plinth + size * 0.26);

    // Warm window glow at night.
    if (isNight) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = 'rgba(255,196,90,0.5)';
      g.beginPath();
      g.arc(p.x, cy - plinth - size * 0.1, size * 0.18, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    // Chimney smoke for producers.
    if (def.produce && !isBusy(b)) {
      var sp = (time / 1000) % 1;
      g.save();
      g.globalAlpha = 0.28 * (1 - sp);
      g.fillStyle = '#e8eef7';
      g.beginPath();
      g.arc(
        p.x + hw * 0.5,
        cy - plinth - size * 0.4 - sp * 26 * z,
        (3 + sp * 6) * z,
        0,
        Math.PI * 2,
      );
      g.fill();
      g.restore();
    }

    // Level badge.
    var badgeW = 42 * z,
      badgeH = 17 * z;
    var bx = p.x - badgeW / 2,
      by = p.y + baseTileH * 0.3 * z;
    g.fillStyle = 'rgba(6,10,20,0.9)';
    roundRect(g, bx, by, badgeW, badgeH, 8 * z);
    g.fill();
    g.strokeStyle = def.accent;
    g.lineWidth = 1;
    g.stroke();
    g.fillStyle = def.accent;
    g.font = 'bold ' + 11 * z + 'px "Segoe UI", sans-serif';
    g.textBaseline = 'middle';
    g.fillText('Lv ' + b.level, p.x, by + badgeH / 2 + 0.5);

    // Construction indicator + progress ring.
    if (isBusy(b)) {
      var total = b.upgradeTotalMs || 1;
      var prog = 1 - Math.max(0, b.upgradeEndsAt - Date.now()) / total;
      g.font = baseTileW * 0.32 * z + 'px serif';
      g.fillText('🔨', p.x, cy - plinth - size * 0.2);
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.lineWidth = 3 * z;
      g.beginPath();
      g.arc(p.x, by - 22 * z, 12 * z, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = '#f0c419';
      g.beginPath();
      g.arc(p.x, by - 22 * z, 12 * z, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      g.stroke();
    }
  }
  function isBusy(b) {
    return b.upgradeEndsAt && b.upgradeEndsAt > Date.now();
  }

  function drawFx(g, f) {
    var p = toScreen(f.col, f.row);
    var k = f.age / f.life;
    var z = cam.z;
    if (f.kind === 'coin') {
      g.save();
      g.globalAlpha = 1 - k;
      g.font = 14 * z + 'px serif';
      g.textAlign = 'center';
      g.fillText('🪙', p.x, p.y - 30 * z - k * 30 * z);
      g.restore();
    } else if (f.kind === 'dust') {
      g.save();
      g.globalAlpha = 0.5 * (1 - k);
      g.fillStyle = '#d8c8a0';
      for (var i = 0; i < 6; i++) {
        var an = (i / 6) * Math.PI * 2;
        g.beginPath();
        g.arc(
          p.x + Math.cos(an) * k * 26 * z,
          p.y - 4 * z - Math.sin(an) * k * 14 * z,
          (5 - k * 4) * z,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
      g.restore();
    } else if (f.kind === 'spark') {
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 1 - k;
      g.fillStyle = f.color || '#ffe08a';
      for (var s = 0; s < 8; s++) {
        var a2 = (s / 8) * Math.PI * 2;
        var rr = k * 30 * z;
        g.beginPath();
        g.arc(p.x + Math.cos(a2) * rr, p.y - 20 * z + Math.sin(a2) * rr, 2.4 * z, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
  }

  // --- public: per-frame ---------------------------------------------------
  K.render = function (dtMs) {
    if (!ctx) return;
    time += dtMs;
    var dt = Math.min(0.05, dtMs / 1000);
    sim(dt);
    var state = getState();
    var dayT = ((state.clock || 0) / 120) % 1;
    var kf = keyframe(SKY, dayT);
    var amb = mix(kf.a.amb, kf.b.amb, kf.k);
    var ambInt = kf.a.ai + (kf.b.ai - kf.a.ai) * kf.k;
    var tint = hexToRgb(amb);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cw, ch);
    paint(ctx, cw, ch, state, dayT, tint, ambInt);
    ctx.restore();
  };

  // Emit a transient effect at a building (called by game.js on events).
  K.effect = function (type, kind, color) {
    if (!world) return;
    var item = null;
    for (var i = 0; i < AOL.LAYOUT.length; i++)
      if (AOL.LAYOUT[i].type === type) item = AOL.LAYOUT[i];
    if (!item) return;
    world.fx.push({
      col: item.col,
      row: item.row,
      kind: kind,
      color: color,
      age: 0,
      life: kind === 'coin' ? 1.1 : 0.7,
    });
  };

  // --- input: pan + zoom ---------------------------------------------------
  function clampCam() {
    var lim = baseTileW * AOL.GRID * 0.7 * cam.z;
    cam.tx = Math.max(-lim, Math.min(lim, cam.tx));
    cam.ty = Math.max(-lim, Math.min(lim, cam.ty));
  }
  function attachInput() {
    var dragging = false,
      moved = false,
      lastX = 0,
      lastY = 0;
    var pinchDist = 0;
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true;
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var px = e.clientX - rect.left,
        py = e.clientY - rect.top;
      var t = toTile(px, py);
      hoverType = buildingAt(t.col, t.row);
      if (dragging) {
        var ddx = e.clientX - lastX,
          ddy = e.clientY - lastY;
        if (Math.abs(ddx) + Math.abs(ddy) > 4) moved = true;
        cam.tx += ddx;
        cam.ty += ddy;
        cam.x += ddx;
        cam.y += ddy;
        lastX = e.clientX;
        lastY = e.clientY;
        clampCam();
      }
    });
    canvas.addEventListener('pointerup', function (e) {
      dragging = false;
      if (!moved) {
        var rect = canvas.getBoundingClientRect();
        var t = toTile(e.clientX - rect.left, e.clientY - rect.top);
        var type = buildingAt(t.col, t.row);
        if (type && onPick) onPick(type);
      }
    });
    canvas.addEventListener('pointerleave', function () {
      dragging = false;
      hoverType = null;
    });
    canvas.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        cam.tz = Math.max(0.7, Math.min(1.9, cam.tz * (e.deltaY < 0 ? 1.12 : 0.89)));
        clampCam();
      },
      { passive: false },
    );
    // Pinch zoom.
    var pts = {};
    canvas.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = e;
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = e;
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        var a = pts[ids[0]],
          b = pts[ids[1]];
        var d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinchDist) {
          cam.tz = Math.max(0.7, Math.min(1.9, cam.tz * (d / pinchDist)));
          clampCam();
        }
        pinchDist = d;
      }
    });
    var clearPt = function (e) {
      delete pts[e.pointerId];
      pinchDist = 0;
    };
    canvas.addEventListener('pointerup', clearPt);
    canvas.addEventListener('pointercancel', clearPt);
  }

  function buildingAt(col, row) {
    for (var i = 0; i < AOL.LAYOUT.length; i++)
      if (AOL.LAYOUT[i].col === col && AOL.LAYOUT[i].row === row) return AOL.LAYOUT[i].type;
    return null;
  }

  // --- headless preview hook (for offline art review) ----------------------
  K._debugPaint = function (g, W, H, state, t) {
    time = t || 0;
    cw = W;
    ch = H;
    layoutMetrics();
    if (!world) buildWorld();
    var dayT = ((state.clock || 0) / 120) % 1;
    var kf = keyframe(SKY, dayT);
    var amb = mix(kf.a.amb, kf.b.amb, kf.k);
    var ambInt = kf.a.ai + (kf.b.ai - kf.a.ai) * kf.k;
    paint(g, W, H, state, dayT, hexToRgb(amb), ambInt);
  };
})(window.AOL);
