import { ConstructorStanding } from "../hooks/useF1Standings";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

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

const TEAM_FLAGS: Record<string, string> = {
  Mercedes: "🇩🇪",
  Ferrari: "🇮🇹",
  McLaren: "🇬🇧",
  "Red Bull": "🇦🇹",
  Alpine: "🇫🇷",
  "Aston Martin": "🇬🇧",
  Williams: "🇬🇧",
  Haas: "🇺🇸",
  Sauber: "🇨🇭",
  RB: "🇮🇹",
};

function getTeamColor(name: string): string {
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (name.includes(key) || key.includes(name)) return color;
  }
  return "#888888";
}

function getTeamFlag(name: string): string {
  for (const [key, flag] of Object.entries(TEAM_FLAGS)) {
    if (name.includes(key) || key.includes(name)) return flag;
  }
  return "🏁";
}

const medals = ["🥇", "🥈", "🥉"];

export default function ConstructorsStandings({ constructors }: { constructors: ConstructorStanding[] }) {
  const maxPoints = parseInt(constructors[0]?.points ?? "1", 10) || 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-[hsl(45_90%_55%)]" />
        <h3 className="text-lg font-black uppercase tracking-widest">Constructors Championship</h3>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card/40">
        {/* Header */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 bg-black/20">
          <span>Pos</span>
          <span>Constructor</span>
          <span className="text-right">Wins</span>
          <span className="text-right w-14">Pts</span>
        </div>

        {constructors.map((c, i) => {
          const color = getTeamColor(c.name);
          const flag = getTeamFlag(c.name);
          const pct = (parseInt(c.points, 10) / maxPoints) * 100;
          const isTop3 = i < 3;

          return (
            <motion.div
              key={c.constructorId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              data-testid={`constructor-row-${c.constructorId}`}
              className={`
                grid grid-cols-[2rem_1fr_auto_auto] gap-4 px-4 pt-3 pb-2 items-center
                border-b border-border/30 last:border-0
                ${i === 0 ? "bg-primary/5" : "hover:bg-muted/10"}
                transition-colors
              `}
            >
              <span className={`text-sm font-mono font-bold ${isTop3 ? "" : "text-muted-foreground"}`}>
                {isTop3 ? medals[i] : c.position}
              </span>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-wide">{flag} {c.name}</span>
                </div>
                {/* Points bar */}
                <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              <span className="text-sm font-mono text-muted-foreground text-right">{c.wins}</span>
              <span className={`text-base font-mono font-bold text-right w-14 ${i === 0 ? "text-primary" : "text-foreground"}`}>
                {c.points}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
