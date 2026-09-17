"use client";

import { ArrowDown, Bot, CornerDownRight, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { Citations } from "@/components/chat/citations";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessageResponse, RepositoryResponse } from "@/lib/types/api";

const starterPrompts = [
  "Explain this repository architecture",
  "How does repository indexing work?",
  "Where is authentication implemented?",
  "Which files should I read first?",
];

const loadingCopy = {
  analyzing: "Understanding your question...",
  retrieving: "Searching repository context...",
  reading: "Reading relevant files...",
  generating: "Generating response...",
} as const;

type LoadingStage = keyof typeof loadingCopy;

export function ChatMessages({ repository, messages, streamText, assistantMessage, loading, waitingForFirstToken = false, loadingStage = "analyzing", isStreaming = false, isComplete = false, streamError, onStarterPrompt, starterDisabled = false }: { repository: RepositoryResponse; messages: ChatMessageResponse[]; streamText: string; assistantMessage?: ChatMessageResponse | null; loading: boolean; waitingForFirstToken?: boolean; loadingStage?: LoadingStage; isStreaming?: boolean; isComplete?: boolean; streamError?: string | null; onStarterPrompt?: (prompt: string) => Promise<void>; starterDisabled?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldFollowRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const displayedMessages = assistantMessage ? messages.filter((message) => message.id !== assistantMessage.id) : messages;
  const activeContent = assistantMessage?.content ?? streamText;
  const showActiveAssistant = waitingForFirstToken || Boolean(activeContent) || Boolean(streamError);
  const updateScrollState = useCallback((element: HTMLDivElement) => {
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 96;
    shouldFollowRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom && element.scrollHeight > element.clientHeight);
  }, []);
  const scrollToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    const element = scrollRef.current;
    if (!element) return;
    shouldFollowRef.current = true;
    setShowJumpToLatest(false);
    element.scrollTo({ top: element.scrollHeight, behavior });
  }, []);
  useEffect(() => {
    if (shouldFollowRef.current) scrollToLatest(activeContent ? "smooth" : "auto");
  }, [activeContent, loadingStage, messages, scrollToLatest, streamError, waitingForFirstToken]);
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div ref={scrollRef} onScroll={(event) => updateScrollState(event.currentTarget)} className="codesense-chat-scroll h-full overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-7 sm:px-6">
        {loading && <><Skeleton className="h-20 w-3/4 rounded-xl" /><Skeleton className="ml-auto h-14 w-1/2 rounded-xl" /></>}
        {!loading && displayedMessages.length === 0 && !showActiveAssistant && <section className="py-10 sm:py-14"><div className="mx-auto max-w-2xl"><span className="flex size-10 items-center justify-center rounded-lg border bg-card text-primary shadow-sm"><Bot className="size-4.5" /></span><p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Code intelligence</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">Ask CodeSense</h2><p className="mt-1 text-sm font-medium text-foreground">{repository.fullName}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">What do you want to understand?</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{starterPrompts.map((prompt) => <button key={prompt} type="button" disabled={starterDisabled || !onStarterPrompt} onClick={() => { if (onStarterPrompt) void onStarterPrompt(prompt); }} className="group flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-[border-color,background-color,transform] hover:-translate-y-px hover:border-primary/45 hover:bg-accent/30 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"><CornerDownRight className="size-3.5 shrink-0 text-primary" /><span className="min-w-0 flex-1">{prompt}</span></button>)}</div></div></section>}
        {displayedMessages.map((message) => {
          const user = message.role === "USER";
          return <article key={message.id} className={`flex gap-3 ${user ? "flex-row-reverse" : ""}`}><span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${user ? "bg-primary text-primary-foreground" : "border bg-card text-primary"}`}>{user ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}</span><div className={`min-w-0 max-w-[92%] ${user ? "break-words rounded-xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground sm:max-w-[88%]" : "flex-1 rounded-xl border bg-card px-4 py-3 shadow-sm"}`}>{user ? <p className="whitespace-pre-wrap leading-6">{message.content}</p> : <><ChatMarkdown>{message.content}</ChatMarkdown><Citations repository={repository} citations={message.citations || []} /></>}</div></article>;
        })}
        {showActiveAssistant && <article className="flex gap-3"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-primary"><Bot className="size-3.5" /></span><div className="min-w-0 flex-1 rounded-xl border bg-card px-4 py-3 shadow-sm">{waitingForFirstToken ? <div className="flex items-center gap-3" aria-live="polite"><span className="relative flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/8 text-primary"><Bot className="size-4" /><span className="absolute -right-1 -top-1 size-2 animate-ping rounded-full bg-primary/70" /></span><div className="min-w-0"><p className="text-sm font-medium">{loadingCopy[loadingStage]}</p><div className="mt-1.5 flex gap-1" aria-hidden="true"><span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" /><span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" /><span className="size-1.5 animate-bounce rounded-full bg-primary" /></div></div></div> : activeContent ? <><ChatMarkdown>{activeContent}</ChatMarkdown>{isStreaming && <span className="mt-2 block h-3 w-1 animate-pulse rounded-sm bg-primary" />}{streamError && <p className="mt-3 border-t pt-3 text-xs text-destructive">Response interrupted. You can try the question again.</p>}{assistantMessage && <Citations repository={repository} citations={assistantMessage.citations || []} />}{isComplete && !streamError && <span className="sr-only">Response complete</span>}</> : <div role="alert" className="flex items-start gap-3 text-sm"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive"><Bot className="size-4" /></span><div><p className="font-medium">Response unavailable</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The response could not be started. Try the question again when you&apos;re ready.</p></div></div>}</div></article>}
        </div>
      </div>
      {showJumpToLatest && <button type="button" onClick={() => scrollToLatest()} className="absolute bottom-4 right-4 inline-flex h-8 items-center gap-1.5 rounded-full border bg-background/95 px-3 text-xs font-medium shadow-md backdrop-blur transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Jump to latest message"><ArrowDown className="size-3.5" />Latest</button>}
    </div>
  );
}
