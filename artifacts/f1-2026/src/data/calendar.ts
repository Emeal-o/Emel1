export type SessionInfo = {
  id: string;
  name: string; // P1, P2, P3, Q, SQ, SP, R
  time: string; // ISO 8601
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
  status: "completed" | "NEXT" | "upcoming";
  sessions: SessionInfo[];
};

export const CALENDAR: RaceData[] = [
  {
    round: 1,
    name: "Australian GP",
    circuit: "Albert Park",
    city: "Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    weekend: "March 13–16, 2026",
    isSprint: false,
    status: "completed",
    sessions: [
      { id: "1-p1", name: "P1", time: "2026-03-13T13:30:00" },
      { id: "1-p2", name: "P2", time: "2026-03-13T17:00:00" },
      { id: "1-p3", name: "P3", time: "2026-03-14T12:30:00" },
      { id: "1-q", name: "Q", time: "2026-03-14T16:00:00" },
      { id: "1-r", name: "R", time: "2026-03-15T15:00:00" }
    ]
  },
  {
    round: 2,
    name: "Chinese GP",
    circuit: "Shanghai International Circuit",
    city: "Shanghai",
    country: "China",
    flag: "🇨🇳",
    weekend: "March 20–22, 2026",
    isSprint: true,
    status: "completed",
    sessions: [
      { id: "2-p1", name: "P1", time: "2026-03-20T13:30:00" },
      { id: "2-sq", name: "SQ", time: "2026-03-20T17:30:00" },
      { id: "2-sp", name: "SP", time: "2026-03-21T12:00:00" },
      { id: "2-q", name: "Q", time: "2026-03-21T16:00:00" },
      { id: "2-r", name: "R", time: "2026-03-22T15:00:00" }
    ]
  },
  {
    round: 3,
    name: "Japanese GP",
    circuit: "Suzuka Circuit",
    city: "Suzuka",
    country: "Japan",
    flag: "🇯🇵",
    weekend: "April 3–5, 2026",
    isSprint: false,
    status: "completed",
    sessions: [
      { id: "3-p1", name: "P1", time: "2026-04-03T11:30:00" },
      { id: "3-p2", name: "P2", time: "2026-04-03T15:00:00" },
      { id: "3-p3", name: "P3", time: "2026-04-04T11:30:00" },
      { id: "3-q", name: "Q", time: "2026-04-04T15:00:00" },
      { id: "3-r", name: "R", time: "2026-04-05T14:00:00" }
    ]
  },
  {
    round: 4,
    name: "Bahrain GP",
    circuit: "Bahrain International Circuit",
    city: "Sakhir",
    country: "Bahrain",
    flag: "🇧🇭",
    weekend: "April 17–19, 2026",
    isSprint: false,
    status: "completed",
    sessions: [
      { id: "4-p1", name: "P1", time: "2026-04-17T15:30:00" },
      { id: "4-p2", name: "P2", time: "2026-04-17T19:00:00" },
      { id: "4-p3", name: "P3", time: "2026-04-18T15:30:00" },
      { id: "4-q", name: "Q", time: "2026-04-18T19:00:00" },
      { id: "4-r", name: "R", time: "2026-04-19T18:00:00" }
    ]
  },
  {
    round: 5,
    name: "Saudi Arabian GP",
    circuit: "Jeddah Corniche Circuit",
    city: "Jeddah",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    weekend: "April 24–26, 2026",
    isSprint: true,
    status: "completed",
    sessions: [
      { id: "5-p1", name: "P1", time: "2026-04-24T18:30:00" },
      { id: "5-sq", name: "SQ", time: "2026-04-24T22:30:00" },
      { id: "5-sp", name: "SP", time: "2026-04-25T18:00:00" },
      { id: "5-q", name: "Q", time: "2026-04-25T22:00:00" },
      { id: "5-r", name: "R", time: "2026-04-26T20:00:00" }
    ]
  },
  {
    round: 6,
    name: "Miami GP",
    circuit: "Miami International Autodrome",
    city: "Miami",
    country: "USA",
    flag: "🇺🇸",
    weekend: "May 1–3, 2026",
    isSprint: true,
    status: "completed",
    sessions: [
      { id: "6-p1", name: "P1", time: "2026-05-01T12:30:00" },
      { id: "6-sq", name: "SQ", time: "2026-05-01T16:30:00" },
      { id: "6-sp", name: "SP", time: "2026-05-02T12:00:00" },
      { id: "6-q", name: "Q", time: "2026-05-02T16:00:00" },
      { id: "6-r", name: "R", time: "2026-05-03T16:00:00" }
    ]
  },
  {
    round: 7,
    name: "Emilia Romagna GP",
    circuit: "Autodromo Enzo e Dino Ferrari",
    city: "Imola",
    country: "Italy",
    flag: "🇮🇹",
    weekend: "May 15–17, 2026",
    isSprint: false,
    status: "completed",
    sessions: [
      { id: "7-p1", name: "P1", time: "2026-05-15T13:30:00" },
      { id: "7-p2", name: "P2", time: "2026-05-15T17:00:00" },
      { id: "7-p3", name: "P3", time: "2026-05-16T12:30:00" },
      { id: "7-q", name: "Q", time: "2026-05-16T16:00:00" },
      { id: "7-r", name: "R", time: "2026-05-17T15:00:00" }
    ]
  },
  {
    round: 8,
    name: "Monaco GP",
    circuit: "Circuit de Monaco",
    city: "Monte Carlo",
    country: "Monaco",
    flag: "🇲🇨",
    weekend: "May 22–24, 2026",
    isSprint: false,
    status: "completed",
    sessions: [
      { id: "8-p1", name: "P1", time: "2026-05-22T13:30:00" },
      { id: "8-p2", name: "P2", time: "2026-05-22T17:00:00" },
      { id: "8-p3", name: "P3", time: "2026-05-23T12:30:00" },
      { id: "8-q", name: "Q", time: "2026-05-23T16:00:00" },
      { id: "8-r", name: "R", time: "2026-05-24T15:00:00" }
    ]
  },
  {
    round: 9,
    name: "Spanish GP",
    circuit: "Circuit de Barcelona-Catalunya",
    city: "Barcelona",
    country: "Spain",
    flag: "🇪🇸",
    weekend: "May 29–Jun 1, 2026",
    isSprint: false,
    status: "completed",
    sessions: [
      { id: "9-p1", name: "P1", time: "2026-05-29T13:30:00" },
      { id: "9-p2", name: "P2", time: "2026-05-29T17:00:00" },
      { id: "9-p3", name: "P3", time: "2026-05-30T12:30:00" },
      { id: "9-q", name: "Q", time: "2026-05-30T16:00:00" },
      { id: "9-r", name: "R", time: "2026-05-31T15:00:00" }
    ]
  },
  {
    round: 10,
    name: "Canadian GP",
    circuit: "Circuit Gilles Villeneuve",
    city: "Montreal",
    country: "Canada",
    flag: "🇨🇦",
    weekend: "June 12–14, 2026",
    isSprint: false,
    status: "NEXT",
    sessions: [
      { id: "10-p1", name: "P1", time: "2026-06-12T13:30:00" },
      { id: "10-p2", name: "P2", time: "2026-06-12T17:00:00" },
      { id: "10-p3", name: "P3", time: "2026-06-13T12:30:00" },
      { id: "10-q", name: "Q", time: "2026-06-13T16:00:00" },
      { id: "10-r", name: "R", time: "2026-06-14T14:00:00" }
    ]
  },
  {
    round: 11,
    name: "Austrian GP",
    circuit: "Red Bull Ring",
    city: "Spielberg",
    country: "Austria",
    flag: "🇦🇹",
    weekend: "June 26–28, 2026",
    isSprint: true,
    status: "upcoming",
    sessions: [
      { id: "11-p1", name: "P1", time: "2026-06-26T13:30:00" },
      { id: "11-sq", name: "SQ", time: "2026-06-26T17:30:00" },
      { id: "11-sp", name: "SP", time: "2026-06-27T12:00:00" },
      { id: "11-q", name: "Q", time: "2026-06-27T16:00:00" },
      { id: "11-r", name: "R", time: "2026-06-28T15:00:00" }
    ]
  },
  {
    round: 12,
    name: "British GP",
    circuit: "Silverstone Circuit",
    city: "Silverstone",
    country: "UK",
    flag: "🇬🇧",
    weekend: "July 3–5, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "12-p1", name: "P1", time: "2026-07-03T13:30:00" },
      { id: "12-p2", name: "P2", time: "2026-07-03T17:00:00" },
      { id: "12-p3", name: "P3", time: "2026-07-04T12:30:00" },
      { id: "12-q", name: "Q", time: "2026-07-04T16:00:00" },
      { id: "12-r", name: "R", time: "2026-07-05T15:00:00" }
    ]
  },
  {
    round: 13,
    name: "Hungarian GP",
    circuit: "Hungaroring",
    city: "Budapest",
    country: "Hungary",
    flag: "🇭🇺",
    weekend: "July 24–26, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "13-p1", name: "P1", time: "2026-07-24T13:30:00" },
      { id: "13-p2", name: "P2", time: "2026-07-24T17:00:00" },
      { id: "13-p3", name: "P3", time: "2026-07-25T12:30:00" },
      { id: "13-q", name: "Q", time: "2026-07-25T16:00:00" },
      { id: "13-r", name: "R", time: "2026-07-26T15:00:00" }
    ]
  },
  {
    round: 14,
    name: "Belgian GP",
    circuit: "Circuit de Spa-Francorchamps",
    city: "Spa",
    country: "Belgium",
    flag: "🇧🇪",
    weekend: "July 31–Aug 2, 2026",
    isSprint: true,
    status: "upcoming",
    sessions: [
      { id: "14-p1", name: "P1", time: "2026-07-31T13:30:00" },
      { id: "14-sq", name: "SQ", time: "2026-07-31T17:30:00" },
      { id: "14-sp", name: "SP", time: "2026-08-01T12:00:00" },
      { id: "14-q", name: "Q", time: "2026-08-01T16:00:00" },
      { id: "14-r", name: "R", time: "2026-08-02T15:00:00" }
    ]
  },
  {
    round: 15,
    name: "Dutch GP",
    circuit: "Circuit Zandvoort",
    city: "Zandvoort",
    country: "Netherlands",
    flag: "🇳🇱",
    weekend: "August 28–30, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "15-p1", name: "P1", time: "2026-08-28T13:30:00" },
      { id: "15-p2", name: "P2", time: "2026-08-28T17:00:00" },
      { id: "15-p3", name: "P3", time: "2026-08-29T12:30:00" },
      { id: "15-q", name: "Q", time: "2026-08-29T16:00:00" },
      { id: "15-r", name: "R", time: "2026-08-30T15:00:00" }
    ]
  },
  {
    round: 16,
    name: "Italian GP",
    circuit: "Autodromo Nazionale di Monza",
    city: "Monza",
    country: "Italy",
    flag: "🇮🇹",
    weekend: "September 4–6, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "16-p1", name: "P1", time: "2026-09-04T13:30:00" },
      { id: "16-p2", name: "P2", time: "2026-09-04T17:00:00" },
      { id: "16-p3", name: "P3", time: "2026-09-05T12:30:00" },
      { id: "16-q", name: "Q", time: "2026-09-05T16:00:00" },
      { id: "16-r", name: "R", time: "2026-09-06T15:00:00" }
    ]
  },
  {
    round: 17,
    name: "Azerbaijan GP",
    circuit: "Baku City Circuit",
    city: "Baku",
    country: "Azerbaijan",
    flag: "🇦🇿",
    weekend: "September 18–20, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "17-p1", name: "P1", time: "2026-09-18T11:30:00" },
      { id: "17-p2", name: "P2", time: "2026-09-18T15:00:00" },
      { id: "17-p3", name: "P3", time: "2026-09-19T11:30:00" },
      { id: "17-q", name: "Q", time: "2026-09-19T15:00:00" },
      { id: "17-r", name: "R", time: "2026-09-20T14:00:00" }
    ]
  },
  {
    round: 18,
    name: "Singapore GP",
    circuit: "Marina Bay Street Circuit",
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    weekend: "October 2–4, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "18-p1", name: "P1", time: "2026-10-02T17:30:00" },
      { id: "18-p2", name: "P2", time: "2026-10-02T21:00:00" },
      { id: "18-p3", name: "P3", time: "2026-10-03T17:30:00" },
      { id: "18-q", name: "Q", time: "2026-10-03T21:00:00" },
      { id: "18-r", name: "R", time: "2026-10-04T20:00:00" }
    ]
  },
  {
    round: 19,
    name: "United States GP",
    circuit: "Circuit of the Americas",
    city: "Austin",
    country: "USA",
    flag: "🇺🇸",
    weekend: "October 16–18, 2026",
    isSprint: true,
    status: "upcoming",
    sessions: [
      { id: "19-p1", name: "P1", time: "2026-10-16T12:30:00" },
      { id: "19-sq", name: "SQ", time: "2026-10-16T16:30:00" },
      { id: "19-sp", name: "SP", time: "2026-10-17T12:00:00" },
      { id: "19-q", name: "Q", time: "2026-10-17T16:00:00" },
      { id: "19-r", name: "R", time: "2026-10-18T14:00:00" }
    ]
  },
  {
    round: 20,
    name: "Mexico City GP",
    circuit: "Autodromo Hermanos Rodriguez",
    city: "Mexico City",
    country: "Mexico",
    flag: "🇲🇽",
    weekend: "October 23–25, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "20-p1", name: "P1", time: "2026-10-23T12:30:00" },
      { id: "20-p2", name: "P2", time: "2026-10-23T16:00:00" },
      { id: "20-p3", name: "P3", time: "2026-10-24T12:30:00" },
      { id: "20-q", name: "Q", time: "2026-10-24T16:00:00" },
      { id: "20-r", name: "R", time: "2026-10-25T14:00:00" }
    ]
  },
  {
    round: 21,
    name: "Brazilian GP",
    circuit: "Autodromo Jose Carlos Pace",
    city: "Sao Paulo",
    country: "Brazil",
    flag: "🇧🇷",
    weekend: "November 6–8, 2026",
    isSprint: true,
    status: "upcoming",
    sessions: [
      { id: "21-p1", name: "P1", time: "2026-11-06T12:30:00" },
      { id: "21-sq", name: "SQ", time: "2026-11-06T16:30:00" },
      { id: "21-sp", name: "SP", time: "2026-11-07T12:00:00" },
      { id: "21-q", name: "Q", time: "2026-11-07T16:00:00" },
      { id: "21-r", name: "R", time: "2026-11-08T14:00:00" }
    ]
  },
  {
    round: 22,
    name: "Las Vegas GP",
    circuit: "Las Vegas Strip Circuit",
    city: "Las Vegas",
    country: "USA",
    flag: "🇺🇸",
    weekend: "November 19–21, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "22-p1", name: "P1", time: "2026-11-19T20:30:00" },
      { id: "22-p2", name: "P2", time: "2026-11-20T02:00:00" },
      { id: "22-p3", name: "P3", time: "2026-11-20T21:30:00" },
      { id: "22-q", name: "Q", time: "2026-11-21T02:00:00" },
      { id: "22-r", name: "R", time: "2026-11-21T22:00:00" }
    ]
  },
  {
    round: 23,
    name: "Qatar GP",
    circuit: "Lusail International Circuit",
    city: "Lusail",
    country: "Qatar",
    flag: "🇶🇦",
    weekend: "November 27–29, 2026",
    isSprint: true,
    status: "upcoming",
    sessions: [
      { id: "23-p1", name: "P1", time: "2026-11-27T16:30:00" },
      { id: "23-sq", name: "SQ", time: "2026-11-27T20:30:00" },
      { id: "23-sp", name: "SP", time: "2026-11-28T16:00:00" },
      { id: "23-q", name: "Q", time: "2026-11-28T20:00:00" },
      { id: "23-r", name: "R", time: "2026-11-29T19:00:00" }
    ]
  },
  {
    round: 24,
    name: "Abu Dhabi GP",
    circuit: "Yas Marina Circuit",
    city: "Abu Dhabi",
    country: "UAE",
    flag: "🇦🇪",
    weekend: "December 4–6, 2026",
    isSprint: false,
    status: "upcoming",
    sessions: [
      { id: "24-p1", name: "P1", time: "2026-12-04T13:30:00" },
      { id: "24-p2", name: "P2", time: "2026-12-04T17:00:00" },
      { id: "24-p3", name: "P3", time: "2026-12-05T13:30:00" },
      { id: "24-q", name: "Q", time: "2026-12-05T17:00:00" },
      { id: "24-r", name: "R", time: "2026-12-06T17:00:00" }
    ]
  }
];
