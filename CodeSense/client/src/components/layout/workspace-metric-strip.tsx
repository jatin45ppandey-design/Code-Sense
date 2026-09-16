import type { LucideIcon } from "lucide-react";

type WorkspaceMetric = {
  label: string;
  value: number;
  icon?: LucideIcon;
};

export function WorkspaceMetricStrip({ metrics }: { metrics: WorkspaceMetric[] }) {
  return (
    <div className="workspace-metric-strip">
      {metrics.map((metric) => (
        <div key={metric.label} className="workspace-metric">
          <div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</span>{metric.icon && <metric.icon className="size-3.5 text-muted-foreground" />}</div>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] tabular-nums">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
