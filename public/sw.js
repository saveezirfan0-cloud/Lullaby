// ── Bump this string on every deploy to force cache refresh ──────────
const CACHE_NAME = 'lullaby-v3';

// Only cache assets we fully control — never CDN URLs.
// CDN failures in addAll() cause the entire SW install to abort on iOS,
// resulting in a blank screen when the PWA is opened offline.
const APP_SHELL = [
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(() => {/* non-fatal — app still works online */})
  );
  // Take control immediately instead of waiting for old SW to die
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL old caches so users get fresh assets after a deploy
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  // Claim existing clients so the new SW is in effect right away
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // ── HTML navigation: always network-first ────────────────────────
  // This guarantees a fresh app shell after every deploy and prevents
  // the "stale page after login" problem on desktop and iOS PWA.
  if (e.request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Update the cache with the fresh response
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // ── CDN / third-party requests: network-only ─────────────────────
  // Don't cache unpkg, jsDelivr, Google Fonts etc. — let the browser
  // handle them with its own HTTP cache. Caching them in the SW causes
  // opaque-response storage bloat and iOS quota warnings.
  if (!url.origin.includes(self.location.origin)) {
    return; // Let browser handle it (no respondWith = passthrough)
  }

  // ── Local assets (icons, manifest): cache-first ──────────────────
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── Listen for SKIP_WAITING message from the app ──────────────────
// Allows the app to programmatically activate a waiting SW update.
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
