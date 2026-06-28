// F1 2026 Command Center — Service Worker
// Handles offline caching, background reminders, and push notifications.

const CACHE_NAME    = "f1-2026-v2";
const DB_NAME       = "f1-reminders-db";
const DB_STORE      = "reminders";

// Core assets to pre-cache on install so the app loads fully offline
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

// ── Offline caching — install ──────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Offline caching — activate (prune old caches) ──────────────────
self.addEventListener("activate", async (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  await self.clients.claim();

  // Re-schedule any reminders that survived a SW restart
  try {
    const reminders = await getAllReminders();
    for (const r of reminders) scheduleTimer(r);
  } catch (_) {}
});

// ── Offline caching — fetch (network-first, fallback to cache) ─────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin or core CDN assets
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For navigation requests (HTML pages) use cache-first → offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a fresh copy of navigated pages
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // For same-origin static assets: network-first, fall back to cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For external API calls (Jolpica / Ergast): network only, no caching
  // (race data must always be fresh)
});

// ── Push notification support ──────────────────────────────────────
// Subscribe to push from the app via:
//   const sub = await registration.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
//   });
// Then POST `sub` to your backend.  The backend calls web-push to
// deliver payloads like: { title, body, tag, url }

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "F1 Alert", body: event.data.text(), tag: "f1-push" };
  }

  const { title = "F1 Command Center", body = "", tag = "f1-push", url = "/" } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:    "/icon-192.png",
      badge:   "/icon-192.png",
      tag,
      renotify: true,
      data:    { url },
      actions: [
        { action: "open",    title: "Open App" },
        { action: "dismiss", title: "Dismiss"  },
      ],
    })
  );
});

// ── IndexedDB helpers ──────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function getAllReminders() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function saveReminder(reminder) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(reminder);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

async function deleteReminder(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

// ── Active timers (cleared on SW restart) ─────────────────────────
const scheduledTimers = new Map();

function scheduleTimer(reminder) {
  const { id, triggerAt, raceName, sessionName, offsetMinutes } = reminder;

  if (scheduledTimers.has(id)) clearTimeout(scheduledTimers.get(id));

  const delay = triggerAt - Date.now();
  if (delay <= 0) {
    deleteReminder(id);
    return;
  }

  const timer = setTimeout(async () => {
    await self.registration.showNotification(`🏎 ${raceName}`, {
      body:    `${sessionName} starts in ${offsetMinutes} minutes!`,
      icon:    "/icon-192.png",
      badge:   "/icon-192.png",
      tag:     id,
      renotify: true,
      data:    { url: "/" },
      actions: [
        { action: "open",    title: "Open App" },
        { action: "dismiss", title: "Dismiss"  },
      ],
    });
    scheduledTimers.delete(id);
    await deleteReminder(id);
  }, delay);

  scheduledTimers.set(id, timer);
}

// ── Message handler ────────────────────────────────────────────────
self.addEventListener("message", async (event) => {
  const { type, reminder } = event.data ?? {};

  if (type === "SCHEDULE_REMINDER") {
    await saveReminder(reminder);
    scheduleTimer(reminder);
    event.source?.postMessage({ type: "REMINDER_SCHEDULED", id: reminder.id });
  }

  if (type === "CANCEL_REMINDER") {
    const { id } = event.data;
    if (scheduledTimers.has(id)) {
      clearTimeout(scheduledTimers.get(id));
      scheduledTimers.delete(id);
    }
    await deleteReminder(id);
    event.source?.postMessage({ type: "REMINDER_CANCELLED", id });
  }

  if (type === "GET_REMINDERS") {
    try {
      const reminders = await getAllReminders();
      event.source?.postMessage({ type: "REMINDERS_LIST", reminders });
    } catch (_) {
      event.source?.postMessage({ type: "REMINDERS_LIST", reminders: [] });
    }
  }

  if (type === "SYNC_REMINDERS") {
    const { reminders } = event.data;
    for (const r of reminders) {
      if (!scheduledTimers.has(r.id)) {
        await saveReminder(r);
        scheduleTimer(r);
      }
    }
  }
});

// ── Notification click ─────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ── Push subscription change ───────────────────────────────────────
// Fired when the browser auto-rotates the push subscription.
// Forward the new subscription to your backend here.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription?.options ?? { userVisibleOnly: true })
      .then((newSub) => {
        // TODO: POST newSub to your backend endpoint, e.g.:
        // fetch("/api/push/subscribe", { method: "POST", body: JSON.stringify(newSub) });
        console.log("[SW] Push subscription refreshed", newSub.endpoint);
      })
  );
});
