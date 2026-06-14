import { CALENDAR } from "../data/calendar";
import Countdown from "../components/Countdown";
import RaceCard from "../components/RaceCard";
import SessionLegend from "../components/SessionLegend";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full pb-20">
      {/* Navbar / Header */}
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
          <div className="text-xs font-mono text-muted-foreground">
            LIVE CALENDAR
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 md:pt-12 flex flex-col gap-12">
        
        {/* Hero Section */}
        <section className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">Center</span>
            </h2>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl">
              Real-time telemetry and schedule data for the 2026 FIA Formula One World Championship.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Countdown />
          </motion.div>
        </section>

        {/* Legend */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SessionLegend />
        </motion.section>

        {/* Calendar List */}
        <section className="flex flex-col gap-4 relative">
          {/* Timeline decoration line */}
          <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-border to-border/10 hidden md:block" />
          
          <div className="flex flex-col gap-4">
            {CALENDAR.map((race, index) => (
              <motion.div
                key={race.round}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <RaceCard race={race} isNext={race.status === "NEXT"} />
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
