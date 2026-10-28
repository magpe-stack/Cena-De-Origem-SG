'use strict';

var CACHE_NAME = 'cena-de-origem-v1';
var ARQUIVOS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== CACHE_NAME; })
          .map(function (nome) { return caches.delete(nome); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (evento) {
  var requisicao = evento.request;
  if (requisicao.method !== 'GET') { return; }
  if (new URL(requisicao.url).origin !== self.location.origin) { return; }

  evento.respondWith(
    caches.match(requisicao).then(function (emCache) {
      if (emCache) { return emCache; }
      return fetch(requisicao).then(function (resposta) {
        if (resposta && resposta.ok) {
          var copia = resposta.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(requisicao, copia); });
        }
        return resposta;
      }).catch(function () {
        if (requisicao.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      });
    })
  );
});
