"use client";

import { ArrowUpRight, CheckCircle2, FileCode2, GitBranch, Lock, MessageSquareText, Play, RotateCw } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { useFeedbackToast } from "@/components/shared/feedback-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { repositoryProgress, useStartIndexing } from "@/hooks/use-repositories";
import type { RepositoryResponse } from "@/lib/types/api";

export function RepositoryCard({ repository }: { repository: RepositoryResponse }) {
  const index = useStartIndexing();
  const toast = useFeedbackToast();
  const progress = repositoryProgress(repository);
  const canIndex = repository.indexStatus !== "INDEXING";
  const indexingThisRepository = index.isPending && index.variables === repository.id;
  const startIndexing = () => index.mutate(repository.id, { onSuccess: () => toast.success(repository.indexStatus === "FAILED" ? "Indexing restarted" : "Indexing started"), onError: () => toast.error("Indexing could not be started.") });
  return (
    <article className="group flex min-h-68 flex-col rounded-xl border bg-card/95 p-5 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><h2 className="truncate font-semibold tracking-tight">{repository.name}</h2>{repository.isPrivate && <Lock className="size-3.5 text-muted-foreground" aria-label="Private repository" />}</div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{repository.owner} / {repository.defaultBranch}</p>
        </div>
        <div className="flex items-center gap-2">{repository.indexStatus === "READY" && <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-label="Repository ready" />}<StatusBadge status={repository.indexStatus} /></div>
      </div>
      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{repository.description || "No repository description provided."}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border/65 py-3 text-xs text-muted-foreground">
        {repository.language && <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary/70" />{repository.language}</span>}
        <span className="flex items-center gap-1"><GitBranch className="size-3.5" />{repository.defaultBranch}</span>
        {repository.indexStatus === "READY" && <span className="flex items-center gap-1"><FileCode2 className="size-3.5" />{repository.filesProcessed} files · {repository.chunkCount} chunks</span>}
      </div>
      {repository.indexStatus === "INDEXING" && <div className="mt-4"><div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground"><span>Processing files</span><span>{repository.filesProcessed}/{repository.filesTotal || "—"}</span></div><Progress value={repository.filesTotal ? progress : null} /></div>}
      {repository.indexStatus === "FAILED" && <p className="mt-3 rounded-md bg-destructive/7 px-2.5 py-2 text-xs text-destructive">The latest indexing attempt failed. Retry to try again.</p>}
      <div className="mt-auto flex items-center gap-2 pt-5">
        <Button variant="outline" nativeButton={false} render={<Link href={`/repositories/${repository.id}`} />}>Details</Button>
        {repository.indexStatus === "READY" ? (
          <Button nativeButton={false} render={<Link href={`/chat/${repository.id}`} />}><MessageSquareText data-icon="inline-start" /> Ask</Button>
        ) : (
          <Button disabled={!canIndex || indexingThisRepository} onClick={startIndexing}>{repository.indexStatus === "FAILED" ? <RotateCw /> : <Play />} {indexingThisRepository ? repository.indexStatus === "FAILED" ? "Retrying..." : "Starting..." : repository.indexStatus === "FAILED" ? "Retry" : repository.indexStatus === "INDEXING" ? "Indexing" : "Analyze Repository"}</Button>
        )}
        {repository.htmlUrl && <Button variant="ghost" size="icon" nativeButton={false} render={<a href={repository.htmlUrl} target="_blank" rel="noreferrer" />} aria-label={`Open ${repository.fullName} on GitHub`}><ArrowUpRight /></Button>}
      </div>
    </article>
  );
}
