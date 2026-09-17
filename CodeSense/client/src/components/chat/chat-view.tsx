"use client";

import { AlertTriangle, ArrowLeft, Braces, LoaderCircle, PanelLeft, Play, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatFailureDialog } from "@/components/chat/chat-failure-dialog";
import { ChatMessages } from "@/components/chat/chat-messages";
import { SessionList } from "@/components/chat/session-list";
import { ErrorState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatMessages, useChatSessions, useCreateChatSession, useStreamChat } from "@/hooks/use-chat";
import { repositoryProgress, useIndexStatus, useRepository, useStartIndexing } from "@/hooks/use-repositories";

export function ChatView({ repositoryId }: { repositoryId: string }) {
  const repository = useRepository(repositoryId);
  const status = useIndexStatus(repositoryId, repository.data?.indexStatus === "INDEXING");
  const currentStatus = status.data?.status ?? repository.data?.indexStatus;
  const ready = currentStatus === "READY";
  const sessions = useChatSessions(repositoryId, ready);
  const create = useCreateChatSession(repositoryId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const [restoreRequest, setRestoreRequest] = useState<{ id: number; content: string } | null>(null);
  const attemptedCreate = useRef(false);
  const activeId = selectedId ?? sessions.data?.[0]?.id ?? null;
  const messages = useChatMessages(activeId);
  const stream = useStreamChat(activeId);
  const index = useStartIndexing();
  const hasActiveStream = stream.streamSessionId === activeId;
  const selectSession = (sessionId: string) => {
    stream.stop();
    setSelectedId(sessionId);
  };
  const restoreFailedPrompt = () => {
    if (!stream.failedPrompt) return;
    setRestoreRequest({ id: Date.now(), content: stream.failedPrompt });
    stream.clearError();
  };

  useEffect(() => {
    if (!ready || !sessions.isSuccess || sessions.data.length || attemptedCreate.current) return;
    attemptedCreate.current = true;
    create.mutate(undefined, {
      onSuccess: (session) => setSelectedId(session.id),
      onError: () => { attemptedCreate.current = false; },
    });
  }, [create, ready, sessions.data, sessions.isSuccess]);

  if (repository.isLoading) return <div className="flex h-full min-h-0 flex-1 flex-col p-5"><Skeleton className="h-12 rounded-lg" /><Skeleton className="mt-3 flex-1 rounded-xl" /></div>;
  if (repository.isError || !repository.data) return <div className="p-6"><ErrorState message={repository.error?.message} retry={() => repository.refetch()} /></div>;

  const repo = repository.data;
  const filesProcessed = status.data?.filesProcessed ?? repo.filesProcessed;
  const filesTotal = status.data?.filesTotal ?? repo.filesTotal;
  const progress = repositoryProgress({ filesProcessed, filesTotal });
  const errorMessage = status.data?.errorMessage ?? repo.errorMessage;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={`/repositories/${repo.id}`} />} aria-label="Back to repository"><ArrowLeft /></Button>
        {ready && <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMobileSessionsOpen(true)} aria-label="Open recent questions"><PanelLeft /></Button>}
        <span className="flex size-8 items-center justify-center rounded-lg border bg-card"><Braces className="size-4 text-primary" /></span>
        <div className="min-w-0 flex-1"><h1 className="truncate text-sm font-semibold">{repo.fullName}</h1><p className="truncate font-mono text-[10px] text-muted-foreground">{repo.defaultBranch} · Ask CodeSense</p></div>
        <StatusBadge status={currentStatus || repo.indexStatus} />
      </div>

      {!ready ? (
        <div className="flex flex-1 items-center justify-center p-6"><div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm">{currentStatus === "FAILED" ? <AlertTriangle className="mx-auto size-7 text-destructive" /> : currentStatus === "INDEXING" ? <LoaderCircle className="mx-auto size-7 animate-spin text-primary" /> : <Braces className="mx-auto size-7 text-primary" />}<h2 className="mt-4 font-semibold">{currentStatus === "FAILED" ? "Indexing failed" : currentStatus === "INDEXING" ? "Preparing repository context" : "Index this repository to start"}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{currentStatus === "FAILED" ? errorMessage || "The backend did not provide an error message." : currentStatus === "INDEXING" ? `${filesProcessed}${filesTotal ? ` of ${filesTotal}` : ""} files processed. Ask CodeSense unlocks when indexing finishes.` : "CodeSense needs to index repository files before it can answer grounded questions."}</p>{currentStatus === "INDEXING" && <Progress className="mt-5" value={filesTotal ? progress : null} />}{currentStatus !== "INDEXING" && <Button className="mt-5" disabled={index.isPending} onClick={() => index.mutate(repo.id)}>{currentStatus === "FAILED" ? <RotateCw /> : <Play />}{index.isPending ? "Starting..." : currentStatus === "FAILED" ? "Retry indexing" : "Start indexing"}</Button>}{index.error && <p className="mt-3 text-xs text-destructive">{index.error.message}</p>}</div></div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <SessionList repositoryId={repo.id} selectedId={activeId} onSelect={selectSession} />
          <Sheet open={mobileSessionsOpen} onOpenChange={setMobileSessionsOpen}><SheetContent side="left" className="flex w-[min(22rem,90vw)] flex-col p-0 lg:hidden"><SheetHeader className="border-b px-4 py-4 text-left"><SheetTitle>Recent questions</SheetTitle></SheetHeader><SessionList repositoryId={repo.id} selectedId={activeId} drawer onSelect={(sessionId) => { selectSession(sessionId); setMobileSessionsOpen(false); }} /></SheetContent></Sheet>
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <ChatMessages repository={repo} messages={messages.data ?? []} streamText={hasActiveStream ? stream.streamText : ""} assistantMessage={hasActiveStream ? stream.assistantMessage : null} loading={messages.isLoading || (!activeId && create.isPending)} waitingForFirstToken={hasActiveStream && stream.waitingForFirstToken} loadingStage={stream.loadingStage} isStreaming={hasActiveStream && stream.isStreaming} isComplete={hasActiveStream && stream.isComplete} streamError={hasActiveStream && stream.isError ? stream.error : null} onStarterPrompt={stream.send} starterDisabled={!activeId || (hasActiveStream && stream.streaming)} />
            <ChatComposer disabled={!activeId} streaming={hasActiveStream && stream.streaming} error={messages.error?.message || sessions.error?.message || create.error?.message} restoreRequest={restoreRequest} onSend={stream.send} onStop={stream.stop} />
            <ChatFailureDialog failure={hasActiveStream ? stream.failure : null} failedPrompt={hasActiveStream ? stream.failedPrompt : null} onClose={stream.clearError} onTryAgain={restoreFailedPrompt} />
          </section>
        </div>
      )}
    </div>
  );
}
