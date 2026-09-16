"use client";

import { Bot, CornerDownRight, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";

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

export function ChatMessages({ repository, messages, streamText, loading, onStarterPrompt, starterDisabled = false }: { repository: RepositoryResponse; messages: ChatMessageResponse[]; streamText: string; loading: boolean; onStarterPrompt?: (prompt: string) => Promise<void>; starterDisabled?: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamText]);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-7 sm:px-6">
        {loading && <><Skeleton className="h-20 w-3/4 rounded-xl" /><Skeleton className="ml-auto h-14 w-1/2 rounded-xl" /></>}
        {!loading && messages.length === 0 && !streamText && <section className="py-10 sm:py-14"><div className="mx-auto max-w-2xl"><span className="flex size-10 items-center justify-center rounded-lg border bg-card text-primary shadow-sm"><Bot className="size-4.5" /></span><p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Code intelligence</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">Ask CodeSense</h2><p className="mt-1 text-sm font-medium text-foreground">{repository.fullName}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">What do you want to understand?</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{starterPrompts.map((prompt) => <button key={prompt} type="button" disabled={starterDisabled || !onStarterPrompt} onClick={() => { if (onStarterPrompt) void onStarterPrompt(prompt); }} className="group flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition-[border-color,background-color,transform] hover:-translate-y-px hover:border-primary/45 hover:bg-accent/30 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"><CornerDownRight className="size-3.5 shrink-0 text-primary" /><span className="min-w-0 flex-1">{prompt}</span></button>)}</div></div></section>}
        {messages.map((message) => {
          const user = message.role === "USER";
          return <article key={message.id} className={`flex gap-3 ${user ? "flex-row-reverse" : ""}`}><span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${user ? "bg-primary text-primary-foreground" : "border bg-card text-primary"}`}>{user ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}</span><div className={`min-w-0 max-w-[88%] ${user ? "rounded-xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground" : "flex-1 rounded-xl border bg-card px-4 py-3 shadow-sm"}`}>{user ? <p className="whitespace-pre-wrap leading-6">{message.content}</p> : <><ChatMarkdown>{message.content}</ChatMarkdown><Citations repository={repository} citations={message.citations || []} /></>}</div></article>;
        })}
        {streamText && <article className="flex gap-3"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-primary"><Bot className="size-3.5" /></span><div className="min-w-0 flex-1 rounded-xl border bg-card px-4 py-3 shadow-sm"><ChatMarkdown>{streamText}</ChatMarkdown><span className="mt-2 block h-3 w-1 animate-pulse rounded-sm bg-primary" /></div></article>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
