const CACHE_NAME = 'mood-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// Install event - to cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and storing resources');
        return cache.addAll(urlsToCache); // Store resources locally
      })
      .catch(error => {
        console.error('Caching failed:', error);
      })
  );
});

// Fetch event - serve resources from the cache or fetch from the network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve from cache if available
        } else {
          // Fetch from the network if not found in the cache
          return fetch(event.request)
            .then((networkResponse) => {
              // Optionally cache the new resource
              if (networkResponse && networkResponse.status === 200) {
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, clonedResponse); // Cache new responses
                  });
              }
              return networkResponse;
            })
            .catch((err) => {
              console.error('Network fetch failed:', err);
            });
        }
      })
  );
});

// Activate event - delete old caches to ensure up-to-date resources
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName); // Delete old caches
            }
          })
        );
      })
      .catch((error) => {
        console.error('Cache cleanup failed:', error);
      })
  );
});

