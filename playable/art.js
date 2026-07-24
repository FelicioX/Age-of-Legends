/*
 * Age of Legends — procedural hero art.
 *
 * Draws original, stylized "champion bust" portraits for each hero entirely in
 * canvas — no external images, no copied assets. Portraits are cached as data
 * URLs and consumed as CSS background images by the hero cards, party slots and
 * formation tiles. All shapes and palettes are original to Age of Legends.
 *
 * Classic script; shares the global AOL namespace. Loads after data.js.
 */
window.AOL = window.AOL || {};
(function (AOL) {
  'use strict';

  var Art = {};
  AOL.Art = Art;

  // --- palettes ------------------------------------------------------------
  var RARITY_BG = {
    common: ['#4a5266', '#252a35'],
    rare: ['#274a70', '#111f31'],
    epic: ['#4d2f73', '#1f1330'],
    legendary: ['#6f5622', '#2a2008'],
  };
  var RARITY_RIM = {
    common: '#9aa4ba',
    rare: '#5aa6ea',
    epic: '#bb86ff',
    legendary: '#ffd24a',
  };
  var FACTION_GLOW = { dawnward: '#ffce54', wildkin: '#5fd06a', duskbound: '#c07bff' };
  var SKIN = ['#f2c9a0', '#e6b184', '#cf9464', '#a9744a', '#f6d7b4', '#d9a578'];
  var HAIR = [
    '#241f27',
    '#5a3720',
    '#c9a445',
    '#a83224',
    '#ddd7d1',
    '#3b2f66',
    '#7a4a2a',
    '#6b1f3a',
  ];
  var CLASS = {
    vanguard: { body: '#8d9ab6', bodyD: '#565f78', head: 'helmet', weapon: 'sword' },
    ranger: { body: '#6f9058', bodyD: '#3d5733', head: 'hood', weapon: 'bow' },
    mystic: { body: '#5c4a95', bodyD: '#312659', head: 'wizard', weapon: 'staff' },
    warden: { body: '#d8cdb4', bodyD: '#9a8d6d', head: 'circlet', weapon: 'wand' },
    artificer: { body: '#b3803f', bodyD: '#6d4b22', head: 'goggles', weapon: 'wrench' },
  };

  // --- small helpers -------------------------------------------------------
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function ell(ctx, cx, cy, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
  }
  function pick(arr, rng) {
    return arr[rng.range(0, arr.length - 1)];
  }
  function shade(hex, amt) {
    // amt in [-1,1]; lighten (+) / darken (-).
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255,
      g = (n >> 8) & 255,
      b = n & 255;
    var t = amt < 0 ? 0 : 255;
    var p = Math.abs(amt);
    r = Math.round((t - r) * p) + r;
    g = Math.round((t - g) * p) + g;
    b = Math.round((t - b) * p) + b;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // --- the portrait --------------------------------------------------------
  function draw(ctx, W, H, hero) {
    var rarity = hero.rarity || 'common';
    var clsKey = hero.cls || 'vanguard';
    var cls = CLASS[clsKey] || CLASS.vanguard;
    var faction = (AOL.heroFaction && AOL.heroFaction(hero)) || 'dawnward';
    var glow = FACTION_GLOW[faction] || '#ffce54';
    var rng = new AOL.Rng(AOL.hashSeed((hero.id || 'x') + clsKey));
    var skin = pick(SKIN, rng);
    var hair = pick(HAIR, rng);
    var bg = RARITY_BG[rarity] || RARITY_BG.common;

    var cx = W / 2;
    var headR = H * 0.205;
    var headCy = H * 0.435;

    // Background gradient.
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, bg[0]);
    g.addColorStop(1, bg[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Faction glow behind the head.
    var rg = ctx.createRadialGradient(cx, headCy, headR * 0.4, cx, headCy, H * 0.6);
    rg.addColorStop(0, hexA(glow, 0.42));
    rg.addColorStop(0.5, hexA(glow, 0.1));
    rg.addColorStop(1, hexA(glow, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    // Light rays.
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = glow;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, headCy);
      ctx.lineTo(cx + i * W * 0.16 - W * 0.05, 0);
      ctx.lineTo(cx + i * W * 0.16 + W * 0.05, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Ground shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ell(ctx, cx, H * 0.94, W * 0.34, H * 0.05);
    ctx.fill();

    // Back weapon (behind the body).
    drawWeapon(ctx, W, H, cx, headCy, cls.weapon, glow, true);

    // Body / shoulders.
    var shoulderY = headCy + headR * 0.62;
    var bodyGrad = ctx.createLinearGradient(cx - W * 0.3, 0, cx + W * 0.3, 0);
    bodyGrad.addColorStop(0, shade(cls.body, -0.28));
    bodyGrad.addColorStop(0.5, cls.body);
    bodyGrad.addColorStop(1, shade(cls.body, -0.12));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.2, shoulderY);
    ctx.quadraticCurveTo(cx - W * 0.36, shoulderY + H * 0.06, cx - W * 0.37, H);
    ctx.lineTo(cx + W * 0.37, H);
    ctx.quadraticCurveTo(cx + W * 0.36, shoulderY + H * 0.06, cx + W * 0.2, shoulderY);
    ctx.closePath();
    ctx.fill();

    // Pauldrons (overlap the shoulder line so they read as armor, not floating).
    ctx.fillStyle = shade(cls.body, 0.12);
    ell(ctx, cx - W * 0.27, shoulderY + H * 0.02, W * 0.12, H * 0.095);
    ctx.fill();
    ell(ctx, cx + W * 0.27, shoulderY + H * 0.02, W * 0.12, H * 0.095);
    ctx.fill();
    // Faction trim on pauldrons + collar.
    ctx.strokeStyle = glow;
    ctx.lineWidth = Math.max(1.5, W * 0.012);
    ctx.globalAlpha = 0.85;
    ell(ctx, cx - W * 0.27, shoulderY + H * 0.02, W * 0.12, H * 0.095);
    ctx.stroke();
    ell(ctx, cx + W * 0.27, shoulderY + H * 0.02, W * 0.12, H * 0.095);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.12, shoulderY + H * 0.02);
    ctx.quadraticCurveTo(cx, shoulderY + H * 0.11, cx + W * 0.12, shoulderY + H * 0.02);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Neck.
    ctx.fillStyle = shade(skin, -0.12);
    rr(ctx, cx - W * 0.06, headCy + headR * 0.35, W * 0.12, H * 0.12, W * 0.03);
    ctx.fill();

    // Head.
    ctx.fillStyle = skin;
    ell(ctx, cx, headCy, headR * 0.92, headR);
    ctx.fill();
    // Cheek shading.
    ctx.fillStyle = hexA(shade(skin, -0.25), 0.5);
    ell(ctx, cx + headR * 0.5, headCy + headR * 0.15, headR * 0.28, headR * 0.34);
    ctx.fill();
    // Blush.
    ctx.fillStyle = hexA('#ff8a8a', 0.18);
    ell(ctx, cx - headR * 0.42, headCy + headR * 0.28, headR * 0.18, headR * 0.12);
    ctx.fill();
    ell(ctx, cx + headR * 0.42, headCy + headR * 0.28, headR * 0.18, headR * 0.12);
    ctx.fill();

    // Face — eyes.
    var eyeY = headCy + headR * 0.12;
    var eyeDx = headR * 0.36;
    ctx.fillStyle = '#20242c';
    ell(ctx, cx - eyeDx, eyeY, headR * 0.11, headR * 0.16);
    ctx.fill();
    ell(ctx, cx + eyeDx, eyeY, headR * 0.11, headR * 0.16);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ell(ctx, cx - eyeDx + headR * 0.04, eyeY - headR * 0.05, headR * 0.035, headR * 0.05);
    ctx.fill();
    ell(ctx, cx + eyeDx + headR * 0.04, eyeY - headR * 0.05, headR * 0.035, headR * 0.05);
    ctx.fill();

    // Hair / headgear per class.
    drawHead(ctx, W, H, cx, headCy, headR, cls.head, hair, cls, glow, faction);

    // Front weapon.
    drawWeapon(ctx, W, H, cx, headCy, cls.weapon, glow, false);

    // Rim light on the left edge.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = glow;
    ctx.lineWidth = Math.max(2, W * 0.02);
    ctx.beginPath();
    ctx.arc(cx, headCy, headR * 0.92, Math.PI * 0.7, Math.PI * 1.25);
    ctx.stroke();
    ctx.restore();

    // Bottom vignette for text legibility on cards.
    var vg = ctx.createLinearGradient(0, H * 0.62, 0, H);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(6,9,16,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
  }

  function drawHead(ctx, W, H, cx, cy, r, kind, hair, cls, glow, faction) {
    if (kind === 'helmet') {
      // Steel helm with nasal guard + faction crest.
      ctx.fillStyle = shade(cls.body, 0.16);
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.06, r * 0.98, Math.PI * 1.02, Math.PI * 1.98, false);
      ctx.lineTo(cx + r * 0.9, cy + r * 0.1);
      ctx.quadraticCurveTo(cx, cy - r * 0.2, cx - r * 0.9, cy + r * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(cls.body, -0.18);
      rr(ctx, cx - r * 0.1, cy - r * 0.2, r * 0.2, r * 0.7, r * 0.08); // nasal
      ctx.fill();
      // Crest.
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r * 1.5);
      ctx.quadraticCurveTo(cx + r * 0.5, cy - r * 1.1, cx, cy - r * 0.9);
      ctx.quadraticCurveTo(cx - r * 0.5, cy - r * 1.1, cx, cy - r * 1.5);
      ctx.fill();
    } else if (kind === 'hood') {
      ctx.fillStyle = shade(cls.body, -0.32);
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.05, cy + r * 0.5);
      ctx.quadraticCurveTo(cx - r * 1.15, cy - r * 1.3, cx, cy - r * 1.25);
      ctx.quadraticCurveTo(cx + r * 1.15, cy - r * 1.3, cx + r * 1.05, cy + r * 0.5);
      ctx.quadraticCurveTo(cx + r * 0.7, cy - r * 0.55, cx, cy - r * 0.6);
      ctx.quadraticCurveTo(cx - r * 0.7, cy - r * 0.55, cx - r * 1.05, cy + r * 0.5);
      ctx.fill();
    } else if (kind === 'wizard') {
      // Hair then a pointed hat.
      hairTop(ctx, cx, cy, r, hair);
      ctx.fillStyle = shade(cls.body, 0.05);
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.05, cy - r * 0.5);
      ctx.quadraticCurveTo(cx - r * 0.2, cy - r * 0.8, cx + r * 0.15, cy - r * 2.05);
      ctx.quadraticCurveTo(cx + r * 0.55, cy - r * 0.75, cx + r * 1.05, cy - r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = glow;
      ell(ctx, cx + r * 0.15, cy - r * 2.0, r * 0.14, r * 0.14);
      ctx.fill();
    } else if (kind === 'circlet') {
      hairTop(ctx, cx, cy, r, hair);
      // Halo.
      ctx.strokeStyle = hexA(glow, 0.85);
      ctx.lineWidth = Math.max(2, r * 0.12);
      ell(ctx, cx, cy - r * 1.35, r * 0.7, r * 0.22);
      ctx.stroke();
      // Circlet band.
      ctx.strokeStyle = '#e9d38a';
      ctx.lineWidth = Math.max(2, r * 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.1, r * 0.9, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.fillStyle = glow;
      ell(ctx, cx, cy - r * 0.82, r * 0.1, r * 0.1);
      ctx.fill();
    } else if (kind === 'goggles') {
      hairTop(ctx, cx, cy, r, hair);
      // Goggles on the forehead.
      ctx.strokeStyle = shade(cls.body, -0.1);
      ctx.lineWidth = Math.max(2, r * 0.09);
      ctx.fillStyle = hexA('#9fd8ff', 0.5);
      ell(ctx, cx - r * 0.38, cy - r * 0.55, r * 0.26, r * 0.22);
      ctx.fill();
      ctx.stroke();
      ell(ctx, cx + r * 0.38, cy - r * 0.55, r * 0.26, r * 0.22);
      ctx.fill();
      ctx.stroke();
    } else {
      hairTop(ctx, cx, cy, r, hair);
    }
  }

  function hairTop(ctx, cx, cy, r, hair) {
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.95, cy + r * 0.05);
    ctx.quadraticCurveTo(cx - r * 1.05, cy - r * 1.1, cx, cy - r * 1.08);
    ctx.quadraticCurveTo(cx + r * 1.05, cy - r * 1.1, cx + r * 0.95, cy + r * 0.05);
    ctx.quadraticCurveTo(cx + r * 0.6, cy - r * 0.5, cx + r * 0.2, cy - r * 0.35);
    ctx.quadraticCurveTo(cx, cy - r * 0.6, cx - r * 0.2, cy - r * 0.35);
    ctx.quadraticCurveTo(cx - r * 0.6, cy - r * 0.5, cx - r * 0.95, cy + r * 0.05);
    ctx.fill();
  }

  function drawWeapon(ctx, W, H, cx, cy, kind, glow, back) {
    var side = back ? -1 : 1;
    ctx.save();
    if (kind === 'sword' && !back) {
      ctx.strokeStyle = '#c9d2e2';
      ctx.lineWidth = W * 0.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + W * 0.3, H * 0.98);
      ctx.lineTo(cx + W * 0.14, cy - H * 0.02);
      ctx.stroke();
      ctx.strokeStyle = glow;
      ctx.lineWidth = W * 0.04;
      ctx.beginPath();
      ctx.moveTo(cx + W * 0.24, H * 0.72);
      ctx.lineTo(cx + W * 0.38, H * 0.72);
      ctx.stroke();
    } else if (kind === 'bow' && back) {
      ctx.strokeStyle = '#8a5a2f';
      ctx.lineWidth = W * 0.035;
      ctx.beginPath();
      ctx.arc(cx - W * 0.34, cy + H * 0.12, H * 0.34, Math.PI * 1.6, Math.PI * 2.4);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = W * 0.008;
      ctx.beginPath();
      ctx.moveTo(cx - W * 0.14, cy - H * 0.12);
      ctx.lineTo(cx - W * 0.14, cy + H * 0.36);
      ctx.stroke();
    } else if ((kind === 'staff' || kind === 'wand') && back) {
      ctx.strokeStyle = '#8a6a3f';
      ctx.lineWidth = W * (kind === 'wand' ? 0.03 : 0.045);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + W * 0.3, H * 0.98);
      ctx.lineTo(cx + W * 0.24, cy - H * 0.18);
      ctx.stroke();
      var og = ctx.createRadialGradient(
        cx + W * 0.24,
        cy - H * 0.2,
        0,
        cx + W * 0.24,
        cy - H * 0.2,
        W * 0.12,
      );
      og.addColorStop(0, '#ffffff');
      og.addColorStop(0.4, glow);
      og.addColorStop(1, hexA(glow, 0));
      ctx.fillStyle = og;
      ell(ctx, cx + W * 0.24, cy - H * 0.2, W * 0.12, W * 0.12);
      ctx.fill();
    } else if (kind === 'wrench' && !back) {
      ctx.strokeStyle = '#c4a24a';
      ctx.lineWidth = W * 0.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + W * 0.3, H * 0.96);
      ctx.lineTo(cx + W * 0.2, cy + H * 0.02);
      ctx.stroke();
      ctx.fillStyle = '#c4a24a';
      ell(ctx, cx + W * 0.19, cy - H * 0.0, W * 0.06, W * 0.06);
      ctx.fill();
    }
    ctx.restore();
    void side;
  }

  function hexA(hex, a) {
    if (hex[0] !== '#') return hex;
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  // --- public API: cached data URL ----------------------------------------
  var cache = {};
  Art.RIM = RARITY_RIM;
  Art.rimColor = function (rarity) {
    return RARITY_RIM[rarity] || RARITY_RIM.common;
  };
  Art.heroPortraitURL = function (hero, size) {
    size = size || 200;
    var key = (hero.id || 'x') + '@' + size;
    if (cache[key]) return cache[key];
    try {
      if (typeof document === 'undefined' || !document.createElement) return null;
      var c = document.createElement('canvas');
      if (!c || typeof c.getContext !== 'function') return null;
      var scale = 2;
      c.width = size * scale;
      c.height = Math.round(size * 1.15 * scale);
      var ctx = c.getContext('2d');
      if (!ctx || typeof c.toDataURL !== 'function') return null;
      ctx.scale(scale, scale);
      draw(ctx, size, size * 1.15, hero);
      var url = c.toDataURL('image/png');
      cache[key] = url;
      return url;
    } catch (e) {
      return null;
    }
  };
  // Draw directly onto an existing canvas context (for the battle scene).
  Art.drawInto = function (ctx, x, y, w, h, hero) {
    ctx.save();
    ctx.translate(x, y);
    try {
      draw(ctx, w, h, hero);
    } catch (e) {}
    ctx.restore();
  };
})(window.AOL);
