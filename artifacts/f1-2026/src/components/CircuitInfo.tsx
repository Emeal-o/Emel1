import { CIRCUIT_STATS } from "../data/circuits";
import { Timer, Gauge, Map, Zap, CornerDownRight } from "lucide-react";

export default function CircuitInfo({ circuitName }: { circuitName: string }) {
  const stats = CIRCUIT_STATS[circuitName];
  if (!stats) return (
    <div className="flex items-center justify-center h-24 text-muted-foreground font-mono text-sm border border-dashed border-border/50 rounded-xl">
      Circuit data not available
    </div>
  );

  const totalDistance = (stats.length * stats.laps).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Main stats: 2×2 + last spans full on mobile, 5-col on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        <StatCard icon={<Map className="w-3.5 h-3.5" />}           label="Length"    value={`${stats.length} km`} />
        <StatCard icon={<Gauge className="w-3.5 h-3.5" />}         label="Laps"      value={stats.laps.toString()} sub={`${totalDistance} km`} />
        <StatCard icon={<CornerDownRight className="w-3.5 h-3.5" />} label="Turns"   value={stats.turns.toString()} />
        <StatCard icon={<Zap className="w-3.5 h-3.5" />}           label="DRS"       value={stats.drsZones.toString()} sub="zones" />
        <StatCard
          icon={<Timer className="w-3.5 h-3.5" />}
          label="First GP"
          value={stats.firstGP.toString()}
          highlight={stats.firstGP === 2026}
          fullWidthMobile
        />
      </div>

      {/* Lap record */}
      {stats.lapRecord ? (
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-[hsl(45_90%_50%/0.25)] bg-[hsl(45_90%_50%/0.05)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(45_90%_55%)]">
              Lap Record
            </span>
            <span className="text-base font-mono font-bold text-foreground leading-tight">
              {stats.lapRecord.time}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {stats.lapRecord.driver} · {stats.lapRecord.year}
            </span>
          </div>
          <span className="text-2xl sm:text-3xl">⏱</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-border/40 bg-muted/20">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Lap Record
            </span>
            <span className="text-base font-mono font-bold text-muted-foreground leading-tight">
              – –:–– –––
            </span>
            <span className="text-xs font-mono text-muted-foreground/60">
              Debut race · no record set
            </span>
          </div>
          <span className="text-2xl sm:text-3xl opacity-30">⏱</span>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, highlight, fullWidthMobile,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  fullWidthMobile?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border bg-card/60
      ${highlight ? "border-primary/30 bg-primary/5" : "border-border"}
      ${fullWidthMobile ? "col-span-2 sm:col-span-1" : ""}
    `}>
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">{label}</span>
      </div>
      <span className={`text-lg sm:text-xl font-mono font-bold leading-none ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
      {sub && <span className="text-[9px] sm:text-xs font-mono text-muted-foreground leading-none">{sub}</span>}
    </div>
  );
}
