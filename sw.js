// Bump CACHE_VERSION whenever any game file changes so installed copies update.
const CACHE_VERSION = 'snowball-v29';

const FILES = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './peerjs.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())
  );
});

// Delete caches from older versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first; fall back to the network, then to the cached page for navigations
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(event.request).catch(() =>
        event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()
      );
    })
  );
});
