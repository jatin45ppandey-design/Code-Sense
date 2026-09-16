import Link from "next/link";

import { cn } from "@/lib/utils";

export function CodeSenseMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 80 80" className={cn("shrink-0 text-white drop-shadow-[0_5px_12px_rgba(19,133,255,0.18)]", className)} aria-hidden="true"><defs><linearGradient id="codesense-ring" x1="16" y1="13" x2="62" y2="68" gradientUnits="userSpaceOnUse"><stop stopColor="#3DB7FF" /><stop offset="1" stopColor="#137BFF" /></linearGradient></defs><path d="M58 10a34 34 0 1 0 0 60L53 59a22 22 0 1 1 0-38Z" fill="url(#codesense-ring)" /><path d="m43 22-14 15 11 11m-3-16 14 15-12 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" /></svg>;
}

export function Brand({ compact = false, className, landing = false }: { compact?: boolean; className?: string; landing?: boolean }) {
  if (landing) return <Link href="/" className={cn("flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} aria-label="CodeSense home"><CodeSenseMark className="size-10 sm:size-12" />{!compact && <span className="flex flex-col leading-none"><span className="text-[1.22rem] font-bold tracking-[-0.055em] sm:text-[1.4rem]"><span>Code</span><span className="text-primary">Sense</span></span><span className="mt-1 font-sans text-[0.52rem] font-medium tracking-[0.18em] text-muted-foreground">CODE INTELLIGENCE</span></span>}</Link>;
  return (
    <Link href="/repositories" className={cn("flex max-w-full items-center gap-2.5 rounded-md px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0", className)} aria-label="CodeSense repositories">
      <CodeSenseMark className="size-8 group-data-[collapsible=icon]:size-8" />
      {!compact && (
        <span className="flex min-w-0 flex-col leading-none group-data-[collapsible=icon]:hidden">
          <span className="text-[0.98rem] font-bold tracking-[-0.045em]"><span>Code</span><span className="text-primary">Sense</span></span>
          <span className="mt-1 font-sans text-[0.46rem] font-medium tracking-[0.16em] text-muted-foreground">CODE INTELLIGENCE</span>
        </span>
      )}
    </Link>
  );
}
