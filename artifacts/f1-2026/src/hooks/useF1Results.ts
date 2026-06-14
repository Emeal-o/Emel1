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
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; byRound: Map<number, RaceResultSet> };

const URL = "https://api.jolpi.ca/ergast/f1/2026/results.json?limit=500";

export function useF1Results(): ResultsState {
  const [state, setState] = useState<ResultsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(URL)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data) => {
        if (cancelled) return;
        const races: any[] = data?.MRData?.RaceTable?.Races ?? [];
        const byRound = new Map<number, RaceResultSet>();
        for (const race of races) {
          const round = parseInt(race.round, 10);
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
          byRound.set(round, { round, raceName: race.raceName, results });
        }
        setState({ status: "success", byRound });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message ?? "Failed to load results" });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
