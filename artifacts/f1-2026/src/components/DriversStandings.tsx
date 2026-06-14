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

const medals = ["🥇", "🥈", "🥉"];

export default function DriversStandings({ drivers, round }: { drivers: DriverStanding[]; round: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-black uppercase tracking-widest">Drivers Championship</h3>
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted/40 border border-border px-2 py-1 rounded">
          After Round {round}
        </span>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card/40">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>Pos</span>
          <span>Driver</span>
          <span className="text-right">Wins</span>
          <span className="text-right w-14">Pts</span>
        </div>

        {drivers.map((d, i) => {
          const teamColor = getTeamColor(d.team);
          const isTop3 = i < 3;
          return (
            <motion.div
              key={d.driverId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              data-testid={`driver-row-${d.driverId}`}
              className={`
                grid grid-cols-[2rem_1fr_auto_auto] gap-4 px-4 py-3 items-center
                border-b border-border/30 last:border-0
                ${i === 0 ? "bg-primary/5" : "hover:bg-muted/10"}
                transition-colors
              `}
            >
              <span className={`text-sm font-mono font-bold ${isTop3 ? "" : "text-muted-foreground"}`}>
                {isTop3 ? medals[i] : d.position}
              </span>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-wide truncate">
                      {NATIONALITY_FLAGS[d.nationality] ?? ""} {d.familyName}
                    </span>
                    <span className="hidden sm:inline text-xs font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
                      {d.code}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono truncate">{d.team}</span>
                </div>
              </div>

              <span className="text-sm font-mono text-muted-foreground text-right">{d.wins}</span>
              <span className={`text-base font-mono font-bold text-right w-14 ${i === 0 ? "text-primary" : "text-foreground"}`}>
                {d.points}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
