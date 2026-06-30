import { useMemo } from "react";
import { RaceResultSet } from "./useF1Results";

export type DriverPointsRow = {
  driverId: string;
  code: string;
  teamId: string;
  points: number;
};

export type PointsHistoryRow = {
  round: number;
  shortName: string;
  drivers: Record<string, number>;
};

export type PointsHistory = {
  rows: PointsHistoryRow[];
  topDrivers: { driverId: string; code: string; teamId: string; total: number }[];
};

const RACE_SHORT: Record<string, string> = {
  "Australian Grand Prix": "AUS",
  "Chinese Grand Prix": "CHN",
  "Japanese Grand Prix": "JPN",
  "Bahrain Grand Prix": "BHR",
  "Saudi Arabian Grand Prix": "SAU",
  "United States Grand Prix": "USA",
  "Emilia Romagna Grand Prix": "ITA",
  "Monaco Grand Prix": "MON",
  "Spanish Grand Prix": "ESP",
  "Canadian Grand Prix": "CAN",
  "Austrian Grand Prix": "AUT",
  "British Grand Prix": "GBR",
  "Hungarian Grand Prix": "HUN",
  "Belgian Grand Prix": "BEL",
  "Dutch Grand Prix": "NED",
  "Italian Grand Prix": "ITA2",
  "Azerbaijan Grand Prix": "AZE",
  "Singapore Grand Prix": "SGP",
  "Mexico City Grand Prix": "MEX",
  "São Paulo Grand Prix": "BRA",
  "Qatar Grand Prix": "QAT",
  "Abu Dhabi Grand Prix": "ABU",
};

export function useF1PointsHistory(
  byRound: Map<number, RaceResultSet> | null,
  sprintByRound?: Map<number, RaceResultSet> | null,
): PointsHistory {
  return useMemo(() => {
    if (!byRound || byRound.size === 0) {
      return { rows: [], topDrivers: [] };
    }

    const rounds = Array.from(byRound.keys()).sort((a, b) => a - b);
    const cumulative: Record<string, number> = {};
    const driverMeta: Record<string, { driverId: string; code: string; teamId: string }> = {};

    const rows: PointsHistoryRow[] = rounds.map((round) => {
      const set = byRound.get(round)!;

      // Race points
      for (const r of set.results) {
        const pts = parseFloat(r.points) || 0;
        cumulative[r.code] = (cumulative[r.code] ?? 0) + pts;
        driverMeta[r.code] = { driverId: r.driverId, code: r.code, teamId: r.teamId };
      }

      // Sprint points (additive — sprint weekends have both)
      const sprintSet = sprintByRound?.get(round);
      if (sprintSet) {
        for (const r of sprintSet.results) {
          const pts = parseFloat(r.points) || 0;
          if (pts > 0) {
            cumulative[r.code] = (cumulative[r.code] ?? 0) + pts;
            if (!driverMeta[r.code]) {
              driverMeta[r.code] = { driverId: r.driverId, code: r.code, teamId: r.teamId };
            }
          }
        }
      }

      return {
        round,
        shortName: RACE_SHORT[set.raceName] ?? set.raceName.slice(0, 3).toUpperCase(),
        drivers: { ...cumulative },
      };
    });

    const topDrivers = Object.entries(cumulative)
      .map(([code, total]) => ({ ...driverMeta[code], total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return { rows, topDrivers };
  }, [byRound, sprintByRound]);
}
