import { useState, useEffect } from "react";
import { RaceData, SessionInfo, findNextSession } from "../data/calendar";
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
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between border border-border bg-card p-6 rounded-xl shadow-lg relative overflow-hidden gap-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-sm uppercase">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Next Session</span>
        </div>
        <h2 className="text-3xl font-black uppercase text-foreground leading-tight" data-testid="countdown-race-name">
          {nextRace.name}
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
          <span className="text-foreground font-bold px-2 py-0.5 rounded bg-muted/50 border border-border/50 text-xs">
            {nextSession.name}
          </span>
          <span>{sessionLabel[nextSession.name] ?? nextSession.name}</span>
          <span className="text-border">·</span>
          <span>{nextRace.circuit}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 z-10">
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
  return <span className="text-3xl font-bold text-muted-foreground pb-6">:</span>;
}

function TimeUnit({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[64px]" data-testid={`countdown-${label.toLowerCase()}`}>
      <motion.div
        key={value}
        initial={{ y: 4, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </motion.div>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}
