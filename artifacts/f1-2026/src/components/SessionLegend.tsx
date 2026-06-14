import { Trophy, Zap } from "lucide-react";

const ITEMS = [
  {
    badge: "P",
    label: "Practice (1-3)",
    badgeCls: "bg-muted/30 border-muted-foreground/20 text-muted-foreground",
  },
  {
    badge: "Q",
    label: "Qualifying",
    badgeCls: "bg-secondary border-border text-foreground",
  },
  {
    badge: "SQ",
    label: "Sprint Quali",
    badgeCls: "bg-sprint/10 border-sprint/20 text-sprint",
  },
  {
    badge: "SP",
    label: "Sprint",
    badgeCls: "bg-sprint/10 border-sprint/20 text-sprint",
    icon: <Zap className="w-3 h-3 text-sprint shrink-0" />,
  },
  {
    badge: "R",
    label: "Race",
    badgeCls: "bg-primary/10 border-primary/20 text-primary",
    icon: <Trophy className="w-3 h-3 text-primary shrink-0" />,
    labelCls: "text-foreground font-medium",
  },
];

export default function SessionLegend() {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3 p-3 sm:p-4 rounded-xl bg-card border border-border text-sm">
      {ITEMS.map((item) => (
        <div key={item.badge} className="flex items-center gap-2 min-w-0">
          <span className={`w-7 sm:w-8 text-center py-0.5 sm:py-1 rounded border font-mono font-bold text-xs shrink-0 ${item.badgeCls}`}>
            {item.badge}
          </span>
          <span className={`text-muted-foreground flex items-center gap-1 text-xs sm:text-sm truncate ${item.labelCls ?? ""}`}>
            {item.label}
            {item.icon}
          </span>
        </div>
      ))}
    </div>
  );
}
