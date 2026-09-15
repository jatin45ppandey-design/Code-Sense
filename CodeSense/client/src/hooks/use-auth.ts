"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, resolveApiUrl } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: api.me,
    retry: false,
  });
}

export function useGitHubLogin() {
  return useMutation({
    mutationFn: api.getLoginUrl,

    onSuccess: ({ url }) => {
      window.location.assign(resolveApiUrl(url));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.currentUser,
      });
    },

    onSettled: () => {
      queryClient.clear();
      window.location.replace("/login");
    },
  });
}