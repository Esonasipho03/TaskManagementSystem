// Minimal service worker so the app can be installed on phones.
// It never caches API calls; it only keeps a copy of the app shell so the
// installed app opens even on a flaky connection.

const CACHE = "tms-shell-v1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(["/", "/manifest.webmanifest"]))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Only handle page navigations on our own site; everything else
    // (API calls, assets, other origins) goes straight to the network.
    if (request.method !== "GET" || request.mode !== "navigate") return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE).then((cache) => cache.put("/", copy));
                return response;
            })
            .catch(() => caches.match("/"))
    );
});
