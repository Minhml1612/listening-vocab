/**
 * SERVICE WORKER CHO DOCVOCAB PWA
 * Hỗ trợ lưu trữ bộ nhớ đệm (Cache) để học ngoại tuyến (Offline) trên điện thoại
 */

const CACHE_NAME = 'docvocab-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/storage.js',
  './js/speech.js',
  './js/ai-enrich.js',
  './js/sync.js',
  './js/modes/flashcard.js',
  './js/modes/quiz.js',
  './js/modes/match.js',
  './js/modes/listening.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Chỉ cache các request HTTP/HTTPS cơ bản trong cùng origin hoặc CDN
  if (event.request.method !== 'GET') return;
  const url = event.request.url;

  // Không cache các lệnh gọi API Google Docs hoặc dịch thuật để luôn lấy dữ liệu mới
  if (url.includes('script.google.com') || url.includes('generativelanguage.googleapis.com') || url.includes('mymemory')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match('./index.html');
      });
    })
  );
});
