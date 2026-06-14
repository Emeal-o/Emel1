import { RaceResult } from "../hooks/useF1Results";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

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

const PODIUM_HEIGHTS = ["h-24", "h-16", "h-12"];
const PODIUM_MEDALS = ["🥇", "🥈", "🥉"];

export default function RaceResults({ results }: { results: RaceResult[] }) {
  const podium = results.slice(0, 3);
  const rest = results.slice(3);

  return (
    <div className="flex flex-col gap-6">
      {/* Podium */}
      <div className="flex items-end justify-center gap-3 pt-4">
        {[podium[1], podium[0], podium[2]].filter(Boolean).map((driver, visualIdx) => {
          const actualPos = driver.position - 1;
          const color = getTeamColor(driver.teamId);
          const isWinner = driver.position === 1;
          return (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visualIdx * 0.1 }}
              className="flex flex-col items-center gap-2"
              data-testid={`podium-pos-${driver.position}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{PODIUM_MEDALS[actualPos]}</span>
                <div
                  className={`w-2 rounded-full`}
                  style={{ height: isWinner ? "28px" : driver.position === 2 ? "20px" : "14px", backgroundColor: color }}
                />
                <span className="font-black text-sm uppercase tracking-wider" style={{ color }}>
                  {driver.code}
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[80px] text-center">
                  {driver.team}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{driver.time}</span>
              </div>
              <div
                className={`w-24 rounded-t-lg flex items-center justify-center ${PODIUM_HEIGHTS[actualPos]}`}
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
              >
                <span className="text-2xl font-black" style={{ color }}>{driver.position}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full grid */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-black/20">
        <div className="grid grid-cols-[1.5rem_auto_1fr_auto] sm:grid-cols-[2rem_auto_1fr_auto_auto] gap-x-2 sm:gap-x-3 px-3 sm:px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>P</span>
          <span></span>
          <span>Driver</span>
          <span className="text-right">Pts</span>
          <span className="text-right hidden sm:block w-24">Time / Status</span>
        </div>
        {rest.map((driver, i) => (
          <motion.div
            key={driver.driverId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.02 }}
            data-testid={`result-row-${driver.position}`}
            className="grid grid-cols-[1.5rem_auto_1fr_auto] sm:grid-cols-[2rem_auto_1fr_auto_auto] gap-x-2 sm:gap-x-3 px-3 sm:px-4 py-2 sm:py-2.5 items-center border-b border-border/20 last:border-0 hover:bg-white/5 transition-colors"
          >
            <span className="text-xs sm:text-sm font-mono font-bold text-muted-foreground">{driver.position}</span>
            <div
              className="w-1 h-5 sm:h-6 rounded-full shrink-0"
              style={{ backgroundColor: getTeamColor(driver.teamId) }}
            />
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide truncate">{driver.familyName}</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1 sm:px-1.5 py-0.5 rounded border border-border/30 shrink-0">
                {driver.code}
              </span>
              {driver.fastestLap && (
                <span title="Fastest Lap" className="shrink-0">
                  <Zap className="w-3 h-3 text-[hsl(45_90%_55%)]" />
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-right">
              {driver.points !== "0" ? driver.points : <span className="text-muted-foreground">—</span>}
            </span>
            <span className="text-xs font-mono text-muted-foreground text-right hidden sm:block w-24 truncate">
              {driver.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
