"use client";

import { ArrowRight, MessageSquareCode, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/layout/page-heading";
import { EmptyState, ErrorState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { useRepositories } from "@/hooks/use-repositories";
import { splitRepositories } from "@/lib/repository-ownership";
import type { RepositoryResponse } from "@/lib/types/api";

function ReadyRepositoryCard({ repository }: { repository: RepositoryResponse }) {
  return <Link href={`/chat/${repository.id}`} className="group flex min-h-24 items-center gap-4 rounded-xl border bg-card/95 p-4 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary"><MessageSquareCode className="size-5" /></span><span className="min-w-0 flex-1"><span className="block truncate font-medium">{repository.fullName}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{repository.language || "Language unavailable"} · {repository.defaultBranch}</span><span className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">Ask CodeSense <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span></span><StatusBadge status={repository.indexStatus} /></Link>;
}

export function ChatRepositoryList() {
  const repositories = useRepositories();
  const currentUser = useCurrentUser();
  const [query, setQuery] = useState("");
  const groups = useMemo(() => splitRepositories(repositories.data ?? [], currentUser.data?.githubUsername), [currentUser.data?.githubUsername, repositories.data]);
  const matches = (repository: RepositoryResponse) => repository.indexStatus === "READY" && `${repository.fullName} ${repository.description || ""} ${repository.language || ""}`.toLowerCase().includes(query.toLowerCase());
  const own = groups.own.filter(matches);
  const external = groups.external.filter(matches);
  const readyCount = groups.own.filter((repository) => repository.indexStatus === "READY").length + groups.external.filter((repository) => repository.indexStatus === "READY").length;

  return <div className="workspace-page"><PageHeading eyebrow="Code intelligence" title="Ask CodeSense" description="Choose a ready repository and ask questions grounded in its actual source files." />
    <div className="mt-5 flex flex-col gap-3 rounded-xl border bg-card/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Ready to ask</p><p className="mt-1 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{readyCount}</span> {readyCount === 1 ? "repository is" : "repositories are"} ready for grounded answers.</p></div><div className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 sm:w-88"><Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ready repositories..." className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></div></div>
    <div className="mt-6 space-y-7">{(repositories.isLoading || currentUser.isLoading) && <div className="repository-grid">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div>}{repositories.isError && <ErrorState message={repositories.error.message} retry={() => repositories.refetch()} />}{repositories.isSuccess && currentUser.isSuccess && own.length === 0 && external.length === 0 && <EmptyState title="No repositories are ready for Ask CodeSense yet." description="Index a repository first, then return here to ask questions about its source code." action={<div className="flex flex-wrap justify-center gap-2"><Button size="sm" nativeButton={false} render={<Link href="/repositories" />}>Your Repositories</Button><Button size="sm" variant="outline" nativeButton={false} render={<Link href="/external" />}>External Repositories</Button></div>} />}{own.length > 0 && <section><div className="mb-3 flex items-baseline justify-between"><h2 className="font-semibold">Your Repositories</h2><span className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">{own.length} ready</span></div><div className="repository-grid">{own.map((repository) => <ReadyRepositoryCard key={repository.id} repository={repository} />)}</div></section>}{external.length > 0 && <section><div className="mb-3 flex items-baseline justify-between"><h2 className="font-semibold">External Repositories</h2><span className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">{external.length} ready</span></div><div className="repository-grid">{external.map((repository) => <ReadyRepositoryCard key={repository.id} repository={repository} />)}</div></section>}</div>
  </div>;
}
