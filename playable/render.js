/*
 * Age of Legends — playable prototype: isometric kingdom renderer.
 *
 * Draws a charming top-down/isometric settlement on a canvas using only
 * procedural shapes and emoji glyphs (no external art). Handles panning,
 * building picking and per-building badges/timers.
 */
window.AOL = window.AOL || {};
(function (AOL) {
  'use strict';

  var K = {};
  AOL.Kingdom = K;

  var canvas,
    ctx,
    dpr = 1;
  var cw = 0,
    ch = 0;
  var tileW = 88,
    tileH = 44;
  var originX = 0,
    originY = 0;
  var panX = 0,
    panY = 0;
  var time = 0;
  var getState, onPick;
  var hoverType = null;

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
    var rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    cw = rect.width;
    ch = rect.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    tileW = Math.max(56, Math.min(104, Math.floor(cw / (AOL.GRID + 1.5))));
    tileH = Math.round(tileW / 2);
    originX = cw / 2;
    originY = (ch - AOL.GRID * tileH) / 2 + tileH * 1.4;
  };

  function toScreen(col, row) {
    return {
      x: originX + panX + (col - row) * (tileW / 2),
      y: originY + panY + (col + row) * (tileH / 2),
    };
  }
  function toTile(px, py) {
    var dx = px - (originX + panX);
    var dy = py - (originY + panY);
    var col = (dx / (tileW / 2) + dy / (tileH / 2)) / 2;
    var row = (dy / (tileH / 2) - dx / (tileW / 2)) / 2;
    return { col: Math.round(col), row: Math.round(row) };
  }

  function tileShade(col, row) {
    var h = (Math.imul(col + 7, 374761393) ^ Math.imul(row + 3, 668265263)) >>> 0;
    return (h % 100) / 100;
  }

  // --- Drawing primitives --------------------------------------------------
  function groundTile(col, row) {
    var p = toScreen(col, row);
    var v = tileShade(col, row);
    var g1 = '#2f5a34',
      g2 = '#274d2c';
    // Slight variation and a "road" ring around the castle centre.
    var isPath = Math.abs(col - 3) + Math.abs(row - 3) === 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - tileH / 2);
    ctx.lineTo(p.x + tileW / 2, p.y);
    ctx.lineTo(p.x, p.y + tileH / 2);
    ctx.lineTo(p.x - tileW / 2, p.y);
    ctx.closePath();
    if (isPath) {
      ctx.fillStyle = '#6b5b3a';
    } else {
      ctx.fillStyle = v > 0.5 ? g1 : g2;
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function isoBox(cx, cy, hw, hh, height, topColor, leftColor, rightColor) {
    // Ground corners
    var A = { x: cx, y: cy - hh }; // back
    var B = { x: cx + hw, y: cy }; // right
    var C = { x: cx, y: cy + hh }; // front
    var D = { x: cx - hw, y: cy }; // left
    // Left wall
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(D.x, D.y);
    ctx.lineTo(C.x, C.y);
    ctx.lineTo(C.x, C.y - height);
    ctx.lineTo(D.x, D.y - height);
    ctx.closePath();
    ctx.fill();
    // Right wall
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(C.x, C.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(B.x, B.y - height);
    ctx.lineTo(C.x, C.y - height);
    ctx.closePath();
    ctx.fill();
    // Top
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y - height);
    ctx.lineTo(B.x, B.y - height);
    ctx.lineTo(C.x, C.y - height);
    ctx.lineTo(D.x, D.y - height);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function shadow(cx, cy, r) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBuilding(b, def, selected) {
    var p = toScreen(b.col, b.row);
    var bob = Math.sin(time / 600 + b.col * 1.3 + b.row) * 1.5;
    var cy = p.y - bob;
    var hw = tileW * 0.3,
      hh = tileH * 0.3;
    var plinth = Math.max(10, tileH * 0.36);

    shadow(p.x, p.y + tileH * 0.28, tileW * 0.34);

    // Selection glow diamond on the ground.
    if (selected) {
      ctx.save();
      ctx.strokeStyle = '#f0c419';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f0c419';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - tileH / 2);
      ctx.lineTo(p.x + tileW / 2, p.y);
      ctx.lineTo(p.x, p.y + tileH / 2);
      ctx.lineTo(p.x - tileW / 2, p.y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Stone/earth plinth beneath the building art.
    isoBox(
      p.x,
      cy,
      hw,
      hh,
      plinth,
      shade(def.wall, 1.05),
      shade(def.wall, 0.72),
      shade(def.wall, 0.88),
    );

    // Building art (emoji) sitting on the plinth.
    var size = tileW * 0.72;
    ctx.font = size + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(def.emoji, p.x, cy - plinth + size * 0.28);

    // Level badge.
    var badgeW = 40,
      badgeH = 16;
    var bx = p.x - badgeW / 2,
      by = p.y + tileH * 0.3;
    ctx.fillStyle = 'rgba(6,10,20,0.9)';
    roundRect(bx, by, badgeW, badgeH, 8);
    ctx.fill();
    ctx.strokeStyle = def.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = def.accent;
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('Lv ' + b.level, p.x, by + badgeH / 2 + 0.5);

    // Under-construction indicator.
    if (b.upgradeEndsAt && b.upgradeEndsAt > Date.now()) {
      var total = b.upgradeTotalMs || 1;
      var prog = 1 - Math.max(0, b.upgradeEndsAt - Date.now()) / total;
      ctx.font = tileW * 0.34 + 'px serif';
      ctx.fillText('🔨', p.x, cy - plinth - size * 0.15);
      // progress arc
      ctx.strokeStyle = '#f0c419';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, by - 20, 12, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawDecor(d) {
    var p = toScreen(d.col, d.row);
    shadow(p.x, p.y + 6, tileW * 0.18);
    ctx.font = tileW * 0.5 + 'px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(d.emoji, p.x, p.y + tileH * 0.1);
  }

  function shade(hex, f) {
    var c = parseInt(hex.slice(1), 16);
    var r = Math.min(255, Math.round(((c >> 16) & 255) * f));
    var g = Math.min(255, Math.round(((c >> 8) & 255) * f));
    var b = Math.min(255, Math.round((c & 255) * f));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // --- Main render ---------------------------------------------------------
  K.render = function (dtMs) {
    time += dtMs;
    var state = getState();
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cw, ch);

    // Sky / ambient gradient with a gentle day-night shift.
    var night = Math.max(0, Math.sin((state.clock / 120) * Math.PI * 2) * -1);
    var sky = ctx.createLinearGradient(0, 0, 0, ch);
    sky.addColorStop(0, night > 0.4 ? '#0d1430' : '#20335a');
    sky.addColorStop(1, '#0a1020');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cw, ch);

    // Ground.
    for (var s = 0; s <= 2 * (AOL.GRID - 1); s++) {
      for (var col = 0; col < AOL.GRID; col++) {
        var row = s - col;
        if (row < 0 || row >= AOL.GRID) continue;
        groundTile(col, row);
      }
    }

    // Objects sorted back-to-front by depth (col+row).
    var objs = [];
    AOL.LAYOUT.forEach(function (item) {
      var b = state.buildings[item.type];
      if (b)
        objs.push({
          depth: item.col + item.row,
          kind: 'b',
          b: b,
          def: AOL.BUILDINGS[item.type],
          type: item.type,
        });
    });
    AOL.DECOR.forEach(function (d) {
      objs.push({ depth: d.col + d.row + 0.1, kind: 'd', d: d });
    });
    objs.sort(function (a, b) {
      return a.depth - b.depth;
    });
    objs.forEach(function (o) {
      if (o.kind === 'b') drawBuilding(o.b, o.def, hoverType === o.type);
      else drawDecor(o.d);
    });

    // Night overlay for mood.
    if (night > 0) {
      ctx.fillStyle = 'rgba(8,12,34,' + night * 0.38 + ')';
      ctx.fillRect(0, 0, cw, ch);
    }
    ctx.restore();
  };

  // --- Input ---------------------------------------------------------------
  function attachInput() {
    var dragging = false,
      moved = false,
      lastX = 0,
      lastY = 0;
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
      // Hover highlight
      var t = toTile(px, py);
      hoverType = buildingAt(t.col, t.row);
      if (dragging) {
        var ddx = e.clientX - lastX,
          ddy = e.clientY - lastY;
        if (Math.abs(ddx) + Math.abs(ddy) > 4) moved = true;
        panX += ddx;
        panY += ddy;
        lastX = e.clientX;
        lastY = e.clientY;
        clampPan();
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
  }

  function clampPan() {
    var lim = tileW * AOL.GRID * 0.5;
    panX = Math.max(-lim, Math.min(lim, panX));
    panY = Math.max(-lim, Math.min(lim, panY));
  }

  function buildingAt(col, row) {
    for (var i = 0; i < AOL.LAYOUT.length; i++) {
      if (AOL.LAYOUT[i].col === col && AOL.LAYOUT[i].row === row) return AOL.LAYOUT[i].type;
    }
    return null;
  }
})(window.AOL);
