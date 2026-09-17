"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { streamChatMessage } from "@/lib/api/stream";
import { classifyChatFailure, type ChatFailure } from "@/lib/chat-failure";
import { queryKeys } from "@/lib/query/keys";
import type { ChatMessageResponse } from "@/lib/types/api";

export type ChatLoadingStage = "analyzing" | "retrieving" | "reading" | "generating";

const loadingStageDelays: Array<[ChatLoadingStage, number]> = [
  ["retrieving", 800],
  ["reading", 2_000],
  ["generating", 3_500],
];

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
  const [streamSessionId, setStreamSessionId] = useState<string | null>(null);
  const [assistantMessage, setAssistantMessage] = useState<ChatMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<ChatFailure | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadingStage, setLoadingStage] = useState<ChatLoadingStage>("analyzing");
  const abortRef = useRef<AbortController | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearStageTimers = useCallback(() => {
    stageTimerRef.current.forEach(clearTimeout);
    stageTimerRef.current = [];
  }, []);

  const startLoadingStages = useCallback(() => {
    clearStageTimers();
    setLoadingStage("analyzing");
    stageTimerRef.current = loadingStageDelays.map(([stage, delay]) =>
      setTimeout(() => setLoadingStage(stage), delay),
    );
  }, [clearStageTimers]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      clearStageTimers();
    };
  }, [clearStageTimers]);

  const streaming = isSubmitting || waitingForFirstToken || isStreaming;

  const send = useCallback(async (rawContent: string) => {
    const content = rawContent.trim();
    if (!sessionId || !content || streaming) return;
    const optimisticId = `optimistic-${Date.now()}`;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setStreamSessionId(sessionId);
    setError(null);
    setFailure(null);
    setFailedPrompt(null);
    setIsError(false);
    setStreamText("");
    setAssistantMessage(null);
    setIsComplete(false);
    setIsSubmitting(true);
    setWaitingForFirstToken(true);
    setIsStreaming(false);
    startLoadingStages();
    queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(sessionId), (current) => [
      ...(current ?? []), { id: optimisticId, role: "USER", content, citations: [], createdAt: new Date().toISOString() },
    ]);
    try {
      await streamChatMessage(sessionId, content, {
        signal: controller.signal,
        onOpen: () => setIsSubmitting(false),
        onUserMessage: (message) => queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(sessionId), (current) => [...(current ?? []).filter((item) => item.id !== optimisticId), message]),
        onToken: (token) => {
          clearStageTimers();
          setIsSubmitting(false);
          setWaitingForFirstToken(false);
          setIsStreaming(true);
          setStreamText((current) => current + token);
        },
        onAssistantMessage: (message) => {
          queryClient.setQueryData<ChatMessageResponse[]>(queryKeys.messages(sessionId), (current) => [...(current ?? []), message]);
          setAssistantMessage(message);
          setStreamText("");
          setIsStreaming(false);
          setIsComplete(true);
        },
        onDone: () => {
          clearStageTimers();
          setIsSubmitting(false);
          setWaitingForFirstToken(false);
          setIsStreaming(false);
          setIsComplete(true);
        },
      });
    } catch (caught) {
      if ((caught as Error).name !== "AbortError") {
        setError("The response was interrupted.");
        setFailure(classifyChatFailure(caught));
        setFailedPrompt(content);
        setIsError(true);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(sessionId) });
    } finally {
      clearStageTimers();
      setIsSubmitting(false);
      setWaitingForFirstToken(false);
      setIsStreaming(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [clearStageTimers, queryClient, sessionId, startLoadingStages, streaming]);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  return {
    send,
    stop,
    streaming,
    streamText,
    streamSessionId,
    assistantMessage,
    error,
    failure,
    failedPrompt,
    isSubmitting,
    waitingForFirstToken,
    isStreaming,
    isComplete,
    isError,
    loadingStage,
    clearError: () => {
      setError(null);
      setFailure(null);
      setFailedPrompt(null);
      setIsError(false);
    },
  };
}
