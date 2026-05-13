/*
 * STandlone ERP — minimal hand-rolled service worker.
 *
 * Phase 14 Stream 14A scope:
 *   - PWA install + the offline-fallback "you are offline" page.
 *   - NO mutation queue, NO data caching, NO API interception.
 *
 * Phase 14 Stream 14E will land the offline write queue (op-log
 * pattern from project_pi_offline_architecture.md). Until then this
 * worker is intentionally tiny so we don't ship offline behaviour we
 * can't yet test against the real engine.
 *
 * Caching strategy:
 *   - Precache: shell HTML + manifest + icon SVG only.
 *   - Same-origin GET requests for static Vite assets fall through
 *     to network with cache-fallback (stale-while-revalidate).
 *   - All /api/* requests bypass the worker entirely (cache: no-store
 *     equivalent).
 *
 * Bump CACHE_VERSION when shipping a SW change so old clients evict.
 */

const CACHE_VERSION = "v1-14a";
const CACHE_NAME = `standlone-erp-shell-${CACHE_VERSION}`;
const SHELL_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // `addAll` is atomic — if any precache fetch fails the worker
      // install rejects, which is the correct behaviour. We do not
      // want a partially-populated cache silently shipping.
      cache.addAll(SHELL_ASSETS),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("standlone-erp-shell-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET; mutations always reach the network.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Same-origin only — never cache cross-origin resources.
  if (url.origin !== self.location.origin) return;

  // /api/* always hits the network. The accounting engine is the
  // source of truth; a stale GET against /api could mislead a clerk.
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests — return cached shell on offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html").then((r) => r || Response.error())),
    );
    return;
  }

  // Static assets — cache-first with background revalidation.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || fetchPromise;
    }),
  );
});
