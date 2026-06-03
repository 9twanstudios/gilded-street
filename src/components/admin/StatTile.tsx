import { ReactNode } from "react";

export function StatTile({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: string; icon?: ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-display uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {icon && <div className="text-primary opacity-70">{icon}</div>}
      </div>
    </div>
  );
}
