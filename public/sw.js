const TEMARO_CACHE = "temaro-shell-v1";
const SHELL_URLS = ["/", "/podniky", "/account/login", "/login", "/icon.svg", "/brand/temaro-mark.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(TEMARO_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== TEMARO_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.includes("/payments/") || url.pathname.includes("/auth/")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.mode === "navigate") {
          const clone = response.clone();
          caches.open(TEMARO_CACHE).then((cache) => cache.put(request, clone));
        }

        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
  );
});
