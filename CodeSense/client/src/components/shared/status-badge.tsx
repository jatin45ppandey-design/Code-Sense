import { AlertTriangle, CheckCircle2, CircleDashed, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IndexStatus } from "@/lib/types/api";

const config = {
  PENDING: { label: "Not indexed", icon: CircleDashed, className: "text-muted-foreground" },
  INDEXING: { label: "Indexing", icon: LoaderCircle, className: "border-blue-500/25 bg-blue-500/8 text-blue-600 dark:text-blue-400" },
  READY: { label: "Ready", icon: CheckCircle2, className: "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400" },
  FAILED: { label: "Failed", icon: AlertTriangle, className: "border-destructive/25 bg-destructive/8 text-destructive" },
} satisfies Record<IndexStatus, { label: string; icon: typeof CheckCircle2; className: string }>;

export function StatusBadge({ status, className }: { status: IndexStatus; className?: string }) {
  const item = config[status];
  const Icon = item.icon;
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", item.className, className)}>
      <Icon className={cn("size-3", status === "INDEXING" && "animate-spin")} />
      {item.label}
    </Badge>
  );
}
