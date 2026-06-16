// F1 2026 Command Center — Service Worker
// Handles background session reminder notifications.

const CACHE_NAME = "f1-2026-v1";
const DB_NAME    = "f1-reminders-db";
const DB_STORE   = "reminders";

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
  const { id, triggerAt, raceName, sessionName, sessionCode } = reminder;

  // Clear any existing timer for this id
  if (scheduledTimers.has(id)) clearTimeout(scheduledTimers.get(id));

  const delay = triggerAt - Date.now();
  if (delay <= 0) {
    // Already past — clean up
    deleteReminder(id);
    return;
  }

  const timer = setTimeout(async () => {
    await self.registration.showNotification(`🏎 ${raceName}`, {
      body: `${sessionName} starts in ${reminder.offsetMinutes} minutes!`,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: id,
      renotify: true,
      data: { url: "/" },
      actions: [
        { action: "open", title: "Open App" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });
    scheduledTimers.delete(id);
    await deleteReminder(id);
  }, delay);

  scheduledTimers.set(id, timer);
}

// ── SW lifecycle ───────────────────────────────────────────────────
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", async (event) => {
  await self.clients.claim();
  // Re-schedule any reminders that survived a SW restart
  try {
    const reminders = await getAllReminders();
    for (const r of reminders) scheduleTimer(r);
  } catch (_) {}
});

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
    // Page sends full current list; re-schedule anything not already timed
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

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow("/");
    })
  );
});
