'use strict';

// ---------- Tuning ----------
const CONFIG = {
  W: 180,
  H: 320,
  maxDt: 0.05,            // delta-time clamp (s)
  throwCooldown: 0.5,     // s
  snowballSpeed: 220,     // px/s
  snowballRadius: 3,
  minPull: 10,            // px; shorter pull cancels the throw
  minAngle: 10,           // degrees above horizontal
  maxAngle: 170,
  aimDots: 5,
  aimDotSpacing: 8,       // 5 dots -> last dot 40 px from the hand
  aimDotSize: 2,
  handX: 99,              // where throws and the aim line start
  handY: 262,
  shoulderX: 94,
  shoulderY: 267,
  armPull: 3,             // px the arm draws back while aiming
  armSwingTime: 0.18,     // s
  armSwingReach: 4,       // px the arm pushes forward on release
  ringRadius: 6,
  ringSteps: 24,
  fortTop: 270,
  flakes: 30,
  flakeSpeedMin: 12,
  flakeSpeedMax: 26,
};

const COLORS = {
  snow: '#f4f8ff', ice: '#bfe3ff', shadow: '#7aa5d6', night: '#1c2b4a',
  coatBlue: '#3b6fd9', skin: '#f2c9a0', brown: '#8a5a33', black: '#111',
  gold: '#ffd23f', hatGreen: '#3fa34d',
  orange: '#f28c28', // scarf (simplest addition to the palette)
};

// ---------- Canvas setup ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function fitCanvas() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const s = Math.min(vw / CONFIG.W, vh / CONFIG.H);
  const w = CONFIG.W * s, h = CONFIG.H * s;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.left = (vw - w) / 2 + 'px';
  canvas.style.top = (vh - h) / 2 + 'px';
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

// ---------- Static background (pre-rendered once) ----------
const bg = document.createElement('canvas');
bg.width = CONFIG.W; bg.height = CONFIG.H;
(function buildBackground() {
  const b = bg.getContext('2d');
  const r = (c, x, y, w, h) => { b.fillStyle = c; b.fillRect(x, y, w, h); };
  // Sky / snowy ground in soft bands
  r(COLORS.ice, 0, 0, 180, 320);
  r('#d6ecff', 0, 120, 180, 200);
  r(COLORS.snow, 0, 200, 180, 120);
  // Snow sparkle / drift specks
  for (let i = 0; i < 70; i++) {
    r(COLORS.snow, Math.floor(rnd() * 178), Math.floor(rnd() * 200), 2, 1);
  }
  for (let i = 0; i < 40; i++) {
    r(COLORS.ice, Math.floor(rnd() * 178), 205 + Math.floor(rnd() * 60), 3, 1);
  }
  // Pine trees (small pixel trees)
  const tree = (x, y) => {
    r(COLORS.brown, x + 3, y + 12, 2, 3);
    r(COLORS.hatGreen, x + 3, y, 2, 2);
    r(COLORS.hatGreen, x + 2, y + 2, 4, 3);
    r(COLORS.hatGreen, x + 1, y + 5, 6, 3);
    r(COLORS.hatGreen, x, y + 8, 8, 4);
    r(COLORS.snow, x + 3, y + 1, 2, 1);
    r(COLORS.snow, x + 2, y + 5, 2, 1);
    r(COLORS.snow, x + 1, y + 8, 2, 1);
    r(COLORS.shadow, x - 1, y + 15, 10, 1);
  };
  tree(10, 150); tree(150, 140); tree(30, 205); tree(135, 200); tree(88, 120);
})();

// ---------- Fort ----------
const fort = document.createElement('canvas');
fort.width = CONFIG.W; fort.height = CONFIG.H - CONFIG.fortTop;
(function buildFort() {
  const f = fort.getContext('2d');
  const r = (c, x, y, w, h) => { f.fillStyle = c; f.fillRect(x, y, w, h); };
  const bw = 20, bh = 10, rows = Math.ceil(fort.height / bh);
  r(COLORS.shadow, 0, 0, fort.width, fort.height); // mortar / outline
  for (let row = 0; row < rows; row++) {
    const off = row % 2 ? -bw / 2 : 0;
    for (let x = off; x < fort.width; x += bw) {
      const y = row * bh;
      const x0 = Math.max(0, x + 1), x1 = Math.min(fort.width, x + bw - 1);
      r(COLORS.snow, x0, y + 1, x1 - x0, bh - 2);
      r(COLORS.ice, x0, y + bh - 3, x1 - x0, 2); // bottom shade
    }
  }
  // Rounded-ish top edge with little bumps
  r(COLORS.snow, 0, 0, fort.width, 1);
  for (let x = 0; x < fort.width; x += 20) r(COLORS.snow, x + 4, -0, 12, 1);
})();

// ---------- State ----------
const state = {
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
    y: (e.clientY - r.top) * (CONFIG.H / r.height),
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

function throwSnowball() {
  const a = state.aimAngle * DEG;
  const dirX = Math.cos(a), dirY = -Math.sin(a);
  state.snowballs.push({
    x: CONFIG.handX, y: CONFIG.handY,
    vx: dirX * CONFIG.snowballSpeed, vy: dirY * CONFIG.snowballSpeed,
  });
  state.cooldown = CONFIG.throwCooldown;
  state.swing = CONFIG.armSwingTime;
}

window.addEventListener('pointerdown', e => {
  if (state.aiming) return;
  e.preventDefault();
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
}, { passive: false });

window.addEventListener('pointerup', e => {
  if (!state.aiming || e.pointerId !== state.pointerId) return;
  e.preventDefault();
  updateAim(toCanvas(e));
  // Throw only if pull is long enough and the cooldown is over
  if (state.aimValid && state.cooldown <= 0) throwSnowball();
  endAim();
}, { passive: false });

window.addEventListener('pointercancel', e => {
  if (e.pointerId === state.pointerId) endAim();
});
window.addEventListener('blur', endAim);

// ---------- Update ----------
function update(dt) {
  // Falling snow
  for (const f of state.flakes) {
    f.y += f.v * dt;
    f.ph += dt;
    if (f.y > CONFIG.H) { f.y = -2; f.x = Math.random() * CONFIG.W; }
  }

  if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - dt);
  if (state.swing > 0) state.swing = Math.max(0, state.swing - dt);

  // Snowballs fly straight until fully off-screen
  const m = CONFIG.snowballRadius + 1;
  for (let i = state.snowballs.length - 1; i >= 0; i--) {
    const s = state.snowballs[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.x < -m || s.x > CONFIG.W + m || s.y < -m || s.y > CONFIG.H + m) {
      state.snowballs.splice(i, 1);
    }
  }
}

// ---------- Draw ----------
function drawFlakes() {
  ctx.fillStyle = COLORS.snow;
  for (const f of state.flakes) {
    ctx.fillRect(Math.round(f.x + Math.sin(f.ph) * 3), Math.round(f.y), 1, 1);
  }
}

// Kid (blue hat, orange scarf) peeking over the fort. Hand drawn separately via arm.
function drawKid() {
  const x = 84, y = 250;
  // hat with pom
  rect(COLORS.snow, x + 5, y - 2, 2, 2);
  rect(COLORS.coatBlue, x + 2, y, 8, 3);
  rect(COLORS.coatBlue, x + 1, y + 3, 10, 2);
  rect(COLORS.snow, x + 1, y + 5, 10, 1);   // hat cuff
  // face
  rect(COLORS.skin, x + 2, y + 6, 8, 6);
  rect(COLORS.black, x + 4, y + 8, 1, 2);   // eyes
  rect(COLORS.black, x + 7, y + 8, 1, 2);
  // scarf
  rect(COLORS.orange, x + 1, y + 12, 10, 3);
  rect(COLORS.orange, x + 9, y + 14, 2, 5); // scarf tail
  // body / coat
  rect(COLORS.coatBlue, x + 1, y + 15, 8, 6);
}

function drawArm() {
  // Arm pulls back while aiming, swings forward on release.
  const a = state.aimAngle * DEG;
  const dx = Math.cos(a), dy = -Math.sin(a);
  let off = 0;
  if (state.swing > 0) {
    const t = 1 - state.swing / CONFIG.armSwingTime;       // 0..1
    off = t < 0.4
      ? -CONFIG.armPull + (CONFIG.armSwingReach + CONFIG.armPull) * (t / 0.4)
      : CONFIG.armSwingReach * (1 - (t - 0.4) / 0.6);
  } else if (state.aiming && state.aimValid) {
    off = -CONFIG.armPull;
  }
  const hx = CONFIG.handX + dx * off, hy = CONFIG.handY + dy * off;
  // arm as a few coat-colored pixels from shoulder to hand
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    rect(COLORS.coatBlue, CONFIG.shoulderX + (hx - CONFIG.shoulderX) * t - 1,
         CONFIG.shoulderY + (hy - CONFIG.shoulderY) * t - 1, 3, 3);
  }
  rect(COLORS.skin, hx - 1, hy - 1, 3, 3); // hand
}

function drawAimLine() {
  if (!state.aiming || !state.aimValid) return;
  const a = state.aimAngle * DEG;
  const dx = Math.cos(a), dy = -Math.sin(a);
  const n = CONFIG.aimDots;
  for (let i = 1; i <= n; i++) {
    const d = i * CONFIG.aimDotSpacing;
    ctx.globalAlpha = 1 - (i - 1) / (n + 1);   // fade toward the end
    rect(COLORS.snow, CONFIG.handX + dx * d - 1, CONFIG.handY + dy * d - 1, CONFIG.aimDotSize, CONFIG.aimDotSize);
  }
  ctx.globalAlpha = 1;
}

function drawCooldownRing() {
  if (state.cooldown <= 0) return;
  const frac = 1 - state.cooldown / CONFIG.throwCooldown;
  const n = CONFIG.ringSteps;
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const px = CONFIG.handX + Math.cos(ang) * CONFIG.ringRadius;
    const py = CONFIG.handY + Math.sin(ang) * CONFIG.ringRadius;
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

function draw() {
  ctx.clearRect(0, 0, CONFIG.W, CONFIG.H);
  ctx.drawImage(bg, 0, 0);
  drawFlakes();
  drawKid();
  ctx.drawImage(fort, 0, CONFIG.fortTop);
  drawArm();
  drawCooldownRing();
  drawAimLine();
  for (const s of state.snowballs) drawSnowball(s);
}

// ---------- Loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(CONFIG.maxDt, (now - last) / 1000);
  last = now;
  update(dt);
  ctx.imageSmoothingEnabled = false;
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
