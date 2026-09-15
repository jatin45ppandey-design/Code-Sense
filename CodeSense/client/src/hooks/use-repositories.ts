"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { RepositoryResponse } from "@/lib/types/api";

const POLL_INTERVAL = 2_000;

export function useRepositories() {
  return useQuery({
    queryKey: queryKeys.repositories,
    queryFn: async () => {
      const stored = await api.listRepositories(false);
      return stored.length ? stored : api.listRepositories(true);
    },
    refetchInterval: ({ state }) => state.data?.some((repo) => repo.indexStatus === "INDEXING") ? POLL_INTERVAL : false,
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: queryKeys.repository(id), queryFn: () => api.getRepository(id), enabled: Boolean(id),
    refetchInterval: ({ state }) => state.data?.indexStatus === "INDEXING" ? POLL_INTERVAL : false,
  });
}

export function useIndexStatus(id: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.indexStatus(id), queryFn: () => api.getIndexStatus(id), enabled: Boolean(id) && enabled,
    refetchInterval: ({ state }) => state.data?.status === "INDEXING" ? 1_500 : false,
  });
}

export function useSyncRepositories() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => api.listRepositories(true), onSuccess: (repositories) => queryClient.setQueryData(queryKeys.repositories, repositories) });
}

export function useStartIndexing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.startIndexing,
    onSuccess: (repository) => {
      queryClient.setQueryData(queryKeys.repository(repository.id), repository);
      queryClient.setQueryData<RepositoryResponse[]>(queryKeys.repositories, (current) => current?.map((item) => item.id === repository.id ? repository : item));
      void queryClient.invalidateQueries({ queryKey: queryKeys.indexStatus(repository.id) });
    },
  });
}

export function repositoryProgress(repository: Pick<RepositoryResponse, "filesProcessed" | "filesTotal">) {
  if (!repository.filesTotal) return 0;
  return Math.min(100, Math.round((repository.filesProcessed / repository.filesTotal) * 100));
}
