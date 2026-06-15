import { useState, useEffect } from "react";
import { RaceData, transformApiRaces } from "../data/calendar";

const API_URL = "https://api.jolpi.ca/ergast/f1/2026.json?limit=30";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; races: RaceData[]; lastUpdated: number };

export function useF1Schedule(refreshInterval = 300_000): FetchState {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  useEffect(() => {
    let cancelled = false;
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const apiRaces = data?.MRData?.RaceTable?.Races;
        if (!Array.isArray(apiRaces)) throw new Error("Unexpected API response shape");
        const now = new Date();
        const races = transformApiRaces(apiRaces, now);
        const nextIdx = races.findIndex((r) => r.status === "upcoming");
        if (nextIdx !== -1) races[nextIdx] = { ...races[nextIdx], status: "next" };
        setState({ status: "success", races, lastUpdated: Date.now() });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) =>
          prev.status === "success"
            ? prev // keep stale data on refresh error
            : { status: "error", message: err.message ?? "Failed to load schedule" }
        );
      });
    return () => { cancelled = true; };
  }, [tick]);

  return state;
}
