import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { PointsHistory } from "../hooks/useF1PointsHistory";

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

function driverColor(teamId: string, idx: number): string {
  return TEAM_COLORS[teamId] ?? `hsl(${(idx * 47) % 360}, 70%, 60%)`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl min-w-[140px]">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {sorted.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-mono font-bold text-foreground">{entry.dataKey}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{entry.value} pts</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center pt-2">
      {payload.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] font-mono text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ChampionshipChart({ history }: { history: PointsHistory }) {
  const { rows, topDrivers } = history;

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground font-mono text-sm border border-dashed border-border/50 rounded-xl">
        Chart available after Round 1
      </div>
    );
  }

  // Build flat chart data: each row has { shortName, [driverCode]: pts }
  const chartData = rows.map((row) => {
    const point: Record<string, number | string> = { shortName: row.shortName };
    for (const d of topDrivers) {
      point[d.code] = row.drivers[d.code] ?? 0;
    }
    return point;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Points Progression — Top {topDrivers.length}
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          After Round {rows[rows.length - 1]?.round}
        </span>
      </div>

      <div
        className="w-full overflow-x-auto -mx-0"
        style={{ minHeight: 280 }}
      >
        <div style={{ minWidth: Math.max(340, rows.length * 52) }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
              <XAxis
                dataKey="shortName"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              {topDrivers.map((driver, idx) => (
                <Line
                  key={driver.code}
                  type="monotone"
                  dataKey={driver.code}
                  stroke={driverColor(driver.teamId, idx)}
                  strokeWidth={2}
                  dot={{ r: 3, fill: driverColor(driver.teamId, idx), strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
