import type {
  ApiErrorBody,
  ChatMessageResponse,
  ChatSessionResponse,
  IndexStatusResponse,
  RepositoryResponse,
  UserResponse,
} from "@/lib/types/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

export function resolveApiUrl(path: string) {
  // If backend already returned a complete URL, use it directly.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Otherwise attach backend base URL.
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody;

    return (
      body.message ||
      body.error ||
      response.statusText ||
      "Request failed"
    );
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(resolveApiUrl(path), {
    ...init,

    // Required so DEVGUIDE_SESSION cookie travels
    // between Next.js frontend and Spring backend.
    credentials: "include",

    headers: {
      Accept: "application/json",

      ...(init.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      await errorMessage(response)
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  // =========================
  // Authentication
  // =========================

  getLoginUrl: () =>
    apiFetch<{ url: string }>("/api/auth/login-url", {
      cache: "no-store",
    }),

  me: () =>
    apiFetch<UserResponse>("/api/auth/me", {
      cache: "no-store",
    }),

  logout: () =>
    apiFetch<void>("/api/auth/logout", {
      method: "POST",
      cache: "no-store",
    }),

  // =========================
  // Repositories
  // =========================

  listRepositories: (refresh = false) =>
    apiFetch<RepositoryResponse[]>(
      `/api/repos?refresh=${refresh}`
    ),

  getRepository: (id: string) =>
    apiFetch<RepositoryResponse>(
      `/api/repos/${id}`
    ),

  importRepository: (url: string) =>
    apiFetch<RepositoryResponse>("/api/repos/import", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  startIndexing: (id: string) =>
    apiFetch<RepositoryResponse>(
      `/api/repos/${id}/index`,
      {
        method: "POST",
      }
    ),

  getIndexStatus: (id: string) =>
    apiFetch<IndexStatusResponse>(
      `/api/repos/${id}/status`
    ),

  // =========================
  // Chat
  // =========================

  createChatSession: (
    repositoryId: string,
    title?: string
  ) =>
    apiFetch<ChatSessionResponse>(
      "/api/chat/sessions",
      {
        method: "POST",
        body: JSON.stringify({
          repositoryId,
          title,
        }),
      }
    ),

  listChatSessions: (repositoryId: string) =>
    apiFetch<ChatSessionResponse[]>(
      `/api/chat/sessions?repositoryId=${encodeURIComponent(
        repositoryId
      )}`
    ),

  getChatMessages: (sessionId: string) =>
    apiFetch<ChatMessageResponse[]>(
      `/api/chat/sessions/${sessionId}`
    ),
};
