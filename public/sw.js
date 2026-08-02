// Service worker minimal : nécessaire pour que les navigateurs proposent
// "Installer l'application", sans mettre en place de cache hors-ligne
// complexe qui pourrait servir une version périmée du site.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Laisse passer toutes les requêtes normalement (pas de cache).
self.addEventListener("fetch", () => {});
