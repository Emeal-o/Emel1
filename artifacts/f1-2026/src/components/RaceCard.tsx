import { useState } from "react";
import { RaceData } from "../data/calendar";
import { RaceResultSet } from "../hooks/useF1Results";
import { QualifyingSet } from "../hooks/useF1Qualifying";
import { ChevronDown, ChevronUp, MapPin, Zap, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RaceResults from "./RaceResults";
import QualifyingResults from "./QualifyingResults";
import CircuitInfo from "./CircuitInfo";

type InnerTab = "circuit" | "sessions" | "qualifying" | "results";

export default function RaceCard({
  race,
  isNext,
  results,
  qualifying,
}: {
  race: RaceData;
  isNext?: boolean;
  results?: RaceResultSet;
  qualifying?: QualifyingSet;
}) {
  const [expanded, setExpanded] = useState(isNext);
  const [activeInner, setActiveInner] = useState<InnerTab>("circuit");
  const isPast = race.status === "completed";
  const hasResults = isPast && !!results;
  const hasQualifying = isPast && !!qualifying;

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

  const innerTabs: { id: InnerTab; label: string }[] = [
    { id: "circuit",   label: "Circuit"      },
    { id: "sessions",  label: "Sessions"     },
    ...(hasQualifying ? [{ id: "qualifying" as InnerTab, label: "Qualifying" }] : []),
    ...(hasResults    ? [{ id: "results"    as InnerTab, label: "Race"       }] : []),
  ];

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

      {/* Card header */}
      <button
        data-testid={`button-expand-${race.round}`}
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 sm:p-5 flex items-center justify-between group focus:outline-none"
      >
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex flex-col items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded bg-muted/50 border border-border/50 shrink-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rnd</span>
            <span className={`text-base sm:text-lg font-mono font-bold leading-none ${isNext ? "text-primary" : "text-foreground"}`}>
              {race.round.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg sm:text-xl">{race.flag}</span>
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide group-hover:text-primary transition-colors truncate">
                {race.name}
              </h3>
              {race.isSprint && (
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[hsl(45_90%_50%/0.1)] text-[hsl(45_90%_55%)] border border-[hsl(45_90%_50%/0.25)] shrink-0">
                  <Zap className="w-3 h-3" /> Sprint
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 shrink-0" /> {race.weekend}
              </span>
              <span className="hidden sm:flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3 h-3 shrink-0" /> {race.circuit}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasResults && !expanded && (
            <span className="hidden md:inline text-xs font-mono text-muted-foreground">
              P1 {results.results[0]?.code} · P2 {results.results[1]?.code} · P3 {results.results[2]?.code}
            </span>
          )}
          {isPast && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-muted/50 text-muted-foreground font-bold text-[10px] uppercase tracking-widest border border-border/30">
              Completed
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
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
            {/* Inner tabs */}
            <div className="flex gap-0 border-b border-border/50 overflow-x-auto scrollbar-none">
              {innerTabs.map((tab) => (
                <button
                  key={tab.id}
                  data-testid={`inner-tab-${race.round}-${tab.id}`}
                  onClick={() => setActiveInner(tab.id)}
                  className={`px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0
                    ${activeInner === tab.id
                      ? "text-foreground border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground/70"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-3 sm:p-5">
              {activeInner === "circuit" && (
                <CircuitInfo circuitName={race.circuit} />
              )}

              {activeInner === "sessions" && (
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
                        <span className="text-sm sm:text-base font-mono font-bold">{formatTime(session.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasQualifying && activeInner === "qualifying" && (
                <QualifyingResults results={qualifying.results} />
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
