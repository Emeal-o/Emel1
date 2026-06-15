import { useState, useEffect } from "react";

export type QualifyingResult = {
  position: number;
  driverId: string;
  code: string;
  number: string;
  givenName: string;
  familyName: string;
  team: string;
  teamId: string;
  q1?: string;
  q2?: string;
  q3?: string;
};

export type QualifyingSet = {
  round: number;
  raceName: string;
  results: QualifyingResult[];
};

type QualifyingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; byRound: Map<number, QualifyingSet>; lastUpdated: number };

function parseRound(race: any): QualifyingSet {
  const results: QualifyingResult[] = (race.QualifyingResults ?? []).map((r: any) => ({
    position: parseInt(r.position, 10),
    driverId: r.Driver.driverId,
    code: r.Driver.code,
    number: r.Driver.permanentNumber,
    givenName: r.Driver.givenName,
    familyName: r.Driver.familyName,
    team: r.Constructor.name,
    teamId: r.Constructor.constructorId,
    q1: r.Q1 || undefined,
    q2: r.Q2 || undefined,
    q3: r.Q3 || undefined,
  }));
  return { round: parseInt(race.round, 10), raceName: race.raceName, results };
}

export function useF1Qualifying(completedRounds: number[], refreshInterval = 180_000): QualifyingState {
  const [state, setState] = useState<QualifyingState>({ status: "idle" });
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
      fetch(`https://api.jolpi.ca/ergast/f1/2026/${round}/qualifying.json`)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((data) => {
          const race = data?.MRData?.RaceTable?.Races?.[0];
          if (!race) return null;
          return parseRound(race);
        })
        .catch(() => null)
    );

    Promise.all(fetches).then((sets) => {
      if (cancelled) return;
      const byRound = new Map<number, QualifyingSet>();
      for (const s of sets) {
        if (s && s.results.length > 0) byRound.set(s.round, s);
      }
      setState({ status: "success", byRound, lastUpdated: Date.now() });
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundsKey, tick]);

  return state;
}
