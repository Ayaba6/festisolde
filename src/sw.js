/// <reference lib="webworker" />
// Service worker FestiSolde : cache hors-ligne + notifications push vendeur.
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Application à page unique : toutes les navigations servent index.html (sauf /api).
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }));

// --- Notifications push ---
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'FestiSolde', body: event.data?.text() };
  }
  const title = data.title || 'Nouvelle commande';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || 'Ouvrez votre espace vendeur pour la traiter.',
      icon: '/icon-192.png',
      badge: '/pwa-192x192.png',
      tag: data.tag || 'festisolde-order',
      renotify: true,
      data: { url: data.url || '/revenus' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/revenus', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const existing = wins.find((w) => w.url.startsWith(self.location.origin));
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
