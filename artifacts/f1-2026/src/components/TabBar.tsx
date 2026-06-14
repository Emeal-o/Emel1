import { motion } from "framer-motion";

export type TabId = "calendar" | "standings";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "calendar", label: "Race Calendar", icon: "🗓" },
  { id: "standings", label: "Championship", icon: "🏆" },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="relative flex gap-1 p-1 rounded-xl bg-card border border-border w-full sm:w-auto">
      {/* Sliding background pill */}
      {TABS.map((tab) =>
        tab.id === active ? (
          <motion.div
            key="pill"
            layoutId="tab-pill"
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
          className={`
            relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest
            transition-colors duration-200 flex-1 justify-center sm:flex-none sm:justify-start
            ${active === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}
          `}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  );
}
