// Service Worker for Mendify PWA - Enhanced Offline Caching
const CACHE_NAME = 'mendify-v1.3';
const urlsToCache = [
  './MENDIFY.HTML',
  './about.html',
  './gallery.html',
  './mendify.css',
  './mendify.js',
  './mendify-enhanced.js',
  './manifest.json',
  './pictures/MENDIFY LOGO.png',
  './pictures/hands.jpg',
  './pictures/vladislav-klapin-SymZoeE8quA-unsplash.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Cache quote images on demand
const quoteImageCache = 'mendify-quotes-v1';

// Install: Cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate: Cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== quoteImageCache) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for dynamic, cache-first for static
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle YouTube embeds - network first
  if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a fallback HTML for YouTube embeds
          return new Response(`
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 200px; 
              background: #f0f0f0; 
              border-radius: 12px; 
              color: #666;
              font-family: Arial, sans-serif;
            ">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎵</div>
                <div>Music unavailable offline</div>
                <div style="font-size: 12px; margin-top: 5px;">Check your connection</div>
              </div>
            </div>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }
  
  // Handle Google Fonts - cache first with network fallback
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .then(response => {
          // Cache successful font responses
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
    );
    return;
  }
  
  // Handle quote images - cache on demand
  if (url.pathname.includes('/pictures/inspirational quotes/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              if (!response || !response.ok) {
                return response;
              }
              const responseClone = response.clone();
              caches.open(quoteImageCache).then(cache => cache.put(event.request, responseClone));
              return response;
            })
            .catch(() => {
              // Return a fallback for missing quote images
              return new Response(`
                <div style="
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  height: 300px; 
                  background: linear-gradient(135deg, #667eea, #764ba2); 
                  border-radius: 15px; 
                  color: white;
                  font-family: Arial, sans-serif;
                  text-align: center;
                  padding: 20px;
                ">
                  <div>
                    <div style="font-size: 24px; margin-bottom: 10px;">✨</div>
                    <div style="font-size: 18px; font-weight: bold;">"You are capable of amazing things"</div>
                    <div style="font-size: 14px; margin-top: 10px;">- Daily Inspiration</div>
                  </div>
                </div>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }
  
  // Handle all other requests - cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || !response.ok) {
              throw new Error('Network response was not ok');
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            return response;
          })
          .catch(() => {
            // Return fallback for app shell
            if (event.request.destination === 'document') {
              return caches.match('./MENDIFY.HTML');
            }
            // Return a generic error response for other resources
            return new Response('Resource unavailable offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for future features
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  // Placeholder for future data synchronization
  return Promise.resolve();
}

