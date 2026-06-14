import { useState, useEffect } from "react";
import { CALENDAR, SessionInfo, RaceData } from "../data/calendar";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Countdown() {
  // Use June 14, 2026 as our "now" per instructions, unless we want a real clock
  // We'll actually use a real clock, but offset it if we want it to align with instructions.
  // Actually, instructions state "compare dates against today's date: June 14, 2026"
  const getNow = () => new Date("2026-06-14T09:00:00Z"); // Set roughly morning to see countdown to Canada Race

  const [now, setNow] = useState(new Date("2026-06-14T10:00:00"));
  
  // Find the next session
  let nextSession: SessionInfo | null = null;
  let nextRace: RaceData | null = null;

  for (const race of CALENDAR) {
    for (const session of race.sessions) {
      const sessionDate = new Date(session.time);
      if (sessionDate > now) {
        if (!nextSession || sessionDate < new Date(nextSession.time)) {
          nextSession = session;
          nextRace = race;
        }
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      // If we want a running clock from the fixed date:
      setNow(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!nextSession || !nextRace) {
    return (
      <div className="bg-card border-b-2 border-primary/20 p-6 flex flex-col items-center justify-center min-h-[200px]">
        <h2 className="text-2xl font-bold tracking-tight">SEASON COMPLETED</h2>
      </div>
    );
  }

  const sessionTime = new Date(nextSession.time);
  const diff = sessionTime.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between border border-border bg-card p-6 rounded-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="flex flex-col gap-2 z-10 mb-6 md:mb-0">
        <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-sm uppercase">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Next Session</span>
        </div>
        <h2 className="text-3xl font-black uppercase text-foreground leading-tight">
          {nextRace.name}
        </h2>
        <div className="text-muted-foreground font-mono flex items-center gap-2">
          <span className="text-foreground font-bold px-2 py-0.5 rounded bg-muted/50 border border-border/50 text-xs">
            {nextSession.name}
          </span>
          {nextRace.circuit}, {nextRace.city}
        </div>
      </div>

      <div className="flex items-center gap-4 z-10">
        <TimeUnit value={pad(days)} label="Days" />
        <span className="text-3xl font-bold text-muted-foreground pb-6">:</span>
        <TimeUnit value={pad(hours)} label="Hrs" />
        <span className="text-3xl font-bold text-muted-foreground pb-6">:</span>
        <TimeUnit value={pad(minutes)} label="Min" />
        <span className="text-3xl font-bold text-muted-foreground pb-6">:</span>
        <TimeUnit value={pad(seconds)} label="Sec" highlight />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, highlight = false }: { value: string | number, label: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[70px]">
      <motion.div 
        key={value}
        initial={{ y: 5, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter ${highlight ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </motion.div>
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}
