import { Trophy, Zap } from "lucide-react";

export default function SessionLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 rounded-xl bg-card border border-border text-sm">
      <div className="flex items-center gap-2">
        <span className="w-8 text-center py-1 rounded bg-muted/30 border border-muted-foreground/20 text-muted-foreground font-mono font-bold text-xs">P</span>
        <span className="text-muted-foreground">Practice (1-3)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 text-center py-1 rounded bg-secondary border border-border text-foreground font-mono font-bold text-xs">Q</span>
        <span className="text-muted-foreground">Qualifying</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 text-center py-1 rounded bg-sprint/10 border border-sprint/20 text-sprint font-mono font-bold text-xs">SQ</span>
        <span className="text-muted-foreground">Sprint Quali</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 text-center py-1 rounded bg-sprint/10 border border-sprint/20 text-sprint font-mono font-bold text-xs">SP</span>
        <span className="text-muted-foreground flex items-center gap-1">Sprint <Zap className="w-3 h-3 text-sprint" /></span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-8 text-center py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs">R</span>
        <span className="text-foreground font-medium flex items-center gap-1">Race <Trophy className="w-3 h-3 text-primary" /></span>
      </div>
    </div>
  );
}
