export type SessionInfo = {
  id: string;
  name: string;
  time: string; // ISO 8601 UTC
};

export type RaceData = {
  round: number;
  circuit: string;
  city: string;
  country: string;
  flag: string;
  name: string;
  weekend: string;
  isSprint: boolean;
  status: "completed" | "next" | "upcoming";
  sessions: SessionInfo[];
};

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  USA: "🇺🇸",
  Italy: "🇮🇹",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Canada: "🇨🇦",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  Hungary: "🇭🇺",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
  "United Arab Emirates": "🇦🇪",
};

type ApiSession = { date: string; time: string };

type ApiRace = {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
    Location: { locality: string; country: string };
  };
  date: string;
  time?: string;
  FirstPractice?: ApiSession;
  SecondPractice?: ApiSession;
  ThirdPractice?: ApiSession;
  SprintQualifying?: ApiSession;
  Sprint?: ApiSession;
  Qualifying?: ApiSession;
};

function toIso(date: string, time?: string): string {
  return time ? `${date}T${time}` : `${date}T00:00:00Z`;
}

function formatWeekend(sessions: SessionInfo[]): string {
  const dates = sessions.map((s) => new Date(s.time));
  const first = dates.reduce((a, b) => (a < b ? a : b));
  const last = dates.reduce((a, b) => (a > b ? a : b));
  const fmt = new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric" });
  const fmtYear = new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", year: "numeric" });
  if (first.getMonth() === last.getMonth()) {
    return `${fmt.format(first)}–${fmtYear.format(last)}`;
  }
  return `${fmt.format(first)} – ${fmtYear.format(last)}`;
}

export function transformApiRaces(apiRaces: ApiRace[], now: Date): RaceData[] {
  return apiRaces.map((r) => {
    const round = parseInt(r.round, 10);
    const isSprint = !!r.Sprint;
    const sessions: SessionInfo[] = [];

    if (r.FirstPractice) {
      sessions.push({ id: `${round}-p1`, name: "P1", time: toIso(r.FirstPractice.date, r.FirstPractice.time) });
    }
    if (isSprint) {
      if (r.SprintQualifying) {
        sessions.push({ id: `${round}-sq`, name: "SQ", time: toIso(r.SprintQualifying.date, r.SprintQualifying.time) });
      }
      if (r.Sprint) {
        sessions.push({ id: `${round}-sp`, name: "SP", time: toIso(r.Sprint.date, r.Sprint.time) });
      }
    } else {
      if (r.SecondPractice) {
        sessions.push({ id: `${round}-p2`, name: "P2", time: toIso(r.SecondPractice.date, r.SecondPractice.time) });
      }
      if (r.ThirdPractice) {
        sessions.push({ id: `${round}-p3`, name: "P3", time: toIso(r.ThirdPractice.date, r.ThirdPractice.time) });
      }
    }
    if (r.Qualifying) {
      sessions.push({ id: `${round}-q`, name: "Q", time: toIso(r.Qualifying.date, r.Qualifying.time) });
    }
    sessions.push({ id: `${round}-r`, name: "R", time: toIso(r.date, r.time) });

    sessions.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const raceTime = new Date(toIso(r.date, r.time));
    const firstSession = new Date(sessions[0]?.time ?? r.date);

    let status: RaceData["status"] = "upcoming";
    if (raceTime < now) {
      status = "completed";
    }

    return {
      round,
      name: r.raceName.replace(" Grand Prix", " GP"),
      circuit: r.Circuit.circuitName,
      city: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      flag: COUNTRY_FLAGS[r.Circuit.Location.country] ?? "🏁",
      weekend: formatWeekend(sessions),
      isSprint,
      status,
      sessions,
    };
  });
}

export function findNextSession(races: RaceData[], now: Date): { race: RaceData; session: SessionInfo } | null {
  for (const race of races) {
    for (const session of race.sessions) {
      if (new Date(session.time) > now) {
        return { race, session };
      }
    }
  }
  return null;
}
