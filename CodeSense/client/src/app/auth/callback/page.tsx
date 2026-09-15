"use client";

import {
  AlertCircle,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user.data) {
      router.replace("/dashboard");
    }
  }, [router, user.data]);

  const retryLogin = () => {
    window.location.replace("/login");
  };

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">

        {user.isError ? (
          <AlertCircle className="mx-auto size-8 text-destructive" />
        ) : (
          <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
        )}

        <h1 className="mt-4 text-lg font-semibold">
          {user.isError
            ? "Sign-in could not be completed"
            : "Finishing sign-in"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {user.isError
            ? "DevGuide could not confirm your authenticated session. Return to the login page and try GitHub sign-in again."
            : "Confirming your GitHub account and preparing your workspace."}
        </p>

        {user.isError && (
          <Button
            className="mt-5"
            onClick={retryLogin}
          >
            <RotateCcw />
            Try sign-in again
          </Button>
        )}

      </div>
    </main>
  );
}