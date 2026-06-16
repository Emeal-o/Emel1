export type CircuitStats = {
  length: number;    // km
  laps: number;
  turns: number;
  drsZones: number;
  firstGP: number;
  lapRecord: { time: string; driver: string; year: number } | null;
};

// Keyed by the circuitName string returned by the Jolpica/Ergast API
export const CIRCUIT_STATS: Record<string, CircuitStats> = {
  // ── Australia ──────────────────────────────────────────────────
  "Albert Park Grand Prix Circuit": {
    length: 5.278, laps: 58, turns: 16, drsZones: 4, firstGP: 1996,
    lapRecord: { time: "1:19.813", driver: "C. Leclerc", year: 2024 },
  },
  // ── China ──────────────────────────────────────────────────────
  "Shanghai International Circuit": {
    length: 5.451, laps: 56, turns: 16, drsZones: 2, firstGP: 2004,
    lapRecord: { time: "1:32.238", driver: "M. Schumacher", year: 2004 },
  },
  // ── Japan ──────────────────────────────────────────────────────
  "Suzuka Circuit": {
    length: 5.807, laps: 53, turns: 18, drsZones: 1, firstGP: 1987,
    lapRecord: { time: "1:30.965", driver: "K. Antonelli", year: 2025 },
  },
  // ── Bahrain ────────────────────────────────────────────────────
  "Bahrain International Circuit": {
    length: 5.412, laps: 57, turns: 15, drsZones: 3, firstGP: 2004,
    lapRecord: { time: "1:31.447", driver: "P. de la Rosa", year: 2005 },
  },
  // ── Saudi Arabia ───────────────────────────────────────────────
  "Jeddah Corniche Circuit": {
    length: 6.174, laps: 50, turns: 27, drsZones: 3, firstGP: 2021,
    lapRecord: { time: "1:30.734", driver: "L. Hamilton", year: 2021 },
  },
  // ── Miami ──────────────────────────────────────────────────────
  "Miami International Autodrome": {
    length: 5.412, laps: 57, turns: 19, drsZones: 3, firstGP: 2022,
    lapRecord: { time: "1:29.708", driver: "M. Verstappen", year: 2023 },
  },
  // ── Emilia Romagna / Imola ─────────────────────────────────────
  "Autodromo Enzo e Dino Ferrari": {
    length: 4.909, laps: 63, turns: 19, drsZones: 2, firstGP: 1980,
    lapRecord: { time: "1:15.484", driver: "L. Hamilton", year: 2020 },
  },
  // ── Monaco ─────────────────────────────────────────────────────
  "Circuit de Monaco": {
    length: 3.337, laps: 78, turns: 19, drsZones: 1, firstGP: 1950,
    lapRecord: { time: "1:12.909", driver: "L. Hamilton", year: 2021 },
  },
  // ── Spain (Barcelona) ──────────────────────────────────────────
  "Circuit de Barcelona-Catalunya": {
    length: 4.657, laps: 66, turns: 16, drsZones: 2, firstGP: 1991,
    lapRecord: { time: "1:16.330", driver: "O. Piastri", year: 2025 },
  },
  // ── Canada ─────────────────────────────────────────────────────
  "Circuit Gilles Villeneuve": {
    length: 4.361, laps: 70, turns: 14, drsZones: 2, firstGP: 1978,
    lapRecord: { time: "1:13.078", driver: "V. Bottas", year: 2019 },
  },
  // ── Austria ────────────────────────────────────────────────────
  "Red Bull Ring": {
    length: 4.318, laps: 71, turns: 10, drsZones: 3, firstGP: 1970,
    lapRecord: { time: "1:05.619", driver: "C. Sainz", year: 2020 },
  },
  // ── UK / Silverstone ───────────────────────────────────────────
  "Silverstone Circuit": {
    length: 5.891, laps: 52, turns: 18, drsZones: 2, firstGP: 1950,
    lapRecord: { time: "1:27.097", driver: "M. Verstappen", year: 2020 },
  },
  // ── Hungary ────────────────────────────────────────────────────
  "Hungaroring": {
    length: 4.381, laps: 70, turns: 14, drsZones: 2, firstGP: 1986,
    lapRecord: { time: "1:16.627", driver: "L. Hamilton", year: 2020 },
  },
  // ── Belgium / Spa ──────────────────────────────────────────────
  "Circuit de Spa-Francorchamps": {
    length: 7.004, laps: 44, turns: 19, drsZones: 2, firstGP: 1950,
    lapRecord: { time: "1:44.701", driver: "S. Perez", year: 2024 },
  },
  // ── Netherlands / Zandvoort ────────────────────────────────────
  "Circuit Zandvoort": {
    length: 4.259, laps: 72, turns: 14, drsZones: 2, firstGP: 1952,
    lapRecord: { time: "1:11.097", driver: "L. Hamilton", year: 2021 },
  },
  "Circuit Park Zandvoort": {
    length: 4.259, laps: 72, turns: 14, drsZones: 2, firstGP: 1952,
    lapRecord: { time: "1:11.097", driver: "L. Hamilton", year: 2021 },
  },
  // ── Italy / Monza ──────────────────────────────────────────────
  "Autodromo Nazionale di Monza": {
    length: 5.793, laps: 53, turns: 11, drsZones: 2, firstGP: 1950,
    lapRecord: { time: "1:20.901", driver: "L. Norris", year: 2025 },
  },
  // ── Spain / Madrid (2026 new street circuit) ──────────────────
  "Madring": {
    length: 5.47, laps: 55, turns: 16, drsZones: 3, firstGP: 2026,
    lapRecord: null,
  },
  // ── Azerbaijan / Baku ─────────────────────────────────────────
  "Baku City Circuit": {
    length: 6.003, laps: 51, turns: 20, drsZones: 2, firstGP: 2016,
    lapRecord: { time: "1:43.009", driver: "C. Leclerc", year: 2019 },
  },
  // ── Singapore ─────────────────────────────────────────────────
  "Marina Bay Street Circuit": {
    length: 4.940, laps: 62, turns: 23, drsZones: 3, firstGP: 2008,
    lapRecord: { time: "1:33.808", driver: "L. Hamilton", year: 2025 },
  },
  // ── USA / COTA ────────────────────────────────────────────────
  "Circuit of the Americas": {
    length: 5.513, laps: 56, turns: 20, drsZones: 2, firstGP: 2012,
    lapRecord: { time: "1:36.169", driver: "C. Leclerc", year: 2019 },
  },
  // ── Mexico ────────────────────────────────────────────────────
  "Autodromo Hermanos Rodriguez": {
    length: 4.304, laps: 71, turns: 17, drsZones: 2, firstGP: 1963,
    lapRecord: { time: "1:17.774", driver: "V. Bottas", year: 2021 },
  },
  "Autódromo Hermanos Rodríguez": {
    length: 4.304, laps: 71, turns: 17, drsZones: 2, firstGP: 1963,
    lapRecord: { time: "1:17.774", driver: "V. Bottas", year: 2021 },
  },
  // ── Brazil / Interlagos ───────────────────────────────────────
  "Autodromo Jose Carlos Pace": {
    length: 4.309, laps: 71, turns: 15, drsZones: 2, firstGP: 1973,
    lapRecord: { time: "1:10.540", driver: "V. Bottas", year: 2018 },
  },
  "Autódromo José Carlos Pace": {
    length: 4.309, laps: 71, turns: 15, drsZones: 2, firstGP: 1973,
    lapRecord: { time: "1:10.540", driver: "V. Bottas", year: 2018 },
  },
  // ── Las Vegas ─────────────────────────────────────────────────
  "Las Vegas Strip Street Circuit": {
    length: 6.201, laps: 50, turns: 17, drsZones: 2, firstGP: 2023,
    lapRecord: { time: "1:35.490", driver: "C. Leclerc", year: 2023 },
  },
  // ── Qatar / Lusail ────────────────────────────────────────────
  "Losail International Circuit": {
    length: 5.419, laps: 57, turns: 16, drsZones: 2, firstGP: 2021,
    lapRecord: { time: "1:22.384", driver: "L. Norris", year: 2024 },
  },
  // ── Abu Dhabi / Yas Marina ────────────────────────────────────
  "Yas Marina Circuit": {
    length: 5.281, laps: 58, turns: 21, drsZones: 2, firstGP: 2009,
    lapRecord: { time: "1:25.637", driver: "K. Magnussen", year: 2024 },
  },
};
