import { CIRCUIT_STATS } from "../data/circuits";
import { Timer, Gauge, Map, Zap } from "lucide-react";

export default function CircuitInfo({ circuitName }: { circuitName: string }) {
  const stats = CIRCUIT_STATS[circuitName];
  if (!stats) return (
    <div className="flex items-center justify-center h-24 text-muted-foreground font-mono text-sm border border-dashed border-border/50 rounded-xl">
      Circuit data not available
    </div>
  );

  const totalDistance = ((stats.length * stats.laps) / 1).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Main stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Map className="w-4 h-4" />}
          label="Circuit Length"
          value={`${stats.length} km`}
        />
        <StatCard
          icon={<Gauge className="w-4 h-4" />}
          label="Race Distance"
          value={`${stats.laps} laps`}
          sub={`${totalDistance} km total`}
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="DRS Zones"
          value={stats.drsZones.toString()}
          sub="detection zones"
        />
        <StatCard
          icon={<Timer className="w-4 h-4" />}
          label="First GP"
          value={stats.firstGP.toString()}
        />
      </div>

      {/* Lap record */}
      {stats.lapRecord ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-[hsl(45_90%_50%/0.25)] bg-[hsl(45_90%_50%/0.05)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(45_90%_55%)]">
              Official Lap Record
            </span>
            <span className="text-base font-mono font-bold text-foreground">
              {stats.lapRecord.time}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {stats.lapRecord.driver} · {stats.lapRecord.year}
            </span>
          </div>
          <span className="text-3xl">⏱</span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Official Lap Record
            </span>
            <span className="text-base font-mono font-bold text-muted-foreground">
              – –:–– –––
            </span>
            <span className="text-xs font-mono text-muted-foreground/60">
              No record set · debut race
            </span>
          </div>
          <span className="text-3xl opacity-30">⏱</span>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-xl border border-border bg-card/60">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl sm:text-2xl font-mono font-bold text-foreground">{value}</span>
      {sub && <span className="text-xs font-mono text-muted-foreground">{sub}</span>}
    </div>
  );
}
