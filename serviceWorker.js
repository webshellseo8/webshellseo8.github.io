// WebShell.lol Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('webshell-cache-v1').then(cache => {
      return cache.addAll([
        '/', '/index.html',
        '/services.html', '/pricing.html', '/about.html',
        '/blog.html', '/contact.html', '/404.html',
        '/main.js', '/lang.js', '/styles.css'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) return cachedRes;
      return fetch(event.request).then(networkRes => {
        if (!networkRes || networkRes.status !== 200) return networkRes;
        return caches.open('webshell-cache-v1').then(cache => {
          cache.put(event.request, networkRes.clone());
          return networkRes;
        });
      });
    })
  );
});