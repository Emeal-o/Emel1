import { useState, useRef, useEffect } from "react";
import { Bell, BellOff, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReminders, ReminderOffset } from "../hooks/useReminders";

const OFFSETS: { value: ReminderOffset; label: string }[] = [
  { value: 10,  label: "10 min before" },
  { value: 30,  label: "30 min before" },
  { value: 60,  label: "1 hour before" },
];

type Props = {
  sessionId: string;
  raceName: string;
  sessionName: string;
  sessionCode: string;
  sessionTimeIso: string;
  className?: string;
};

export default function ReminderButton({
  sessionId, raceName, sessionName, sessionCode, sessionTimeIso, className = "",
}: Props) {
  const { permission, hasReminder, addReminder, removeReminder } = useReminders();
  const [open, setOpen]     = useState(false);
  const [flash, setFlash]   = useState<string | null>(null);
  const [busy, setBusy]     = useState(false);
  const ref                 = useRef<HTMLDivElement>(null);

  const activeOffsets = OFFSETS.filter((o) => hasReminder(sessionId, o.value));
  const isSet         = activeOffsets.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Past session — don't render
  if (new Date(sessionTimeIso).getTime() - 60_000 <= Date.now()) return null;

  async function toggle(offset: ReminderOffset) {
    if (busy) return;
    setBusy(true);
    if (hasReminder(sessionId, offset)) {
      await removeReminder(sessionId, offset);
      showFlash("Reminder removed");
    } else {
      const result = await addReminder(sessionId, raceName, sessionName, sessionCode, sessionTimeIso, offset);
      if (result === "ok")     showFlash(`Set for ${offset} min before`);
      if (result === "denied") showFlash("Enable notifications first");
      if (result === "past")   showFlash("Session already started");
    }
    setBusy(false);
    setOpen(false);
  }

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2500);
  }

  return (
    <div ref={ref} className={`relative inline-flex flex-col items-end ${className}`}>
      {/* Main button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        title={isSet ? "Reminder set — tap to change" : "Set a session reminder"}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold
          transition-all duration-200 select-none
          ${isSet
            ? "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
            : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
          }
          ${busy ? "opacity-50 cursor-wait" : ""}
        `}
      >
        {isSet
          ? <Bell className="w-3.5 h-3.5 fill-primary" />
          : <Bell className="w-3.5 h-3.5" />
        }
        <span className="hidden sm:inline">{isSet ? "Remind" : "Remind me"}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full mt-1.5 right-0 z-50 min-w-[160px] bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {sessionCode} · {raceName}
              </p>
              <p className="text-xs font-mono text-foreground/70 mt-0.5">Notify me before</p>
            </div>
            {OFFSETS.map((o) => {
              const active = hasReminder(sessionId, o.value);
              return (
                <button
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 text-sm font-mono
                    transition-colors hover:bg-muted/20
                    ${active ? "text-primary" : "text-foreground"}
                  `}
                >
                  <span>{o.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              );
            })}

            {permission === "denied" && (
              <div className="px-3 py-2 border-t border-border/40 bg-destructive/5">
                <p className="text-[10px] font-mono text-destructive">
                  Notifications are blocked. Enable them in your browser settings.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash message */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-1.5 right-0 z-50 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground shadow-lg whitespace-nowrap"
          >
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
