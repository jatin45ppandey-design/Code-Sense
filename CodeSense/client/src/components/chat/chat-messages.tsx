"use client";

import { Bot, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { Citations } from "@/components/chat/citations";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessageResponse, RepositoryResponse } from "@/lib/types/api";

export function ChatMessages({ repository, messages, streamText, loading }: { repository: RepositoryResponse; messages: ChatMessageResponse[]; streamText: string; loading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamText]);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-7 sm:px-6">
        {loading && <><Skeleton className="h-20 w-3/4 rounded-xl" /><Skeleton className="ml-auto h-14 w-1/2 rounded-xl" /></>}
        {!loading && messages.length === 0 && !streamText && (
          <div className="py-14 text-center"><span className="mx-auto flex size-11 items-center justify-center rounded-xl border bg-card shadow-sm"><Bot className="size-5 text-primary" /></span><h2 className="mt-4 font-semibold">Ask about {repository.name}</h2><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Trace an implementation, explain a module, or find the files involved in a feature.</p><div className="mx-auto mt-5 grid max-w-lg gap-2 text-left sm:grid-cols-2">{["Where does the app start?", "Explain the authentication flow", "How is data persisted?", "Which files handle errors?"].map((prompt) => <div key={prompt} className="rounded-lg border bg-card px-3 py-2.5 text-xs text-muted-foreground">{prompt}</div>)}</div></div>
        )}
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
