import { useState, useEffect, useCallback } from "react";

export type ReminderOffset = 10 | 30 | 60;

export type Reminder = {
  id: string;           // unique: `${sessionId}-${offsetMinutes}`
  sessionId: string;
  raceName: string;
  sessionName: string;
  sessionCode: string;
  sessionTime: string;  // ISO
  triggerAt: number;    // unix ms
  offsetMinutes: ReminderOffset;
};

const LS_KEY = "f1-reminders-v2";

function load(): Reminder[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(reminders: Reminder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(reminders));
}

async function getSW(): Promise<ServiceWorker | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  return reg?.active ?? null;
}

async function swMessage(msg: object): Promise<void> {
  const sw = await getSW();
  sw?.postMessage(msg);
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(load);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // On mount: sync stored reminders to SW (in case SW was restarted)
  useEffect(() => {
    const current = load().filter((r) => r.triggerAt > Date.now());
    if (current.length > 0) {
      swMessage({ type: "SYNC_REMINDERS", reminders: current });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") {
      setPermission("granted");
      return true;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const hasReminder = useCallback(
    (sessionId: string, offset: ReminderOffset) => {
      const id = `${sessionId}-${offset}`;
      return reminders.some((r) => r.id === id);
    },
    [reminders]
  );

  const addReminder = useCallback(
    async (
      sessionId: string,
      raceName: string,
      sessionName: string,
      sessionCode: string,
      sessionTimeIso: string,
      offset: ReminderOffset
    ): Promise<"ok" | "denied" | "past"> => {
      const sessionMs  = new Date(sessionTimeIso).getTime();
      const triggerAt  = sessionMs - offset * 60_000;
      if (triggerAt <= Date.now()) return "past";

      const granted = await requestPermission();
      if (!granted) return "denied";

      const reminder: Reminder = {
        id: `${sessionId}-${offset}`,
        sessionId,
        raceName,
        sessionName,
        sessionCode,
        sessionTime: sessionTimeIso,
        triggerAt,
        offsetMinutes: offset,
      };

      const updated = [...reminders.filter((r) => r.id !== reminder.id), reminder];
      save(updated);
      setReminders(updated);
      await swMessage({ type: "SCHEDULE_REMINDER", reminder });
      return "ok";
    },
    [reminders, requestPermission]
  );

  const removeReminder = useCallback(
    async (sessionId: string, offset: ReminderOffset) => {
      const id      = `${sessionId}-${offset}`;
      const updated = reminders.filter((r) => r.id !== id);
      save(updated);
      setReminders(updated);
      await swMessage({ type: "CANCEL_REMINDER", id });
    },
    [reminders]
  );

  // Prune expired reminders
  useEffect(() => {
    const id = setInterval(() => {
      const now     = Date.now();
      const current = load();
      const pruned  = current.filter((r) => r.triggerAt > now);
      if (pruned.length !== current.length) {
        save(pruned);
        setReminders(pruned);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return { reminders, permission, requestPermission, hasReminder, addReminder, removeReminder };
}
