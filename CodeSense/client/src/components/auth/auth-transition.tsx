import { CheckCircle2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { CodeSenseMark } from "@/components/shared/brand";

type AuthStage = "connecting" | "verifying" | "connected" | "ready";

const content: Record<AuthStage, { title: string; detail: string }> = {
  connecting: { title: "Connecting to GitHub", detail: "Establishing secure authentication…" },
  verifying: { title: "Verifying session", detail: "Confirming your GitHub account…" },
  connected: { title: "GitHub connected", detail: "Loading your workspace…" },
  ready: { title: "Ready", detail: "Opening your repositories…" },
};

export function AuthTransition({ stage, detail }: { stage: AuthStage; detail?: string }) {
  const current = content[stage];
  return <div className="codesense-auth-transition absolute inset-0 z-40 flex items-center justify-center p-6" role="status" aria-live="polite"><div className="codesense-auth-transition-panel text-center"><div className="codesense-auth-reactor mx-auto"><CodeSenseMark className="size-14" /></div><p className="mt-5 text-lg font-bold tracking-[-0.04em]"><span>Code</span><span className="text-primary">Sense</span></p><div className="mt-6 flex items-center justify-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"><FaGithub className="size-3.5" /><span className="h-px w-8 bg-border" /><span className="size-1.5 rounded-full bg-primary" /><span className="h-px w-8 bg-border" /><CodeSenseMark className="size-4" /></div><div className="mt-6"><p className="flex items-center justify-center gap-2 text-sm font-semibold">{(stage === "connected" || stage === "ready") && <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />}{current.title}</p><p className="mt-2 text-sm text-muted-foreground">{detail || current.detail}</p></div></div></div>;
}
