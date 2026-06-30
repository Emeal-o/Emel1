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

type OF1Stint = {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number | null;
  compound: string | null;
  tyre_age_at_start: number;
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

export type PitEntry = { driverNum: number; from: string; to: string };

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
      /** lap number → pit entries at that lap (compound transitions) */
      pitSummary: Map<number, PitEntry[]>;
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

const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

function findSessionKey(sessions: OF1Session[], raceDate: string): number | null {
  if (!sessions.length) return null;

  const raceTs = new Date(raceDate).getTime();
  if (isNaN(raceTs)) {
    console.warn("[RaceFlow] Invalid raceDate — cannot match session:", { raceDate });
    return null;
  }

  let best: OF1Session | null = null;
  let bestDiff = Infinity;
  for (const s of sessions) {
    const sessionTs = new Date(s.date_start).getTime();
    if (isNaN(sessionTs)) continue; // skip sessions with unparseable dates
    const diff = Math.abs(sessionTs - raceTs);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }

  const found = best !== null && bestDiff < FOUR_DAYS_MS;

  // Log in dev so the browser console shows exact values for debugging (e.g. Round 1 vs others)
  if (import.meta.env.DEV || !found) {
    console.info(
      `[RaceFlow] raceDate="${raceDate}" (${new Date(raceDate).toUTCString()})` +
      ` → best="${best?.country_name ?? "none"}" diff=${(bestDiff / 3_600_000).toFixed(2)}h` +
      ` → session_key=${found ? best!.session_key : "null (>4 day window)"}`
    );
  }

  return found ? best!.session_key : null;
}

// ─── Data processing ─────────────────────────────────────────────────────────

function compoundAbbrev(c: string | null): string {
  switch (c?.toUpperCase()) {
    case "SOFT": return "S";
    case "MEDIUM": return "M";
    case "HARD": return "H";
    case "INTERMEDIATE": return "I";
    case "WET": return "W";
    default: return c?.charAt(0) ?? "?";
  }
}

function processData(
  positions: OF1Position[],
  laps: OF1Lap[],
  driverList: OF1Driver[],
  stints: OF1Stint[]
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
  for (const arr of posByDriver.values()) arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
        // Find last position record before next lap starts.
        // Use getTime() instead of string comparison to handle any ISO format
        // variants (Z vs +00:00) and to safely treat null date_start as "no cutoff".
        const cutoffTs = nextLap.date_start !== null
          ? new Date(nextLap.date_start).getTime()
          : NaN;
        if (!isNaN(cutoffTs)) {
          for (const p of driverPositions) {
            const pTs = new Date(p.date).getTime();
            if (pTs <= cutoffTs) pos = p.position;
            else break;
          }
        }
        // If cutoffTs is NaN (null date_start), pos stays undefined for this lap;
        // recharts connectNulls will bridge the gap.
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

  // Build pitSummary: lap → [{driverNum, from, to}]
  const pitSummary = new Map<number, PitEntry[]>();
  const stintsByDriver = new Map<number, OF1Stint[]>();
  for (const stint of stints) {
    if (!stintsByDriver.has(stint.driver_number)) stintsByDriver.set(stint.driver_number, []);
    stintsByDriver.get(stint.driver_number)!.push(stint);
  }
  for (const arr of stintsByDriver.values()) arr.sort((a, b) => a.stint_number - b.stint_number);
  for (const [driverNum, driverStints] of stintsByDriver) {
    for (let i = 1; i < driverStints.length; i++) {
      const prev = driverStints[i - 1];
      const curr = driverStints[i];
      const pitLap = curr.lap_start;
      if (!pitSummary.has(pitLap)) pitSummary.set(pitLap, []);
      pitSummary.get(pitLap)!.push({
        driverNum,
        from: compoundAbbrev(prev.compound),
        to: compoundAbbrev(curr.compound),
      });
    }
  }

  // Fallback: for any pit lap in pitStops that stints didn't cover,
  // add an entry without compound data so the bar still appears.
  for (const [driverNum, lapSet] of pitStops) {
    for (const pitLap of lapSet) {
      const alreadyCovered = pitSummary.get(pitLap)?.some((e) => e.driverNum === driverNum);
      if (!alreadyCovered) {
        if (!pitSummary.has(pitLap)) pitSummary.set(pitLap, []);
        pitSummary.get(pitLap)!.push({ driverNum, from: "?", to: "?" });
      }
    }
  }

  return { chartData, drivers, pitStops, pitSummary, totalLaps };
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

        // Step 2: fetch positions + laps + drivers in parallel (critical path)
        const [posRes, lapRes, driverRes] = await Promise.all([
          fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`),
          fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`),
          fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`),
        ]);

        if (!posRes.ok || !lapRes.ok || !driverRes.ok) {
          const failed = [
            !posRes.ok && `positions (${posRes.status})`,
            !lapRes.ok && `laps (${lapRes.status})`,
            !driverRes.ok && `drivers (${driverRes.status})`,
          ].filter(Boolean).join(", ");
          throw new Error(`OpenF1 returned an error for: ${failed}. Data may not be available yet.`);
        }

        const [positions, laps, driverList]: [OF1Position[], OF1Lap[], OF1Driver[]] =
          await Promise.all([posRes.json(), lapRes.json(), driverRes.json()]);

        // Step 3: fetch stints separately after critical data — best-effort only,
        // failures here never block the chart from rendering.
        let stints: OF1Stint[] = [];
        try {
          const stintRes = await fetch(`https://api.openf1.org/v1/stints?session_key=${sessionKey}`);
          if (stintRes.ok) stints = await stintRes.json();
        } catch {
          // stints unavailable — pit compound pills will be hidden, chart still works
        }

        if (cancelled) return;

        if (!laps.length) {
          setState({ status: "error", message: "No lap data available for this race." });
          return;
        }

        const result = processData(positions, laps, driverList, stints);
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
