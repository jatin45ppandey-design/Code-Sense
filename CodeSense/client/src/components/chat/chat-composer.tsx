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
    <div className="shrink-0 border-t bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto max-w-3xl">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <div className="flex items-end gap-2 rounded-xl border bg-card p-2 shadow-sm focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/15">
          <Textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask about architecture, behavior, or a specific file…" disabled={disabled} className="max-h-36 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} />
          {streaming ? <Button size="icon-lg" variant="secondary" onClick={onStop} aria-label="Stop response"><Square className="size-3.5" /></Button> : <Button size="icon-lg" disabled={disabled || !value.trim()} onClick={() => void submit()} aria-label="Send message"><CornerDownLeft /></Button>}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
      </div>
    </div>
  );
}
