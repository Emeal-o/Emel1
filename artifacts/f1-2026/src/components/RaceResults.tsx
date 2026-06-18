import { RaceResult } from "../hooks/useF1Results";
import { motion } from "framer-motion";

const TEAM_COLORS: Record<string, string> = {
  mercedes:    "#00D2BE",
  ferrari:     "#DC0000",
  mclaren:     "#FF8000",
  red_bull:    "#3671C6",
  alpine:      "#FF87BC",
  aston_martin:"#358C75",
  williams:    "#64C4FF",
  haas:        "#B6BABD",
  kick_sauber: "#52E252",
  rb:          "#6692FF",
  sauber:      "#52E252",
};

function getTeamColor(teamId: string): string {
  return TEAM_COLORS[teamId] ?? "#888";
}

const PODIUM_MEDALS = ["🥇", "🥈", "🥉"];
const FL_COLOR = "hsl(275 70% 68%)";

/** Returns delta (grid − finish), or null for pit-lane/no-grid-data starts */
function getDelta(grid: number, position: number): number | null {
  if (grid <= 0) return null; // 0 = pit-lane start or no data
  return grid - position;
}

function DeltaBadge({ grid, position }: { grid: number; position: number }) {
  const delta = getDelta(grid, position);

  if (delta === null) {
    return (
      <span className="text-[10px] font-mono text-muted-foreground/60 text-right">PL</span>
    );
  }
  if (delta === 0) {
    return (
      <span className="text-[10px] font-mono text-muted-foreground text-right">—</span>
    );
  }
  const gained = delta > 0;
  return (
    <span
      className={`text-[10px] font-mono font-bold text-right tabular-nums ${
        gained ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {gained ? `▲${delta}` : `▼${Math.abs(delta)}`}
    </span>
  );
}

export default function RaceResults({ results }: { results: RaceResult[] }) {
  if (!results || results.length === 0) return null;

  const podium   = results.slice(0, 3);
  const rest     = results.slice(3);
  const flDriver = results.find((r) => r.fastestLap);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Podium ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-center gap-3 pt-2">
        {[podium[1], podium[0], podium[2]].filter(Boolean).map((driver, visualIdx) => {
          const actualPos = driver.position - 1;
          const color     = getTeamColor(driver.teamId);
          const delta     = getDelta(driver.grid, driver.position);
          return (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visualIdx * 0.1 }}
              className="flex flex-col items-center gap-1.5"
              data-testid={`podium-pos-${driver.position}`}
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
                {/* Fastest lap badge */}
                {driver.fastestLap && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border"
                    style={{ color: FL_COLOR, backgroundColor: `${FL_COLOR}18`, borderColor: `${FL_COLOR}55` }}
                  >
                    FL ⚡
                  </span>
                )}
                {/* Grid delta */}
                {delta !== null && delta !== 0 && (
                  <span className={`text-[10px] font-mono font-bold ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                  </span>
                )}
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

      {/* ── Fastest lap callout ────────────────────────────────── */}
      {flDriver && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg border text-xs font-mono"
          style={{
            backgroundColor: `${FL_COLOR}0d`,
            borderColor:     `${FL_COLOR}40`,
            color:            FL_COLOR,
          }}
        >
          <span className="text-base shrink-0">⚡</span>
          <span>
            <span className="font-black">{flDriver.code}</span>
            <span className="opacity-60 mx-1">·</span>
            Fastest Lap
          </span>
        </div>
      )}

      {/* ── Full grid ──────────────────────────────────────────── */}
      <div className="border border-border/50 rounded-xl overflow-hidden bg-black/20">
        {/* Header */}
        <div className="grid grid-cols-[1.5rem_auto_1fr_2rem_2rem] sm:grid-cols-[2rem_auto_1fr_2.5rem_2.5rem_6rem] gap-x-2 px-3 sm:px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>P</span>
          <span />
          <span>Driver</span>
          <span className="text-right">±</span>
          <span className="text-right">Pts</span>
          <span className="text-right hidden sm:block">Time</span>
        </div>

        {rest.map((driver, i) => {
          const isFl = driver.fastestLap;
          return (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04 + i * 0.018, duration: 0.25 }}
              data-testid={`result-row-${driver.position}`}
              className="grid grid-cols-[1.5rem_auto_1fr_2rem_2rem] sm:grid-cols-[2rem_auto_1fr_2.5rem_2.5rem_6rem] gap-x-2 px-3 sm:px-4 py-2 sm:py-2.5 items-center border-b border-border/20 last:border-0 transition-colors"
              style={isFl ? {
                backgroundColor: `${FL_COLOR}0d`,
                borderLeft: `2px solid ${FL_COLOR}80`,
              } : undefined}
            >
              {/* Position */}
              <span className="text-xs font-mono font-bold text-muted-foreground">{driver.position}</span>

              {/* Team colour bar */}
              <div
                className="w-1 h-5 rounded-full shrink-0"
                style={{ backgroundColor: getTeamColor(driver.teamId) }}
              />

              {/* Driver name + code + FL badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wide truncate">{driver.familyName}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1 py-0.5 rounded border border-border/30 shrink-0 hidden sm:inline">
                  {driver.code}
                </span>
                {isFl && (
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded border shrink-0 hidden sm:inline"
                    style={{ color: FL_COLOR, backgroundColor: `${FL_COLOR}18`, borderColor: `${FL_COLOR}55` }}
                  >
                    FL
                  </span>
                )}
              </div>

              {/* Delta */}
              <DeltaBadge grid={driver.grid} position={driver.position} />

              {/* Points */}
              <span className="text-xs font-mono font-bold text-right">
                {driver.points !== "0"
                  ? driver.points
                  : <span className="text-muted-foreground/50">—</span>}
              </span>

              {/* Time (desktop only) */}
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
