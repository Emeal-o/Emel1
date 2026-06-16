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
    <div className="w-full flex flex-col gap-3 border border-primary/60 bg-primary/5 rounded-xl p-4 sm:p-6 relative overflow-hidden shadow-[0_0_40px_rgba(232,0,45,0.14)]">
      <motion.div
        className="absolute top-0 left-0 h-[3px] bg-primary"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex items-start justify-between gap-4 flex-wrap z-10">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Session Live Now</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">{live.race.flag}</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase leading-tight truncate">
              {live.race.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs flex-wrap">
            <span className="text-foreground font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              {live.session.name}
            </span>
            <span>{SESSION_LABEL[live.session.name] ?? live.session.name}</span>
            <span className="text-border">·</span>
            <span className="text-muted-foreground/70">{live.race.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-mono font-bold text-foreground tabular-nums">
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
              className="text-xl sm:text-2xl font-mono font-bold text-primary tabular-nums"
            >
              {pad(rem_m)}:{pad(rem_s)}
            </motion.span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Remaining</span>
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-border/50 overflow-hidden z-10">
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
      <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-center min-h-[100px]">
        <h2 className="text-2xl font-bold tracking-tight uppercase">Season Complete</h2>
      </div>
    );
  }

  const { race: nextRace, session: nextSession } = next;
  const diff = Math.max(0, new Date(nextSession.time).getTime() - now.getTime());
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const isRaceDay = days === 0;

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between border border-border bg-card rounded-xl shadow-md relative overflow-hidden gap-3 sm:gap-6 p-4 sm:p-5">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/4 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex items-center gap-3 sm:gap-4 z-10 min-w-0">
        {/* Big flag */}
        <span className="text-4xl sm:text-5xl leading-none shrink-0">{nextRace.flag}</span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-primary font-bold tracking-widest text-[10px] uppercase">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Next Session</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-foreground leading-tight truncate" data-testid="countdown-race-name">
            {nextRace.name}
          </h2>
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px] flex-wrap">
            <span className={`font-bold px-1.5 py-0.5 rounded border shrink-0 ${
              nextSession.name === "R"
                ? "text-primary bg-primary/10 border-primary/20"
                : nextSession.name === "Q" || nextSession.name === "SQ"
                  ? "text-foreground bg-muted/50 border-border"
                  : "text-muted-foreground bg-muted/30 border-muted-foreground/20"
            }`}>
              {nextSession.name}
            </span>
            <span>{SESSION_LABEL[nextSession.name] ?? nextSession.name}</span>
            <span className="text-border/70">·</span>
            <span className="text-muted-foreground/70 truncate">{nextRace.city}</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className={`flex items-center justify-between sm:justify-end gap-1 sm:gap-2 z-10 shrink-0 ${isRaceDay ? "text-primary" : ""}`}>
        <TimeUnit value={pad(days)}    label="Days"    highlight={isRaceDay} />
        <Colon />
        <TimeUnit value={pad(hours)}   label="Hrs"     highlight={isRaceDay} />
        <Colon />
        <TimeUnit value={pad(minutes)} label="Min"     highlight={isRaceDay} />
        <Colon />
        <TimeUnit value={pad(seconds)} label="Sec"     highlight />
      </div>
    </div>
  );
}

function Colon() {
  return <span className="text-lg sm:text-2xl font-bold text-muted-foreground/60 pb-4 sm:pb-5 shrink-0">:</span>;
}

function TimeUnit({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-0 flex-1 sm:flex-none sm:min-w-[52px]" data-testid={`countdown-${label.toLowerCase()}`}>
      <motion.div
        key={value}
        initial={{ y: 4, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-2xl sm:text-4xl font-mono font-black tracking-tighter tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </motion.div>
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{label}</span>
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
