import { useState, useEffect } from "react";
import { RaceData, findNextSession } from "../data/calendar";
import { Clock, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveSessionInfo } from "../hooks/useLiveSession";

function pad(n: number) { return n.toString().padStart(2, "0"); }

const SESSION_LABEL: Record<string, string> = {
  P1: "Practice 1", P2: "Practice 2", P3: "Practice 3",
  SQ: "Sprint Qualifying", SP: "Sprint Race",
  Q: "Qualifying", R: "Race",
};

// ── Live banner ────────────────────────────────────────────────────
function LiveBanner({ live }: { live: LiveSessionInfo }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = now.getTime() - new Date(live.session.time).getTime();
  const remainingMs = Math.max(0, live.totalMs - elapsed);
  const progress = Math.min(1, elapsed / live.totalMs);

  const rem_m = Math.floor(remainingMs / 60_000);
  const rem_s = Math.floor((remainingMs / 1000) % 60);
  const el_m  = Math.floor(elapsed / 60_000);
  const el_s  = Math.floor((elapsed / 1000) % 60);

  return (
    <div className="w-full flex flex-col gap-3 border border-primary/60 bg-primary/5 rounded-xl p-4 sm:p-6 relative overflow-hidden shadow-[0_0_30px_rgba(232,0,45,0.12)]">
      {/* Animated top bar */}
      <motion.div
        className="absolute top-0 left-0 h-1 bg-primary"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Session Live Now</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase leading-tight truncate">
            {live.race.name}
          </h2>
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs flex-wrap">
            <span className="text-foreground font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              {live.session.name}
            </span>
            <span>{SESSION_LABEL[live.session.name] ?? live.session.name}</span>
            <span>·</span>
            <span>{live.race.circuit}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tabular-nums">
              {pad(el_m)}:{pad(el_s)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Elapsed</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <motion.span
              key={rem_s}
              initial={{ opacity: 0.6, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-mono font-bold text-primary tabular-nums"
            >
              {pad(rem_m)}:{pad(rem_s)}
            </motion.span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Remaining</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-border/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ── Countdown banner ───────────────────────────────────────────────
function CountdownBanner({ races }: { races: RaceData[] }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = findNextSession(races, now);
  if (!next) {
    return (
      <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-center min-h-[120px]">
        <h2 className="text-2xl font-bold tracking-tight uppercase">Season Completed</h2>
      </div>
    );
  }

  const { race: nextRace, session: nextSession } = next;
  const diff = Math.max(0, new Date(nextSession.time).getTime() - now.getTime());
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between border border-border bg-card rounded-xl shadow-lg relative overflow-hidden gap-4 p-4 sm:p-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex flex-col gap-1.5 z-10 min-w-0">
        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
          <Clock className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>Next Session</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-foreground leading-tight truncate" data-testid="countdown-race-name">
          {nextRace.name}
        </h2>
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs flex-wrap">
          <span className="text-foreground font-bold px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 shrink-0">
            {nextSession.name}
          </span>
          <span className="truncate">{SESSION_LABEL[nextSession.name] ?? nextSession.name}</span>
          <span className="text-border shrink-0">·</span>
          <span className="truncate">{nextRace.circuit}</span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-3 z-10 w-full md:w-auto">
        <TimeUnit value={pad(days)}    label="Days" />
        <Colon />
        <TimeUnit value={pad(hours)}   label="Hrs" />
        <Colon />
        <TimeUnit value={pad(minutes)} label="Min" />
        <Colon />
        <TimeUnit value={pad(seconds)} label="Sec" highlight />
      </div>
    </div>
  );
}

function Colon() {
  return <span className="text-xl sm:text-3xl font-bold text-muted-foreground pb-4 sm:pb-6 shrink-0">:</span>;
}

function TimeUnit({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-0 flex-1 sm:flex-none sm:min-w-[56px]" data-testid={`countdown-${label.toLowerCase()}`}>
      <motion.div
        key={value}
        initial={{ y: 4, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tighter ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </motion.div>
      <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5 sm:mt-1">{label}</span>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────
export default function Countdown({
  races,
  liveSession,
}: {
  races: RaceData[];
  liveSession: LiveSessionInfo | null;
}) {
  return (
    <AnimatePresence mode="wait">
      {liveSession ? (
        <motion.div key="live" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <LiveBanner live={liveSession} />
        </motion.div>
      ) : (
        <motion.div key="countdown" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <CountdownBanner races={races} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
