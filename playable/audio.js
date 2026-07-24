/*
 * Age of Legends — playable prototype: synthesized audio.
 *
 * All sound is generated at runtime with the Web Audio API — no asset files,
 * so it stays self-contained and buildless. Exposes `AOL.Audio` with sfx,
 * a light battle music loop and a persisted mute toggle. Everything degrades
 * silently when Web Audio is unavailable (e.g. headless).
 */
window.AOL = window.AOL || {};
(function (AOL) {
  'use strict';

  var MUTE_KEY = 'aol-muted';
  var ctx = null;
  var master = null;
  var muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {
    muted = false;
  }
  var music = null; // { gain, timer, nodes }
  var lastHit = 0;

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.6;
      master.connect(ctx.destination);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // --- primitive voices ----------------------------------------------------
  function tone(opt) {
    // opt: { freq, type, t0, dur, vol, to, dest }
    var t0 = opt.t0 != null ? opt.t0 : ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = opt.type || 'sine';
    osc.frequency.setValueAtTime(opt.freq, t0);
    if (opt.to) osc.frequency.exponentialRampToValueAtTime(opt.to, t0 + opt.dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opt.vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opt.dur);
    osc.connect(g);
    g.connect(opt.dest || master);
    osc.start(t0);
    osc.stop(t0 + opt.dur + 0.02);
  }

  function noise(opt) {
    // opt: { t0, dur, vol, freq, q, type, sweepTo }
    var t0 = opt.t0 != null ? opt.t0 : ctx.currentTime;
    var len = Math.max(1, Math.floor(ctx.sampleRate * opt.dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var filt = ctx.createBiquadFilter();
    filt.type = opt.type || 'bandpass';
    filt.frequency.setValueAtTime(opt.freq || 1200, t0);
    if (opt.sweepTo) filt.frequency.exponentialRampToValueAtTime(opt.sweepTo, t0 + opt.dur);
    filt.Q.value = opt.q || 1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(opt.vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opt.dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + opt.dur + 0.02);
  }

  // --- sfx bank ------------------------------------------------------------
  function sfx(name) {
    if (!ensure() || muted) return;
    resume();
    var t = ctx.currentTime;
    switch (name) {
      case 'hit': {
        if (t - lastHit < 0.04) return; // throttle at high speeds
        lastHit = t;
        noise({ t0: t, dur: 0.09, vol: 0.18, freq: 1400, q: 0.7 });
        tone({ freq: 180, to: 90, type: 'triangle', t0: t, dur: 0.1, vol: 0.16 });
        break;
      }
      case 'crit':
        noise({ t0: t, dur: 0.14, vol: 0.26, freq: 2200, sweepTo: 600, q: 0.8 });
        tone({ freq: 320, to: 120, type: 'sawtooth', t0: t, dur: 0.16, vol: 0.2 });
        break;
      case 'arrow':
        noise({ t0: t, dur: 0.16, vol: 0.14, freq: 2600, sweepTo: 700, q: 2 });
        break;
      case 'magic':
        tone({ freq: 420, to: 900, type: 'sine', t0: t, dur: 0.22, vol: 0.16 });
        tone({ freq: 630, to: 1350, type: 'sine', t0: t + 0.02, dur: 0.2, vol: 0.1 });
        break;
      case 'heal':
        tone({ freq: 523, type: 'sine', t0: t, dur: 0.3, vol: 0.14 });
        tone({ freq: 659, type: 'sine', t0: t + 0.06, dur: 0.3, vol: 0.12 });
        tone({ freq: 784, type: 'sine', t0: t + 0.12, dur: 0.3, vol: 0.12 });
        break;
      case 'ultimate':
        tone({ freq: 130, to: 260, type: 'sawtooth', t0: t, dur: 0.5, vol: 0.22 });
        tone({ freq: 196, type: 'square', t0: t, dur: 0.4, vol: 0.1 });
        noise({ t0: t, dur: 0.45, vol: 0.16, freq: 400, sweepTo: 2400, q: 0.6 });
        break;
      case 'boom':
        noise({ t0: t, dur: 0.5, vol: 0.32, freq: 220, sweepTo: 60, type: 'lowpass', q: 0.5 });
        tone({ freq: 90, to: 40, type: 'sine', t0: t, dur: 0.5, vol: 0.24 });
        break;
      case 'victory':
        [523, 659, 784, 1047].forEach(function (f, i) {
          tone({ freq: f, type: 'triangle', t0: t + i * 0.12, dur: 0.5, vol: 0.18 });
        });
        break;
      case 'defeat':
        [392, 330, 262, 196].forEach(function (f, i) {
          tone({ freq: f, type: 'sine', t0: t + i * 0.14, dur: 0.5, vol: 0.16 });
        });
        break;
      case 'click':
        tone({ freq: 660, type: 'square', t0: t, dur: 0.05, vol: 0.08 });
        break;
    }
  }

  // --- light battle music loop --------------------------------------------
  var SCALE = [220, 262, 294, 330, 392, 440, 523]; // A minor-ish pentatonic pad
  function startMusic() {
    if (!ensure() || muted || music) return;
    resume();
    var g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 1.2);
    g.connect(master);
    // drifting pad
    var padA = ctx.createOscillator();
    var padB = ctx.createOscillator();
    padA.type = 'sine';
    padB.type = 'sine';
    padA.frequency.value = 110;
    padB.frequency.value = 110 * 1.5;
    var padGain = ctx.createGain();
    padGain.gain.value = 0.08;
    padA.connect(padGain);
    padB.connect(padGain);
    padGain.connect(g);
    padA.start();
    padB.start();
    // arpeggio scheduler
    var step = 0;
    var timer = setInterval(function () {
      if (!ctx || muted) return;
      var f = SCALE[step % SCALE.length] * (step % 14 < 7 ? 1 : 1.5);
      tone({ freq: f, type: 'triangle', t0: ctx.currentTime, dur: 0.35, vol: 0.05, dest: g });
      step++;
    }, 340);
    music = { gain: g, timer: timer, nodes: [padA, padB] };
  }

  function stopMusic() {
    if (!music) return;
    clearInterval(music.timer);
    try {
      music.gain.gain.cancelScheduledValues(ctx.currentTime);
      music.gain.gain.setValueAtTime(music.gain.gain.value, ctx.currentTime);
      music.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      music.nodes.forEach(function (n) {
        n.stop(ctx.currentTime + 0.45);
      });
    } catch (e) {
      /* ignore */
    }
    music = null;
  }

  function toggleMute() {
    muted = !muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch (e) {
      /* ignore */
    }
    if (master) master.gain.value = muted ? 0 : 0.6;
    if (muted) stopMusic();
    return muted;
  }

  AOL.Audio = {
    sfx: sfx,
    startMusic: startMusic,
    stopMusic: stopMusic,
    toggleMute: toggleMute,
    isMuted: function () {
      return muted;
    },
    resume: resume,
  };
})(window.AOL);
