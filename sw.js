const CACHE_NAME = 'fourth-love-v2';
const urlsToCache = ['./', './index.html', './manifest.json'];

// 安装时缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求时的缓存策略
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // HTML页面：网络优先（每次都获取最新版，失败才用缓存）
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 缓存最新版本
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // 其他资源：缓存优先
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
