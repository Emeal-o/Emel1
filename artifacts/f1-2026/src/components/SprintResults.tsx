import { RaceResult } from "../hooks/useF1Results";
import { motion } from "framer-motion";

const TEAM_COLORS: Record<string, string> = {
  mercedes:     "#00D2BE",
  ferrari:      "#DC0000",
  mclaren:      "#FF8000",
  red_bull:     "#3671C6",
  alpine:       "#FF87BC",
  aston_martin: "#358C75",
  williams:     "#64C4FF",
  haas:         "#B6BABD",
  kick_sauber:  "#52E252",
  rb:           "#6692FF",
  sauber:       "#52E252",
};

function getTeamColor(teamId: string): string {
  return TEAM_COLORS[teamId] ?? "#888";
}

const PODIUM_MEDALS = ["🥇", "🥈", "🥉"];

export default function SprintResults({ results }: { results: RaceResult[] }) {
  if (!results || results.length === 0) return null;

  const podium = results.slice(0, 3);
  const rest   = results.slice(3);

  return (
    <div className="flex flex-col gap-5">

      {/* Sprint context banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(45_90%_50%/0.3)] bg-[hsl(45_90%_50%/0.06)] text-[hsl(45_90%_60%)] text-[11px] font-mono">
        <span className="text-base shrink-0">⚡</span>
        <span>Sprint race — top 8 score points (8-7-6-5-4-3-2-1)</span>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 pt-2">
        {[podium[1], podium[0], podium[2]].filter(Boolean).map((driver, visualIdx) => {
          const actualPos = driver.position - 1;
          const color     = getTeamColor(driver.teamId);
          return (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visualIdx * 0.1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{PODIUM_MEDALS[actualPos]}</span>
                <div
                  className="w-2 rounded-full"
                  style={{
                    height: driver.position === 1 ? "28px" : driver.position === 2 ? "20px" : "14px",
                    backgroundColor: color,
                  }}
                />
                <span className="font-black text-sm uppercase tracking-wider" style={{ color }}>
                  {driver.code}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[76px] text-center leading-tight">
                  {driver.team}
                </span>
                {driver.time && (
                  <span className="text-[10px] font-mono text-muted-foreground">{driver.time}</span>
                )}
              </div>
              <div
                className="w-20 sm:w-24 rounded-t-lg flex items-center justify-center"
                style={{
                  height: driver.position === 1 ? "88px" : driver.position === 2 ? "60px" : "44px",
                  backgroundColor: `${color}18`,
                  border: `1px solid ${color}40`,
                }}
              >
                <span className="text-2xl font-black" style={{ color }}>{driver.position}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full grid */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-black/20">
        <div className="grid grid-cols-[1.5rem_auto_1fr_2rem_2rem] sm:grid-cols-[2rem_auto_1fr_2.5rem_2.5rem_6rem] gap-x-2 px-3 sm:px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>P</span>
          <span />
          <span>Driver</span>
          <span />
          <span className="text-right">Pts</span>
          <span className="text-right hidden sm:block">Time</span>
        </div>

        {rest.map((driver, i) => {
          const scoredPts = parseFloat(driver.points) > 0;
          return (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04 + i * 0.018, duration: 0.25 }}
              className={`grid grid-cols-[1.5rem_auto_1fr_2rem_2rem] sm:grid-cols-[2rem_auto_1fr_2.5rem_2.5rem_6rem] gap-x-2 px-3 sm:px-4 py-2 sm:py-2.5 items-center border-b border-border/20 last:border-0 transition-colors ${
                scoredPts ? "bg-[hsl(45_90%_50%/0.04)]" : ""
              }`}
            >
              <span className="text-xs font-mono font-bold text-muted-foreground">{driver.position}</span>
              <div
                className="w-1 h-5 rounded-full shrink-0"
                style={{ backgroundColor: getTeamColor(driver.teamId) }}
              />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wide truncate">{driver.familyName}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1 py-0.5 rounded border border-border/30 shrink-0 hidden sm:inline">
                  {driver.code}
                </span>
              </div>
              <span />
              <span className="text-xs font-mono font-bold text-right">
                {scoredPts
                  ? <span className="text-[hsl(45_90%_60%)]">{driver.points}</span>
                  : <span className="text-muted-foreground/50">—</span>}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground text-right hidden sm:block truncate">
                {driver.time ?? "—"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
