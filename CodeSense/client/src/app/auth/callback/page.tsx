"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { AuthTransition } from "@/components/auth/auth-transition";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";

const OAUTH_MARKER = "codesense.oauthPending";
const MARKER_MAX_AGE = 10 * 60 * 1000;
const DELAY_NOTICE_MS = 10_000;
const VERIFICATION_TIMEOUT_MS = 35_000;
const subscribeToNothing = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

function hasRecentOAuthMarker() {
  if (typeof window === "undefined") return false;
  const value = sessionStorage.getItem(OAUTH_MARKER);
  const timestamp = value ? Number(value) : NaN;
  const age = Date.now() - timestamp;
  return Number.isFinite(timestamp) && age >= 0 && age < MARKER_MAX_AGE;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeToNothing, getMountedSnapshot, getServerSnapshot);
  const user = useCurrentUser(mounted);
  const fromOAuth = useSyncExternalStore(subscribeToNothing, hasRecentOAuthMarker, getServerSnapshot);
  const [ready, setReady] = useState(false);
  const [verificationDelayed, setVerificationDelayed] = useState(false);
  const [verificationTimedOut, setVerificationTimedOut] = useState(false);
  const stage = !user.data ? "verifying" : ready ? "ready" : "connected";

  useEffect(() => {
    if (fromOAuth) return;
    sessionStorage.removeItem(OAUTH_MARKER);
  }, [fromOAuth]);

  useEffect(() => {
    if (user.isError) {
      sessionStorage.removeItem(OAUTH_MARKER);
      return;
    }
    if (!user.data) return;
    const readyTimer = window.setTimeout(() => setReady(true), 260);
    const redirectTimer = window.setTimeout(() => {
      sessionStorage.removeItem(OAUTH_MARKER);
      router.replace("/repositories");
    }, 420);
    return () => { window.clearTimeout(readyTimer); window.clearTimeout(redirectTimer); };
  }, [router, user.data, user.isError]);

  useEffect(() => {
    if (user.data || user.isError) return;
    setVerificationDelayed(false);
    setVerificationTimedOut(false);
    const delayedTimer = window.setTimeout(() => setVerificationDelayed(true), DELAY_NOTICE_MS);
    const timeoutTimer = window.setTimeout(() => setVerificationTimedOut(true), VERIFICATION_TIMEOUT_MS);
    return () => {
      window.clearTimeout(delayedTimer);
      window.clearTimeout(timeoutTimer);
    };
  }, [user.data, user.isError]);

  const retryLogin = () => {
    sessionStorage.removeItem(OAUTH_MARKER);
    window.location.replace("/login");
  };

  if (!user.isError && !verificationTimedOut) return <main className="codesense-landing relative min-h-svh overflow-hidden"><div aria-hidden="true" className="technical-grid codesense-landing-grid pointer-events-none absolute inset-0" /><AuthTransition stage={stage} detail={verificationDelayed && !user.data ? "The service is still waking. This can take a moment…" : undefined} /></main>;

  return <main className="flex min-h-svh items-center justify-center p-6"><div className="w-full max-w-sm text-center"><AlertCircle className="mx-auto size-8 text-destructive" /><h1 className="mt-4 text-lg font-semibold">Sign-in could not be completed</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{verificationTimedOut ? "CodeSense took too long to verify your session. Please return to login and try GitHub sign-in again." : "CodeSense could not confirm your authenticated session. Return to the login page and try GitHub sign-in again."}</p><Button className="mt-5" onClick={retryLogin}><RotateCcw />Try sign-in again</Button></div></main>;
}
