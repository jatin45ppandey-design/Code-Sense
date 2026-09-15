import { FileCode2 } from "lucide-react";

import type { CitationDto, RepositoryResponse } from "@/lib/types/api";

function citationUrl(repository: RepositoryResponse, citation: CitationDto) {
  const root = repository.htmlUrl || `https://github.com/${repository.fullName}`;
  const path = citation.filePath.split("/").map(encodeURIComponent).join("/");
  const line = citation.startLine == null ? "" : `#L${citation.startLine}${citation.endLine && citation.endLine !== citation.startLine ? `-L${citation.endLine}` : ""}`;
  return `${root}/blob/${encodeURIComponent(repository.defaultBranch)}/${path}${line}`;
}

export function Citations({ repository, citations }: { repository: RepositoryResponse; citations: CitationDto[] }) {
  if (!citations.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {citations.map((citation, index) => (
        <a key={`${citation.filePath}-${citation.startLine}-${index}`} href={citationUrl(repository, citation)} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
          <FileCode2 className="size-3 shrink-0" /><span className="truncate">{citation.filePath}{citation.startLine != null ? `:${citation.startLine}` : ""}</span>
        </a>
      ))}
    </div>
  );
}
