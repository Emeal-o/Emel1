import { useState } from "react";
import { useF1Schedule } from "../hooks/useF1Schedule";
import { useF1Standings } from "../hooks/useF1Standings";
import { useF1Results } from "../hooks/useF1Results";
import Countdown from "../components/Countdown";
import RaceCard from "../components/RaceCard";
import SessionLegend from "../components/SessionLegend";
import DriversStandings from "../components/DriversStandings";
import ConstructorsStandings from "../components/ConstructorsStandings";
import TabBar, { TabId } from "../components/TabBar";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-card/40 border border-border animate-pulse" />
      ))}
    </div>
  );
}

const tabVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("calendar");
  const [prevTab, setPrevTab] = useState<TabId>("calendar");

  const schedule = useF1Schedule();
  const standings = useF1Standings();
  const resultsState = useF1Results();

  const isLive = schedule.status === "success" || standings.status === "success";
  const hasAnyError = schedule.status === "error" && standings.status === "error";

  const direction = activeTab === "standings" && prevTab === "calendar" ? 1 : -1;

  function handleTabChange(id: TabId) {
    setPrevTab(activeTab);
    setActiveTab(id);
  }

  return (
    <div className="min-h-[100dvh] w-full pb-24">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center transform -skew-x-12">
              <span className="text-white font-black italic text-lg tracking-tighter">F1</span>
            </div>
            <h1 className="font-bold tracking-widest uppercase text-sm md:text-base hidden sm:block">
              2026 World Championship
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            {!isLive && !hasAnyError && <Loader2 className="w-3 h-3 animate-spin" />}
            {isLive && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE DATA
              </span>
            )}
            {hasAnyError && (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> API ERROR
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 md:pt-12 flex flex-col gap-10">

        {/* Hero + Countdown — always visible */}
        <section className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Command{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">
                Center
              </span>
            </h2>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl">
              Live schedule and standings for the 2026 FIA Formula One World Championship.
              All times UTC+3.
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
            {schedule.status === "success" && <Countdown races={schedule.races} />}
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
          <p className="text-xs font-mono text-muted-foreground hidden sm:block">
            {activeTab === "calendar" ? "All times UTC+3" : "Updated after each completed race"}
          </p>
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
                className="flex flex-col gap-8"
              >
                {/* Session legend */}
                <SessionLegend />

                {/* Race cards */}
                {schedule.status === "loading" && <LoadingSkeleton rows={8} />}
                {schedule.status === "success" && (
                  <div className="flex flex-col gap-4">
                    {schedule.races.map((race, index) => (
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
                className="flex flex-col gap-8"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
