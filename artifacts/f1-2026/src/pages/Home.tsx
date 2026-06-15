import { useState, useMemo } from "react";
import { useF1Schedule } from "../hooks/useF1Schedule";
import { useF1Standings } from "../hooks/useF1Standings";
import { useF1Results } from "../hooks/useF1Results";
import { useF1Qualifying } from "../hooks/useF1Qualifying";
import { useTheme } from "../hooks/useTheme";
import { useLiveSession } from "../hooks/useLiveSession";
import { useF1PointsHistory } from "../hooks/useF1PointsHistory";
import Countdown from "../components/Countdown";
import RaceCard from "../components/RaceCard";
import SessionLegend from "../components/SessionLegend";
import DriversStandings from "../components/DriversStandings";
import ConstructorsStandings from "../components/ConstructorsStandings";
import ChampionshipChart from "../components/ChampionshipChart";
import TabBar, { TabId } from "../components/TabBar";
import ThemeSwitcher from "../components/ThemeSwitcher";
import CalendarFilter, { FilterState, filterRaces } from "../components/CalendarFilter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw, Radio } from "lucide-react";

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-card/40 border border-border animate-pulse" />
      ))}
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

const tabVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("calendar");
  const [prevTab, setPrevTab] = useState<TabId>("calendar");
  const [calFilter, setCalFilter] = useState<FilterState>({ query: "", sprintOnly: false });
  const [tick, setTick] = useState(0); // for "updated X ago" re-render

  const { theme, setTheme } = useTheme();

  // Detect live session to drive fast refresh
  const scheduleForLive = useF1Schedule(300_000);
  const liveRaces = scheduleForLive.status === "success" ? scheduleForLive.races : [];
  const liveSession = useLiveSession(liveRaces);
  const refreshMs = liveSession ? 30_000 : 180_000;

  // All data hooks with coordinated refresh interval
  const schedule   = useF1Schedule(refreshMs);
  const standings  = useF1Standings(refreshMs);

  const completedRounds = useMemo(() =>
    schedule.status === "success"
      ? schedule.races.filter((r) => r.status === "completed").map((r) => r.round)
      : [],
    [schedule]
  );

  const resultsState   = useF1Results(completedRounds, refreshMs);
  const qualifyingState = useF1Qualifying(completedRounds, refreshMs);

  // Championship chart data (derived, no extra API)
  const byRound = resultsState.status === "success" ? resultsState.byRound : null;
  const pointsHistory = useF1PointsHistory(byRound);

  const allRaces     = schedule.status === "success" ? schedule.races : [];
  const visibleRaces = filterRaces(allRaces, calFilter);

  const isLive      = schedule.status === "success" || standings.status === "success";
  const hasAnyError = schedule.status === "error" && standings.status === "error";

  // Last updated timestamp (most recent of all data sources)
  const lastUpdated = useMemo(() => {
    const ts = [
      schedule.status   === "success" ? schedule.lastUpdated   : 0,
      standings.status  === "success" ? standings.lastUpdated  : 0,
      resultsState.status === "success" ? resultsState.lastUpdated : 0,
    ];
    return Math.max(...ts);
  }, [schedule, standings, resultsState]);

  // Re-render "X ago" every 15s
  useState(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  });

  const direction = activeTab === "standings" && prevTab === "calendar" ? 1 : -1;

  function handleTabChange(id: TabId) {
    setPrevTab(activeTab);
    setActiveTab(id);
  }

  return (
    <div className="min-h-[100dvh] w-full pb-24">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center transform -skew-x-12 shrink-0">
              <span className="text-primary-foreground font-black italic text-sm sm:text-lg tracking-tighter">F1</span>
            </div>
            <h1 className="font-bold tracking-widest uppercase text-xs sm:text-sm md:text-base hidden sm:block">
              2026 World Championship
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />

            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              {liveSession && (
                <span className="flex items-center gap-1 text-primary font-bold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span className="hidden sm:inline">LIVE</span>
                </span>
              )}
              {!liveSession && !isLive && !hasAnyError && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              {!liveSession && isLive && (
                <span className="flex items-center gap-1 text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="hidden sm:inline text-muted-foreground">
                    {lastUpdated > 0 ? timeAgo(lastUpdated) : "live"}
                  </span>
                </span>
              )}
              {hasAnyError && (
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 md:pt-12 flex flex-col gap-10">

        {/* Hero */}
        <section className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Command{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Center
              </span>
            </h2>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl">
              Live schedule and standings for the 2026 FIA Formula One World Championship.
              All times UTC+3.{" "}
              {liveSession && (
                <span className="text-primary font-bold animate-pulse">
                  {liveSession.session.name} IS LIVE — {liveSession.race.name}
                </span>
              )}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            {schedule.status === "loading" && (
              <div className="w-full border border-border bg-card p-8 rounded-xl flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-mono text-sm">Loading schedule…</span>
              </div>
            )}
            {schedule.status === "error" && (
              <div className="w-full border border-destructive/30 bg-destructive/5 p-6 rounded-xl flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="font-mono text-sm">{schedule.message}</span>
              </div>
            )}
            {schedule.status === "success" && (
              <Countdown races={schedule.races} liveSession={liveSession} />
            )}
          </motion.div>
        </section>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <TabBar active={activeTab} onChange={handleTabChange} />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60">
            {activeTab === "calendar" ? "All times UTC+3" : "Updated after each completed race"}
            {lastUpdated > 0 && (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5" />
                {timeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Tab panels */}
        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>

            {activeTab === "calendar" && (
              <motion.div
                key="calendar"
                custom={direction}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="flex flex-col gap-6"
              >
                <SessionLegend />

                {schedule.status === "success" && (
                  <CalendarFilter
                    filter={calFilter}
                    setFilter={setCalFilter}
                    total={allRaces.length}
                    filtered={visibleRaces.length}
                  />
                )}

                {schedule.status === "loading" && <LoadingSkeleton rows={8} />}

                {schedule.status === "success" && visibleRaces.length === 0 && (
                  <div className="text-center text-muted-foreground font-mono text-sm py-16 border border-dashed border-border/50 rounded-xl">
                    No races match your search.
                  </div>
                )}

                {schedule.status === "success" && visibleRaces.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {visibleRaces.map((race, index) => (
                      <motion.div
                        key={race.round}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * index }}
                      >
                        <RaceCard
                          race={race}
                          isNext={race.status === "next"}
                          results={
                            resultsState.status === "success"
                              ? resultsState.byRound.get(race.round)
                              : undefined
                          }
                          qualifying={
                            qualifyingState.status === "success"
                              ? qualifyingState.byRound.get(race.round)
                              : undefined
                          }
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {schedule.status === "error" && (
                  <div className="text-center text-muted-foreground font-mono text-sm py-12">
                    Could not load race calendar.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "standings" && (
              <motion.div
                key="standings"
                custom={direction}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="flex flex-col gap-10"
              >
                {standings.status === "loading" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <LoadingSkeleton rows={10} />
                    <LoadingSkeleton rows={10} />
                  </div>
                )}
                {standings.status === "error" && (
                  <div className="border border-destructive/30 bg-destructive/5 p-6 rounded-xl flex items-center gap-3 text-destructive">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-mono text-sm">Standings unavailable: {standings.message}</span>
                  </div>
                )}
                {standings.status === "success" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <DriversStandings drivers={standings.drivers} round={standings.round} />
                    <ConstructorsStandings constructors={standings.constructors} />
                  </div>
                )}

                {/* Championship points chart */}
                {pointsHistory.rows.length > 0 && (
                  <div className="border border-border rounded-xl bg-card/40 p-4 sm:p-6">
                    <ChampionshipChart history={pointsHistory} />
                  </div>
                )}
                {pointsHistory.rows.length === 0 && resultsState.status === "success" && (
                  <div className="border border-dashed border-border/50 rounded-xl p-8 flex items-center justify-center text-muted-foreground font-mono text-sm">
                    Championship chart available after Round 1
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
