import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useRaceFlow, DriverFlowInfo, FlowDataPoint, PitEntry } from "../hooks/useRaceFlow";
import { AlertTriangle, RefreshCw } from "lucide-react";

// ─── Mobile breakpoint hook ───────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FlowSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div
        className="w-full rounded-lg bg-muted/20 border border-border/30"
        style={{ height: isMobile ? 300 : 400 }}
      />
      <div className="flex gap-1 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-5 w-10 shrink-0 rounded bg-muted/20" />
        ))}
      </div>
    </div>
  );
}

// ─── Standings Strip ─────────────────────────────────────────────────────────

interface StandingsStripProps {
  lap: number;
  standings: Array<{ driver: DriverFlowInfo; position: number }>;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function StandingsStrip({ lap, standings }: StandingsStripProps) {
  return (
    <div className="rounded-lg border border-border/30 bg-card/60 backdrop-blur px-2.5 py-2 flex flex-col gap-1.5">
      <div className="text-[10px] font-mono font-bold text-muted-foreground/70 uppercase tracking-widest">
        Lap {lap} &bull; Position:
      </div>
      <div className="flex flex-wrap gap-1">
        {standings.map(({ driver, position }) => (
          <span
            key={driver.number}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
            style={{
              backgroundColor: driver.color + "28",
              color: driver.color,
              border: `1px solid ${driver.color}55`,
            }}
          >
            <span className="opacity-70">{ordinal(position)}</span>
            <span
              className="inline-flex items-center justify-center rounded-full text-[8px] font-black shrink-0"
              style={{
                backgroundColor: driver.color,
                color: "#000",
                width: 14,
                height: 14,
                lineHeight: 1,
              }}
            >
              {driver.number}
            </span>
            {driver.code}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Pit stop summary bar ────────────────────────────────────────────────────

interface PitSummaryBarProps {
  entries: PitEntry[];
  drivers: DriverFlowInfo[];
}

const COMPOUND_COLOR: Record<string, string> = {
  S: "#e8002d",
  M: "#ffd700",
  H: "#ffffff",
  I: "#43b244",
  W: "#0067ff",
};

function CompoundBadge({ abbrev }: { abbrev: string }) {
  const bg = COMPOUND_COLOR[abbrev] ?? "#888";
  return (
    <span
      className="inline-flex items-center justify-center rounded-sm font-black text-[8px]"
      style={{ backgroundColor: bg, color: "#000", width: 13, height: 13, lineHeight: 1 }}
    >
      {abbrev}
    </span>
  );
}

function PitSummaryBar({ entries, drivers }: PitSummaryBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-2.5 py-1.5 rounded-lg border border-border/30 bg-card/40 text-[10px] font-mono">
      <span className="text-muted-foreground/50 uppercase tracking-widest shrink-0 text-[9px]">Pit stop:</span>
      {entries.map(({ driverNum, from, to }) => {
        const driver = drivers.find((d) => d.number === driverNum);
        if (!driver) return null;
        return (
          <span key={driverNum} className="inline-flex items-center gap-1">
            <span
              className="inline-flex items-center justify-center rounded-full font-black shrink-0"
              style={{ backgroundColor: driver.color, color: "#000", width: 14, height: 14, fontSize: 7 }}
            >
              {driver.number}
            </span>
            <span style={{ color: driver.color }} className="font-bold">{driver.code}</span>
            {from === "?" && to === "?" ? (
              <span className="text-muted-foreground/40 text-[9px]">pitted</span>
            ) : (
              <>
                <CompoundBadge abbrev={from} />
                <span className="text-muted-foreground/40">→</span>
                <CompoundBadge abbrev={to} />
              </>
            )}
          </span>
        );
      })}
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
  isFaded: boolean;
}

function PitDot({ cx, cy, payload, driverNum, color, pitStops, isFaded }: PitDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null;
  const lap = payload["lap"] as number;
  if (!pitStops.get(driverNum)?.has(lap)) return null;

  return (
    <g opacity={isFaded ? 0.15 : 1}>
      <circle cx={cx} cy={cy} r={4} fill="none" stroke={color} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={2} fill={color} />
    </g>
  );
}

// ─── End-of-line driver badge ─────────────────────────────────────────────────
//
// Desktop: colored pill with driver number text (needs ~52px right margin)
// Mobile:  just a 3px-wide colored tick (only needs ~10px right margin)

interface EndBadgeProps {
  x?: number;
  y?: number;
  index?: number;
  value?: number;
  driver: DriverFlowInfo;
  totalLaps: number;
  isFaded: boolean;
  compact: boolean; // mobile mode
}

function EndBadge({ x, y, index, value, driver, totalLaps, isFaded, compact }: EndBadgeProps) {
  if (x === undefined || y === undefined || index !== totalLaps - 1 || value === undefined) {
    return null;
  }

  const opacity = isFaded ? 0.15 : 1;

  if (compact) {
    // Mobile: a slim 3×10 tick mark — no text, no margin eat
    return (
      <g opacity={opacity}>
        <rect x={x + 3} y={y - 5} width={3} height={10} rx={1} fill={driver.color} fillOpacity={0.85} />
      </g>
    );
  }

  // Desktop: full numbered pill
  const label = String(driver.number);
  const w = Math.max(label.length * 7 + 6, 22);
  const h = 14;

  return (
    <g opacity={opacity}>
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
  raceDate: string;
}

export default function RaceFlowChart({ raceDate }: RaceFlowChartProps) {
  const [activeDrivers, setActiveDrivers] = useState<Set<number>>(new Set());
  const [scrubbedLap, setScrubbedLap] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const flowState = useRaceFlow(raceDate, true);

  const handleDriverClick = (num: number) => {
    setActiveDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (flowState.status === "idle" || flowState.status === "loading") {
    return (
      <div className="flex flex-col gap-3">
        <FlowSkeleton isMobile={isMobile} />
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
  const { chartData, drivers, pitStops, pitSummary, totalLaps } = flowState;

  const hasSelection = activeDrivers.size > 0;
  const isScrubbing = scrubbedLap !== null;

  // Identify P1/P2/P3 from the final lap data
  const podiumNumbers = new Set<number>();
  const lastEntry = chartData[chartData.length - 1];
  if (lastEntry) {
    drivers.forEach((d) => {
      const pos = lastEntry[`d${d.number}`] as number | undefined;
      if (pos !== undefined && pos <= 3) podiumNumbers.add(d.number);
    });
  }

  // Opacity/weight for each driver line
  function getLineStyle(driverNum: number): { opacity: number; width: number } {
    if (hasSelection) {
      const isActive = activeDrivers.has(driverNum);
      return { opacity: isActive ? 1 : 0.1, width: isActive ? 2.5 : 1 };
    }
    if (!isScrubbing) {
      // Podium-default: only P1/P2/P3 visible
      const inPodium = podiumNumbers.has(driverNum);
      return { opacity: inPodium ? 1 : 0.05, width: inPodium ? 2 : 1.2 };
    }
    // Scrubbing with no selection — all drivers visible
    return { opacity: 1, width: 1.5 };
  }

  // Standings at the currently scrubbed lap, filtered by selection if any
  function getStandingsAtLap(lap: number) {
    const entry = chartData.find((d) => (d["lap"] as number) === lap) ?? lastEntry;
    if (!entry) return [];
    const pool = hasSelection ? drivers.filter((d) => activeDrivers.has(d.number)) : drivers;
    return pool
      .map((d) => ({ driver: d, position: entry[`d${d.number}`] as number | undefined }))
      .filter((r): r is { driver: DriverFlowInfo; position: number } => r.position !== undefined)
      .sort((a, b) => a.position - b.position);
  }

  const maxPosition = Math.max(
    20,
    ...drivers.flatMap((d) =>
      chartData.map((entry) => (entry[`d${d.number}`] as number | undefined) ?? 0)
    )
  );
  const yTicks = Array.from({ length: maxPosition }, (_, i) => i + 1);

  const sortedDrivers = [...drivers].sort((a, b) => {
    const pa = lastEntry?.[`d${a.number}`] ?? 99;
    const pb = lastEntry?.[`d${b.number}`] ?? 99;
    return (pa as number) - (pb as number);
  });

  // Responsive chart sizing
  const chartMargin = isMobile
    ? { top: 6, right: 10, left: -28, bottom: 4 }
    : { top: 8, right: 52, left: -22, bottom: 4 };
  const chartHeight = isMobile ? 320 : 420;

  // Chart event handlers for the scrubber
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartMouseMove = (data: any) => {
    if (data?.activeLabel !== undefined) {
      setScrubbedLap(Number(data.activeLabel));
    }
  };
  const handleChartMouseLeave = () => setScrubbedLap(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Standings strip — shown above chart while scrubbing */}
      {isScrubbing ? (
        <StandingsStrip
          lap={scrubbedLap}
          standings={getStandingsAtLap(scrubbedLap)}
        />
      ) : (
        /* Info bar — shown when not scrubbing */
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 gap-2">
          <span className="truncate">
            {isMobile
              ? `${totalLaps} laps · ${drivers.length} drivers`
              : `Position by lap · ${totalLaps} laps · ${drivers.length} drivers`}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <span className="w-3 h-px inline-block bg-muted-foreground/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 inline-block" />
            <span>pit</span>
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="w-full select-none" style={{ touchAction: "pan-y" }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            data={chartData}
            margin={chartMargin}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
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
              domain={[1, maxPosition]}
              ticks={yTicks}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `P${v}`}
              width={isMobile ? 24 : 28}
            />

            {/* Tooltip — cursor provides the vertical scrubber line; content hidden (standings strip replaces it) */}
            <Tooltip
              content={() => null}
              cursor={{
                stroke: "rgba(255,255,255,0.25)",
                strokeWidth: 1,
                strokeDasharray: "4 2",
              }}
            />

            {/* Scrubber reference line */}
            {isScrubbing && (
              <ReferenceLine
                x={scrubbedLap}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
              />
            )}

            {drivers.map((driver) => {
              const { opacity, width } = getLineStyle(driver.number);
              const isFaded = opacity < 0.5;

              return (
                <Line
                  key={driver.number}
                  type="monotone"
                  dataKey={`d${driver.number}`}
                  stroke={driver.color}
                  strokeWidth={width}
                  strokeOpacity={opacity}
                  dot={(props: object) => (
                    <PitDot
                      {...(props as PitDotProps)}
                      driverNum={driver.number}
                      color={driver.color}
                      pitStops={pitStops}
                      isFaded={isFaded}
                    />
                  )}
                  activeDot={false}
                  connectNulls
                  isAnimationActive={false}
                  onClick={() => handleDriverClick(driver.number)}
                  style={{ cursor: "pointer" }}
                  label={(props: object) => (
                    <EndBadge
                      {...(props as EndBadgeProps)}
                      driver={driver}
                      totalLaps={totalLaps}
                      isFaded={isFaded}
                      compact={isMobile}
                    />
                  )}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pit stop summary — shown while scrubbing if any driver pitted at this lap */}
      {isScrubbing && (() => {
        const entries = pitSummary.get(scrubbedLap) ?? [];
        if (!entries.length) return null;
        const visible = hasSelection
          ? entries.filter((e) => activeDrivers.has(e.driverNum))
          : entries;
        if (!visible.length) return null;
        return <PitSummaryBar entries={visible} drivers={drivers} />;
      })()}

      {/* Driver legend — wrap into multiple rows, 5-wide chips */}
      <div className="flex flex-wrap gap-1 border-t border-border/20 pt-1.5">
        {sortedDrivers.map((driver) => {
          const isActive = activeDrivers.has(driver.number);
          const { opacity } = getLineStyle(driver.number);
          const isFaded = hasSelection && !isActive;
          return (
            <button
              key={driver.number}
              onClick={() => handleDriverClick(driver.number)}
              title={`${driver.code} #${driver.number} · ${driver.teamName}`}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all duration-150 border shrink-0 ${
                isActive
                  ? "border-white/20 bg-white/5"
                  : "border-transparent hover:bg-white/5"
              }`}
              style={{ opacity: isFaded ? 0.2 : Math.max(opacity, 0.35) }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full font-black shrink-0"
                style={{
                  backgroundColor: driver.color,
                  color: "#000",
                  width: 14,
                  height: 14,
                  fontSize: 7,
                  lineHeight: 1,
                }}
              >
                {driver.number}
              </span>
              <span style={{ color: driver.color }}>{driver.code}</span>
            </button>
          );
        })}
        {hasSelection && (
          <button
            onClick={() => setActiveDrivers(() => new Set())}
            className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono text-muted-foreground hover:text-foreground border border-border/30 hover:border-border transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="text-[9px] text-muted-foreground/30 font-mono">
        Data: OpenF1 · Circles = pit stops · Tap drivers to compare · Hover chart to scrub laps
      </div>
    </div>
  );
}
