// バージョン番号（今後HTMLやCSSを新しく書き換えたら、ここを v2, v3... と変えるだけで全員に強制アプデが入ります）
const CACHE_NAME = 'zikanwari-v2';
const urlsToCache = [
  'index.html',
  'manifest.json'
];

// インストール時にファイルをキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    }).then(() => {
      // 待機せずにすぐに新しいサービスワーカーを有効化する
      return self.skipWaiting();
    })
  );
});

// 新しいバージョンが来たら、古いキャッシュを自動で根こそぎ削除する
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除しました:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 全てのタブやインストールされたアプリに即時反映させる
      return self.clients.claim();
    })
  );
});

// アプリ起動時はネットワークを優先し、電波がない時だけキャッシュを見る（常に最新にする設定）
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
