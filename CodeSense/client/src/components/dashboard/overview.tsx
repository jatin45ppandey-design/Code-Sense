"use client";

import { AlertTriangle, Boxes, CheckCircle2, Clock3, FolderGit2, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { PageHeading } from "@/components/layout/page-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRepositories } from "@/hooks/use-repositories";

export function Overview() {
  const { data: user } = useCurrentUser();
  const repositories = useRepositories();
  const data = repositories.data ?? [];
  const metrics = [
    { label: "Repositories", value: data.length, icon: Boxes },
    { label: "Ready", value: data.filter((repo) => repo.indexStatus === "READY").length, icon: CheckCircle2 },
    { label: "In progress", value: data.filter((repo) => repo.indexStatus === "INDEXING").length, icon: Clock3 },
    { label: "Needs attention", value: data.filter((repo) => repo.indexStatus === "FAILED").length, icon: AlertTriangle },
  ];
  const recent = data.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl p-5 sm:p-7 lg:p-9">
      <PageHeading eyebrow="Workspace" title={`Welcome${user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`} description="A live view of the repositories connected to your GitHub account." actions={<Button nativeButton={false} render={<Link href="/repositories" />}><FolderGit2 data-icon="inline-start" /> Browse repositories</Button>} />
      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {repositories.isLoading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />) : metrics.map((metric) => <div key={metric.label} className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{metric.label}</span><metric.icon className="size-4 text-muted-foreground" /></div><p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight">{metric.value}</p></div>)}
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Repository activity</h2><p className="mt-0.5 text-xs text-muted-foreground">Current indexing state from the backend</p></div><Button variant="ghost" nativeButton={false} render={<Link href="/repositories" />}>View all</Button></div>
        {repositories.isLoading && <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>}
        {repositories.isError && <p className="p-5 text-sm text-destructive">{repositories.error.message}</p>}
        {repositories.isSuccess && recent.length === 0 && <div className="p-8 text-center"><p className="text-sm font-medium">No repositories loaded</p><p className="mt-1 text-sm text-muted-foreground">Sync GitHub to populate this workspace.</p></div>}
        {recent.map((repository) => <div key={repository.id} className="flex flex-col gap-3 border-b px-5 py-4 last:border-0 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><Link href={`/repositories/${repository.id}`} className="truncate text-sm font-medium hover:text-primary">{repository.fullName}</Link><p className="mt-1 text-xs text-muted-foreground">{repository.language || "Language unavailable"} · {repository.defaultBranch}</p></div><StatusBadge status={repository.indexStatus} /><Button variant="ghost" size="sm" nativeButton={false} render={<Link href={repository.indexStatus === "READY" ? `/chat/${repository.id}` : `/repositories/${repository.id}`} />}>{repository.indexStatus === "READY" && <MessageSquareText />} {repository.indexStatus === "READY" ? "Chat" : "Open"}</Button></div>)}
      </div>
    </div>
  );
}
