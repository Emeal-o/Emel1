import { useState, useEffect } from "react";
import { RaceData, findNextSession } from "../data/calendar";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Countdown({ races }: { races: RaceData[] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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
  const sessionTime = new Date(nextSession.time);
  const diff = Math.max(0, sessionTime.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const sessionLabel: Record<string, string> = {
    P1: "Practice 1", P2: "Practice 2", P3: "Practice 3",
    SQ: "Sprint Qualifying", SP: "Sprint Race",
    Q: "Qualifying", R: "Race",
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between border border-border bg-card rounded-xl shadow-lg relative overflow-hidden gap-4 p-4 sm:p-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      {/* Race info */}
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
          <span className="truncate">{sessionLabel[nextSession.name] ?? nextSession.name}</span>
          <span className="text-border shrink-0">·</span>
          <span className="truncate">{nextRace.circuit}</span>
        </div>
      </div>

      {/* Countdown digits — responsive row that always fits */}
      <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-3 z-10 w-full md:w-auto">
        <TimeUnit value={pad(days)} label="Days" />
        <Colon />
        <TimeUnit value={pad(hours)} label="Hrs" />
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
