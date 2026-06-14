import { useState, useEffect } from "react";
import { RaceData, transformApiRaces } from "../data/calendar";

const API_URL = "https://api.jolpi.ca/ergast/f1/2026.json?limit=30";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; races: RaceData[] };

export function useF1Schedule(): FetchState {
  const [state, setState] = useState<FetchState>({ status: "loading" });

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
        // Mark the next upcoming race
        const nextIdx = races.findIndex((r) => r.status === "upcoming");
        if (nextIdx !== -1) {
          races[nextIdx] = { ...races[nextIdx], status: "next" };
        }
        setState({ status: "success", races });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message ?? "Failed to load schedule" });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
