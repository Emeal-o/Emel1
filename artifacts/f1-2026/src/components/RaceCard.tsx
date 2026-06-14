import { useState } from "react";
import { RaceData } from "../data/calendar";
import { RaceResultSet } from "../hooks/useF1Results";
import { ChevronDown, ChevronUp, MapPin, Zap, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RaceResults from "./RaceResults";

export default function RaceCard({
  race,
  isNext,
  results,
}: {
  race: RaceData;
  isNext?: boolean;
  results?: RaceResultSet;
}) {
  const [expanded, setExpanded] = useState(isNext);
  const [activeInner, setActiveInner] = useState<"sessions" | "results">("sessions");
  const isPast = race.status === "completed";
  const hasResults = isPast && !!results;

  const TZ = "Asia/Riyadh";

  const getSessionColor = (name: string) => {
    switch (name) {
      case "P1": case "P2": case "P3":
        return "text-muted-foreground bg-muted/30 border-muted-foreground/20";
      case "Q": case "SQ":
        return "text-foreground bg-secondary border-border";
      case "SP":
        return "text-[hsl(45_90%_55%)] bg-[hsl(45_90%_50%/0.1)] border-[hsl(45_90%_50%/0.2)]";
      case "R":
        return "text-primary bg-primary/10 border-primary/20";
      default:
        return "text-foreground bg-muted border-border";
    }
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TZ }).format(new Date(dateStr));

  const formatTime = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).format(new Date(dateStr)) + " UTC+3";

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isPast ? 0.55 : 1 }}
      data-testid={`card-race-${race.round}`}
      className={`
        relative border rounded-xl overflow-hidden transition-all duration-300
        ${isNext ? "border-primary ring-1 ring-primary shadow-[0_0_20px_rgba(232,0,45,0.15)] bg-card/80" : "border-border bg-card/40"}
        ${isPast ? "hover:opacity-90 grayscale-[0.2]" : "hover:border-muted-foreground/50"}
      `}
    >
      {isNext && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-red-500 to-primary" />
      )}

      {/* Card header row */}
      <button
        data-testid={`button-expand-${race.round}`}
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-center justify-between group focus:outline-none"
      >
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded bg-muted/50 border border-border/50 shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rnd</span>
            <span className={`text-lg font-mono font-bold leading-none ${isNext ? "text-primary" : "text-foreground"}`}>
              {race.round.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{race.flag}</span>
              <h3 className="text-lg font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                {race.name}
              </h3>
              {race.isSprint && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[hsl(45_90%_50%/0.1)] text-[hsl(45_90%_55%)] border border-[hsl(45_90%_50%/0.25)] ml-1">
                  <Zap className="w-3 h-3" /> Sprint
                </span>
              )}
              {isNext && (
                <span className="flex sm:hidden items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                  Next
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {race.weekend}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 truncate max-w-[220px]">
                <MapPin className="w-3.5 h-3.5" /> {race.circuit}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hasResults && !expanded && (
            <span className="hidden md:inline text-xs font-mono text-muted-foreground">
              P1 {results.results[0]?.code} · P2 {results.results[1]?.code} · P3 {results.results[2]?.code}
            </span>
          )}
          {isNext && (
            <span className="hidden md:inline-flex px-3 py-1 rounded bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest border border-primary/20">
              Next Race
            </span>
          )}
          {isPast && (
            <span className="hidden md:inline-flex px-3 py-1 rounded bg-muted/50 text-muted-foreground font-bold text-xs uppercase tracking-widest border border-border/30">
              Completed
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
            : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/50 bg-black/20"
          >
            {/* Inner tabs for completed races that have results */}
            {hasResults && (
              <div className="flex gap-0 border-b border-border/50">
                {(["sessions", "results"] as const).map((tab) => (
                  <button
                    key={tab}
                    data-testid={`inner-tab-${race.round}-${tab}`}
                    onClick={() => setActiveInner(tab)}
                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px
                      ${activeInner === tab
                        ? "text-foreground border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground/70"
                      }`}
                  >
                    {tab === "sessions" ? "Sessions" : "Race Results"}
                  </button>
                ))}
              </div>
            )}

            <div className="p-5">
              {(!hasResults || activeInner === "sessions") && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {race.sessions.map((session) => (
                    <div
                      key={session.id}
                      data-testid={`session-${race.round}-${session.name}`}
                      className={`flex flex-col p-3 rounded-lg border ${getSessionColor(session.name)}`}
                    >
                      <span className="text-sm font-black tracking-widest">{session.name}</span>
                      <div className="mt-2 flex flex-col gap-0.5">
                        <span className="text-xs font-mono opacity-80">{formatDate(session.time)}</span>
                        <span className="text-base font-mono font-bold">{formatTime(session.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasResults && activeInner === "results" && (
                <RaceResults results={results.results} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
