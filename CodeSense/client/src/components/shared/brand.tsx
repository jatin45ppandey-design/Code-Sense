import { Braces } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/dashboard" className={cn("flex items-center gap-2.5", className)} aria-label="DevGuide dashboard">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Braces className="size-4.5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.95rem] font-semibold tracking-[-0.025em]">DevGuide</span>
          <span className="mt-1 font-mono text-[10px] tracking-wide text-muted-foreground">CODE INTELLIGENCE</span>
        </span>
      )}
    </Link>
  );
}
