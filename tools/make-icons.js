// Generates the pixel-art PWA icons into ../icons using only Node built-ins.
// Run from the project folder:  node tools/make-icons.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const GRID = 32; // logical pixel grid; scaled up with nearest-neighbour
const NIGHT = [0x1c, 0x2b, 0x4a], SNOW = [0xf4, 0xf8, 0xff], ICE = [0xbf, 0xe3, 0xff], SHADOW = [0x7a, 0xa5, 0xd6];

// radius is in grid cells. Maskable art must stay inside the central safe zone (circle of 40% of the size).
function pixelAt(gx, gy, radius) {
  const dx = gx + 0.5 - GRID / 2, dy = gy + 0.5 - GRID / 2, d = Math.hypot(dx, dy);
  if (d > radius) return NIGHT;
  if (d > radius - 1.2) return SHADOW;                 // outline
  const s = (dx * 0.6 + dy * 0.8) / radius;            // >0 towards lower-right (away from the light)
  if (s > 0.4) return SHADOW;
  if (s > 0.05) return ICE;
  return SNOW;
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, radius) {
  const scale = size / GRID;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const c = pixelAt(Math.floor(x / scale), Math.floor(y / scale), radius);
      raw.set(c, row + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'icon-192.png'), png(192, 12));
fs.writeFileSync(path.join(out, 'icon-512.png'), png(512, 12));
fs.writeFileSync(path.join(out, 'icon-maskable-512.png'), png(512, 9)); // 9 < 12.8 safe radius
console.log('icons written to', out);
