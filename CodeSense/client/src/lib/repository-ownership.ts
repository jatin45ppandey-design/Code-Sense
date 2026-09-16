import type { RepositoryResponse } from "@/lib/types/api";

export function isOwnRepository(repository: RepositoryResponse, githubUsername?: string | null) {
  if (!githubUsername) return false;
  return repository.owner.toLowerCase() === githubUsername.toLowerCase();
}

export function splitRepositories(repositories: RepositoryResponse[], githubUsername?: string | null) {
  return repositories.reduce<{ own: RepositoryResponse[]; external: RepositoryResponse[] }>(
    (groups, repository) => {
      groups[isOwnRepository(repository, githubUsername) ? "own" : "external"].push(repository);
      return groups;
    },
    { own: [], external: [] },
  );
}
