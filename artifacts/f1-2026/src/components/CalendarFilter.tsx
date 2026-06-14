import { Search, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RaceData } from "../data/calendar";

export type FilterState = {
  query: string;
  sprintOnly: boolean;
};

export function filterRaces(races: RaceData[], filter: FilterState): RaceData[] {
  let out = races;
  if (filter.sprintOnly) {
    out = out.filter((r) => r.isSprint);
  }
  if (filter.query.trim()) {
    const q = filter.query.toLowerCase();
    out = out.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.circuit.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
    );
  }
  return out;
}

export default function CalendarFilter({
  filter,
  setFilter,
  total,
  filtered,
}: {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  total: number;
  filtered: number;
}) {
  const hasFilter = filter.query.trim() !== "" || filter.sprintOnly;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search race, country, circuit…"
          value={filter.query}
          onChange={(e) => setFilter({ ...filter, query: e.target.value })}
          data-testid="input-calendar-search"
          className="w-full pl-9 pr-9 py-2 rounded-lg bg-card border border-border text-sm font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
        />
        <AnimatePresence>
          {filter.query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setFilter({ ...filter, query: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-clear-search"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Sprint toggle */}
      <button
        data-testid="button-sprint-filter"
        onClick={() => setFilter({ ...filter, sprintOnly: !filter.sprintOnly })}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all
          ${filter.sprintOnly
            ? "bg-[hsl(45_90%_50%/0.15)] text-[hsl(45_90%_55%)] border-[hsl(45_90%_50%/0.4)]"
            : "bg-card text-muted-foreground border-border hover:border-muted-foreground/50"
          }
        `}
      >
        <Zap className="w-3.5 h-3.5" />
        Sprint Weekends
      </button>

      {/* Result count */}
      <AnimatePresence>
        {hasFilter && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground"
          >
            <span>
              <span className={`font-bold ${filtered === 0 ? "text-destructive" : "text-foreground"}`}>
                {filtered}
              </span>
              /{total} races
            </span>
            <button
              onClick={() => setFilter({ query: "", sprintOnly: false })}
              className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              data-testid="button-clear-all-filters"
            >
              clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
