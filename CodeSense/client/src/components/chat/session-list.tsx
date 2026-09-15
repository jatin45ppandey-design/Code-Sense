"use client";

import { formatDistanceToNow } from "date-fns";
import { LoaderCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSessions, useCreateChatSession } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export function SessionList({ repositoryId, selectedId, onSelect }: { repositoryId: string; selectedId: string | null; onSelect: (id: string) => void }) {
  const sessions = useChatSessions(repositoryId);
  const create = useCreateChatSession(repositoryId);
  return (
    <aside className="flex max-h-52 shrink-0 flex-col border-b bg-muted/15 lg:max-h-none lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between border-b px-3 py-3"><span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Sessions</span><Button size="icon-sm" variant="ghost" disabled={create.isPending} onClick={() => create.mutate("New chat", { onSuccess: (session) => onSelect(session.id) })} aria-label="New chat">{create.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}</Button></div>
      {create.error && <p className="px-3 py-2 text-xs text-destructive">{create.error.message}</p>}
      <ScrollArea className="min-h-0 flex-1"><div className="flex gap-1.5 p-2 lg:flex-col">{sessions.isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 min-w-36 rounded-lg" />)}{sessions.data?.map((session) => <button key={session.id} onClick={() => onSelect(session.id)} className={cn("min-w-40 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted lg:min-w-0", selectedId === session.id && "bg-accent text-accent-foreground")}><p className="truncate text-sm font-medium">{session.title}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</p></button>)}</div></ScrollArea>
    </aside>
  );
}
