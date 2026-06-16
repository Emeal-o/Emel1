import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows } from "lucide-react";
import { DriverStanding } from "../hooks/useF1Standings";
import { RaceResultSet } from "../hooks/useF1Results";

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

type Props = {
  drivers: DriverStanding[];
  byRound?: Map<number, RaceResultSet> | null;
};

export default function DriverComparison({ drivers, byRound }: Props) {
  const [idA, setIdA] = useState<string>(drivers[0]?.driverId ?? "");
  const [idB, setIdB] = useState<string>(drivers[1]?.driverId ?? "");

  const dA = drivers.find((d) => d.driverId === idA) ?? drivers[0];
  const dB = drivers.find((d) => d.driverId === idB) ?? drivers[1];

  const podiums = useMemo(() => {
    const counts: Record<string, number> = {};
    if (byRound) {
      for (const set of byRound.values()) {
        for (const r of set.results) {
          if (r.position <= 3) {
            counts[r.driverId] = (counts[r.driverId] ?? 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [byRound]);

  if (!dA || !dB) return null;

  const ptsA = parseFloat(dA.points) || 0;
  const ptsB = parseFloat(dB.points) || 0;
  const winsA = parseInt(dA.wins as unknown as string) || 0;
  const winsB = parseInt(dB.wins as unknown as string) || 0;
  const podA = podiums[dA.driverId] ?? 0;
  const podB = podiums[dB.driverId] ?? 0;
  const maxPts = Math.max(ptsA, ptsB, 1);

  const colorA = getTeamColor(dA.team);
  const colorB = getTeamColor(dB.team);

  return (
    <div className="flex flex-col gap-4 border border-border rounded-xl bg-card/40 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitCompareArrows className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-black uppercase tracking-widest">Head-to-Head</h3>
      </div>

      {/* Driver selectors */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { d: dA, id: idA, set: setIdA, exclude: idB, color: colorA },
          { d: dB, id: idB, set: setIdB, exclude: idA, color: colorB },
        ].map(({ d, set, exclude, color }, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black uppercase tracking-wide truncate">
                  {NATIONALITY_FLAGS[d.nationality] ?? ""} {d.familyName}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground truncate">{d.team}</span>
              </div>
            </div>
            <select
              value={d.driverId}
              onChange={(e) => set(e.target.value)}
              className="w-full bg-background border border-border rounded-lg text-xs font-mono px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {drivers.map((dr) => (
                <option key={dr.driverId} value={dr.driverId} disabled={dr.driverId === exclude}>
                  P{dr.position} {dr.familyName}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Stats comparison */}
      <div className="flex flex-col gap-3">
        <StatRow
          label="Points"
          valA={ptsA}
          valB={ptsB}
          maxVal={maxPts}
          colorA={colorA}
          colorB={colorB}
          formatVal={(v) => v.toString()}
          sub={ptsA !== ptsB ? `${Math.abs(ptsA - ptsB)} pt gap` : "Level on points"}
        />
        <StatRow
          label="Wins"
          valA={winsA}
          valB={winsB}
          maxVal={Math.max(winsA, winsB, 1)}
          colorA={colorA}
          colorB={colorB}
          formatVal={(v) => v.toString()}
        />
        {(podA > 0 || podB > 0) && (
          <StatRow
            label="Podiums"
            valA={podA}
            valB={podB}
            maxVal={Math.max(podA, podB, 1)}
            colorA={colorA}
            colorB={colorB}
            formatVal={(v) => v.toString()}
          />
        )}
      </div>
    </div>
  );
}

function StatRow({
  label,
  valA,
  valB,
  maxVal,
  colorA,
  colorB,
  formatVal,
  sub,
}: {
  label: string;
  valA: number;
  valB: number;
  maxVal: number;
  colorA: string;
  colorB: string;
  formatVal: (v: number) => string;
  sub?: string;
}) {
  const pctA = (valA / maxVal) * 100;
  const pctB = (valB / maxVal) * 100;
  const aWins = valA > valB;
  const bWins = valB > valA;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span className={aWins ? "text-foreground" : ""}>{formatVal(valA)}</span>
        <span>{label}</span>
        <span className={bWins ? "text-foreground" : ""}>{formatVal(valB)}</span>
      </div>
      {/* Dual bar */}
      <div className="flex gap-1 items-center h-2">
        {/* A bar — right-aligned */}
        <div className="flex-1 flex justify-end">
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full float-right"
              style={{ backgroundColor: colorA }}
            />
          </div>
        </div>
        {/* B bar — left-aligned */}
        <div className="flex-1">
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: colorB }}
            />
          </div>
        </div>
      </div>
      {sub && (
        <p className="text-center text-[9px] font-mono text-muted-foreground/60">{sub}</p>
      )}
    </div>
  );
}
