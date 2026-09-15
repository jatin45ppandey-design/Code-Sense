"use client";

import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaGithub } from "react-icons/fa";

import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useGitHubLogin } from "@/hooks/use-auth";

export function LoginPanel({ error }: { error?: string }) {
  const router = useRouter();

  const user = useCurrentUser();
  const login = useGitHubLogin();

  useEffect(() => {
    if (user.data) {
      router.replace("/dashboard");
    }
  }, [router, user.data]);

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-60" />

      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Brand />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Home
          </Button>

          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center justify-center px-5 py-12">
        <section className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-xl shadow-black/6 sm:p-8">

          <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
            <FaGithub className="size-5" />
          </span>

          <p className="mt-7 font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Secure access
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
            Sign in with GitHub
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose the GitHub account you want to connect with DevGuide.
            You can use your previous account or switch to another one.
          </p>

          {(error || login.error) && (
            <Alert variant="destructive" className="mt-5">
              <AlertCircle />

              <AlertTitle>
                Sign-in couldn&apos;t continue
              </AlertTitle>

              <AlertDescription>
                {login.error?.message ||
                  (error === "oauth2_failed"
                    ? "GitHub authentication failed. Please choose an account and try again."
                    : "The authentication flow was interrupted. Please try again.")}
              </AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="mt-7 w-full"
            disabled={login.isPending || user.isLoading}
            onClick={() => login.mutate()}
          >
            {login.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <FaGithub />
            )}

            {login.isPending
              ? "Opening GitHub…"
              : "Choose GitHub account"}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            GitHub will ask you which account you want to continue with.
          </p>

          <div className="mt-5 flex gap-2 border-t pt-5 text-xs leading-5 text-muted-foreground">
            <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />

            <p>
              No access token is stored in the browser.
              Authentication remains in the server-side session.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}