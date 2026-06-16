import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS = [
  { badge: "P1–3", label: "Practice", badgeCls: "bg-muted/30 border-muted-foreground/20 text-muted-foreground" },
  { badge: "Q",    label: "Qualifying", badgeCls: "bg-secondary border-border text-foreground" },
  { badge: "SQ",   label: "Sprint Quali", badgeCls: "bg-[hsl(45_90%_50%/0.12)] border-[hsl(45_90%_50%/0.3)] text-[hsl(45_90%_55%)]" },
  { badge: "SP",   label: "Sprint Race", badgeCls: "bg-[hsl(45_90%_50%/0.12)] border-[hsl(45_90%_50%/0.3)] text-[hsl(45_90%_55%)]" },
  { badge: "R",    label: "Race", badgeCls: "bg-primary/10 border-primary/20 text-primary" },
];

export default function SessionLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {ITEMS.map((item) => (
            <span
              key={item.badge}
              className={`px-1.5 py-0.5 rounded border font-mono font-bold text-[10px] ${item.badgeCls}`}
            >
              {item.badge}
            </span>
          ))}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-2 p-3 sm:p-4">
              {ITEMS.map((item) => (
                <div key={item.badge} className="flex items-center gap-2">
                  <span className={`w-8 text-center py-0.5 rounded border font-mono font-bold text-[10px] shrink-0 ${item.badgeCls}`}>
                    {item.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
