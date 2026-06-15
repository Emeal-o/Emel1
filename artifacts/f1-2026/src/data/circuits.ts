export type CircuitStats = {
  length: number;    // km
  laps: number;
  drsZones: number;
  firstGP: number;
  lapRecord: { time: string; driver: string; year: number };
};

// Keyed by round number (1-22 for 2026 season)
export const CIRCUIT_STATS: Record<number, CircuitStats> = {
  1:  { length: 5.278, laps: 58, drsZones: 4, firstGP: 1996, lapRecord: { time: "1:19.908", driver: "G. Russell",   year: 2023 } },
  2:  { length: 5.451, laps: 56, drsZones: 2, firstGP: 2004, lapRecord: { time: "1:31.361", driver: "M. Verstappen",year: 2024 } },
  3:  { length: 5.807, laps: 53, drsZones: 1, firstGP: 1987, lapRecord: { time: "1:30.983", driver: "C. Leclerc",   year: 2024 } },
  4:  { length: 5.412, laps: 57, drsZones: 3, firstGP: 2004, lapRecord: { time: "1:31.447", driver: "P. de la Rosa",year: 2005 } },
  5:  { length: 6.174, laps: 50, drsZones: 3, firstGP: 2021, lapRecord: { time: "1:27.653", driver: "C. Leclerc",   year: 2022 } },
  6:  { length: 5.513, laps: 56, drsZones: 2, firstGP: 2012, lapRecord: { time: "1:36.169", driver: "C. Sainz",     year: 2023 } },
  7:  { length: 4.909, laps: 63, drsZones: 2, firstGP: 1980, lapRecord: { time: "1:15.484", driver: "M. Verstappen",year: 2022 } },
  8:  { length: 3.337, laps: 78, drsZones: 1, firstGP: 1950, lapRecord: { time: "1:12.909", driver: "C. Leclerc",   year: 2021 } },
  9:  { length: 4.657, laps: 66, drsZones: 2, firstGP: 1991, lapRecord: { time: "1:16.330", driver: "M. Verstappen",year: 2023 } },
  10: { length: 4.361, laps: 70, drsZones: 2, firstGP: 1978, lapRecord: { time: "1:13.078", driver: "V. Bottas",    year: 2019 } },
  11: { length: 4.318, laps: 71, drsZones: 3, firstGP: 1970, lapRecord: { time: "1:05.619", driver: "C. Sainz",     year: 2020 } },
  12: { length: 5.891, laps: 52, drsZones: 2, firstGP: 1950, lapRecord: { time: "1:27.097", driver: "M. Verstappen",year: 2020 } },
  13: { length: 4.381, laps: 70, drsZones: 2, firstGP: 1986, lapRecord: { time: "1:16.627", driver: "L. Hamilton",  year: 2020 } },
  14: { length: 7.004, laps: 44, drsZones: 2, firstGP: 1950, lapRecord: { time: "1:41.252", driver: "M. Verstappen",year: 2023 } },
  15: { length: 4.259, laps: 72, drsZones: 2, firstGP: 1952, lapRecord: { time: "1:11.097", driver: "M. Verstappen",year: 2021 } },
  16: { length: 5.793, laps: 53, drsZones: 2, firstGP: 1950, lapRecord: { time: "1:21.046", driver: "R. Barrichello",year: 2004 } },
  17: { length: 6.003, laps: 51, drsZones: 2, firstGP: 2016, lapRecord: { time: "1:43.009", driver: "C. Leclerc",   year: 2019 } },
  18: { length: 4.940, laps: 62, drsZones: 3, firstGP: 2008, lapRecord: { time: "1:30.984", driver: "C. Sainz",     year: 2023 } },
  19: { length: 4.304, laps: 71, drsZones: 2, firstGP: 1963, lapRecord: { time: "1:17.774", driver: "V. Bottas",    year: 2021 } },
  20: { length: 4.309, laps: 71, drsZones: 2, firstGP: 1973, lapRecord: { time: "1:10.540", driver: "V. Bottas",    year: 2018 } },
  21: { length: 5.419, laps: 57, drsZones: 2, firstGP: 2021, lapRecord: { time: "1:24.319", driver: "M. Verstappen",year: 2023 } },
  22: { length: 5.281, laps: 58, drsZones: 2, firstGP: 2009, lapRecord: { time: "1:26.103", driver: "M. Verstappen",year: 2021 } },
};
