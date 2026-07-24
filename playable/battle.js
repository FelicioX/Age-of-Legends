/*
 * Age of Legends — playable prototype: cinematic auto-battle scene.
 *
 * Renders the campaign combat as an animated canvas battlefield: drawn
 * characters (no emoji), an ATB/energy system with ultimates, projectiles,
 * area spells, floating damage, screen shake and hit-stop. Deliberately
 * self-contained (`AOL.Battle`) so the game layer only builds the two teams
 * and reacts to the result. All content and art here are original.
 */
window.AOL = window.AOL || {};
(function (AOL) {
  'use strict';

  // --- small helpers -------------------------------------------------------
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function easeOut(t) {
    return 1 - (1 - t) * (1 - t);
  }
  function clamp01(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  // --- palettes: strong colour coding per role, ally vs enemy --------------
  var ALLY_SKIN = '#f0c79c';
  var ENEMY_SKIN = '#8fae7a';
  var ROLE_COLORS = {
    tank: { body: '#5b78b0', trim: '#cfe0ff', prop: '#dfe8ff' },
    dps: { body: '#4e9d5b', trim: '#bff0c6', prop: '#eaf7d0' },
    mage: { body: '#8a5bd0', trim: '#e6ccff', prop: '#ff8a4c' },
    healer: { body: '#d8c98a', trim: '#fff4c8', prop: '#ffe89a' },
    support: { body: '#b1794a', trim: '#e8cfa8', prop: '#ffd27a' },
  };
  var ENEMY_COLORS = {
    tank: { body: '#7a3030', trim: '#e0a0a0', prop: '#ffb4b4' },
    dps: { body: '#8a3a2a', trim: '#e8b090', prop: '#ffc09a' },
    mage: { body: '#5a2f6a', trim: '#d0a0e0', prop: '#ff6a9a' },
    healer: { body: '#6a5a2a', trim: '#e0d090', prop: '#ffe0a0' },
    support: { body: '#5a4030', trim: '#d0b090', prop: '#ffc890' },
  };

  // --- module-scoped running battle ---------------------------------------
  var B = null; // current battle context or null

  AOL.Battle = {
    active: function () {
      return !!B;
    },
    start: function (cfg) {
      // cfg: { overlay, stage, allies, enemies, rewardText, onEnd }
      stop();
      timers = [];
      B = buildContext(cfg);
      layout();
      loop(performance.now());
    },
    stop: stop,
  };

  function stop() {
    if (B && B.raf) cancelAnimationFrame(B.raf);
    if (B && B.onResize) window.removeEventListener('resize', B.onResize);
    B = null;
  }

  // --- context / DOM -------------------------------------------------------
  function buildContext(cfg) {
    var overlay = cfg.overlay;
    overlay.classList.remove('hidden');
    overlay.innerHTML =
      '<div class="bt-top">' +
      '<button class="bt-btn" id="btFlee">‹ Retreat</button>' +
      '<div class="bt-stage">Stage ' +
      cfg.stage +
      '</div>' +
      '<button class="bt-btn" id="btSpeed">1×</button>' +
      '</div>' +
      '<canvas class="bt-canvas" id="btCanvas"></canvas>' +
      '<div class="bt-result hidden" id="btResult"></div>';

    var canvas = overlay.querySelector('#btCanvas');
    var ctx = canvas.getContext('2d');

    var ctxObj = {
      cfg: cfg,
      overlay: overlay,
      canvas: canvas,
      ctx: ctx,
      dpr: Math.min(2, window.devicePixelRatio || 1),
      w: 0,
      h: 0,
      speed: 1,
      units: [],
      fx: [],
      floats: [],
      shake: 0,
      hitstop: 0,
      time: 0,
      over: false,
      last: 0,
      raf: 0,
    };

    ctxObj.units = cfg.allies
      .map(function (u, i) {
        return makeUnit(u, 'ally', i);
      })
      .concat(
        cfg.enemies.map(function (u, i) {
          return makeUnit(u, 'enemy', i);
        }),
      );

    overlay.querySelector('#btFlee').onclick = function () {
      finish(false, true);
    };
    var speedBtn = overlay.querySelector('#btSpeed');
    speedBtn.onclick = function () {
      ctxObj.speed = ctxObj.speed === 1 ? 2 : ctxObj.speed === 2 ? 3 : 1;
      speedBtn.textContent = ctxObj.speed + '×';
    };

    ctxObj.onResize = function () {
      resize(ctxObj);
      layout();
    };
    window.addEventListener('resize', ctxObj.onResize);
    resize(ctxObj);
    return ctxObj;
  }

  function makeUnit(src, side, index) {
    return {
      name: src.name,
      role: src.role,
      side: side,
      index: index,
      maxHp: src.maxHp,
      hp: src.hp != null ? src.hp : src.maxHp,
      atk: src.atk,
      spd: src.spd,
      charge: rand(0, 45),
      energy: 0,
      alive: true,
      // runtime render state
      x: 0,
      y: 0,
      homeX: 0,
      homeY: 0,
      bob: rand(0, 6.28),
      face: side === 'ally' ? 1 : -1,
      act: null,
      flash: 0,
      shieldT: 0,
      atkBuff: 0,
      deathT: 0,
    };
  }

  function resize(c) {
    var r = c.overlay.getBoundingClientRect();
    c.w = r.width;
    c.h = r.height - 46; // minus top bar
    c.canvas.style.width = c.w + 'px';
    c.canvas.style.height = c.h + 'px';
    c.canvas.width = Math.round(c.w * c.dpr);
    c.canvas.height = Math.round(c.h * c.dpr);
    c.ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
  }

  // --- formation layout ----------------------------------------------------
  function layout() {
    if (!B) return;
    var w = B.w,
      h = B.h;
    ['ally', 'enemy'].forEach(function (side) {
      var team = B.units.filter(function (u) {
        return u.side === side;
      });
      var front = [],
        back = [];
      team.forEach(function (u) {
        if (u.role === 'tank' || u.role === 'dps') front.push(u);
        else back.push(u);
      });
      if (front.length === 0 && back.length) {
        front.push(back.shift());
      }
      var frontX = side === 'ally' ? w * 0.36 : w * 0.64;
      var backX = side === 'ally' ? w * 0.2 : w * 0.8;
      placeColumn(front, frontX, h);
      placeColumn(back, backX, h);
    });
  }
  function placeColumn(list, x, h) {
    var top = h * 0.32,
      bot = h * 0.86;
    for (var i = 0; i < list.length; i++) {
      var t = list.length === 1 ? 0.5 : i / (list.length - 1);
      var y = lerp(top, bot, t);
      list[i].homeX = x;
      list[i].homeY = y;
      list[i].x = x;
      list[i].y = y;
    }
  }

  // --- main loop -----------------------------------------------------------
  function loop(now) {
    if (!B) return;
    var dt = Math.min(0.05, (now - (B.last || now)) / 1000);
    B.last = now;
    var steps = B.speed;
    // hitstop freezes simulation but not the rAF cadence
    if (B.hitstop > 0) {
      B.hitstop -= dt;
      steps = 0;
    }
    for (var s = 0; s < steps; s++) simulate(dt);
    // fx/floats always advance (even during hitstop) for snappy feedback
    updateFx(dt * (B.hitstop > 0 ? 0.25 : B.speed));
    if (B.shake > 0) B.shake = Math.max(0, B.shake - dt * 60);
    B.time += dt;
    draw();
    B.raf = requestAnimationFrame(loop);
  }

  function livingSide(side) {
    return B.units.filter(function (u) {
      return u.side === side && u.alive;
    });
  }

  function simulate(dt) {
    if (B.over) return;
    B.units.forEach(function (u) {
      if (!u.alive) {
        u.deathT += dt;
        return;
      }
      if (u.flash > 0) u.flash = Math.max(0, u.flash - dt * 4);
      if (u.shieldT > 0) u.shieldT -= dt;
      if (u.atkBuff > 0) u.atkBuff -= dt;
      // advance current action
      if (u.act) {
        advanceAction(u, dt);
        return;
      }
      // fill ATB; act when full
      u.charge += u.spd * dt * 3.4;
      if (u.charge >= 100) {
        u.charge = 0;
        beginAction(u);
      }
    });
    // resolve end
    if (!B.over) {
      if (livingSide('ally').length === 0) finish(false);
      else if (livingSide('enemy').length === 0) finish(true);
    }
  }

  // --- action selection ----------------------------------------------------
  function foesOf(u) {
    return livingSide(u.side === 'ally' ? 'enemy' : 'ally');
  }
  function alliesOf(u) {
    return livingSide(u.side);
  }
  function lowestHp(list) {
    return list.slice().sort(function (a, b) {
      return a.hp - b.hp;
    })[0];
  }

  function beginAction(u) {
    var foes = foesOf(u);
    var friends = alliesOf(u);
    var ult = u.energy >= 100;
    if (ult) u.energy = 0;

    if (u.role === 'healer') {
      var hurt = friends.slice().sort(function (a, b) {
        return a.hp / a.maxHp - b.hp / b.maxHp;
      })[0];
      if (ult) {
        u.act = { kind: 'cast', t: 0, dur: 0.7, done: false, ability: 'ult-heal' };
        return;
      }
      if (hurt && hurt.hp < hurt.maxHp * 0.98) {
        u.act = { kind: 'cast', t: 0, dur: 0.55, done: false, ability: 'heal', target: hurt };
        return;
      }
      // nobody hurt: small bolt at a foe
    }

    if (foes.length === 0) return;
    var target = lowestHp(foes);

    if (ult) {
      if (u.role === 'mage') {
        u.act = { kind: 'cast', t: 0, dur: 0.85, done: false, ability: 'ult-meteor' };
      } else if (u.role === 'dps') {
        u.act = { kind: 'cast', t: 0, dur: 0.7, done: false, ability: 'ult-volley' };
      } else if (u.role === 'tank') {
        u.act = { kind: 'melee', t: 0, dur: 0.6, done: false, ability: 'ult-bash', target: target };
      } else if (u.role === 'support') {
        u.act = { kind: 'cast', t: 0, dur: 0.7, done: false, ability: 'ult-rally' };
      } else {
        u.act = { kind: 'cast', t: 0, dur: 0.7, done: false, ability: 'ult-heal' };
      }
      return;
    }

    // basic attacks
    if (u.role === 'mage') {
      u.act = { kind: 'cast', t: 0, dur: 0.55, done: false, ability: 'spark', target: target };
    } else if (u.role === 'dps') {
      u.act = { kind: 'cast', t: 0, dur: 0.5, done: false, ability: 'arrow', target: target };
    } else if (u.role === 'support') {
      u.act = { kind: 'cast', t: 0, dur: 0.5, done: false, ability: 'bolt', target: target };
    } else {
      u.act = { kind: 'melee', t: 0, dur: 0.5, done: false, ability: 'strike', target: target };
    }
  }

  // --- action progression + impact ----------------------------------------
  function advanceAction(u, dt) {
    var a = u.act;
    a.t += dt / a.dur;
    var p = a.t;

    if (a.kind === 'melee') {
      var tgt = a.target && a.target.alive ? a.target : nearestFoe(u);
      if (!tgt) {
        u.act = null;
        u.x = u.homeX;
        return;
      }
      var apex = 0.42;
      if (p < apex) {
        var k = easeOut(p / apex);
        u.x = lerp(u.homeX, tgt.x - u.face * 44, k);
        u.y = lerp(u.homeY, tgt.y, k);
      } else {
        var k2 = easeOut((p - apex) / (1 - apex));
        u.x = lerp(tgt.x - u.face * 44, u.homeX, k2);
        u.y = lerp(tgt.y, u.homeY, k2);
      }
      if (!a.done && p >= apex) {
        a.done = true;
        if (a.ability === 'ult-bash') {
          dealDamage(u, tgt, u.atk * 2.6, true);
          u.shieldT = 6;
          spawnSlash(tgt, 1.6, '#ffd36a');
          B.shake = 14;
          B.hitstop = 0.09;
        } else {
          var crit = Math.random() < 0.2;
          dealDamage(u, tgt, u.atk * (crit ? 1.9 : 1) * rand(0.85, 1.15), crit);
          spawnSlash(tgt, crit ? 1.3 : 1, '#ffffff');
          if (crit) {
            B.shake = 9;
            B.hitstop = 0.05;
          }
        }
        addEnergy(u, 25);
      }
      if (p >= 1) {
        u.x = u.homeX;
        u.y = u.homeY;
        u.act = null;
      }
      return;
    }

    // cast kinds — unit stays home, small recoil, spawns a projectile/effect
    var recoil = Math.sin(clamp01(p) * Math.PI) * 8 * -u.face;
    u.x = u.homeX + recoil;
    if (!a.done && p >= 0.32) {
      a.done = true;
      fireCast(u, a.ability, a.target);
      addEnergy(u, a.ability.indexOf('ult') === 0 ? 0 : 22);
    }
    if (p >= 1) {
      u.x = u.homeX;
      u.act = null;
    }
  }

  function nearestFoe(u) {
    var f = foesOf(u);
    return f.length ? f[0] : null;
  }

  function fireCast(u, ability, target) {
    var col = (u.side === 'ally' ? ROLE_COLORS : ENEMY_COLORS)[u.role];
    switch (ability) {
      case 'arrow':
        spawnProjectile(u, target, 'arrow', col.prop, function (t) {
          var crit = Math.random() < 0.25;
          dealDamage(u, t, u.atk * (crit ? 2.0 : 1.1) * rand(0.85, 1.15), crit);
          if (crit) B.shake = 8;
        });
        break;
      case 'bolt':
        spawnProjectile(u, target, 'orb', col.prop, function (t) {
          dealDamage(u, t, u.atk * rand(0.9, 1.15), false);
        });
        break;
      case 'spark':
        // small AoE: hit target + neighbours
        foesOf(u).forEach(function (t) {
          var d = Math.abs(t.homeY - target.homeY) < 90 ? 0.7 : 0;
          if (t === target) d = 1;
          if (d > 0) {
            spawnProjectile(u, t, 'orb', '#ff8a4c', function (tt) {
              dealDamage(u, tt, u.atk * 0.75 * d, false);
            });
          }
        });
        break;
      case 'heal':
        healTarget(u, target, u.atk * 1.7);
        break;
      case 'ult-heal':
        alliesOf(u).forEach(function (f) {
          healTarget(u, f, u.atk * 1.5);
        });
        spawnRing(u.side, '#8fffa8');
        break;
      case 'ult-rally':
        alliesOf(u).forEach(function (f) {
          f.atkBuff = 8;
          spawnFloat(f, 'ATK▲', '#ffd36a', 0.9);
        });
        foesOf(u).forEach(function (t) {
          spawnProjectile(u, t, 'orb', col.prop, function (tt) {
            dealDamage(u, tt, u.atk * 0.6, false);
          });
        });
        spawnRing(u.side, '#ffd36a');
        break;
      case 'ult-volley':
        foesOf(u).forEach(function (t, i) {
          setTimeout2(i * 60, function () {
            if (!B) return;
            spawnProjectile(u, t, 'arrow', col.prop, function (tt) {
              var crit = Math.random() < 0.3;
              dealDamage(u, tt, u.atk * (crit ? 1.6 : 1.0), crit);
            });
          });
        });
        B.shake = 6;
        break;
      case 'ult-meteor':
        spawnMeteor(u, function () {
          foesOf(u).forEach(function (t) {
            dealDamage(u, t, u.atk * 1.5 * rand(0.9, 1.1), true);
          });
          B.shake = 20;
          B.hitstop = 0.12;
        });
        break;
    }
  }

  // deferred callbacks tied to battle lifetime (avoids raw setTimeout leaks)
  var timers = [];
  function setTimeout2(ms, fn) {
    timers.push({ t: ms / 1000, fn: fn });
  }

  // --- damage / heal / energy ---------------------------------------------
  function dealDamage(from, to, amount, crit) {
    if (!to.alive) return;
    var mult = from.atkBuff > 0 ? 1.3 : 1;
    var dmg = Math.max(1, Math.round(amount * mult));
    if (to.shieldT > 0) {
      dmg = Math.round(dmg * 0.4);
    }
    to.hp -= dmg;
    to.flash = 1;
    addEnergy(to, 8);
    spawnFloat(to, String(dmg), crit ? '#ff5a5a' : '#ffffff', crit ? 1.35 : 1);
    knock(to, from.face);
    if (to.hp <= 0) {
      to.hp = 0;
      to.alive = false;
      to.act = null;
      spawnBurst(to.x, to.y, to.side === 'ally' ? '#8fb4ff' : '#ff8a8a');
    }
  }
  function healTarget(from, to, amount) {
    if (!to.alive) return;
    var h = Math.round(amount);
    to.hp = Math.min(to.maxHp, to.hp + h);
    spawnFloat(to, '+' + h, '#7be08f', 1);
    spawnSparkle(to);
  }
  function addEnergy(u, amt) {
    if (!u.alive) return;
    u.energy = Math.min(100, u.energy + amt);
  }
  function knock(u, dir) {
    u._knock = dir * 6;
  }

  // --- effects -------------------------------------------------------------
  function spawnProjectile(from, to, kind, color, onHit) {
    if (!to) return;
    B.fx.push({
      type: 'proj',
      kind: kind,
      color: color,
      x: from.x + from.face * 20,
      y: from.y - 24,
      tx: to,
      onHit: onHit,
      t: 0,
      speed: rand(900, 1150),
      sx: from.x + from.face * 20,
      sy: from.y - 24,
    });
  }
  function spawnSlash(u, scale, color) {
    B.fx.push({ type: 'slash', x: u.x, y: u.y - 24, t: 0, dur: 0.22, scale: scale, color: color });
  }
  function spawnRing(side, color) {
    var cx = side === 'ally' ? B.w * 0.28 : B.w * 0.72;
    B.fx.push({ type: 'ring', x: cx, y: B.h * 0.58, t: 0, dur: 0.5, color: color, r: 140 });
  }
  function spawnBurst(x, y, color) {
    for (var i = 0; i < 10; i++) {
      B.fx.push({
        type: 'part',
        x: x,
        y: y - 20,
        vx: rand(-90, 90),
        vy: rand(-140, -30),
        t: 0,
        dur: rand(0.4, 0.7),
        color: color,
        size: rand(2, 5),
      });
    }
  }
  function spawnSparkle(u) {
    for (var i = 0; i < 6; i++) {
      B.fx.push({
        type: 'part',
        x: u.x + rand(-16, 16),
        y: u.y - rand(0, 44),
        vx: rand(-20, 20),
        vy: rand(-60, -20),
        t: 0,
        dur: rand(0.4, 0.8),
        color: '#9effb0',
        size: rand(2, 4),
      });
    }
  }
  function spawnMeteor(u, onImpact) {
    var foes = foesOf(u);
    var cx = foes.length
      ? foes.reduce(function (s, f) {
          return s + f.homeX;
        }, 0) / foes.length
      : B.w * 0.72;
    var cy = foes.length
      ? foes.reduce(function (s, f) {
          return s + f.homeY;
        }, 0) / foes.length
      : B.h * 0.58;
    B.fx.push({
      type: 'meteor',
      x: cx + 220,
      y: -120,
      tx: cx,
      ty: cy,
      t: 0,
      dur: 0.5,
      onHit: onImpact,
      done: false,
    });
  }
  function spawnFloat(u, text, color, scale) {
    B.floats.push({
      x: u.x + rand(-8, 8),
      y: u.y - 46,
      text: text,
      color: color,
      scale: scale,
      t: 0,
      dur: 0.85,
    });
  }

  function updateFx(dt) {
    // deferred timers
    for (var i = timers.length - 1; i >= 0; i--) {
      timers[i].t -= dt;
      if (timers[i].t <= 0) {
        var fn = timers[i].fn;
        timers.splice(i, 1);
        fn();
      }
    }
    B.fx = B.fx.filter(function (f) {
      return stepFx(f, dt);
    });
    B.floats = B.floats.filter(function (f) {
      f.t += dt / f.dur;
      f.y -= dt * 40;
      return f.t < 1;
    });
    B.units.forEach(function (u) {
      if (u._knock) {
        u.x += u._knock;
        u._knock *= 0.6;
        if (Math.abs(u._knock) < 0.4) u._knock = 0;
      }
    });
  }
  function stepFx(f, dt) {
    if (f.type === 'proj') {
      var tx = f.tx.x + f.tx.face * 18,
        ty = f.tx.y - 24;
      var dx = tx - f.x,
        dy = ty - f.y;
      var dist = Math.hypot(dx, dy) || 1;
      var mv = f.speed * dt;
      f.angle = Math.atan2(dy, dx);
      if (mv >= dist) {
        f.x = tx;
        f.y = ty;
        if (f.onHit) f.onHit(f.tx);
        return false;
      }
      f.x += (dx / dist) * mv;
      f.y += (dy / dist) * mv;
      return true;
    }
    if (f.type === 'meteor') {
      f.t += dt / f.dur;
      var k = clamp01(f.t);
      f.x = lerp(f.x, f.tx, 0.25);
      f.y = lerp(-120, f.ty, easeOut(k));
      if (!f.done && k >= 1) {
        f.done = true;
        if (f.onHit) f.onHit();
        spawnBurst(f.tx, f.ty, '#ff8a4c');
        B.fx.push({ type: 'ring', x: f.tx, y: f.ty, t: 0, dur: 0.45, color: '#ff8a4c', r: 170 });
      }
      return f.t < 1.05;
    }
    f.t += dt / (f.dur || 0.4);
    if (f.type === 'part') {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.vy += 260 * dt;
    }
    return f.t < 1;
  }

  // --- rendering -----------------------------------------------------------
  function draw() {
    var ctx = B.ctx,
      w = B.w,
      h = B.h;
    ctx.save();
    if (B.shake > 0) {
      ctx.translate(rand(-B.shake, B.shake) * 0.5, rand(-B.shake, B.shake) * 0.5);
    }
    drawBackground(ctx, w, h);

    // draw units back-to-front by y
    var ordered = B.units.slice().sort(function (a, b) {
      return a.y - b.y;
    });
    ordered.forEach(function (u) {
      drawUnit(ctx, u);
    });

    // effects above units
    B.fx.forEach(function (f) {
      drawFx(ctx, f);
    });
    // floating text on top
    B.floats.forEach(function (f) {
      drawFloat(ctx, f);
    });
    ctx.restore();
  }

  function drawBackground(ctx, w, h) {
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#28324f');
    sky.addColorStop(0.55, '#3a4a6b');
    sky.addColorStop(1, '#4a5f4a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // ground band
    var gy = h * 0.6;
    var g = ctx.createLinearGradient(0, gy, 0, h);
    g.addColorStop(0, '#5a7a48');
    g.addColorStop(1, '#3c5632');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, gy + 18);
    ctx.quadraticCurveTo(w * 0.5, gy - 12, w, gy + 18);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    // centre divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, gy - 6);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
  }

  function drawUnit(ctx, u) {
    var alpha = u.alive ? 1 : Math.max(0, 1 - u.deathT * 1.4);
    if (alpha <= 0) return;
    var col = (u.side === 'ally' ? ROLE_COLORS : ENEMY_COLORS)[u.role];
    var skin = u.side === 'ally' ? ALLY_SKIN : ENEMY_SKIN;
    var bobY = Math.sin(B.time * 3 + u.bob) * (u.alive ? 2.2 : 0);
    var x = u.x,
      y = u.y + bobY;
    var fall = u.alive ? 0 : Math.min(14, u.deathT * 40);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y + fall);
    if (!u.alive) ctx.rotate(u.face * 0.5 * Math.min(1, u.deathT * 2));

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 20, 6, 0, 0, 6.283);
    ctx.fill();

    ctx.scale(u.face, 1); // face direction

    // shield aura (tank ult)
    if (u.shieldT > 0) {
      ctx.strokeStyle = 'rgba(120,200,255,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -30, 30, 40, 0, 0, 6.283);
      ctx.stroke();
    }

    // legs
    ctx.fillStyle = shade(col.body, -0.35);
    ctx.fillRect(-11, -18, 8, 18);
    ctx.fillRect(3, -18, 8, 18);
    // body
    roundRect(ctx, -15, -50, 30, 34, 8);
    ctx.fillStyle = col.body;
    ctx.fill();
    // trim
    ctx.fillStyle = col.trim;
    ctx.fillRect(-15, -30, 30, 4);
    // head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -60, 12, 0, 6.283);
    ctx.fill();
    // eyes
    ctx.fillStyle = u.side === 'ally' ? '#3a2f2a' : '#ff5a4a';
    ctx.fillRect(2, -63, 3, 3);
    ctx.fillRect(8, -63, 3, 3);

    drawRoleProp(ctx, u, col);

    // hit flash overlay
    if (u.flash > 0) {
      ctx.globalAlpha = alpha * u.flash * 0.6;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, -16, -72, 32, 60, 10);
      ctx.fill();
      ctx.globalAlpha = alpha;
    }
    ctx.restore();

    drawBars(ctx, u, x, y + fall);
  }

  function drawRoleProp(ctx, u, col) {
    ctx.fillStyle = col.prop;
    ctx.strokeStyle = shade(col.prop, -0.4);
    ctx.lineWidth = 2;
    if (u.role === 'tank') {
      // shield
      roundRect(ctx, 12, -52, 12, 26, 4);
      ctx.fill();
      ctx.stroke();
      // sword
      ctx.fillStyle = '#dfe6f0';
      ctx.fillRect(-22, -54, 4, 26);
    } else if (u.role === 'dps') {
      // bow
      ctx.strokeStyle = col.prop;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, -38, 16, -1.1, 1.1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16 + 16 * Math.cos(-1.1), -38 + 16 * Math.sin(-1.1));
      ctx.lineTo(16 + 16 * Math.cos(1.1), -38 + 16 * Math.sin(1.1));
      ctx.stroke();
    } else if (u.role === 'mage') {
      // staff + orb
      ctx.strokeStyle = '#8a6b4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(16, -20);
      ctx.lineTo(20, -64);
      ctx.stroke();
      ctx.fillStyle = col.prop;
      ctx.beginPath();
      ctx.arc(20, -66, 6, 0, 6.283);
      ctx.fill();
    } else if (u.role === 'healer') {
      // halo + staff
      ctx.strokeStyle = col.prop;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -74, 8, 0, 6.283);
      ctx.stroke();
      ctx.strokeStyle = '#cbb57a';
      ctx.beginPath();
      ctx.moveTo(16, -20);
      ctx.lineTo(18, -60);
      ctx.stroke();
      ctx.fillStyle = col.prop;
      ctx.fillRect(14, -64, 8, 8);
    } else {
      // support: gear pack
      ctx.fillStyle = col.prop;
      ctx.beginPath();
      ctx.arc(-16, -40, 7, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = shade(col.prop, -0.3);
      ctx.beginPath();
      ctx.arc(-16, -40, 3, 0, 6.283);
      ctx.fill();
    }
  }

  function drawBars(ctx, u, x, y) {
    var bw = 40,
      bx = x - bw / 2,
      by = y - 84;
    if (!u.alive) return;
    // hp
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, bx - 1, by - 1, bw + 2, 6, 3);
    ctx.fill();
    var hpPct = clamp01(u.hp / u.maxHp);
    ctx.fillStyle = u.side === 'ally' ? '#5fd06a' : '#e0574f';
    roundRect(ctx, bx, by, bw * hpPct, 4, 2);
    ctx.fill();
    // energy
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, bx, by + 6, bw, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = u.energy >= 100 ? '#ffe36a' : '#4aa6ff';
    roundRect(ctx, bx, by + 6, bw * clamp01(u.energy / 100), 3, 1.5);
    ctx.fill();
    // name
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(u.name.split(' ')[0], x, by - 4);
  }

  function drawFx(ctx, f) {
    if (f.type === 'proj') {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle || 0);
      if (f.kind === 'arrow') {
        ctx.fillStyle = f.color;
        ctx.fillRect(-9, -1.5, 18, 3);
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(3, -4);
        ctx.lineTo(3, 4);
        ctx.fill();
      } else {
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (f.type === 'slash') {
      var k = clamp01(f.t);
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 4 * f.scale;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 26 * f.scale, -0.6 + k * 1.4, 0.9 + k * 1.4);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (f.type === 'ring') {
      var kk = clamp01(f.t);
      ctx.save();
      ctx.globalAlpha = (1 - kk) * 0.8;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(f.x, f.y, (f.r || 120) * kk, 0, 6.283);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (f.type === 'meteor') {
      ctx.save();
      ctx.fillStyle = '#ff8a4c';
      ctx.shadowColor = '#ff5a2a';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 16, 0, 6.283);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,180,120,0.6)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(f.x + 60, f.y - 60);
      ctx.lineTo(f.x, f.y);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (f.type === 'part') {
      ctx.save();
      ctx.globalAlpha = 1 - clamp01(f.t);
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloat(ctx, f) {
    var k = clamp01(f.t);
    ctx.save();
    ctx.globalAlpha = 1 - k * k;
    ctx.fillStyle = f.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    var size = Math.round(13 * f.scale + (1 - k) * 4);
    ctx.font = '700 ' + size + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }

  // --- end sequence --------------------------------------------------------
  function finish(win, fled) {
    if (B.over) return;
    B.over = true;
    timers = [];
    var res = B.overlay.querySelector('#btResult');
    if (fled) {
      var fledEnd = B.cfg.onEnd;
      close();
      if (fledEnd) fledEnd({ win: false, fled: true });
      return;
    }
    var cfg = B.cfg;
    setTimeout2(0.35, function () {
      if (!B) return;
      res.className = 'bt-result ' + (win ? 'win' : 'lose');
      res.innerHTML =
        '<div class="bt-banner">' +
        (win ? '★ VICTORY ★' : 'DEFEAT') +
        '</div>' +
        (win && cfg.rewardText
          ? '<div class="bt-reward">' + cfg.rewardText + '</div>'
          : win
            ? ''
            : '<div class="bt-reward">Strengthen your heroes and try again.</div>') +
        '<button class="bt-cta" id="btCont">Continue</button>';
      res.classList.remove('hidden');
      res.querySelector('#btCont').onclick = function () {
        var onEnd = cfg.onEnd;
        close();
        if (onEnd) onEnd({ win: win });
      };
      if (win) rewardRain();
    });
  }

  function rewardRain() {
    for (var i = 0; i < 26; i++) {
      B.fx.push({
        type: 'part',
        x: rand(B.w * 0.2, B.w * 0.8),
        y: rand(-40, 0),
        vx: rand(-20, 20),
        vy: rand(40, 120),
        t: 0,
        dur: rand(0.8, 1.4),
        color: ['#ffd36a', '#8fd4ff', '#9effb0'][i % 3],
        size: rand(3, 6),
      });
    }
  }

  function close() {
    if (!B) return;
    B.overlay.classList.add('hidden');
    B.overlay.innerHTML = '';
    stop();
  }
  // keep finishing timers running after over: piggyback on rAF via loop()
  // (loop keeps calling updateFx which drains `timers`)

  // --- geometry util -------------------------------------------------------
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function shade(hex, amt) {
    var c = hex.replace('#', '');
    var r = parseInt(c.substr(0, 2), 16),
      g = parseInt(c.substr(2, 2), 16),
      b = parseInt(c.substr(4, 2), 16);
    r = Math.max(0, Math.min(255, Math.round(r + r * amt)));
    g = Math.max(0, Math.min(255, Math.round(g + g * amt)));
    b = Math.max(0, Math.min(255, Math.round(b + b * amt)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
})(window.AOL);
