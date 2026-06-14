import { Theme } from "../hooks/useTheme";
import { motion } from "framer-motion";

const THEME_CONFIG: Record<Theme, { label: string; icon: string; title: string }> = {
  dark:   { label: "Dark",   icon: "🌑", title: "Carbon Dark"   },
  light:  { label: "Light",  icon: "☀️",  title: "Pitlane White" },
  monaco: { label: "Monaco", icon: "🏎",  title: "Monaco Night"  },
};

export default function ThemeSwitcher({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  const themes: Theme[] = ["dark", "light", "monaco"];

  return (
    <div
      className="flex items-center gap-0.5 p-1 rounded-lg bg-muted/60 border border-border"
      role="group"
      aria-label="Theme switcher"
    >
      {themes.map((t) => {
        const cfg = THEME_CONFIG[t];
        const isActive = theme === t;
        return (
          <button
            key={t}
            data-testid={`theme-${t}`}
            onClick={() => setTheme(t)}
            title={cfg.title}
            className={`
              relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold
              transition-colors duration-200
              ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 rounded-md bg-card border border-border shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10 text-sm leading-none">{cfg.icon}</span>
            <span className="relative z-10 hidden sm:inline uppercase tracking-wider">{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}
