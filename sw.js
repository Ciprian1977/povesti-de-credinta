// ═══════════════════════════════════════════════════════════════════
// POVEȘTI DE CREDINȚĂ — Service Worker v5
// Strategii: Network-First (Supabase API) + Stale-While-Revalidate (statice)
// v4: fix badge dezlegare_ulei/post_aspru + algoritm post BOR 2026
// v5: modul Notificări Inteligente (/setari-notificari) + OneSignal SW
// ═════════════════════════════════════════════════════════════════
const CACHE_STATIC = 'pdc-static-v5';
const CACHE_PAGES  = 'pdc-pages-v5';
const CACHE_API    = 'pdc-api-v5';

// Resurse statice pre-cache la instalare
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json',
  '/offline.html',
  '/data/calendar.json',
  '/data/lectionar.json',
  '/rugaciuni.html',
  '/calendar.html',
  '/acatiste.html',
  '/pricesne.html',
  '/posturi.html',
  '/faq.html',
  '/despre.html',
  '/sfantul-zilei/',
  '/apostolul-zilei/',
  '/evanghelia-zilei/',
  '/sinaxarul-zilei/',
  '/predica-zilei/',
  '/calendar-ortodox-azi/',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/favicon.png'
];

// ─── INSTALL: pre-cache resurse statice ─────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: șterge cache-uri vechi ────────────────────────────────────────
self.addEventListener('activate', event => {
  const VALID_CACHES = [CACHE_STATIC, CACHE_PAGES, CACHE_API];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !VALID_CACHES.includes(k)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: router principal ──────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignoră request-uri non-GET și extensii browser
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // 0. ONESIGNAL → nu intercepta (SDK-ul și SW-ul OneSignal se gestionează singure)
  if (
    url.hostname.includes('onesignal.com') ||
    url.pathname.startsWith('/onesignal/') ||
    url.pathname.includes('OneSignalSDK')
  ) {
    return;
  }

  // 1. SUPABASE API → Network-First cu Cache Fallback (TTL 23 ore)
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/v1/')) {
    event.respondWith(networkFirstSupabase(request));
    return;
  }

  // 2. FONTURI GOOGLE → Stale-While-Revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  // 3. RESURSE STATICE (CSS, JS, imagini, JSON) → Stale-While-Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  // 4. PAGINI HTML → Network-First cu Cache Fallback
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  // 5. Altele → Network cu fallback cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ─── Strategie: Network-First pentru Supabase API ────────────────────────────
async function networkFirstSupabase(request) {
  const cache = await caches.open(CACHE_API);
  const cacheKey = request.url;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout 5s

    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      // Salvează în cache cu timestamp pentru TTL
      const responseToCache = networkResponse.clone();
      const body = await responseToCache.text();
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-at', Date.now().toString());

      const cachedResponse = new Response(body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });
      cache.put(cacheKey, cachedResponse);
    }

    return networkResponse;
  } catch (err) {
    // Rețea indisponibilă — încearcă cache
    const cached = await cache.match(cacheKey);
    if (cached) {
      const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
      const age = Date.now() - cachedAt;
      const TTL_23H = 23 * 60 * 60 * 1000;

      if (age < TTL_23H) {
        console.log('[SW] Supabase offline — servesc din cache (vârstă:', Math.round(age/60000), 'min)');
        return cached;
      }
    }
    // Cache expirat sau inexistent — returnează array gol (app va folosi fallback)
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ─── Strategie: Network-First pentru pagini HTML ─────────────────────────────
async function networkFirstPage(request) {
  const cache = await caches.open(CACHE_PAGES);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback la pagina offline
    return caches.match('/offline.html');
  }
}

// ─── Strategie: Stale-While-Revalidate pentru resurse statice ────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Actualizează în background
  const networkFetch = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Returnează cache imediat dacă există, altfel așteaptă rețeaua
  return cached || networkFetch;
}

// ─── MESSAGE: forțează actualizare cache ─────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    caches.delete(CACHE_API).then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }
});
