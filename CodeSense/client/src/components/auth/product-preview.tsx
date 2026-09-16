"use client";

import { Check, ChevronRight, FileCode2, FolderGit2, GitBranch, MessageSquareText, TerminalSquare } from "lucide-react";
import { useState, type CSSProperties, type PointerEvent } from "react";

const FILES = [
  "Service/ChatService.java",
  "Service/github/indexing/IndexingService.java",
  "components/repositories/repository-list.tsx",
];

export type PreviewCapability = "repositories" | "external" | "ask" | "sources";

export function ProductPreview({ activeCapability }: { activeCapability: PreviewCapability | null }) {
  const [motion, setMotion] = useState({ x: 0, y: 0 });
  const style = {
    "--scene-rotate-x": `${motion.y * -5}deg`,
    "--scene-rotate-y": `${motion.x * 7}deg`,
    "--scene-shift-x": `${motion.x * 16}px`,
    "--scene-shift-y": `${motion.y * 12}px`,
    "--scene-shift-x-soft": `${motion.x * 10}px`,
    "--scene-shift-y-soft": `${motion.y * 7}px`,
    "--scene-shift-x-inverse": `${motion.x * -5}px`,
    "--scene-shift-y-inverse": `${motion.y * -4}px`,
  } as CSSProperties;

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setMotion({ x: x * 2, y: y * 2 });
  }

  return (
    <section className="codesense-scene relative mx-auto w-full max-w-[44rem] py-8 sm:py-12" data-product-preview data-capability={activeCapability ?? undefined} aria-label="Illustrative CodeSense repository intelligence workspace" style={style} onPointerMove={handlePointerMove} onPointerLeave={() => setMotion({ x: 0, y: 0 })}>
      <div aria-hidden="true" className="codesense-scene-aura absolute inset-[8%] -z-20 rounded-full" />
      <div aria-hidden="true" className="codesense-file-context codesense-preview-context absolute -bottom-1 -left-3 hidden w-64 lg:block">
        <div className="codesense-file-context-surface rounded-xl border bg-card/90 p-4 font-mono text-[10px] leading-6 text-muted-foreground shadow-xl shadow-black/10 backdrop-blur-sm">
          <p className="mb-2 flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground"><FolderGit2 className="size-3.5 shrink-0 text-primary" /><span className="truncate">FILE CONTEXT</span></p>
          <p className="truncate">Service/</p><p className="truncate pl-3">ChatService.java</p><p className="truncate">Service/github/indexing/</p><p className="truncate pl-3">IndexingService.java</p><p className="truncate">components/repositories/</p><p className="truncate pl-3">repository-list.tsx</p>
        </div>
      </div>
      <div aria-hidden="true" className="codesense-context-ready codesense-preview-repository-status absolute -right-3 top-3 hidden rounded-xl border bg-card/95 px-3 py-2.5 shadow-lg shadow-black/10 lg:block"><p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Repository indexed</p><p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><Check className="size-3.5" /> Context ready</p></div>
      <div aria-hidden="true" className="codesense-pipeline codesense-preview-external absolute -bottom-4 right-1 hidden items-center gap-2 rounded-lg border bg-card/90 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground shadow-lg shadow-black/10 xl:flex"><TerminalSquare className="size-3 text-primary" /><span>repository</span><ChevronRight className="size-3" /><span>index</span><ChevronRight className="size-3" /><span>context</span><ChevronRight className="size-3" /><span>sources</span></div>

      <div className="codesense-main-preview overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/15 dark:shadow-black/40" style={style}>
        <div className="flex h-12 items-center gap-2 border-b bg-muted/20 px-4 sm:px-5"><span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><FolderGit2 className="size-3.5" /></span><span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">CodeSense / repository intelligence</span></div>
        <div className="codesense-preview-repository border-b px-4 py-4 sm:px-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Connected repository</p><p className="mt-1 truncate text-base font-semibold tracking-[-0.025em] sm:text-lg">jatin45ppandey-design / Code-Sense</p></div><span className="codesense-preview-repository-status mt-1 flex shrink-0 items-center gap-1.5 rounded-md border bg-emerald-500/10 px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.1em] text-emerald-700 dark:text-emerald-400"><Check className="size-3" /> READY</span></div><p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><GitBranch className="size-3.5" /> main</p></div>
        <div className="space-y-5 p-4 sm:p-5"><div className="codesense-preview-ask rounded-xl border bg-muted/35 p-3.5"><p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><MessageSquareText className="size-3.5 text-primary" /> Ask CodeSense</p><div className="mt-3 flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm"><span className="truncate">Explain how repository indexing and Ask CodeSense work</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></div></div><div className="codesense-preview-answer"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">Grounded answer</p><p className="mt-2 text-sm leading-6 text-foreground/85">CodeSense indexes repository files into source context, then retrieves the relevant code before answering with supporting sources.</p></div><div className="codesense-preview-sources border-t pt-4"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Sources</p><div className="mt-2 space-y-1.5">{FILES.map((file) => <p key={file} className="codesense-preview-source-row flex min-w-0 items-center gap-2 rounded-md bg-muted/45 px-2.5 py-2 font-mono text-[11px] text-muted-foreground"><FileCode2 className="size-3.5 shrink-0 text-primary" /><span className="truncate">{file}</span></p>)}</div></div></div>
      </div>
    </section>
  );
}
