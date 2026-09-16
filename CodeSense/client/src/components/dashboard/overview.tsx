"use client";

import { AlertTriangle, CheckCircle2, FolderGit2, LoaderCircle, Play, RotateCw, Waypoints } from "lucide-react";
import Link from "next/link";

import { PageHeading } from "@/components/layout/page-heading";
import { useFeedbackToast } from "@/components/shared/feedback-toast";
import { ErrorState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { repositoryProgress, useRepositories, useStartIndexing, useSyncRepositories } from "@/hooks/use-repositories";
import { splitRepositories } from "@/lib/repository-ownership";
import type { RepositoryResponse } from "@/lib/types/api";

function RepositoryRow({ repository, retry, retryDisabled = false }: { repository: RepositoryResponse; retry?: () => void; retryDisabled?: boolean }) {
  return <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-3.5 last:border-0 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><Link href={`/repositories/${repository.id}`} className="truncate text-sm font-medium hover:text-primary">{repository.fullName}</Link><p className="mt-1 text-xs text-muted-foreground">{repository.language || "Language unavailable"} · {repository.defaultBranch}</p>{repository.indexStatus === "INDEXING" && <div className="mt-2 flex max-w-md items-center gap-2"><Progress value={repository.filesTotal ? repositoryProgress(repository) : null} className="h-1.5" /><span className="shrink-0 font-mono text-[10px] text-muted-foreground">{repository.filesProcessed}/{repository.filesTotal || "…"}</span></div>}{repository.indexStatus === "FAILED" && <p className="mt-1 text-xs text-destructive">Latest indexing attempt failed.</p>}</div><StatusBadge status={repository.indexStatus} />{repository.indexStatus === "READY" ? <Button size="sm" nativeButton={false} render={<Link href={`/chat/${repository.id}`} />}>Ask CodeSense</Button> : repository.indexStatus === "FAILED" ? <Button size="sm" variant="outline" onClick={retry} disabled={retryDisabled}><RotateCw /> {retryDisabled ? "Retrying..." : "Retry"}</Button> : <Button size="sm" variant="ghost" nativeButton={false} render={<Link href={`/repositories/${repository.id}`} />}>{repository.indexStatus === "PENDING" && <Play />} Open</Button>}</div>;
}

function RepositorySection({ title, description, repositories, loading, action, retry, retryDisabled }: { title: string; description: string; repositories: RepositoryResponse[]; loading: boolean; action?: React.ReactNode; retry?: (id: string) => void; retryDisabled?: boolean }) {
  return <section className="overflow-hidden rounded-xl border bg-card/95 shadow-sm"><div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-4"><div><h2 className="font-semibold">{title}</h2><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div>{action}</div>{loading ? <div className="space-y-3 p-4"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : repositories.length ? repositories.map((repository) => <RepositoryRow key={repository.id} repository={repository} retry={retry ? () => retry(repository.id) : undefined} retryDisabled={retryDisabled} />) : <p className="px-4 py-4 text-sm text-muted-foreground">{title === "Currently Indexing" ? "No repositories are currently indexing." : title === "Needs Attention" ? "No failed repositories need attention." : "Index a repository to unlock Ask CodeSense."}</p>}</section>;
}

export function Overview() {
  const { data: user } = useCurrentUser();
  const repositories = useRepositories();
  const index = useStartIndexing();
  const sync = useSyncRepositories();
  const toast = useFeedbackToast();
  const data = repositories.data ?? [];
  const groups = splitRepositories(data, user?.githubUsername);
  const indexing = data.filter((repository) => repository.indexStatus === "INDEXING");
  const failed = data.filter((repository) => repository.indexStatus === "FAILED");
  const ready = data.filter((repository) => repository.indexStatus === "READY");
  const metrics = [
    { label: "Your repositories", value: groups.own.length, icon: FolderGit2 },
    { label: "External", value: groups.external.length, icon: Waypoints },
    { label: "Ready", value: ready.length, icon: CheckCircle2 },
    { label: "Indexing", value: indexing.length, icon: LoaderCircle },
    { label: "Failed", value: failed.length, icon: AlertTriangle },
  ];
  const syncRepositories = () => sync.mutate(undefined, { onSuccess: () => toast.success("GitHub repositories synced"), onError: () => toast.error("Could not sync repositories.") });
  const retryIndexing = (id: string) => index.mutate(id, { onSuccess: () => toast.success("Indexing restarted"), onError: () => toast.error("Indexing could not be started.") });

  return <div className="workspace-page"><PageHeading eyebrow="Dashboard" title={`Welcome${user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`} description="Monitor repository readiness and pick up where your code intelligence work needs attention." actions={<Button nativeButton={false} render={<Link href="/repositories" />}><FolderGit2 data-icon="inline-start" /> Your Repositories</Button>} />
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{repositories.isLoading ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-26 rounded-xl" />) : metrics.map((metric) => <div key={metric.label} className="workspace-metric"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-muted-foreground">{metric.label}</span><metric.icon className="size-3.5 text-muted-foreground" /></div><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] tabular-nums">{metric.value}</p></div>)}</div>
    <section className="mt-4 flex flex-col gap-3 rounded-xl border bg-card/90 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quick Actions</p><p className="mt-0.5 text-xs text-muted-foreground">Common workspace tasks.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={syncRepositories} disabled={sync.isPending}>{sync.isPending ? "Syncing..." : "Sync GitHub"}</Button><Button size="sm" variant="outline" nativeButton={false} render={<Link href="/external" />}>Import Repository</Button><Button size="sm" nativeButton={false} render={<Link href="/chat" />}>Ask CodeSense</Button></div></section>
    {repositories.isError ? <div className="mt-6"><ErrorState retry={() => repositories.refetch()} /></div> : <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.9fr)]"><div className="space-y-5"><RepositorySection title="Currently Indexing" description="Repository progress updates automatically." repositories={indexing} loading={repositories.isLoading} /><RepositorySection title="Ready to Ask" description="Open a repository that has completed indexing." repositories={ready.slice(0, 6)} loading={repositories.isLoading} action={<Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/chat" />}>View all</Button>} /></div><aside className="space-y-5"><RepositorySection title="Needs Attention" description="Retry repositories whose latest indexing run failed." repositories={failed} loading={repositories.isLoading} retry={retryIndexing} retryDisabled={index.isPending} /><section className="rounded-xl border bg-card/95 p-4 shadow-sm"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Repository status</p><div className="mt-4 space-y-3">{[{ label: "Ready to ask", value: ready.length, color: "bg-emerald-500" }, { label: "In analysis", value: indexing.length, color: "bg-primary" }, { label: "Needs attention", value: failed.length, color: "bg-destructive" }].map((status) => <div key={status.label} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><span className={`size-2 rounded-full ${status.color}`} />{status.label}</span><span className="font-medium tabular-nums">{status.value}</span></div>)}</div></section></aside></div>}</div>;
}
