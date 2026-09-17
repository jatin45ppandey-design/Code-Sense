"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChatFailure } from "@/lib/chat-failure";

export function ChatFailureDialog({
  failure,
  failedPrompt,
  onClose,
  onTryAgain,
}: {
  failure: ChatFailure | null;
  failedPrompt: string | null;
  onClose: () => void;
  onTryAgain: () => void;
}) {
  return (
    <Dialog open={Boolean(failure)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto p-5 sm:p-6">
        <DialogHeader className="pr-8">
          <span className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </span>
          <DialogTitle className="pt-1 leading-6">{failure?.title}</DialogTitle>
          <DialogDescription className="leading-6">{failure?.description}</DialogDescription>
        </DialogHeader>
        {failedPrompt && (
          <p className="rounded-lg border bg-muted/35 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
            Try again restores your question in the composer for review. It will not send automatically.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Dismiss</Button>
          {failedPrompt && <Button onClick={onTryAgain}><RotateCcw />Try again</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
