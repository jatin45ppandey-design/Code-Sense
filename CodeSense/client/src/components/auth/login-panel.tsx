"use client";

import { AlertCircle, Check, FileSearch, LoaderCircle, LockKeyhole, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { FaGithub } from "react-icons/fa";

import { AuthTransition } from "@/components/auth/auth-transition";
import { CustomCursor } from "@/components/auth/custom-cursor";
import { DeveloperSignature, type DeveloperSignatureHandle } from "@/components/auth/developer-signature";
import { ProductPreview, type PreviewCapability } from "@/components/auth/product-preview";
import { Brand } from "@/components/shared/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useGitHubLogin } from "@/hooks/use-auth";

const capabilities = [
  { icon: FileSearch, label: "Repository indexing" },
  { icon: MessageSquareText, label: "Source-grounded answers" },
  { icon: Check, label: "External repositories" },
  { icon: Check, label: "Source citations" },
];

const rail: { id: PreviewCapability; title: string; copy: string }[] = [
  { id: "repositories", title: "Your repositories", copy: "Sync GitHub repositories you own" },
  { id: "external", title: "External codebases", copy: "Analyze public repositories by URL" },
  { id: "ask", title: "Ask CodeSense", copy: "Ask source-grounded repository questions" },
  { id: "sources", title: "Sources", copy: "Open the exact files supporting an answer" },
];

export function LoginPanel({ error }: { error?: string }) {
  const router = useRouter();
  const user = useCurrentUser();
  const login = useGitHubLogin();
  const landing = useRef<HTMLElement>(null);
  const developerSignature = useRef<DeveloperSignatureHandle>(null);
  const keyboardNavigation = useRef(false);
  const [authTransition, setAuthTransition] = useState(false);
  const [activeCapability, setActiveCapability] = useState<PreviewCapability | null>(null);
  const style = { "--landing-light-x": "69%", "--landing-light-y": "40%" } as CSSProperties;

  useEffect(() => {
    if (user.data) router.replace("/dashboard");
  }, [router, user.data]);

  useEffect(() => {
    if (!login.error) return;
    sessionStorage.removeItem("codesense.oauthPending");
  }, [login.error]);

  useEffect(() => {
    const noteKeyboardNavigation = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.key.startsWith("Arrow")) keyboardNavigation.current = true;
    };
    const notePointerNavigation = () => { keyboardNavigation.current = false; };
    window.addEventListener("keydown", noteKeyboardNavigation);
    window.addEventListener("pointerdown", notePointerNavigation, { passive: true });
    return () => {
      window.removeEventListener("keydown", noteKeyboardNavigation);
      window.removeEventListener("pointerdown", notePointerNavigation);
    };
  }, []);

  const handlePointerMove = useCallback(({ x, y }: { x: number; y: number }) => {
    developerSignature.current?.updatePointer({ x, y });
    const bounds = landing.current?.getBoundingClientRect();
    if (!bounds) return;
    landing.current?.style.setProperty("--landing-light-x", `${((x - bounds.left) / bounds.width) * 100}%`);
    landing.current?.style.setProperty("--landing-light-y", `${((y - bounds.top) / bounds.height) * 100}%`);
  }, []);

  const startLogin = () => {
    sessionStorage.setItem("codesense.oauthPending", String(Date.now()));
    setAuthTransition(true);
    login.mutate();
  };

  const activateCapability = (id: PreviewCapability, event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") setActiveCapability(id);
  };

  return (
    <main ref={landing} className="codesense-landing relative min-h-svh overflow-hidden" style={style}>
      <CustomCursor onPointerMove={handlePointerMove} />
      {authTransition && !login.error && <AuthTransition stage="connecting" />}
      <div aria-hidden="true" className="technical-grid codesense-landing-grid pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="codesense-background-lines pointer-events-none absolute inset-0"><i className="codesense-node left-[8%] top-[20%]" /><i className="codesense-node left-[29%] top-[34%]" /><i className="codesense-node left-[45%] top-[52%]" /><i className="codesense-node right-[12%] top-[21%]" /><i className="codesense-node right-[28%] top-[63%]" /><i className="codesense-node right-[7%] top-[48%]" /><span className="codesense-architecture-line left-[8%] top-[20%] w-[23%]" /><span className="codesense-architecture-line left-[43%] top-[52%] w-[18%]" /><span className="codesense-architecture-line right-[10%] top-[21%] w-[19%]" /><span className="codesense-ambient-code left-[6%] top-[61%]">repositoryId<br />indexStatus<br />sourceContext<br />embedding</span><span className="codesense-ambient-code right-[5%] top-[72%] text-right">retrieve<br />answer<br />READY</span></div>
      <header className="relative z-10 mx-auto flex h-[4.5rem] max-w-[92rem] items-center justify-between px-5 lg:px-8"><Brand landing /><ThemeToggle /></header>

      <section className="relative z-10 mx-auto grid max-w-[92rem] items-center gap-8 px-5 pb-10 pt-6 lg:min-h-[calc(100svh-15rem)] lg:grid-cols-[0.8fr_1fr] lg:gap-10 lg:px-8 lg:py-10 xl:gap-14">
        <div className="max-w-2xl lg:py-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.21em] text-primary">Repository intelligence</p>
          <h1 className="mt-5 max-w-[18ch] text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.052em] sm:text-5xl lg:text-[3.8rem] xl:text-[4.15rem]"><span className="text-primary">Make Sense</span> of<br />Any Codebase.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Connect your GitHub repositories, analyze external codebases, and get answers grounded in real source files.</p>
          <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">{capabilities.map(({ icon: Icon, label }) => <span key={label} className="flex items-center gap-1.5"><Icon className="size-3.5 text-primary" /> {label}</span>)}</div>

          {(error || login.error) && <Alert variant="destructive" className="mt-7 max-w-md"><AlertCircle /><AlertTitle>GitHub sign-in couldn&apos;t continue</AlertTitle><AlertDescription>{login.error?.message || (error === "oauth2_failed" ? "GitHub authentication failed. Please choose an account and try again." : "The authentication flow was interrupted. Please try again.")}</AlertDescription></Alert>}

          <div className="mt-8"><Button size="lg" className="w-full shadow-lg shadow-primary/20 sm:w-auto" data-landing-cta disabled={login.isPending} onClick={startLogin}>{login.isPending ? <LoaderCircle className="animate-spin" /> : <FaGithub />}{authTransition ? "Preparing secure sign-in..." : login.isPending ? "Opening GitHub..." : "Continue with GitHub"}</Button><p className="mt-3 text-xs text-muted-foreground">Choose or switch your GitHub account on GitHub.</p><div className="mt-4 flex max-w-md gap-2 border-t pt-4 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" /><p>No access token is stored in your browser. Authentication remains in the server-side session.</p></div></div>
        </div>
        <ProductPreview activeCapability={activeCapability} />
      </section>

      <section className="relative z-10 mx-auto max-w-[92rem] px-5 pb-6 lg:px-8 lg:pb-6" aria-label="CodeSense capabilities"><div className="grid divide-y border-y bg-card/35 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">{rail.map(({ id, title, copy }) => <button key={id} type="button" className={`codesense-capability px-4 py-4 text-left sm:px-5 ${activeCapability === id ? "is-active" : ""}`} onPointerEnter={(event) => activateCapability(id, event)} onPointerLeave={() => setActiveCapability((active) => active === id ? null : active)} onFocus={() => { if (keyboardNavigation.current) setActiveCapability(id); }} onBlur={() => setActiveCapability((active) => active === id ? null : active)} onClick={(event) => event.currentTarget.blur()}><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p></button>)}</div><DeveloperSignature ref={developerSignature} /></section>
    </main>
  );
}
