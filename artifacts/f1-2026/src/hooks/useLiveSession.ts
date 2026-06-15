import { useState, useEffect } from "react";
import { RaceData, SessionInfo } from "../data/calendar";

// Approximate session durations in minutes
const SESSION_DURATION_MINS: Record<string, number> = {
  P1: 60, P2: 60, P3: 60,
  SQ: 45,
  SP: 50,
  Q: 65,
  R: 130,
};

export type LiveSessionInfo = {
  race: RaceData;
  session: SessionInfo;
  elapsedMs: number;
  totalMs: number;
  progress: number; // 0-1
};

function findLiveSession(races: RaceData[], now: Date): LiveSessionInfo | null {
  for (const race of races) {
    for (const session of race.sessions) {
      const start = new Date(session.time);
      const durationMs = (SESSION_DURATION_MINS[session.name] ?? 60) * 60_000;
      const end = new Date(start.getTime() + durationMs);
      if (now >= start && now <= end) {
        const elapsedMs = now.getTime() - start.getTime();
        return {
          race,
          session,
          elapsedMs,
          totalMs: durationMs,
          progress: Math.min(1, elapsedMs / durationMs),
        };
      }
    }
  }
  return null;
}

export function useLiveSession(races: RaceData[]): LiveSessionInfo | null {
  const [live, setLive] = useState<LiveSessionInfo | null>(() =>
    findLiveSession(races, new Date())
  );

  useEffect(() => {
    function check() {
      setLive(findLiveSession(races, new Date()));
    }
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, [races]);

  return live;
}
