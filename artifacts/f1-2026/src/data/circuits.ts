export type CircuitStats = {
  length: number;    // km
  laps: number;
  drsZones: number;
  firstGP: number;
  lapRecord: { time: string; driver: string; year: number };
};

// Keyed by the circuitName string returned by the Jolpica/Ergast API
export const CIRCUIT_STATS: Record<string, CircuitStats> = {
  // ── Australia ──────────────────────────────────────────────────
  "Albert Park Grand Prix Circuit": {
    length: 5.278, laps: 58, drsZones: 4, firstGP: 1996,
    lapRecord: { time: "1:19.908", driver: "G. Russell", year: 2023 },
  },
  // ── China ──────────────────────────────────────────────────────
  "Shanghai International Circuit": {
    length: 5.451, laps: 56, drsZones: 2, firstGP: 2004,
    lapRecord: { time: "1:31.361", driver: "M. Verstappen", year: 2024 },
  },
  // ── Japan ──────────────────────────────────────────────────────
  "Suzuka Circuit": {
    length: 5.807, laps: 53, drsZones: 1, firstGP: 1987,
    lapRecord: { time: "1:30.983", driver: "C. Leclerc", year: 2024 },
  },
  // ── Bahrain ────────────────────────────────────────────────────
  "Bahrain International Circuit": {
    length: 5.412, laps: 57, drsZones: 3, firstGP: 2004,
    lapRecord: { time: "1:31.447", driver: "P. de la Rosa", year: 2005 },
  },
  // ── Saudi Arabia ───────────────────────────────────────────────
  "Jeddah Corniche Circuit": {
    length: 6.174, laps: 50, drsZones: 3, firstGP: 2021,
    lapRecord: { time: "1:27.653", driver: "C. Leclerc", year: 2022 },
  },
  // ── Miami ──────────────────────────────────────────────────────
  "Miami International Autodrome": {
    length: 5.412, laps: 57, drsZones: 3, firstGP: 2022,
    lapRecord: { time: "1:29.708", driver: "M. Verstappen", year: 2023 },
  },
  // ── Emilia Romagna / Imola ─────────────────────────────────────
  "Autodromo Enzo e Dino Ferrari": {
    length: 4.909, laps: 63, drsZones: 2, firstGP: 1980,
    lapRecord: { time: "1:15.484", driver: "M. Verstappen", year: 2022 },
  },
  // ── Monaco ─────────────────────────────────────────────────────
  "Circuit de Monaco": {
    length: 3.337, laps: 78, drsZones: 1, firstGP: 1950,
    lapRecord: { time: "1:12.909", driver: "C. Leclerc", year: 2021 },
  },
  // ── Spain ──────────────────────────────────────────────────────
  "Circuit de Barcelona-Catalunya": {
    length: 4.657, laps: 66, drsZones: 2, firstGP: 1991,
    lapRecord: { time: "1:16.330", driver: "M. Verstappen", year: 2023 },
  },
  // ── Canada ─────────────────────────────────────────────────────
  "Circuit Gilles Villeneuve": {
    length: 4.361, laps: 70, drsZones: 2, firstGP: 1978,
    lapRecord: { time: "1:13.078", driver: "V. Bottas", year: 2019 },
  },
  // ── Austria ────────────────────────────────────────────────────
  "Red Bull Ring": {
    length: 4.318, laps: 71, drsZones: 3, firstGP: 1970,
    lapRecord: { time: "1:05.619", driver: "C. Sainz", year: 2020 },
  },
  // ── UK / Silverstone ───────────────────────────────────────────
  "Silverstone Circuit": {
    length: 5.891, laps: 52, drsZones: 2, firstGP: 1950,
    lapRecord: { time: "1:27.097", driver: "M. Verstappen", year: 2020 },
  },
  // ── Hungary ────────────────────────────────────────────────────
  "Hungaroring": {
    length: 4.381, laps: 70, drsZones: 2, firstGP: 1986,
    lapRecord: { time: "1:16.627", driver: "L. Hamilton", year: 2020 },
  },
  // ── Belgium / Spa ──────────────────────────────────────────────
  "Circuit de Spa-Francorchamps": {
    length: 7.004, laps: 44, drsZones: 2, firstGP: 1950,
    lapRecord: { time: "1:41.252", driver: "M. Verstappen", year: 2023 },
  },
  // ── Netherlands / Zandvoort ────────────────────────────────────
  "Circuit Zandvoort": {
    length: 4.259, laps: 72, drsZones: 2, firstGP: 1952,
    lapRecord: { time: "1:11.097", driver: "M. Verstappen", year: 2021 },
  },
  // ── Italy / Monza ──────────────────────────────────────────────
  "Autodromo Nazionale di Monza": {
    length: 5.793, laps: 53, drsZones: 2, firstGP: 1950,
    lapRecord: { time: "1:21.046", driver: "R. Barrichello", year: 2004 },
  },
  // ── Azerbaijan / Baku ─────────────────────────────────────────
  "Baku City Circuit": {
    length: 6.003, laps: 51, drsZones: 2, firstGP: 2016,
    lapRecord: { time: "1:43.009", driver: "C. Leclerc", year: 2019 },
  },
  // ── Singapore ─────────────────────────────────────────────────
  "Marina Bay Street Circuit": {
    length: 4.940, laps: 62, drsZones: 3, firstGP: 2008,
    lapRecord: { time: "1:30.984", driver: "C. Sainz", year: 2023 },
  },
  // ── USA / COTA ────────────────────────────────────────────────
  "Circuit of the Americas": {
    length: 5.513, laps: 56, drsZones: 2, firstGP: 2012,
    lapRecord: { time: "1:36.169", driver: "C. Sainz", year: 2023 },
  },
  // ── Mexico ────────────────────────────────────────────────────
  "Autodromo Hermanos Rodriguez": {
    length: 4.304, laps: 71, drsZones: 2, firstGP: 1963,
    lapRecord: { time: "1:17.774", driver: "V. Bottas", year: 2021 },
  },
  // ── Brazil / Interlagos ───────────────────────────────────────
  "Autodromo Jose Carlos Pace": {
    length: 4.309, laps: 71, drsZones: 2, firstGP: 1973,
    lapRecord: { time: "1:10.540", driver: "V. Bottas", year: 2018 },
  },
  // ── Las Vegas ─────────────────────────────────────────────────
  "Las Vegas Strip Street Circuit": {
    length: 6.201, laps: 50, drsZones: 2, firstGP: 2023,
    lapRecord: { time: "1:35.490", driver: "C. Leclerc", year: 2023 },
  },
  // ── Qatar / Lusail ────────────────────────────────────────────
  "Losail International Circuit": {
    length: 5.419, laps: 57, drsZones: 2, firstGP: 2021,
    lapRecord: { time: "1:24.319", driver: "M. Verstappen", year: 2023 },
  },
  // ── Abu Dhabi / Yas Marina ────────────────────────────────────
  "Yas Marina Circuit": {
    length: 5.281, laps: 58, drsZones: 2, firstGP: 2009,
    lapRecord: { time: "1:26.103", driver: "M. Verstappen", year: 2021 },
  },
};
