"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { streamChatMessage } from "@/lib/api/stream";
import { queryKeys } from "@/lib/query/keys";
import type { ChatMessageResponse } from "@/lib/types/api";

export function useChatSessions(repositoryId: string, enabled = true) {
  return useQuery({ queryKey: queryKeys.sessions(repositoryId), queryFn: () => api.listChatSessions(repositoryId), enabled: Boolean(repositoryId) && enabled });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({ queryKey: queryKeys.messages(sessionId ?? ""), queryFn: () => api.getChatMessages(sessionId!), enabled: Boolean(sessionId) });
}

export function useCreateChatSession(repositoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => api.createChatSession(repositoryId, title),
    onSuccess: (session) => {
      queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(session.id), []);
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions(repositoryId) });
    },
  });
}

export function useStreamChat(sessionId: string | null) {
  const queryClient = useQueryClient();
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const send = useCallback(async (rawContent: string) => {
    const content = rawContent.trim();
    if (!sessionId || !content || streaming) return;
    const optimisticId = `optimistic-${Date.now()}`;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setError(null); setStreamText(""); setStreaming(true);
    queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(sessionId), (current) => [
      ...(current ?? []), { id: optimisticId, role: "USER", content, citations: [], createdAt: new Date().toISOString() },
    ]);
    try {
      await streamChatMessage(sessionId, content, {
        signal: controller.signal,
        onUserMessage: (message) => queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(sessionId), (current) => [...(current ?? []).filter((item) => item.id !== optimisticId), message]),
        onToken: (token) => setStreamText((current) => current + token),
        onAssistantMessage: (message) => {
          queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(sessionId), (current) => [...(current ?? []), message]);
          setStreamText("");
        },
      });
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") setError(caught instanceof Error ? caught.message : "Message failed");
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(sessionId) });
    } finally {
      setStreaming(false); abortRef.current = null;
    }
  }, [queryClient, sessionId, streaming]);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  return { send, stop, streaming, streamText, error, clearError: () => setError(null) };
}
