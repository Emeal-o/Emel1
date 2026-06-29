import { useState, useEffect } from "react";

// ─── OpenF1 API types ────────────────────────────────────────────────────────

type OF1Session = {
  session_key: number;
  date_start: string;
  country_name: string;
  circuit_short_name: string;
};

type OF1Position = {
  date: string;
  driver_number: number;
  position: number;
};

type OF1Lap = {
  date_start: string;
  driver_number: number;
  is_pit_out_lap: boolean;
  lap_number: number;
};

type OF1Driver = {
  driver_number: number;
  name_acronym: string;
  team_colour: string | null;
  team_name: string;
};

// ─── Public types ────────────────────────────────────────────────────────────

export type DriverFlowInfo = {
  number: number;
  code: string;
  color: string;
  teamName: string;
};

/** chartData[i] = { lap: i+1, d1: 5, d16: 1, d4: 3, ... } */
export type FlowDataPoint = Record<string, number>;

export type RaceFlowState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      chartData: FlowDataPoint[];
      drivers: DriverFlowInfo[];
      /** driverNum → set of lap numbers where they came out of the pits */
      pitStops: Map<number, Set<number>>;
      totalLaps: number;
    };

// ─── Module-level session cache (shared across all RaceCards) ────────────────

let _sessionsCache: OF1Session[] | null = null;
let _sessionsFetch: Promise<OF1Session[]> | null = null;

async function getSessions2026(): Promise<OF1Session[]> {
  if (_sessionsCache) return _sessionsCache;
  if (!_sessionsFetch) {
    _sessionsFetch = fetch(
      "https://api.openf1.org/v1/sessions?year=2026&session_name=Race"
    )
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<OF1Session[]>;
      })
      .then((data) => {
        _sessionsCache = data;
        return data;
      })
      .catch((err) => {
        // Reset so the next call can retry instead of permanently caching a failure
        _sessionsFetch = null;
        throw err;
      });
  }
  return _sessionsFetch;
}

function findSessionKey(sessions: OF1Session[], raceDate: string): number | null {
  if (!sessions.length) return null;
  const raceTs = new Date(raceDate).getTime();
  let best: OF1Session | null = null;
  let bestDiff = Infinity;
  for (const s of sessions) {
    const diff = Math.abs(new Date(s.date_start).getTime() - raceTs);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }
  // Allow up to 4 days difference to account for timezone/timing variability
  return best && bestDiff < 4 * 24 * 60 * 60 * 1000 ? best.session_key : null;
}

// ─── Data processing ─────────────────────────────────────────────────────────

function processData(
  positions: OF1Position[],
  laps: OF1Lap[],
  driverList: OF1Driver[]
): Omit<RaceFlowState & { status: "success" }, "status"> {
  // Group laps by driver
  const lapsByDriver = new Map<number, OF1Lap[]>();
  for (const lap of laps) {
    if (!lapsByDriver.has(lap.driver_number)) lapsByDriver.set(lap.driver_number, []);
    lapsByDriver.get(lap.driver_number)!.push(lap);
  }
  for (const arr of lapsByDriver.values()) arr.sort((a, b) => a.lap_number - b.lap_number);

  // Group positions by driver, sorted by date
  const posByDriver = new Map<number, OF1Position[]>();
  for (const pos of positions) {
    if (!posByDriver.has(pos.driver_number)) posByDriver.set(pos.driver_number, []);
    posByDriver.get(pos.driver_number)!.push(pos);
  }
  for (const arr of posByDriver.values()) arr.sort((a, b) => a.date.localeCompare(b.date));

  const driverNums = [...lapsByDriver.keys()];

  // Build driver info (name + color from OpenF1)
  const drivers: DriverFlowInfo[] = driverNums.map((num) => {
    const d = driverList.find((dr) => dr.driver_number === num);
    const rawColor = d?.team_colour ?? null;
    const color = rawColor
      ? rawColor.startsWith("#") ? rawColor : `#${rawColor}`
      : "#888888";
    return {
      number: num,
      code: d?.name_acronym ?? String(num),
      color,
      teamName: d?.team_name ?? "Unknown",
    };
  });

  // Total laps
  const totalLaps = Math.max(
    ...([...lapsByDriver.values()].map((arr) => arr[arr.length - 1]?.lap_number ?? 0))
  );

  // Pit stops: driverNum → set of lap numbers where is_pit_out_lap === true
  const pitStops = new Map<number, Set<number>>();
  for (const [driverNum, driverLaps] of lapsByDriver) {
    for (const lap of driverLaps) {
      if (lap.is_pit_out_lap) {
        if (!pitStops.has(driverNum)) pitStops.set(driverNum, new Set());
        pitStops.get(driverNum)!.add(lap.lap_number);
      }
    }
  }

  // Build chart data: one entry per lap
  const chartData: FlowDataPoint[] = [];
  for (let lapNum = 1; lapNum <= totalLaps; lapNum++) {
    const entry: FlowDataPoint = { lap: lapNum };

    for (const driverNum of driverNums) {
      const driverLaps = lapsByDriver.get(driverNum) ?? [];
      const driverPositions = posByDriver.get(driverNum) ?? [];

      const thisLap = driverLaps.find((l) => l.lap_number === lapNum);
      if (!thisLap) continue; // driver DNF'd before this lap

      const nextLap = driverLaps.find((l) => l.lap_number === lapNum + 1);

      let pos: number | undefined;
      if (nextLap) {
        // Find last position record before next lap starts
        const cutoff = nextLap.date_start;
        for (const p of driverPositions) {
          if (p.date <= cutoff) pos = p.position;
          else break;
        }
      } else {
        // Last lap for this driver — use their last known position
        pos = driverPositions[driverPositions.length - 1]?.position;
      }

      if (pos !== undefined) {
        entry[`d${driverNum}`] = pos;
      }
    }

    chartData.push(entry);
  }

  return { chartData, drivers, pitStops, totalLaps };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Lazily fetch race flow data from OpenF1.
 * @param raceDate  ISO timestamp of the race session start (from calendar sessions[R].time)
 * @param enabled   Set to true only when the Race Flow tab is visible
 */
export function useRaceFlow(raceDate: string, enabled: boolean): RaceFlowState {
  const [state, setState] = useState<RaceFlowState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setState({ status: "loading" });

    async function load() {
      try {
        // Step 1: resolve OpenF1 session key from race date
        const sessions = await getSessions2026();
        const sessionKey = findSessionKey(sessions, raceDate);

        if (!sessionKey) {
          if (!cancelled)
            setState({
              status: "error",
              message: "Race session not found on OpenF1. Data may not be available yet.",
            });
          return;
        }

        // Step 2: fetch positions + laps + drivers in parallel
        const [posRes, lapRes, driverRes] = await Promise.all([
          fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`),
          fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`),
          fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`),
        ]);

        if (!posRes.ok || !lapRes.ok || !driverRes.ok) {
          throw new Error("Failed to fetch race telemetry from OpenF1");
        }

        const [positions, laps, driverList]: [OF1Position[], OF1Lap[], OF1Driver[]] =
          await Promise.all([posRes.json(), lapRes.json(), driverRes.json()]);

        if (cancelled) return;

        if (!laps.length) {
          setState({ status: "error", message: "No lap data available for this race." });
          return;
        }

        const result = processData(positions, laps, driverList);
        setState({ status: "success", ...result });
      } catch (err: unknown) {
        if (!cancelled)
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load race flow",
          });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, raceDate]);

  return state;
}
