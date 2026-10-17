var CACHE = 'poli-route-shell-27';
var CACHE_PREFIX = 'poli-route-shell-';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

function isShell(pathname) {
  return /\/$/.test(pathname) ||
    /\/index\.html$/.test(pathname) ||
    /\/manifest\.webmanifest$/.test(pathname) ||
    /\/icons\/icon-(180|192|512)\.png$/.test(pathname);
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key !== CACHE && key.indexOf(CACHE_PREFIX) === 0;
    }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  if (!isShell(url.pathname)) return;
  event.respondWith(fetch(req, {cache: 'reload'}).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || caches.match('./index.html');
    });
  }));
});
