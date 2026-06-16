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
import ThemeSwitcher from "../components/ThemeSwitcher";
import CalendarFilter, { FilterState, filterRaces } from "../components/CalendarFilter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw, Radio, CalendarDays, Trophy } from "lucide-react";

export type TabId = "calendar" | "standings";

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
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

// ── Bottom nav (mobile) ────────────────────────────────────────────
function BottomNav({
  active,
  onChange,
  liveSession,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
  liveSession: boolean;
}) {
  const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: "calendar",  label: "Race",         Icon: CalendarDays },
    { id: "standings", label: "Championship", Icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/90 backdrop-blur-xl border-t border-border/60 safe-area-pb">
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
              {id === "calendar" && liveSession && (
                <span className="absolute top-2 right-[calc(25%_-_10px)] w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Desktop tab bar ────────────────────────────────────────────────
function DesktopTabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: "calendar",  label: "Race Calendar", icon: "🗓" },
    { id: "standings", label: "Championship",  icon: "🏆" },
  ];

  return (
    <div className="hidden sm:flex relative gap-1 p-1 rounded-xl bg-card border border-border w-auto">
      {TABS.map((tab) =>
        tab.id === active ? (
          <motion.div
            key="pill"
            layoutId="desktop-tab-pill"
            className="absolute inset-1 rounded-lg"
            style={{
              left: active === TABS[0].id ? "4px" : "50%",
              right: active === TABS[1].id ? "4px" : "50%",
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        ) : null
      )}
      {TABS.map((tab) => (
        <button
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors duration-200
            ${active === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("calendar");
  const [prevTab, setPrevTab]     = useState<TabId>("calendar");
  const [calFilter, setCalFilter] = useState<FilterState>({ query: "", sprintOnly: false });
  const [tick, setTick]           = useState(0);

  const { theme, setTheme } = useTheme();

  const scheduleForLive = useF1Schedule(300_000);
  const liveRaces = scheduleForLive.status === "success" ? scheduleForLive.races : [];
  const liveSession = useLiveSession(liveRaces);
  const refreshMs = liveSession ? 30_000 : 180_000;

  const schedule   = useF1Schedule(refreshMs);
  const standings  = useF1Standings(refreshMs);

  const completedRounds = useMemo(() =>
    schedule.status === "success"
      ? schedule.races.filter((r) => r.status === "completed").map((r) => r.round)
      : [],
    [schedule]
  );

  const qualifyingRounds = useMemo(() =>
    schedule.status === "success"
      ? schedule.races.filter((r) => r.qualifyingDone || r.status === "completed").map((r) => r.round)
      : [],
    [schedule]
  );

  const resultsState    = useF1Results(completedRounds, refreshMs);
  const qualifyingState = useF1Qualifying(qualifyingRounds, refreshMs);

  const byRound = resultsState.status === "success" ? resultsState.byRound : null;
  const pointsHistory = useF1PointsHistory(byRound);

  const allRaces     = schedule.status === "success" ? schedule.races : [];
  const visibleRaces = filterRaces(allRaces, calFilter);

  const isLive      = schedule.status === "success" || standings.status === "success";
  const hasAnyError = schedule.status === "error" && standings.status === "error";

  const lastUpdated = useMemo(() => {
    const ts = [
      schedule.status   === "success" ? schedule.lastUpdated   : 0,
      standings.status  === "success" ? standings.lastUpdated  : 0,
      resultsState.status === "success" ? resultsState.lastUpdated : 0,
    ];
    return Math.max(...ts);
  }, [schedule, standings, resultsState]);

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
    <div className="min-h-[100dvh] w-full pb-20 sm:pb-10">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-13 sm:h-15 flex items-center justify-between gap-3 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center transform -skew-x-12 shrink-0">
              <span className="text-primary-foreground font-black italic text-sm sm:text-base tracking-tighter">F1</span>
            </div>
            <h1 className="font-black tracking-widest uppercase text-xs sm:text-sm">
              <span className="sm:hidden">2026 Season</span>
              <span className="hidden sm:inline">2026 World Championship</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />

            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              {liveSession && (
                <span className="flex items-center gap-1 text-primary font-bold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span className="hidden sm:inline text-xs uppercase tracking-wider">Live</span>
                </span>
              )}
              {!liveSession && !isLive && !hasAnyError && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              {!liveSession && isLive && (
                <span className="flex items-center gap-1 text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="hidden sm:inline text-muted-foreground text-[11px]">
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

      <main className="max-w-5xl mx-auto px-4 pt-6 sm:pt-10 flex flex-col gap-8">

        {/* Hero */}
        <section className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Command{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
                Center
              </span>
            </h2>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm">
              2026 FIA Formula One World Championship · All times UTC+3
              {liveSession && (
                <span className="ml-2 text-primary font-bold animate-pulse">
                  · {liveSession.session.name} LIVE — {liveSession.race.name}
                </span>
              )}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}>
            {schedule.status === "loading" && (
              <div className="w-full border border-border bg-card p-6 rounded-xl flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono text-sm">Loading schedule…</span>
              </div>
            )}
            {schedule.status === "error" && (
              <div className="w-full border border-destructive/30 bg-destructive/5 p-5 rounded-xl flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-mono text-sm">{schedule.message}</span>
              </div>
            )}
            {schedule.status === "success" && (
              <Countdown races={schedule.races} liveSession={liveSession} />
            )}
          </motion.div>
        </section>

        {/* Desktop tab bar + meta */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="hidden sm:flex items-center justify-between gap-4 flex-wrap"
        >
          <DesktopTabBar active={activeTab} onChange={handleTabChange} />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50">
            {activeTab === "calendar" ? "All times UTC+3" : "Updated after each race"}
            {lastUpdated > 0 && (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5" />
                {timeAgo(lastUpdated)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Mobile tab label */}
        <div className="sm:hidden flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {activeTab === "calendar" ? "🗓 Race Calendar" : "🏆 Championship"}
          </h2>
          {lastUpdated > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50">
              <RefreshCw className="w-2.5 h-2.5" />
              {timeAgo(lastUpdated)}
            </span>
          )}
        </div>

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
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-5"
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
                  <div className="flex flex-col gap-3">
                    {visibleRaces.map((race, index) => (
                      <motion.div
                        key={race.round}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.025 * Math.min(index, 8) }}
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
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-8"
              >
                {standings.status === "loading" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <LoadingSkeleton rows={10} />
                    <LoadingSkeleton rows={10} />
                  </div>
                )}
                {standings.status === "error" && (
                  <div className="border border-destructive/30 bg-destructive/5 p-5 rounded-xl flex items-center gap-3 text-destructive">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-sm">Standings unavailable: {standings.message}</span>
                  </div>
                )}
                {standings.status === "success" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DriversStandings drivers={standings.drivers} round={standings.round} />
                    <ConstructorsStandings constructors={standings.constructors} />
                  </div>
                )}

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

      {/* Sticky bottom nav — mobile only */}
      <BottomNav
        active={activeTab}
        onChange={handleTabChange}
        liveSession={!!liveSession}
      />
    </div>
  );
}
