import { useState, useEffect } from "react";

export type DriverStanding = {
  position: number;
  points: string;
  wins: string;
  driverId: string;
  code: string;
  number: string;
  givenName: string;
  familyName: string;
  nationality: string;
  team: string;
};

export type ConstructorStanding = {
  position: number;
  points: string;
  wins: string;
  constructorId: string;
  name: string;
  nationality: string;
};

type StandingsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; drivers: DriverStanding[]; constructors: ConstructorStanding[]; round: number; season: string; lastUpdated: number };

const DRIVERS_URL = "https://api.jolpi.ca/ergast/f1/2026/driverStandings.json";
const CONSTRUCTORS_URL = "https://api.jolpi.ca/ergast/f1/2026/constructorStandings.json";

export function useF1Standings(refreshInterval = 180_000): StandingsState {
  const [state, setState] = useState<StandingsState>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(DRIVERS_URL).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch(CONSTRUCTORS_URL).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
    ])
      .then(([dData, cData]) => {
        if (cancelled) return;
        const dList = dData?.MRData?.StandingsTable?.StandingsLists?.[0];
        const cList = cData?.MRData?.StandingsTable?.StandingsLists?.[0];
        if (!dList || !cList) throw new Error("No standings data available yet");

        const drivers: DriverStanding[] = (dList.DriverStandings ?? []).map((s: any) => ({
          position: parseInt(s.position, 10),
          points: s.points,
          wins: s.wins,
          driverId: s.Driver.driverId,
          code: s.Driver.code,
          number: s.Driver.permanentNumber,
          givenName: s.Driver.givenName,
          familyName: s.Driver.familyName,
          nationality: s.Driver.nationality,
          team: s.Constructors?.[0]?.name ?? "—",
        }));

        const constructors: ConstructorStanding[] = (cList.ConstructorStandings ?? []).map((s: any) => ({
          position: parseInt(s.position, 10),
          points: s.points,
          wins: s.wins,
          constructorId: s.Constructor.constructorId,
          name: s.Constructor.name,
          nationality: s.Constructor.nationality,
        }));

        setState({ status: "success", drivers, constructors, round: parseInt(dList.round, 10), season: dList.season, lastUpdated: Date.now() });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) =>
          prev.status === "success"
            ? prev
            : { status: "error", message: err.message ?? "Failed to load standings" }
        );
      });

    return () => { cancelled = true; };
  }, [tick]);

  return state;
}
