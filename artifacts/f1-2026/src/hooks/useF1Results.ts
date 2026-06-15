import { useState, useEffect } from "react";

export type RaceResult = {
  position: number;
  driverId: string;
  code: string;
  number: string;
  givenName: string;
  familyName: string;
  nationality: string;
  team: string;
  teamId: string;
  grid: number;
  laps: number;
  status: string;
  time?: string;
  points: string;
  fastestLap: boolean;
};

export type RaceResultSet = {
  round: number;
  raceName: string;
  results: RaceResult[];
};

type ResultsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; byRound: Map<number, RaceResultSet>; lastUpdated: number };

function parseRound(race: any): RaceResultSet {
  const results: RaceResult[] = (race.Results ?? []).map((r: any) => ({
    position: parseInt(r.position, 10),
    driverId: r.Driver.driverId,
    code: r.Driver.code,
    number: r.Driver.permanentNumber,
    givenName: r.Driver.givenName,
    familyName: r.Driver.familyName,
    nationality: r.Driver.nationality,
    team: r.Constructor.name,
    teamId: r.Constructor.constructorId,
    grid: parseInt(r.grid, 10),
    laps: parseInt(r.laps, 10),
    status: r.status,
    time: r.Time?.time ?? r.status,
    points: r.points,
    fastestLap: r.FastestLap?.rank === "1",
  }));
  return { round: parseInt(race.round, 10), raceName: race.raceName, results };
}

export function useF1Results(completedRounds: number[], refreshInterval = 180_000): ResultsState {
  const [state, setState] = useState<ResultsState>({ status: "idle" });
  const [tick, setTick] = useState(0);
  const roundsKey = completedRounds.join(",");

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  useEffect(() => {
    if (completedRounds.length === 0) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    if (tick === 0) setState({ status: "loading" });

    const fetches = completedRounds.map((round) =>
      fetch(`https://api.jolpi.ca/ergast/f1/2026/${round}/results.json`)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status} for round ${round}`); return r.json(); })
        .then((data) => {
          const race = data?.MRData?.RaceTable?.Races?.[0];
          if (!race) return null;
          return parseRound(race);
        })
        .catch(() => null)
    );

    Promise.all(fetches).then((results) => {
      if (cancelled) return;
      const byRound = new Map<number, RaceResultSet>();
      for (const r of results) {
        if (r && r.results.length > 0) byRound.set(r.round, r);
      }
      setState({ status: "success", byRound, lastUpdated: Date.now() });
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundsKey, tick]);

  return state;
}
