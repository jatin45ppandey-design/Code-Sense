"use client";

import { ExternalLink, FileCode2 } from "lucide-react";
import { useState } from "react";

import type { CitationDto, RepositoryResponse } from "@/lib/types/api";

const INITIAL_SOURCE_COUNT = 3;

function citationUrl(repository: RepositoryResponse, citation: CitationDto) {
  const root = repository.htmlUrl || `https://github.com/${repository.fullName}`;
  const path = citation.filePath.split("/").map(encodeURIComponent).join("/");
  const ref = repository.indexedCommitSha || repository.defaultBranch;
  const line = citation.startLine == null ? "" : `#L${citation.startLine}${citation.endLine && citation.endLine !== citation.startLine ? `-L${citation.endLine}` : ""}`;
  return `${root}/blob/${encodeURIComponent(ref)}/${path}${line}`;
}

function sourceName(filePath: string) {
  return filePath.split("/").filter(Boolean).at(-1) || filePath;
}

function sourceDirectory(filePath: string) {
  const parts = filePath.split("/").filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join("/") : filePath;
}

function lineLabel(citation: CitationDto) {
  if (citation.startLine == null) return null;
  if (citation.endLine != null && citation.endLine !== citation.startLine) return `Lines ${citation.startLine}–${citation.endLine}`;
  return `Line ${citation.startLine}`;
}

export function Citations({ repository, citations }: { repository: RepositoryResponse; citations: CitationDto[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!citations.length) return null;
  const visibleSources = expanded ? citations : citations.slice(0, INITIAL_SOURCE_COUNT);
  const hiddenCount = citations.length - INITIAL_SOURCE_COUNT;

  return <section className="mt-5 border-t border-border/70 pt-4"><div className="flex items-center gap-2"><FileCode2 className="size-3.5 text-primary" /><h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Sources <span className="normal-case tracking-normal">· {citations.length}</span></h3></div><div className="mt-3 space-y-2">{visibleSources.map((citation, index) => { const name = sourceName(citation.filePath); const directory = sourceDirectory(citation.filePath); const lines = lineLabel(citation); return <a key={`${citation.filePath}-${citation.startLine}-${index}`} href={citationUrl(repository, citation)} target="_blank" rel="noreferrer" aria-label={`Open ${name} on GitHub`} className="group flex min-w-0 items-start gap-3 rounded-lg border bg-background/70 p-3 transition-[border-color,background-color,transform] hover:-translate-y-px hover:border-primary/40 hover:bg-accent/20 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20"><span className="pt-0.5 font-mono text-[10px] font-medium text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><FileCode2 className="mt-0.5 size-4 shrink-0 text-primary/80" /><span className="min-w-0 flex-1"><span className="flex min-w-0 items-center gap-2"><span className="truncate text-sm font-medium">{name}</span>{citation.language && <span className="shrink-0 rounded border border-border/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">{citation.language}</span>}</span><span title={citation.filePath} className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">{directory}</span>{lines && <span className="mt-1.5 block text-[11px] text-muted-foreground">{lines}</span>}</span><ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" /></a>; })}</div>{hiddenCount > 0 && <button type="button" onClick={() => setExpanded((current) => !current)} className="mt-3 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring">{expanded ? "Show fewer" : `Show all ${citations.length} sources`}</button>}</section>;
}
