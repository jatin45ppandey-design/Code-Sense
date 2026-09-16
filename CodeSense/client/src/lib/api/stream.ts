import { ApiError, resolveApiUrl } from "@/lib/api/client";
import type { ChatMessageResponse } from "@/lib/types/api";

interface StreamHandlers {
  signal?: AbortSignal;
  onUserMessage?: (message: ChatMessageResponse) => void;
  onToken?: (token: string) => void;
  onAssistantMessage?: (message: ChatMessageResponse) => void;
  onDone?: () => void;
}

async function readStreamError(response: Response) {
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: string;
    };

    return body.message || body.error || response.statusText;
  } catch {
    return response.statusText || "Message failed";
  }
}

function parseJsonEvent<T>(
  payload: string,
  eventName: string
): T {
  try {
    return JSON.parse(payload) as T;
  } catch (error) {
    console.error(
      `Failed to parse SSE event "${eventName}"`,
      payload,
      error
    );

    throw new Error(
      `Invalid data received for "${eventName}" event.`
    );
  }
}

export async function streamChatMessage(
  sessionId: string,
  content: string,
  handlers: StreamHandlers
) {
  const response = await fetch(
    resolveApiUrl(
      `/api/chat/sessions/${sessionId}/messages`
    ),
    {
      method: "POST",
      credentials: "include",

      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        content,
      }),

      signal: handlers.signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      await readStreamError(response)
    );
  }

  if (!response.body) {
    throw new Error(
      "The server returned an empty stream."
    );
  }

  const reader = response.body.getReader();

  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let completed = false;

  const consume = (block: string) => {
    if (!block) return;

    let eventName = "message";

    const dataLines: string[] = [];

    const lines = block.split(/\r?\n/);

    for (const line of lines) {
      /*
       * SSE comments / keep-alive events.
       */
      if (line.startsWith(":")) {
        continue;
      }

      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        continue;
      }

      if (line.startsWith("data:")) {
        /*
         * IMPORTANT:
         *
         * Do NOT use trim(), trimStart(), etc.
         *
         * LLM tokens commonly begin with spaces:
         *
         * " project"
         * " is"
         * " built"
         *
         * Removing those spaces causes:
         *
         * Thisprojectis...
         */
        dataLines.push(
          line.slice(5)
        );
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    const payload = dataLines.join("\n");

    switch (eventName) {
      case "token": {
        /*
         * Tokens from the AI stream are plain text.
         *
         * Never JSON.parse them.
         *
         * A perfectly valid token may be:
         *
         * "
         * "hello
         * {
         * **
         *
         * Parsing those as JSON caused the
         * "Unterminated string in JSON" error.
         */
        handlers.onToken?.(payload);
        break;
      }

      case "user_message": {
        const message =
          parseJsonEvent<ChatMessageResponse>(
            payload,
            eventName
          );

        handlers.onUserMessage?.(message);

        break;
      }

      case "assistant_message": {
        const message =
          parseJsonEvent<ChatMessageResponse>(
            payload,
            eventName
          );

        handlers.onAssistantMessage?.(message);

        break;
      }

      case "done": {
        if (!completed) {
          completed = true;
          handlers.onDone?.();
        }

        break;
      }

      case "error": {
        throw new Error(payload || "Message failed");
      }

      default: {
        /*
         * Ignore unknown SSE events safely.
         */
        break;
      }
    }
  };

  try {
    while (true) {
      const { value, done } =
        await reader.read();

      if (value) {
        buffer += decoder.decode(
          value,
          {
            stream: !done,
          }
        );
      }

      /*
       * One SSE event ends with an empty line:
       *
       * event: token
       * data: hello
       *
       *
       */
      const blocks =
        buffer.split(/\r?\n\r?\n/);

      /*
       * Last item may be an incomplete event.
       * Keep it for the next network chunk.
       */
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        if (block.length > 0) {
          consume(block);
        }
      }

      if (done) {
        break;
      }
    }

    /*
     * Flush any bytes still held by TextDecoder.
     */
    buffer += decoder.decode();

    /*
     * Process final event in case the server closed
     * without an additional blank line.
     */
    if (buffer.length > 0) {
      consume(buffer);
    }
  } finally {
    reader.releaseLock();
  }

  /*
   * Safety fallback if backend closes the stream
   * without explicitly sending event: done.
   */
  if (!completed) {
    handlers.onDone?.();
  }
}
