import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRaceFlow, DriverFlowInfo, FlowDataPoint } from "../hooks/useRaceFlow";
import { AlertTriangle, RefreshCw } from "lucide-react";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FlowSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Chart area */}
      <div className="w-full h-[340px] rounded-lg bg-muted/20 border border-border/30" />
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-6 w-16 rounded bg-muted/20" />
        ))}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; stroke: string }>;
  label?: number;
  drivers: DriverFlowInfo[];
  activeDriver: number | null;
}

function CustomTooltip({ active, payload, label, drivers, activeDriver }: TooltipProps) {
  if (!active || !payload?.length || label === undefined) return null;

  // Build list of driver positions from payload, sorted by position
  const rows = drivers
    .map((d) => {
      const item = payload.find((p) => p.dataKey === `d${d.number}`);
      return { driver: d, position: item?.value };
    })
    .filter((r): r is { driver: DriverFlowInfo; position: number } => r.position !== undefined)
    .sort((a, b) => a.position - b.position);

  // If a driver is selected, only show them (cleaner UX)
  const displayed = activeDriver !== null ? rows.filter((r) => r.driver.number === activeDriver) : rows.slice(0, 8);

  return (
    <div className="bg-card/95 backdrop-blur border border-border/60 rounded-lg p-2.5 shadow-xl min-w-[130px]">
      <div className="text-[10px] font-bold text-muted-foreground mb-1.5 font-mono uppercase tracking-widest">
        Lap {label}
      </div>
      {displayed.map(({ driver, position }) => (
        <div key={driver.number} className="flex items-center gap-2 py-0.5">
          <span
            className="text-[11px] font-black tabular-nums w-7 shrink-0"
            style={{ color: driver.color }}
          >
            P{position}
          </span>
          <span className="text-[10px] font-bold text-foreground font-mono">{driver.code}</span>
          <span className="text-[9px] text-muted-foreground/60 font-mono">#{driver.number}</span>
        </div>
      ))}
      {!activeDriver && rows.length > 8 && (
        <div className="text-[9px] text-muted-foreground/40 mt-1 font-mono">
          +{rows.length - 8} more · click line to focus
        </div>
      )}
    </div>
  );
}

// ─── Pit-stop dot renderer ───────────────────────────────────────────────────

interface PitDotProps {
  cx?: number;
  cy?: number;
  payload?: FlowDataPoint;
  driverNum: number;
  color: string;
  pitStops: Map<number, Set<number>>;
}

function PitDot({ cx, cy, payload, driverNum, color, pitStops }: PitDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null;
  const lap = payload["lap"] as number;
  if (!pitStops.get(driverNum)?.has(lap)) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.7} />
      <circle cx={cx} cy={cy} r={3} fill={color} fillOpacity={0.9} />
    </g>
  );
}

// ─── End-of-line driver badge ─────────────────────────────────────────────────

interface EndBadgeProps {
  x?: number;
  y?: number;
  index?: number;
  value?: number;
  driver: DriverFlowInfo;
  totalLaps: number;
}

function EndBadge({ x, y, index, value, driver, totalLaps }: EndBadgeProps) {
  if (x === undefined || y === undefined || index !== totalLaps - 1 || value === undefined) {
    return null;
  }
  const label = String(driver.number);
  const w = Math.max(label.length * 7 + 6, 22);
  const h = 14;

  return (
    <g>
      <rect x={x + 5} y={y - h / 2} width={w} height={h} rx={3} fill={driver.color} fillOpacity={0.9} />
      <text
        x={x + 5 + w / 2}
        y={y + 4.5}
        textAnchor="middle"
        fill="#000000"
        fillOpacity={0.85}
        fontSize={9}
        fontWeight="800"
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

// ─── Main chart component ─────────────────────────────────────────────────────

interface RaceFlowChartProps {
  /** ISO timestamp of the race session (used to look up OpenF1 session key) */
  raceDate: string;
}

export default function RaceFlowChart({ raceDate }: RaceFlowChartProps) {
  const [activeDriver, setActiveDriver] = useState<number | null>(null);
  // Component is only mounted when the Race Flow tab is active, so always enable
  const flowState = useRaceFlow(raceDate, true);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (flowState.status === "idle" || flowState.status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <FlowSkeleton />
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Fetching race telemetry from OpenF1…
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (flowState.status === "error") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold">Race flow unavailable</span>
          <span className="text-xs font-mono text-destructive/80">{flowState.message}</span>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  const { chartData, drivers, pitStops, totalLaps } = flowState;

  const handleDriverClick = (num: number) =>
    setActiveDriver((prev) => (prev === num ? null : num));

  // Sort driver legend by final position
  const sortedDrivers = [...drivers].sort((a, b) => {
    const lastEntry = chartData[chartData.length - 1];
    const pa = lastEntry?.[`d${a.number}`] ?? 99;
    const pb = lastEntry?.[`d${b.number}`] ?? 99;
    return pa - pb;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Info bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
        <span>Position by lap · {totalLaps} laps · {drivers.length} drivers</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-px inline-block bg-muted-foreground/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 inline-block" />
          pit stop
        </span>
      </div>

      {/* Chart */}
      <div className="w-full select-none" style={{ touchAction: "pan-y" }}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 52, left: -22, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="lap"
              type="number"
              domain={[1, totalLaps]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickFormatter={(v) => String(v)}
              interval="preserveStartEnd"
              allowDataOverflow
            />
            <YAxis
              reversed
              domain={[1, 20]}
              ticks={[1, 5, 10, 15, 20]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `P${v}`}
              width={28}
            />
            <Tooltip
              content={
                <CustomTooltip
                  drivers={drivers}
                  activeDriver={activeDriver}
                />
              }
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "4 2" }}
            />

            {drivers.map((driver) => {
              const isActive = activeDriver === driver.number;
              const isFaded = activeDriver !== null && !isActive;

              return (
                <Line
                  key={driver.number}
                  type="monotone"
                  dataKey={`d${driver.number}`}
                  stroke={driver.color}
                  strokeWidth={isActive ? 2.5 : isFaded ? 1 : 1.5}
                  strokeOpacity={isFaded ? 0.1 : 1}
                  dot={(props: object) => (
                    <PitDot
                      {...(props as PitDotProps)}
                      driverNum={driver.number}
                      color={driver.color}
                      pitStops={pitStops}
                    />
                  )}
                  activeDot={{
                    r: 4,
                    stroke: driver.color,
                    strokeWidth: 2,
                    fill: "hsl(var(--background))",
                    onClick: () => handleDriverClick(driver.number),
                  }}
                  connectNulls
                  isAnimationActive={false}
                  onClick={() => handleDriverClick(driver.number)}
                  style={{ cursor: "pointer" }}
                  label={(props: object) => (
                    <EndBadge
                      {...(props as EndBadgeProps)}
                      driver={driver}
                      totalLaps={totalLaps}
                    />
                  )}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Driver legend */}
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/20">
        {sortedDrivers.map((driver) => {
          const isFaded = activeDriver !== null && activeDriver !== driver.number;
          return (
            <button
              key={driver.number}
              onClick={() => handleDriverClick(driver.number)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono transition-all duration-150 border ${
                activeDriver === driver.number
                  ? "border-white/20 bg-white/5"
                  : "border-transparent hover:bg-white/5"
              } ${isFaded ? "opacity-25" : "opacity-100"}`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: driver.color }}
              />
              <span className="font-bold" style={{ color: driver.color }}>
                {driver.code}
              </span>
              <span className="text-muted-foreground/50">#{driver.number}</span>
            </button>
          );
        })}
        {activeDriver !== null && (
          <button
            onClick={() => setActiveDriver(null)}
            className="px-2 py-1 rounded-md text-[10px] font-mono text-muted-foreground hover:text-foreground border border-border/30 hover:border-border transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="text-[9px] text-muted-foreground/30 font-mono">
        Data: OpenF1 · Circles indicate pit stop laps · Click driver to focus
      </div>
    </div>
  );
}
