"use client";

import { ArrowLeft, ArrowUpRight, Box, Braces, CalendarClock, FileCode2, GitBranch, Lock, MessageSquareText, Play, RotateCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { PageHeading } from "@/components/layout/page-heading";
import { ErrorState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { repositoryProgress, useIndexStatus, useRepository, useStartIndexing } from "@/hooks/use-repositories";

export function RepositoryDetail({ repositoryId }: { repositoryId: string }) {
  const query = useRepository(repositoryId);
  const status = useIndexStatus(repositoryId, query.data?.indexStatus === "INDEXING");
  const index = useStartIndexing();
  if (query.isLoading) return <div className="mx-auto w-full max-w-6xl p-5 sm:p-8"><Skeleton className="h-8 w-64" /><Skeleton className="mt-8 h-72 rounded-xl" /></div>;
  if (query.isError || !query.data) return <div className="mx-auto w-full max-w-6xl p-5 sm:p-8"><ErrorState message={query.error?.message} retry={() => query.refetch()} /></div>;
  const repo = query.data;
  const currentStatus = status.data?.status ?? repo.indexStatus;
  const filesTotal = status.data?.filesTotal ?? repo.filesTotal;
  const filesProcessed = status.data?.filesProcessed ?? repo.filesProcessed;
  const chunks = status.data?.chunkCount ?? repo.chunkCount;
  const progress = repositoryProgress({ filesProcessed, filesTotal });
  const errorMessage = status.data?.errorMessage ?? repo.errorMessage;

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-7 lg:p-9">
      <Button variant="ghost" className="mb-5 -ml-2" nativeButton={false} render={<Link href="/repositories" />}><ArrowLeft /> Repositories</Button>
      <PageHeading eyebrow="Repository workspace" title={repo.fullName} description={repo.description || "No repository description provided."} actions={<>{repo.htmlUrl && <Button variant="outline" nativeButton={false} render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}>GitHub <ArrowUpRight /></Button>}{currentStatus === "READY" && <Button nativeButton={false} render={<Link href={`/chat/${repo.id}`} />}><MessageSquareText /> Open chat</Button>}</>} />
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Indexing</p><p className="mt-1 text-xs text-muted-foreground">Repository content available to code-grounded chat</p></div><StatusBadge status={currentStatus} /></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">{[{ label: "Files processed", value: `${filesProcessed}${filesTotal ? ` / ${filesTotal}` : ""}`, icon: FileCode2 }, { label: "Code chunks", value: chunks.toLocaleString(), icon: Braces }, { label: "Last indexed", value: repo.indexedAt ? formatDistanceToNow(new Date(repo.indexedAt), { addSuffix: true }) : "Not yet", icon: CalendarClock }].map((item) => <div key={item.label} className="rounded-lg border bg-muted/25 p-4"><item.icon className="size-4 text-muted-foreground" /><p className="mt-4 text-lg font-semibold tabular-nums">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.label}</p></div>)}</div>
          {currentStatus === "INDEXING" && <div className="mt-6"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Indexing repository files</span><span>{filesTotal ? `${progress}%` : "Preparing"}</span></div><Progress value={filesTotal ? progress : null} /></div>}
          {currentStatus === "FAILED" && <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/6 p-4"><p className="text-sm font-medium text-destructive">Indexing failed</p><p className="mt-1 text-sm text-destructive/80">{errorMessage || "The backend did not provide an error message."}</p></div>}
          {index.error && <p className="mt-4 text-sm text-destructive">{index.error.message}</p>}
          {currentStatus !== "INDEXING" && <Button className="mt-6" variant={currentStatus === "READY" ? "outline" : "default"} disabled={index.isPending} onClick={() => index.mutate(repo.id)}>{currentStatus === "READY" || currentStatus === "FAILED" ? <RotateCw /> : <Play />}{index.isPending ? "Starting…" : currentStatus === "READY" ? "Re-index repository" : currentStatus === "FAILED" ? "Retry indexing" : "Start indexing"}</Button>}
        </section>
        <aside className="rounded-xl border bg-card p-5 shadow-sm sm:p-6"><h2 className="text-sm font-semibold">Repository details</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-xs text-muted-foreground">Visibility</dt><dd className="mt-1 flex items-center gap-1.5">{repo.isPrivate ? <Lock className="size-3.5" /> : <Box className="size-3.5" />}{repo.isPrivate ? "Private" : "Public"}</dd></div><div><dt className="text-xs text-muted-foreground">Default branch</dt><dd className="mt-1 flex items-center gap-1.5 font-mono text-xs"><GitBranch className="size-3.5" />{repo.defaultBranch}</dd></div><div><dt className="text-xs text-muted-foreground">Primary language</dt><dd className="mt-1">{repo.language || "Unavailable"}</dd></div><div><dt className="text-xs text-muted-foreground">GitHub repository ID</dt><dd className="mt-1 font-mono text-xs">{repo.githubRepoId}</dd></div></dl></aside>
      </div>
    </div>
  );
}
