"use client";

import { CheckCircle2, CircleAlert, FolderGit2, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/layout/page-heading";
import { WorkspaceMetricStrip } from "@/components/layout/workspace-metric-strip";
import { RepositoryCard } from "@/components/repositories/repository-card";
import { EmptyState, ErrorState } from "@/components/shared/query-state";
import { useFeedbackToast } from "@/components/shared/feedback-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRepositories, useSyncRepositories } from "@/hooks/use-repositories";
import { isOwnRepository } from "@/lib/repository-ownership";

export function RepositoryList() {
  const repositories = useRepositories();
  const currentUser = useCurrentUser();
  const sync = useSyncRepositories();
  const toast = useFeedbackToast();
  const [query, setQuery] = useState("");
  const ownRepositories = useMemo(() => repositories.data?.filter((repository) => isOwnRepository(repository, currentUser.data?.githubUsername)) ?? [], [currentUser.data?.githubUsername, repositories.data]);
  const filtered = useMemo(() => ownRepositories.filter((repository) => `${repository.fullName} ${repository.description || ""} ${repository.language || ""}`.toLowerCase().includes(query.toLowerCase())), [ownRepositories, query]);
  const metrics = [
    { label: "Your repositories", value: ownRepositories.length, icon: FolderGit2 },
    { label: "Ready", value: ownRepositories.filter((repository) => repository.indexStatus === "READY").length, icon: CheckCircle2 },
    { label: "Indexing", value: ownRepositories.filter((repository) => repository.indexStatus === "INDEXING").length, icon: LoaderCircle },
    { label: "Failed", value: ownRepositories.filter((repository) => repository.indexStatus === "FAILED").length, icon: CircleAlert },
  ];
  const handleSync = () => sync.mutate(undefined, { onSuccess: () => toast.success("GitHub repositories synced"), onError: () => toast.error("Could not sync repositories.") });

  return <div className="workspace-page"><PageHeading eyebrow="Your GitHub account" title="Your Repositories" description="Repositories owned by your connected GitHub account. Index one to start asking code-grounded questions." actions={<Button variant="outline" onClick={handleSync} disabled={sync.isPending}><RefreshCw className={sync.isPending ? "animate-spin" : ""} data-icon="inline-start" />{sync.isPending ? "Syncing..." : "Sync GitHub"}</Button>} />
    <div className="mt-5">{(repositories.isLoading || currentUser.isLoading) ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-22 rounded-xl" />)}</div> : <WorkspaceMetricStrip metrics={metrics} />}</div>
    <section className="mt-6"><div className="list-toolbar"><div><h2 className="font-semibold">Repositories</h2><p className="mt-0.5 text-xs text-muted-foreground">{ownRepositories.length} {ownRepositories.length === 1 ? "repository" : "repositories"} from your GitHub account</p></div><div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-card/85 px-3 sm:w-80"><Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your repositories" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></div></div>
      <div className="mt-4">{(repositories.isLoading || currentUser.isLoading) && <div className="repository-grid">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-68 rounded-xl" />)}</div>}{repositories.isError && <ErrorState retry={() => repositories.refetch()} />}{repositories.isSuccess && currentUser.isSuccess && ownRepositories.length === 0 && <EmptyState title="No GitHub repositories found." description="Sync GitHub to load repositories owned by your connected account." action={<Button onClick={handleSync} disabled={sync.isPending}>{sync.isPending ? "Syncing..." : "Sync GitHub"}</Button>} />}{ownRepositories.length > 0 && filtered.length === 0 && <EmptyState title="No matching repositories" description="Try a different repository name, language, or description." />}{filtered.length > 0 && <div className="repository-grid">{filtered.map((repository) => <RepositoryCard key={repository.id} repository={repository} />)}</div>}</div>
    </section>
  </div>;
}
