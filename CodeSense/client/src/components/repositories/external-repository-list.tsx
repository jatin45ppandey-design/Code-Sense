"use client";

import { CheckCircle2, CircleAlert, LoaderCircle, Search, Waypoints } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/layout/page-heading";
import { WorkspaceMetricStrip } from "@/components/layout/workspace-metric-strip";
import { RepositoryCard } from "@/components/repositories/repository-card";
import { EmptyState, ErrorState } from "@/components/shared/query-state";
import { useFeedbackToast } from "@/components/shared/feedback-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { useImportRepository, useRepositories } from "@/hooks/use-repositories";
import { isOwnRepository } from "@/lib/repository-ownership";

export function ExternalRepositoryList() {
  const repositories = useRepositories();
  const currentUser = useCurrentUser();
  const importRepository = useImportRepository();
  const toast = useFeedbackToast();
  const [query, setQuery] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const externalRepositories = useMemo(() => repositories.data?.filter((repository) => !isOwnRepository(repository, currentUser.data?.githubUsername)) ?? [], [currentUser.data?.githubUsername, repositories.data]);
  const filtered = useMemo(() => externalRepositories.filter((repository) => `${repository.fullName} ${repository.description || ""} ${repository.language || ""}`.toLowerCase().includes(query.toLowerCase())), [externalRepositories, query]);
  const metrics = [
    { label: "External", value: externalRepositories.length, icon: Waypoints },
    { label: "Ready", value: externalRepositories.filter((repository) => repository.indexStatus === "READY").length, icon: CheckCircle2 },
    { label: "Indexing", value: externalRepositories.filter((repository) => repository.indexStatus === "INDEXING").length, icon: LoaderCircle },
    { label: "Failed", value: externalRepositories.filter((repository) => repository.indexStatus === "FAILED").length, icon: CircleAlert },
  ];

  return <div className="workspace-page"><PageHeading eyebrow="External code" title="External Repositories" description="Import and analyze GitHub repositories outside your personal account." />
    <section className="mt-5 rounded-xl border bg-card/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-1 border-b border-border/70 pb-4"><h2 className="font-semibold">Add external repository</h2><p className="text-sm text-muted-foreground">Paste a GitHub repository URL and CodeSense will import and begin analysis.</p></div>
      <form className="mt-4 flex flex-col gap-2 lg:flex-row" onSubmit={(event) => { event.preventDefault(); if (repositoryUrl.trim()) importRepository.mutate(repositoryUrl.trim(), { onSuccess: () => { setRepositoryUrl(""); toast.success("Repository imported") }, onError: () => toast.error("Could not import this repository.") }); }}>
        <div className="flex min-w-0 flex-1 items-center rounded-lg border bg-background px-3"><FaGithub className="mr-2 size-4 shrink-0 text-muted-foreground" /><Input aria-label="GitHub repository URL" value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} placeholder="https://github.com/owner/repository" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></div>
        <Button type="submit" className="max-lg:w-full lg:min-w-36" disabled={importRepository.isPending || !repositoryUrl.trim()}>{importRepository.isPending ? "Importing..." : "Add & Analyze"}</Button>
      </form>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">Import <span className="px-1 text-primary">→</span> Index <span className="px-1 text-primary">→</span> Ready <span className="px-1 text-primary">→</span> Ask</p>
      {importRepository.error && <Alert variant="destructive" className="mt-4"><AlertDescription>Could not import this repository. Check the URL and try again.</AlertDescription></Alert>}
    </section>
    <div className="mt-4">{(repositories.isLoading || currentUser.isLoading) ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-22 rounded-xl" />)}</div> : <WorkspaceMetricStrip metrics={metrics} />}</div>
    <section className="mt-6"><div className="list-toolbar"><div><h2 className="font-semibold">Repositories</h2><p className="mt-0.5 text-xs text-muted-foreground">{externalRepositories.length} {externalRepositories.length === 1 ? "repository" : "repositories"} imported</p></div><div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-card/85 px-3 sm:w-80"><Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search external repositories" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></div></div>
      <div className="mt-4">{(repositories.isLoading || currentUser.isLoading) && <div className="repository-grid">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-68 rounded-xl" />)}</div>}{repositories.isError && <ErrorState retry={() => repositories.refetch()} />}{repositories.isSuccess && currentUser.isSuccess && externalRepositories.length === 0 && <EmptyState title="No external repositories added yet." description="Paste a public GitHub repository URL above to import and analyze it." />}{externalRepositories.length > 0 && filtered.length === 0 && <EmptyState title="No matching repositories" description="Try a different repository name, language, or description." />}{filtered.length > 0 && <div className="repository-grid">{filtered.map((repository) => <RepositoryCard key={repository.id} repository={repository} />)}</div>}</div>
    </section>
  </div>;
}
