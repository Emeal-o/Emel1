import { QualifyingResult } from "../hooks/useF1Qualifying";
import { motion } from "framer-motion";

const TEAM_COLORS: Record<string, string> = {
  mercedes: "#00D2BE",
  ferrari: "#DC0000",
  mclaren: "#FF8000",
  red_bull: "#3671C6",
  alpine: "#FF87BC",
  aston_martin: "#358C75",
  williams: "#64C4FF",
  haas: "#B6BABD",
  kick_sauber: "#52E252",
  rb: "#6692FF",
  sauber: "#52E252",
};

function getTeamColor(teamId: string): string {
  return TEAM_COLORS[teamId] ?? "#888";
}

function LapTime({ time, best }: { time?: string; best?: string }) {
  if (!time) return <span className="text-muted-foreground/40 font-mono text-sm">—</span>;
  const isFastest = time === best;
  return (
    <span
      className={`font-mono text-sm tabular-nums ${
        isFastest ? "text-[hsl(45_90%_55%)] font-bold" : "text-foreground"
      }`}
    >
      {time}
    </span>
  );
}

export default function QualifyingResults({ results }: { results: QualifyingResult[] }) {
  // Best times per segment
  const bestQ1 = results.map((r) => r.q1).filter(Boolean).sort()[0];
  const bestQ2 = results.map((r) => r.q2).filter(Boolean).sort()[0];
  const bestQ3 = results.map((r) => r.q3).filter(Boolean).sort()[0];

  const q3drivers = results.filter((r) => r.q3);
  const q2drivers = results.filter((r) => r.q2 && !r.q3);
  const q1drivers = results.filter((r) => !r.q2);

  return (
    <div className="flex flex-col gap-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Q3 — Top 10
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary border border-border inline-block" /> Q2 — P11–15
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted inline-block" /> Q1 — P16–20
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[hsl(45_90%_55%)]">⚡</span> Fastest time
        </span>
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden bg-black/20">
        {/* Header */}
        <div className="grid grid-cols-[2rem_auto_1fr_auto_auto_auto] gap-x-3 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>P</span>
          <span></span>
          <span>Driver</span>
          <span className="text-right w-24">Q1</span>
          <span className="text-right w-24">Q2</span>
          <span className="text-right w-24">Q3</span>
        </div>

        {results.map((driver, i) => {
          const color = getTeamColor(driver.teamId);
          const segment = driver.q3 ? "q3" : driver.q2 ? "q2" : "q1";
          const segmentColor =
            segment === "q3"
              ? "border-l-2 border-primary"
              : segment === "q2"
              ? "border-l-2 border-border"
              : "border-l-2 border-muted-foreground/20";

          return (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              data-testid={`quali-row-${driver.position}`}
              className={`
                grid grid-cols-[2rem_auto_1fr_auto_auto_auto] gap-x-3 px-4 py-2.5 items-center
                border-b border-border/20 last:border-0 hover:bg-white/5 transition-colors
                ${segmentColor}
              `}
            >
              <span className="text-sm font-mono font-bold text-muted-foreground">{driver.position}</span>

              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-bold uppercase tracking-wide truncate">
                  {driver.familyName}
                </span>
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline bg-muted/30 px-1.5 py-0.5 rounded border border-border/30">
                  {driver.code}
                </span>
                <span className="text-xs text-muted-foreground font-mono hidden md:inline truncate max-w-[100px]">
                  {driver.team}
                </span>
              </div>

              <div className="text-right w-24">
                <LapTime time={driver.q1} best={bestQ1} />
              </div>
              <div className="text-right w-24">
                <LapTime time={driver.q2} best={bestQ2} />
              </div>
              <div className="text-right w-24">
                <LapTime time={driver.q3} best={bestQ3} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs font-mono text-muted-foreground text-right">
        Q1: {q1drivers.length} eliminated · Q2: {q2drivers.length} eliminated · Q3: {q3drivers.length} progressed
      </p>
    </div>
  );
}
