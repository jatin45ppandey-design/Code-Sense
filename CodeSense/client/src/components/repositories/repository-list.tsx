"use client";

import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/layout/page-heading";
import { EmptyState, ErrorState } from "@/components/shared/query-state";
import { RepositoryCard } from "@/components/repositories/repository-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositories, useSyncRepositories } from "@/hooks/use-repositories";

export function RepositoryList() {
  const repositories = useRepositories();
  const sync = useSyncRepositories();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => repositories.data?.filter((repository) => `${repository.fullName} ${repository.description || ""} ${repository.language || ""}`.toLowerCase().includes(query.toLowerCase())) ?? [], [query, repositories.data]);

  return (
    <div className="mx-auto w-full max-w-7xl p-5 sm:p-7 lg:p-9">
      <PageHeading eyebrow="Connected repositories" title="Repositories" description="Sync from GitHub, index a codebase, then open a grounded chat workspace." actions={<Button variant="outline" onClick={() => sync.mutate()} disabled={sync.isPending}><RefreshCw className={sync.isPending ? "animate-spin" : ""} data-icon="inline-start" />{sync.isPending ? "Syncing…" : "Sync GitHub"}</Button>} />
      <div className="mt-7 flex max-w-sm items-center gap-2 rounded-lg border bg-card px-3"><Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a repository" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></div>
      {sync.error && <p className="mt-3 text-sm text-destructive">{sync.error.message}</p>}
      <div className="mt-6">
        {repositories.isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-56 rounded-xl" />)}</div>}
        {repositories.isError && <ErrorState message={repositories.error.message} retry={() => repositories.refetch()} />}
        {repositories.isSuccess && repositories.data.length === 0 && <EmptyState title="No repositories yet" description="Sync your GitHub account to load repositories available to this session." action={<Button onClick={() => sync.mutate()} disabled={sync.isPending}>Sync repositories</Button>} />}
        {repositories.isSuccess && repositories.data.length > 0 && filtered.length === 0 && <EmptyState title="No matching repositories" description="Try a different repository name, owner, language, or description." />}
        {filtered.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((repository) => <RepositoryCard key={repository.id} repository={repository} />)}</div>}
      </div>
    </div>
  );
}
