// ============================================
// POVEȘTI DE CREDINȚĂ — Service Worker
// Cache Strategy: Cache First + Network Fallback
// ============================================

const CACHE_NAME = 'povesti-de-credinta-v1';
const CACHE_STATIC = 'static-v1';
const CACHE_DYNAMIC = 'dynamic-v1';

// Resurse cache la instalare
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/calendar.html',
  '/rugaciuni.html',
  '/acatiste.html',
  '/faq.html',
  '/despre.html',
  '/contact.html',
  '/css/style.css',
  '/js/app.js',
  '/data/calendar.json',
  '/manifest.json',
  '/offline.html'
];

// === INSTALL ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => {
        return new Request(url, { cache: 'reload' });
      })).catch(() => {
        // Ignorăm erorile individuale
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// === ACTIVATE ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// === FETCH — Stale While Revalidate pentru pagini, Cache First pentru assets ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET și requests externe (AdSense, YouTube, etc.)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Cache First pentru assets statice (CSS, JS, imagini, JSON)
  if (
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/data/') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale While Revalidate pentru pagini HTML
  event.respondWith(staleWhileRevalidate(request));
});

// === STRATEGII CACHE ===

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

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise || getOfflinePage();
}

async function getOfflinePage() {
  const cache = await caches.open(CACHE_STATIC);
  return cache.match('/offline.html') || 
    new Response('<h1>Ești offline</h1><p>Deschide aplicația când ai internet.</p>', 
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
    self.registration.showNotification(data.title || 'Povești de Credință', options)
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
