'use strict';

// ---------- Tuning ----------
const CONFIG = {
  W: 180,
  H: 320,
  maxDt: 0.05,            // delta-time clamp (s)
  maxExtra: 160,          // on tall phones the canvas grows up to this many px taller than H (more snow below the fort)
  throwCooldown: 0.5,     // s
  snowballSpeed: 220,     // px/s
  snowballRadius: 3,
  minPull: 10,            // px; shorter pull cancels the throw
  minAngle: 10,           // degrees above horizontal
  maxAngle: 170,
  aimDots: 5,
  aimDotSpacing: 8,       // 5 dots -> last dot 40 px from the hand
  aimDotSize: 2,
  kidX: 86,               // solo: the kid's top-left corner
  kidY: 275,
  coopKidXs: [79, 93],    // co-op: two boys side by side behind the fort (top-left x of each)
  coopKidY: 279,
  handDX: 11,             // where throws and the aim line start, relative to the kid's top-left
  handDY: 7,
  shoulderDX: 7,
  shoulderDY: 10,
  armPull: 2,             // px the arm draws back while aiming
  armSwingTime: 0.18,     // s
  armSwingReach: 3,       // px the arm pushes forward on release
  ringRadius: 4,
  ringSteps: 16,
  // Fort: a half-circle wall in front of the kid, open at the back (bottom)
  fortCX: 90,             // centre of the half circle (the kid stands here)
  fortCY: 284,            // its flat (open) side sits at this y
  fortOuter: 18,          // outer radius (bullies stop when they touch it)
  fortInner: 10,          // inner radius (wall is 8 px thick)
  shadowOffX: 3,          // top-down cast shadow of the fort and kid: offset from the object (light from upper left)
  shadowOffY: 3,
  shadowAlpha: 0.28,
  // Trees: wave N shows N-1 of them (none in wave 1), in this order, up to treeMax
  treePositions: [[88, 120], [30, 205], [135, 200], [10, 150], [150, 140]],   // top-left of each 8x15 sprite
  treeMax: 5,
  treeRadius: 5,          // snowballs stop in this circle, centred 4 px right and 9 px down from the sprite's top-left
  treeBaseRadius: 4,      // bullies collide with the trunk base instead (centred 4 px right, treeBaseY down),
  treeBaseY: 13,          // so they can walk up behind the foliage and then have to go around
  treeLookahead: 36,      // px ahead that bullies look for a tree to walk around
  // Power-ups: a floating snowflake; a snowball that hits it grants a random effect
  powerFirstDelay: 10,    // s of play before the first one
  powerMinGap: 14,        // s between one disappearing and the next appearing (random in this range)
  powerMaxGap: 26,
  powerLife: 8,           // s it floats before vanishing
  powerRadius: 7,         // hit circle
  powerMinY: 45,          // it appears in this band, below the HUD and above the fort
  powerMaxY: 185,
  gunTime: 5,             // s of machine-gun snowballs
  gunInterval: 0.12,      // s between machine-gun shots
  treeReturnTime: 6,      // s between each removed tree growing back
  avalancheSpeed: 170,    // px/s the avalanche front sweeps down the screen
  avalancheBand: 34,      // px thickness of the snow mass behind its front
  // Co-op (WebRTC through PeerJS: the host runs the game, the guest sends aim/throws and draws snapshots)
  netPrefix: 'snowball-coop-',                // peer id = prefix + the 4-letter code
  codeLetters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',  // the full alphabet, for both generating and typing codes
  codeLength: 4,
  netInterval: 0.05,      // s between host snapshots (20 per second)
  netTimeout: 6,          // s without any message before the link counts as lost
  netConnectTimeout: 12,  // s a join attempt may take
  flakes: 30,
  flakeSpeedMin: 12,
  flakeSpeedMax: 26,

  // Bullies
  bullyMargin: 8,         // keep spawn columns this far from the side edges
  regularSpeed: 14,       // px/s at wave 1; every type's speed is a multiple of this
  hitFlashTime: 0.12,     // s white flash when a Big Kid (or Yeti) survives a hit
  yetiEvery: 5,           // Yetis per wave: 1 from the Yeti's first wave, +1 every this many waves, up to yetiMax
  yetiMax: 3,
  footstepGap: 6,         // px walked between footprints (they alternate left / right)
  footstepLife: 3,        // s a footprint takes to fade into the snow
  footstepAlpha: 0.5,     // starting opacity
  turnY: 200,             // bullies walk straight down until this y, then turn toward the kid
  turnRate: 3,            // rad/s they can turn at
  turnSwayFade: 40,       // px of travel past turnY over which the Sled Kid's sway fades out
  bullyTypes: {
    // speedMul: x Regular speed | hp: hits to drop | radius: hit circle | halfH: half sprite height
    // (fort reached when the feet touch the fort arc) | from: first wave | weight/weightPer/weightMax: spawn odds
    // (maxes stay below Regular's weight so Regular is always the most common type)
    regular: { speedMul: 1,   hp: 1, points: 10, fortDamage: 1, radius: 6, halfH: 7, from: 1, weight: 10, weightPer: 0,   weightMax: 10 },
    runner:  { speedMul: 2,   hp: 1, points: 20, fortDamage: 1, radius: 5, halfH: 6, from: 3, weight: 3,  weightPer: 0.5, weightMax: 7 },
    big:     { speedMul: 0.6, hp: 2, points: 30, fortDamage: 2, radius: 8, halfH: 8, from: 5, weight: 2,  weightPer: 0.5, weightMax: 6 },
    sled:    { speedMul: 1.8, hp: 1, points: 25, fortDamage: 1, radius: 7, halfH: 6, from: 8, weight: 2,  weightPer: 0.5, weightMax: 5,
               swayAmp: 16, swayFreq: 0.35 }, // px and Hz of the side-to-side drift
    // Yeti: not part of the random mix (special); a fixed number of them is slipped into each wave from wave 11
    yeti:    { speedMul: 0.7, hp: 5, points: 100, fortDamage: 4, radius: 10, halfH: 10, from: 11, weight: 0, weightPer: 0, weightMax: 0, special: true },
  },
  fallTime: 0.4,          // s flat on its back
  fadeTime: 0.3,          // s fade-out after the fall
  // Waves
  waveBase: 5,            // bullies in wave N = waveBase + wavePerN * N (max waveMax)
  wavePerN: 2,
  waveMax: 40,
  speedGrowth: 0.04,      // compounding per wave
  speedCap: 2.5,          // max multiple of the starting speed
  gapStart: 1.2,          // s between spawns at wave 1
  gapMin: 0.35,           // s between spawns, the floor
  gapDecay: 0.9,          // gap = gapMin + (gapStart - gapMin) * gapDecay^(wave-1)
  firstSpawnDelay: 1.0,   // s after a wave starts before the first bully
  waveBreak: 3,           // s after the wave is cleared
  waveBonus: 50,
  bannerTime: 1.6,        // s the "Wave N" banner shows
  // Fort
  fortHealth: 10,
  fortFlashTime: 0.25,
  // Hit puff
  puffCount: 8,
  puffLife: 0.4,
  puffSpeed: 40,
  puffGravity: 60,
  // UI
  btnMinPx: 44,           // minimum on-screen button height in CSS px
  btnMinInternal: 24,     // minimum button height in internal px
  storageKey: 'snowball_highscore',
  coopStorageKey: 'snowball_coop_highscore',   // co-op has its own best score
  storyKey: 'snowball_story',                   // highest Story level unlocked
  storyLevels: 10,        // Story campaign: each level is one wave (pass or fail); level n uses wave 2n-1's difficulty
  progressKey: 'snowball_progress',             // { level, xp } saved on this device
  // Levels: every game's score is added to the bar; a full bar levels you up and the bar restarts (leftover score carries over).
  levelNames: ['NEWBORN', 'SNOW TODDLER', 'FLAKE FIGHTER', 'SNOWBALL ROOKIE', 'FROST THROWER', 'ICE SLINGER',
               'BLIZZARD BOSS', 'FROST CAPTAIN', 'SNOW HERO', 'SNOW LEGEND', 'ICE WARDEN', 'WINTER KNIGHT', 'FROST BARON',
               'BLIZZARD BUFF', 'SNOW SAGE', 'GLACIER KING', 'ARCTIC TITAN', 'FROZEN EMPEROR', 'STORM OF SNOW', 'SNOWBALLY LEGEND'],
  levelCosts: [1000, 1600, 2400, 3400, 4600, 6000, 7600, 9400, 11400, 13600, 16000, 18600, 21400, 24400, 27600, 31000, 34600, 38400, 42400],   // score needed to leave level 1..19
  levelBarSeconds: 1.4,   // how long a full bar takes to fill on the menu
  confettiCount: 130,
  mutedKey: 'snowball_muted',
  sfxVolume: 0.3,         // master volume (0-1); sounds are short and quiet on purpose
};

const COLORS = {
  snow: '#f4f8ff', ice: '#bfe3ff', shadow: '#7aa5d6', night: '#1c2b4a',
  coatBlue: '#3b6fd9', skin: '#f2c9a0', brown: '#8a5a33', black: '#111',
  gold: '#ffd23f', hatGreen: '#3fa34d',
  orange: '#f28c28', // scarf (simplest addition to the palette)
  red: '#d93b3b',
};

// ---------- Canvas setup ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// scale = CSS px per internal px (keeps buttons >= 44 px); h = internal canvas height (>= H, taller on tall phones);
// safeTop / safeBottom = notch and home-bar insets in internal px; ty = y offset of whatever is being drawn (for tap tests)
const view = { scale: 1, h: CONFIG.H, safeTop: 0, safeBottom: 0, ty: 0 };
function fitCanvas() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const cs = getComputedStyle(document.getElementById('safe'));
  const sl = parseFloat(cs.paddingLeft) || 0, sr = parseFloat(cs.paddingRight) || 0;
  const st = parseFloat(cs.paddingTop) || 0, sb = parseFloat(cs.paddingBottom) || 0;
  // Full screen: fit the width, then make the canvas as tall as the screen so there are no bars at the top or bottom.
  // The extra height is just more snow below the fort; the HUD and menus are pushed in by the safe-area insets.
  const aw = vw - sl - sr;
  const s = Math.min(aw / CONFIG.W, vh / CONFIG.H);
  view.scale = s;
  const h = Math.min(CONFIG.H + CONFIG.maxExtra, Math.max(CONFIG.H, Math.ceil(vh / s)));
  if (canvas.height !== h) { canvas.height = h; ctx.imageSmoothingEnabled = false; }   // resizing resets the context
  view.h = h; view.safeTop = st / s; view.safeBottom = sb / s;
  const w = CONFIG.W * s;
  canvas.style.width = w + 'px';
  canvas.style.height = h * s + 'px';
  canvas.style.left = sl + (aw - w) / 2 + 'px';
  canvas.style.top = '0px';
}
window.addEventListener('resize', fitCanvas);
window.addEventListener('orientationchange', fitCanvas);
fitCanvas();

// Block zoom / context menu / selection gestures
['gesturestart', 'gesturechange', 'gestureend', 'contextmenu', 'selectstart', 'dragstart']
  .forEach(ev => document.addEventListener(ev, e => e.preventDefault()));
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', e => e.preventDefault());

// ---------- Helpers ----------
const rect = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
const DEG = Math.PI / 180;

// Tiny seeded RNG so the static background is the same every load
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

function pixLine(x0, y0, x1, y1, c) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    rect(c, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 1, 1);
  }
}

// Storage (try/catch: private mode or blocked storage must not break the game)
function loadBest(key) {
  try { return parseInt(localStorage.getItem(key || CONFIG.storageKey), 10) || 0; } catch (e) { return 0; }
}
const MAX_LEVEL = CONFIG.levelNames.length;
const levelCost = lv => CONFIG.levelCosts[lv - 1];
function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(CONFIG.progressKey));
    const level = Math.floor(p.level), xp = Math.floor(p.xp);
    if (level >= 1 && level <= MAX_LEVEL && xp >= 0) return { level, xp: level >= MAX_LEVEL ? 0 : Math.min(xp, levelCost(level) - 1) };
  } catch (e) { /* fall through */ }
  return { level: 1, xp: 0 };
}
function saveProgress(p) {
  try { localStorage.setItem(CONFIG.progressKey, JSON.stringify(p)); } catch (e) { /* ignore */ }
}

function loadStory() { return Math.max(1, Math.min(CONFIG.storyLevels, loadBest(CONFIG.storyKey))); }

function saveBest(v, key) {
  try { localStorage.setItem(key || CONFIG.storageKey, String(v)); } catch (e) { /* ignore */ }
}

// ---------- Players / co-op state ----------
// role: 'solo' | 'host' | 'guest' (set once connected). The host is slot 0 and runs the whole game; the guest is slot 1.
const net = { role: 'solo', status: 'idle', error: '', code: '', peer: null, conn: null,
              localSlot: 0, lastRx: 0, acc: 0, evq: [], lost: false };
const isCoop = () => net.role !== 'solo';
const slots = () => (isCoop() ? [0, 1] : [0]);
const pl = slot => (slot === net.localSlot ? state : state.remote);   // the local player's fields live on state itself
const freshRemote = () => ({ aimAngle: 90, aimValid: false, aiming: false, cooldown: 0, swing: 0, gun: 0, gunTimer: 0 });
function kidPos(slot) {
  return isCoop() ? { x: CONFIG.coopKidXs[slot], y: CONFIG.coopKidY } : { x: CONFIG.kidX, y: CONFIG.kidY };
}
function handPos(slot) {
  const k = kidPos(slot);
  return { x: k.x + CONFIG.handDX, y: k.y + CONFIG.handDY };
}
const KID_COLORS = [
  { hat: COLORS.coatBlue, scarf: COLORS.orange, coat: COLORS.coatBlue },   // boy 1: blue hat, orange scarf
  { hat: COLORS.gold, scarf: COLORS.hatGreen, coat: '#e6b92e' },           // boy 2: gold hat, green scarf
];

// ---------- Audio (Web Audio, no files; context is created on the first tap) ----------
const audio = { ctx: null, master: null, noise: null, muted: false };
try { audio.muted = localStorage.getItem(CONFIG.mutedKey) === '1'; } catch (e) { /* ignore */ }
function saveMuted() {
  try { localStorage.setItem(CONFIG.mutedKey, audio.muted ? '1' : '0'); } catch (e) { /* ignore */ }
}
function toggleMute() { audio.muted = !audio.muted; saveMuted(); }

function initAudio() {
  try {
    if (!audio.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = new AC();
      audio.master = c.createGain();
      audio.master.gain.value = CONFIG.sfxVolume;
      audio.master.connect(c.destination);
      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);   // 1 s of white noise
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      audio.noise = buf;
      audio.ctx = c;
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
  } catch (e) { audio.ctx = null; }
}

function tone(type, f0, f1, dur, vol, delay) {
  const c = audio.ctx, t = c.currentTime + (delay || 0);
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(audio.master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(filter, f0, f1, dur, vol, delay) {
  const c = audio.ctx, t = c.currentTime + (delay || 0);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = audio.noise;
  f.type = filter;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(audio.master);
  s.start(t); s.stop(t + dur + 0.02);
}

const SFX = {
  throw: () => noise('bandpass', 700, 2600, 0.14, 0.5),
  hit:   () => { tone('sine', 180, 60, 0.12, 0.8); noise('lowpass', 900, 300, 0.06, 0.3); },
  clank: () => { tone('square', 880, 840, 0.09, 0.25); tone('square', 1320, 1250, 0.09, 0.15); },
  fort:  () => { noise('lowpass', 1400, 250, 0.22, 0.9); tone('sawtooth', 100, 45, 0.15, 0.4); },
  wave:  () => { tone('sine', 660, 660, 0.2, 0.4); tone('sine', 880, 880, 0.3, 0.4, 0.1); },
  over:  () => { tone('square', 330, 300, 0.2, 0.3); tone('square', 247, 120, 0.45, 0.3, 0.22); },
  tree:  () => { noise('lowpass', 800, 300, 0.08, 0.3); tone('sine', 140, 80, 0.08, 0.35); },
  power: () => { tone('sine', 880, 880, 0.1, 0.3); tone('sine', 1175, 1175, 0.1, 0.3, 0.07); tone('sine', 1568, 1568, 0.22, 0.3, 0.14); },
  avalanche: () => { noise('lowpass', 500, 120, 1.5, 0.7); tone('sine', 80, 38, 1.3, 0.5); },
  fanfare: () => {                       // level-up jingle
    [[523, 0], [659, 0.12], [784, 0.24]].forEach(([f, d]) => tone('square', f, f, 0.1, 0.22, d));
    tone('square', 1047, 1047, 0.3, 0.25, 0.36);
    [[784, 0.72], [1047, 0.84]].forEach(([f, d]) => tone('square', f, f, 0.1, 0.22, d));
    tone('square', 1319, 1319, 0.6, 0.25, 0.96);
    [[262, 0.36, 0.6], [330, 0.36, 0.6], [392, 0.36, 0.6], [262, 0.96, 0.8], [330, 0.96, 0.8], [392, 0.96, 0.8]]
      .forEach(([f, d, l]) => tone('triangle', f, f, l, 0.2, d));
  },
  legend: () => {                        // the big one: reaching the last level
    SFX.fanfare();
    [1047, 1319, 1568, 2093].forEach((f, i) => tone('square', f, f, 0.12, 0.2, 1.7 + i * 0.12));
    tone('square', 2093, 2093, 0.9, 0.25, 2.2);
    [262, 330, 392, 523].forEach(f => tone('triangle', f, f, 1.0, 0.2, 2.2));
  },
  click: () => tone('square', 1000, 900, 0.03, 0.2),
};
function sfx(name, noForward) {
  if (net.role === 'host' && !noForward && name !== 'click') net.evq.push({ e: 's', n: name });   // the guest hears it too
  if (!audio.ctx || audio.muted) return;
  try { SFX[name](); } catch (e) { /* ignore */ }
}

// 3x5 pixel font: 15 chars per glyph, row by row, '1' = pixel
const FONT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
  E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '111101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010',
  8: '111101111101111', 9: '111101111001110',
  ':': '000010000010000', '!': '010010010000010', '-': '000000111000000',
  '.': '000000000000010', '_': '000000000000111', '(': '001010010010001', ')': '100010010010100',
};

function drawText(str, x, y, s, color, align, gap) {
  str = String(str).toUpperCase();
  const g = gap === undefined ? s : gap, adv = 3 * s + g, w = str.length * adv - g;   // gap = pixels between letters
  let cx = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  ctx.fillStyle = color;
  for (const ch of str) {
    const g = FONT[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] === '1') ctx.fillRect(cx + (i % 3) * s, y + Math.floor(i / 3) * s, s, s);
      }
    }
    cx += adv;
  }
}

// Text with a night-blue drop shadow so it reads on any background
// Bigger, clearer 5x7 letters for the co-op code and the join keyboard (the 3x5 font is too cramped to read at a glance)
const FONT5 = {};
'A 01110,10001,10001,11111,10001,10001,10001|B 11110,10001,10001,11110,10001,10001,11110|C 01110,10001,10000,10000,10000,10001,01110|D 11110,10001,10001,10001,10001,10001,11110|E 11111,10000,10000,11110,10000,10000,11111|F 11111,10000,10000,11110,10000,10000,10000|G 01110,10001,10000,10111,10001,10001,01111|H 10001,10001,10001,11111,10001,10001,10001|I 01110,00100,00100,00100,00100,00100,01110|J 00111,00010,00010,00010,00010,10010,01100|K 10001,10010,10100,11000,10100,10010,10001|L 10000,10000,10000,10000,10000,10000,11111|M 10001,11011,10101,10101,10001,10001,10001|N 10001,11001,10101,10011,10001,10001,10001|O 01110,10001,10001,10001,10001,10001,01110|P 11110,10001,10001,11110,10000,10000,10000|Q 01110,10001,10001,10001,10101,10010,01101|R 11110,10001,10001,11110,10100,10010,10001|S 01111,10000,10000,01110,00001,00001,11110|T 11111,00100,00100,00100,00100,00100,00100|U 10001,10001,10001,10001,10001,10001,01110|V 10001,10001,10001,10001,10001,01010,00100|W 10001,10001,10001,10101,10101,11011,10001|X 10001,10001,01010,00100,01010,10001,10001|Y 10001,10001,01010,00100,00100,00100,00100|Z 11111,00001,00010,00100,01000,10000,11111'
  .split('|').forEach(g => { FONT5[g[0]] = g.slice(2).split(',').join(''); });

'( 00010,00100,01000,01000,01000,00100,00010|) 01000,00100,00010,00010,00010,00100,01000|/ 00001,00010,00010,00100,01000,01000,10000|+ 00000,00100,00100,11111,00100,00100,00000|0 01110,10001,10011,10101,11001,10001,01110|1 00100,01100,00100,00100,00100,00100,01110|2 01110,10001,00001,00010,00100,01000,11111|3 11110,00001,00001,01110,00001,00001,11110|4 00010,00110,01010,10010,11111,00010,00010|5 11111,10000,11110,00001,00001,10001,01110|6 00110,01000,10000,11110,10001,10001,01110|7 11111,00001,00010,00100,01000,01000,01000|8 01110,10001,10001,01110,10001,10001,01110|9 01110,10001,10001,01111,00001,00010,01100|: 00000,00100,00100,00000,00100,00100,00000|! 00100,00100,00100,00100,00100,00000,00100|- 00000,00000,00000,11111,00000,00000,00000|. 00000,00000,00000,00000,00000,01100,01100'
  .split('|').forEach(g => { FONT5[g[0]] = g.slice(2).split(',').join(''); });

FONT5["'"] = '00100' + '00100' + '01000' + '0'.repeat(20);

function drawGlyph5(ch, x, y, s, color) {
  const g = FONT5[ch];
  if (!g) return;
  ctx.fillStyle = color;
  for (let i = 0; i < 35; i++) if (g[i] === '1') ctx.fillRect(x + (i % 5) * s, y + Math.floor(i / 5) * s, s, s);
}

// Menu text in the 5x7 font (7 px tall at scale 1, 14 at scale 2). Letters get breathing room: gap defaults to 1 / 3 / 4 px at
// scale 1 / 2 / 3. An optional outline keeps it readable over trees and snow.
const text5Gap = s => (s >= 3 ? 4 : s === 2 ? 3 : 1);
function drawText5(str, x, y, s, color, align, outline, gap) {
  str = String(str).toUpperCase();
  const g = gap === undefined ? text5Gap(s) : gap, adv = 5 * s + g, w = str.length * adv - g;
  const x0 = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  const draw = (ox, oy, c) => { for (let i = 0; i < str.length; i++) drawGlyph5(str[i], x0 + ox + i * adv, y + oy, s, c); };
  if (outline) for (const [ox, oy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) draw(ox, oy, outline);
  draw(0, 0, color);
}

// A row of code slots: dark plates with big gold letters (a dash for the empty ones)
function drawCode(str, cx, y, s, len) {
  const w = 5 * s + 6, h = 7 * s + 6, gap = 4, x0 = Math.round(cx - (len * w + (len - 1) * gap) / 2);
  for (let i = 0; i < len; i++) {
    const x = x0 + i * (w + gap);
    rect(COLORS.night, x, y, w, h);
    if (str[i]) drawGlyph5(str[i], x + 3, y + 3, s, COLORS.gold);
    else rect(COLORS.shadow, x + 3, y + h - 3 - s, 5 * s, s);
  }
}

function drawTextShadow(str, x, y, s, color, align, gap) {
  const o = Math.ceil(s / 2);
  drawText(str, x + o, y + o, s, COLORS.night, align, gap);
  drawText(str, x, y, s, color, align, gap);
}

// ---------- Static background (pre-rendered once) ----------
const bg = document.createElement('canvas');
bg.width = CONFIG.W; bg.height = CONFIG.H + CONFIG.maxExtra;   // tall enough for any phone
(function buildBackground() {
  const b = bg.getContext('2d');
  const r = (c, x, y, w, h) => { b.fillStyle = c; b.fillRect(x, y, w, h); };
  // One snowy ground across the whole screen, with light ice-blue drift specks for texture
  r(COLORS.snow, 0, 0, 180, bg.height);
  for (let i = 0; i < 120; i++) {
    r(COLORS.ice, Math.floor(rnd() * 177), Math.floor(rnd() * (bg.height - 1)), 2 + Math.floor(rnd() * 2), 1);
  }
})();

// ---------- Trees (drawn per wave, see activeTrees) ----------
function paintTree(g) {
  const r = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  r(COLORS.brown, 3, 12, 2, 3);
  r(COLORS.hatGreen, 3, 0, 2, 2);
  r(COLORS.hatGreen, 2, 2, 4, 3);
  r(COLORS.hatGreen, 1, 5, 6, 3);
  r(COLORS.hatGreen, 0, 8, 8, 4);
  r(COLORS.snow, 3, 1, 2, 1); r(COLORS.snow, 2, 5, 2, 1); r(COLORS.snow, 1, 8, 2, 1);
}
const treeImg = document.createElement('canvas');
treeImg.width = 8;
treeImg.height = 15;
paintTree(treeImg.getContext('2d'));

// ---------- Fort ----------
// A half-circle ring of two rows of snow blocks, pre-rendered once, with the floor inside it.
// fortMask is the same wall in red, drawn over the fort for the hit flash.
const fort = document.createElement('canvas');
const fortMask = document.createElement('canvas');
const fortShadow = document.createElement('canvas');   // wall silhouette in night blue, drawn offset as the cast shadow
fort.width = fortMask.width = fortShadow.width = CONFIG.W;
fort.height = fortMask.height = fortShadow.height = CONFIG.H;
(function buildFort() {
  const f = fort.getContext('2d'), m = fortMask.getContext('2d'), sh = fortShadow.getContext('2d');
  const cx = CONFIG.fortCX, cy = CONFIG.fortCY, ri = CONFIG.fortInner;
  const rm = (CONFIG.fortOuter + ri) / 2;
  // Soft cloud-like wall: overlapping round puffs of snow along the arc (varied sizes make it lumpy)
  const radii = [4, 5, 4.5, 5.5, 5, 5.5, 4.5, 5, 4];
  const puffs = radii.map((r, i) => {
    const a = i * Math.PI / (radii.length - 1);
    return { x: cx + Math.cos(a) * rm, y: cy - Math.sin(a) * rm, r };
  });
  m.fillStyle = COLORS.red;
  sh.fillStyle = COLORS.night;
  for (let y = 0; y < cy + 4; y++) {
    for (let x = 0; x < CONFIG.W; x++) {
      const px = x + 0.5, py = y + 0.5;
      let best = null, bm = Infinity;                     // nearest puff and signed distance to its edge
      for (const p of puffs) {
        const e = Math.hypot(px - p.x, py - p.y) - p.r;
        if (e < bm) { bm = e; best = p; }
      }
      if (bm > 0) continue;                               // outside the wall
      const s = ((px - best.x) * 0.5 + (py - best.y) * 0.8) / best.r;   // >0 = facing away from the light
      f.fillStyle = bm > -1.2 ? (s > 0 ? COLORS.shadow : COLORS.ice)    // soft edge
        : s > 0.5 ? COLORS.shadow : s > 0.15 ? COLORS.ice : COLORS.snow;
      f.fillRect(x, y, 1, 1);
      m.fillRect(x, y, 1, 1);
      sh.fillRect(x, y, 1, 1);
    }
  }
})();

// ---------- State ----------
const state = {
  mode: 'splash',      // splash | title | playing | paused | gameover
  bullies: [],
  yetiLeft: 0,         // Yetis still to spawn this wave
  particles: [],
  prints: [],          // footprints: { x, y, t, w }
  buttons: [],         // rebuilt every frame by the draw code, used for tap tests
  score: 0,
  best: loadBest(),
  coopBest: loadBest(CONFIG.coopStorageKey),
  story: null,         // { level, last } while a Story level is running
  storyUnlocked: loadStory(),
  progress: loadProgress(),   // real level / xp-in-level (saved)
  shown: null,         // what the menu is showing; it catches up to progress with an animation
  lastXp: 0,           // score added to the bar by the game that just ended
  confetti: [],
  levelUpFx: null,     // { t, level } celebration banner
  newBest: false,
  health: CONFIG.fortHealth,
  flash: 0,            // fort hit-flash timer
  wave: 0,
  toSpawn: 0,          // bullies still to spawn this wave
  spawnTimer: 0,
  waveEnded: false,
  breakTimer: 0,
  banner: 0,
  time: 0,             // seconds of play, for walk animation
  power: null,         // the floating snowflake: { x, baseY, y, age }
  avalanche: null,     // { y } front of the avalanche while it sweeps down the screen
  powerTimer: CONFIG.powerFirstDelay,
  gun: 0,              // machine-gun seconds left
  gunTimer: 0,
  treesRemoved: 0,     // trees currently removed by the power-up (they return one by one)
  treeReturnTimer: 0,
  popup: null,         // { text, t } message after a pickup
  remote: freshRemote(),   // the other player's aim/cooldown/gun (the host's view of the guest, and vice versa)
  entry: '',           // co-op join code being typed
  flakes: [],
  snowballs: [],
  cooldown: 0,
  swing: 0,            // arm swing timer, counts down from armSwingTime
  aiming: false,
  pointerId: null,
  anchor: { x: 0, y: 0 },
  aimAngle: 90,        // degrees, 90 = straight up
  aimValid: false,     // pull >= minPull
};

for (let i = 0; i < CONFIG.flakes; i++) {
  state.flakes.push({
    x: Math.random() * CONFIG.W,
    y: Math.random() * CONFIG.H,
    v: CONFIG.flakeSpeedMin + Math.random() * (CONFIG.flakeSpeedMax - CONFIG.flakeSpeedMin),
    ph: Math.random() * Math.PI * 2,
  });
}

// ---------- Input (Pointer Events) ----------
function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (CONFIG.W / r.width),
    y: (e.clientY - r.top) * (view.h / r.height),
  };
}

// Aim direction is opposite the drag; only upward angles (10-170 deg) allowed.
function updateAim(p) {
  const dx = state.anchor.x - p.x;
  const dy = state.anchor.y - p.y;           // screen coords: negative dy = up
  const pull = Math.hypot(dx, dy);
  state.aimValid = pull >= CONFIG.minPull;
  if (!state.aimValid) return;
  let a = Math.atan2(-dy, dx) / DEG;         // -180..180, positive = up
  if (a < 0) a = a > -90 ? CONFIG.minAngle : CONFIG.maxAngle; // downward -> nearest edge
  state.aimAngle = Math.min(CONFIG.maxAngle, Math.max(CONFIG.minAngle, a));
}

function endAim() {
  state.aiming = false;
  state.aimValid = false;
  state.pointerId = null;
}

function throwSnowball(slot, auto, angle) {          // auto = machine-gun shot: no cooldown
  const p = pl(slot);
  if (angle !== undefined) p.aimAngle = angle;
  if (net.role === 'guest') {                         // the host simulates the world: ask it to throw
    netSend({ k: 't', a: r1(p.aimAngle) });
    p.cooldown = CONFIG.throwCooldown;                // local feedback right away
    p.swing = CONFIG.armSwingTime;
    sfx('throw');
    return;
  }
  const a = p.aimAngle * DEG, h = handPos(slot);
  state.snowballs.push({
    x: h.x, y: h.y, owner: slot,
    vx: Math.cos(a) * CONFIG.snowballSpeed, vy: -Math.sin(a) * CONFIG.snowballSpeed,
  });
  if (!auto) p.cooldown = CONFIG.throwCooldown;
  p.swing = CONFIG.armSwingTime;
  sfx('throw', slot === 1 && !auto);                  // the guest already played its own manual throw sound
}

// Guest only: tell the host where we are aiming (throttled) so it can draw our dotted line and use it for the machine gun
function sendAim(force) {
  if (net.role !== 'guest') return;
  const t = performance.now();
  if (!force && t - (net.lastAimSent || 0) < 60) return;
  net.lastAimSent = t;
  netSend({ k: 'a', a: r1(state.aimAngle), v: state.aiming && state.aimValid ? 1 : 0 });
}

function hitButton(p) {
  return state.buttons.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
}

window.addEventListener('pointerdown', e => {
  e.preventDefault();
  initAudio();                       // browsers only allow audio after a user gesture
  const b = hitButton(toCanvas(e));
  if (b) { b.onTap(); sfx('click'); return; }
  if (state.mode !== 'playing' || state.aiming) return;
  state.aiming = true;
  state.pointerId = e.pointerId;
  state.anchor = toCanvas(e);
  state.aimValid = false;
  state.aimAngle = 90;
}, { passive: false });

window.addEventListener('pointermove', e => {
  if (!state.aiming || e.pointerId !== state.pointerId) return;
  e.preventDefault();
  updateAim(toCanvas(e));
  sendAim();
}, { passive: false });

window.addEventListener('pointerup', e => {
  if (!state.aiming || e.pointerId !== state.pointerId) return;
  e.preventDefault();
  updateAim(toCanvas(e));
  // Throw only if pull is long enough and the cooldown is over
  if (state.aimValid && state.cooldown <= 0 && state.gun <= 0) throwSnowball(net.localSlot);   // machine gun fires by itself
  endAim();
  sendAim(true);
}, { passive: false });

window.addEventListener('pointercancel', e => {
  if (e.pointerId === state.pointerId) endAim();
});
window.addEventListener('blur', endAim);

state.shown = { ...state.progress };

// ---------- Update ----------
function updateFlakes(dt) {
  for (const f of state.flakes) {
    f.y += f.v * dt;
    f.ph += dt;
    if (f.y > view.h) { f.y = -2; f.x = Math.random() * CONFIG.W; }
  }
}

function update(dt) {
  updateFlakes(dt);
  state.time += dt;
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);

  if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - dt);
  if (state.swing > 0) state.swing = Math.max(0, state.swing - dt);
  for (const k of ['cooldown', 'swing']) if (state.remote[k] > 0) state.remote[k] = Math.max(0, state.remote[k] - dt);

  // Snowballs fly straight until they hit a bully or leave the screen
  const m = CONFIG.snowballRadius + 1;
  for (let i = state.snowballs.length - 1; i >= 0; i--) {
    const s = state.snowballs[i];
    const px = s.x, py = s.y;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const bh = firstBullyHit(px, py, s.x, s.y), th = firstTreeHit(px, py, s.x, s.y), ph = firstPowerHit(px, py, s.x, s.y);
    if (ph !== null && (!bh || ph < bh.t) && (!th || ph < th.t)) {   // snowball pops the snowflake
      collectPower(s.owner || 0);
      state.snowballs.splice(i, 1);
    } else if (bh && (!th || bh.t <= th.t)) {  // one snowball, one bully
      hitBully(bh.b);
      state.snowballs.splice(i, 1);
    } else if (th) {                    // trees stop snowballs
      puff(th.x, th.y);
      sfx('tree');
      state.snowballs.splice(i, 1);
    } else if (s.x < -m || s.x > CONFIG.W + m || s.y < -m || s.y > CONFIG.H + m) {
      state.snowballs.splice(i, 1);     // miss: just leaves the screen
    }
  }

  updateAvalanche(dt);
  updateBullies(dt);
  updateParticles(dt);
  updatePrints(dt);
  updateWaves(dt);
  updatePower(dt);
}

// ---------- Game logic ----------
const waveCount = n => Math.min(CONFIG.waveMax, CONFIG.waveBase + CONFIG.wavePerN * n);
// Speed grows 4% per wave, compounding, capped at 2.5x
const waveSpeed = n => CONFIG.regularSpeed * Math.min(CONFIG.speedCap, Math.pow(1 + CONFIG.speedGrowth, n - 1));
// Yetis in wave n: none before their first wave, then 1, +1 every yetiEvery waves, capped at yetiMax
const yetiCount = n => {
  const from = CONFIG.bullyTypes.yeti.from;
  return n < from ? 0 : Math.min(CONFIG.yetiMax, 1 + Math.floor((n - from) / CONFIG.yetiEvery));
};
const waveGap = n => CONFIG.gapMin + (CONFIG.gapStart - CONFIG.gapMin) * Math.pow(CONFIG.gapDecay, n - 1);

function resetGame() {
  Object.assign(state, {
    snowballs: [], bullies: [], yetiLeft: 0, particles: [], prints: [], cooldown: 0, swing: 0,
    score: 0, newBest: false, health: CONFIG.fortHealth, flash: 0,
    wave: 0, toSpawn: 0, spawnTimer: 0, waveEnded: false, breakTimer: 0, banner: 0, time: 0,
    power: null, avalanche: null, powerTimer: CONFIG.powerFirstDelay, gun: 0, gunTimer: 0, treesRemoved: 0, treeReturnTimer: 0, popup: null, remote: freshRemote(),
  });
  endAim();
}

function setMode(m) { endAim(); state.mode = m; }

// DEBUG (easy to remove): open index.html?wave=8 to start at wave 8
const DEBUG_START_WAVE = parseInt(new URLSearchParams(location.search).get('wave'), 10) || 1;

function startGame() {
  resetGame();
  state.mode = 'playing';
  state.story = null;
  startWave(DEBUG_START_WAVE);
}

// ---- Story intro (level 1): "normal day" -> boy walks in -> shake -> he runs to the fort spot and builds it -> quote ----
const CUT = { text1: 0.4, walk: 2.6, stand: 5.4, shake: 6.2, run: 7.6, cloud: 9.4, fort: 9.9, quote: 10.8, end: 16.5 };
const CUT_MID_Y = 150;
function startCutscene() {
  resetGame();
  state.mode = 'cutscene';
  state.story = { level: 1 };
  state.cut = { t: 0 };
}
function cutKid() {
  const t = state.cut.t, k = kidPos(0), lerp = (a, b, u) => a + (b - a) * Math.max(0, Math.min(1, u));
  if (t < CUT.walk) return null;
  if (t < CUT.stand) return { x: k.x, y: lerp(-16, CUT_MID_Y, (t - CUT.walk) / (CUT.stand - CUT.walk)), walk: true };
  if (t < CUT.run) return { x: k.x, y: CUT_MID_Y, walk: false };
  return { x: k.x, y: lerp(CUT_MID_Y, k.y, (t - CUT.run) / (CUT.cloud - CUT.run)), walk: t < CUT.cloud };
}
function cutText(lines, t0, t1, y, s) {
  const t = state.cut.t;
  if (t < t0 || t > t1) return;
  ctx.globalAlpha = Math.max(0, Math.min(1, (t - t0) / 0.4, (t1 - t) / 0.4));
  lines.forEach((l, i) => drawText5(l, CONFIG.W / 2, y + i * (7 * s + 5), s, COLORS.night, 'center', COLORS.snow));
  ctx.globalAlpha = 1;
}
function drawCutscene() {
  const t = state.cut.t;
  if (t >= CUT.fort) {
    drawFort();
    const k = kidPos(0);
    drawKidAt(k.x, k.y, 0, breath(0), 0);
  } else {
    const k = cutKid();
    if (k) drawKidAt(Math.round(k.x), Math.round(k.y), 0, 0, k.walk ? 1 + (Math.floor(t * 8) % 2) : 0);
  }
  if (t >= CUT.cloud - 0.5 && t < CUT.quote) {          // cloud of snow puffs over the fort spot
    const u = (t - (CUT.cloud - 0.5)) / (CUT.quote - CUT.cloud + 0.5);
    for (let i = 0; i < 26; i++) {
      const a = i * 2.4, rx = 12 + (i * 37) % 60, cx = 90 + Math.cos(a) * rx, cy = 292 + Math.sin(a) * 26 - u * 8, r = Math.round((4 + (i % 4) * 2) * Math.sin(Math.min(1, u * 1.1) * Math.PI));
      if (r < 1) continue;
      ctx.globalAlpha = i % 2 ? 0.95 : 0.8;
      rect(i % 3 ? COLORS.snow : COLORS.ice, Math.round(cx - r), Math.round(cy - r), r * 2, r * 2);
      rect(COLORS.shadow, Math.round(cx - r), Math.round(cy + r - 1), r * 2, 1);
    }
    ctx.globalAlpha = 1;
  }
  withInset(() => {
    cutText(['IT WAS A NORMAL DAY...'], CUT.text1, CUT.walk - 0.2, 60, 1);
    cutText(['...UNTIL IT WASN\'T!'], CUT.stand, CUT.run - 0.2, 60, 1);
    cutText(['THE AGING PROCESS HAS', 'YOU FIRMLY IN ITS GRASP', 'IF YOU NEVER GET THE', 'URGE TO THROW A SNOWBALL.', '', '- DOUG LARSON'], CUT.quote, CUT.end - 0.2, 70, 1);
    state.buttons.push({ x: 0, y: 0, w: CONFIG.W, h: view.h, onTap: () => startStory(1) });
  });
}
function updateCutscene(dt) {
  state.cut.t += dt;
  if (state.cut.t >= CUT.end) startStory(1);
}

function startStory(n) {
  resetGame();
  state.mode = 'playing';
  const first = 2 * (n - 1) + 1;
  state.story = { level: n };
  startWave(first);
}

function storyWin() {
  awardXp(state.score);
  if (state.story.level >= state.storyUnlocked && state.storyUnlocked < CONFIG.storyLevels) {
    state.storyUnlocked = state.story.level + 1;
    saveBest(state.storyUnlocked, CONFIG.storyKey);
  }
  state.mode = 'levelwin';
  sfx('wave');
}

function startWave(n) {
  sfx('wave');
  state.wave = n;
  state.toSpawn = waveCount(n);
  state.yetiLeft = yetiCount(n);                 // spawned at random points of the wave (they replace regular spawns)
  state.spawnTimer = CONFIG.firstSpawnDelay;
  state.waveEnded = false;
  state.banner = CONFIG.bannerTime;
}

let bullyId = 0;

// Weighted random type: newer types get likelier as waves rise, Regular stays the most common
function pickType(wave) {
  const ws = [];
  let total = 0;
  for (const k in CONFIG.bullyTypes) {
    const T = CONFIG.bullyTypes[k];
    if (T.special) continue;                         // Yetis are placed by the wave, not rolled
    const w = wave >= T.from ? Math.min(T.weightMax, T.weight + T.weightPer * (wave - T.from)) : 0;
    ws.push([k, w]);
    total += w;
  }
  let r = Math.random() * total;
  for (const [k, w] of ws) { r -= w; if (r < 0) return k; }
  return 'regular';
}

function spawnBully() {
  // The chance rises as the wave runs out of spawns, so every Yeti of the wave is guaranteed to appear
  let type;
  if (state.yetiLeft > 0 && Math.random() < state.yetiLeft / state.toSpawn) {
    type = 'yeti';
    state.yetiLeft--;
    state.popup = { text: 'YETI INCOMING!', t: 1.8 };
  } else type = pickType(state.wave);
  const T = CONFIG.bullyTypes[type];
  const m = CONFIG.bullyMargin + (T.swayAmp || 0);   // leave room for the sled's sway
  const x0 = m + Math.random() * (CONFIG.W - 2 * m);
  state.bullies.push({
    id: ++bullyId,
    type,
    vx: 0, vy: 0,                                    // velocity, sent to the co-op guest for smooth motion
    x: x0, x0,                                       // x0 = centre column (sway is around it)
    y: -T.halfH,
    ang: Math.PI / 2,                                // heading (screen coords): straight down
    speed: waveSpeed(state.wave) * T.speedMul,
    hp: T.hp,
    state: 'walking',      // walking | falling | fading
    t: 0,
    age: 0,
    stepAcc: 0,
    stepSide: 1,
    flash: 0,
    ph: Math.random() * 10, // walk-cycle / sway offset
  });
}

function updateWaves(dt) {
  if (state.mode !== 'playing') return;
  if (state.banner > 0) state.banner -= dt;
  if (state.toSpawn > 0) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnBully();
      state.toSpawn--;
      state.spawnTimer = waveGap(state.wave);
    }
  } else if (!state.waveEnded) {
    // Wave is over once every bully is knocked down or has reached the fort
    if (!state.bullies.some(b => b.state === 'walking')) {
      state.waveEnded = true;
      state.breakTimer = CONFIG.waveBreak;
      state.score += CONFIG.waveBonus;
      if (state.story) storyWin();
    }
  } else {
    state.breakTimer -= dt;
    if (state.breakTimer <= 0) startWave(state.wave + 1);
  }
}

// Earliest bully whose circle the snowball's path segment overlaps this frame
function firstBullyHit(ax, ay, bx, by) {
  const sr = CONFIG.snowballRadius;
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  let hit = null, hitT = Infinity;
  for (const b of state.bullies) {
    if (b.state !== 'walking') continue;
    let t = len2 ? ((b.x - ax) * dx + (b.y - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + dx * t - b.x, cy = ay + dy * t - b.y;
    const R = sr + CONFIG.bullyTypes[b.type].radius;
    if (cx * cx + cy * cy <= R * R && t < hitT) { hit = b; hitT = t; }
  }
  return hit ? { b: hit, t: hitT } : null;
}

// ---- Power-ups ----
const rand = (a, b) => a + Math.random() * (b - a);
const MENU_MODES = ['title', 'levels', 'wavesmenu', 'coopmenu', 'coophost', 'coopjoin'];

// Segment-vs-circle; returns t (0..1 along the snowball's path this frame) or null
function firstPowerHit(ax, ay, bx, by) {
  const pw = state.power;
  if (!pw) return null;
  const R = CONFIG.snowballRadius + CONFIG.powerRadius;
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  let t = len2 ? ((pw.x - ax) * dx + (pw.y - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return (ax + dx * t - pw.x) ** 2 + (ay + dy * t - pw.y) ** 2 <= R * R ? t : null;
}

function collectPower(owner) {
  const pw = state.power;
  state.power = null;
  state.powerTimer = rand(CONFIG.powerMinGap, CONFIG.powerMaxGap);
  puff(pw.x, pw.y);
  sfx('power');
  const opts = ['gun'];                                         // only offer effects that do something
  if (state.health < CONFIG.fortHealth) opts.push('heal');
  if (activeTrees().length) opts.push('trees');
  if (state.bullies.some(b => b.state === 'walking')) opts.push('avalanche');
  const pick = opts[Math.floor(Math.random() * opts.length)];
  if (pick === 'gun') {
    const p = pl(owner);                                        // the machine gun goes to whoever popped it
    p.gun = CONFIG.gunTime;
    p.gunTimer = 0;
    state.popup = { text: isCoop() ? 'GUN FOR P' + (owner + 1) + '!' : 'MACHINE GUN!', t: 1.4 };
  } else if (pick === 'heal') {
    state.health = CONFIG.fortHealth;
    puff(CONFIG.fortCX, CONFIG.fortCY - 12);
    state.popup = { text: 'FORT REPAIRED!', t: 1.4 };
  } else if (pick === 'avalanche') {
    state.avalanche = { y: -CONFIG.avalancheBand };             // starts above the top edge
    sfx('avalanche');
    state.popup = { text: 'AVALANCHE!', t: 1.4 };
  } else {
    for (const p of activeTrees()) puff(p[0] + 4, p[1] + 9);
    state.treesRemoved = Math.min(CONFIG.treeMax, state.wave - 1);
    state.treeReturnTimer = CONFIG.treeReturnTime;
    state.popup = { text: 'TREES GONE!', t: 1.4 };
  }
}

function updatePower(dt) {
  // Floating snowflake: appears at a random spot, bobs, vanishes if not popped
  if (state.power) {
    state.power.age += dt;
    state.power.y = state.power.baseY + Math.sin(state.power.age * 2.5) * 3;
    if (state.power.age >= CONFIG.powerLife) {
      state.power = null;
      state.powerTimer = rand(CONFIG.powerMinGap, CONFIG.powerMaxGap);
    }
  } else {
    state.powerTimer -= dt;
    if (state.powerTimer <= 0) {
      const y = rand(CONFIG.powerMinY, CONFIG.powerMaxY);
      state.power = { x: rand(18, CONFIG.W - 18), baseY: y, y, age: 0 };
    }
  }
  // Machine gun: fires along the current aim direction by itself
  for (const sl of slots()) {
    const p = pl(sl);
    if (p.gun > 0) {
      p.gun = Math.max(0, p.gun - dt);
      p.gunTimer -= dt;
      if (p.gunTimer <= 0) { throwSnowball(sl, true); p.gunTimer = CONFIG.gunInterval; }
    }
  }
  // Removed trees grow back one by one, in the order they were added
  if (state.treesRemoved > 0) {
    state.treeReturnTimer -= dt;
    if (state.treeReturnTimer <= 0) {
      state.treesRemoved--;
      state.treeReturnTimer = CONFIG.treeReturnTime;
      const shown = activeTrees();
      if (shown.length) { const p = shown[shown.length - 1]; puff(p[0] + 4, p[1] + 9); }
    }
  }
  if (state.popup && (state.popup.t -= dt) <= 0) state.popup = null;
}

// Wave N shows N-1 trees (none in wave 1), up to treeMax; the power-up can hide them for a while
function activeTrees() {
  if (MENU_MODES.includes(state.mode)) return CONFIG.treePositions.slice(0, CONFIG.treeMax);   // menus show them all
  return CONFIG.treePositions.slice(0, Math.max(0, Math.min(CONFIG.treeMax, state.wave - 1) - state.treesRemoved));
}

function firstTreeHit(ax, ay, bx, by) {
  const R = CONFIG.snowballRadius + CONFIG.treeRadius;
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
  let hit = null, hitT = Infinity;
  for (const p of activeTrees()) {
    const tx = p[0] + 4, ty = p[1] + 9;
    let t = len2 ? ((tx - ax) * dx + (ty - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const qx = ax + dx * t, qy = ay + dy * t;
    if ((qx - tx) ** 2 + (qy - ty) ** 2 <= R * R && t < hitT) { hit = { x: qx, y: qy, t }; hitT = t; }
  }
  return hit;
}

// Bend the wanted heading away from any tree just ahead so bullies walk around it
function avoidTrees(b, T, want) {
  const dx = Math.cos(want), dy = Math.sin(want);
  const need = CONFIG.treeBaseRadius + T.radius + 3;
  let turn = 0;
  for (const p of activeTrees()) {
    const rx = p[0] + 4 - b.x, ry = p[1] + CONFIG.treeBaseY - b.y;          // tree relative to the bully
    const along = rx * dx + ry * dy;
    if (along <= 0 || along > CONFIG.treeLookahead) continue;
    const side = rx * dy - ry * dx;                          // >0: tree is on the left of the heading (screen coords)
    if (Math.abs(side) >= need) continue;
    const dir = side > 0 ? 1 : side < 0 ? -1 : (b.ph < 5 ? 1 : -1);
    turn += dir * (0.6 + 0.9 * (1 - Math.abs(side) / need));
  }
  return want + Math.max(-1.4, Math.min(1.4, turn));
}

function hitBully(b) {
  const T = CONFIG.bullyTypes[b.type];
  b.hp--;
  if (b.hp > 0) {                       // Big Kid survives the first hit: white flash
    b.flash = CONFIG.hitFlashTime;
    sfx('clank');
  } else {
    b.state = 'falling';
    b.t = 0;
    state.score += T.points;
    sfx('hit');
  }
  puff(b.x, b.y);
}

function puff(x, y) {
  if (net.role === 'host') net.evq.push({ e: 'p', x: r1(x), y: r1(y) });   // the guest shows the same puff
  for (let i = 0; i < CONFIG.puffCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = CONFIG.puffSpeed * (0.5 + Math.random() * 0.5);
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10,
      life: CONFIG.puffLife, c: Math.random() < 0.5 ? COLORS.snow : COLORS.ice,
    });
  }
}

function updateBullies(dt) {
  for (let i = state.bullies.length - 1; i >= 0; i--) {
    const b = state.bullies[i], T = CONFIG.bullyTypes[b.type];
    if (b.flash > 0) b.flash -= dt;
    if (b.state === 'walking') {
      b.age += dt;
      const prevX = b.x, prevY = b.y;
      // Walk straight down; below turnY, steer smoothly toward the kid (fort centre)
      let want = b.y >= CONFIG.turnY ? Math.atan2(CONFIG.fortCY - b.y, CONFIG.fortCX - b.x0) : Math.PI / 2;
      want = avoidTrees(b, T, want);              // walk around trees
      const da = Math.atan2(Math.sin(want - b.ang), Math.cos(want - b.ang));   // wrapped to -PI..PI
      const maxTurn = CONFIG.turnRate * dt;
      b.ang += Math.max(-maxTurn, Math.min(maxTurn, da));
      b.x0 += Math.cos(b.ang) * b.speed * dt;     // x0 = path position; the Sled Kid's sway is added on top
      b.y += Math.sin(b.ang) * b.speed * dt;
      let sway = 0;
      if (T.swayAmp) {
        const k = Math.max(0, Math.min(1, 1 - (b.y - CONFIG.turnY) / CONFIG.turnSwayFade));
        sway = Math.sin(b.age * T.swayFreq * Math.PI * 2 + b.ph) * T.swayAmp * k;
      }
      b.x = b.x0 + sway;
      for (const p of activeTrees()) {            // hard collision: never overlap a tree
        const tx = p[0] + 4, ty = p[1] + CONFIG.treeBaseY, R = CONFIG.treeBaseRadius + T.radius;
        const ddx = b.x - tx, ddy = b.y - ty, d = Math.hypot(ddx, ddy);
        if (d < R) {
          const nx = d > 0.01 ? ddx / d : 1, ny = d > 0.01 ? ddy / d : 0, push = R - d;
          b.x0 += nx * push; b.x += nx * push; b.y += ny * push;
        }
      }
      b.vx = dt > 0 ? (b.x - prevX) / dt : 0;
      b.vy = dt > 0 ? (b.y - prevY) / dt : 0;
      footstep(b, T, prevX, prevY);
      if (b.y >= CONFIG.H || Math.hypot(b.x - CONFIG.fortCX, b.y - CONFIG.fortCY) <= CONFIG.fortOuter + T.radius) {  // touches the fort
        state.bullies.splice(i, 1);
        damageFort(T.fortDamage);
      }
    } else {
      b.t += dt;
      if (b.state === 'falling' && b.t >= CONFIG.fallTime) { b.state = 'fading'; b.t = 0; }
      else if (b.state === 'fading' && b.t >= CONFIG.fadeTime) state.bullies.splice(i, 1);
    }
  }
}

// Avalanche: a wall of snow sweeps from the top to the bottom and knocks over every walking enemy it passes over
function updateAvalanche(dt) {
  const av = state.avalanche;
  if (!av) return;
  av.y += CONFIG.avalancheSpeed * dt;
  for (const b of state.bullies) {
    if (b.state === 'walking' && b.y <= av.y && b.y > av.y - CONFIG.avalancheBand) {   // inside the band (new spawns behind it are safe)
      b.hp = 1;                                  // one hit left, so this drops even a Big Kid
      hitBully(b);
    }
  }
  avalancheFx(dt);
  if (av.y - CONFIG.avalancheBand > CONFIG.H + CONFIG.maxExtra) state.avalanche = null;   // past the bottom of any screen
}

// Flying snow along the front (spawned locally on both devices, not sent over the network)
function avalancheFx(dt) {
  const av = state.avalanche;
  for (let i = 0, n = Math.ceil(dt * 120); i < n; i++) {
    state.particles.push({
      x: Math.random() * CONFIG.W, y: av.y + rand(-8, 2), vx: rand(-14, 14), vy: rand(-30, 20),
      life: rand(0.3, 0.6), c: Math.random() < 0.5 ? COLORS.ice : COLORS.shadow,
    });
  }
}

// Leave a footprint every footstepGap px walked (also used by the co-op guest, from received positions)
function footstep(b, T, prevX, prevY) {
  b.stepAcc += Math.hypot(b.x - prevX, b.y - prevY);
  if (b.stepAcc >= CONFIG.footstepGap) {
    b.stepAcc -= CONFIG.footstepGap;
    b.stepSide = -b.stepSide;                           // left foot, right foot
    state.prints.push({
      x: b.x - Math.sin(b.ang) * 1.5 * b.stepSide,
      y: b.y + T.halfH - 1 + Math.cos(b.ang) * 1.5 * b.stepSide,
      t: 0, w: T.radius >= 8 ? 3 : 2,
    });
  }
}

function updatePrints(dt) {
  for (let i = state.prints.length - 1; i >= 0; i--) {
    state.prints[i].t += dt;
    if (state.prints[i].t >= CONFIG.footstepLife) state.prints.splice(i, 1);
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += CONFIG.puffGravity * dt;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function damageFort(n) {
  state.health = Math.max(0, state.health - n);
  state.flash = CONFIG.fortFlashTime;
  sfx('fort');
  if (state.health <= 0) gameOver();
}

// Add a finished game's score to the level bar; a full bar levels up and the leftover carries into the next level
function awardXp(score) {
  state.lastXp = Math.max(0, Math.floor(score));
  if (state.lastXp <= 0) return;
  let { level, xp } = state.progress;
  xp += state.lastXp;
  while (level < MAX_LEVEL && xp >= levelCost(level)) { xp -= levelCost(level); level++; }
  if (level >= MAX_LEVEL) xp = 0;
  state.progress = { level, xp };
  saveProgress(state.progress);
}

// Main menu: the shown bar fills up to the real value; each time it tops out it levels up with confetti and music
function updateProgress(dt) {
  const sh = state.shown, real = state.progress;
  if (sh.level === real.level && sh.xp === real.xp) return;
  const cost = levelCost(sh.level), speed = cost / CONFIG.levelBarSeconds;
  const target = sh.level < real.level ? cost : real.xp;
  sh.xp = Math.min(target, sh.xp + speed * dt);
  if (sh.level < real.level && sh.xp >= cost) {
    sh.level++;
    sh.xp = 0;
    celebrate(sh.level);
  }
}

function celebrate(level) {
  state.levelUpFx = { t: 3.4, level };
  sfx(level >= MAX_LEVEL ? 'legend' : 'fanfare');
  const colors = [COLORS.gold, COLORS.red, COLORS.coatBlue, COLORS.hatGreen, COLORS.orange, COLORS.snow, COLORS.ice];
  for (let i = 0; i < CONFIG.confettiCount; i++) {
    state.confetti.push({
      x: rand(0, CONFIG.W), y: rand(-40, 0), vx: rand(-25, 25), vy: rand(30, 110), ph: rand(0, 6.3),
      c: colors[i % colors.length],
    });
  }
}

function updateCelebration(dt) {
  if (state.levelUpFx && (state.levelUpFx.t -= dt) <= 0) state.levelUpFx = null;
  for (let i = state.confetti.length - 1; i >= 0; i--) {
    const c = state.confetti[i];
    c.vy += 50 * dt;
    c.vy = Math.min(c.vy, 90);                 // flutters down instead of dropping like a stone
    c.ph += dt * 9;
    c.x += (c.vx + Math.sin(c.ph) * 18) * dt;
    c.y += c.vy * dt;
    if (c.y > view.h + 6) state.confetti.splice(i, 1);
  }
}

// Solo and co-op keep separate best scores
const bestNow = () => (isCoop() ? state.coopBest : state.best);
function recordBest(score) {
  const co = isCoop(), k = co ? 'coopBest' : 'best';
  state.newBest = score > state[k];
  if (state[k] < score) { state[k] = score; saveBest(score, co ? CONFIG.coopStorageKey : CONFIG.storageKey); }
}

function gameOver() {
  endAim();
  if (!state.story) recordBest(state.score);
  awardXp(state.score);
  state.mode = 'gameover';
  sfx('over');
}

// Auto-pause when the tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.mode === 'playing' && !isCoop()) setMode('paused');   // co-op can't pause
});

// ---------- Co-op networking ----------
const TYPE_IDS = Object.keys(CONFIG.bullyTypes);
const STATE_IDS = ['walking', 'falling', 'fading'];
const r1 = v => Math.round(v * 10) / 10;

function netSend(msg) {
  try { if (net.conn && net.conn.open) net.conn.send(msg); } catch (e) { /* ignore */ }
}

function netCleanup() {
  const { conn, peer } = net;
  net.conn = null; net.peer = null;
  try { if (conn) conn.close(); } catch (e) { /* ignore */ }
  try { if (peer) peer.destroy(); } catch (e) { /* ignore */ }
}

function resetNet() {
  netCleanup();
  Object.assign(net, { role: 'solo', status: 'idle', error: '', code: '', localSlot: 0, lost: false, evq: [], acc: 0 });
}

function leaveCoop() { resetNet(); state.entry = ''; resetGame(); setMode('title'); }
function backToCoopMenu() { resetNet(); state.entry = ''; setMode('coopmenu'); }
function openCoopMenu() { net.status = 'idle'; net.error = ''; setMode('coopmenu'); }

function netFail(msg) { net.status = 'error'; net.error = msg; }

function newCode() {
  let c = '';
  for (let i = 0; i < CONFIG.codeLength; i++) c += CONFIG.codeLetters[Math.floor(Math.random() * CONFIG.codeLetters.length)];
  return c;
}

// Create a game: register a peer named after a random 4-letter code and wait for one guest
function hostGame(tries) {
  netCleanup();
  if (typeof Peer === 'undefined') { netFail('CO-OP NOT AVAILABLE'); return; }
  net.code = newCode(); net.status = 'opening'; net.error = '';
  let peer;
  try { peer = new Peer(CONFIG.netPrefix + net.code, { debug: 0 }); } catch (e) { netFail('NO CONNECTION'); return; }
  net.peer = peer;
  peer.on('open', () => { if (net.peer === peer) net.status = 'waiting'; });
  peer.on('connection', conn => {
    if (net.peer !== peer || net.conn) { conn.close(); return; }          // only two players
    net.conn = conn;
    conn.on('open', () => {
      Object.assign(net, { role: 'host', localSlot: 0, lost: false, lastRx: performance.now(), evq: [], acc: 0 });
      startGame();
    });
    conn.on('data', hostOnData);
    conn.on('close', () => { if (net.conn === conn) net.lost = true; });
  });
  peer.on('error', err => {
    if (net.peer !== peer) return;
    if (err.type === 'unavailable-id' && (tries || 0) < 5) { hostGame((tries || 0) + 1); return; }   // code taken: pick another
    netFail('NO CONNECTION');
  });
}

// Join a game: connect to the peer named after the code
function joinGame(code) {
  netCleanup();
  if (typeof Peer === 'undefined') { netFail('CO-OP NOT AVAILABLE'); return; }
  net.code = code; net.status = 'connecting'; net.error = '';
  let peer;
  try { peer = new Peer({ debug: 0 }); } catch (e) { netFail('NO CONNECTION'); return; }
  net.peer = peer;
  const timer = setTimeout(() => { if (net.peer === peer && net.status === 'connecting') netFail('TIMED OUT'); }, CONFIG.netConnectTimeout * 1000);
  peer.on('open', () => {
    if (net.peer !== peer) return;
    const conn = peer.connect(CONFIG.netPrefix + code, { serialization: 'json', reliable: true });
    net.conn = conn;
    conn.on('open', () => {
      clearTimeout(timer);
      Object.assign(net, { role: 'guest', localSlot: 1, status: 'connected', lost: false, lastRx: performance.now(), evq: [], acc: 0 });
    });
    conn.on('data', guestOnData);
    conn.on('close', () => { if (net.conn === conn) net.lost = true; });
  });
  peer.on('error', err => {
    clearTimeout(timer);
    if (net.peer !== peer) return;
    netFail(err.type === 'peer-unavailable' ? 'GAME NOT FOUND' : 'NO CONNECTION');
  });
}

// Host: messages from the guest ('a' = aim, 't' = throw, 'h' = heartbeat)
function hostOnData(d) {
  if (!d || typeof d !== 'object') return;
  net.lastRx = performance.now(); net.lost = false;
  const r = state.remote;
  if (d.k === 'a' && Number.isFinite(d.a)) {
    r.aimAngle = Math.min(CONFIG.maxAngle, Math.max(CONFIG.minAngle, d.a));
    r.aimValid = r.aiming = !!d.v;
  } else if (d.k === 't' && Number.isFinite(d.a) && state.mode === 'playing' && r.cooldown <= 0.1 && r.gun <= 0) {
    throwSnowball(1, false, Math.min(CONFIG.maxAngle, Math.max(CONFIG.minAngle, d.a)));
  }
}

// Host -> guest: everything the guest needs to draw the world
function buildSnapshot() {
  const ev = net.evq; net.evq = [];
  return {
    k: 's', m: state.mode, sc: state.score, w: state.wave, h: state.health,
    fl: r1(state.flash * 10) / 10, bn: r1(state.banner), tm: r1(state.time), tr: state.treesRemoved,
    pu: state.popup ? { s: state.popup.text, t: r1(state.popup.t) } : null,
    pw: state.power ? [r1(state.power.x), r1(state.power.baseY), r1(state.power.age)] : null,
    g: [r1(state.gun), r1(state.remote.gun)],                                   // machine-gun seconds left [host, guest]
    ha: [r1(state.aimAngle), state.aiming && state.aimValid ? 1 : 0, state.swing],   // host aim, for its arm and dotted line
    B: state.bullies.map(b => [b.id, TYPE_IDS.indexOf(b.type), r1(b.x), r1(b.y), r1(b.vx), r1(b.vy),
                               STATE_IDS.indexOf(b.state), r1(b.t), b.flash > 0 ? 1 : 0, r1(b.ph), r1(b.ang), b.hp]),
    S: state.snowballs.map(s => [r1(s.x), r1(s.y), r1(s.vx), r1(s.vy)]),
    av: state.avalanche ? r1(state.avalanche.y) : null,
    ev,
  };
}

function guestOnData(d) {
  if (!d || typeof d !== 'object') return;
  net.lastRx = performance.now(); net.lost = false;
  if (d.k === 's') applySnapshot(d);
}

function applySnapshot(d) {
  const prev = state.mode;
  if (d.m === 'playing' && prev !== 'playing') { resetGame(); }        // first snapshot, or the host pressed Play Again
  if (d.m === 'gameover' && prev === 'playing') {
    endAim();
    recordBest(d.sc);
    awardXp(d.sc);
  }
  state.mode = d.m;
  state.score = d.sc; state.wave = d.w; state.health = d.h; state.flash = d.fl; state.banner = d.bn;
  state.time = d.tm; state.treesRemoved = d.tr;
  state.popup = d.pu ? { text: d.pu.s, t: d.pu.t } : null;
  state.power = d.pw ? { x: d.pw[0], baseY: d.pw[1], y: d.pw[1] + Math.sin(d.pw[2] * 2.5) * 3, age: d.pw[2] } : null;
  state.gun = d.g[net.localSlot];
  const r = state.remote;                                              // the host, from the guest's point of view
  r.gun = d.g[1 - net.localSlot]; r.aimAngle = d.ha[0]; r.aiming = r.aimValid = !!d.ha[1]; r.swing = d.ha[2];

  const old = new Map(state.bullies.map(b => [b.id, b]));              // keep local footprint state per bully
  state.bullies = d.B.map(a => {
    const b = old.get(a[0]) || { id: a[0], stepAcc: 0, stepSide: 1 };
    b.type = TYPE_IDS[a[1]]; b.x = a[2]; b.y = a[3]; b.vx = a[4]; b.vy = a[5];
    b.state = STATE_IDS[a[6]]; b.t = a[7]; b.flash = a[8] ? CONFIG.hitFlashTime : 0; b.ph = a[9]; b.ang = a[10]; b.hp = a[11];
    return b;
  });
  state.snowballs = d.S.map(a => ({ x: a[0], y: a[1], vx: a[2], vy: a[3] }));
  state.avalanche = typeof d.av === 'number' ? { y: d.av } : null;
  for (const e of d.ev || []) {
    if (e.e === 'p') puff(e.x, e.y);
    else if (e.e === 's') sfx(e.n, true);
  }
}

// Guest: advance what the last snapshot described, so motion stays smooth between snapshots
function updateGuest(dt) {
  updateFlakes(dt);
  state.time += dt;
  for (const p of [state, state.remote]) {
    if (p.cooldown > 0) p.cooldown = Math.max(0, p.cooldown - dt);
    if (p.swing > 0) p.swing = Math.max(0, p.swing - dt);
  }
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
  if (state.banner > 0) state.banner -= dt;
  if (state.popup && (state.popup.t -= dt) <= 0) state.popup = null;
  if (state.power) {
    state.power.age += dt;
    state.power.y = state.power.baseY + Math.sin(state.power.age * 2.5) * 3;
  }
  for (const s of state.snowballs) { s.x += s.vx * dt; s.y += s.vy * dt; }
  for (const b of state.bullies) {
    if (b.state === 'walking') {
      const px = b.x, py = b.y;
      b.x += b.vx * dt; b.y += b.vy * dt;
      footstep(b, CONFIG.bullyTypes[b.type], px, py);
    } else b.t += dt;
  }
  if (state.avalanche) { state.avalanche.y += CONFIG.avalancheSpeed * dt; avalancheFx(dt); }
  updateParticles(dt);
  updatePrints(dt);
}

// Every frame while connected: host sends snapshots, guest sends a heartbeat; either side notices a dead link
function netTick(dt) {
  net.acc += dt;
  if (net.role === 'host' && net.acc >= CONFIG.netInterval) { net.acc = 0; netSend(buildSnapshot()); }
  else if (net.role === 'guest' && net.acc >= 1) { net.acc = 0; netSend({ k: 'h' }); }
  if (!net.lost && performance.now() - net.lastRx > CONFIG.netTimeout * 1000) net.lost = true;
}

// Typing the join code (on-screen keys, or a real keyboard)
function addLetter(ch) {
  if (state.entry.length >= CONFIG.codeLength || net.status === 'connecting' || net.status === 'connected') return;
  state.entry += ch;
  net.error = ''; net.status = 'idle';
  if (state.entry.length === CONFIG.codeLength) joinGame(state.entry);
}
function delLetter() {
  if (net.status === 'connecting' || net.status === 'connected' || net.status === 'error') resetNet();
  state.entry = state.entry.slice(0, -1);
}
window.addEventListener('keydown', e => {
  if (state.mode !== 'coopjoin') return;
  const ch = e.key.length === 1 ? e.key.toUpperCase() : '';
  if (ch && CONFIG.codeLetters.includes(ch)) addLetter(ch);
  else if (e.key === 'Backspace') delLetter();
  else if (e.key === 'Escape') backToCoopMenu();
});

// ---------- Draw ----------
function drawFlakes() {
  ctx.fillStyle = COLORS.ice;   // ice blue so flakes show against the white snow
  for (const f of state.flakes) {
    ctx.fillRect(Math.round(f.x + Math.sin(f.ph) * 3), Math.round(f.y), 1, 1);
  }
}

// Kid, 8x15, standing inside the fort (slot 0: blue hat, orange scarf; slot 1: gold hat, green scarf). Hand drawn via the arm.
// Breathing: every ~3 s the upper body lifts 1 px and settles back (legs and throwing hand stay put); the two boys are out of step
const breath = slot => (Math.sin(performance.now() / 1000 * 2.2 + slot * 1.3) > 0 ? 1 : 0);

function drawKid(slot) { const { x, y } = kidPos(slot); drawKidAt(x, y, slot, breath(slot), 0); }

// step: 0 = standing, 1 / 2 = the two walking poses (legs alternate)
function drawKidAt(x, y, slot, b, step) {
  const c = KID_COLORS[slot];
  rect(COLORS.snow, x + 3, y - b, 2, 1);          // pom
  rect(c.hat, x + 1, y + 1 - b, 6, 2);            // hat
  rect(COLORS.snow, x, y + 3 - b, 8, 1);          // hat cuff
  rect(COLORS.skin, x + 1, y + 4 - b, 6, 3);      // face
  rect(COLORS.black, x + 2, y + 5 - b, 1, 1);     // eyes
  rect(COLORS.black, x + 5, y + 5 - b, 1, 1);
  rect(c.coat, x + 1, y + 9 - b, 6, 4 + b);       // coat (stretches so there is no gap)
  rect(c.scarf, x, y + 7 - b, 8, 2);              // scarf
  rect(c.scarf, x + 1, y + 9 - b, 2, 3);          // scarf tail
  rect(COLORS.black, x + 2, y + 13 - (step === 1 ? 1 : 0), 2, 2);        // legs
  rect(COLORS.black, x + 4, y + 13 - (step === 2 ? 1 : 0), 2, 2);
}

function drawArm(slot) {
  // Arm pulls back while aiming, swings forward on release.
  const p = pl(slot);
  const a = p.aimAngle * DEG;
  const dx = Math.cos(a), dy = -Math.sin(a);
  let off = 0;
  if (p.swing > 0) {
    const t = 1 - p.swing / CONFIG.armSwingTime;           // 0..1
    off = t < 0.4
      ? -CONFIG.armPull + (CONFIG.armSwingReach + CONFIG.armPull) * (t / 0.4)
      : CONFIG.armSwingReach * (1 - (t - 0.4) / 0.6);
  } else if (p.aiming && p.aimValid) {
    off = -CONFIG.armPull;
  }
  const hand = handPos(slot), k = kidPos(slot);
  const sx = k.x + CONFIG.shoulderDX, sy = k.y + CONFIG.shoulderDY - breath(slot);   // the shoulder breathes with the body
  const hx = hand.x + dx * off, hy = hand.y + dy * off;
  // arm as a few coat-colored pixels from shoulder to hand
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    rect(KID_COLORS[slot].coat, sx + (hx - sx) * t - 1, sy + (hy - sy) * t - 1, 2, 2);
  }
  rect(COLORS.skin, hx - 1, hy - 1, 2, 2); // hand
}

function drawAimLine(slot) {
  const p = pl(slot);
  if (!p.aiming || !p.aimValid) return;
  const a = p.aimAngle * DEG, h = handPos(slot);
  const dx = Math.cos(a), dy = -Math.sin(a);
  const n = CONFIG.aimDots;
  const color = slot === net.localSlot ? COLORS.black : COLORS.shadow;   // the other player's line is lighter
  for (let i = 1; i <= n; i++) {
    const d = i * CONFIG.aimDotSpacing;
    ctx.globalAlpha = 1 - (i - 1) / (n + 1);   // fade toward the end
    rect(color, h.x + dx * d - 1, h.y + dy * d - 1, CONFIG.aimDotSize, CONFIG.aimDotSize);
  }
  ctx.globalAlpha = 1;
}

function drawCooldownRing(slot) {
  if (slot !== net.localSlot || state.cooldown <= 0) return;   // each player sees their own ring
  const h = handPos(slot);
  const frac = 1 - state.cooldown / CONFIG.throwCooldown;
  const n = CONFIG.ringSteps;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const px = h.x + Math.cos(ang) * CONFIG.ringRadius;
    const py = h.y + Math.sin(ang) * CONFIG.ringRadius;
    rect(i / n < frac ? COLORS.gold : COLORS.shadow, px, py, 1, 1);
  }
}

function drawSnowball(s) {
  const x = Math.round(s.x), y = Math.round(s.y);
  // 7x7 pixel disc (radius 3)
  rect(COLORS.shadow, x - 2, y - 3, 5, 7);
  rect(COLORS.shadow, x - 3, y - 2, 7, 5);
  rect(COLORS.snow, x - 2, y - 2, 4, 4);
  rect(COLORS.snow, x - 3, y - 1, 6, 2);
}

// Zigzag cracks across the wall at fixed angles (degrees, 0 = right, 90 = straight up);
// crack i shows after i+1 health lost. Each is a flat list of x,y points.
const CRACKS = [100, 60, 140, 30, 165, 80, 120, 45, 15, 175].map(a => {
  const mid = (CONFIG.fortOuter + CONFIG.fortInner) / 2;
  const pts = [];
  for (const [rad, dev] of [[CONFIG.fortOuter - 1, 0], [mid, 4], [CONFIG.fortInner + 1, -3]]) {
    const ang = (a + dev) * DEG;
    pts.push(Math.round(CONFIG.fortCX + Math.cos(ang) * rad), Math.round(CONFIG.fortCY - Math.sin(ang) * rad));
  }
  return pts;
});

function drawFort() {
  ctx.drawImage(fort, 0, 0);
  const lost = Math.min(CONFIG.fortHealth - state.health, CRACKS.length);
  for (let i = 0; i < lost; i++) {
    const c = CRACKS[i];
    for (let k = 0; k + 3 < c.length; k += 2) pixLine(c[k], c[k + 1], c[k + 2], c[k + 3], COLORS.night);
  }
  if (state.flash > 0) {
    ctx.globalAlpha = 0.7 * state.flash / CONFIG.fortFlashTime;
    ctx.drawImage(fortMask, 0, 0);
    ctx.globalAlpha = 1;
  }
}

// Sprite size (w x h standing, lw x lh lying) and colours per type. r(colour, x, y, w, h) draws
// relative to the sprite's top-left; s alternates 0/1 for the walk cycle.
const LOOK = {
  regular: { w: 10, h: 14, lw: 14, lh: 8,  hair: COLORS.brown },
  runner:  { w: 8,  h: 12, lw: 11, lh: 7,  hair: COLORS.hatGreen, coat: COLORS.shadow },
  big:     { w: 14, h: 16, lw: 16, lh: 11, hair: COLORS.black, coat: COLORS.coatBlue },
  sled:    { w: 14, h: 11, lw: 14, lh: 7,  hair: COLORS.gold, coat: COLORS.orange },
  yeti:    { w: 18, h: 20, lw: 22, lh: 12, hair: COLORS.ice, coat: COLORS.ice },   // bigger than the usual 16x16: it is the boss
};
LOOK.regular.coat = COLORS.red;

const SPRITES = {
  regular: (r, s) => {
    r(COLORS.brown, 2, 0, 6, 2);                          // hair
    r(COLORS.skin, 2, 2, 6, 4);                           // face
    r(COLORS.black, 3, 3, 1, 1); r(COLORS.black, 6, 3, 1, 1);
    r(COLORS.red, 1, 6, 8, 5);                            // red coat
    r(COLORS.red, 0, 6, 1, 4); r(COLORS.red, 9, 6, 1, 4);
    r(COLORS.skin, 0, 10, 1, 1); r(COLORS.skin, 9, 10, 1, 1);
    r(COLORS.black, 2, 11, 2, 3 - s);                     // legs swap each step
    r(COLORS.black, 6, 11, 2, 2 + s);
  },
  runner: (r, s) => {                                     // small kid, green hat
    r(COLORS.hatGreen, 1, 0, 6, 3);
    r(COLORS.hatGreen, 0, 2, 8, 1);                       // brim
    r(COLORS.skin, 1, 3, 6, 3);
    r(COLORS.black, 2, 4, 1, 1); r(COLORS.black, 5, 4, 1, 1);
    r(COLORS.shadow, 1, 6, 6, 3);                         // light-blue jacket
    r(COLORS.shadow, 0, 6, 1, 2); r(COLORS.shadow, 7, 6, 1, 2);
    r(COLORS.black, 1, 9, 2, 3 - s);
    r(COLORS.black, 5, 9, 2, 2 + s);
  },
  big: (r, s) => {                                        // large kid, blue coat
    r(COLORS.black, 3, 0, 8, 2);                          // hair
    r(COLORS.skin, 3, 2, 8, 5);
    r(COLORS.black, 4, 3, 2, 1); r(COLORS.black, 8, 3, 2, 1);   // angry brows
    r(COLORS.black, 5, 4, 1, 1); r(COLORS.black, 8, 4, 1, 1);
    r(COLORS.coatBlue, 1, 7, 12, 6);
    r(COLORS.coatBlue, 0, 7, 1, 5); r(COLORS.coatBlue, 13, 7, 1, 5);
    r(COLORS.skin, 0, 12, 1, 1); r(COLORS.skin, 13, 12, 1, 1);
    r(COLORS.snow, 6, 8, 2, 1); r(COLORS.snow, 6, 10, 2, 1);    // coat buttons
    r(COLORS.black, 3, 13, 3, 3 - s);
    r(COLORS.black, 8, 13, 3, 2 + s);
  },
  yeti: (r, s) => {                                       // big furry creature: ice-blue fur, dark face, tusks, claws
    r(COLORS.ice, 4, 0, 10, 8);                           // head
    r(COLORS.shadow, 3, 1, 1, 6); r(COLORS.shadow, 14, 1, 1, 6);
    r(COLORS.night, 6, 3, 6, 5);                          // face
    r(COLORS.snow, 7, 4, 1, 1); r(COLORS.snow, 10, 4, 1, 1);   // eyes
    r(COLORS.snow, 7, 7, 1, 2); r(COLORS.snow, 10, 7, 1, 2);   // tusks
    r(COLORS.ice, 1, 8, 16, 9);                           // furry body
    r(COLORS.shadow, 3, 10, 2, 1); r(COLORS.shadow, 8, 12, 2, 1); r(COLORS.shadow, 13, 10, 2, 1);
    r(COLORS.shadow, 5, 14, 2, 1); r(COLORS.shadow, 11, 15, 2, 1); r(COLORS.shadow, 1, 16, 16, 1);
    r(COLORS.ice, 0, 9, 2, 7); r(COLORS.ice, 16, 9, 2, 7);     // arms
    r(COLORS.night, 0, 16, 2, 2); r(COLORS.night, 16, 16, 2, 2);   // claws
    r(COLORS.shadow, 3, 17, 5, 3 - s);                    // legs
    r(COLORS.shadow, 10, 17, 5, 2 + s);
  },
  sled: (r) => {                                          // kid riding a sled
    r(COLORS.gold, 4, 0, 5, 2);                           // hat
    r(COLORS.skin, 4, 2, 5, 3);
    r(COLORS.black, 5, 3, 1, 1); r(COLORS.black, 7, 3, 1, 1);
    r(COLORS.orange, 3, 5, 7, 3);                         // orange coat
    r(COLORS.orange, 2, 5, 1, 2); r(COLORS.orange, 10, 5, 1, 2);
    r(COLORS.brown, 0, 8, 14, 2);                         // sled plank
    r(COLORS.black, 1, 10, 12, 1);                        // runners
  },
};

// Flat on its back, face up (shared by all types)
function drawLying(r, L, T, type) {
  if (type === 'yeti') {                                  // fallen Yeti: fur blanket, dark face on the left
    r(COLORS.ice, 0, 0, 22, 12);
    r(COLORS.shadow, 0, 0, 22, 1); r(COLORS.shadow, 0, 11, 22, 1);
    r(COLORS.night, 0, 3, 6, 6);
    r(COLORS.snow, 1, 4, 1, 1); r(COLORS.snow, 1, 7, 1, 1);
    r(COLORS.shadow, 9, 3, 3, 1); r(COLORS.shadow, 14, 6, 3, 1); r(COLORS.shadow, 11, 8, 3, 1);
    r(COLORS.night, 20, 1, 2, 3); r(COLORS.night, 20, 8, 2, 3);
    return;
  }
  const len = L.lw, th = L.lh, hd = Math.round(th * 0.6), lg = Math.round(th * 0.4);
  r(COLORS.skin, 0, 1, hd, th - 2);
  r(L.hair, 0, 1, 2, th - 2);
  r(COLORS.black, hd - 2, 2, 1, 1); r(COLORS.black, hd - 2, th - 3, 1, 1);
  r(L.coat, hd, 0, len - hd - lg, th);
  r(COLORS.black, len - lg, 1, lg, 2); r(COLORS.black, len - lg, th - 3, lg, 2);
  if (type === 'sled') r(COLORS.brown, 0, th, len, 2);
}

function drawBully(b) {
  const T = CONFIG.bullyTypes[b.type], L = LOOK[b.type];
  const x = Math.round(b.x), y = Math.round(b.y);
  const white = b.flash > 0;                              // hit flash: draw everything snow white
  ctx.globalAlpha = b.state === 'fading' ? Math.max(0, 1 - b.t / CONFIG.fadeTime) : 1;
  let ox, oy;
  if (b.state === 'walking') { ox = x - Math.round(L.w / 2); oy = y - T.halfH; }
  else { ox = x - Math.round(L.lw / 2); oy = y - Math.round(L.lh / 2); }
  const r = (c, px, py, w, h) => rect(white ? COLORS.snow : c, ox + px, oy + py, w, h);
  if (b.state === 'walking') SPRITES[b.type](r, Math.floor(state.time * 6 + b.ph) % 2);
  else drawLying(r, L, T, b.type);
  ctx.globalAlpha = 1;
  if (b.type === 'yeti' && b.state === 'walking' && b.hp > 0) {   // hit points above its head: one pip per hit left
    const n = CONFIG.bullyTypes.yeti.hp, px = x - Math.round((n * 3 + 1) / 2), py = oy - 6;
    rect(COLORS.night, px, py, n * 3 + 1, 4);
    for (let i = 0; i < n; i++) rect(i < b.hp ? COLORS.red : COLORS.shadow, px + 1 + i * 3, py + 1, 2, 2);
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / CONFIG.puffLife);
    rect(p.c, p.x, p.y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

// ---- UI ----
// Draw a screen pushed down by the top safe-area inset (notch / status bar); taps are offset to match
function withInset(fn) {
  ctx.save();
  ctx.translate(0, view.safeTop);
  view.ty = view.safeTop;
  fn();
  view.ty = 0;
  ctx.restore();
}

const btnH = () => Math.max(CONFIG.btnMinInternal, Math.ceil(CONFIG.btnMinPx / view.scale));

function button(label, cx, cy, w, hMul, onTap, color, gap) {
  const h = Math.ceil(btnH() * hMul);
  const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  state.buttons.push({ x, y: y + view.ty, w, h, onTap });
  rect(COLORS.night, x - 1, y - 1, w + 2, h + 2);
  rect(color || COLORS.gold, x, y, w, h);
  rect(color ? COLORS.shadow : '#e6b92e', x, y + h - 2, w, 2);
  drawText5(label, cx, y + Math.round((h - 14) / 2), 2, COLORS.night, 'center', undefined, gap);
  return h;
}

function dim() {
  ctx.globalAlpha = 0.65;
  rect(COLORS.night, 0, 0, CONFIG.W, view.h);
  ctx.globalAlpha = 1;
}

function drawFlake(x, y, on) {
  ctx.globalAlpha = on ? 1 : 0.35;
  const c = on ? COLORS.snow : COLORS.shadow;
  rect(c, x + 2, y, 1, 5); rect(c, x, y + 2, 5, 1);                   // plus
  rect(c, x, y, 1, 1); rect(c, x + 4, y, 1, 1);                       // diagonals
  rect(c, x + 1, y + 1, 1, 1); rect(c, x + 3, y + 1, 1, 1);
  rect(c, x + 1, y + 3, 1, 1); rect(c, x + 3, y + 3, 1, 1);
  rect(c, x, y + 4, 1, 1); rect(c, x + 4, y + 4, 1, 1);
  ctx.globalAlpha = 1;
}

function drawHud() {
  ctx.globalAlpha = 0.7;
  rect(COLORS.night, 0, -view.safeTop, CONFIG.W, 11 + view.safeTop);   // the strip also covers the status-bar area
  rect(COLORS.night, 1, 12, CONFIG.fortHealth * 6 + 2, 9);
  ctx.globalAlpha = 1;
  drawText('SCORE ' + state.score, 3, 3, 1, COLORS.snow);
  drawText(state.story ? 'LEVEL ' + state.story.level : 'WAVE ' + state.wave, CONFIG.W / 2, 3, 1, COLORS.snow, 'center');
  drawText('BEST ' + Math.max(bestNow(), state.score), CONFIG.W - 3, 3, 1, COLORS.snow, 'right');
  for (let i = 0; i < CONFIG.fortHealth; i++) drawFlake(3 + i * 6, 14, i < state.health);
  if (state.gun > 0) drawTextShadow('GUN ' + Math.ceil(state.gun), 3, 24, 1, COLORS.coatBlue);

  // Pause button (square, at least 44 px on screen); only tappable while playing. Co-op can't pause.
  const s = btnH(), x = CONFIG.W - 3 - s, y = 13;
  if (!isCoop()) {
    ctx.globalAlpha = 0.7;
    rect(COLORS.night, x, y, s, s);
    ctx.globalAlpha = 1;
    const bw = Math.max(2, Math.round(s / 6)), bh = Math.round(s / 2);
    rect(COLORS.snow, x + Math.round(s / 2) - bw - 1, y + Math.round((s - bh) / 2), bw, bh);
    rect(COLORS.snow, x + Math.round(s / 2) + 1, y + Math.round((s - bh) / 2), bw, bh);
    if (state.mode === 'playing') state.buttons.push({ x, y: y + view.ty, w: s, h: s, onTap: () => setMode('paused') });
  }
  drawMuteButton(isCoop() ? x : x - s - 4, y, state.mode === 'playing');
}

function drawMuteButton(x, y, tappable) {
  const s = btnH();
  ctx.globalAlpha = 0.7;
  rect(COLORS.night, x, y, s, s);
  ctx.globalAlpha = 1;
  const cx = x + Math.round(s / 2) - 1, cy = y + Math.round(s / 2);
  rect(COLORS.snow, cx - 4, cy - 1, 2, 3);                // speaker
  rect(COLORS.snow, cx - 2, cy - 2, 1, 5);
  rect(COLORS.snow, cx - 1, cy - 3, 1, 7);
  if (audio.muted) {
    pixLine(cx + 2, cy - 2, cx + 5, cy + 1, COLORS.red);  // red X
    pixLine(cx + 2, cy + 1, cx + 5, cy - 2, COLORS.red);
  } else {
    rect(COLORS.snow, cx + 2, cy - 1, 1, 3);              // sound waves
    rect(COLORS.snow, cx + 4, cy - 3, 1, 7);
  }
  if (tappable) state.buttons.push({ x, y: y + view.ty, w: s, h: s, onTap: toggleMute });
}

// Floating sparkly snowflake (7x7) with a soft shadow and twinkling gold sparkles; blinks when about to vanish
function drawPower() {
  const pw = state.power;
  if (!pw) return;
  if (CONFIG.powerLife - pw.age < 2 && Math.floor(pw.age * 8) % 2) return;
  const x = Math.round(pw.x) - 3, y = Math.round(pw.y) - 3;
  const flake = (ox, oy, arm, core) => {
    rect(arm, x + ox + 3, y + oy, 1, 7); rect(arm, x + ox, y + oy + 3, 7, 1);
    for (const [dx, dy] of [[1, 1], [5, 1], [1, 5], [5, 5]]) rect(arm, x + ox + dx, y + oy + dy, 1, 1);
    rect(core, x + ox + 2, y + oy + 2, 3, 3);
  };
  ctx.globalAlpha = 0.3;
  flake(2, 3, COLORS.night, COLORS.night);                       // shadow (cast down-right like the others)
  ctx.globalAlpha = 1;
  flake(0, 0, COLORS.shadow, COLORS.snow);
  rect(COLORS.coatBlue, x + 3, y + 3, 1, 1);
  const tw = Math.floor(pw.age * 6) % 4;                         // sparkles take turns
  const sp = [[-3, -2], [9, 1], [-2, 8], [8, 9]][tw];
  rect(COLORS.gold, x + sp[0], y + sp[1] + 1, 3, 1);
  rect(COLORS.gold, x + sp[0] + 1, y + sp[1], 1, 3);
}

function drawPopup() {
  if (!state.popup || state.mode !== 'playing') return;
  ctx.globalAlpha = Math.min(1, state.popup.t / 0.4);
  drawTextShadow(state.popup.text, CONFIG.W / 2, 130, 2, COLORS.coatBlue, 'center');
  ctx.globalAlpha = 1;
}

function drawBanner() {
  if (state.mode !== 'playing' || state.banner <= 0) return;
  ctx.globalAlpha = Math.min(1, state.banner / 0.4);   // fade out over the last 0.4 s
  drawTextShadow(state.story ? 'LEVEL ' + state.story.level : 'WAVE ' + state.wave, CONFIG.W / 2, 100, 3, COLORS.gold, 'center');
  ctx.globalAlpha = 1;
}

// Twinkling 4-point sparkle: the arms grow from a dot to 3 px and back over one cycle (seed offsets the timing)
function sparkle(x, y, seed) {
  const t = (performance.now() / 800 + seed) % 1, r = Math.round(Math.sin(t * Math.PI) * 3);
  for (const [c, o] of [[COLORS.night, 1], [COLORS.gold, 0]]) {        // dark shadow first so it shows on white snow
    rect(c, x + o, y + o, 1, 1);
    for (let i = 1; i <= r; i++) { rect(c, x + o + i, y + o, 1, 1); rect(c, x + o - i, y + o, 1, 1); rect(c, x + o, y + o + i, 1, 1); rect(c, x + o, y + o - i, 1, 1); }
  }
}

// Small yellow best-score line with sparkles around it (title screen)
function drawBestLine(str, y, seed) {
  const w = str.length * 6 - 1, x0 = Math.round(CONFIG.W / 2 - w / 2);
  drawText5(str, CONFIG.W / 2, y, 1, COLORS.gold, 'center', COLORS.night);
  sparkle(x0 - 9, y + 3, seed);                  // all beside the text so they never cover the line above or below
  sparkle(x0 + w + 9, y + 3, seed + 0.5);
  sparkle(x0 - 20, y - 1, seed + 0.25);
  sparkle(x0 + w + 20, y + 7, seed + 0.75);
}

// Level title above the boy and the progress bar under the fort (main menu only; world coordinates so they line up with the kid)
function drawLevelUi() {
  const cx = CONFIG.W / 2, sh = state.shown, lv = sh.level, max = lv >= MAX_LEVEL;
  // Gamertag floating above the boy: a gold level badge + the title on a dark plate, with a little pointer down at his head
  const name = CONFIG.levelNames[lv - 1], num = String(lv), edge = max ? COLORS.gold : COLORS.shadow;
  const badgeW = num.length * 6 - 1 + 6, nameW = name.length * 7 - 2;
  const bob = Math.round(Math.sin(performance.now() / 1000 * 2.4) * 1.4);          // slow float: -1, 0, +1 px
  const tw = 2 + badgeW + 4 + nameW + 4, th = 13, tx = Math.round(cx - tw / 2), ty = 248 + bob;
  rect(edge, tx - 1, ty - 1, tw + 2, th + 2);                       // border
  rect(COLORS.night, tx, ty, tw, th);
  rect(COLORS.gold, tx + 2, ty + 2, badgeW, 9);                     // level badge
  drawText5(num, tx + 5, ty + 3, 1, COLORS.night, undefined, undefined, 1);
  drawText5(name, tx + 2 + badgeW + 4, ty + 3, 1, max ? COLORS.gold : COLORS.snow, undefined, undefined, 2);
  for (let i = 0; i < 4; i++) {                                     // pointer
    const wo = 9 - 2 * i, wi = wo - 2, yy = ty + th + 1 + i;
    rect(edge, Math.round(cx - wo / 2), yy, wo, 1);
    if (wi > 0) rect(COLORS.night, Math.round(cx - wi / 2), yy, wi, 1);
  }
  rect(COLORS.night, Math.round(cx - 3.5), ty + th, 7, 1);         // open the plate's bottom edge into the pointer
  const bw = 120, bx = Math.round(cx - bw / 2), by = 300, bh = 8;
  const cost = max ? 1 : levelCost(lv), fw = Math.round(bw * (max ? 1 : Math.min(1, sh.xp / cost)));
  rect(COLORS.night, bx - 1, by - 1, bw + 2, bh + 2);
  rect(COLORS.ice, bx, by, bw, bh);
  if (fw > 0) {
    rect(max ? COLORS.gold : COLORS.coatBlue, bx, by, fw, bh);
    rect(max ? '#fff3b0' : COLORS.shadow, bx, by, fw, 2);                     // highlight along the top
    if (!max && state.progress.xp !== sh.xp) rect(COLORS.snow, bx + fw - 1, by, 1, bh);   // bright tip while it fills
  }
  drawText5(max ? 'MAX LEVEL' : Math.floor(sh.xp) + ' / ' + cost, cx, by + bh + 4, 1, COLORS.night, 'center', undefined, 2);
}

function drawCelebration() {
  for (const c of state.confetti) {
    const flip = Math.sin(c.ph) > 0;                                           // tumbling: wide, then tall
    rect(c.c, c.x, c.y, flip ? 3 : 2, flip ? 2 : 3);
  }
  const fx = state.levelUpFx;
  if (!fx || state.mode !== 'title') return;
  const a = Math.min(1, fx.t / 0.5);
  ctx.globalAlpha = a * 0.92;
  rect(COLORS.night, Math.round((CONFIG.W - 154) / 2), 190, 154, 30);   // hugs the text
  ctx.globalAlpha = a;
  drawText5('LEVEL UP!', CONFIG.W / 2, 198, 2, COLORS.gold, 'center', undefined, 6);
  ctx.globalAlpha = 1;
}

// Install hint: only after the browser fires beforeinstallprompt; gone once installed
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; });
window.addEventListener('appinstalled', () => { installEvent = null; });
function promptInstall() {
  const e = installEvent;
  installEvent = null;               // a prompt event can only be used once
  if (e) e.prompt();
}

// Update banner: index.html fires 'snowball-update' when a new service worker takes over (not on the first install).
// Shown on every screen except mid-game so it never interrupts a run; tapping reloads into the new version.
let updateReady = false;
window.addEventListener('snowball-update', () => { updateReady = true; });
function drawUpdateBanner() {
  // On a short canvas the bottom of the title screen holds the level bar, so tuck the banner under the top buttons instead
  const cy = state.mode === 'title' && view.h < CONFIG.H + 44 ? view.safeTop + 3 + btnH() + 8 + Math.ceil(btnH() / 2)
    : view.h - view.safeBottom - 4 - Math.ceil(btnH() / 2);
  button('TAP TO UPDATE', CONFIG.W / 2, cy, 176, 1, () => location.reload(), COLORS.hatGreen);
}

function drawTitle() {
  drawText5('SNOWBALL', CONFIG.W / 2, 50, 3, COLORS.coatBlue, 'center', COLORS.night);
  drawBestLine('BEST: ' + state.best, 88, 0);
  drawBestLine('CO-OP BEST: ' + state.coopBest, 102, 0.37);
  const sh = button('STORY', CONFIG.W / 2, 140, 100, 1, () => setMode('levels'), COLORS.hatGreen, 1);
  button('WAVES', CONFIG.W / 2, 140 + sh + 8, 100, 1, () => setMode('wavesmenu'));
  // level badge on the Story button's top-right corner
  const bt = 'LV ' + state.storyUnlocked, bw = bt.length * 6 + 5, bx = CONFIG.W / 2 + 50 - bw + 4, by = 140 - Math.ceil(sh / 2) - 5;
  rect(COLORS.night, bx - 1, by - 1, bw + 2, 12);
  rect(COLORS.red, bx, by, bw, 10);
  drawText5(bt, bx + Math.round(bw / 2), by + 2, 1, COLORS.snow, 'center');
  if (installEvent) button('INSTALL', 3 + 43, 3 + Math.ceil(btnH() / 2), 86, 1, promptInstall, COLORS.ice, 1);   // top left
  drawMuteButton(CONFIG.W - 3 - btnH(), 3, true);
}

// ---- Co-op screens ----
function keyBtn(label, x, y, w, h, onTap) {
  state.buttons.push({ x, y: y + view.ty, w, h, onTap });
  rect(COLORS.night, x - 1, y - 1, w + 2, h + 2);
  rect(COLORS.ice, x, y, w, h);
  rect(COLORS.shadow, x, y + h - 2, w, 2);
  drawGlyph5(label, x + Math.round((w - 10) / 2), y + Math.round((h - 14) / 2), 2, COLORS.night);
}

function drawWavesMenu() {
  drawText5('WAVES', CONFIG.W / 2, 50, 3, COLORS.coatBlue, 'center', COLORS.night);
  drawBestLine('BEST: ' + state.best, 88, 0);
  drawBestLine('CO-OP BEST: ' + state.coopBest, 102, 0.37);
  const h = btnH();
  button('SOLO', CONFIG.W / 2, 140, 100, 1, startGame);
  button('CO-OP', CONFIG.W / 2, 140 + h + 8, 100, 1, openCoopMenu, COLORS.ice, 1);
  button('BACK', CONFIG.W / 2, 140 + 2 * (h + 8), 76, 1, () => setMode('title'), COLORS.shadow, 1);
}

function drawLevels() {
  drawText5('STORY', CONFIG.W / 2, 30, 3, COLORS.coatBlue, 'center', COLORS.night);
  const h = btnH();
  for (let n = 1; n <= CONFIG.storyLevels; n++) {
    const col = (n - 1) % 2, row = Math.floor((n - 1) / 2), ok = n <= state.storyUnlocked;
    button(String(n), CONFIG.W / 2 + (col ? 34 : -34), 70 + row * (h + 8), 56, 1, ok ? (n === 1 ? startCutscene : () => startStory(n)) : () => {}, ok ? COLORS.gold : COLORS.shadow, 1);
  }
  button('BACK', CONFIG.W / 2, 70 + 5 * (h + 8) + 6, 76, 1, () => setMode('title'), COLORS.ice, 1);
}

function drawLevelWin() {
  dim();
  const n = state.story.level, last = n >= CONFIG.storyLevels;
  drawTextShadow(last ? 'YOU WIN!' : 'LEVEL ' + n + ' CLEAR', CONFIG.W / 2, 60, 2, COLORS.gold, 'center');
  drawTextShadow('SCORE: ' + state.score, CONFIG.W / 2, 100, 2, COLORS.snow, 'center');
  let y = 150;
  if (!last) y += button('NEXT LEVEL', CONFIG.W / 2, y, 140, 1.3, () => startStory(n + 1)) + 10;
  button('MENU', CONFIG.W / 2, y + Math.ceil(btnH() / 2) + (last ? 0 : 6), 100, 1, () => { resetGame(); state.story = null; setMode('levels'); }, COLORS.ice);
}

function drawCoopMenu() {
  const cx = CONFIG.W / 2, h = Math.ceil(btnH() * 1.3);
  drawText5('CO-OP', cx, 36, 3, COLORS.coatBlue, 'center', COLORS.night);
  drawText5('TWO PLAYERS - ONE FORT', cx, 68, 1, COLORS.night, 'center', COLORS.snow);
  button('CREATE GAME', cx, 120, 160, 1.3, () => { setMode('coophost'); hostGame(); });
  button('JOIN GAME', cx, 120 + h + 10, 140, 1.3, () => { state.entry = ''; net.status = 'idle'; net.error = ''; setMode('coopjoin'); });
  button('BACK', cx, 120 + 2 * (h + 10), 100, 1, () => setMode('title'), COLORS.ice);
}

function drawCoopHost() {
  const cx = CONFIG.W / 2;
  drawText5('YOUR CODE', cx, 34, 2, COLORS.coatBlue, 'center', COLORS.night);
  if (net.status === 'error') {
    drawText5(net.error, cx, 80, net.error.length > 15 ? 1 : 2, COLORS.red, 'center', COLORS.snow);
    drawText5('CHECK YOUR INTERNET', cx, 104, 1, COLORS.night, 'center', COLORS.snow);
    drawText5('AND TRY AGAIN', cx, 114, 1, COLORS.night, 'center', COLORS.snow);
  } else {
    drawCode(net.code, cx, 58, 3, CONFIG.codeLength);
    drawText5('YOUR FRIEND TAPS JOIN GAME', cx, 100, 1, COLORS.night, 'center', COLORS.snow);
    drawText5('AND TYPES THIS CODE', cx, 111, 1, COLORS.night, 'center', COLORS.snow);
    const dots = '.'.repeat(1 + Math.floor(performance.now() / 400) % 3);
    drawText5((net.status === 'opening' ? 'OPENING' : 'WAITING FOR PLAYER') + dots, cx, 136, 1, COLORS.coatBlue, 'center', COLORS.snow);
  }
  button('CANCEL', cx, 200, 100, 1, backToCoopMenu, COLORS.ice);
}

function drawCoopJoin() {
  const cx = CONFIG.W / 2, kh = btnH();
  drawText5('JOIN GAME', cx, 8, 3, COLORS.coatBlue, 'center', COLORS.night);
  drawCode(state.entry, cx, 34, 2, CONFIG.codeLength);
  const msg = net.status === 'connecting' ? 'CONNECTING...' : net.status === 'connected' ? 'CONNECTED - WAITING FOR HOST'
    : net.status === 'error' ? net.error : 'ENTER THE GAME CODE';
  drawText5(msg, cx, 62, 1, net.status === 'error' ? COLORS.red : COLORS.night, 'center', COLORS.snow);
  const L = CONFIG.codeLetters;
  [L.slice(0, 9), L.slice(9, 18), L.slice(18)].forEach((row, ri) => {        // 9 + 9 + 8 keys, A-Z
    const x0 = Math.round((CONFIG.W - (row.length * 19 - 2)) / 2), y = 78 + ri * (kh + 4);
    [...row].forEach((ch, i) => keyBtn(ch, x0 + i * 19, y, 17, kh, () => addLetter(ch)));
  });
  const by = 78 + 3 * (kh + 4) + Math.ceil(kh / 2) + 4;
  button('DEL', 52, by, 70, 1, delLetter, COLORS.ice);
  button('BACK', 128, by, 70, 1, backToCoopMenu, COLORS.ice);
}

function drawLost() {
  dim();
  drawTextShadow('CONNECTION LOST', CONFIG.W / 2, 100, 2, COLORS.snow, 'center');
  drawTextShadow('THE OTHER PLAYER LEFT', CONFIG.W / 2, 124, 1, COLORS.snow, 'center');
  button('MENU', CONFIG.W / 2, 170, 110, 1, leaveCoop);
}

function drawPaused() {
  dim();
  drawTextShadow('PAUSED', CONFIG.W / 2, 80, 3, COLORS.snow, 'center');
  const h = btnH();
  button('RESUME', CONFIG.W / 2, 140, 110, 1, () => setMode('playing'));
  button('QUIT', CONFIG.W / 2, 140 + h + 10, 110, 1, () => { awardXp(state.score); resetGame(); state.story = null; setMode('title'); });   // quitting still banks the score
}

function drawGameOver() {
  dim();
  drawTextShadow('GAME OVER', CONFIG.W / 2, 50, 3, COLORS.snow, 'center');
  drawTextShadow('SCORE: ' + state.score, CONFIG.W / 2, 92, 2, COLORS.snow, 'center');
  drawTextShadow('BEST: ' + bestNow(), CONFIG.W / 2, 112, 2, COLORS.snow, 'center');
  if (state.newBest) drawTextShadow('NEW BEST!', CONFIG.W / 2, 136, 2, COLORS.gold, 'center');
  if (state.lastXp > 0) drawText5('+' + state.lastXp + ' TO YOUR LEVEL BAR', CONFIG.W / 2, 160, 1, COLORS.snow, 'center', COLORS.night);
  if (net.role === 'guest') drawTextShadow('WAITING FOR HOST...', CONFIG.W / 2, 184, 1, COLORS.snow, 'center');
  else if (state.story) {
    button('RETRY', CONFIG.W / 2, 190, 150, 1.3, () => startStory(state.story.level));
    button('MENU', CONFIG.W / 2, 190 + Math.ceil(btnH() * 1.3) + 10, 100, 1, () => { resetGame(); state.story = null; setMode('levels'); }, COLORS.ice);
  } else button('PLAY AGAIN', CONFIG.W / 2, 190, 150, 1.3, startGame);
  if (isCoop()) button('MENU', CONFIG.W / 2, 190 + Math.ceil(btnH() * 1.3) + 10, 100, 1, leaveCoop, COLORS.ice);
}

// Top-down cast shadow: the fort and kid silhouettes, offset away from the light (upper left)
function drawShadow() {
  const ox = CONFIG.shadowOffX, oy = CONFIG.shadowOffY;
  ctx.globalAlpha = CONFIG.shadowAlpha;
  ctx.drawImage(fortShadow, ox, oy);
  for (const sl of slots()) {
    const k = kidPos(sl), x = k.x + ox, y = k.y + oy;
    rect(COLORS.night, x + 1, y, 6, 7);            // hat and head
    rect(COLORS.night, x, y + 7, 8, 6);            // scarf and coat
    rect(COLORS.night, x + 2, y + 13, 4, 2);       // legs
  }
  ctx.globalAlpha = 1;
}

// Footprints fade out into the snow; drawn under everything else
function drawPrints() {
  for (const p of state.prints) {
    ctx.globalAlpha = CONFIG.footstepAlpha * (1 - p.t / CONFIG.footstepLife);
    rect(COLORS.shadow, p.x, p.y, p.w, 2);
  }
  ctx.globalAlpha = 1;
}

// The avalanche: a rolling wall of snow (jagged leading edge, light-blue shading so it shows on white ground), fading out behind it
function drawAvalanche() {
  const av = state.avalanche;
  if (!av) return;
  const t = performance.now() / 1000, top = av.y - CONFIG.avalancheBand, q = CONFIG.avalancheBand / 4;
  for (let x = 0; x < CONFIG.W; x += 6) {
    const lead = av.y + Math.round(Math.sin(x * 0.45 + t * 14) * 3) + (x % 12 ? 0 : 2);      // rolling, uneven front
    for (let k = 0; k < 4; k++) {
      ctx.globalAlpha = 0.25 * (k + 1);
      rect(COLORS.snow, x, top + k * q, 6, q + (k === 3 ? lead - av.y : 0));
    }
    ctx.globalAlpha = 0.9;
    rect(COLORS.ice, x, lead - 10, 6, 7);
    ctx.globalAlpha = 1;
    rect(COLORS.shadow, x, lead - 3, 6, 3);
    rect(COLORS.ice, x + (Math.floor(t * 20) + x) % 4, lead - 16 - (x * 7) % 9, 2, 2);      // tumbling chunks
  }
  ctx.globalAlpha = 1;
}

// Trees and bullies drawn back to front by their feet, so a bully above a tree is hidden behind its foliage
function drawTreesAndBullies() {
  const items = [];
  for (const p of activeTrees()) items.push({ y: p[1] + 15, draw: () => ctx.drawImage(treeImg, p[0], p[1]) });
  for (const b of state.bullies) {
    const lying = b.state !== 'walking';
    items.push({ y: lying ? b.y - 100 : b.y + CONFIG.bullyTypes[b.type].halfH, draw: () => drawBully(b) });  // fallen bullies lie under everything
  }
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.draw();
}

// Studio logo splash on launch: fades in and out, tap to skip
const logoEl = document.getElementById('logo');
const SPLASH_TIME = 2.4;
let splashT = 0;
function drawSplash() {
  rect('#ffffff', 0, 0, CONFIG.W, view.h);
  if (logoEl) logoEl.style.opacity = Math.max(0, Math.min(1, splashT / 0.5, (SPLASH_TIME - splashT) / 0.5));
  state.buttons.push({ x: 0, y: 0, w: CONFIG.W, h: view.h, onTap: () => setMode('title') });
}

function draw() {
  state.buttons = [];
  if (state.mode === 'splash') { drawSplash(); return; }
  if (logoEl && logoEl.parentNode) logoEl.remove();
  const cut = state.mode === 'cutscene';
  const shaking = cut && state.cut.t > CUT.shake && state.cut.t < CUT.shake + 1.2;
  if (shaking) { ctx.save(); ctx.translate(Math.round((Math.random() - 0.5) * 6), Math.round((Math.random() - 0.5) * 6)); }
  ctx.clearRect(-8, -8, CONFIG.W + 16, view.h + 16);
  ctx.drawImage(bg, 0, 0);
  drawFlakes();
  if (cut) { drawCutscene(); if (shaking) ctx.restore(); drawCelebration(); return; }
  drawShadow();
  drawPrints();
  drawTreesAndBullies();
  drawPower();
  drawAvalanche();
  drawFort();
  for (const sl of slots()) drawKid(sl);
  for (const sl of slots()) drawArm(sl);
  for (const sl of slots()) drawCooldownRing(sl);
  for (const sl of slots()) drawAimLine(sl);
  for (const s of state.snowballs) drawSnowball(s);
  drawParticles();
  if (state.mode === 'title') { drawLevelUi(); withInset(drawTitle); }
  else if (state.mode === 'levels') withInset(drawLevels);
  else if (state.mode === 'wavesmenu') withInset(drawWavesMenu);
  else if (state.mode === 'coopmenu') withInset(drawCoopMenu);
  else if (state.mode === 'coophost') withInset(drawCoopHost);
  else if (state.mode === 'coopjoin') withInset(drawCoopJoin);
  else {
    withInset(drawHud);
    drawBanner();
    drawPopup();
    if (state.mode === 'paused') drawPaused();
    else if (state.mode === 'gameover') drawGameOver();
    else if (state.mode === 'levelwin') drawLevelWin();
  }
  drawCelebration();
  if (isCoop() && net.lost && (state.mode === 'playing' || state.mode === 'gameover')) drawLost();
  if (updateReady && state.mode !== 'playing') drawUpdateBanner();
}

// ---------- Loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(CONFIG.maxDt, (now - last) / 1000);
  last = now;
  if (net.role === 'guest' && (state.mode === 'playing' || state.mode === 'gameover')) updateGuest(dt);   // the host runs the world
  else if (state.mode === 'playing') update(dt);
  else if (state.mode === 'cutscene') { updateFlakes(dt); updateCutscene(dt); }
  else if (state.mode !== 'paused') updateFlakes(dt);   // snow keeps falling on menus / game over
  if (state.mode === 'splash' && (splashT += dt) >= SPLASH_TIME) setMode('title');
  if (isCoop()) netTick(dt);
  if (state.mode === 'title') updateProgress(dt);
  if (state.mode !== 'paused') updateCelebration(dt);
  ctx.imageSmoothingEnabled = false;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
