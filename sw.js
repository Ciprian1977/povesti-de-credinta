// ============================================
// POVEȘTI DE CREDINȚĂ — Service Worker v2
// ============================================
// Strategii cache:
//   1. STATIC ASSETS (CSS, JS, imagini, fonturi) → Cache-First (TTL lung)
//   2. HTML PAGES → Stale-While-Revalidate
//   3. SUPABASE API (GET cu data_calendaristica=eq.YYYY-MM-DD) → Network-First cu Cache Fallback
//      • Cache-ul este sigur deoarece URL-ul include data exactă ca parametru
//      • La miezul nopții, data se schimbă → URL nou → request nou la rețea automat
//      • Utilizatorii offline văd conținutul zilei de azi dacă au deschis app-ul cel puțin o dată
// ============================================

const CACHE_VERSION = 'v2';
const CACHE_STATIC = `static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `dynamic-${CACHE_VERSION}`;
const CACHE_SUPABASE = `supabase-${CACHE_VERSION}`;

// TTL pentru cache-ul Supabase: 23 ore (în milisecunde)
// Suficient de lung pentru offline, suficient de scurt pentru a nu servi date vechi
const SUPABASE_CACHE_TTL_MS = 23 * 60 * 60 * 1000;

// Resurse cache la instalare (shell-ul aplicației)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/calendar.html',
  '/rugaciuni.html',
  '/acatiste.html',
  '/pricesne.html',
  '/posturi.html',
  '/faq.html',
  '/despre.html',
  '/contact.html',
  '/sfantul-zilei/',
  '/apostolul-zilei/',
  '/evanghelia-zilei/',
  '/sinaxarul-zilei/',
  '/predica-zilei/',
  '/calendar-ortodox-azi/',
  '/css/style.css',
  '/js/app.js',
  '/js/supabase-loader.js',
  '/data/calendar.json',
  '/manifest.json',
  '/offline.html'
];

// Domeniul Supabase — toate request-urile GET spre acesta vor fi interceptate
const SUPABASE_DOMAIN = 'smuqpipxeotkbttolivp.supabase.co';

// === INSTALL ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      // Adăugăm fiecare resursă individual pentru a nu bloca instalarea la erori
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// === ACTIVATE — curăță cache-urile vechi ===
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_STATIC, CACHE_DYNAMIC, CACHE_SUPABASE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => {
            console.log(`[SW] Șterg cache vechi: ${key}`);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// === FETCH — interceptare request-uri ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // —— STRATEGIE 1: Supabase API → Network-First cu Cache Fallback ——
  // Interceptăm TOATE request-urile GET spre Supabase (inclusiv cele cu data în URL)
  // URL-ul include data_calendaristica=eq.YYYY-MM-DD → cache sigur per zi
  if (url.hostname === SUPABASE_DOMAIN) {
    event.respondWith(supabaseNetworkFirst(request));
    return;
  }

  // Skip alte origini externe (AdSense, YouTube, Google Fonts, etc.)
  if (url.origin !== location.origin) return;

  // —— STRATEGIE 2: Assets statice → Cache-First ——
  if (
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/data/') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // —— STRATEGIE 3: Pagini HTML → Stale-While-Revalidate ——
  event.respondWith(staleWhileRevalidate(request));
});

// === STRATEGIE: Network-First cu Cache Fallback pentru Supabase ===
// Încearcă rețeaua întâi; dacă eșuează (offline), servește din cache.
// Cache-ul este valid 23 ore — la miezul nopții, URL-ul se schimbă
// (data_calendaristica=eq.YYYY-MM-DD) deci se face automat un nou request la rețea.
async function supabaseNetworkFirst(request) {
  const cache = await caches.open(CACHE_SUPABASE);

  try {
    // Încearcă rețeaua cu timeout de 5 secunde
    const networkResponse = await Promise.race([
      fetch(request.clone()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )
    ]);

    if (networkResponse.ok) {
      // Salvează în cache cu timestamp pentru TTL
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-at', Date.now().toString());

      const body = await responseToCache.arrayBuffer();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });

      cache.put(request, cachedResponse);
      console.log(`[SW] Supabase → rețea OK, salvat în cache: ${new URL(request.url).search}`);
    }

    return networkResponse;
  } catch (err) {
    // Rețeaua a eșuat (offline sau timeout) → încearcă cache-ul
    console.log(`[SW] Supabase → offline/timeout, încerc cache-ul...`);
    const cached = await cache.match(request);

    if (cached) {
      // Verifică dacă cache-ul nu este prea vechi (TTL 23 ore)
      const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
      const age = Date.now() - cachedAt;

      if (age < SUPABASE_CACHE_TTL_MS) {
        console.log(`[SW] Supabase → servit din cache (vârsta: ${Math.round(age / 60000)} minute)`);
        return cached;
      } else {
        console.log(`[SW] Supabase → cache expirat (${Math.round(age / 3600000)} ore), returnez gol`);
      }
    }

    // Niciun cache valid → returnează array gol (app-ul va folosi fallback calendar.json)
    return new Response('[]', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'sw-offline': 'true'
      }
    });
  }
}

// === STRATEGIE: Cache-First pentru assets statice ===
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline - resursă indisponibilă', { status: 503 });
  }
}

// === STRATEGIE: Stale-While-Revalidate pentru pagini HTML ===
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached || getOfflinePage());

  return cached || fetchPromise;
}

// === Pagina offline ===
async function getOfflinePage() {
  const cache = await caches.open(CACHE_STATIC);
  return (
    (await cache.match('/offline.html')) ||
    new Response(
      `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline — Povești de Credință</title>
  <style>
    body { font-family: Georgia, serif; text-align: center; padding: 2rem;
           background: #FDF6E3; color: #3d1a1a; }
    h1 { color: #6B1B2B; font-size: 1.8rem; }
    p { font-size: 1.1rem; line-height: 1.7; }
    .cross { font-size: 3rem; margin: 1rem 0; }
  </style>
</head>
<body>
  <div class="cross">✝️</div>
  <h1>Ești offline</h1>
  <p>Nu ai conexiune la internet în acest moment.</p>
  <p>Deschide aplicația când ai internet pentru a vedea sfântul zilei.</p>
  <p><em>„Doamne, ajută!"</em></p>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  );
}

// === PUSH NOTIFICATIONS ===
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'Povești de Credință',
      body: event.data.text(),
      icon: '/images/icon-192.png'
    };
  }

  const options = {
    body: data.body || 'Sfântul zilei te așteaptă',
    icon: data.icon || '/images/icon-192.png',
    badge: '/images/badge-72.png',
    image: data.image,
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '🕯️ Deschide', icon: '/images/icon-96.png' },
      { action: 'close', title: 'Închide' }
    ],
    requireInteraction: false,
    tag: 'sfantul-zilei'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Povești de Credință ✝️', options)
  );
});

// === CLICK PE NOTIFICARE ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
