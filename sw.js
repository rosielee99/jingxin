// ============================================
// 静心 — Service Worker (Offline Support)
// ============================================

const CACHE_NAME = 'jingxin-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/tokens.css',
  '/css/base.css',
  '/css/tabs.css',
  '/css/features/brain-dump.css',
  '/css/features/anxiety-journal.css',
  '/css/features/breathing.css',
  '/css/features/reminders.css',
  '/css/features/daily-sentence.css',
  '/js/storage.js',
  '/js/app.js',
  '/js/features/brain-dump.js',
  '/js/features/anxiety-journal.js',
  '/js/features/breathing.js',
  '/js/features/reminders.js',
  '/js/features/daily-sentence.js'
];

// Install: cache all static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached version if available
        return cached || new Response('Offline');
      });
    })
  );
});
