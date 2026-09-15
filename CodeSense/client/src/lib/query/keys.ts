export const queryKeys = {
  auth: ["auth"] as const,
  currentUser: ["auth", "me"] as const,
  repositories: ["repositories"] as const,
  repository: (id: string) => ["repositories", id] as const,
  indexStatus: (id: string) => ["repositories", id, "status"] as const,
  sessions: (repositoryId: string) => ["chat", repositoryId, "sessions"] as const,
  messages: (sessionId: string) => ["chat", "sessions", sessionId, "messages"] as const,
};
