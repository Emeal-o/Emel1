import { DriverStanding } from "../hooks/useF1Standings";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

const NATIONALITY_FLAGS: Record<string, string> = {
  Italian: "🇮🇹", British: "🇬🇧", German: "🇩🇪", Spanish: "🇪🇸", Monegasque: "🇲🇨",
  Dutch: "🇳🇱", Australian: "🇦🇺", Mexican: "🇲🇽", Canadian: "🇨🇦", Finnish: "🇫🇮",
  French: "🇫🇷", American: "🇺🇸", Chinese: "🇨🇳", Thai: "🇹🇭", Danish: "🇩🇰",
  Japanese: "🇯🇵", Brazilian: "🇧🇷", Argentine: "🇦🇷", Austrian: "🇦🇹", Swiss: "🇨🇭",
  "New Zealander": "🇳🇿", "South African": "🇿🇦",
};

const TEAM_COLORS: Record<string, string> = {
  Mercedes: "#00D2BE",
  Ferrari: "#DC0000",
  McLaren: "#FF8000",
  "Red Bull": "#3671C6",
  "Alpine F1 Team": "#FF87BC",
  "Aston Martin": "#358C75",
  Williams: "#64C4FF",
  "Haas F1 Team": "#B6BABD",
  "Kick Sauber": "#52E252",
  "RB F1 Team": "#6692FF",
};

function getTeamColor(team: string): string {
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (team.includes(key) || key.includes(team)) return color;
  }
  return "#888888";
}

const podiumColors = ["text-[hsl(45_90%_55%)]", "text-slate-300", "text-orange-600"];

export default function DriversStandings({ drivers, round }: { drivers: DriverStanding[]; round: number }) {
  const maxPts = parseFloat(drivers[0]?.points ?? "1") || 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest">Drivers</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 border border-border px-2 py-1 rounded">
          After Round {round}
        </span>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card/40">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_auto] gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>#</span>
          <span>Driver</span>
          <span className="text-right w-12">Pts</span>
        </div>

        {drivers.map((d, i) => {
          const teamColor = getTeamColor(d.team);
          const isTop3 = i < 3;
          const pts = parseFloat(d.points) || 0;
          const leaderPts = parseFloat(drivers[0]?.points ?? "0") || 0;
          const gap = i === 0 ? null : leaderPts - pts;
          const barPct = (pts / maxPts) * 100;

          return (
            <motion.div
              key={d.driverId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.025 }}
              data-testid={`driver-row-${d.driverId}`}
              className={`
                grid grid-cols-[2rem_1fr_auto] gap-3 px-3 pt-3 pb-2 items-start
                border-b border-border/25 last:border-0
                ${i === 0 ? "bg-primary/5" : "hover:bg-muted/10"}
                transition-colors
              `}
            >
              {/* Position */}
              <div className="flex flex-col items-center pt-0.5">
                <span className={`text-xs font-mono font-black ${isTop3 ? podiumColors[i] : "text-muted-foreground"}`}>
                  {isTop3 ? ["1", "2", "3"][i] : d.position}
                </span>
              </div>

              {/* Driver info + bar */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-[3px] h-7 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wide truncate">
                        {NATIONALITY_FLAGS[d.nationality] ?? ""} {d.familyName}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground bg-muted/40 px-1 py-0.5 rounded border border-border/40 shrink-0">
                        {d.code}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono truncate leading-tight">{d.team}</span>
                  </div>
                </div>

                {/* Points progress bar */}
                <div className="h-[3px] rounded-full bg-muted/30 overflow-hidden ml-[7px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.55, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: teamColor }}
                  />
                </div>

                {/* Gap to leader */}
                {gap !== null && (
                  <span className="text-[9px] font-mono text-muted-foreground/60 ml-[7px]">
                    −{gap} pts
                  </span>
                )}
              </div>

              {/* Points */}
              <div className="flex flex-col items-end pt-0.5 w-12">
                <span className={`text-sm font-mono font-black ${i === 0 ? "text-primary" : "text-foreground"}`}>
                  {d.points}
                </span>
                {parseInt(d.wins as unknown as string) > 0 && (
                  <span className="text-[9px] font-mono text-muted-foreground/60">{d.wins}W</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
