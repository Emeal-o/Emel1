import { useState } from "react";
import { RaceData } from "../data/calendar";
import { ChevronDown, ChevronUp, MapPin, Trophy, Zap, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RaceCard({ race, isNext }: { race: RaceData, isNext?: boolean }) {
  const [expanded, setExpanded] = useState(isNext);
  const isPast = race.status === "completed";

  const getSessionColor = (name: string) => {
    switch(name) {
      case "P1":
      case "P2":
      case "P3":
        return "text-muted-foreground bg-muted/30 border-muted-foreground/20";
      case "Q":
      case "SQ":
        return "text-foreground bg-secondary border-border";
      case "SP":
        return "text-sprint bg-sprint/10 border-sprint/20";
      case "R":
        return "text-primary bg-primary/10 border-primary/20";
      default:
        return "text-foreground bg-muted border-border";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  };

  return (
    <motion.div 
      initial={false}
      animate={{ opacity: isPast ? 0.6 : 1 }}
      className={`
        relative border rounded-xl overflow-hidden transition-all duration-300
        ${isNext ? 'border-primary ring-1 ring-primary shadow-[0_0_20px_rgba(255,0,0,0.15)] bg-card/80' : 'border-border bg-card/40'}
        ${isPast ? 'hover:opacity-100 grayscale-[0.3]' : 'hover:border-muted-foreground/50'}
      `}
    >
      {isNext && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-red-500 to-primary" />
      )}
      
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-center justify-between group focus:outline-none"
      >
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded bg-muted/50 border border-border/50 shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rnd</span>
            <span className={`text-lg font-mono font-bold leading-none ${isNext ? 'text-primary' : 'text-foreground'}`}>
              {race.round.toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{race.flag}</span>
              <h3 className="text-lg font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                {race.name}
              </h3>
              {race.isSprint && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sprint/10 text-sprint border border-sprint/20 ml-2">
                  <Zap className="w-3 h-3" /> Sprint
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {race.weekend}</span>
              <span className="hidden sm:flex items-center gap-1.5 truncate max-w-[200px]"><MapPin className="w-3.5 h-3.5" /> {race.circuit}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isNext && (
            <span className="hidden md:inline-flex px-3 py-1 rounded bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest border border-primary/20">
              Next Race
            </span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/50 bg-black/20"
          >
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {race.sessions.map(session => (
                  <div key={session.id} className={`flex flex-col p-3 rounded-lg border ${getSessionColor(session.name)}`}>
                    <span className="text-sm font-black tracking-widest">{session.name}</span>
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="text-xs font-mono opacity-80">{formatDate(session.time)}</span>
                      <span className="text-lg font-mono font-bold">{formatTime(session.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
