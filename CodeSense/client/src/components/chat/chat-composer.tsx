"use client";

import { CornerDownLeft, Square } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatComposer({ disabled, streaming, error, onSend, onStop }: { disabled?: boolean; streaming: boolean; error?: string | null; onSend: (content: string) => Promise<void>; onStop: () => void }) {
  const [value, setValue] = useState("");
  const submit = async () => {
    const content = value.trim();
    if (!content || disabled || streaming) return;
    setValue("");
    await onSend(content);
  };
  return (
    <div className="shrink-0 border-t border-border/80 bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_18px_-16px_rgba(15,23,42,0.45)] backdrop-blur-md sm:px-6">
      <div className="mx-auto max-w-3xl">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <div className="flex items-end gap-2 rounded-xl border bg-card p-2 shadow-sm focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/15">
          <Textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask CodeSense about this repository..." disabled={disabled} className="max-h-40 min-h-12 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2 py-2.5 leading-6 shadow-none focus-visible:ring-0" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} />
          {streaming ? <Button size="icon-lg" variant="secondary" onClick={onStop} aria-label="Stop response"><Square className="size-3.5" /></Button> : <Button size="icon-lg" disabled={disabled || !value.trim()} onClick={() => void submit()} aria-label="Send message"><CornerDownLeft /></Button>}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
      </div>
    </div>
  );
}
