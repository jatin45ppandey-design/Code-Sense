import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({ retry }: { message?: string; retry?: () => void }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed bg-card/70 p-6 text-center">
      <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertCircle className="size-5" /></span>
      <h2 className="font-semibold">Couldn&apos;t load this view</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">We couldn&apos;t load this data. Try again in a moment.</p>
      {retry && <Button className="mt-4" variant="outline" onClick={retry}><RefreshCw data-icon="inline-start" /> Try again</Button>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed bg-card/70 p-6 text-center">
      <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><Inbox className="size-5" /></span>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
