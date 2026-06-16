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
      case "Q":
        return "text-foreground bg-secondary border-border";
      case "SQ": case "SP":
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

  const p1 = results?.results[0];
  const p2 = results?.results[1];
  const p3 = results?.results[2];

  return (
    <motion.div
      initial={false}
      animate={{ opacity: isPast ? 0.78 : 1 }}
      data-testid={`card-race-${race.round}`}
      className={`
        relative border rounded-xl overflow-hidden transition-all duration-300
        ${isNext ? "border-primary ring-1 ring-primary shadow-[0_0_24px_rgba(232,0,45,0.18)] bg-card/90" : "border-border bg-card/40"}
        ${isPast ? "hover:opacity-95" : "hover:border-muted-foreground/50"}
      `}
    >
      {isNext && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      )}

      {/* Card header */}
      <button
        data-testid={`button-expand-${race.round}`}
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 sm:p-5 flex items-center justify-between group focus:outline-none"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          {/* Round badge */}
          <div className={`flex flex-col items-center justify-center w-9 sm:w-11 h-9 sm:h-11 rounded-lg shrink-0 ${isNext ? "bg-primary/15 border border-primary/40" : "bg-muted/40 border border-border/50"}`}>
            <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Rnd</span>
            <span className={`text-sm sm:text-base font-mono font-black leading-tight mt-0.5 ${isNext ? "text-primary" : "text-foreground"}`}>
              {race.round.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl leading-none">{race.flag}</span>
              <h3 className={`text-sm sm:text-base font-black uppercase tracking-wide group-hover:text-primary transition-colors truncate ${isNext ? "text-primary" : ""}`}>
                {race.name}
              </h3>
              {race.isSprint && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[hsl(45_90%_50%/0.12)] text-[hsl(45_90%_55%)] border border-[hsl(45_90%_50%/0.3)] shrink-0">
                  <Zap className="w-2.5 h-2.5" /> Sprint
                </span>
              )}
              {isNext && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold text-[10px] uppercase tracking-widest border border-primary/30 shrink-0">
                  Next
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground font-mono flex-wrap">
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3 shrink-0" /> {race.weekend}
              </span>
              <span className="hidden sm:flex items-center gap-1 truncate max-w-[180px]">
                <MapPin className="w-3 h-3 shrink-0" /> {race.city}
              </span>
            </div>

            {/* Podium summary on collapsed past race */}
            {isPast && hasResults && !expanded && p1 && (
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground/70">P1</span>
                <span className="text-[10px] font-black uppercase tracking-wide text-foreground">{p1.code}</span>
                {p2 && <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-[10px] font-mono text-muted-foreground/50">P2</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{p2.code}</span>
                </>}
                {p3 && <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-[10px] font-mono text-muted-foreground/50">P3</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{p3.code}</span>
                </>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
          {isPast && !expanded && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-muted/40 text-muted-foreground/70 font-bold text-[9px] uppercase tracking-widest border border-border/30">
              Done
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/40 bg-black/15"
          >
            {/* Inner tabs */}
            <div className="flex gap-0 border-b border-border/40 overflow-x-auto scrollbar-none">
              {innerTabs.map((tab) => (
                <button
                  key={tab.id}
                  data-testid={`inner-tab-${race.round}-${tab.id}`}
                  onClick={() => setActiveInner(tab.id)}
                  className={`px-3 sm:px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0
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
                  {race.sessions.map((session, idx) => {
                    const isLastOdd =
                      idx === race.sessions.length - 1 && race.sessions.length % 2 === 1;
                    return (
                      <div
                        key={session.id}
                        data-testid={`session-${race.round}-${session.name}`}
                        className={`flex flex-col p-3 rounded-lg border ${getSessionColor(session.name)} ${isLastOdd ? "col-span-2 sm:col-span-1" : ""}`}
                      >
                        <span className="text-sm font-black tracking-widest">{session.name}</span>
                        <div className="mt-2 flex flex-col gap-0.5">
                          <span className="text-xs font-mono opacity-80">{formatDate(session.time)}</span>
                          <span className="text-sm sm:text-base font-mono font-bold">{formatTime(session.time)}</span>
                        </div>
                      </div>
                    );
                  })}
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
