"use client";

import { ArrowRight, Braces, Check, FileSearch, MessageSquareCode } from "lucide-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";

export default function HomePage() {
  const { data: user } = useCurrentUser();
  return (
    <main className="relative min-h-svh overflow-hidden">
      <div className="technical-grid pointer-events-none absolute inset-x-0 top-0 h-[34rem] opacity-70" />
      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <div className="flex items-center gap-2"><ThemeToggle /><Button nativeButton={false} render={<Link href={user ? "/dashboard" : "/login"} />}>{user ? "Open workspace" : "Sign in"}<ArrowRight data-icon="inline-end" /></Button></div>
      </header>
      <section className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 font-mono text-xs text-muted-foreground shadow-sm backdrop-blur"><span className="size-1.5 rounded-full bg-emerald-500" /> Repository-aware development</div>
          <h1 className="max-w-[12ch] text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Find your way through any codebase.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Connect GitHub, index a repository, and ask focused questions with answers grounded in the files that matter.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href={user ? "/dashboard" : "/login"} />}><FaGithub data-icon="inline-start" /> {user ? "Continue to workspace" : "Continue with GitHub"}</Button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Check className="size-4 text-emerald-600" /> Uses your existing GitHub session</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 -z-10 rounded-full bg-primary/8 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/8 dark:shadow-black/25">
            <div className="flex h-11 items-center gap-2 border-b px-4"><span className="size-2.5 rounded-full bg-border" /><span className="size-2.5 rounded-full bg-border" /><span className="size-2.5 rounded-full bg-border" /><span className="ml-3 font-mono text-[11px] text-muted-foreground">devguide / repository</span></div>
            <div className="p-5 sm:p-7">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">From repository to answer</p>
              <div className="mt-5 space-y-3">
                {[{ icon: FaGithub, title: "Connect GitHub", copy: "Use the backend OAuth session—no browser token storage." }, { icon: FileSearch, title: "Index repository context", copy: "Follow live file and chunk progress from the indexing service." }, { icon: MessageSquareCode, title: "Ask with sources", copy: "Stream grounded answers and open backend-provided citations." }].map((step, index) => <div key={step.title} className="flex gap-3 rounded-xl border bg-muted/25 p-3.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border"><step.icon className="size-4" /></span><div className="min-w-0"><p className="text-sm font-medium"><span className="mr-2 font-mono text-[10px] text-muted-foreground">0{index + 1}</span>{step.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{step.copy}</p></div></div>)}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs shadow-lg sm:flex"><Braces className="size-4 text-primary" /><span>Sources stay attached to answers</span></div>
        </div>
      </section>
    </main>
  );
}
