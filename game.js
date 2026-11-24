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
  runnerSpeed: 55,        // px/s the Runner moves at full joystick
  homeSpeed: 70,          // px/s the boy runs along the inside of the Home
  homeWinHp: 10,          // window boards; enemies chew them down, the boy standing at the window repairs them
  homeAttack: 2,          // window damage per second = bully fortDamage x this (one Regular loses to the boy's repair, two win)
  homeRepair: 3,          // window hp per second while the boy stands at it
  homeRepairDist: 20,
  homeL: 20, homeR: 340,  // the house spans these world x's; its 12 px end walls are inside, snow outside
  castleHp: 60,           // Last Battle: snowball hits to bring the Castle down
  castleGuards: 2,        // fast little enemies standing guard in front of it (they throw themselves in front of snowballs)
  lastTop: -900,          // Last Battle: world y of the Castle's base (the map runs from the house up to here)
  homeWinHalf: 22,        // half the window opening width
  stickRadius: 18,        // px the joystick knob can travel from where the thumb landed
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
    // Snowball Thrower: Home mode only (Story level 4+, endless wave 15+); stops at random moments to lob a snowball at a window or the boy
    thrower: { speedMul: 0.8, hp: 1, points: 30, fortDamage: 1, radius: 6, halfH: 7, from: 1, weight: 2, weightPer: 0.3, weightMax: 4, throws: true },
    // Snowmobile: Home mode only (Story level 6+, endless wave 15+); races to a window, drops off a random enemy, drives away. Hit first = it crashes and the rider is dropped there
    snowmobile: { speedMul: 3, hp: 1, points: 30, fortDamage: 0, radius: 8, halfH: 7, from: 1, weight: 1.5, weightPer: 0.3, weightMax: 3, drives: true },
    // Yeti: not part of the random mix (special); a fixed number of them is slipped into each wave from wave 11
    yeti:    { speedMul: 0.7, hp: 5, points: 100, fortDamage: 4, fortHit: 2.5, radius: 10, halfH: 10, from: 11, weight: 0, weightPer: 0, weightMax: 0, special: true },
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
  waveBonus: 100,
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
  storageKey: 'snowball_bestwave',            // best wave reached (solo, per map)
  coopStorageKey: 'snowball_coop_bestwave',   // co-op has its own best wave
  runnerKey: 'snowball_runner',                 // highest Runner level unlocked (11 = all cleared)
  lastLvKey: 'snowball_lastlv',                 // highest Last Battle badge (Yetis at the Castle) beaten
  lastDoneKey: 'snowball_lastdone',             // set once the Last Battle has been won
  homeLvKey: 'snowball_homelevels',             // highest Home level unlocked (11 = all cleared)
  storyKey: 'snowball_story',                   // highest Story level unlocked
  storyLevels: 10,        // Story campaign: each level is one wave (pass or fail); level n uses wave 2n-1's difficulty
  progressKey: 'snowball_progress',             // { level, xp } saved on this device
  // Levels: every game's score is added to the bar; a full bar levels you up and the bar restarts (leftover score carries over).
  levelNames: ['NEWBORN', 'SNOW TODDLER', 'FLAKE FIGHTER', 'SNOWBALL ROOKIE', 'FROST THROWER', 'ICE SLINGER',
               'BLIZZARD BOSS', 'FROST CAPTAIN', 'SNOW HERO', 'SNOW LEGEND', 'ICE WARDEN', 'WINTER KNIGHT', 'FROST BARON',
               'BLIZZARD BUFF', 'SNOW SAGE', 'GLACIER KING', 'ARCTIC TITAN', 'FROZEN EMPEROR', 'STORM OF SNOW', 'SNOWBALLY LEGEND'],
  levelCosts: [800, 1200, 1800, 2600, 3400, 4500, 5700, 7000, 8600, 10200, 12000, 14000, 16000, 18300, 20700, 23200, 26000, 28800, 31800],   // score needed to leave level 1..19
  levelBarSeconds: 1.4,   // how long a full bar takes to fill on the menu
  confettiCount: 130,
  mutedKey: 'snowball_muted',
  battleKey: 'snowball_battlewins',            // Battle wins (solo)
  battleCoopKey: 'snowball_battlecoopwins',    // Battle wins (co-op)
  sfxVolume: 0.3,         // master volume (0-1); sounds are short and quiet on purpose
};

const COLORS = {
  snow: '#f4f8ff', ice: '#bfe3ff', shadow: '#7aa5d6', night: '#1c2b4a',
  coatBlue: '#3b6fd9', skin: '#f2c9a0', brown: '#8a5a33', black: '#111',
  gold: '#ffd23f', hatGreen: '#3fa34d',
  orange: '#f28c28', // scarf (simplest addition to the palette)
  red: '#d93b3b',
  pink: '#ff7eb6', blonde: '#f5d97a',
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

function loadRunner() { return Math.max(1, Math.min(CONFIG.storyLevels + 1, loadBest(CONFIG.runnerKey))); }
function loadHomeLv() { return Math.max(1, Math.min(CONFIG.storyLevels + 1, loadBest(CONFIG.homeLvKey))); }
function loadStory() { return Math.max(1, Math.min(CONFIG.storyLevels + 1, loadBest(CONFIG.storyKey))); }

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
const freshRemote = () => ({ aimAngle: 90, aimValid: false, aiming: false, cooldown: 0, swing: 0, gun: 0, gunTimer: 0, px: 90, py: 200, walkT: 0, perks: {}, score: 0 });
const HURT_TIME = 0.4;                         // s the kid flashes red and hops after a hit
function kidPos(slot) {                        // (with the hop while hurt)
  const k = kidBase(slot);
  return state.hurt > 0 ? { x: k.x, y: k.y - Math.round(Math.sin((1 - state.hurt / HURT_TIME) * Math.PI) * 4) } : k;
}
function kidBase(slot) {
  if (state.runner || state.home) { const p = pl(slot); return { x: Math.round(p.px - 4), y: Math.round(p.py - 7) }; }
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
  hurt: () => { tone('square', 420, 170, 0.16, 0.4); tone('sawtooth', 300, 110, 0.22, 0.3, 0.04); noise('bandpass', 1200, 300, 0.12, 0.35); },   // 'oof'
  hammer: () => { [0, 0.16].forEach(d => { tone('sine', 150, 55, 0.12, 0.9, d); tone('triangle', 260, 100, 0.07, 0.4, d); noise('lowpass', 500, 150, 0.06, 0.4, d); }); },        // hammer and nail
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
  bests: { fort: loadBest(), runner: loadBest(CONFIG.storageKey + '_runner'), home: loadBest(CONFIG.storageKey + '_home') },   // solo best per map
  coopBests: { fort: loadBest(CONFIG.coopStorageKey), runner: loadBest(CONFIG.coopStorageKey + '_runner'), home: loadBest(CONFIG.coopStorageKey + '_home') },   // co-op best per map
  story: null,         // { level, last } while a Story level is running
  storyUnlocked: loadStory(),
  runnerUnlocked: loadRunner(),
  homeUnlocked: loadHomeLv(),
  lastDone: loadBest(CONFIG.lastDoneKey) > 0,
  lastLv: Math.max(loadBest(CONFIG.lastLvKey), loadBest(CONFIG.lastDoneKey) > 0 ? 1 : 0),   // badges beaten; the next one is unlocked
  lastSel: 1,          // badge chosen for the next Last Battle = Yetis that spawn at the Castle
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
  enemyBalls: [],
  cooldown: 0,
  swing: 0,            // arm swing timer, counts down from armSwingTime
  aiming: false,
  pointerId: null,
  anchor: { x: 0, y: 0 },
  aimAngle: 90,        // degrees, 90 = straight up
  aimValid: false,     // pull >= minPull
  runner: false,       // Runner waves: the kid roams, no fort
  wantRunner: false,   // what the menu picked (co-op host starts with it)
  typeCoop: false,
  last: false,         // Last Battle: Home with the door open, no perks, not saved as a Home best
  home: false,         // Home waves: the boy runs inside a house and throws out of its windows
  wins: [],            // home windows { x, hp }
  door: { x: 180, open: false },   // home door (perk-unlocked)
  perks: {},           // owned home perks { id: true }
  ask: null,           // perk id being confirmed
  camX: 0, camY: 0,
  castleHp: 0, cwT: 0, lastN: 0, guardT: 0, lbWave: 0, lbLeft: 0, lbLimit: 0,   // + Last Battle waves cleared, enemies left in this wave, and how far north the boy may go for now
     // Last Battle: Castle health, win-sequence clock, spawn counter, guard refill timer
  walkT: 0,
  hurt: 0,             // timer: kid flashes red and bounces when the fort / player is hit
  px: 90, py: 200,     // runner position (centre of the kid)
  stick: null,         // { id, ax, ay, dx, dy } floating joystick
  battle: null,        // Battle match in progress (see btNew)
  wantBattle: false,   // the co-op menu was opened from Battle
  bWins: loadBest(CONFIG.battleKey), bCoopWins: loadBest(CONFIG.battleCoopKey),
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
  if (state.runner || state.mode === 'battle' || (state.home && (state.door.open || state.py < homeWallY() + 5))) { state.aimAngle = a; return; }   // Runner, or Home with the door open / outside: full 360          // Runner: full 360
  const lo = state.home ? 0 : CONFIG.minAngle, hi = state.home ? 180 : CONFIG.maxAngle;   // Home: straight left or right is allowed
  if (a < 0) a = a > -90 ? lo : hi;                           // downward -> nearest edge
  state.aimAngle = Math.min(hi, Math.max(lo, a));
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
    netSend({ k: 't', a: r1(p.aimAngle), x: r1(state.px), y: r1(state.py - wallOff()) });
    p.cooldown = CONFIG.throwCooldown;                // local feedback right away
    p.swing = CONFIG.armSwingTime;
    
    return;
  }
  const a = p.aimAngle * DEG, h = handPos(slot);
  state.snowballs.push({
    x: h.x, y: h.y, owner: slot, auto: !!auto,
    vx: Math.cos(a) * CONFIG.snowballSpeed, vy: -Math.sin(a) * CONFIG.snowballSpeed,
  });
  if (!auto) p.cooldown = CONFIG.throwCooldown;
  p.swing = CONFIG.armSwingTime;
  sfx('throw', slot === 1 && !auto);                  // the guest already played its own manual throw sound
}

// Guest only: tell the host where we are aiming (throttled) so it can draw our dotted line and use it for the machine gun
const wallOff = () => state.home ? homeWallY() : 0;   // co-op sends y relative to the house wall: each screen has its own height
function sendAim(force) {
  if (net.role !== 'guest' || state.mode === 'battle') return;
  const t = performance.now();
  if (!force && t - (net.lastAimSent || 0) < 60) return;
  net.lastAimSent = t;
  netSend({ k: 'a', a: r1(state.aimAngle), v: state.aiming && state.aimValid ? 1 : 0, x: r1(state.px), y: r1(state.py - wallOff()) });
}

function hitButton(p) {
  return state.buttons.find(b => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
}

window.addEventListener('pointerdown', e => {
  e.preventDefault();
  initAudio();                       // browsers only allow audio after a user gesture
  const b = hitButton(toCanvas(e));
  if (b) { b.onTap(); sfx('click'); return; }
  if ((state.mode !== 'playing' && state.mode !== 'battle') || state.ask) return;
  if (state.mode === 'battle' && !btCanAct()) return;
  if ((state.runner || state.home || state.mode === 'battle') && toCanvas(e).x < CONFIG.W / 2) {          // left half: floating joystick
    if (!state.stick) { const p = toCanvas(e); state.stick = { id: e.pointerId, ax: p.x, ay: p.y, dx: 0, dy: 0 }; }
    return;
  }
  if (state.aiming) return;
  state.aiming = true;
  state.pointerId = e.pointerId;
  state.anchor = toCanvas(e);
  state.aimValid = false;
  state.aimAngle = 90;
}, { passive: false });

window.addEventListener('pointermove', e => {
  const st = state.stick;
  if (st && e.pointerId === st.id) {
    e.preventDefault();
    const p = toCanvas(e);
    let dx = p.x - st.ax, dy = p.y - st.ay;
    const d = Math.hypot(dx, dy);
    if (d > CONFIG.stickRadius) {                              // drag the base along so the thumb never leaves it
      st.ax += dx / d * (d - CONFIG.stickRadius); st.ay += dy / d * (d - CONFIG.stickRadius);
      dx = p.x - st.ax; dy = p.y - st.ay;
    }
    st.dx = dx / CONFIG.stickRadius; st.dy = dy / CONFIG.stickRadius;
    return;
  }
  if (!state.aiming || e.pointerId !== state.pointerId) return;
  e.preventDefault();
  updateAim(toCanvas(e));
  sendAim();
}, { passive: false });

window.addEventListener('pointerup', e => {
  if (state.stick && e.pointerId === state.stick.id) { state.stick = null; sendAim(true); return; }
  if (state.mode === 'battle') { if (state.aiming && e.pointerId === state.pointerId) { e.preventDefault(); updateAim(toCanvas(e)); btRelease(); endAim(); } return; }
  if (!state.aiming || e.pointerId !== state.pointerId) return;
  e.preventDefault();
  updateAim(toCanvas(e));
  // Throw only if pull is long enough and the cooldown is over
  if (state.aimValid && state.cooldown <= 0 && state.gun <= 0) throwSnowball(net.localSlot);   // machine gun fires by itself
  endAim();
  sendAim(true);
}, { passive: false });

window.addEventListener('pointercancel', e => {
  if (state.stick && e.pointerId === state.stick.id) state.stick = null;
  if (e.pointerId === state.pointerId) endAim();
});
window.addEventListener('blur', () => { endAim(); state.stick = null; });

state.shown = { ...state.progress };

// ---------- Update ----------
function updateFlakes(dt) {
  for (const f of state.flakes) {
    f.y += f.v * dt;
    f.ph += dt;
    if (f.y > view.h) { f.y = -2; f.x = Math.random() * CONFIG.W; }
  }
}

const clampRx = x => Math.max(8, Math.min(CONFIG.W - 8, x)), clampRy = y => Math.max(24, Math.min(view.h - 10, y));
// Home perks: plaques on the outer wall (two left of the door, two right); hit one with a snowball to buy it
const HOME_PERKS = [
  { id: 'health', name: 'HEALTH', x: 120, cost: 2000 },
  { id: 'avalanche', name: 'AVALANCHE', x: 150, cost: 2000 },
  { id: 'gun', name: 'MACHINE GUN', x: 210, cost: 500 },
  { id: 'door', name: 'DOOR', x: 240, cost: 500 },
  { id: 'checkpoint', name: 'CHECKPOINT', x: CONFIG.homeR - 6, dy: 16, side: true, cost: 500 },
];
const checkpointTarget = () => Math.floor(state.wave / 5) * 5 + 5;   // next multiple of 5 above the current wave
const checkpointOk = () => checkpointTarget() <= (isCoop() ? state.coopBests : state.bests)[mapKind()];   // only waves reached before
function askPerk(id, slot) {        // co-op: the game keeps running, only the buyer sees the confirm screen
  if (state.story || state.last) return;           // no perks in Home levels
  if (!isCoop()) { state.ask = id; setMode('perkconfirm'); return; }
  if (slot === net.localSlot) state.ask = id; else netSend({ k: 'q', id });
}
function closePerk() { state.ask = null; state.mode = 'playing'; }
function buyPerk(p, slot = net.localSlot) {
  if (net.role === 'guest') { netSend({ k: 'b', id: p.id }); return; }   // the host does the buying
  const pp = pl(slot);
  if (pp.perks[p.id] || pp.score < p.cost) return;
  if (p.id === 'checkpoint') {                       // used on purchase: skips ahead to the next checkpoint wave
    if (!checkpointOk()) return;
    pp.score -= p.cost;
    state.bullies = [];
    startWave(checkpointTarget());
    state.popup = { text: 'CHECKPOINT!', t: 1.4 };
    return;
  }
  pp.score -= p.cost;
  pp.perks[p.id] = true;
  sfx('power');
  state.popup = { text: p.name + ' BOUGHT!', t: 1.4 };
}
function usePerk(id, slot = net.localSlot) {
  if (net.role === 'guest') { if (state.mode === 'playing' && state.perks[id]) netSend({ k: 'u', id }); return; }   // the host applies it
  const pp = pl(slot);
  if (state.mode !== 'playing' || !pp.perks[id] || performance.now() - (state.resumeAt || -1e9) < 500) return;   // ignore the tap that resumes from pause
  const wy = homeWallY(), d = state.door;
  if (id === 'health') {
    if (state.health >= CONFIG.fortHealth) { state.popup = { text: 'HEALTH FULL', t: 1.2 }; return; }
    state.health = CONFIG.fortHealth;
    puff(pp.px, pp.py);
    state.popup = { text: 'HEALED!', t: 1.4 };
  } else if (id === 'avalanche') {
    state.avalanche = { y: -CONFIG.avalancheBand, owner: slot };
    sfx('avalanche');
    state.popup = { text: 'AVALANCHE!', t: 1.4 };
  } else if (id === 'gun') {
    pp.gun = CONFIG.gunTime; pp.gunTimer = 0;
    state.popup = { text: 'MACHINE GUN!', t: 1.4 };
  } else if (id === 'door') {
    if (d.open) {                                              // closing: the boy must be safely inside, clear of the doorway
      const ps = slots().map(pl);
      if (ps.some(q => q.py < wy + 14 || (Math.abs(q.px - d.x) <= 14 && q.py < wy + 30))) { state.popup = { text: 'DOOR BLOCKED', t: 1.2 }; return; }
      d.open = false; for (const q of ps) q.py = wy + 18;
      state.popup = { text: 'DOOR CLOSED', t: 1.4 };
    } else { d.open = true; state.popup = { text: 'DOOR OPEN', t: 1.4 }; }
  }
  pp.perks[id] = false;
  sfx('power');
}
const windowAttackers = w => state.bullies.filter(b => b.state === 'walking' && b.phase === 1 && state.wins[b.win] === w).length;
const homeWalkable = (x, y) => {            // where the boy may stand (door open)
  const wy = homeWallY(), L = CONFIG.homeL + 18, R = CONFIG.homeR - 18;
  if (y >= wy + 18 && y <= wy + 54) return x >= L && x <= R;                                   // floor
  if (Math.abs(x - state.door.x) <= 5 && y >= wy - 8 && y <= wy + 54) return true;             // doorway
  return y >= (state.last ? Math.max(CONFIG.lastTop + 24, state.lbLimit) : 24) && y <= wy - 8 && x >= 8 && x <= CONFIG.W * 2 - 8;   // yard
};
const homeWallY = () => view.h - 130 + (state.mode === 'homelevels' || state.mode === 'runpan' ? 24 : 0);   // the level-select page draws the house a little lower   // the house sits above the bottom edge so thumbs have room
function homeRepair(dt) {                     // every boy standing at a window repairs it
  const wy = homeWallY();
  let fixing = null;
  for (const w of state.wins) {
    const n = slots().map(pl).filter(p => p.py > wy + 10 && Math.abs(p.px - w.x) <= CONFIG.homeRepairDist).length;
    if (!n) continue;
    const att = windowAttackers(w);
    if (att === 1) continue;                                   // one enemy vs the boy: stalemate, nothing happens
    if (w.hp < CONFIG.homeWinHp || att > 1) fixing = w;
    w.hp = Math.min(CONFIG.homeWinHp, w.hp + CONFIG.homeRepair * n * dt);
  }
  if (fixing) { if ((state.hammerT = (state.hammerT || 0) - dt) <= 0) { sfx('hammer'); state.hammerT = 0.45; puff(fixing.x + rand(-10, 10), wy + 6, ['#8a5a2b', '#c58b4a']); } } else state.hammerT = 0;
}
function moveRunner(dt) {
  if (state.home) {
    const st = state.stick, wy = homeWallY();
    if (state.door.open) {                                      // door open: move freely like Runner, through the doorway
      if (st) {
        const dx = Math.max(-1, Math.min(1, st.dx)), dy = Math.max(-1, Math.min(1, st.dy)), m = Math.hypot(dx, dy), k = m > 1 ? 1 / m : 1;
        const nx = state.px + dx * k * CONFIG.homeSpeed * dt, ny = state.py + dy * k * CONFIG.homeSpeed * dt;
        if (homeWalkable(nx, state.py)) state.px = nx;
        if (homeWalkable(state.px, ny)) state.py = ny;
      }
    } else {
      if (st) state.px = Math.max(CONFIG.homeL + 18, Math.min(CONFIG.homeR - 18, state.px + Math.max(-1, Math.min(1, st.dx)) * CONFIG.homeSpeed * dt));
      state.py = wy + 18;
    }
    if (net.role !== 'guest') homeRepair(dt);
    return;
  }
  if (!state.runner || !state.stick) return;
  const st = state.stick, m = Math.hypot(st.dx, st.dy), k = m > 1 ? 1 / m : 1;
  state.px = clampRx(state.px + st.dx * k * CONFIG.runnerSpeed * dt);
  state.py = clampRy(state.py + st.dy * k * CONFIG.runnerSpeed * dt);
}
// Runner: the player (either one, in co-op) closest to a point
function runTarget(x, y) {
  let best = null, bd = Infinity;
  for (const sl of slots()) { const p = pl(sl), d = Math.hypot(p.px - x, p.py - y); if (d < bd) { bd = d; best = p; } }
  return best;
}

function update(dt) {
  updateFlakes(dt);
  state.time += dt;
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
  if (state.hurt > 0) state.hurt = Math.max(0, state.hurt - dt);

  if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - dt);
  if (state.swing > 0) state.swing = Math.max(0, state.swing - dt);
  for (const k of ['cooldown', 'swing', 'walkT']) if (state.remote[k] > 0) state.remote[k] = Math.max(0, state.remote[k] - dt);

  // Snowballs fly straight until they hit a bully or leave the screen
  const m = CONFIG.snowballRadius + 1;
  for (let i = state.snowballs.length - 1; i >= 0; i--) {
    const s = state.snowballs[i];
    const px = s.x, py = s.y;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (state.home) {                   // the wall stops snowballs unless they fly through a window or the open door; plaques are perks
      const wy = homeWallY() + 5;
      if ((py - wy) * (s.y - wy) < 0) {
        const xc = px + (s.x - px) * (py - wy) / (py - s.y);
        const pk = HOME_PERKS.find(p => !p.side && Math.abs(xc - p.x) <= 9 && Math.abs(pl(s.owner || 0).px - p.x) <= 16);   // must be standing in front of it
        if (pk && s.auto) { puff(xc, wy); state.snowballs.splice(i, 1); continue; }   // machine-gun shots never open the buy screen
        if (pk) { puff(xc, wy); sfx('clank'); state.snowballs.splice(i, 1); askPerk(pk.id, s.owner || 0); continue; }
        const gap = state.wins.some(w => Math.abs(xc - w.x) <= CONFIG.homeWinHalf - 1) || (state.door.open && Math.abs(xc - state.door.x) <= 7);
        if (!gap) { puff(xc, wy); state.snowballs.splice(i, 1); continue; }
      }
    }
    if (state.home && s.y > homeWallY() + 5 && (s.x < CONFIG.homeL + 12 || s.x > CONFIG.homeR - 12)) {   // end walls
      const sp = HOME_PERKS.find(p => p.side), spy = homeWallY() + sp.dy, bo = pl(s.owner || 0);
      if (!s.auto && s.x > CONFIG.homeR - 12 && bo.px >= CONFIG.homeR - 22 && Math.abs(bo.py - spy - 8) <= 16 && s.y >= spy - 2 && s.y <= spy + 18) { puff(s.x, s.y); sfx('clank'); state.snowballs.splice(i, 1); askPerk(sp.id, s.owner || 0); continue; }
      puff(s.x, s.y); state.snowballs.splice(i, 1); continue;
    }
    const bh = firstBullyHit(px, py, s.x, s.y), th = firstTreeHit(px, py, s.x, s.y), ph = firstPowerHit(px, py, s.x, s.y);
    if (ph !== null && (!bh || ph < bh.t) && (!th || ph < th.t)) {   // snowball pops the snowflake
      collectPower(s.owner || 0);
      state.snowballs.splice(i, 1);
    } else if (bh && (!th || bh.t <= th.t)) {  // one snowball, one bully
      hitBully(bh.b, s.owner || 0);
      state.snowballs.splice(i, 1);
    } else if (th) {                    // trees stop snowballs
      puff(th.x, th.y);
      sfx('tree');
      state.snowballs.splice(i, 1);
    } else if (state.last && state.castleHp > 0 && inCastle(s)) {   // the Castle takes the hit
      hitCastle(s);
      state.snowballs.splice(i, 1);
    } else if (s.x < -m || s.x > (state.home ? CONFIG.W * 2 : CONFIG.W) + m || s.y < (state.last ? CONFIG.lastTop - 90 : -m) || s.y > view.h + m) {
      state.snowballs.splice(i, 1);     // miss: just leaves the screen
    }
  }

  moveRunner(dt);
  if ((state.runner || state.home) && state.power) {          // running into the snowflake collects it too
    for (const sl of slots()) {
      const p = pl(sl);
      if (Math.hypot(p.px - state.power.x, p.py - state.power.y) <= CONFIG.powerRadius + 6) { collectPower(sl); break; }
    }
  }
  updateAvalanche(dt);
  updateBullies(dt);
  updateEnemyBalls(dt);
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
const yetiWave = n => !state.story && n > 0 && n % 5 === 0;   // every 5th wave: only Yetis, 3 on wave 5, +3 every 5 waves
const yetiCount = n => {
  if (yetiWave(n)) return 3 * n / 5;
  const from = CONFIG.bullyTypes.yeti.from;
  return n < from ? 0 : Math.min(CONFIG.yetiMax, 1 + Math.floor((n - from) / CONFIG.yetiEvery));
};
const waveGap = n => CONFIG.gapMin + (CONFIG.gapStart - CONFIG.gapMin) * Math.pow(CONFIG.gapDecay, n - 1);

function resetGame() {
  Object.assign(state, {
    snowballs: [], enemyBalls: [], bullies: [], yetiLeft: 0, particles: [], prints: [], cooldown: 0, swing: 0,
    score: 0, newBest: false, health: CONFIG.fortHealth, flash: 0, hurt: 0,
    wave: 0, toSpawn: 0, spawnTimer: 0, waveEnded: false, breakTimer: 0, banner: 0, time: 0,
    power: null, avalanche: null, powerTimer: CONFIG.powerFirstDelay, gun: 0, gunTimer: 0, treesRemoved: 0, treeReturnTimer: 0, popup: null, remote: freshRemote(),
  });
  endAim();
  state.wins = [60, 300].map(x => ({ x, hp: CONFIG.homeWinHp }));
  state.door = { x: CONFIG.W, open: false }; state.perks = {}; state.ask = null;
  state.stick = null; state.py = state.remote.py = 200;
  state.px = CONFIG.W / 2 + (isCoop() ? (net.localSlot ? 14 : -14) : 0);
  state.remote.px = CONFIG.W / 2 + (net.localSlot ? -14 : 14);
  if (state.home) {
    state.px = CONFIG.W + (isCoop() ? (net.localSlot ? 14 : -14) : 0); state.py = homeWallY() + 18;
    state.remote.px = CONFIG.W + (net.localSlot ? -14 : 14); state.remote.py = homeWallY() + 18;
  }
}

function setMode(m) { endAim(); state.stick = null; if (MENU_MODES.includes(m)) { state.runner = state.home = state.last = false; state.battle = null; } if (m === 'title' || m === 'wavesmenu') state.wantBattle = false; if (state.mode === 'paused' && m === 'playing') state.resumeAt = performance.now(); state.mode = m; }

// DEBUG (easy to remove): open index.html?wave=8 to start at wave 8
const DEBUG_START_WAVE = parseInt(new URLSearchParams(location.search).get('wave'), 10) || 1;

function startGame(kind) {
  state.last = false;
  if (kind !== undefined) { state.runner = kind === true; state.home = kind === 'home'; }
  resetGame();
  state.mode = 'playing';
  state.story = null;
  startWave(DEBUG_START_WAVE);
}

// Last Battle (unlocked by clearing all 10 Home levels): Home with the door open, no perks; waves carry on from 16 so every enemy type shows up
function startLastBattle() {
  state.runner = false; state.home = true;
  state.mode = 'playing';             // (before the reset: the house height depends on the mode)
  resetGame();
  state.last = true;
  state.story = null;
  state.door.open = true;
  startWave(16);
  state.castleHp = CONFIG.castleHp; state.cwT = 0; state.lastN = 0; state.guardT = 2; state.spawnTimer = CONFIG.firstSpawnDelay;
  state.banner = 0; state.lbWave = 0; state.lbLeft = lbWaveSize(0); state.lbLimit = LB_LIM0();
  for (let k = 0; k < CONFIG.castleGuards; k++) addGuard(CONFIG.W - 60 + k * 24, CONFIG.lastTop + 30, k);
}

// A Castle guard: stands in front of the Castle and slides along the line between the boy and the Castle to block shots; never leaves the Castle
function addGuard(x, y, k) {
  spawnBully('runner', x, y);
  const b = state.bullies[state.bullies.length - 1];
  b.guard = true; b.phase = 4; b.gy = CONFIG.lastTop + 24 + (k % 3) * 18; b.go = (k - 2.5) * 9;
}

// Last Battle: LB_WAVES silent waves; each one cleared lets the boy go a bit further north. After the last one the way is open and enemies keep coming at the Castle.
const LB_WAVES = 5, lbWaveSize = k => 6 + 3 * k;
const LB_LIM0 = () => homeWallY() - 120, LB_LIMF = () => CONFIG.lastTop + 24;   // how far north the boy may go at first / at the end

// The snow fort at the Castle: a boy standing in it takes no damage and enemies are kept out

function spawnLastYetis() {            // the chosen badge = number of Yetis that come out of the Castle together
  for (let i = 0; i < state.lastSel; i++) { state.yetiLeft = 1; state.toSpawn = 1; spawnBully(); }
}
function updateLastBattle(dt) {
  const guards = state.bullies.filter(b => b.guard && b.state === 'walking').length;
  if (guards >= CONFIG.castleGuards) state.guardT = 2;          // a new one comes out of the Castle 2 s after one is hit
  else if ((state.guardT -= dt) <= 0) { addGuard(CONFIG.W, CONFIG.lastTop + 6, guards); state.guardT = 2; }
  const live = state.bullies.filter(b => !b.guard && b.state === 'walking').length;
  if (state.lbWave < LB_WAVES) {
    if (state.lbLeft > 0) {
      if ((state.spawnTimer -= dt) <= 0) { state.lbLeft--; state.spawnTimer = rand(1.2, 2); if (++state.lastN % 12 === 0) spawnLastYetis(); else spawnBully(); }
    } else if (live === 0) {            // wave beaten: the way north opens a little
      state.lbWave++;
      state.lbLimit = LB_LIM0() + (LB_LIMF() - LB_LIM0()) * state.lbWave / LB_WAVES;
      state.wave = 16 + state.lbWave;
      state.lbLeft = lbWaveSize(state.lbWave); state.spawnTimer = 2.5;
      sfx('wave');
    }
    return;
  }
  if ((state.spawnTimer -= dt) > 0) return;       // the way is open: keep them coming at the Castle
  state.spawnTimer = rand(2, 3.2);
  if (live >= 10) return;
  if (++state.lastN % 12 === 0) spawnLastYetis(); else spawnBully();
}

// The barrier across the map while the next wave isn't beaten
function drawLastBarrier() {
  const y = Math.round(state.lbLimit) - 8;
  for (let x = 4; x < CONFIG.W * 2; x += 12) { rect(COLORS.shadow, x, y + 1, 9, 4); rect(COLORS.ice, x, y - 1, 9, 3); rect(COLORS.snow, x + 1, y - 2, 7, 2); }
}

const inCastle = s => Math.abs(s.x - CONFIG.W) <= 76 && s.y >= CONFIG.lastTop - 100 && s.y <= CONFIG.lastTop + 4;
function hitCastle(s) {
  puff(s.x, s.y, ['#6e7a8a', COLORS.snow]); sfx('clank');
  if (!castleOnScreen(s.owner || 0)) return;       // shots from out of sight just bounce off
  pl(s.owner || 0).score += 25;
  if (--state.castleHp > 0) return;
  state.lastDone = true; saveBest(1, CONFIG.lastDoneKey);
  if (state.lastSel > state.lastLv) { state.lastLv = state.lastSel; saveBest(state.lastLv, CONFIG.lastLvKey); }
  state.castleHp = 0; state.mode = 'castlewin'; state.cwT = 0; state.snowballs = [];
  awardXp(state.score); spawnConfetti(); sfx('wave');
}

// Castle down: it sinks into the ground in a cloud of snow, confetti, then the victory text
function updateCastleWin(dt) {
  state.cwT += dt;
  updateParticles(dt);
  if (net.role === 'guest') return;
  if (state.cwT < 2.6 && Math.random() < dt * 14) puff(CONFIG.W + rand(-70, 70), CONFIG.lastTop - rand(0, 40), ['#6e7a8a', COLORS.snow]);
  if (state.cwT >= END_T.out + 2.5) { if (isCoop()) enterLobby(); else { resetGame(); setMode('title'); } }
}

// Ending timeline (seconds since the Castle fell): victory text, fade to black, "return home" text, the boy walks back down and stops, the screen shakes with the last line, fade out to the menu
const END_T = { fade: 7.5, black: 9, textOut: 15.7, scene: 18.5, stop: 23.5, shake: 25.3, line2: 27.8, out: 31.5 };   // shake = when the shaking stops and the townsfolk start running; line2 appears once they're gone
const fadeIn = (t, a, d) => Math.max(0, Math.min(1, (t - a) / d));

// Townfolk cheer (jumping, arms up) in two vertical rows along the boy's path, then run off the screen once the shaking stops
const FOLK = [[-24, 'hatGreen', 'coatBlue', 0], [-24, 'red', 'orange', 1], [-24, 'pink', 'hatGreen', 2], [-24, 'gold', 'red', 3], [-24, 'coatBlue', 'pink', 4],
              [24, 'orange', 'red', 5], [24, 'blonde', 'coatBlue', 6], [24, 'red', 'hatGreen', 7], [24, 'hatGreen', 'gold', 8], [24, 'pink', 'coatBlue', 9]];
function drawTownfolk(t, W, H) {
  const T = END_T, fl = Math.max(0, t - T.shake);
  for (const [dx, hat, coat, i] of FOLK) {
    const side = dx < 0 ? -1 : 1, x = Math.round(W / 2 - 4 + dx + side * fl * (60 + i * 6));
    if (x < -10 || x > W + 10) continue;
    const jump = fl > 0 ? 0 : Math.round(Math.abs(Math.sin(t * 7 + i * 1.3)) * 6), run = fl > 0 ? 1 + (Math.floor(t * 10) % 2) : 0;
    const y = H / 2 - 7 - jump - (i % 5) * 20, h = COLORS[hat], c = COLORS[coat];
    rect(COLORS.snow, x + 3, y, 2, 1); rect(h, x + 1, y + 1, 6, 2); rect(COLORS.snow, x, y + 3, 8, 1);
    rect(COLORS.skin, x + 1, y + 4, 6, 3); rect(COLORS.black, x + 2, y + 5, 1, 1); rect(COLORS.black, x + 5, y + 5, 1, 1);
    rect(c, x + 1, y + 7, 6, 6);
    if (fl > 0) { rect(c, x - 1, y + 8, 2, 3); rect(c, x + 7, y + 8, 2, 3); }               // arms swing while running
    else { rect(c, x - 1, y + 3, 2, 5); rect(c, x + 7, y + 3, 2, 5); rect(COLORS.skin, x - 1, y + 2, 2, 1); rect(COLORS.skin, x + 7, y + 2, 2, 1); }   // arms up
    rect(COLORS.black, x + 2, y + 13 - (run === 1 ? 1 : 0), 2, 2); rect(COLORS.black, x + 4, y + 13 - (run === 2 ? 1 : 0), 2, 2);
  }
}

function drawEnding() {
  const t = state.cwT, W = CONFIG.W, H = view.h, T = END_T;
  state.buttons = [];
  if (t < T.scene) {
    rect(COLORS.black, 0, 0, W, H);
    ctx.globalAlpha = Math.min(fadeIn(t, T.black + 2, 1.2), 1 - fadeIn(t, T.textOut, 0.8));
    for (const [i, line] of ['YOU ARE ABLE TO RETURN', 'BACK HOME TO YOUR', 'PEACEFUL LIFE...'].entries()) drawText5(line, W / 2, H / 2 - 16 + i * 12, 1, COLORS.snow, 'center');
    ctx.globalAlpha = 1;
    return;
  }
  const shaking = t > T.stop && t < T.shake;
  ctx.save();
  if (shaking) ctx.translate(Math.round((Math.random() - 0.5) * 6), Math.round((Math.random() - 0.5) * 6));
  ctx.drawImage(bg, 0, 0);
  drawFlakes();
  const k = Math.min(1, (t - T.scene) / (T.stop - T.scene)), y = Math.round(-14 + (H / 2 - 7 + 14) * k);
  drawKidAt(Math.round(W / 2 - 4), y, 0, k >= 1 ? breath(0) : 0, k >= 1 ? 0 : 1 + (Math.floor(t * 8) % 2));
  drawTownfolk(t, W, H);
  if (t >= T.line2) {
    ctx.globalAlpha = fadeIn(t, T.line2, 0.8);
    drawText5('...UNTIL YOU NEED TO', W / 2, H / 2 + 30, 1, COLORS.night, 'center', COLORS.snow);
    drawText5('MAKE ANOTHER SNOWBALL...', W / 2, H / 2 + 42, 1, COLORS.night, 'center', COLORS.snow);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  const a = Math.max(1 - fadeIn(t, T.scene, 1.5), fadeIn(t, T.out, 2.5));   // black fades off at the start of the scene, back on at the end
  if (a > 0) { ctx.globalAlpha = a; rect(COLORS.black, 0, 0, W, H); ctx.globalAlpha = 1; }
}

function drawCastleWin() {
  if (state.cwT > END_T.fade) { ctx.globalAlpha = fadeIn(state.cwT, END_T.fade, 1.5); rect(COLORS.black, 0, 0, CONFIG.W, view.h); ctx.globalAlpha = 1; }
  if (state.cwT < 1) return;
  ctx.globalAlpha = fadeIn(state.cwT, 1, 0.6) * (1 - fadeIn(state.cwT, END_T.fade, 1.5));
  drawTextShadow('YOU BEAT THE', CONFIG.W / 2, 90, 2, COLORS.gold, 'center');
  drawTextShadow('EVIL SNOW FORCE', CONFIG.W / 2, 112, 2, COLORS.gold, 'center');
  ctx.globalAlpha = 1;
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
  state.runner = state.home = false;
  resetGame();
  state.mode = 'playing';
  const first = 2 * (n - 1) + 1;
  state.story = { level: n };
  startWave(first);
}

function startRunnerLevel(n) {            // Runner level n: no fort, clear a set number of enemies; difficulty follows wave 2n-1
  state.runner = true; state.home = false;
  resetGame();
  state.mode = 'playing';
  state.story = { level: n, runner: true };
  startWave(2 * n - 1);
  state.toSpawn = 8 + 3 * n;
  state.yetiLeft = n < 3 ? 0 : Math.min(CONFIG.yetiMax, 1 + Math.floor((n - 3) / 2));   // Yetis mixed in from level 3: 1, +1 every 2 levels
}

function startHomeLevel(n) {              // Home level n: defend the house, clear a set number of enemies; difficulty follows wave 2n-1
  state.runner = false; state.home = true;
  state.mode = 'playing';
  resetGame();
  state.story = { level: n, home: true };
  startWave(2 * n - 1);
  state.toSpawn = 8 + 3 * n;
  state.yetiLeft = n < 3 ? 0 : Math.min(CONFIG.yetiMax, 1 + Math.floor((n - 3) / 2));
}

// Re-enter / leave the current story level, whichever page it belongs to
const storyStart = (st, n) => (st.home ? startHomeLevel : st.runner ? startRunnerLevel : startStory)(n);
const storyMenu = st => st.home ? 'homelevels' : st.runner ? 'runnerlevels' : 'levels';

function storyWin() {
  awardXp(state.score);
  if (state.story.home) {
    if (state.story.level >= state.homeUnlocked && state.homeUnlocked <= CONFIG.storyLevels) {
      state.homeUnlocked = state.story.level + 1;
      saveBest(state.homeUnlocked, CONFIG.homeLvKey);
    }
  } else if (state.story.runner) {
    if (state.story.level >= state.runnerUnlocked && state.runnerUnlocked <= CONFIG.storyLevels) {
      state.runnerUnlocked = state.story.level + 1;
      saveBest(state.runnerUnlocked, CONFIG.runnerKey);
    }
  } else if (state.story.level >= state.storyUnlocked && state.storyUnlocked <= CONFIG.storyLevels) {
    state.storyUnlocked = state.story.level + 1;
    saveBest(state.storyUnlocked, CONFIG.storyKey);
  }
  state.mode = 'levelwin';
  sfx('wave');
  spawnConfetti();
}

function startWave(n) {
  sfx('wave');
  state.wave = n;
  state.yetiLeft = yetiCount(n);
  state.toSpawn = yetiWave(n) ? state.yetiLeft : waveCount(n);                 // spawned at random points of the wave (they replace regular spawns)
  state.spawnTimer = CONFIG.firstSpawnDelay;
  state.waveEnded = false;
  state.banner = CONFIG.bannerTime;
}

let bullyId = 0;

// Throwers and snowmobiles only show up in Home mode: Story level 4+ / 6+, or endless wave 15+ 
const homeOk = (wave, lvl) => state.home && (state.story ? state.story.level >= lvl : wave >= 15);
const throwerOk = wave => homeOk(wave, 4);
const snowmobileOk = wave => homeOk(wave, 6);

// Weighted random type: newer types get likelier as waves rise, Regular stays the most common
function pickType(wave) {
  const ws = [];
  let total = 0;
  for (const k in CONFIG.bullyTypes) {
    const T = CONFIG.bullyTypes[k];
    if (T.special) continue;                         // Yetis are placed by the wave, not rolled
    if (k === 'thrower' && !throwerOk(wave)) continue;
    if (k === 'snowmobile' && !snowmobileOk(wave)) continue;
    const w = wave >= T.from ? Math.min(T.weightMax, T.weight + T.weightPer * (wave - T.from)) : 0;
    ws.push([k, w]);
    total += w;
  }
  let r = Math.random() * total;
  for (const [k, w] of ws) { r -= w; if (r < 0) return k; }
  return 'regular';
}

function pickRider() {            // the enemy a snowmobile carries
  let t;
  do t = pickType(state.wave); while (CONFIG.bullyTypes[t].drives);
  return t;
}

function spawnBully(rtype, rx, ry) {   // rtype/rx/ry: place a specific enemy (a snowmobile's rider)
  // The chance rises as the wave runs out of spawns, so every Yeti of the wave is guaranteed to appear
  let type;
  if (rtype) type = rtype;
  else if (state.yetiLeft > 0 && Math.random() < state.yetiLeft / state.toSpawn) {
    type = 'yeti';
    state.yetiLeft--;
    state.popup = { text: 'YETI INCOMING!', t: 1.8 };
  } else type = pickType(state.wave);
  const T = CONFIG.bullyTypes[type];
  const m = CONFIG.bullyMargin + (T.swayAmp || 0);   // leave room for the sled's sway
  let x0 = m + Math.random() * (CONFIG.W - 2 * m), y0 = -T.halfH;
  if (state.home) x0 = 12 + Math.random() * (CONFIG.W * 2 - 24);   // Home: the world is two screens wide
  if (state.runner) {                                // Runner: enemies come in from any edge
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { /* top */ }
    else if (side === 1) { x0 = -T.halfH; y0 = rand(20, view.h); }
    else if (side === 2) { x0 = CONFIG.W + T.halfH; y0 = rand(20, view.h); }
    else y0 = view.h + T.halfH;
  }
  if (state.last && !rtype) y0 = Math.max(CONFIG.lastTop + 40, Math.min(-T.halfH, Math.min(...slots().map(q => pl(q).py)) - view.h / 2 - 24));   // Last Battle: they pour in from above the northernmost boy
  if (rtype) { x0 = rx; y0 = ry; }
  state.bullies.push({
    id: ++bullyId,
    type, phase: state.home && slots().every(q => pl(q).py < homeWallY() + 5) ? 4 : 0, win: state.home ? homeEntry() : 0,   // Home: 0 walk to the window/door, 1 chew it, 2 climb in, 3 chase the boy inside, 4 chase him outside, 5 leave through the door

    vx: 0, vy: 0,                                    // velocity, sent to the co-op guest for smooth motion
    x: x0, x0,                                       // x0 = centre column (sway is around it)
    y: y0,
    ang: state.runner ? (t => Math.atan2(t.py - y0, t.px - x0))(runTarget(x0, y0)) : Math.PI / 2,                                // heading (screen coords): straight down
    speed: waveSpeed(state.wave) * T.speedMul,
    hp: T.hp,
    state: 'walking',      // walking | falling | fading
    t: 0,
    age: 0,
    stepAcc: 0,
    stepSide: 1,
    flash: 0,
    ph: Math.random() * 10, // walk-cycle / sway offset
    rider: T.drives ? pickRider() : undefined, dropped: false, sx: x0, sy: y0, bw: Math.random() < 0.5 ? 0 : 1,   // snowmobile: its passenger, start point and target window
  });
}

function updateWaves(dt) {
  if (state.mode !== 'playing') return;
  if (state.banner > 0) state.banner -= dt;
  if (state.last) { updateLastBattle(dt); return; }
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
      for (const sl of slots()) pl(sl).score += CONFIG.waveBonus;
      if (state.story) state.winTimer = 2;
    }
  } else if (state.winTimer > 0) {
    if ((state.winTimer -= dt) <= 0) { state.winTimer = 0; storyWin(); }
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
const MENU_MODES = ['title', 'levels', 'wavesmenu', 'wavetype', 'coopmenu', 'coophost', 'coopjoin', 'cooplobby', 'runnerlevels', 'homelevels', 'runpan', 'battlemenu'];

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
  state.powerTimer = powerGap();
  puff(pw.x, pw.y);
  sfx('power');
  const opts = ['gun'];                                         // only offer effects that do something
  if (state.health < CONFIG.fortHealth) opts.push('heal');
  if (activeTrees().length && !state.last) opts.push('trees');
  if (state.bullies.some(b => b.state === 'walking') && !state.home) opts.push('avalanche');
  const pick = opts[Math.floor(Math.random() * opts.length)];
  if (pick === 'gun') {
    const p = pl(owner);                                        // the machine gun goes to whoever popped it
    p.gun = CONFIG.gunTime;
    p.gunTimer = 0;
    state.popup = { text: isCoop() ? 'GUN FOR P' + (owner + 1) + '!' : 'MACHINE GUN!', t: 1.4 };
  } else if (pick === 'heal') {
    state.health = CONFIG.fortHealth;
    puff(CONFIG.fortCX, CONFIG.fortCY - 12);
    state.popup = { text: '+ HEALTH', t: 1.4 };
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

const powerGap = () => state.last ? rand(5, 10) : rand(CONFIG.powerMinGap, CONFIG.powerMaxGap);   // Last Battle: snowflakes turn up all the way up the map

function updatePower(dt) {
  // Floating snowflake: appears at a random spot, bobs, vanishes if not popped
  if (state.power) {
    state.power.age += dt;
    state.power.y = state.power.baseY + Math.sin(state.power.age * 2.5) * 3;
    if (state.power.age >= CONFIG.powerLife) {
      state.power = null;
      state.powerTimer = powerGap();
    }
  } else {
    state.powerTimer -= dt;
    if (state.powerTimer <= 0) {
      let y = rand(CONFIG.powerMinY, CONFIG.powerMaxY);
      if (state.last) y = Math.max(Math.max(CONFIG.lastTop + 24, state.lbLimit), Math.min(homeWallY() - 20, Math.min(...slots().map(q => pl(q).py)) - rand(20, 140)));   // just ahead of the northernmost boy
      state.power = { x: rand(18, (state.home ? CONFIG.W * 2 : CONFIG.W) - 18), baseY: y, y, age: 0 };
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
// Last Battle: trees scattered up the whole map (same on every device: fixed seed, positions independent of screen height)
const LAST_TREES = (() => {
  let seed = 20240611;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const out = [];
  for (let y = -690; y <= 60; y += 36 + Math.floor(rnd() * 34)) {
    const n = 1 + Math.floor(rnd() * 2);
    for (let k = 0; k < n; k++) out.push([Math.round(10 + rnd() * (CONFIG.W * 2 - 28)), y]);
  }
  return out;
})();

function activeTrees() {
  if (state.last && !MENU_MODES.includes(state.mode)) return LAST_TREES;
  if (state.mode === 'homelevels') return [];
  if (MENU_MODES.includes(state.mode)) return CONFIG.treePositions.slice(0, CONFIG.treeMax);   // menus show them all
  if (state.home) return [];
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

function hitBully(b, owner = 0) {
  const T = CONFIG.bullyTypes[b.type];
  b.hp--;
  if (b.hp > 0) {                       // Big Kid survives the first hit: white flash
    b.flash = CONFIG.hitFlashTime;
    sfx('clank');
  } else {
    b.state = 'falling';
    b.t = 0;
    if (T.drives && !b.dropped) spawnBully(b.rider, b.x, b.y);   // crashed before the drop: the rider lands where it was hit
    pl(owner).score += T.points;
    sfx('hit');
  }
  puff(b.x, b.y);
}

function puff(x, y, cols) {            // cols: optional [colorA, colorB] instead of snow
  if (net.role === 'host') net.evq.push({ e: 'p', x: r1(x), y: r1(y) });   // the guest shows the same puff
  for (let i = 0; i < CONFIG.puffCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = CONFIG.puffSpeed * (0.5 + Math.random() * 0.5);
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10,
      life: CONFIG.puffLife, c: (cols || [COLORS.snow, COLORS.ice])[Math.random() < 0.5 ? 0 : 1],
    });
  }
}

const homeEntry = () => (state.door.open && Math.random() < 0.34 ? 2 : (Math.random() < 0.5 ? 0 : 1));   // 0 / 1 windows, 2 door
function updateHomeBully(b, T, dt) {          // true when it reaches the boy
  b.age += dt;
  const wy = homeWallY(), px = b.x, py = b.y, door = state.door;
  const all = slots().map(pl), ins = all.filter(p => p.py >= wy + 5), boyOut = !ins.length;     // boyOut: every boy is outside
  const cand = ins.length ? ins : all;
  let tp = cand[0];                                                                                // chase the nearest boy
  for (const p of cand) if (Math.hypot(p.px - b.x, p.py - b.y) < Math.hypot(tp.px - b.x, tp.py - b.y)) tp = p;
  if (boyOut && (b.phase === 0 || b.phase === 1)) b.phase = 4;                                  // the boy went outside: chase him there
  else if (!boyOut && b.phase === 4) { b.phase = 0; b.win = homeEntry(); }                        // he came back in: find a way in
  else if (boyOut && b.phase === 3) b.phase = door.open ? 5 : 3;                                  // follow him out of the house
  else if (!boyOut && b.phase === 5) b.phase = 3;
  if (b.phase === 5 && !door.open) b.phase = 3;
  if (b.win === 2 && !door.open && b.phase <= 1) { b.win = Math.random() < 0.5 ? 0 : 1; b.phase = 0; }   // door got closed
  const win = b.win === 2 ? door : state.wins[b.win];
  let tx = tp.px + (b.ph - 5) * 2.5, ty = tp.py;   // each chaser aims a little to one side so they spread out
  if (b.phase === 1) {
    const slow = ins.some(p => p.py > wy + 10 && Math.abs(p.px - win.x) <= CONFIG.homeRepairDist) && windowAttackers(win) === 1;   // the boy is holding the window against this one enemy: it still chews, just slower
    win.hp = Math.max(0, win.hp - T.fortDamage * CONFIG.homeAttack * (slow ? 0.4 : 1) * dt);
    if ((b.chewT = (b.chewT || 0) - dt) <= 0) {
      b.chewT = 0.6 + Math.random() * 0.4;
      if (state.time - (state.lastWood || -1) >= 0.3) { sfx('fort'); state.lastWood = state.time; }   // one crack at a time, so a crowd doesn't flood the audio
    }
    b.ang = Math.PI / 2;
    if (win.hp <= 0) { b.phase = 2; puff(win.x, wy + 4); sfx('fort'); }
    b.vx = b.vy = 0;
    return false;
  }
  if (b.phase === 0) { tx = win.x; ty = wy - T.halfH; }
  else if (b.phase === 2) { tx = win.x; ty = wy + 16; }
  else if (b.phase === 5) {
    if (b.y > wy + 12 && Math.abs(b.x - door.x) > 3) { tx = door.x; ty = wy + 16; }
    else { tx = door.x; ty = wy - T.halfH - 4; }
  }
  const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy), step = b.speed * dt;
  if (d > 0.01) b.ang = Math.atan2(dy, dx);
  if (d <= step) { b.x = tx; b.y = ty; } else { b.x += dx / d * step; b.y += dy / d * step; }
  if (b.phase === 3 || b.phase === 4) {                     // keep enemies from stacking on each other
    for (const o of state.bullies) {
      if (o === b || o.state !== 'walking' || !(o.phase >= 2)) continue;
      let ox = b.x - o.x, oy = b.y - o.y, od = Math.hypot(ox, oy);
      const R = (T.radius + CONFIG.bullyTypes[o.type].radius) * 1.1;
      if (od >= R) continue;
      if (od < 0.01) { ox = b.ph < o.ph ? -1 : 1; oy = 0; od = 1; }
      const push = (R - od) / 2;
      b.x += ox / od * push; b.y += oy / od * push;
    }
    if (b.phase === 3) {
      b.x = Math.max(CONFIG.homeL + 16, Math.min(CONFIG.homeR - 16, b.x));
      b.y = Math.max(wy + 12, Math.min(wy + 56, b.y));
    } else {
      b.x = Math.max(8, Math.min(CONFIG.W * 2 - 8, b.x));
      b.y = Math.min(wy - T.halfH, b.y);
    }
  }
  b.x0 = b.x;
  if (d <= step) {
    if (b.phase === 0) b.phase = b.win === 2 ? 2 : (win.hp > 0 ? 1 : 2);
    else if (b.phase === 2) b.phase = boyOut && door.open ? 5 : 3;
  }
  if (b.phase === 5 && b.y < wy - 1) b.phase = 4;
  b.vx = dt > 0 ? (b.x - px) / dt : 0; b.vy = dt > 0 ? (b.y - py) / dt : 0;
  footstep(b, T, px, py);
  return b.phase >= 2 && cand.some(p => Math.hypot(b.x - p.px, b.y - p.py) <= 6 + T.radius);
}

function updateBullies(dt) {
  for (let i = state.bullies.length - 1; i >= 0; i--) {
    const b = state.bullies[i], T = CONFIG.bullyTypes[b.type];
    if (b.flash > 0) b.flash -= dt;
    if (b.state === 'walking' && b.guard) {                // Castle guard: hold the line between the boy and the Castle
      const tp = runTarget(b.x, b.y);
      {
        const cx = CONFIG.W, cy = CONFIG.lastTop - 20, below = tp.py > b.gy + 8;
        let tx = below ? tp.px + (cx - tp.px) * (tp.py - b.gy) / (tp.py - cy) : cx, inc = null;
        for (const s of state.snowballs) if (s.vy < 0 && s.y > b.gy && inCastle({ x: s.x + s.vx * (s.y - CONFIG.lastTop) / -s.vy, y: CONFIG.lastTop }) && (!inc || s.y < inc.y)) inc = s;   // a snowball heading for the Castle
        tx = inc ? inc.x + inc.vx * (inc.y - b.gy) / -inc.vy : Math.max(cx - 70, Math.min(cx + 70, tx + b.go));   // jump in its way
        const dx = tx - b.x, dy = b.gy - b.y, d = Math.hypot(dx, dy), step = b.speed * 1.6 * dt;
        const mx = d <= step ? dx : dx / d * step, my = d <= step ? dy : dy / d * step;
        b.x += mx; b.y += my; b.x0 = b.x; b.vx = dt > 0 ? mx / dt : 0; b.vy = dt > 0 ? my / dt : 0;
        if (d > 0.5) b.ang = Math.atan2(dy, dx);
        continue;
      }
    }
    if (b.state === 'walking' && T.drives) {               // Snowmobile: races to its window, drops the rider, drives back to where it came from
      const wy = homeWallY(), tp = state.last ? runTarget(b.x, b.y) : null;   // Last Battle: it chases the boy, not a window
      const gx = b.dropped ? b.sx : tp ? tp.px : state.wins[b.bw].x, gy = b.dropped ? b.sy : tp ? Math.min(tp.py - 50, wy - 26) : wy - 26;
      const dx = gx - b.x, dy = gy - b.y, d = Math.hypot(dx, dy), step = b.speed * dt;
      b.ang = Math.atan2(dy, dx);
      if (d <= step) {
        b.x = gx; b.y = gy;
        if (b.dropped) { state.bullies.splice(i, 1); continue; }
        b.dropped = true; spawnBully(b.rider, b.x, tp ? b.y : wy - 20); puff(b.x, tp ? b.y : wy - 20);
      } else { b.x += dx / d * step; b.y += dy / d * step; }
      b.x0 = b.x; b.vx = dx / (d || 1) * b.speed; b.vy = dy / (d || 1) * b.speed;
      continue;
    }
    if (b.state === 'walking' && T.throws && state.home && (b.phase === 0 || b.phase === 4) && (b.y > 8 || state.last)) {   // Thrower: walks, then stops now and then to throw
      if (b.pause > 0) {
        b.pause -= dt; b.vx = b.vy = 0;
        if (!b.thrown && b.pause < 0.4) { b.thrown = true; throwBall(b); }
        if (b.pause <= 0) b.walk = rand(1.5, 3.5);
        continue;
      }
      if ((b.walk = (b.walk === undefined ? rand(1, 2.5) : b.walk) - dt) <= 0) { b.pause = 0.9; b.thrown = false; continue; }
    }
    if (b.state === 'walking' && state.home) {
      if (updateHomeBully(b, T, dt)) { state.bullies.splice(i, 1); damageFort(T.fortDamage); }
      else if (state.last && !b.guard) {
        for (const p of LAST_TREES) {                      // enemies walk around the trees, not through them
          const tx = p[0] + 4, ty = p[1] + CONFIG.treeBaseY, R = CONFIG.treeBaseRadius + T.radius, ddx = b.x - tx, ddy = b.y - ty, d = Math.hypot(ddx, ddy);
          if (d < R) { const nx = d > 0.01 ? ddx / d : 1, ny = d > 0.01 ? ddy / d : 0; b.x += nx * (R - d); b.y += ny * (R - d); b.x0 = b.x; }
        }
      }
      continue;
    }
    if (b.state === 'walking') {
      b.age += dt;
      const prevX = b.x, prevY = b.y;
      // Walk straight down; below turnY, steer smoothly toward the kid (fort centre)
      const rt = state.runner ? runTarget(b.x, b.y) : null;
      let want = rt ? Math.atan2(rt.py - b.y, rt.px - b.x0) : b.y >= CONFIG.turnY ? Math.atan2(CONFIG.fortCY - b.y, CONFIG.fortCX - b.x0) : Math.PI / 2;
      want = avoidTrees(b, T, want);              // walk around trees
      const da = Math.atan2(Math.sin(want - b.ang), Math.cos(want - b.ang));   // wrapped to -PI..PI
      const maxTurn = CONFIG.turnRate * dt;
      b.ang += Math.max(-maxTurn, Math.min(maxTurn, da));
      b.x0 += Math.cos(b.ang) * b.speed * dt;     // x0 = path position; the Sled Kid's sway is added on top
      b.y += Math.sin(b.ang) * b.speed * dt;
      let sway = 0;
      if (T.swayAmp && !state.runner) {
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
      if (rt ? Math.hypot(b.x - rt.px, b.y - rt.py) <= 6 + T.radius : (b.y >= CONFIG.H || Math.hypot(b.x - CONFIG.fortCX, b.y - CONFIG.fortCY) <= CONFIG.fortOuter + T.radius)) {  // touches the fort
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

function throwBall(b) {              // at the nearest window or the nearest boy
  const wy = homeWallY() + 5, boys = slots().map(pl);
  let tx, ty, tgt = 'boy', wi = 0;
  if (Math.random() < 0.5 && !(state.last && boys.every(p => p.py < wy - 40))) {   // (no point lobbing at the windows once the boy has left the house)
    tgt = 'win'; wi = Math.abs(state.wins[0].x - b.x) <= Math.abs(state.wins[1].x - b.x) ? 0 : 1;
    tx = state.wins[wi].x; ty = wy;
  } else {
    let p = boys[0];
    for (const q of boys) if (Math.hypot(q.px - b.x, q.py - b.y) < Math.hypot(p.px - b.x, p.py - b.y)) p = q;
    tx = p.px; ty = p.py;
  }
  const a = Math.atan2(ty - b.y, tx - b.x), v = 110;
  state.enemyBalls.push({ x: b.x + 5, y: b.y - 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, tgt, wi });
  sfx('throw');
}

// Thrown snowballs: the house wall stops them unless they fly through a window or the open door; a ball aimed at a window chips its boards; any ball reaching a boy hurts
function updateEnemyBalls(dt) {
  const wy = homeWallY() + 5;
  for (let i = state.enemyBalls.length - 1; i >= 0; i--) {
    const e = state.enemyBalls[i], px = e.x, py = e.y;
    e.x += e.vx * dt; e.y += e.vy * dt;
    if ((py - wy) * (e.y - wy) < 0) {
      const xc = px + (e.x - px) * (py - wy) / (py - e.y);
      const w = state.wins.find(q => Math.abs(xc - q.x) <= CONFIG.homeWinHalf - 1);
      if (!w && !(state.door.open && Math.abs(xc - state.door.x) <= 7)) { puff(xc, wy); state.enemyBalls.splice(i, 1); continue; }
      if (w && e.tgt === 'win') { w.hp = Math.max(0, w.hp - 1.5); puff(xc, wy); sfx('fort'); state.enemyBalls.splice(i, 1); continue; }
    }
    const hit = slots().map(pl).some(p => Math.hypot(e.x - p.px, e.y - p.py) <= 6);
    if (hit) { puff(e.x, e.y); state.enemyBalls.splice(i, 1); damageFort(1); }
    else if (e.y > view.h + 10 || e.x < -10 || e.x > CONFIG.W * 2 + 10 || e.y < (state.last ? CONFIG.lastTop - 90 : -10)) state.enemyBalls.splice(i, 1);
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
      hitBully(b, av.owner || 0);
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
      x: Math.random() * CONFIG.W * (state.home ? 2 : 1), y: av.y + rand(-8, 2), vx: rand(-14, 14), vy: rand(-30, 20),
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
  state.hurt = HURT_TIME;
  sfx('hurt');
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
  spawnConfetti();
}

function spawnConfetti() {
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
const mapKind = () => (state.home ? 'home' : state.runner ? 'runner' : 'fort');
const bestKey = k => (k === 'fort' ? CONFIG.storageKey : CONFIG.storageKey + '_' + k);
const coopKey = k => (k === 'fort' ? CONFIG.coopStorageKey : CONFIG.coopStorageKey + '_' + k);
const bestNow = () => (isCoop() ? state.coopBests[mapKind()] : state.bests[mapKind()]);
function recordBest(score) {          // 'score' here is the wave reached
  if (isCoop()) {
    const k = mapKind();
    state.newBest = score > state.coopBests[k];
    if (state.coopBests[k] < score) { state.coopBests[k] = score; saveBest(score, coopKey(k)); }
    return;
  }
  const k = mapKind();
  state.newBest = score > state.bests[k];
  if (state.bests[k] < score) { state.bests[k] = score; saveBest(score, bestKey(k)); }
}

function gameOver() {
  endAim();
  if (!state.story && !state.last) recordBest(state.wave);
  awardXp(state.score);
  state.mode = 'gameover';
  sfx('over');
}

// Auto-pause when the tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.mode === 'playing' && !isCoop()) setMode('paused');
  if (document.hidden && state.mode === 'battle' && state.battle && !state.battle.coop) state.battle.paused = true;   // co-op can't pause
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
// Co-op lobby: both players wait here after connecting and after each game; the host picks the map
function enterLobby() {
  resetGame(); state.entry = ''; setMode('cooplobby');
  if (state.wantBattle && net.role === 'host') setTimeout(() => { if (state.mode === 'cooplobby' && state.wantBattle && net.role === 'host') startBattle(); }, 700);
}
function backToCoopMenu() { resetNet(); state.entry = ''; setMode('coopmenu'); }
function openCoopMenu() { state.runner = false; net.status = 'idle'; net.error = ''; setMode('coopmenu'); }

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
      enterLobby();
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
  if (state.battle) { btHostOnData(d); return; }
  const r = state.remote;
  if (d.k === 'a' && Number.isFinite(d.a)) {
    r.aimAngle = (state.runner || state.home) ? d.a : Math.min(CONFIG.maxAngle, Math.max(CONFIG.minAngle, d.a));
    r.aimValid = r.aiming = !!d.v;
    setRemotePos(d);
  } else if (d.k === 't' && Number.isFinite(d.a) && state.mode === 'playing' && r.cooldown <= 0.1 && r.gun <= 0) {
    setRemotePos(d);
    throwSnowball(1, false, (state.runner || state.home) ? d.a : Math.min(CONFIG.maxAngle, Math.max(CONFIG.minAngle, d.a)));
  } else if (d.k === 'u' && typeof d.id === 'string') usePerk(d.id, 1);
  else if (d.k === 'b' && typeof d.id === 'string' && state.home && state.mode === 'playing') {
    const p = HOME_PERKS.find(q => q.id === d.id);
    if (p) buyPerk(p, 1);
  }
}

function setRemotePos(d) {
  if (!(state.runner || state.home) || !Number.isFinite(d.x) || !Number.isFinite(d.y)) return;
  const r = state.remote;
  d = { x: d.x, y: d.y + wallOff() };
  let x = clampRx(d.x), y = clampRy(d.y);
  if (state.home) {                                       // the guest's boy stays on the floor (or the yard, door open)
    const wy = homeWallY();
    x = Math.max(8, Math.min(CONFIG.W * 2 - 8, d.x)); y = d.y;
    if (!state.door.open) { x = Math.max(CONFIG.homeL + 18, Math.min(CONFIG.homeR - 18, x)); y = wy + 18; }
    else if (!homeWalkable(x, y)) return;
  }
  if (Math.hypot(x - r.px, y - r.py) > 0.05) r.walkT = 0.15;
  r.px = x; r.py = y;
}

// Host -> guest: everything the guest needs to draw the world
function buildSnapshot() {
  const ev = net.evq; net.evq = [];
  return {
    k: 's', rn: state.runner ? 1 : 0, hm: state.home ? 1 : 0, la: state.last ? 1 : 0, ch: state.castleHp, lb: r1(state.lbLimit), lw: state.lbWave, hp: [r1(state.px), r1(state.py - wallOff())], m: state.mode, sc: [pl(0).score, pl(1).score], w: state.wave, h: state.health,
    fl: r1(state.flash * 10) / 10, bn: r1(state.banner), tm: r1(state.time), tr: state.treesRemoved,
    pu: state.popup ? { s: state.popup.text, t: r1(state.popup.t) } : null,
    pw: state.power ? [r1(state.power.x), r1(state.power.baseY), r1(state.power.age)] : null,
    g: [r1(state.gun), r1(state.remote.gun)],                                   // machine-gun seconds left [host, guest]
    ha: [r1(state.aimAngle), state.aiming && state.aimValid ? 1 : 0, state.swing],   // host aim, for its arm and dotted line
    B: state.bullies.map(b => [b.id, TYPE_IDS.indexOf(b.type), r1(b.x), r1(b.y), r1(b.vx), r1(b.vy),
                               STATE_IDS.indexOf(b.state), r1(b.t), b.flash > 0 ? 1 : 0, r1(b.ph), r1(b.ang), b.hp, b.phase || 0, b.win || 0, TYPE_IDS.indexOf(b.rider), b.dropped ? 1 : 0]),
    S: state.snowballs.map(s => [r1(s.x), r1(s.y), r1(s.vx), r1(s.vy)]),
    E: state.enemyBalls.map(s => [r1(s.x), r1(s.y), r1(s.vx), r1(s.vy)]),
    av: state.avalanche ? r1(state.avalanche.y) : null,
    ho: state.home ? { w: state.wins.map(w => r1(w.hp)), d: state.door.open ? 1 : 0, p: [state, state.remote].map(q => Object.keys(q.perks).filter(k => q.perks[k])) } : null,   // home: window boards, door, owned perks
    ev,
  };
}

function guestOnData(d) {
  if (!d || typeof d !== 'object') return;
  net.lastRx = performance.now(); net.lost = false;
  if (d.k === 'bstart' || d.k === 'B') { btGuestOnData(d); return; }
  if (d.k === 's') applySnapshot(d);
  else if (d.k === 'q' && HOME_PERKS.some(p => p.id === d.id)) state.ask = d.id;   // the host says our snowball hit a plaque
}

function applySnapshot(d) {
  const prev = state.mode;
  state.runner = !!d.rn; state.home = !!d.hm; state.last = !!d.la; state.castleHp = d.ch || 0; state.lbLimit = d.lb || 0; state.lbWave = d.lw || 0;
  if (d.m === 'castlewin' && prev !== 'castlewin') { state.cwT = 0; spawnConfetti(); state.lastDone = true; saveBest(1, CONFIG.lastDoneKey); }
  if (d.m === 'cooplobby') {                                           // host is in the lobby: nothing to simulate
    if (prev !== 'cooplobby') { resetGame(); state.entry = ''; setMode('cooplobby'); }
    return;
  }
  if (d.m === 'playing' && prev !== 'playing') { resetGame(); }        // first snapshot, or the host pressed Play Again
  if (d.m === 'gameover' && prev === 'playing') {
    endAim();
    recordBest(d.w);
    awardXp(d.sc[net.localSlot]);
  }
  state.mode = d.m;
  if (d.fl > state.flash + 0.01) state.hurt = HURT_TIME;                // the host's fort/player was hit
  state.score = d.sc[net.localSlot]; state.remote.score = d.sc[1 - net.localSlot]; state.wave = d.w; state.health = d.h; state.flash = d.fl; state.banner = d.bn;
  state.time = d.tm; state.treesRemoved = d.tr;
  state.popup = d.pu ? { text: d.pu.s, t: d.pu.t } : null;
  state.power = d.pw ? { x: d.pw[0], baseY: d.pw[1], y: d.pw[1] + Math.sin(d.pw[2] * 2.5) * 3, age: d.pw[2] } : null;
  state.gun = d.g[net.localSlot];
  const r = state.remote;                                              // the host, from the guest's point of view
  if (d.hp) {
    if (r.tx === undefined) { r.px = d.hp[0]; r.py = d.hp[1] + wallOff(); }
    else if (Math.hypot(d.hp[0] - r.tx, d.hp[1] + wallOff() - r.ty) > 0.05) r.walkT = 0.15;
    r.tx = d.hp[0]; r.ty = d.hp[1] + wallOff();
  }
  r.gun = d.g[1 - net.localSlot]; r.aimAngle = d.ha[0]; r.aiming = r.aimValid = !!d.ha[1]; r.swing = d.ha[2];

  const old = new Map(state.bullies.map(b => [b.id, b]));              // keep local footprint state per bully
  state.bullies = d.B.map(a => {
    const b = old.get(a[0]) || { id: a[0], stepAcc: 0, stepSide: 1 };
    b.type = TYPE_IDS[a[1]]; b.x = a[2]; b.y = a[3]; b.vx = a[4]; b.vy = a[5];
    b.state = STATE_IDS[a[6]]; b.t = a[7]; b.flash = a[8] ? CONFIG.hitFlashTime : 0; b.ph = a[9]; b.ang = a[10]; b.hp = a[11]; b.phase = a[12]; b.win = a[13]; b.rider = TYPE_IDS[a[14]]; b.dropped = !!a[15];
    return b;
  });
  state.snowballs = d.S.map(a => ({ x: a[0], y: a[1], vx: a[2], vy: a[3] }));
  state.enemyBalls = (d.E || []).map(a => ({ x: a[0], y: a[1], vx: a[2], vy: a[3] }));
  state.avalanche = typeof d.av === 'number' ? { y: d.av } : null;
  if (d.ho) {
    d.ho.w.forEach((hp, i) => { if (state.wins[i]) state.wins[i].hp = hp; });
    state.door.open = !!d.ho.d;
    state.perks = {}; for (const k of d.ho.p[net.localSlot]) state.perks[k] = true;
  }
  for (const e of d.ev || []) {
    if (e.e === 'p') puff(e.x, e.y);
    else if (e.e === 's') sfx(e.n, true);
  }
}

// Guest: advance what the last snapshot described, so motion stays smooth between snapshots
function updateGuest(dt) {
  updateFlakes(dt);
  state.time += dt;
  if (state.mode === 'playing' && (state.runner || state.home)) {
    moveRunner(dt);
    if (state.stick) sendAim();
    const r = state.remote;
    if (r.tx !== undefined) { const k = Math.min(1, dt * 15); r.px += (r.tx - r.px) * k; r.py += (r.ty - r.py) * k; }
  }
  for (const p of [state, state.remote]) {
    if (p.walkT > 0) p.walkT = Math.max(0, p.walkT - dt);
    if (p.cooldown > 0) p.cooldown = Math.max(0, p.cooldown - dt);
    if (p.swing > 0) p.swing = Math.max(0, p.swing - dt);
  }
  if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
  if (state.hurt > 0) state.hurt = Math.max(0, state.hurt - dt);
  if (state.banner > 0) state.banner -= dt;
  if (state.popup && (state.popup.t -= dt) <= 0) state.popup = null;
  if (state.power) {
    state.power.age += dt;
    state.power.y = state.power.baseY + Math.sin(state.power.age * 2.5) * 3;
  }
  for (const s of state.snowballs) { s.x += s.vx * dt; s.y += s.vy * dt; }
  for (const s of state.enemyBalls) { s.x += s.vx * dt; s.y += s.vy * dt; }
  for (const b of state.bullies) {
    if (b.state === 'walking') {
      const px = b.x, py = b.y;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (!CONFIG.bullyTypes[b.type].drives) footstep(b, CONFIG.bullyTypes[b.type], px, py);
    } else b.t += dt;
  }
  if (state.avalanche) { state.avalanche.y += CONFIG.avalancheSpeed * dt; avalancheFx(dt); }
  updateParticles(dt);
  updatePrints(dt);
}

// Every frame while connected: host sends snapshots, guest sends a heartbeat; either side notices a dead link
function netTick(dt) {
  net.acc += dt;
  if (net.role === 'host' && net.acc >= CONFIG.netInterval) { net.acc = 0; netSend(state.battle ? btSnapshot() : buildSnapshot()); }
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

function drawKid(slot) {
  const { x, y } = kidPos(slot);
  const p = pl(slot), walking = (state.runner || state.home) && (p === state ? state.stick && (state.home && !state.door.open ? Math.abs(state.stick.dx) > 0.1 : (state.stick.dx || state.stick.dy)) : p.walkT > 0);
  drawKidAt(x, y, slot, breath(slot), walking ? 1 + (Math.floor(state.time * 8) % 2) : 0);
  if (state.hurt > 0 && Math.floor(state.hurt * 20) % 2 === 0) {      // red flash, blinking
    ctx.globalAlpha = 0.65;
    rect(COLORS.red, x + 1, y, 6, 7); rect(COLORS.red, x, y + 7, 8, 6); rect(COLORS.red, x + 2, y + 13, 4, 2);
    ctx.globalAlpha = 1;
  }
}

function drawHome() {
  if (!state.home) return;
  const wy = homeWallY(), W2 = CONFIG.W * 2;
  const L = CONFIG.homeL, R = CONFIG.homeR, iw = R - L - 24;
  rect('#a9743a', L + 12, wy + 10, iw, 52);                  // floor
  for (let x = L + 12; x < R - 12; x += 12) rect('#96622c', x, wy + 10, 1, 52);
  rect('#6b4423', L, wy, R - L, 10);                         // back wall
  rect('#4a2f17', L, wy + 8, R - L, 2);
  rect('#6b4423', L, wy, 12, 64); rect('#4a2f17', L + 10, wy + 10, 2, 52);   // end walls
  rect('#6b4423', R - 12, wy, 12, 64); rect('#4a2f17', R - 12, wy + 10, 2, 52);
  rect('#4a2f17', L, wy + 62, R - L, 2);                     // front edge
  for (const w of state.wins) {
    const hw = CONFIG.homeWinHalf;
    rect(COLORS.night, w.x - hw - 2, wy - 1, hw * 2 + 4, 11);   // frame
    ctx.drawImage(bg, w.x - hw - (w.x >= CONFIG.W ? CONFIG.W : 0), wy, hw * 2, 9, w.x - hw, wy, hw * 2, 9);   // opening shows the snow outside
    const n = Math.ceil(w.hp / CONFIG.homeWinHp * 4 - 0.001);
    for (let k = 0; k < n; k++) { rect('#c58b4a', w.x - hw, wy + k * 2 + 1, hw * 2, 2); rect('#8a5a2b', w.x - hw, wy + k * 2 + 2, hw * 2, 1); }
  }
  drawDoor();
  drawPerkPlaques();
  drawFurniture();
}

// Decorative furniture on the floor (the boy walks in front of it)
// Last Battle: the Evil Snow Force's castle at the top of the map, centred over the door
function drawCastle() {
  const won = state.mode === 'castlewin';
  ctx.save();
  if (won) {                                                   // crash: clip at the ground, shake, sink
    ctx.beginPath(); ctx.rect(CONFIG.W - 120, CONFIG.lastTop - 200, 240, 202); ctx.clip();
    ctx.translate(state.cwT < 2.6 ? Math.round((Math.random() - 0.5) * 4) : 0, Math.round(Math.min(110, state.cwT * 42)));
  }
  drawCastleBody();
  ctx.restore();
  if (!won && state.castleHp > 0) {                            // health bar above it
    const cx = CONFIG.W, y = CONFIG.lastTop - 80, w = 100;       // on the wall, between the towers
    drawText5('EVIL SNOW FORCE', cx, y - 10, 1, COLORS.snow, 'center', COLORS.night);
    rect(COLORS.night, cx - w / 2 - 2, y - 2, w + 4, 14); rect(COLORS.snow, cx - w / 2 - 1, y - 1, w + 2, 12); rect(COLORS.shadow, cx - w / 2, y, w, 10);
    rect(COLORS.red, cx - w / 2, y, Math.max(1, Math.round(w * state.castleHp / CONFIG.castleHp)), 10);
  }
}

function drawCastleBody() {
  const cx = CONFIG.W, y = CONFIG.lastTop, G = '#6e7a8a', D = '#4a5563', K = '#2f3744';
  rect(K, cx - 62, y - 52, 124, 54); rect(G, cx - 60, y - 50, 120, 50);                       // wall
  for (let x = cx - 60; x < cx + 60; x += 8) { rect(K, x - 1, y - 60, 7, 11); rect(G, x, y - 59, 5, 9); }   // battlements
  for (let k = 0; k < 4; k++) rect(D, cx - 60, y - 40 + k * 12, 120, 1);                      // stone courses
  for (const sx of [cx - 76, cx + 52]) {                                                       // towers
    rect(K, sx - 1, y - 92, 26, 94); rect(D, sx, y - 90, 24, 90);
    for (let x = sx; x < sx + 24; x += 8) { rect(K, x - 1, y - 100, 7, 10); rect(D, x, y - 99, 5, 9); }
    rect(K, sx + 11, y - 120, 2, 20); rect(COLORS.red, sx + 13, y - 120, 9, 6);                  // flag
    rect(K, sx + 9, y - 70, 6, 10); rect(COLORS.red, sx + 10, y - 69, 4, 8);                     // glowing window
  }
  rect(K, cx - 14, y - 36, 28, 36); rect(COLORS.night, cx - 12, y - 34, 24, 34);              // gate
  rect(K, cx - 12, y - 36, 24, 3);
  for (let x = cx - 10; x <= cx + 8; x += 6) rect(D, x, y - 32, 1, 32);                        // portcullis
}

function drawFurniture() {
  const y = homeWallY();
  rect('#7a2e2e', 154, y + 36, 52, 20);                       // area rug
  rect('#c8b24a', 155, y + 37, 50, 1); rect('#c8b24a', 155, y + 54, 50, 1);
  rect('#c8b24a', 155, y + 37, 1, 18); rect('#c8b24a', 204, y + 37, 1, 18);
  rect('#9b3d3d', 158, y + 40, 44, 12); rect('#7a2e2e', 162, y + 43, 36, 6);
  rect('#2f4f7f', 96, y + 52, 40, 8);                         // couch against the lower wall: back, seat, arms, cushions
  rect('#3b63a0', 96, y + 40, 40, 13);
  rect('#2f4f7f', 94, y + 40, 4, 20); rect('#2f4f7f', 134, y + 40, 4, 20);
  rect('#2f4f7f', 109, y + 41, 1, 10); rect('#2f4f7f', 122, y + 41, 1, 10);
  for (const x of [36, 312]) {                                // potted plants
    rect('#2f8f3f', x - 2, y + 36, 14, 12); rect('#4fb85a', x + 1, y + 32, 8, 8);
    rect('#2f8f3f', x - 4, y + 40, 4, 5); rect('#2f8f3f', x + 12, y + 39, 4, 5);
    rect('#b5532f', x, y + 48, 10, 9); rect('#8a3f22', x, y + 55, 10, 2);
  }
}

// Decorative barricaded door in the middle of the house (no function yet)
function drawDoor() {
  const wy = homeWallY(), x = CONFIG.W;
  rect(COLORS.night, x - 11, wy - 3, 22, 13);                // frame
  if (state.door.open) {                                     // open: a gap onto the snow, with the door leaf swung to the side
    ctx.drawImage(bg, x - 8, wy, 8, 10, x - 8, wy, 8, 10);
    ctx.drawImage(bg, 0, wy, 8, 10, x, wy, 8, 10);
    rect('#6b4423', x - 10, wy - 1, 2, 11); rect('#c8b24a', x - 10, wy + 4, 1, 2);
    return;
  }
  rect('#4a2f17', x - 9, wy - 1, 18, 11);                    // door
  rect('#6b4423', x - 9, wy - 1, 8, 11);
  rect('#c8b24a', x + 4, wy + 4, 2, 2);                      // knob
  for (const y of [wy, wy + 6]) { rect('#c58b4a', x - 12, y, 24, 3); rect('#8a5a2b', x - 12, y + 2, 24, 1); }   // boards across it
  for (const sx of [-8, 6]) { rect(COLORS.night, x + sx, wy + 1, 1, 1); rect(COLORS.night, x + sx + 2, wy + 7, 1, 1); }   // nails
}

// Small pixel icons for the perks (about 5x5 units; k = scale), used on the wall plaques, the buttons and the confirm screen
function perkIcon(id, cx, cy, k, rot) {
  const r = (c, x, y, w, h) => rect(c, Math.round(cx + x * k), Math.round(cy + y * k), w * k, h * k);
  if (id === 'health') {                                    // bright green medical cross (outlined and longer when drawn bigger)
    r('#2ee05a', 0, -2, 1, 5); r('#2ee05a', -2, 0, 5, 1);        // thin cross at every size, so it matches the plaque
  }
  else if (id === 'avalanche') { r(COLORS.snow, 0, -2, 1, 1); r(COLORS.snow, -1, -1, 3, 1); r(COLORS.ice, -2, 0, 5, 3); }
  else if (id === 'gun') { r(COLORS.ice, -2, -1, 5, 2); r(COLORS.ice, 2, -1, 2, 1); r(COLORS.ice, -2, 1, 2, 2); }
  else if (id === 'speed') { r(COLORS.gold, 0, -2, 2, 1); r(COLORS.gold, -1, -1, 2, 1); r(COLORS.gold, -1, 0, 3, 1); r(COLORS.gold, 0, 1, 2, 1); r(COLORS.gold, -1, 2, 1, 1); }
  else if (id === 'checkpoint') { if (rot) { r(COLORS.red, -2, -2, 5, 1); r(COLORS.red, 0, -1, 3, 4); } else { r(COLORS.red, -2, -2, 1, 5); r(COLORS.red, -1, -2, 4, 3); } }
  else { r('#c58b4a', -2, -2, 5, 5); r('#6b4423', -1, -1, 3, 4); r(COLORS.gold, 1, 1, 1, 1); }
}

function drawPerkPlaques() {
  if (state.story || state.last || state.mode === 'homelevels' || state.mode === 'runpan') return;   // no perks in Home levels
  const wy = homeWallY();
  for (const p of HOME_PERKS) {
    if (state.perks[p.id]) ctx.globalAlpha = 0.45;
    if (p.side) {                                   // on the right end wall, facing the player
      rect(COLORS.gold, p.x - 5, wy + p.dy, 10, 16); rect('#2b1d10', p.x - 4, wy + p.dy + 1, 8, 14);
      perkIcon(p.id, p.x, wy + p.dy + 8, 1, true);
      ctx.globalAlpha = 1; continue;
    }
    rect(COLORS.gold, p.x - 8, wy + 1, 16, 8);
    rect('#2b1d10', p.x - 7, wy + 2, 14, 6);
    perkIcon(p.id, p.x, wy + 5, 1);
    ctx.globalAlpha = 1;
  }
}

// Warning while enemies are inside the house: a big blinking banner, plus a red bar on the side where one is off screen
function drawWinAlerts() {
  if (!state.home || state.last || state.mode !== 'playing' || Math.floor(state.time * 4) % 2) return;
  const inside = state.bullies.filter(b => b.state === 'walking' && b.phase >= 2);
  if (!inside.length) return;
  drawText5('ENEMY INSIDE!', CONFIG.W / 2, view.safeTop + 26, 2, COLORS.red, 'center', COLORS.night);
  const wy = homeWallY();
  for (const side of [-1, 1]) {
    if (inside.some(b => side < 0 ? b.x < state.camX : b.x > state.camX + CONFIG.W)) rect(COLORS.red, side < 0 ? 0 : CONFIG.W - 3, wy - 12, 3, 76);
  }
}

function drawStick() {
  const st = state.stick;
  if (!st || !(state.runner || state.home || state.mode === 'battle') || (state.mode !== 'playing' && state.mode !== 'battle')) return;
  const R = CONFIG.stickRadius;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; rect(COLORS.night, st.ax + Math.cos(a) * R - 1, st.ay + Math.sin(a) * R - 1, 2, 2); }
  ctx.globalAlpha = 0.6;
  const kx = Math.round(st.ax + st.dx * R), ky = Math.round(st.ay + st.dy * R);
  rect(COLORS.night, kx - 4, ky - 4, 8, 8); rect(COLORS.ice, kx - 3, ky - 3, 6, 6);
  ctx.globalAlpha = 1;
}

// step: 0 = standing, 1 / 2 = the two walking poses (legs alternate)
function drawKidAt(x, y, slot, b, step) {
  const c = typeof slot === 'object' ? slot : KID_COLORS[slot];
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

function drawEnemyBall(e) {          // thrown at the fort: red-rimmed so it reads as the enemy's
  const x = Math.round(e.x), y = Math.round(e.y);
  rect(COLORS.red, x - 2, y - 3, 5, 7); rect(COLORS.red, x - 3, y - 2, 7, 5);
  rect(COLORS.snow, x - 2, y - 2, 4, 4);
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
  snowmobile: { w: 14, h: 14, lw: 16, lh: 10, hair: COLORS.ice, coat: COLORS.red },
  thrower: { w: 10, h: 14, lw: 14, lh: 8,  hair: COLORS.blonde, coat: COLORS.pink },
  regular: { w: 10, h: 14, lw: 14, lh: 8,  hair: COLORS.brown },
  runner:  { w: 8,  h: 12, lw: 11, lh: 7,  hair: COLORS.hatGreen, coat: COLORS.shadow },
  big:     { w: 14, h: 16, lw: 16, lh: 11, hair: COLORS.black, coat: COLORS.coatBlue },
  sled:    { w: 14, h: 11, lw: 14, lh: 7,  hair: COLORS.gold, coat: COLORS.orange },
  yeti:    { w: 18, h: 20, lw: 22, lh: 12, hair: COLORS.ice, coat: COLORS.ice },   // bigger than the usual 16x16: it is the boss
};
LOOK.regular.coat = COLORS.red;

const SPRITES = {
  snowmobile: (r, s, b) => {                              // ice-blue machine with the rider on the seat; skis rattle as it goes
    r(COLORS.night, 1, 4 + s, 2, 10); r(COLORS.night, 11, 4 + s, 2, 10);
    r(COLORS.ice, 3, 7, 8, 6);
    r(COLORS.red, 5, 9, 4, 2);
    r(COLORS.gold, 6, 13, 2, 1);
    if (!b.dropped) {
      const L = LOOK[b.rider];
      r(L.hair, 5, 0, 4, 2); r(COLORS.skin, 5, 2, 4, 2); r(L.coat || COLORS.red, 4, 4, 6, 3);
    }
  },
  thrower: (r, s) => {                                    // girl: blonde hair, pink coat, snowball held up in one hand
    r(COLORS.blonde, 2, 0, 6, 2);
    r(COLORS.blonde, 1, 2, 1, 5); r(COLORS.blonde, 8, 2, 1, 5);
    r(COLORS.skin, 2, 2, 6, 4);
    r(COLORS.black, 3, 3, 1, 1); r(COLORS.black, 6, 3, 1, 1);
    r(COLORS.pink, 1, 7, 8, 4);
    r(COLORS.pink, 0, 7, 1, 3); r(COLORS.pink, 9, 3, 1, 4);
    r(COLORS.snow, 9, 0, 3, 3);
    r(COLORS.black, 2, 11, 2, 3 - s);
    r(COLORS.black, 6, 11, 2, 2 + s);
  },
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
  if (type === 'snowmobile') {                            // wrecked: skewed skis and a puff of smoke
    r(COLORS.ice, 2, 3, 12, 6); r(COLORS.red, 5, 5, 5, 2);
    r(COLORS.night, 0, 9, 7, 1); r(COLORS.night, 9, 0, 7, 1);
    r(COLORS.shadow, 6, 1, 2, 2); r(COLORS.shadow, 9, 2, 2, 1);
    return;
  }
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
  if (b.state === 'walking') SPRITES[b.type](r, Math.floor(state.time * 6 + b.ph) % 2, b);
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

function button(label, cx, cy, w, hMul, onTap, color, gap, sub) {   // sub: small second line inside the button
  const h = Math.ceil(btnH() * hMul);
  const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  state.buttons.push({ x, y: y + view.ty, w, h, onTap });
  rect(COLORS.night, x - 1, y - 1, w + 2, h + 2);
  rect(color || COLORS.gold, x, y, w, h);
  rect(color ? COLORS.shadow : '#e6b92e', x, y + h - 2, w, 2);
  drawText5(label, cx, sub ? y + 4 : y + Math.round((h - 14) / 2), 2, COLORS.night, 'center', undefined, gap);
  if (sub) drawText5(sub, cx, y + 21, 1, COLORS.night, 'center');
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
  if (state.last && state.castleHp > 0) {                       // Castle health, always on screen
    drawText('EVIL SNOW FORCE', CONFIG.W - 3, 3, 1, COLORS.snow, 'right');
    rect(COLORS.night, 69, 11, 110, 11); rect(COLORS.shadow, 70, 12, 108, 9);
    rect(COLORS.red, 70, 12, Math.max(1, Math.round(108 * state.castleHp / CONFIG.castleHp)), 9);
  }
  if (!state.last) drawText(state.story ? 'LEVEL ' + state.story.level : 'WAVE ' + state.wave, CONFIG.W / 2, 3, 1, COLORS.snow, 'center');
  if (!state.last) drawText('BEST WAVE ' + Math.max(bestNow(), state.wave), CONFIG.W - 3, 3, 1, COLORS.snow, 'right');
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
  if (state.home) {                                           // owned perks: smaller and see-through; tap one to use it
    const ps = Math.round(s * 0.75), px = CONFIG.W - 3 - ps;
    let py = y + s + 6;
    for (const p of HOME_PERKS) {
      if (!state.perks[p.id]) continue;
      ctx.globalAlpha = 0.5; rect(COLORS.gold, px - 1, py - 1, ps + 2, ps + 2); rect(COLORS.night, px, py, ps, ps);
      perkIcon(p.id, px + Math.floor(ps / 2), py + Math.floor(ps / 2), Math.max(1, Math.floor((ps - 4) / 5)));
      ctx.globalAlpha = 1;
      if (state.mode === 'playing' && !state.ask) state.buttons.push({ x: px, y: py + view.ty, w: ps, h: ps, onTap: () => usePerk(p.id) });
      py += ps + 4;
    }
  }
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
  drawPowerAt(pw.x, pw.y, pw.age);
}
function drawPowerAt(px, py, age) {
  const x = Math.round(px) - 3, y = Math.round(py) - 3;
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
  const tw = Math.floor(age * 6) % 4;                         // sparkles take turns
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
  drawTextShadow(state.last ? 'LAST BATTLE' : state.story ? 'LEVEL ' + state.story.level : 'WAVE ' + state.wave, CONFIG.W / 2, 100, state.last ? 2 : 3, COLORS.gold, 'center');
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
  const sh = button('STORY', CONFIG.W / 2, 140, 100, 1, () => setMode('levels'), COLORS.hatGreen, 1);
  button('WAVES', CONFIG.W / 2, 140 + sh + 8, 100, 1, () => setMode('wavesmenu'));
  button('BATTLE', CONFIG.W / 2, 140 + 2 * (sh + 8), 100, 1, () => setMode('battlemenu'), COLORS.red, 1);
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
  const h = btnH();
  button('SOLO', CONFIG.W / 2, 140, 100, 1, () => { state.typeCoop = false; setMode('wavetype'); });
  button('CO-OP', CONFIG.W / 2, 140 + h + 8, 100, 1, () => { state.typeCoop = true; openCoopMenu(); }, COLORS.ice, 1);
  button('BACK', CONFIG.W / 2, 140 + 2 * (h + 8), 76, 1, () => setMode('title'), COLORS.shadow, 1);
}

function chooseWaveType(r) { state.wantRunner = r === true; if (state.typeCoop) openCoopMenu(); else startGame(r); }
function drawWaveType() {
  drawText5('WAVES', CONFIG.W / 2, 50, 3, COLORS.coatBlue, 'center', COLORS.night);
  const solo = !state.typeCoop, bh = solo ? Math.max(btnH(), 32) : btnH(), step = bh + 8;
  let cy = solo ? 76 + Math.ceil(bh / 2) : 110;
  const row = (label, kind, color, gap) => {
    button(label, CONFIG.W / 2, cy, 110, bh / btnH(), () => chooseWaveType(kind), color, gap,
      solo ? 'BEST WAVE: ' + state.bests[kind === true ? 'runner' : kind === 'home' ? 'home' : 'fort'] : undefined);
    cy += step;
  };
  row('FORT', false);
  row('RUNNER', true, COLORS.hatGreen, 1);
  if (solo) row('HOME', 'home', COLORS.coatBlue, 1);
  button('BACK', CONFIG.W / 2, cy, 76, 1, () => setMode('wavesmenu'), COLORS.shadow, 1);
}

function drawLevels() {
  drawText5('FORT', CONFIG.W / 2, 30, 3, COLORS.coatBlue, 'center', COLORS.night);
  const h = btnH();
  for (let n = 1; n <= CONFIG.storyLevels; n++) {
    const col = (n - 1) % 2, row = Math.floor((n - 1) / 2), ok = n <= state.storyUnlocked;
    const cx = CONFIG.W / 2 + (col ? 34 : -34), cy = 70 + row * (h + 8);
    const next = n === state.storyUnlocked;
    if (!ok) ctx.globalAlpha = 0.55;
    button(String(n), cx, cy, 56, 1, ok ? (n === 1 ? startCutscene : () => startStory(n)) : () => {}, ok ? COLORS.hatGreen : COLORS.shadow, 1);
    ctx.globalAlpha = 1;
    if (next) {
      const x = Math.round(cx - 28) - 3, y = Math.round(cy - h / 2) - 3, w = 62, bh = h + 6;
      rect(COLORS.gold, x, y, w, 2); rect(COLORS.gold, x, y + bh - 2, w, 2);
      rect(COLORS.gold, x, y, 2, bh); rect(COLORS.gold, x + w - 2, y, 2, bh);
    }
  }
  button('BACK', CONFIG.W / 2, 70 + 5 * (h + 8) + 6, 76, 1, () => setMode('title'), COLORS.ice, 1);
}

// Level-select pages sit side by side: 0 Fort, 1 Runner, 2 Home. The boy runs between them.
const PAGE_MODES = ['levels', 'runnerlevels', 'homelevels'];
const RUN_T = 0.9, PAN_T = 1.0;   // seconds: boy runs off, then the screen pans to the next page
const pageOpen = p => p === 0 ? state.storyUnlocked > CONFIG.storyLevels : p === 1 && state.runnerUnlocked > CONFIG.storyLevels;   // is the next page unlocked from page p

function startPan(from, to) { state.pan = { t: 0, from, to }; setMode('runpan'); }

function drawLevelPage(title, unlocked, start) {
  drawText5(title, CONFIG.W / 2, 30, 3, COLORS.coatBlue, 'center', COLORS.night);
  const h = btnH();
  for (let n = 1; n <= 10; n++) {
    const col = (n - 1) % 2, row = Math.floor((n - 1) / 2);
    const cx = CONFIG.W / 2 + (col ? 34 : -34), cy = 70 + row * (h + 8), ok = n <= unlocked, next = n === unlocked;
    if (!ok) ctx.globalAlpha = 0.55;
    button(String(n), cx, cy, 56, 1, ok ? () => start(n) : () => {}, ok ? COLORS.hatGreen : COLORS.shadow, 1);
    ctx.globalAlpha = 1;
    if (next) {
      const x = Math.round(cx - 28) - 3, y = Math.round(cy - h / 2) - 3, w = 62, bh = h + 6;
      rect(COLORS.gold, x, y, w, 2); rect(COLORS.gold, x, y + bh - 2, w, 2);
      rect(COLORS.gold, x, y, 2, bh); rect(COLORS.gold, x + w - 2, y, 2, bh);
    }
  }
  button('BACK', CONFIG.W / 2, 70 + 5 * (h + 8) + 6, 76, 1, () => setMode('title'), COLORS.ice, 1);
}
const drawRunnerLevels = () => drawLevelPage('RUNNER', state.runnerUnlocked, startRunnerLevel);
const drawHomeLevels = () => drawLevelPage('HOME', state.homeUnlocked, startHomeLevel);

// The boy stands at the bottom of each page (the Fort page draws him itself); gold arrows beside him lead to the neighbouring pages
function drawPageBoy(p) {
  if (p === 1) drawKidAt(CONFIG.kidX, CONFIG.kidY, 0, breath(0), 0);   // Home page: the kid is drawn inside the house by the normal pass
  const by = (p === 2 ? homeBoyY() : CONFIG.kidY) + 7;
  if (p > 0) {
    const bx = CONFIG.kidX - 38;
    button('', bx, by, 28, 1, () => startPan(p, p - 1), COLORS.gold, 1);
    for (let i = 0; i < 5; i++) rect(COLORS.night, bx + 5 - i * 2 - 1, by - (5 - i), 2, 10 - i * 2);   // left-pointing triangle
  }
  if (p === 2 && state.homeUnlocked > CONFIG.storyLevels)       // all Home levels cleared: the final level opens, bottom right of the house
  {
    state.lastSel = Math.min(state.lastSel, state.lastLv + 1);
    const bh = button('LAST', CONFIG.W - 3 - 30, by, 60, 1.3, startLastBattle, COLORS.red, 1, 'BATTLE'), cx = CONFIG.W - 33, t = performance.now() / 1000;
    if (state.lastLv > 0) {                                       // badge: tap to pick how many Yetis guard the Castle (up to one past the highest beaten)
      const bx = cx, byy = by + Math.ceil(bh / 2) + 3 + Math.ceil(Math.ceil(btnH() * 0.6) / 2);
      button('', bx, byy, 20, 0.6, () => { state.lastSel = state.lastSel > state.lastLv ? 1 : state.lastSel + 1; }, COLORS.gold, 1);
      drawText5(String(state.lastSel), bx, byy - 4, 1, COLORS.night, 'center');
    }
    if (state.lastDone) {                                         // beaten: golden sparkles twinkle around the button
      for (let i = 0; i < 10; i++) {
        const f = (t * 1.6 + i * 0.37) % 1;
        if (f > 0.6) continue;
        const a = i / 10 * 4, side = Math.floor(a), u = a - side;   // walk once round the rectangle
        const px = side === 0 ? cx - 34 + u * 68 : side === 1 ? cx + 34 : side === 2 ? cx + 34 - u * 68 : cx - 34;
        const py = side === 0 ? by - bh / 2 - 4 : side === 1 ? by - bh / 2 - 4 + u * (bh + 8) : side === 2 ? by + bh / 2 + 4 : by + bh / 2 + 4 - u * (bh + 8);
        const x = Math.round(px), y = Math.round(py), big = f > 0.15 && f < 0.45;
        rect(COLORS.gold, x - 1, y, 3, 1); rect(COLORS.gold, x, y - 1, 1, 3);
        if (big) { rect(COLORS.gold, x - 2, y, 5, 1); rect(COLORS.gold, x, y - 2, 1, 5); rect(COLORS.snow, x, y, 1, 1); }
      }
    }
  }
  if (pageOpen(p)) {
    const bx = CONFIG.kidX + 46;
    button('', bx, by, 28, 1, () => startPan(p, p + 1), COLORS.gold, 1);
    for (let i = 0; i < 5; i++) rect(COLORS.night, bx - 5 + i * 2, by - (5 - i), 2, 10 - i * 2);   // right-pointing triangle
  }
}

function drawRunPan() {
  const { t, from, to } = state.pan, W = CONFIG.W, k = Math.min(1, Math.max(0, (t - RUN_T) / PAN_T)), e = k * k * (3 - 2 * k);
  const cam = Math.round((from + (to - from) * e) * W);
  for (let p = 0; p < 3; p++) ctx.drawImage(bg, p * W - cam, 0);
  drawFlakes();
  for (let p = 0; p < 2; p++) { ctx.save(); ctx.translate(p * W - cam, 0); drawTreesAndBullies(); if (p === 0) drawFort(); ctx.restore(); }
  homeFresh(); state.home = true;                          // page 2 is the house (camera 90 centres it on the door, as on the Home page)
  ctx.save(); ctx.beginPath(); ctx.rect(2 * W - cam, 0, W, view.h + 16); ctx.clip();   // keep the house inside its own page so it never overlaps the Runner page
  ctx.translate(2 * W - cam - W / 2, 0); drawHome(); ctx.restore();
  state.home = false;
  // One boy runs the whole way (world x), so he never stops or swaps with a second boy
  const u = Math.min(1, t / (RUN_T + PAN_T)), x0 = from * W + CONFIG.kidX, x1 = to * W + CONFIG.kidX;
  const ky = p => p === 2 ? homeBoyY() : CONFIG.kidY;
  drawKidAt(Math.round(x0 + (x1 - x0) * u) - cam, Math.round(ky(from) + (ky(to) - ky(from)) * u), 0, 0, 1 + (Math.floor(t * 10) % 2));
  for (const [p, fn] of [[1, drawRunnerLevels], [2, drawHomeLevels]]) { ctx.save(); ctx.translate(p * W - cam, 0); withInset(fn); ctx.restore(); }
  state.buttons = [];
}

function drawLevelWin() {
  dim();
  const n = state.story.level, last = n >= CONFIG.storyLevels;
  drawTextShadow(last ? 'YOU WIN!' : 'LEVEL ' + n + ' CLEAR', CONFIG.W / 2, 60, 2, COLORS.gold, 'center');
  drawTextShadow('SCORE: ' + state.score, CONFIG.W / 2, 100, 2, COLORS.snow, 'center');
  let y = 150;
  if (!last) y += button('NEXT LEVEL', CONFIG.W / 2, y, 140, 1.3, () => storyStart(state.story, n + 1)) + 10;
  button('MENU', CONFIG.W / 2, y + Math.ceil(btnH() / 2) + (last ? 0 : 6), 100, 1, () => { const m = storyMenu(state.story); resetGame(); state.story = null; setMode(m); }, COLORS.ice);
}

function drawCoopMenu() {
  const cx = CONFIG.W / 2, h = Math.ceil(btnH() * 1.3);
  drawText5('CO-OP', cx, 36, 3, COLORS.coatBlue, 'center', COLORS.night);
  drawText5(state.wantBattle ? 'TWO PLAYERS - TEN BOTS' : 'TWO PLAYERS - ONE FORT', cx, 68, 1, COLORS.night, 'center', COLORS.snow);
  button('CREATE GAME', cx, 120, 160, 1.3, () => { setMode('coophost'); hostGame(); });
  button('JOIN GAME', cx, 120 + h + 10, 140, 1.3, () => { state.entry = ''; net.status = 'idle'; net.error = ''; setMode('coopjoin'); });
  button('BACK', cx, 120 + 2 * (h + 10), 100, 1, () => setMode(state.wantBattle ? 'battlemenu' : 'wavesmenu'), COLORS.ice);
}

function drawCoopLobby() {
  const cx = CONFIG.W / 2, h = btnH();
  drawText5('CO-OP', cx, 30, 3, COLORS.coatBlue, 'center', COLORS.night);
  if (net.lost) {
    drawText5('THE OTHER PLAYER LEFT', cx, 80, 1, COLORS.red, 'center', COLORS.snow);
    button('LEAVE', cx, 120, 100, 1, leaveCoop, COLORS.ice);
    return;
  }
  const host = net.role === 'host';
  if (state.wantBattle) { drawText5('BATTLE', cx, 70, 2, COLORS.red, 'center', COLORS.snow); drawText5('STARTING...', cx, 96, 1, COLORS.night, 'center', COLORS.snow); return; }
  if (host) drawText5('CHOOSE A MAP', cx, 66, 1, COLORS.night, 'center', COLORS.snow);
  else drawText5('HOST IS CHOOSING A MAP' + '.'.repeat(1 + Math.floor(performance.now() / 400) % 3), cx, 66, 1, COLORS.coatBlue, 'center', COLORS.snow);
  if (!host) ctx.globalAlpha = 0.55;                                   // guest sees the options but can't pick
  const bh = Math.max(h, 32), step = bh + 8, y0 = 84 + Math.ceil(bh / 2);
  button('FORT', cx, y0, 110, bh / h, host ? () => startGame(false) : () => {}, undefined, undefined, 'BEST WAVE: ' + state.coopBests.fort);
  button('RUNNER', cx, y0 + step, 110, bh / h, host ? () => startGame(true) : () => {}, COLORS.hatGreen, 1, 'BEST WAVE: ' + state.coopBests.runner);
  button('HOME', cx, y0 + 2 * step, 110, bh / h, host ? () => startGame('home') : () => {}, COLORS.coatBlue, 1, 'BEST WAVE: ' + state.coopBests.home);
  ctx.globalAlpha = 1;
  const lb = state.homeUnlocked > CONFIG.storyLevels;
  if (!lb || !host) ctx.globalAlpha = 0.55;
  button('LAST BATTLE', cx, y0 + 3 * step, 110, bh / h, host && lb ? startLastBattle : () => {}, COLORS.red, 1, lb ? 'FINAL LEVEL' : 'CLEAR HOME FIRST');
  ctx.globalAlpha = 1;
  button('LEAVE', cx, y0 + 4 * step, 90, 1, leaveCoop, COLORS.shadow, 1);
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

function drawPerkConfirm() {
  dim();
  const p = HOME_PERKS.find(q => q.id === state.ask);
  if (!p) return;
  const cx = CONFIG.W / 2, h = btnH();
  rect(COLORS.gold, cx - 17, 50, 34, 34); rect('#2b1d10', cx - 15, 52, 30, 30);
  perkIcon(p.id, cx, 67, 4);
  drawTextShadow(p.name, cx, 94, 2, COLORS.snow, 'center');
  drawTextShadow('COST ' + p.cost, cx, 116, 1, COLORS.gold, 'center');
  drawTextShadow('YOU HAVE ' + state.score, cx, 128, 1, COLORS.snow, 'center');
  const noCp = p.id === 'checkpoint' && !checkpointOk();
  if (p.id === 'checkpoint') drawTextShadow('SKIP TO WAVE ' + checkpointTarget(), cx, 138, 1, COLORS.ice, 'center');
  if (state.perks[p.id] || state.score < p.cost || noCp) {
    drawTextShadow(state.perks[p.id] ? 'ALREADY OWNED' : noCp ? 'NOT REACHED YET' : 'NOT ENOUGH POINTS', cx, p.id === 'checkpoint' ? 150 : 144, 1, COLORS.red, 'center');
    button('OK', cx, 175, 90, 1, closePerk, COLORS.ice, 1);
  } else {
    button('BUY', cx, 165, 100, 1, () => { buyPerk(p); closePerk(); }, COLORS.hatGreen, 1);
    button('CANCEL', cx, 165 + h + 8, 100, 1, closePerk, COLORS.shadow, 1);
  }
}
function drawPaused() {
  dim();
  drawTextShadow('PAUSED', CONFIG.W / 2, 80, 3, COLORS.snow, 'center');
  const h = btnH();
  button('RESUME', CONFIG.W / 2, 140, 110, 1, () => setMode('playing'));
  button('QUIT', CONFIG.W / 2, 140 + h + 10, 110, 1, () => { if (!state.story && !state.last) recordBest(state.wave); awardXp(state.score); resetGame(); state.story = null; setMode('title'); });   // quitting still banks the score
}

function drawGameOver() {
  dim();
  drawTextShadow('GAME OVER', CONFIG.W / 2, 50, 3, COLORS.snow, 'center');
  drawTextShadow('SCORE: ' + state.score, CONFIG.W / 2, 92, 2, COLORS.snow, 'center');
  drawTextShadow('BEST WAVE: ' + bestNow(), CONFIG.W / 2, 112, 2, COLORS.snow, 'center');
  if (state.newBest) drawTextShadow('NEW BEST!', CONFIG.W / 2, 136, 2, COLORS.gold, 'center');
  if (state.lastXp > 0) drawText5('+' + state.lastXp + ' TO YOUR LEVEL BAR', CONFIG.W / 2, 160, 1, COLORS.snow, 'center', COLORS.night);
  if (net.role === 'guest') drawTextShadow('WAITING FOR HOST...', CONFIG.W / 2, 184, 1, COLORS.snow, 'center');
  else if (state.story) {
    button('RETRY', CONFIG.W / 2, 190, 150, 1.3, () => storyStart(state.story, state.story.level));
    button('MENU', CONFIG.W / 2, 190 + Math.ceil(btnH() * 1.3) + 10, 100, 1, () => { const m = storyMenu(state.story); resetGame(); state.story = null; setMode(m); }, COLORS.ice);
  } else if (isCoop()) button('LOBBY', CONFIG.W / 2, 190, 150, 1.3, enterLobby);
  else button('PLAY AGAIN', CONFIG.W / 2, 190, 150, 1.3, state.last ? startLastBattle : startGame);
  if (isCoop()) button('MENU', CONFIG.W / 2, 190 + Math.ceil(btnH() * 1.3) + 10, 100, 1, leaveCoop, COLORS.ice);
}

// Top-down cast shadow: the fort and kid silhouettes, offset away from the light (upper left)
function drawShadow() {
  const ox = CONFIG.shadowOffX, oy = CONFIG.shadowOffY;
  ctx.globalAlpha = CONFIG.shadowAlpha;
  if (!state.runner && !state.home && state.mode !== 'runnerlevels' && state.mode !== 'homelevels') ctx.drawImage(fortShadow, ox, oy);
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
  for (let x = 0; x < (state.home ? CONFIG.W * 2 : CONFIG.W); x += 6) {
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

// The Home level select shows the real house with the boy standing on its floor in front of the door
function homeFresh() {
  state.wins = [60, 300].map(x => ({ x, hp: CONFIG.homeWinHp }));
  state.door = { x: CONFIG.W, open: false }; state.perks = {};
}
const homeBoyY = () => homeWallY() + 29;   // top-left y of the boy standing on the house floor

function draw() {
  const hv = state.mode === 'homelevels';
  if (hv) { homeFresh(); state.home = true; state.px = CONFIG.W; state.py = homeWallY() + 36; }
  drawFrame();
  if (hv) state.home = false;
}

// Last Battle camera: follows the boy up the map with him mid-screen; nearer the Castle it eases over to a view with the boy low on the screen (like the Fort levels) and the Castle above him
function lbCamY(py) {
  const t = Math.max(0, Math.min(1, (CONFIG.lastTop + 300 - py) / 150));
  return Math.min(0, (py - view.h / 2) * (1 - t) + (py - (view.h - 80)) * t);
}
const castleOnScreen = owner => lbCamY(pl(owner).py) < CONFIG.lastTop - 20;   // only counts while the shooter can see the Castle

function drawFrame() {
  state.buttons = [];
  if (state.mode === 'splash') { drawSplash(); return; }
  if (logoEl && logoEl.parentNode) logoEl.remove();
  if (state.mode === 'runpan') { drawRunPan(); return; }
  if (state.mode === 'battle') { drawBattle(); return; }
  if (state.mode === 'castlewin' && state.cwT >= END_T.black) { drawEnding(); return; }
  const cut = state.mode === 'cutscene';
  const shaking = cut && state.cut.t > CUT.shake && state.cut.t < CUT.shake + 1.2;
  if (shaking) { ctx.save(); ctx.translate(Math.round((Math.random() - 0.5) * 6), Math.round((Math.random() - 0.5) * 6)); }
  ctx.clearRect(-8, -8, CONFIG.W + 16, view.h + 16);
  state.camX = state.home ? Math.max(0, Math.min(CONFIG.W, state.px - CONFIG.W / 2)) : 0;
  state.camY = state.last ? lbCamY(state.py) : 0;   // Last Battle: the camera follows the boy up the map, keeping him mid-screen
  if (state.home) {
    ctx.save(); ctx.translate(-Math.round(state.camX), -Math.round(state.camY));
    for (let y = Math.floor(state.camY / bg.height) * bg.height; y < state.camY + view.h; y += bg.height) { ctx.drawImage(bg, 0, y); ctx.drawImage(bg, CONFIG.W, y); }
    ctx.restore();
  }
  else ctx.drawImage(bg, 0, 0);
  drawFlakes();
  if (cut) { drawCutscene(); if (shaking) ctx.restore(); drawCelebration(); return; }
  if (state.home) { ctx.save(); ctx.translate(-Math.round(state.camX), -Math.round(state.camY)); }
  drawShadow();
  drawPrints();
  drawHome();
  if (state.last) { drawCastle(); if (state.lbWave < LB_WAVES) drawLastBarrier(); }
  drawTreesAndBullies();
  drawPower();
  drawAvalanche();
  const away = state.mode === 'runnerlevels';   // the fort and boy are left behind on the Runner screen
  if (!state.runner && !state.home && !away) drawFort();
  if (!away) for (const sl of slots()) drawKid(sl);
  for (const sl of slots()) drawArm(sl);
  for (const sl of slots()) drawCooldownRing(sl);
  for (const sl of slots()) drawAimLine(sl);
  for (const s of state.snowballs) drawSnowball(s);
  for (const e of state.enemyBalls) drawEnemyBall(e);
  drawParticles();
  if (state.home) ctx.restore();
  drawStick();
  drawWinAlerts();
  if (state.mode === 'title') { drawLevelUi(); withInset(drawTitle); }
  else if (state.mode === 'runnerlevels') { withInset(drawRunnerLevels); drawPageBoy(1); }
  else if (state.mode === 'homelevels') { withInset(drawHomeLevels); drawPageBoy(2); }
  else if (state.mode === 'levels') { withInset(drawLevels); drawPageBoy(0); }
  else if (state.mode === 'wavesmenu') withInset(drawWavesMenu);
  else if (state.mode === 'wavetype') withInset(drawWaveType);
  else if (state.mode === 'battlemenu') withInset(drawBattleMenu);
  else if (state.mode === 'coopmenu') withInset(drawCoopMenu);
  else if (state.mode === 'coophost') withInset(drawCoopHost);
  else if (state.mode === 'coopjoin') withInset(drawCoopJoin);
  else if (state.mode === 'cooplobby') withInset(drawCoopLobby);
  else {
    withInset(drawHud);
    drawBanner();
    drawPopup();
    if (state.mode === 'paused') drawPaused();
    else if (state.mode === 'perkconfirm' || (state.ask && state.mode === 'playing')) drawPerkConfirm();
    else if (state.mode === 'gameover') drawGameOver();
    else if (state.mode === 'levelwin') drawLevelWin();
    else if (state.mode === 'castlewin') drawCastleWin();
  }
  drawCelebration();
  if (isCoop() && net.lost && (state.mode === 'playing' || state.mode === 'gameover')) drawLost();
  if (updateReady && state.mode !== 'playing') drawUpdateBanner();
}

// Title-screen background: one enemy at a time walks down, the boy snowballs it, then the next one comes
let demoGap = 0.6, demoFireY = 40;
function updateMenuDemo(dt) {
  if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - dt);
  if (state.swing > 0) state.swing = Math.max(0, state.swing - dt);
  updateBullies(dt);
  updateParticles(dt);
  updatePrints(dt);
  const sbs = state.snowballs;
  for (let i = sbs.length - 1; i >= 0; i--) {
    const s = sbs[i], px = s.x, py = s.y;
    s.x += s.vx * dt; s.y += s.vy * dt;
    const bh = firstBullyHit(px, py, s.x, s.y), th = firstTreeHit(px, py, s.x, s.y);
    if (bh && (!th || bh.t <= th.t)) { bh.b.state = 'falling'; bh.b.t = 0; puff(bh.b.x, bh.b.y); sbs.splice(i, 1); }
    else if (th) { puff(th.x, th.y); sbs.splice(i, 1); }
    else if (s.y < -8 || s.x < -8 || s.x > CONFIG.W + 8) sbs.splice(i, 1);
  }
  if (state.bullies.length === 0) {
    if ((demoGap -= dt) > 0) return;
    const w = state.wave, y = state.yetiLeft;
    state.wave = 3; state.yetiLeft = 0; spawnBully(); state.wave = w; state.yetiLeft = y;
    state.popup = null;
    demoGap = 0.6 + Math.random() * 0.9;
    demoFireY = rand(30, CONFIG.turnY - 20);
    return;
  }
  const b = state.bullies.find(e => e.state === 'walking');
  if (!b) return;
  if (b.y > CONFIG.turnY + 20) { b.state = 'falling'; b.t = 0; puff(b.x, b.y); return; }   // a tree blocked the shots: just flop
  if (b.y < demoFireY || state.cooldown > 0 || sbs.length) return;
  const h = handPos(0), d = Math.hypot(b.x - h.x, b.y - h.y), tt = d / CONFIG.snowballSpeed;
  const tx = b.x + b.vx * tt, ty = b.y + b.vy * tt;
  const ang = Math.min(CONFIG.maxAngle, Math.max(CONFIG.minAngle, Math.atan2(h.y - ty, tx - h.x) / DEG));
  state.aimAngle = ang;
  const a = ang * DEG;
  sbs.push({ x: h.x, y: h.y, owner: 0, auto: false, vx: Math.cos(a) * CONFIG.snowballSpeed, vy: -Math.sin(a) * CONFIG.snowballSpeed });
  state.cooldown = CONFIG.throwCooldown; state.swing = CONFIG.armSwingTime;
}

// ---------- Loop ----------
// ---------- Battle: last-player-standing in the woods (12 players, shrinking circle) ----------
// Solo: you + 11 bots. Co-op: two humans (one team) + 10 bots. The host (or solo) device runs the world; the guest sends its position and throws.
const BT = {
  S: 1000, hp: 5, speed: 62, botSpeed: 52, spdMul: 1.6, spdTime: 6, gunTime: 5, gunGap: 0.15, gunDmg: 0.4,
  cd: 0.5, botCd: 1.4, ballSpeed: 220, ballLife: 0.7, hitR: 6, trees: 200, grass: 30, walls: 70, flakes: 14,
  radii: [520, 360, 230, 130, 10], shrinkEvery: 30, shrinkTime: 12, stormDmg: [0.5, 0.8, 1.2, 1.8, 3], matchTime: 120,
  perks: ['health', 'gun', 'speed'],
};
const BT_NAME = { health: 'HEALTH', gun: 'MACHINE GUN', speed: 'SPEED BOOST' };
const BT_COLS = [
  { hat: COLORS.red, scarf: COLORS.snow, coat: COLORS.red }, { hat: COLORS.hatGreen, scarf: COLORS.gold, coat: '#2f8a3e' },
  { hat: COLORS.pink, scarf: COLORS.coatBlue, coat: '#d65a97' }, { hat: COLORS.orange, scarf: COLORS.night, coat: '#d97b1a' },
  { hat: '#7a4fd1', scarf: COLORS.ice, coat: '#6a3fc0' }, { hat: COLORS.night, scarf: COLORS.red, coat: '#2c3e66' },
  { hat: COLORS.blonde, scarf: COLORS.red, coat: '#b89a3a' }, { hat: '#2bb5a5', scarf: COLORS.snow, coat: '#1f8f82' },
  { hat: COLORS.brown, scarf: COLORS.orange, coat: '#6b4423' }, { hat: '#888', scarf: COLORS.gold, coat: '#666' },
];
function btRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const btCanAct = () => { const bt = state.battle; return !!bt && !bt.over && !bt.paused && bt.players[bt.me].alive; };
const btWins = bt => (bt.coop ? state.bCoopWins : state.bWins);

function btNew(seed, coop, me) {
  const R = btRng(seed), S = BT.S;
  const bt = { seed, coop, me, t: 0, over: 0, endT: 0, paused: false, acc: 0, trees: [], walls: [], grass: [], flakes: [], balls: [], circles: [{ x: S / 2, y: S / 2, r: BT.radii[0] }], players: [], popup: null };
  for (let i = 0; i < BT.trees; i++) bt.trees.push({ x: 12 + R() * (S - 28), y: 12 + R() * (S - 34) });
  for (let i = 0; i < BT.grass; i++) bt.grass.push({ x: 40 + R() * (S - 80), y: 40 + R() * (S - 80), rx: 22 + R() * 16, ry: 15 + R() * 11 });
  for (let i = 0; i < BT.walls; i++) {                               // snow walls: cover from snowballs
    const hor = R() < 0.5, l = 28 + R() * 24;
    bt.walls.push({ x: 12 + R() * (S - 70), y: 12 + R() * (S - 70), w: hor ? l : 8, h: hor ? 8 : l });
  }
  for (let i = 0; i < BT.flakes; i++) bt.flakes.push({ x: 20 + R() * (S - 40), y: 20 + R() * (S - 40), on: true });
  let cx = S / 2, cy = S / 2;
  for (let k = 1; k < BT.radii.length; k++) {                       // each circle sits inside the one before it
    const a = R() * 6.283, d = Math.sqrt(R()) * (BT.radii[k - 1] - BT.radii[k]) * 0.85;
    cx += Math.cos(a) * d; cy += Math.sin(a) * d;
    bt.circles.push({ x: cx, y: cy, r: BT.radii[k] });
  }
  const humans = coop ? 2 : 1, spawns = [];
  for (let i = 0; i < 12; i++) {
    let x = S / 2, y = S / 2;
    for (let n = 0; n < 60; n++) {
      const a = R() * 6.283, d = Math.sqrt(R()) * 460; x = S / 2 + Math.cos(a) * d; y = S / 2 + Math.sin(a) * d;
      if (spawns.every(q => Math.hypot(q.x - x, q.y - y) > 85) && bt.trees.every(T => Math.hypot(T.x + 4 - x, T.y + 11 - y) > 14) && !bt.walls.some(w => x > w.x - 8 && x < w.x + w.w + 8 && y > w.y - 8 && y < w.y + w.h + 8)) break;
    }
    spawns.push({ x, y });
    bt.players.push({
      i, human: i < humans, team: i < humans ? 0 : 10 + i, x, y, tx: x, ty: y, vx: 0, vy: 0, hp: BT.hp, alive: true, kills: 0, ang: 1.57,
      cd: 0, gunT: 0, spdT: 0, gunCd: 0, reveal: 0, hurt: 0, walkT: 0, swing: 0, place: 0, perks: { health: 0, gun: 0, speed: 0 },
      col: i < humans ? KID_COLORS[i] : BT_COLS[i % BT_COLS.length],
      ai: { tx: x, ty: y, wait: 0, think: Math.random() * 0.3, tgt: -1, strafe: 1, sw: 1 },
    });
    if (i >= humans) bt.players[i].cd = 1.5 + Math.random() * 1.5;
  }
  bt.grassImg = btGrassImg(bt);
  return bt;
}

function btSetup(seed, coop, me) {
  state.battle = btNew(seed, coop, me);
  state.mode = 'battle';
  state.particles = []; state.confetti = []; state.snowballs = []; state.stick = null;
  state.runner = state.home = state.last = false; state.story = null;
  endAim();
}
function startBattle() {
  const coop = isCoop(), seed = (Math.random() * 4e9) >>> 0;
  btSetup(seed, coop, 0);
  if (coop) netSend({ k: 'bstart', seed });
}

let btGroundImg = null;
function btGround() {
  if (btGroundImg) return btGroundImg;
  const c = document.createElement('canvas'); c.width = c.height = BT.S;
  const g = c.getContext('2d'), R = btRng(99);
  g.fillStyle = COLORS.snow; g.fillRect(0, 0, BT.S, BT.S);
  g.fillStyle = COLORS.ice;
  for (let i = 0; i < 2200; i++) g.fillRect(Math.floor(R() * (BT.S - 3)), Math.floor(R() * BT.S), 2 + Math.floor(R() * 2), 1);
  g.fillStyle = COLORS.shadow;
  g.fillRect(0, 0, BT.S, 3); g.fillRect(0, BT.S - 3, BT.S, 3); g.fillRect(0, 0, 3, BT.S); g.fillRect(BT.S - 3, 0, 3, BT.S);
  return (btGroundImg = c);
}
function btGrassImg(bt) {
  const c = document.createElement('canvas'); c.width = c.height = BT.S;
  const g = c.getContext('2d'), R = btRng(bt.seed + 7);
  for (const P of bt.grass) {
    g.fillStyle = 'rgba(46,125,60,0.35)';
    for (let y = -P.ry; y <= P.ry; y++) { const w = P.rx * Math.sqrt(1 - (y / P.ry) ** 2); g.fillRect(Math.round(P.x - w), Math.round(P.y + y), Math.round(2 * w), 1); }
    for (let y = -P.ry; y <= P.ry; y += 2) for (let x = -P.rx; x <= P.rx; x += 3) {
      const nx = x / P.rx, ny = y / P.ry;
      if (nx * nx + ny * ny > 1 || R() < 0.12) continue;
      const bx = Math.round(P.x + x + R() * 2), by = Math.round(P.y + y + R() * 2);
      g.fillStyle = '#2d7a3a'; g.fillRect(bx - 1, by - 3, 1, 4); g.fillRect(bx + 1, by - 2, 1, 3);
      g.fillStyle = COLORS.hatGreen; g.fillRect(bx, by - 5, 1, 6);
      g.fillStyle = '#7fd48a'; g.fillRect(bx, by - 5, 1, 1);
    }
  }
  return c;
}
const btInGrass = (bt, p) => bt.grass.some(P => ((p.x - P.x) / P.rx) ** 2 + ((p.y + 4 - P.y) / P.ry) ** 2 < 0.8);

// The safe circle at time t: holds, then every 30 s shrinks to the next one over 12 s
function btZone(bt, t) {
  const C = bt.circles, k = Math.min(4, Math.floor(t / BT.shrinkEvery));
  if (k < 1) return C[0];
  const f = Math.min(1, (t - BT.shrinkEvery * k) / BT.shrinkTime), a = C[k - 1], b = C[k];
  if (t > BT.matchTime + BT.shrinkTime) return { x: b.x, y: b.y, r: Math.max(0, b.r * (1 - (t - BT.matchTime - BT.shrinkTime) / 18)) };   // overtime: the last circle vanishes
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, r: a.r + (b.r - a.r) * f };
}
function btNext(bt, t) {
  const k = Math.floor(t / BT.shrinkEvery), sh = k >= 1 && k <= 4 && t - BT.shrinkEvery * k < BT.shrinkTime;
  return bt.circles[Math.min(4, sh ? k : k + 1)];
}
const btShrinking = (bt, t) => t >= BT.shrinkEvery && t < BT.matchTime + BT.shrinkTime && t % BT.shrinkEvery < BT.shrinkTime;

function btStep(bt, p, dx, dy, dt, sp) {
  let x = Math.max(6, Math.min(BT.S - 6, p.x + dx * sp * dt)), y = Math.max(8, Math.min(BT.S - 6, p.y + dy * sp * dt));
  for (const T of bt.trees) {
    const ox = T.x + 4, oy = T.y + 11, ex = x - ox, ey = y - oy, d = Math.hypot(ex, ey);
    if (d < 7 && d > 0) { x = ox + ex / d * 7; y = oy + ey / d * 7; }
  }
  for (const w of bt.walls) {
    const qx = Math.max(w.x, Math.min(w.x + w.w, x)), qy = Math.max(w.y, Math.min(w.y + w.h, y)), ex = x - qx, ey = y - qy, d = Math.hypot(ex, ey);
    if (d < 5) { if (d > 0) { x = qx + ex / d * 5; y = qy + ey / d * 5; } else y = w.y - 5; }
  }
  if (Math.abs(x - p.x) + Math.abs(y - p.y) > 0.01) p.walkT = 0.15;
  p.vx = (x - p.x) / dt; p.vy = (y - p.y) / dt;
  p.x = x; p.y = y;
}
function btTick(p, dt) {
  for (const k of ['cd', 'gunT', 'spdT', 'gunCd', 'reveal', 'hurt', 'walkT', 'swing']) if (p[k] > 0) p[k] = Math.max(0, p[k] - dt);
}
const btNearMe = (bt, p) => { const m = bt.players[bt.me]; return Math.hypot(m.x - p.x, m.y - p.y) < 170; };

function btFire(bt, p, ang, auto) {
  const c = Math.cos(ang), s = Math.sin(ang);
  bt.balls.push({ x: p.x + c * 6, y: p.y - 1 + s * 6, vx: c * BT.ballSpeed, vy: s * BT.ballSpeed, o: p.i, life: BT.ballLife, d: auto ? BT.gunDmg : 1 });
  p.ang = ang; p.swing = CONFIG.armSwingTime; p.reveal = 1.2;
  if (!auto) p.cd = p.human ? BT.cd : BT.botCd * (0.8 + Math.random() * 0.5);
  if (btNearMe(bt, p)) sfx('throw', true);
}
function btUse(bt, p, id) {
  if (!p.alive || !(p.perks[id] > 0)) return;
  if (id === 'health') { if (p.hp >= BT.hp) return; p.hp = Math.min(BT.hp, p.hp + 2); }
  else if (id === 'gun') p.gunT = BT.gunTime;
  else p.spdT = BT.spdTime;
  p.perks[id]--;
  if (p.i === bt.me) sfx('power', true);
}
function btUseMine(id) {
  const bt = state.battle;
  if (!btCanAct()) return;
  if (net.role === 'guest') netSend({ k: 'bu', id }); else btUse(bt, bt.players[bt.me], id);
}

function btKill(bt, q, owner) {
  q.place = bt.players.filter(p => p.alive).length;
  q.alive = false; q.hp = 0;
  if (owner >= 0 && owner !== q.i) bt.players[owner].kills++;
  for (let i = 0; i < 3; i++) puff(q.x, q.y);
  if (q.i === bt.me) sfx('over', true); else if (btNearMe(bt, q)) sfx('hit', true);
}
function btHurt(bt, q, d, owner) {
  q.hp -= d; q.hurt = 0.3; q.reveal = Math.max(q.reveal, 0.8);
  puff(q.x, q.y);
  if (q.i === bt.me) sfx('hurt', true); else if (btNearMe(bt, q)) sfx('hit', true);
  if (q.hp <= 0.001) btKill(bt, q, owner);
}
function btSegDist(ax, ay, bx, by, px, py) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(ax + dx * t - px, ay + dy * t - py);
}
function btBalls(bt, dt, hits) {
  for (let i = bt.balls.length - 1; i >= 0; i--) {
    const b = bt.balls[i], px = b.x, py = b.y;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    let dead = b.life <= 0 || b.x < 0 || b.y < 0 || b.x > BT.S || b.y > BT.S;
    if (!dead && hits) {
      for (const T of bt.trees) if (Math.hypot(b.x - T.x - 4, b.y - T.y - 9) < 6) { dead = true; puff(b.x, b.y); break; }
      if (!dead) for (const w of bt.walls) if (b.x > w.x - 1 && b.x < w.x + w.w + 1 && b.y > w.y - 1 && b.y < w.y + w.h + 1) { dead = true; puff(b.x, b.y); break; }
      if (!dead) for (const q of bt.players) {
        if (!q.alive || q.team === bt.players[b.o].team) continue;
        if (btSegDist(px, py, b.x, b.y, q.x, q.y) < BT.hitR) { btHurt(bt, q, b.d, b.o); dead = true; break; }
      }
    }
    if (dead) bt.balls.splice(i, 1);
  }
}
function btBlocked(bt, ax, ay, bx, by) {
  const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 10);
  for (let i = 1; i < n; i++) {
    const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
    if (bt.trees.some(T => Math.abs(T.x + 4 - x) < 6 && Math.abs(T.y + 9 - y) < 6) || bt.walls.some(w => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h)) return true;
  }
  return false;
}
function btPickup(bt, p) {
  for (const f of bt.flakes) {
    if (!f.on || (f.x - p.x) ** 2 + (f.y - p.y) ** 2 > 81) continue;
    f.on = false;
    const id = BT.perks[Math.floor(Math.random() * 3)];
    p.perks[id]++;
    if (p.i === bt.me) { bt.popup = { text: BT_NAME[id], t: 1.4 }; sfx('power', true); }
  }
}

function btTarget(bt, p) {
  let best = -1, bd = 140;
  for (const q of bt.players) {
    if (!q.alive || q.team === p.team) continue;
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < bd && (d < 28 || q.reveal > 0 || !btInGrass(bt, q))) { bd = d; best = q.i; }
  }
  return best;
}
function btBot(bt, p, dt, z) {
  const A = p.ai, P = bt.players;
  if (p.hp <= 2 && p.perks.health > 0) btUse(bt, p, 'health');
  A.think -= dt; A.sw -= dt;
  if (A.think <= 0) { A.think = 0.25; A.tgt = btTarget(bt, p); }
  if (A.sw <= 0) { A.sw = 1 + Math.random() * 1.5; A.strafe = -A.strafe; }
  const tg = A.tgt >= 0 && P[A.tgt].alive ? P[A.tgt] : null;
  const ph = bt.t % BT.shrinkEvery, dest = (bt.t < BT.matchTime && ph > 20) || btShrinking(bt, bt.t) ? btNext(bt, bt.t) : z;
  const outside = Math.hypot(p.x - z.x, p.y - z.y) > z.r - 6;
  let mx = 0, my = 0;
  if (outside || Math.hypot(p.x - dest.x, p.y - dest.y) > dest.r - 14) {
    mx = dest.x - p.x; my = dest.y - p.y;
    if (outside && p.perks.speed > 0 && p.spdT <= 0) btUse(bt, p, 'speed');
  } else if (tg) {
    const dx = tg.x - p.x, dy = tg.y - p.y, d = Math.hypot(dx, dy) || 1;
    if (d > 95) { mx = dx; my = dy; } else if (d < 45) { mx = -dx; my = -dy; } else { mx = -dy * A.strafe; my = dx * A.strafe; }
  } else {
    let f = null, fd = 140;
    for (const q of bt.flakes) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (q.on && d < fd) { fd = d; f = q; } }
    if (f) { mx = f.x - p.x; my = f.y - p.y; }
    else {
      A.wait -= dt;
      if (A.wait <= 0 || Math.hypot(A.tx - p.x, A.ty - p.y) < 8) {
        const a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * dest.r * 0.8;
        A.tx = dest.x + Math.cos(a) * rr; A.ty = dest.y + Math.sin(a) * rr; A.wait = 4 + Math.random() * 4;
      }
      mx = A.tx - p.x; my = A.ty - p.y;
    }
  }
  const m = Math.hypot(mx, my);
  if (m > 1) btStep(bt, p, mx / m, my / m, dt, BT.botSpeed * (p.spdT > 0 ? BT.spdMul : 1)); else p.vx = p.vy = 0;
  if (tg) {
    const d = Math.hypot(tg.x - p.x, tg.y - p.y);
    if (p.gunT <= 0 && p.perks.gun > 0 && d < 120) btUse(bt, p, 'gun');
    if (d < 150 && !btBlocked(bt, p.x, p.y, tg.x, tg.y)) {
      const lt = d / BT.ballSpeed * 0.8, ang = Math.atan2(tg.y + tg.vy * lt - p.y, tg.x + tg.vx * lt - p.x) + (Math.random() - 0.5) * 0.55;
      p.ang = ang;
      if (p.gunT > 0) { if (p.gunCd <= 0) { p.gunCd = BT.gunGap * 1.6; btFire(bt, p, ang, true); } }
      else if (p.cd <= 0) btFire(bt, p, ang, false);
    }
  }
}

// The local human: joystick moves, the aim drag throws (machine gun fires while aiming)
function btMeFire(bt, p, auto) {
  const ang = -state.aimAngle * DEG;
  if (net.role === 'guest') {
    netSend({ k: 'bt', a: Math.round(ang * 100) / 100, x: r1(p.x), y: r1(p.y), g: auto ? 1 : 0 });
    p.ang = ang; p.swing = CONFIG.armSwingTime; if (!auto) p.cd = BT.cd;
    sfx('throw', true);
  } else btFire(bt, p, ang, auto);
}
function btUpdateMe(bt, p, dt) {
  const st = state.stick;
  if (st) { const m = Math.hypot(st.dx, st.dy), k = m > 1 ? 1 / m : 1; btStep(bt, p, st.dx * k, st.dy * k, dt, BT.speed * (p.spdT > 0 ? BT.spdMul : 1)); }
  else p.vx = p.vy = 0;
  if (state.aiming && state.aimValid) {
    p.ang = -state.aimAngle * DEG;
    if (p.gunT > 0 && p.gunCd <= 0) { p.gunCd = BT.gunGap; btMeFire(bt, p, true); }
  }
}
function btRelease() {
  const bt = state.battle, p = bt.players[bt.me];
  if (btCanAct() && state.aimValid && p.cd <= 0 && p.gunT <= 0) btMeFire(bt, p, false);
}

function btCheckEnd(bt) {
  const alive = bt.players.filter(p => p.alive);
  if (!alive.some(p => p.human)) btFinish(bt, 2);
  else if (new Set(alive.map(p => p.team)).size <= 1) { for (const p of alive) p.place = 1; btFinish(bt, 1); }
}
function btFinish(bt, over) {
  bt.over = over; bt.endT = 0; state.stick = null; endAim();
  const me = bt.players[bt.me];
  if (over === 1) {
    if (bt.coop) { state.bCoopWins++; saveBest(state.bCoopWins, CONFIG.battleCoopKey); } else { state.bWins++; saveBest(state.bWins, CONFIG.battleKey); }
    spawnConfetti(); sfx('fanfare', true);
  } else sfx('over', true);
  awardXp(me.kills * 100 + (over === 1 ? 1000 : 0));
}

function btUpdate(dt) {
  const bt = state.battle;
  updateParticles(dt);
  if (bt.paused) return;
  if (bt.popup && (bt.popup.t -= dt) <= 0) bt.popup = null;
  if (bt.over) { bt.endT += dt; btBalls(bt, dt, false); return; }
  bt.t += dt;
  const z = btZone(bt, bt.t), dmg = BT.stormDmg[Math.min(4, Math.floor(bt.t / BT.shrinkEvery))];
  for (const p of bt.players) {
    if (!p.alive) continue;
    btTick(p, dt);
    if (p.i === bt.me) btUpdateMe(bt, p, dt);
    else if (!p.human) btBot(bt, p, dt, z);
    btPickup(bt, p);
    if (p.alive && Math.hypot(p.x - z.x, p.y - z.y) > z.r) { p.hp -= dmg * dt; p.hurt = 0.1; if (p.hp <= 0.001) btKill(bt, p, -1); }
  }
  btBalls(bt, dt, true);
  btCheckEnd(bt);
}
function btUpdateGuest(dt) {
  const bt = state.battle, me = bt.players[bt.me];
  updateParticles(dt);
  if (bt.popup && (bt.popup.t -= dt) <= 0) bt.popup = null;
  if (bt.over) bt.endT += dt; else bt.t += dt;
  for (const p of bt.players) {
    btTick(p, dt);
    if (p.i !== bt.me) { const k = Math.min(1, dt * 15); p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; }
  }
  if (!bt.over && me.alive) {
    btUpdateMe(bt, me, dt);
    bt.acc += dt;
    if (bt.acc >= 0.05) { bt.acc = 0; netSend({ k: 'bm', x: r1(me.x), y: r1(me.y), a: Math.round(me.ang * 100) / 100 }); }
  }
  for (const b of bt.balls) { b.x += b.vx * dt; b.y += b.vy * dt; }
}
function btFrame(dt) {
  if (!state.battle) return;
  if (net.role === 'guest') btUpdateGuest(dt); else btUpdate(dt);
}

// ---- Co-op networking ----
function btSnapshot() {
  const bt = state.battle, ev = net.evq; net.evq = [];
  return {
    k: 'B', t: r1(bt.t), o: bt.over,
    p: bt.players.map(p => {
      const a = [r1(p.x), r1(p.y), r1(p.hp), p.alive ? 1 : 0, p.kills, Math.round(p.ang * 100) / 100, r1(p.gunT), r1(p.spdT), p.reveal > 0 ? 1 : 0, p.place];
      if (p.human) a.push(p.perks.health, p.perks.gun, p.perks.speed);
      return a;
    }),
    b: bt.balls.map(b => [r1(b.x), r1(b.y), r1(b.vx), r1(b.vy), b.o]),
    f: bt.flakes.map(f => (f.on ? 1 : 0)).join(''), ev,
  };
}
function btHostOnData(d) {                       // guest -> host: 'bm' position/aim, 'bt' throw, 'bu' use a perk
  const bt = state.battle, p = bt.players[1];
  if (!p || bt.over || !p.alive) return;
  if (d.k === 'bu' && typeof d.id === 'string' && BT.perks.includes(d.id)) { btUse(bt, p, d.id); return; }
  if ((d.k === 'bm' || d.k === 'bt') && Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.a)) {
    const x = Math.max(6, Math.min(BT.S - 6, d.x)), y = Math.max(8, Math.min(BT.S - 6, d.y));
    if (Math.hypot(x - p.x, y - p.y) > 0.05) p.walkT = 0.15;
    p.x = x; p.y = y; p.ang = d.a;
    if (d.k === 'bt') {
      if (d.g ? p.gunT > 0 && p.gunCd <= 0.05 : p.cd <= 0.15 && p.gunT <= 0) { if (d.g) p.gunCd = BT.gunGap; btFire(bt, p, d.a, !!d.g); }
    }
  }
}
function btGuestOnData(d) {
  if (d.k === 'bstart') { if (net.role === 'guest' && Number.isFinite(d.seed)) btSetup(d.seed >>> 0, true, 1); return; }
  const bt = state.battle;
  if (d.k !== 'B' || !bt || !Array.isArray(d.p)) return;
  bt.t = d.t;
  d.p.forEach((a, i) => {
    const p = bt.players[i];
    if (!p) return;
    if (i === bt.me) { if (a[2] < p.hp - 0.05) { p.hurt = 0.3; sfx('hurt', true); } }
    else {
      if (a[2] < p.hp - 0.05) p.hurt = 0.3;
      if (Math.hypot(a[0] - p.tx, a[1] - p.ty) > 0.05) p.walkT = 0.15;
      p.tx = a[0]; p.ty = a[1]; p.ang = a[5];
      if (Math.hypot(a[0] - p.x, a[1] - p.y) > 60) { p.x = a[0]; p.y = a[1]; }
    }
    p.hp = a[2]; p.alive = !!a[3]; p.kills = a[4]; p.gunT = a[6]; p.spdT = a[7]; p.reveal = a[8]; p.place = a[9];
    if (a.length > 10) {
      if (i === bt.me) for (const [n, id] of BT.perks.entries()) if (a[10 + n] > p.perks[id]) { bt.popup = { text: BT_NAME[id], t: 1.4 }; sfx('power', true); }
      p.perks = { health: a[10], gun: a[11], speed: a[12] };
    }
  });
  bt.balls = d.b.map(a => ({ x: a[0], y: a[1], vx: a[2], vy: a[3], o: a[4], life: 1, d: 1 }));
  bt.flakes.forEach((f, i) => { f.on = d.f[i] === '1'; });
  for (const e of d.ev || []) if (e.e === 'p') puff(e.x, e.y);
  if (d.o && !bt.over) btFinish(bt, d.o);
}

// ---- Drawing ----
function btDrawKid(bt, p, alpha) {
  const x = Math.round(p.x) - 4, y = Math.round(p.y) - 7 - (p.hurt > 0 ? Math.round(Math.sin((1 - Math.min(1, p.hurt / 0.3)) * Math.PI) * 3) : 0);
  ctx.globalAlpha = alpha;
  drawKidAt(x, y, p.col, 0, p.walkT > 0 ? 1 + (Math.floor(performance.now() / 120) % 2) : 0);
  if (p.hurt > 0) { ctx.globalAlpha = 0.45 * alpha; rect(COLORS.red, x, y + 1, 8, 14); ctx.globalAlpha = alpha; }
  const a = p.ang, reach = p.swing > 0 ? 8 : 6;
  rect(p.col.coat, Math.round(p.x + Math.cos(a) * 3.5) - 1, Math.round(p.y - 1 + Math.sin(a) * 3.5) - 1, 2, 2);
  rect(COLORS.skin, Math.round(p.x + Math.cos(a) * reach) - 1, Math.round(p.y - 1 + Math.sin(a) * reach) - 1, 2, 2);
  rect(COLORS.night, x - 1, y - 5, 10, 3);
  const f = Math.max(0, p.hp / BT.hp);
  rect(f > 0.6 ? COLORS.hatGreen : f > 0.3 ? COLORS.gold : COLORS.red, x, y - 4, Math.max(1, Math.round(8 * f)), 1);
  if (p.i === bt.me || (bt.coop && p.human)) { const c = p.i === bt.me ? COLORS.gold : COLORS.ice; rect(c, x + 1, y - 8, 6, 1); rect(c, x + 2, y - 7, 4, 1); rect(c, x + 3, y - 6, 2, 1); }
  ctx.globalAlpha = 1;
}

function btDrawWall(w) {
  const x = Math.round(w.x), y = Math.round(w.y);
  rect(COLORS.night, x - 1, y - 1, w.w + 2, w.h + 4);
  rect(COLORS.shadow, x, y, w.w, w.h + 3);
  rect(COLORS.ice, x, y, w.w, w.h);
  rect(COLORS.snow, x, y, w.w, 2);
}

function btCam(bt) {
  const me = bt.players[bt.me];
  if (me.alive) return me;
  return bt.players.find(p => p.human && p.alive) || me;
}

function drawBattle() {
  const bt = state.battle, W = CONFIG.W, H = view.h;
  state.buttons = [];
  if (!bt) return;
  const cam = btCam(bt), me = bt.players[bt.me];
  ctx.clearRect(-8, -8, W + 16, H + 16);
  rect(COLORS.night, 0, 0, W, H);
  ctx.save();
  ctx.translate(Math.round(W / 2 - cam.x), Math.round(H / 2 - cam.y));
  ctx.drawImage(btGround(), 0, 0);
  const L = cam.x - W / 2 - 16, Rt = cam.x + W / 2 + 16, T = cam.y - H / 2 - 20, B = cam.y + H / 2 + 20;
  for (const f of bt.flakes) if (f.on && f.x > L && f.x < Rt && f.y > T && f.y < B) drawPowerAt(f.x, f.y, bt.t + f.x * 0.05);
  const ents = [];
  for (const t of bt.trees) if (t.x > L && t.x < Rt && t.y > T && t.y < B) ents.push([t.y + 15, null, t]);
  for (const w of bt.walls) if (w.x + w.w > L && w.x < Rt && w.y + w.h > T && w.y < B) ents.push([w.y + w.h, null, w]);
  const late = [];
  for (const p of bt.players) {
    if (!p.alive || p.x < L || p.x > Rt || p.y < T || p.y > B) continue;
    if (btInGrass(bt, p)) { late.push(p); continue; }
    ents.push([p.y + 6, p, p]);
  }
  ents.sort((a, b) => a[0] - b[0]);
  for (const [, k, o] of ents) { if (k) btDrawKid(bt, o, 1); else if (o.w) btDrawWall(o); else ctx.drawImage(treeImg, o.x, o.y); }
  for (const b of bt.balls) drawSnowball(b);
  ctx.drawImage(bt.grassImg, 0, 0);                          // tall grass hides anyone standing in it
  for (const p of late) {
    if (p.i === bt.me) btDrawKid(bt, p, 0.6);
    else if (p.reveal > 0) btDrawKid(bt, p, 0.9);
    else if (bt.coop && p.human) btDrawKid(bt, p, 0.6);
  }
  drawParticles();
  const z = btZone(bt, bt.t);
  ctx.fillStyle = 'rgba(60,110,220,0.32)';                   // the storm outside the circle
  ctx.beginPath(); ctx.rect(cam.x - W, cam.y - H, 2 * W, 2 * H); ctx.arc(z.x, z.y, z.r, 0, 6.2832, true); ctx.fill('evenodd');
  ctx.strokeStyle = COLORS.snow; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 6.2832); ctx.stroke();
  ctx.restore();
  if (me.alive && state.aiming && state.aimValid && !bt.over) {   // dotted throw line from the boy (screen centre)
    const a = -state.aimAngle * DEG;
    for (let i = 0; i < CONFIG.aimDots; i++) { const d = 8 + i * CONFIG.aimDotSpacing; rect(i % 2 ? COLORS.shadow : COLORS.night, W / 2 + Math.cos(a) * d - 1, H / 2 - 1 + Math.sin(a) * d - 1, CONFIG.aimDotSize, CONFIG.aimDotSize); }
  }
  drawStick();
  withInset(() => btHud(bt, me, z));
  if (bt.t < 2.5 && !bt.over) {
    ctx.globalAlpha = Math.min(1, (2.5 - bt.t) / 0.4);
    drawTextShadow('BATTLE', W / 2, 90, 3, COLORS.gold, 'center');
    drawTextShadow('BE THE LAST ONE STANDING', W / 2, 118, 1, COLORS.coatBlue, 'center');
    ctx.globalAlpha = 1;
  }
  if (bt.popup) { ctx.globalAlpha = Math.min(1, bt.popup.t / 0.4); drawTextShadow(bt.popup.text, W / 2, 140, 2, COLORS.coatBlue, 'center'); ctx.globalAlpha = 1; }
  if (bt.paused) btPauseUi(bt);
  else if (bt.over && bt.endT > 1) btEndUi(bt, me);
  drawCelebration();
  if (isCoop() && net.lost) drawLost();
}

function btHud(bt, me, z) {
  const W = CONFIG.W, s = btnH();
  const alive = bt.players.filter(p => p.alive).length, rem = Math.max(0, Math.ceil(BT.matchTime - bt.t));
  ctx.globalAlpha = 0.7;
  rect(COLORS.night, 0, -view.safeTop, W, 11 + view.safeTop);
  ctx.globalAlpha = 1;
  drawText('KILLS ' + me.kills, 3, 3, 1, COLORS.snow);
  drawText(Math.floor(rem / 60) + ':' + String(rem % 60).padStart(2, '0'), W / 2, 3, 1, rem <= 10 ? COLORS.red : COLORS.snow, 'center');
  drawText('ALIVE ' + alive, W - 3, 3, 1, COLORS.snow, 'right');
  // minimap: the map, the storm, this circle (white) and the next one (gold)
  const ms = 44, mx = 3, my = 13, k = ms / BT.S, n = btNext(bt, bt.t);
  ctx.globalAlpha = 0.8; rect(COLORS.night, mx - 1, my - 1, ms + 2, ms + 2); ctx.globalAlpha = 0.9; rect(COLORS.ice, mx, my, ms, ms); ctx.globalAlpha = 1;
  ctx.save(); ctx.beginPath(); ctx.rect(mx, my, ms, ms); ctx.clip();
  ctx.fillStyle = 'rgba(60,110,220,0.5)'; ctx.beginPath(); ctx.rect(mx, my, ms, ms); ctx.arc(mx + z.x * k, my + z.y * k, z.r * k, 0, 6.2832, true); ctx.fill('evenodd');
  ctx.lineWidth = 1; ctx.strokeStyle = COLORS.snow; ctx.beginPath(); ctx.arc(mx + z.x * k, my + z.y * k, z.r * k, 0, 6.2832); ctx.stroke();
  ctx.strokeStyle = COLORS.gold; ctx.beginPath(); ctx.arc(mx + n.x * k, my + n.y * k, n.r * k, 0, 6.2832); ctx.stroke();
  ctx.restore();
  for (const p of bt.players) if (p.alive && p.human) rect(p.i === bt.me ? COLORS.red : COLORS.coatBlue, Math.round(mx + p.x * k) - 1, Math.round(my + p.y * k) - 1, 3, 3);
  for (let i = 0; i < BT.hp; i++) drawFlake(3 + i * 6, my + ms + 4, i < Math.ceil(me.hp - 0.001));
  if (me.gunT > 0) drawTextShadow('GUN ' + Math.ceil(me.gunT), 3, my + ms + 14, 1, COLORS.coatBlue);
  if (me.spdT > 0) drawTextShadow('SPEED ' + Math.ceil(me.spdT), 3, my + ms + 24, 1, COLORS.orange);
  // status line under the top bar
  const outside = me.alive && Math.hypot(me.x - z.x, me.y - z.y) > z.r;
  const next = BT.shrinkEvery * (Math.floor(bt.t / BT.shrinkEvery) + 1) - bt.t;
  if (!bt.over) {
    if (!me.alive) drawTextShadow('YOU ARE OUT - WATCHING', W / 2, 14, 1, COLORS.red, 'center');
    else if (outside) drawTextShadow('GET INSIDE THE CIRCLE!', W / 2, 14, 1, COLORS.red, 'center');
    else if (btShrinking(bt, bt.t)) drawTextShadow('CIRCLE CLOSING', W / 2, 14, 1, COLORS.red, 'center');
    else if (bt.t < BT.matchTime && next <= 10) drawTextShadow('CIRCLE IN ' + Math.ceil(next), W / 2, 14, 1, COLORS.coatBlue, 'center');
  }
  // pause (solo only), mute, and the perks you hold (tap to use)
  const x = W - 3 - s, y = 13, act = btCanAct();
  if (!bt.coop) {
    ctx.globalAlpha = 0.7; rect(COLORS.night, x, y, s, s); ctx.globalAlpha = 1;
    const bw = Math.max(2, Math.round(s / 6)), bh = Math.round(s / 2);
    rect(COLORS.snow, x + Math.round(s / 2) - bw - 1, y + Math.round((s - bh) / 2), bw, bh);
    rect(COLORS.snow, x + Math.round(s / 2) + 1, y + Math.round((s - bh) / 2), bw, bh);
    if (!bt.over && !bt.paused) state.buttons.push({ x, y: y + view.ty, w: s, h: s, onTap: () => { bt.paused = true; endAim(); state.stick = null; } });
  }
  drawMuteButton(bt.coop ? x : x - s - 4, y, !bt.paused);
  const ps = Math.round(s * 0.75), px = W - 3 - ps;
  let py = y + s + 6;
  for (const id of BT.perks) {
    const c = me.perks[id];
    if (!(c > 0)) continue;
    ctx.globalAlpha = 0.5; rect(COLORS.gold, px - 1, py - 1, ps + 2, ps + 2); rect(COLORS.night, px, py, ps, ps);
    perkIcon(id, px + Math.floor(ps / 2), py + Math.floor(ps / 2) - 2, Math.max(1, Math.floor((ps - 4) / 5)));
    ctx.globalAlpha = 1;
    drawText(c, px + ps - 1, py + ps - 6, 1, COLORS.gold, 'right');
    if (act) state.buttons.push({ x: px, y: py + view.ty, w: ps, h: ps, onTap: () => btUseMine(id) });
    py += ps + 4;
  }
}

function btPauseUi(bt) {
  dim();
  drawTextShadow('PAUSED', CONFIG.W / 2, 80, 3, COLORS.snow, 'center');
  const h = btnH();
  button('RESUME', CONFIG.W / 2, 140, 110, 1, () => { bt.paused = false; });
  button('QUIT', CONFIG.W / 2, 140 + h + 10, 110, 1, () => setMode('battlemenu'));
}
function btEndUi(bt, me) {
  const W = CONFIG.W, h = Math.ceil(btnH() * 1.3), guest = net.role === 'guest';
  dim();
  if (bt.over === 1) drawTextShadow('VICTORY!', W / 2, 40, 3, COLORS.gold, 'center');
  else drawTextShadow('ELIMINATED', W / 2, 40, 3, COLORS.snow, 'center');
  drawTextShadow(bt.over === 1 ? 'LAST ONE STANDING' : 'PLACE: ' + (me.place || 12) + ' OF 12', W / 2, 78, 1, COLORS.snow, 'center');
  drawTextShadow('KILLS: ' + me.kills, W / 2, 96, 2, COLORS.snow, 'center');
  drawTextShadow('WINS: ' + btWins(bt), W / 2, 118, 2, COLORS.gold, 'center');
  if (state.lastXp > 0) drawText5('+' + state.lastXp + ' TO YOUR LEVEL BAR', W / 2, 142, 1, COLORS.snow, 'center', COLORS.night);
  if (guest) drawTextShadow('WAITING FOR HOST...', W / 2, 172, 1, COLORS.snow, 'center');
  else button('PLAY AGAIN', W / 2, 180, 150, 1.3, startBattle);
  button('MENU', W / 2, 180 + h + 10, 100, 1, bt.coop ? leaveCoop : () => setMode('battlemenu'), COLORS.ice);
}

function drawBattleMenu() {
  const cx = CONFIG.W / 2, bh = Math.max(btnH(), 32), step = bh + 8, y0 = 76 + Math.ceil(bh / 2);
  drawText5('BATTLE', cx, 50, 3, COLORS.coatBlue, 'center', COLORS.night);
  button('SOLO', cx, y0, 110, bh / btnH(), () => { state.wantBattle = false; startBattle(); }, COLORS.hatGreen, 1, 'WINS: ' + state.bWins);
  button('CO-OP', cx, y0 + step, 110, bh / btnH(), () => { state.wantBattle = true; openCoopMenu(); }, COLORS.ice, 1, 'WINS: ' + state.bCoopWins);
  button('BACK', cx, y0 + 2 * step, 76, 1, () => setMode('title'), COLORS.shadow, 1);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(CONFIG.maxDt, (now - last) / 1000);
  last = now;
  if (net.role === 'guest' && (state.mode === 'playing' || state.mode === 'gameover')) updateGuest(dt);   // the host runs the world
  else if (state.mode === 'playing') update(dt);
  else if (state.mode === 'battle') btFrame(dt);
  else if (state.mode === 'cutscene') { updateFlakes(dt); updateCutscene(dt); }
  else if (state.mode === 'runpan') { updateFlakes(dt); if ((state.pan.t += dt) >= RUN_T + PAN_T) setMode(PAGE_MODES[state.pan.to]); }
  else if (state.mode === 'castlewin') { updateFlakes(dt); updateCastleWin(dt); }
  else if (state.mode !== 'paused') updateFlakes(dt);   // snow keeps falling on menus / game over
  if (state.mode === 'splash' && (splashT += dt) >= SPLASH_TIME) setMode('title');
  if (isCoop()) netTick(dt);
  if (state.mode === 'title') { updateProgress(dt); updateMenuDemo(dt); }
  else if (MENU_MODES.includes(state.mode) && (state.bullies.length || state.snowballs.length)) { state.bullies = []; state.snowballs = []; state.swing = state.cooldown = 0; }
  if (state.mode !== 'paused') updateCelebration(dt);
  ctx.imageSmoothingEnabled = false;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
