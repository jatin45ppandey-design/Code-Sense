export type IndexStatus = "PENDING" | "INDEXING" | "READY" | "FAILED";

export interface UserResponse {
  id: string;
  githubId: number;
  githubUsername: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface RepositoryResponse {
  id: string;
  githubRepoId: number;
  owner: string;
  name: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string | null;
  description: string | null;
  indexStatus: IndexStatus;
  indexedAt: string | null;
  chunkCount: number;
  filesTotal: number;
  filesProcessed: number;
  errorMessage: string | null;
}

export interface IndexStatusResponse {
  repositoryId: string;
  status: IndexStatus;
  filesTotal: number;
  filesProcessed: number;
  chunkCount: number;
  indexedAt: string | null;
  errorMessage: string | null;
}

export interface ChatSessionResponse {
  id: string;
  repositoryId: string;
  title: string;
  createdAt: string;
}

export interface CitationDto {
  filePath: string;
  startLine: number | null;
  endLine: number | null;
  language: string | null;
}

export interface ChatMessageResponse {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations: CitationDto[];
  createdAt: string;
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}
