"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error";
type ToastItem = { id: number; message: string; kind: ToastKind };
type ToastContextValue = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function FeedbackToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const add = useCallback((message: string, kind: ToastKind) => {
    const id = Date.now() + Math.floor(Math.random() * 1_000);
    setToasts((current) => [...current.slice(-2), { id, message, kind }]);
    window.setTimeout(() => dismiss(id), 4_500);
  }, [dismiss]);
  const value = { success: (message: string) => add(message, "success"), error: (message: string) => add(message, "error") };

  return <ToastContext.Provider value={value}>{children}<div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-6 sm:top-5">{toasts.map((toast) => <div key={toast.id} role={toast.kind === "error" ? "alert" : "status"} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-popover p-3.5 text-sm shadow-lg"><span className={toast.kind === "success" ? "mt-0.5 text-emerald-600 dark:text-emerald-400" : "mt-0.5 text-destructive"}>{toast.kind === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}</span><p className="min-w-0 flex-1 leading-5">{toast.message}</p><button type="button" onClick={() => dismiss(toast.id)} className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label="Dismiss notification"><X className="size-4" /></button></div>)}</div></ToastContext.Provider>;
}

export function useFeedbackToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useFeedbackToast must be used within FeedbackToastProvider.");
  return context;
}
